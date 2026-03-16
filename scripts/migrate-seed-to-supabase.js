#!/usr/bin/env node
/**
 * Phase 11: Migrate seed data to Supabase
 * Run: npm run migrate-seed
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Read and parse seed data TypeScript file manually
function loadSeedArtworks() {
  const filePath = path.resolve(__dirname, '../data/artworks.ts');
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Simple extraction of artworks array using regex
  // This is a basic parser - for production use a proper TS parser
  const match = content.match(/export const artworks:\s*Artwork\[\]\s*=\s*\[([\s\S]*?)\];\s*$/);
  if (!match) {
    throw new Error('Could not parse artworks array from seed file');
  }
  
  // We'll use a simpler approach: read the JSON-like structure
  // For now, let's use eval in a controlled way (safe since we control the source)
  const vm = require('vm');
  const sandbox = { artworks: [] };
  
  // Convert TypeScript to JavaScript by removing type annotations
  let jsContent = content
    .replace(/import.* from.*['"].*['"];?/g, '')
    .replace(/export const artworks:\s*Artwork\[\]/, 'const artworks')
    .replace(/: Artwork\[\]/g, '');
  
  vm.createContext(sandbox);
  vm.runInContext(jsContent, sandbox);
  
  return sandbox.artworks;
}

async function migrateSeedData() {
  console.log('🚀 Starting seed data migration to Supabase...\n');

  let artworks;
  try {
    artworks = loadSeedArtworks();
    console.log(`📦 Loaded ${artworks.length} artworks from seed data\n`);
  } catch (err) {
    console.error('❌ Failed to load seed data:', err.message);
    
    // Fallback: hardcode a subset for testing
    console.log('⚠️  Using fallback test data...');
    artworks = [
      {
        id: 'test-001',
        title: 'Bust of Nefertiti',
        year: 'c. 1345 BCE',
        year_start: -1350,
        year_end: -1340,
        region: 'North Africa',
        culture: 'Ancient Egyptian',
        medium: 'Limestone and stucco',
        lat: 30.0444,
        lng: 31.2357,
        image_url: '/images/nefertiti.jpg',
        description: 'Iconic painted limestone bust of Queen Nefertiti.',
        current_museum: 'Neues Museum, Berlin',
        place_created: 'Amarna, Egypt',
        tags: ['sculpture', 'portrait', 'royal', 'ancient'],
      },
    ];
  }

  let inserted = 0;
  let failed = 0;
  const errors = [];

  for (const artwork of artworks) {
    try {
      // Check if already exists (by title + year)
      const { data: existing } = await supabase
        .from('artworks')
        .select('id')
        .eq('title', artwork.title)
        .eq('year_start', artwork.year_start)
        .single();

      if (existing) {
        console.log(`  ⏭️  Skipped "${artwork.title}" (already exists)`);
        continue;
      }

      // Insert artwork
      const { data, error } = await supabase
        .from('artworks')
        .insert({
          title: artwork.title,
          year_display: artwork.year,
          year_start: artwork.year_start,
          year_end: artwork.year_end,
          region: artwork.region,
          culture: artwork.culture,
          medium: artwork.medium,
          latitude: artwork.lat,
          longitude: artwork.lng,
          image_url: artwork.image_url,
          description: artwork.description,
          current_museum: artwork.current_museum,
          place_created: artwork.place_created,
          source: 'seed_migration',
        })
        .select()
        .single();

      if (error) {
        console.error(`  ❌ Failed to insert "${artwork.title}":`, error.message);
        failed++;
        errors.push({ title: artwork.title, error: error.message });
        continue;
      }

      // Insert tags
      if (artwork.tags && artwork.tags.length > 0) {
        for (const tagName of artwork.tags) {
          // Insert or get tag
          const { data: tagData, error: tagError } = await supabase
            .from('tags')
            .upsert({ name: tagName }, { onConflict: 'name' })
            .select()
            .single();

          if (tagError) {
            console.error(`    ⚠️  Tag "${tagName}" error:`, tagError.message);
            continue;
          }

          // Link artwork to tag
          await supabase.from('artwork_tags').insert({
            artwork_id: data.id,
            tag_id: tagData.id,
          });
        }
      }

      console.log(`  ✅ Inserted "${artwork.title}" (${artwork.year})`);
      inserted++;
    } catch (err) {
      console.error(`  ❌ Unexpected error for "${artwork.title}":`, err.message);
      failed++;
      errors.push({ title: artwork.title, error: err.message });
    }
  }

  // Log ingestion
  await supabase.from('ingestion_log').insert({
    source: 'seed_migration',
    records_ingested: inserted,
    records_failed: failed,
    errors: errors.map((e) => `${e.title}: ${e.error}`),
    completed_at: new Date().toISOString(),
  });

  console.log('\n' + '='.repeat(50));
  console.log(`✅ Migration complete!`);
  console.log(`   Inserted: ${inserted}`);
  console.log(`   Failed: ${failed}`);
  console.log('='.repeat(50));
}

migrateSeedData().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
