// app/api/ingest/route.ts - Fixed ingestion API
// Phase 12: Getty Ingestion API - Robust version

import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { batchSize = 50, maxPages = 2 } = body;

    console.log(`Starting Getty ingestion: batchSize=${batchSize}, maxPages=${maxPages}`);

    // Check if Supabase is configured
    if (!supabaseAdmin) {
      return NextResponse.json({
        success: false,
        error: 'Supabase admin client not configured. Check environment variables.',
      }, { status: 500 });
    }

    const batchId = `batch-${Date.now()}`;

    // Create ingestion log
    try {
      await supabaseAdmin
        .from('ingestion_logs')
        .insert({
          batch_id: batchId,
          status: 'processing',
          metadata: { batchSize, maxPages },
        });
    } catch (logError) {
      console.warn('Could not create ingestion log:', logError);
    }

    // Fetch from Getty API
    const GETTY_BASE_URL = 'https://www.getty.edu/public/collections/v1/api';
    let added = 0;
    let updated = 0;
    const errors: string[] = [];

    for (let page = 0; page < maxPages; page++) {
      try {
        const params = new URLSearchParams({
          size: batchSize.toString(),
          page: page.toString(),
          hasImage: 'true',
        });

        const url = `${GETTY_BASE_URL}/objects?${params}`;
        const response = await fetch(url, {
          headers: { Accept: 'application/json' },
        });

        if (!response.ok) {
          throw new Error(`Getty API error: ${response.statusText}`);
        }

        const data: any = await response.json();
        const objects = data.objects || [];

        if (objects.length === 0) break;

        console.log(`Page ${page + 1}: Processing ${objects.length} objects...`);

        for (const obj of objects) {
          try {
            const objectID = obj.objectID?.toString();
            if (!objectID) continue;

            // Check if exists
            const { data: existing } = await supabaseAdmin
              .from('artworks')
              .select('id')
              .eq('object_id', objectID)
              .single();

            const artworkData = {
              object_id: objectID,
              title: obj.title || 'Untitled',
              artist_display: obj.artistDisplay || null,
              date: obj.objectDate || null,
              date_start: obj.objectDateStart || null,
              date_end: obj.objectDateEnd || null,
              region: obj.region || obj.country || obj.city || null,
              culture: obj.culture || null,
              medium: obj.medium || null,
              dimensions: obj.dimensions || null,
              latitude: null,
              longitude: null,
              image_url_primary: obj.primaryImage || null,
              image_url_thumbnail: obj.thumbnailImage || obj.primaryImage || null,
              description: obj.description || null,
              repository: obj.repository || null,
              place_created: obj.city || null,
              tags: [obj.culture, obj.medium, obj.region].filter(Boolean),
              getty_url: obj.objectUrl || `https://www.getty.edu/art/collection/objects/${objectID}`,
              is_from_getty: true,
            };

            if (existing) {
              // Update
              await supabaseAdmin
                .from('artworks')
                .update({ ...artworkData, updated_at: new Date().toISOString() })
                .eq('id', existing.id);
              updated++;
            } else {
              // Insert
              await supabaseAdmin
                .from('artworks')
                .insert(artworkData);
              added++;
            }

            // Rate limiting
            await new Promise(resolve => setTimeout(resolve, 50));
          } catch (objError: any) {
            errors.push(`Object ${obj.objectID}: ${objError.message}`);
          }
        }
      } catch (pageError: any) {
        errors.push(`Page ${page}: ${pageError.message}`);
        break;
      }
    }

    // Update log
    try {
      await supabaseAdmin
        .from('ingestion_logs')
        .update({
          status: errors.length > 0 ? 'completed' : 'completed',
          artworks_added: added,
          artworks_updated: updated,
          errors: errors.length > 0 ? errors : null,
          completed_at: new Date().toISOString(),
        })
        .eq('batch_id', batchId);
    } catch (e) {
      console.warn('Could not update ingestion log:', e);
    }

    console.log(`Ingestion complete: added=${added}, updated=${updated}, errors=${errors.length}`);

    return NextResponse.json({
      success: true,
      batchId,
      added,
      updated,
      errors: errors.slice(0, 10), // Only show first 10 errors
      message: `Added ${added} artworks, updated ${updated}`,
    });
  } catch (error: any) {
    console.error('Ingestion error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error',
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ 
        success: false, 
        error: 'Supabase not configured',
        stats: { totalArtworks: 0, gettyArtworks: 0 },
        recentLogs: []
      });
    }

    // Get stats
    const { count: totalArtworks } = await supabaseAdmin
      .from('artworks')
      .select('*', { count: 'exact', head: true });

    const { count: gettyArtworks } = await supabaseAdmin
      .from('artworks')
      .select('*', { count: 'exact', head: true })
      .eq('is_from_getty', true);

    // Get recent logs
    const { data: logs, error: logsError } = await supabaseAdmin
      .from('ingestion_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (logsError) {
      console.warn('Could not fetch logs:', logsError);
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalArtworks: totalArtworks || 0,
        gettyArtworks: gettyArtworks || 0,
      },
      recentLogs: logs || [],
    });
  } catch (error: any) {
    console.error('Stats error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stats: { totalArtworks: 0, gettyArtworks: 0 },
      recentLogs: [],
    });
  }
}
