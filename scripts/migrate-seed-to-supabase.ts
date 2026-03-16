// scripts/migrate-seed-to-supabase.ts - Migrate existing seed data to Supabase
// Phase 13: Seed Data Migration

import { artworks as seedArtworks } from '../data/artworks';
import { upsertArtwork, getArtworkCount } from '../lib/supabase/queries';

async function main() {
  console.log('🔄 Migrating seed data to Supabase...\n');

  try {
    const initialCount = await getArtworkCount();
    console.log(`Initial artwork count: ${initialCount}\n`);

    let added = 0;
    let updated = 0;
    let errors = 0;

    for (const artwork of seedArtworks) {
      try {
        // Normalize seed data to Supabase schema
        const normalized = {
          object_id: artwork.id, // Use our ID as object_id
          title: artwork.title,
          artist_display: null, // Seed data doesn't have artist field
          date: artwork.year,
          date_start: artwork.year_start,
          date_end: artwork.year_end,
          region: artwork.region,
          culture: artwork.culture,
          medium: artwork.medium,
          dimensions: null,
          latitude: artwork.lat,
          longitude: artwork.lng,
          image_url_primary: artwork.image_url,
          image_url_thumbnail: artwork.image_url,
          description: artwork.description,
          repository: artwork.current_museum,
          place_created: artwork.place_created,
          tags: artwork.tags,
          getty_url: null,
          is_from_getty: false, // Mark as non-Getty (seed data)
        };

        const result = await upsertArtwork(normalized);
        
        if (result.isNew) {
          added++;
          console.log(`✓ Added: ${artwork.title}`);
        } else {
          updated++;
          console.log(`~ Updated: ${artwork.title}`);
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 50));
      } catch (error) {
        errors++;
        console.error(`✗ Error migrating ${artwork.title}:`, error);
      }
    }

    const finalCount = await getArtworkCount();
    
    console.log('\n✅ Migration Complete!\n');
    console.log(`📊 Results:`);
    console.log(`   Added: ${added}`);
    console.log(`   Updated: ${updated}`);
    console.log(`   Errors: ${errors}`);
    console.log(`   Total in database: ${finalCount}\n`);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration Failed!\n');
    console.error(error);
    process.exit(1);
  }
}

main();
