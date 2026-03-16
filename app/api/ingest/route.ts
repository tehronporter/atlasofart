// app/api/ingest/route.ts
// Getty Museum Linked Art API ingestion via SPARQL
//
// Uses Getty's SPARQL endpoint to discover all HumanMadeObject URIs with images,
// then fetches each new object's JSON-LD for parsing. This replaces the old
// activity-stream approach which was a changelog full of duplicate entries.
//
// SPARQL endpoint: https://data.getty.edu/museum/collection/sparql
// Total objects with images: ~123,500 (of ~168,000 total)

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Extend Vercel serverless function timeout
export const maxDuration = 300; // 5 minutes

const SPARQL_ENDPOINT = 'https://data.getty.edu/museum/collection/sparql';

// SPARQL query to get HumanMadeObject URIs that have at least one image representation
const SPARQL_QUERY_OBJECTS = `
SELECT ?obj WHERE {
  ?obj a <http://www.cidoc-crm.org/cidoc-crm/E22_Human-Made_Object> .
  ?obj <http://www.cidoc-crm.org/cidoc-crm/P138i_has_representation> ?img .
}
LIMIT {LIMIT} OFFSET {OFFSET}
`;

const SPARQL_QUERY_COUNT = `
SELECT (COUNT(DISTINCT ?obj) AS ?count) WHERE {
  ?obj a <http://www.cidoc-crm.org/cidoc-crm/E22_Human-Made_Object> .
  ?obj <http://www.cidoc-crm.org/cidoc-crm/P138i_has_representation> ?img .
}
`;

// ── Geocoding lookup ──────────────────────────────────────────────────────────
function geocodeFromPlace(text: string | null): [number | null, number | null] {
  if (!text) return [null, null];
  const t = text.toLowerCase();

  const cities: [string, number, number][] = [
    ['florence', 43.7696, 11.2558], ['firenze', 43.7696, 11.2558],
    ['rome', 41.9028, 12.4964], ['roma', 41.9028, 12.4964],
    ['venice', 45.4408, 12.3155], ['venezia', 45.4408, 12.3155],
    ['milan', 45.4654, 9.1859], ['siena', 43.3186, 11.3307],
    ['naples', 40.8522, 14.2681], ['bologna', 44.4949, 11.3426],
    ['paris', 48.8566, 2.3522],
    ['amsterdam', 52.3676, 4.9041], ['leiden', 52.1601, 4.4970],
    ['delft', 52.0116, 4.3571], ['haarlem', 52.3812, 4.6365],
    ['antwerp', 51.2194, 4.4025], ['bruges', 51.2093, 3.2247],
    ['brussels', 50.8503, 4.3517],
    ['london', 51.5074, -0.1278],
    ['madrid', 40.4168, -3.7038], ['seville', 37.3891, -5.9845],
    ['barcelona', 41.3851, 2.1734], ['toledo', 39.8628, -4.0273],
    ['munich', 48.1351, 11.5820], ['nuremberg', 49.4521, 11.0767],
    ['berlin', 52.5200, 13.4050], ['cologne', 50.9333, 6.9500],
    ['vienna', 48.2082, 16.3738], ['salzburg', 47.8095, 13.0550],
    ['prague', 50.0755, 14.4378],
    ['cairo', 30.0444, 31.2357], ['luxor', 25.6872, 32.6396],
    ['thebes', 25.7189, 32.6574], ['karnak', 25.7189, 32.6574],
    ['memphis', 29.8509, 31.2534], ['alexandria', 31.2001, 29.9187],
    ['beijing', 39.9042, 116.4074], ['peking', 39.9042, 116.4074],
    ['shanghai', 31.2304, 121.4737], ['nanjing', 32.0603, 118.7969],
    ['hangzhou', 30.2741, 120.1551], ['suzhou', 31.2989, 120.5853],
    ['kyoto', 35.0116, 135.7681], ['tokyo', 35.6762, 139.6503],
    ['edo', 35.6762, 139.6503], ['osaka', 34.6937, 135.5022],
    ['delhi', 28.7041, 77.1025], ['agra', 27.1767, 78.0081],
    ['jaipur', 26.9124, 75.7873], ['mughal', 27.1767, 78.0081],
    ['tehran', 35.6892, 51.3890], ['isfahan', 32.6546, 51.6679],
    ['shiraz', 29.5918, 52.5837], ['tabriz', 38.0962, 46.2738],
    ['istanbul', 41.0082, 28.9784], ['constantinople', 41.0082, 28.9784],
    ['damascus', 33.5138, 36.2765], ['baghdad', 33.3406, 44.4009],
    ['athens', 37.9838, 23.7275], ['delphi', 38.4824, 22.5013],
    ['new york', 40.7128, -74.0060], ['los angeles', 34.0522, -118.2437],
    ['malibu', 34.0259, -118.7798], ['boston', 42.3601, -71.0589],
    ['mexico city', 19.4326, -99.1332], ['oaxaca', 17.0732, -96.7266],
    ['cuzco', -13.5320, -71.9675], ['lima', -12.0464, -77.0428],
  ];

  for (const [name, lat, lng] of cities) {
    if (t.includes(name)) return [lat, lng];
  }

  const countries: [string, number, number][] = [
    ['italy', 41.9028, 12.4964], ['italian', 41.9028, 12.4964],
    ['france', 48.8566, 2.3522], ['french', 48.8566, 2.3522],
    ['netherlands', 52.3676, 4.9041], ['dutch', 52.3676, 4.9041],
    ['flanders', 50.8503, 4.3517], ['flemish', 50.8503, 4.3517],
    ['belgium', 50.8503, 4.3517],
    ['spain', 40.4168, -3.7038], ['spanish', 40.4168, -3.7038],
    ['germany', 52.5200, 13.4050], ['german', 52.5200, 13.4050],
    ['austria', 48.2082, 16.3738],
    ['england', 51.5074, -0.1278], ['britain', 51.5074, -0.1278],
    ['british', 51.5074, -0.1278], ['united kingdom', 51.5074, -0.1278],
    ['greece', 37.9838, 23.7275], ['greek', 37.9838, 23.7275],
    ['roman', 41.9028, 12.4964],
    ['egypt', 30.0444, 31.2357], ['egyptian', 30.0444, 31.2357],
    ['china', 39.9042, 116.4074], ['chinese', 39.9042, 116.4074],
    ['japan', 35.6762, 139.6503], ['japanese', 35.6762, 139.6503],
    ['india', 28.6139, 77.2090], ['indian', 28.6139, 77.2090],
    ['iran', 35.6892, 51.3890], ['persian', 35.6892, 51.3890],
    ['persia', 35.6892, 51.3890], ['safavid', 35.6892, 51.3890],
    ['turkey', 39.9334, 32.8597], ['ottoman', 41.0082, 28.9784],
    ['iraq', 33.3406, 44.4009], ['mesopotamia', 33.3406, 44.4009],
    ['syria', 33.5138, 36.2765],
    ['united states', 40.7128, -74.0060], ['american', 40.7128, -74.0060],
    ['mexico', 19.4326, -99.1332],
    ['peru', -12.0464, -77.0428],
    ['russia', 55.7558, 37.6173],
    ['portugal', 38.7223, -9.1393],
    ['scandinavia', 59.9139, 10.7522], ['nordic', 59.9139, 10.7522],
  ];

  for (const [name, lat, lng] of countries) {
    if (t.includes(name)) return [lat, lng];
  }

  return [null, null];
}

// ── Linked Art parser ─────────────────────────────────────────────────────────

function isHumanMadeObject(obj: any): boolean {
  if (!obj) return false;
  const t = obj.type;
  if (Array.isArray(t)) return t.includes('HumanMadeObject');
  return t === 'HumanMadeObject';
}

async function fetchIIIFDimensions(
  imageUrl: string
): Promise<{ width: number; height: number } | null> {
  try {
    const infoUrl = imageUrl.replace(/\/full\/[^/]+\/0\/default\.jpg$/, '/info.json');
    const res = await fetch(infoUrl, {
      headers: { Accept: 'application/json', 'User-Agent': 'Atlas of Art (Educational Collection Explorer)' },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const info = await res.json();
    if (info.width && info.height) return { width: info.width, height: info.height };
    return null;
  } catch {
    return null;
  }
}

function parseLinkedArtObject(obj: any): Record<string, any> | null {
  if (!isHumanMadeObject(obj)) return null;

  const objectId = obj.id?.split('/').pop();
  if (!objectId) return null;

  // ── Title ─────────────────────────────────────────────────────────────────
  let title = 'Untitled';
  if (obj.identified_by) {
    const preferred = obj.identified_by.find(
      (i: any) =>
        i.type === 'Name' &&
        (i._label === 'Preferred Title' ||
          i.classified_as?.some(
            (c: any) => c.id === 'http://vocab.getty.edu/aat/300404670'
          ))
    );
    const anyName = obj.identified_by.find((i: any) => i.type === 'Name');
    const raw = preferred?.content || anyName?.content || obj._label || 'Untitled';
    title = raw.replace(/\s*\([A-Z0-9.]+\)\s*$/, '').trim() || 'Untitled';
  } else if (obj._label) {
    title = obj._label.replace(/\s*\([A-Z0-9.]+\)\s*$/, '').trim() || 'Untitled';
  }

  // ── Artist ────────────────────────────────────────────────────────────────
  const producer = obj.produced_by;
  let artistDisplay: string | null = null;
  if (producer?.carried_out_by?.[0]) {
    const descEntry = producer.referred_to_by?.find(
      (r: any) => r._label === 'Artist/Maker (Producer) Description'
    );
    artistDisplay = descEntry?.content || producer.carried_out_by[0]._label || null;
  }

  // ── Dates ─────────────────────────────────────────────────────────────────
  const timespan = producer?.timespan;
  let dateLabel: string | null = null;
  let dateStart: number | null = null;
  let dateEnd: number | null = null;

  if (timespan) {
    dateLabel = timespan.identified_by?.[0]?.content || null;
    const parseYear = (isoStr: string): number => {
      const isBce = isoStr.startsWith('-');
      const absYear = parseInt(isoStr.replace(/^-/, '').substring(0, 4), 10);
      return isNaN(absYear) ? 0 : isBce ? -absYear : absYear;
    };
    if (timespan.begin_of_the_begin) dateStart = parseYear(timespan.begin_of_the_begin);
    if (timespan.end_of_the_end) dateEnd = parseYear(timespan.end_of_the_end);
  }

  // ── Image URL ─────────────────────────────────────────────────────────────
  let imagePrimary: string | null = null;
  let imageThumbnail: string | null = null;

  if (obj.representation?.[0]?.id) {
    const raw = obj.representation[0].id as string;
    if (raw.startsWith('http')) {
      imagePrimary = raw;
      imageThumbnail = raw.replace(/\/full\/[^/]+\/0\/default\.jpg$/, '/full/400,/0/default.jpg');
      imagePrimary = raw.replace(/\/full\/[^/]+\/0\/default\.jpg$/, '/full/800,/0/default.jpg');
    }
  }

  // ── Medium ────────────────────────────────────────────────────────────────
  const matEntry = obj.referred_to_by?.find(
    (r: any) =>
      r._label === 'Materials Description' ||
      r.classified_as?.some((c: any) => c.id === 'http://vocab.getty.edu/aat/300435429')
  );
  const medium = matEntry?.content || null;

  // ── Place created ─────────────────────────────────────────────────────────
  const placeEntry = obj.referred_to_by?.find((r: any) =>
    r.classified_as?.some((c: any) => c.id === 'http://vocab.getty.edu/aat/300435448')
  );
  const placeCreated = placeEntry?.content || null;

  // ── Dimensions ───────────────────────────────────────────────────────────
  const dimsEntry = obj.referred_to_by?.find((r: any) =>
    r.classified_as?.some((c: any) => c.id === 'http://vocab.getty.edu/aat/300435430')
  );
  const dimensions = dimsEntry?.content || null;

  // ── Classification ────────────────────────────────────────────────────────
  const typeEntry = obj.classified_as?.find(
    (c: any) => c._label && !c._label.toLowerCase().includes('open content')
  );

  // ── Tags ──────────────────────────────────────────────────────────────────
  const tags: string[] = [];
  if (typeEntry?._label) tags.push(typeEntry._label);
  if (obj.made_of) {
    obj.made_of.slice(0, 3).forEach((m: any) => {
      if (m._label && !tags.includes(m._label)) tags.push(m._label);
    });
  }

  // ── Description ───────────────────────────────────────────────────────────
  const descEntry = obj.referred_to_by?.find(
    (r: any) =>
      r._label === 'Description' ||
      r.classified_as?.some((c: any) => c._label === 'Description')
  );
  const description = descEntry?.content || null;

  // ── Getty web page URL ────────────────────────────────────────────────────
  const webEntry = obj.subject_of?.find((s: any) =>
    s.classified_as?.some((c: any) => c._label === 'Web Page')
  );
  const gettyUrl = webEntry?.id || `https://www.getty.edu/art/collection/objects/${objectId}`;

  // ── Region ────────────────────────────────────────────────────────────────
  let region: string | null = null;
  if (placeCreated) {
    const parts = placeCreated.split(',');
    region = (parts.length > 1 ? parts[parts.length - 1] : parts[0]).trim();
  }

  // ── Coordinates ───────────────────────────────────────────────────────────
  const [lat, lng] = geocodeFromPlace(placeCreated);

  return {
    object_id: `getty-${objectId}`,
    title,
    artist_display: artistDisplay,
    date: dateLabel,
    date_start: dateStart,
    date_end: dateEnd,
    region,
    culture: null,
    medium,
    dimensions,
    latitude: lat,
    longitude: lng,
    image_url_primary: imagePrimary,
    image_url_thumbnail: imageThumbnail,
    description,
    repository: 'J. Paul Getty Museum, Los Angeles',
    place_created: placeCreated,
    tags: [...new Set(tags)].filter(Boolean),
    getty_url: gettyUrl,
    is_from_getty: true,
  };
}

// ── SPARQL helpers ────────────────────────────────────────────────────────────

async function sparqlQuery(query: string): Promise<any> {
  const url = `${SPARQL_ENDPOINT}?query=${encodeURIComponent(query)}&output=json`;
  const res = await fetch(url, {
    headers: {
      Accept: 'application/sparql-results+json',
      'User-Agent': 'Atlas of Art (Educational Collection Explorer)',
    },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`SPARQL query failed: ${res.status} ${res.statusText}`);
  return res.json();
}

async function getTotalObjectsWithImages(): Promise<number> {
  const data = await sparqlQuery(SPARQL_QUERY_COUNT);
  return parseInt(data.results.bindings[0]?.count?.value || '0', 10);
}

async function getObjectURIs(limit: number, offset: number): Promise<string[]> {
  const query = SPARQL_QUERY_OBJECTS
    .replace('{LIMIT}', String(limit))
    .replace('{OFFSET}', String(offset));
  const data = await sparqlQuery(query);
  return (data.results.bindings || []).map((b: any) => b.obj.value);
}

// ── Route handlers ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      offset = 0,          // SPARQL offset — position in the full list of ~123k objects
      batchSize = 50,      // How many object URIs to process per run
    } = body;

    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: 'Supabase admin client not configured. Add SUPABASE_SERVICE_ROLE_KEY to .env.local' },
        { status: 500 }
      );
    }

    const batchId = `getty-${Date.now()}`;

    // Log ingestion start
    supabaseAdmin
      .from('ingestion_logs')
      .insert({
        batch_id: batchId,
        status: 'processing',
        metadata: { offset, batchSize, source: 'getty-sparql' },
      })
      .then(() => {}, () => {});

    console.log(`[Getty SPARQL] Starting: offset=${offset}, batchSize=${batchSize}`);

    // 1. Get object URIs from SPARQL
    let objectURIs: string[];
    try {
      objectURIs = await getObjectURIs(batchSize, offset);
    } catch (e: any) {
      return NextResponse.json({
        success: false,
        error: `SPARQL query failed: ${e.message}`,
      }, { status: 500 });
    }

    if (objectURIs.length === 0) {
      return NextResponse.json({
        success: true,
        batchId,
        added: 0,
        alreadyExists: 0,
        noImage: 0,
        fetchFailed: 0,
        errors: [],
        nextOffset: offset,
        finished: true,
        message: `No more objects at offset ${offset}. Ingestion complete!`,
      });
    }

    // 2. Extract UUIDs and batch-check which already exist in DB
    const objectIds = objectURIs.map(uri => {
      const uuid = uri.split('/').pop();
      return uuid ? `getty-${uuid}` : null;
    }).filter(Boolean) as string[];

    const existingSet = new Set<string>();
    if (objectIds.length > 0) {
      const { data: existingRows } = await supabaseAdmin
        .from('artworks')
        .select('object_id')
        .in('object_id', objectIds);
      if (existingRows) {
        for (const row of existingRows) {
          existingSet.add(row.object_id);
        }
      }
    }

    // 3. Fetch & upsert only NEW objects
    let added = 0;
    let alreadyExists = 0;
    let noImage = 0;
    let fetchFailed = 0;
    const errors: string[] = [];

    for (const uri of objectURIs) {
      const uuid = uri.split('/').pop();
      const objectId = uuid ? `getty-${uuid}` : null;

      if (objectId && existingSet.has(objectId)) {
        alreadyExists++;
        continue;
      }

      try {
        const objRes = await fetch(uri, {
          headers: {
            Accept: 'application/json',
            'User-Agent': 'Atlas of Art (Educational Collection Explorer)',
          },
          cache: 'no-store',
        });

        if (!objRes.ok) { fetchFailed++; continue; }

        const contentType = objRes.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) { fetchFailed++; continue; }

        const obj = await objRes.json();
        const parsed = parseLinkedArtObject(obj);
        if (!parsed) { fetchFailed++; continue; }

        // Must have an image to display on the map
        if (!parsed.image_url_primary) {
          noImage++;
          continue;
        }

        // Fetch IIIF dimensions for aspect ratio
        if (parsed.image_url_primary) {
          const dims = await fetchIIIFDimensions(parsed.image_url_primary);
          if (dims) {
            parsed.image_width = dims.width;
            parsed.image_height = dims.height;
          }
        }

        const { error: upsertError } = await supabaseAdmin
          .from('artworks')
          .upsert(parsed, { onConflict: 'object_id', ignoreDuplicates: false });

        if (upsertError) {
          errors.push(`${parsed.object_id}: ${upsertError.message}`);
        } else {
          added++;
        }

        // Rate limit — 200ms between Getty API calls
        await new Promise(r => setTimeout(r, 200));
      } catch (e: any) {
        errors.push(`Fetch error: ${e.message}`);
      }
    }

    const nextOffset = offset + batchSize;

    // Update log
    supabaseAdmin
      .from('ingestion_logs')
      .update({
        status: errors.length > added + alreadyExists ? 'failed' : 'completed',
        artworks_added: added,
        artworks_updated: 0,
        errors: errors.length ? errors.slice(0, 20) : null,
        completed_at: new Date().toISOString(),
      })
      .eq('batch_id', batchId)
      .then(() => {}, () => {});

    console.log(
      `[Getty SPARQL] Done: added=${added}, alreadyExists=${alreadyExists}, noImage=${noImage}, fetchFailed=${fetchFailed}, errors=${errors.length}`
    );

    return NextResponse.json({
      success: true,
      batchId,
      added,
      alreadyExists,
      noImage,
      fetchFailed,
      errors: errors.slice(0, 10),
      nextOffset,
      finished: objectURIs.length < batchSize,
      message: `Added ${added} new artworks. ${alreadyExists} already in DB. ${noImage} no usable image. Next offset: ${nextOffset}`,
    });
  } catch (error: any) {
    console.error('[Getty SPARQL] Fatal error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({
        success: false,
        error: 'Supabase not configured',
        stats: { totalArtworks: 0, gettyArtworks: 0, withCoordinates: 0, withImages: 0, totalGettyAvailable: 0 },
        recentLogs: [],
      });
    }

    // Fetch DB stats and Getty total count in parallel
    const [totalRes, gettyRes, coordRes, imgRes, logsRes, gettyTotal] = await Promise.all([
      supabaseAdmin.from('artworks').select('*', { count: 'exact', head: true }),
      supabaseAdmin
        .from('artworks')
        .select('*', { count: 'exact', head: true })
        .eq('is_from_getty', true),
      supabaseAdmin
        .from('artworks')
        .select('*', { count: 'exact', head: true })
        .not('latitude', 'is', null),
      supabaseAdmin
        .from('artworks')
        .select('*', { count: 'exact', head: true })
        .not('image_url_primary', 'is', null),
      supabaseAdmin
        .from('ingestion_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10),
      getTotalObjectsWithImages().catch(() => 0),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalArtworks: totalRes.count ?? 0,
        gettyArtworks: gettyRes.count ?? 0,
        withCoordinates: coordRes.count ?? 0,
        withImages: imgRes.count ?? 0,
        totalGettyAvailable: gettyTotal,
      },
      recentLogs: logsRes.data ?? [],
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stats: { totalArtworks: 0, gettyArtworks: 0, withCoordinates: 0, withImages: 0, totalGettyAvailable: 0 },
      recentLogs: [],
    });
  }
}
