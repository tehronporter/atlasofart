// app/api/ingest/route.ts
// Met Museum Open Access API ingestion
// Replaces broken Getty URL with the real Metropolitan Museum of Art API

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const MET_BASE = 'https://collectionapi.metmuseum.org/public/collection/v1';

// Coordinate lookup by country
const COUNTRY_COORDS: Record<string, [number, number]> = {
  'Italy': [41.9028, 12.4964],
  'France': [48.8566, 2.3522],
  'Netherlands': [52.3676, 4.9041],
  'Germany': [52.5200, 13.4050],
  'Spain': [40.4168, -3.7038],
  'Greece': [37.9838, 23.7275],
  'Egypt': [30.0444, 31.2357],
  'China': [39.9042, 116.4074],
  'Japan': [35.6762, 139.6503],
  'India': [28.6139, 77.2090],
  'Iran': [35.6892, 51.3890],
  'Turkey': [39.9334, 32.8597],
  'England': [51.5074, -0.1278],
  'United Kingdom': [51.5074, -0.1278],
  'United States': [40.7128, -74.0060],
  'Mexico': [19.4326, -99.1332],
  'Peru': [-12.0464, -77.0428],
  'Russia': [55.7558, 37.6173],
  'Austria': [48.2082, 16.3738],
  'Belgium': [50.8503, 4.3517],
  'Sweden': [59.3293, 18.0686],
  'Denmark': [55.6761, 12.5683],
  'Portugal': [38.7223, -9.1393],
  'Switzerland': [46.9481, 7.4474],
  'Iraq': [33.3406, 44.4009],
  'Syria': [33.5138, 36.2765],
  'Afghanistan': [34.5253, 69.1783],
  'Pakistan': [33.7294, 73.0931],
  'Thailand': [13.7563, 100.5018],
  'Cambodia': [11.5564, 104.9282],
  'Korea': [37.5665, 126.9780],
  'Ethiopia': [9.0249, 38.7469],
  'Nigeria': [9.0579, 7.4951],
  'Ghana': [5.5600, -0.2057],
};

// Coordinate lookup by culture
const CULTURE_COORDS: Record<string, [number, number]> = {
  'Italian': [41.9028, 12.4964],
  'French': [48.8566, 2.3522],
  'Dutch': [52.3676, 4.9041],
  'German': [52.5200, 13.4050],
  'Flemish': [50.8503, 4.3517],
  'Spanish': [40.4168, -3.7038],
  'Greek': [37.9838, 23.7275],
  'Roman': [41.8902, 12.4922],
  'Egyptian': [30.0444, 31.2357],
  'Chinese': [39.9042, 116.4074],
  'Japanese': [35.6762, 139.6503],
  'Indian': [28.6139, 77.2090],
  'Persian': [35.6892, 51.3890],
  'Ottoman': [41.0082, 28.9784],
  'Turkish': [39.9334, 32.8597],
  'British': [51.5074, -0.1278],
  'English': [51.5074, -0.1278],
  'American': [40.7128, -74.0060],
  'Mexican': [19.4326, -99.1332],
  'Peruvian': [-12.0464, -77.0428],
  'Russian': [55.7558, 37.6173],
  'Byzantine': [41.0082, 28.9784],
  'Mesopotamian': [33.3406, 44.4009],
  'Sumerian': [32.5517, 45.8497],
  'Assyrian': [36.3454, 43.1440],
  'Babylonian': [32.5422, 44.4212],
  'Minoan': [35.2981, 25.1988],
  'African': [4.0383, 21.7587],
  'Aztec': [19.4326, -99.1332],
  'Maya': [15.0, -90.0],
  'Celtic': [53.4129, -8.2439],
  'Viking': [60.4720, 8.4689],
  'Mughal': [28.6139, 77.2090],
  'South Asian': [24.8607, 67.0011],
  'Southeast Asian': [13.7563, 100.5018],
  'Gandharan': [34.5253, 69.1783],
};

function geocodeArtwork(obj: any): [number | null, number | null] {
  // Use existing API coordinates if available
  if (obj.GeoLat && obj.GeoLon) {
    return [parseFloat(obj.GeoLat), parseFloat(obj.GeoLon)];
  }

  // Try country
  if (obj.country && COUNTRY_COORDS[obj.country]) {
    return COUNTRY_COORDS[obj.country];
  }

  // Try culture
  if (obj.culture && CULTURE_COORDS[obj.culture]) {
    return CULTURE_COORDS[obj.culture];
  }

  // Try artist nationality
  if (obj.artistNationality && CULTURE_COORDS[obj.artistNationality]) {
    return CULTURE_COORDS[obj.artistNationality];
  }

  // Try city/region name matching against countries
  const city = (obj.city || '').toLowerCase();
  if (city.includes('florence') || city.includes('rome') || city.includes('venice')) return [41.9028, 12.4964];
  if (city.includes('paris')) return [48.8566, 2.3522];
  if (city.includes('amsterdam') || city.includes('leiden') || city.includes('delft')) return [52.3676, 4.9041];
  if (city.includes('london')) return [51.5074, -0.1278];
  if (city.includes('madrid') || city.includes('seville')) return [40.4168, -3.7038];
  if (city.includes('athens')) return [37.9838, 23.7275];
  if (city.includes('cairo') || city.includes('luxor') || city.includes('thebes')) return [30.0444, 31.2357];
  if (city.includes('beijing') || city.includes('peking')) return [39.9042, 116.4074];
  if (city.includes('tokyo') || city.includes('edo') || city.includes('kyoto')) return [35.6762, 139.6503];

  return [null, null];
}

function normalizeMetObject(obj: any) {
  const [lat, lng] = geocodeArtwork(obj);

  const tags: string[] = [];
  if (obj.culture) tags.push(obj.culture);
  if (obj.medium?.split(' ')[0]) tags.push(obj.medium.split(' ').slice(0, 2).join(' '));
  if (obj.tags) {
    const apiTags = Array.isArray(obj.tags)
      ? obj.tags.map((t: any) => typeof t === 'string' ? t : t.term).filter(Boolean)
      : [];
    tags.push(...apiTags.slice(0, 3));
  }

  return {
    object_id: `met-${obj.objectID}`,
    title: obj.title || 'Untitled',
    artist_display: obj.artistDisplayName || null,
    date: obj.objectDate || null,
    date_start: obj.objectDateBegin || null,
    date_end: obj.objectDateEnd || null,
    region: obj.region || obj.country || null,
    culture: obj.culture || null,
    medium: obj.medium || null,
    dimensions: obj.dimensions || null,
    latitude: lat,
    longitude: lng,
    image_url_primary: obj.primaryImage || null,
    image_url_thumbnail: obj.primaryImageSmall || obj.primaryImage || null,
    description: obj.creditLine || null,
    repository: obj.repository || 'Metropolitan Museum of Art',
    place_created: obj.city || obj.country || null,
    tags: [...new Set(tags)].filter(Boolean),
    getty_url: obj.objectURL || `https://www.metmuseum.org/art/collection/search/${obj.objectID}`,
    is_from_getty: true, // Re-using this flag for "museum-sourced"
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { batchSize = 25, startOffset = 0 } = body;

    if (!supabaseAdmin) {
      return NextResponse.json({
        success: false,
        error: 'Supabase admin client not configured. Add SUPABASE_SERVICE_ROLE_KEY to .env.local',
      }, { status: 500 });
    }

    const batchId = `batch-${Date.now()}`;

    // Log ingestion start
    try {
      await supabaseAdmin
        .from('ingestion_logs')
        .insert({
          batch_id: batchId,
          status: 'processing',
          metadata: { batchSize, startOffset, source: 'met-museum' },
        });
    } catch (logError) {
      console.warn('Could not create ingestion log:', logError);
    }

    console.log(`[Ingest] Starting Met Museum ingestion: batchSize=${batchSize}, startOffset=${startOffset}`);

    // Step 1: Get list of highlighted objects with images
    const listUrl = `${MET_BASE}/objects?isHighlight=true&hasImages=true`;
    console.log(`[Ingest] Fetching object list from Met API...`);

    const listRes = await fetch(listUrl, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 3600 },
    });

    if (!listRes.ok) {
      throw new Error(`Met Museum API list error: ${listRes.status} ${listRes.statusText}`);
    }

    const listData = await listRes.json();
    const allIDs: number[] = listData.objectIDs || [];

    if (allIDs.length === 0) {
      throw new Error('Met Museum API returned no object IDs');
    }

    console.log(`[Ingest] Found ${allIDs.length} highlighted objects. Processing ${batchSize} starting at offset ${startOffset}`);

    // Step 2: Fetch individual objects
    const batch = allIDs.slice(startOffset, startOffset + batchSize);
    let added = 0;
    let updated = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const objectId of batch) {
      try {
        const objUrl = `${MET_BASE}/objects/${objectId}`;
        const objRes = await fetch(objUrl, {
          headers: { Accept: 'application/json' },
        });

        if (!objRes.ok) {
          skipped++;
          continue;
        }

        const obj = await objRes.json();

        // Skip if no title
        if (!obj.title) {
          skipped++;
          continue;
        }

        const artworkData = normalizeMetObject(obj);

        // Upsert into Supabase
        const { error: upsertError } = await supabaseAdmin
          .from('artworks')
          .upsert(artworkData, {
            onConflict: 'object_id',
            ignoreDuplicates: false,
          });

        if (upsertError) {
          errors.push(`Object ${objectId}: ${upsertError.message}`);
        } else {
          added++;
        }

        // Brief rate limit pause
        await new Promise(r => setTimeout(r, 100));

      } catch (objError: any) {
        errors.push(`Object ${objectId}: ${objError.message}`);
      }
    }

    // Update ingestion log
    try {
      await supabaseAdmin
        .from('ingestion_logs')
        .update({
          status: errors.length > added ? 'failed' : 'completed',
          artworks_added: added,
          artworks_updated: updated,
          errors: errors.length > 0 ? errors.slice(0, 20) : null,
          completed_at: new Date().toISOString(),
        })
        .eq('batch_id', batchId);
    } catch (e) {
      console.warn('Could not update ingestion log:', e);
    }

    console.log(`[Ingest] Done: added=${added}, updated=${updated}, skipped=${skipped}, errors=${errors.length}`);

    return NextResponse.json({
      success: true,
      batchId,
      added,
      updated,
      skipped,
      totalAvailable: allIDs.length,
      nextOffset: startOffset + batchSize,
      errors: errors.slice(0, 10),
      message: `Added ${added} artworks from Met Museum (${errors.length} errors, ${skipped} skipped)`,
    });

  } catch (error: any) {
    console.error('[Ingest] Fatal error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown ingestion error',
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({
        success: false,
        error: 'Supabase not configured (missing SUPABASE_SERVICE_ROLE_KEY)',
        stats: { totalArtworks: 0, museumArtworks: 0 },
        recentLogs: [],
      });
    }

    const [totalResult, museumResult, logsResult] = await Promise.all([
      supabaseAdmin.from('artworks').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('artworks').select('*', { count: 'exact', head: true }).eq('is_from_getty', true),
      supabaseAdmin.from('ingestion_logs').select('*').order('created_at', { ascending: false }).limit(10),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalArtworks: totalResult.count || 0,
        museumArtworks: museumResult.count || 0,
      },
      recentLogs: logsResult.data || [],
    });

  } catch (error: any) {
    console.error('[Ingest] Stats error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stats: { totalArtworks: 0, museumArtworks: 0 },
      recentLogs: [],
    });
  }
}
