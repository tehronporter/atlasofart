// app/api/artworks/sync/route.ts
// Incremental artwork sync endpoint — returns only new artworks since lastSyncTime

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const lastSyncTime = request.nextUrl.searchParams.get('lastSyncTime');

    // Default to 1 hour ago if no sync time provided
    const syncTime = lastSyncTime
      ? new Date(lastSyncTime).toISOString()
      : new Date(Date.now() - 3600000).toISOString();

    // Query for artworks created/updated since lastSyncTime
    // Note: assumes database has created_at or updated_at columns
    const { data, error } = await supabase
      .from('artworks')
      .select('*')
      .gte('created_at', syncTime)
      .is('image_url_primary', null as any, { not: true })
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .limit(5000)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Sync] Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const currentTime = new Date().toISOString();

    return NextResponse.json({
      success: true,
      newCount: data?.length ?? 0,
      artworks: data ?? [],
      syncTime: currentTime,
      nextSyncTime: new Date(Date.now() + 30 * 60000).toISOString(), // 30 minutes
    });
  } catch (err) {
    console.error('[Sync] Error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
