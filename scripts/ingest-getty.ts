// scripts/ingest-getty.ts - Standalone script for Getty ingestion
// Phase 12: Getty CLI Ingestion Script
// Run with: npx tsx scripts/ingest-getty.ts

import { batchIngestGettyArtworks } from '../lib/getty/api';

async function main() {
  console.log('🏛️  Starting Getty Museum API Ingestion...\n');

  const batchSize = 100;
  const maxPages = 10; // Fetch up to 1000 artworks

  console.log(`Configuration:`);
  console.log(`  Batch size: ${batchSize}`);
  console.log(`  Max pages: ${maxPages}`);
  console.log(`  Estimated artworks: ${batchSize * maxPages}\n`);

  try {
    const startTime = Date.now();
    
    const result = await batchIngestGettyArtworks(batchSize, maxPages);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n✅ Ingestion Complete!\n');
    console.log(`📊 Results:`);
    console.log(`   New artworks added: ${result.added}`);
    console.log(`   Existing artworks updated: ${result.updated}`);
    console.log(`   Errors: ${result.errors.length}`);
    console.log(`   Duration: ${duration}s\n`);

    if (result.errors.length > 0) {
      console.log('⚠️  Errors:');
      result.errors.slice(0, 10).forEach((err, i) => {
        console.log(`   ${i + 1}. ${err}`);
      });
      if (result.errors.length > 10) {
        console.log(`   ... and ${result.errors.length - 10} more`);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Ingestion Failed!\n');
    console.error(error);
    process.exit(1);
  }
}

main();
