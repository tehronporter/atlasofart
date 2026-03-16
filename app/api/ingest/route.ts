// app/api/ingest/route.ts - Updated with GET for stats
// Phase 12: Getty Ingestion API

import { NextRequest, NextResponse } from 'next/server';
import { batchIngestGettyArtworks } from '@/lib/getty/api';
import { supabaseAdmin } from '@/lib/supabase';
import { getArtworkCount, getGettyArtworks } from '@/lib/supabase/queries';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { batchSize = 100, maxPages = 5 } = body;

    const batchId = `batch-${Date.now()}`;
    
    if (supabaseAdmin) {
      await supabaseAdmin
        .from('ingestion_logs')
        .insert({
          batch_id: batchId,
          status: 'processing',
          metadata: { batchSize, maxPages },
        });
    }

    console.log(`Starting Getty ingestion: batch ${batchId}`);

    const result = await batchIngestGettyArtworks(
      parseInt(batchSize.toString(), 10),
      parseInt(maxPages.toString(), 10)
    );

    if (supabaseAdmin) {
      await supabaseAdmin
        .from('ingestation_logs')
        .update({
          status: 'completed',
          artworks_added: result.added,
          artworks_updated: result.updated,
          errors: result.errors.length > 0 ? result.errors : null,
          completed_at: new Date().toISOString(),
        })
        .eq('batch_id', batchId);
    }

    return NextResponse.json({
      success: true,
      batchId,
      added: result.added,
      updated: result.updated,
      errors: result.errors,
    });
  } catch (error) {
    console.error('Ingestion error:', error);
    
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase admin not configured' }, { status: 500 });
    }

    // Get recent logs
    const { data: logs, error: logsError } = await supabaseAdmin
      .from('ingestion_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (logsError) throw logsError;

    // Get current stats
    const total = await getArtworkCount();
    const gettyArtworks = await getGettyArtworks(1);

    return NextResponse.json({
      success: true,
      stats: {
        totalArtworks: total,
        gettyArtworks: gettyArtworks.length,
      },
      recentLogs: logs,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
