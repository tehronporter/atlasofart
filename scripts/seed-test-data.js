// scripts/seed-test-data.js - Force seed test artworks
// Run: node scripts/seed-test-data.js

const { createClient } = require('@supabase/supabase-js');

// Load env
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const testArtworks = [
  {
    title: 'Mona Lisa',
    date: 'c. 1503-1519',
    date_start: 1503,
    date_end: 1519,
    region: 'Western Europe',
    culture: 'Italian Renaissance',
    medium: 'Oil on poplar',
    latitude: 41.8967,
    longitude: 12.4822,
    description: 'Leonardo da Vinci\'s masterpiece portrait',
    repository: 'Louvre Museum, Paris',
    place_created: 'Florence, Italy',
    tags: ['portrait', 'renaissance', 'italian'],
    is_from_getty: false,
  },
  {
    title: 'The Starry Night',
    date: '1889',
    date_start: 1889,
    date_end: 1889,
    region: 'Western Europe',
    culture: 'Post-Impressionist',
    medium: 'Oil on canvas',
    latitude: 43.7231,
    longitude: 4.8369,
    description: 'Vincent van Gogh\'s iconic night scene',
    repository: 'MoMA, New York',
    place_created: 'Saint-Rémy, France',
    tags: ['landscape', 'post-impressionism', 'dutch'],
    is_from_getty: false,
  },
  {
    title: 'The Birth of Venus',
    date: 'c. 1485',
    date_start: 1484,
    date_end: 1486,
    region: 'Western Europe',
    culture: 'Italian Renaissance',
    medium: 'Tempera on canvas',
    latitude: 43.7686,
    longitude: 11.2569,
    description: 'Botticelli\'s masterpiece depicting Venus emerging from the sea',
    repository: 'Uffizi Gallery, Florence',
    place_created: 'Florence, Italy',
    tags: ['mythology', 'renaissance', 'nudity'],
    is_from_getty: false,
  },
  {
    title: 'Guernica',
    date: '1937',
    date_start: 1937,
    date_end: 1937,
    region: 'Western Europe',
    culture: 'Cubist',
    medium: 'Oil on canvas',
    latitude: 40.4098,
    longitude: -3.6921,
    description: 'Picasso\'s powerful anti-war statement',
    repository: 'Museo Reina Sofía, Madrid',
    place_created: 'Paris, France',
    tags: ['war', 'cubism', 'spanish'],
    is_from_getty: false,
  },
  {
    title: 'The Great Wave off Kanagawa',
    date: 'c. 1831',
    date_start: 1830,
    date_end: 1832,
    region: 'East Asia',
    culture: 'Edo Period Japanese',
    medium: 'Woodblock print',
    latitude: 35.2938,
    longitude: 139.5618,
    description: 'Hokusai\'s iconic ukiyo-e print showing Mount Fuji',
    repository: 'Multiple museums worldwide',
    place_created: 'Edo (Tokyo), Japan',
    tags: ['print', 'landscape', 'ukiyo-e'],
    is_from_getty: false,
  },
];

async function main() {
  console.log('🌱 Seeding test artworks to Supabase...\n');

  let inserted = 0;
  let failed = 0;

  for (const artwork of testArtworks) {
    try {
      const { error } = await supabase
        .from('artworks')
        .insert(artwork);

      if (error) throw error;

      console.log(`✅ ${artwork.title}`);
      inserted++;
    } catch (err) {
      console.error(`❌ ${artwork.title}:`, err.message);
      failed++;
    }
  }

  console.log(`\n📊 Results:`);
  console.log(`   Inserted: ${inserted}`);
  console.log(`   Failed: ${failed}`);

  if (inserted > 0) {
    console.log('\n✨ Success! Visit http://localhost:3000 to see the map');
  }

  process.exit(failed === testArtworks.length ? 1 : 0);
}

main();
