/**
 * Phase 11: Migrate seed data to Supabase
 * Run: npm run migrate-seed
 */

import { createClient } from '@supabase/supabase-js';
import { artworks } from '../data/artworks.js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateSeedData() {
  console.log('🚀 Starting seed data migration to Supabase...\n');
  console.log(`📦 Found ${artworks.length} artworks to migrate\n`);

  let inserted = 0;
  let failed = 0;
  const errors = [];

  for (const artwork of artworks) {
    try {
      // Check if already exists
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
        console.error(`  ❌ "${artwork.title}":`, error.message);
        failed++;
        errors.push({ title: artwork.title, error: error.message });
        continue;
      }

      // Insert tags
      if (artwork.tags && artwork.tags.length > 0) {
        for (const tagName of artwork.tags) {
          const { data: tagData } = await supabase
            .from('tags')
            .upsert({ name: tagName }, { onConflict: 'name' })
            .select()
            .single();

          if (tagData) {
            await supabase.from('artwork_tags').insert({
              artwork_id: data.id,
              tag_id: tagData.id,
            });
          }
        }
      }

      console.log(`  ✅ "${artwork.title}"`);
      inserted++;
    } catch (err: any) {
      console.error(`  ❌ "${artwork.title}":`, err.message || err);
      failed++;
      errors.push({ title: artwork.title, error: err.message });
    }
  }

  await supabase.from('ingestion_log').insert({
    source: 'seed_migration',
    records_ingested: inserted,
    records_failed: failed,
    errors: errors.map((e) => `${e.title}: ${e.error}`),
    completed_at: new Date().toISOString(),
  });

  console.log('\n' + '='.repeat(50));
  console.log(`✅ Migration: ${inserted} inserted, ${failed} failed`);
  console.log('='.repeat(50));
}

migrateSeedData().catch(console.error);
