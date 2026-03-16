// app/api/ingest/route.ts
// Getty Museum Linked Art API ingestion
// Source: https://data.getty.edu/museum/collection/
// Activity Stream: https://data.getty.edu/museum/collection/activity-stream/page/{N}
// Individual objects: https://data.getty.edu/museum/collection/object/{UUID}
// Images: https://media.getty.edu/iiif/image/{UUID}/full/400,/0/default.jpg

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const GETTY_STREAM = 'https://data.getty.edu/museum/collection/activity-stream/page';
const GETTY_OBJECT = 'https://data.getty.edu/museum/collection/object';

// ── Geocoding lookup ──────────────────────────────────────────────────────────
// Getty objects don't have coordinates; geocode from place_created text.

function geocodeFromPlace(text: string | null): [number | null, number | null] {
  if (!text) return [null, null];
  const t = text.toLowerCase();

  // Cities — checked before countries so "Rome, Italy" hits Rome not Italy
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

  // Countries
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

function parseLinkedArtObject(obj: any): Record<string, any> | null {
  if (!obj || obj.type !== 'HumanMadeObject') return null;

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
    // Strip trailing accession number like "(84.PA.723)"
    title = raw.replace(/\s*\([A-Z0-9.]+\)\s*$/, '').trim() || 'Untitled';
  } else if (obj._label) {
    title = obj._label.replace(/\s*\([A-Z0-9.]+\)\s*$/, '').trim() || 'Untitled';
  }

  // ── Artist ────────────────────────────────────────────────────────────────
  const producer = obj.produced_by;
  let artistDisplay: string | null = null;
  if (producer?.carried_out_by?.[0]) {
    // Prefer long description "Giambono (Italian, active 1420–1462)"
    const descEntry = producer.referred_to_by?.find(
      (r: any) => r._label === 'Artist/Maker (Producer) Description'
    );
    artistDisplay =
      descEntry?.content ||
      producer.carried_out_by[0]._label ||
      null;
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
  // representation[0].id is a direct IIIF image URL ending in /full/full/0/default.jpg
  let imagePrimary: string | null = null;
  let imageThumbnail: string | null = null;

  if (obj.representation?.[0]?.id) {
    const raw = obj.representation[0].id as string;
    if (raw.startsWith('http')) {
      imagePrimary = raw;
      // Swap /full/full/ → /full/800,/ for primary; /full/400,/ for thumbnail
      imageThumbnail = raw.replace(/\/full\/[^/]+\/0\/default\.jpg$/, '/full/400,/0/default.jpg');
      imagePrimary = raw.replace(/\/full\/[^/]+\/0\/default\.jpg$/, '/full/800,/0/default.jpg');
    }
  }

  // Skip objects with no image — images are required for the map detail view
  if (!imagePrimary) return null;

  // ── Medium ────────────────────────────────────────────────────────────────
  const matEntry = obj.referred_to_by?.find(
    (r: any) =>
      r._label === 'Materials Description' ||
      r.classified_as?.some(
        (c: any) => c.id === 'http://vocab.getty.edu/aat/300435429'
      )
  );
  const medium = matEntry?.content || null;

  // ── Place created ─────────────────────────────────────────────────────────
  const placeEntry = obj.referred_to_by?.find((r: any) =>
    r.classified_as?.some(
      (c: any) => c.id === 'http://vocab.getty.edu/aat/300435448'
    )
  );
  const placeCreated = placeEntry?.content || null;

  // ── Dimensions ───────────────────────────────────────────────────────────
  const dimsEntry = obj.referred_to_by?.find((r: any) =>
    r.classified_as?.some(
      (c: any) => c.id === 'http://vocab.getty.edu/aat/300435430'
    )
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
    obj.made_of
      .slice(0, 3)
      .forEach((m: any) => {
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
  const gettyUrl =
    webEntry?.id ||
    `https://www.getty.edu/art/collection/objects/${objectId}`;

  // ── Region (last segment of place text) ───────────────────────────────────
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

// ── Route handlers ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      startPage = 35000,  // Early pages are mostly People/Groups; artworks cluster here
      pagesPerRun = 3,    // Each page ~100 items, filter to HumanMadeObject
      onlyWithImages = true,
    } = body;

    if (!supabaseAdmin) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Supabase admin client not configured. Add SUPABASE_SERVICE_ROLE_KEY to .env.local',
        },
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
        metadata: { startPage, pagesPerRun, source: 'getty-linked-art' },
      })
      .then(() => {}, () => {}); // fire-and-forget

    console.log(
      `[Getty] Starting ingestion: startPage=${startPage}, pagesPerRun=${pagesPerRun}`
    );

    let added = 0;
    let updated = 0;
    let skipped = 0;
    let noImage = 0;
    const errors: string[] = [];
    let nextPageUrl: string | null =
      `${GETTY_STREAM}/${startPage}`;

    for (let run = 0; run < pagesPerRun && nextPageUrl; run++) {
      let pageData: any;

      try {
        const pageRes = await fetch(nextPageUrl, {
          headers: {
            Accept: 'application/json',
            'User-Agent': 'Atlas of Art (Educational Collection Explorer)',
          },
          cache: 'no-store',
        });

        if (!pageRes.ok) {
          errors.push(`Page fetch failed: ${pageRes.status} ${pageRes.statusText} (${nextPageUrl})`);
          break;
        }

        // Check content type before parsing JSON
        const contentType = pageRes.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          const text = await pageRes.text();
          const preview = text.substring(0, 80);
          console.error(`[Getty] Invalid content type: ${contentType}`);
          console.error(`[Getty] Response preview: ${preview}`);
          errors.push(`Getty API returned invalid content type: ${contentType}. Page ${startPage + run} may not exist. Try a lower page number (e.g., 1000).`);
          break;
        }

        pageData = await pageRes.json();

        if (!pageData?.orderedItems) {
          errors.push(`Invalid page structure: missing orderedItems`);
          break;
        }
      } catch (e: any) {
        errors.push(`Page fetch error: ${e.message}`);
        break;
      }

      const items: any[] = pageData.orderedItems ?? [];
      const artworkItems = items.filter(
        (item: any) => item?.object?.type === 'HumanMadeObject'
      );

      console.log(
        `[Getty] Page ${run + 1}/${pagesPerRun}: ${items.length} items, ` +
          `${artworkItems.length} HumanMadeObject`
      );

      // Fetch & upsert each artwork object
      for (const item of artworkItems) {
        const objectUrl = item.object?.id;
        if (!objectUrl) { skipped++; continue; }

        try {
          const objRes = await fetch(objectUrl, {
            headers: {
              Accept: 'application/json',
              'User-Agent': 'Atlas of Art (Educational Collection Explorer)',
            },
            cache: 'no-store',
          });

          if (!objRes.ok) { skipped++; continue; }

          const contentType = objRes.headers.get('content-type') || '';
          if (!contentType.includes('application/json')) {
            skipped++;
            continue;
          }

          const obj = await objRes.json();
          const parsed = parseLinkedArtObject(obj);

          if (!parsed) {
            if (onlyWithImages && !obj.representation?.[0]?.id) {
              noImage++;
            } else {
              skipped++;
            }
            continue;
          }

          const { error: upsertError } = await supabaseAdmin
            .from('artworks')
            .upsert(parsed, { onConflict: 'object_id', ignoreDuplicates: false });

          if (upsertError) {
            errors.push(`${parsed.object_id}: ${upsertError.message}`);
          } else {
            added++;
          }

          // Rate limit — Getty's servers appreciate breathing room (500ms between requests)
          await new Promise(r => setTimeout(r, 500));
        } catch (e: any) {
          errors.push(`Object fetch error: ${e.message}`);
        }
      }

      // Advance to next page
      nextPageUrl = pageData?.next?.id ?? null;
    }

    // Update log
    supabaseAdmin
      .from('ingestion_logs')
      .update({
        status: errors.length > added ? 'failed' : 'completed',
        artworks_added: added,
        artworks_updated: updated,
        errors: errors.length ? errors.slice(0, 20) : null,
        completed_at: new Date().toISOString(),
      })
      .eq('batch_id', batchId)
      .then(() => {}, () => {}); // fire-and-forget

    console.log(
      `[Getty] Done: added=${added}, skipped=${skipped}, noImage=${noImage}, errors=${errors.length}`
    );

    const nextStartPage = startPage + pagesPerRun;

    return NextResponse.json({
      success: true,
      batchId,
      added,
      updated,
      skipped,
      noImage,
      errors: errors.slice(0, 10),
      nextStartPage,
      message: `Added ${added} Getty artworks (${skipped} skipped, ${noImage} no image, ${errors.length} errors). Next start page: ${nextStartPage}`,
    });
  } catch (error: any) {
    console.error('[Getty] Fatal error:', error);
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
        stats: { totalArtworks: 0, gettyArtworks: 0, withCoordinates: 0, withImages: 0 },
        recentLogs: [],
      });
    }

    const [totalRes, gettyRes, coordRes, imgRes, logsRes] = await Promise.all([
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
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalArtworks: totalRes.count ?? 0,
        gettyArtworks: gettyRes.count ?? 0,
        withCoordinates: coordRes.count ?? 0,
        withImages: imgRes.count ?? 0,
      },
      recentLogs: logsRes.data ?? [],
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stats: { totalArtworks: 0, gettyArtworks: 0, withCoordinates: 0, withImages: 0 },
      recentLogs: [],
    });
  }
}
