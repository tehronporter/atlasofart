// app/api/admin/moderation/route.ts

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const filter = url.searchParams.get('filter') || 'all';

    const items: any[] = [];

    // Check for artworks missing coordinates
    const { data: noCoordsArtworks } = await supabase
      .from('artworks')
      .select('id, title, created_at')
      .or('latitude.is.null,longitude.is.null')
      .limit(10);

    if (noCoordsArtworks) {
      noCoordsArtworks.forEach(art => {
        items.push({
          id: art.id,
          title: art.title,
          type: 'missing_coords',
          severity: 'critical',
          message: 'This artwork is missing geographic coordinates and cannot be displayed on the map.',
          createdAt: art.created_at,
        });
      });
    }

    // Check for artworks missing images
    const { data: noImagesArtworks } = await supabase
      .from('artworks')
      .select('id, title, created_at')
      .is('image_url_primary', null)
      .limit(10);

    if (noImagesArtworks) {
      noImagesArtworks.forEach(art => {
        items.push({
          id: art.id,
          title: art.title,
          type: 'missing_image',
          severity: 'warning',
          message: 'This artwork has no primary image assigned.',
          createdAt: art.created_at,
        });
      });
    }

    // Check for incomplete metadata
    const { data: incompleteArtworks } = await supabase
      .from('artworks')
      .select('id, title, created_at')
      .is('description', null)
      .limit(10);

    if (incompleteArtworks) {
      incompleteArtworks.forEach(art => {
        items.push({
          id: art.id,
          title: art.title,
          type: 'incomplete_data',
          severity: 'info',
          message: 'This artwork is missing a description.',
          createdAt: art.created_at,
        });
      });
    }

    // Filter by severity
    let filtered = items;
    if (filter === 'critical') {
      filtered = items.filter(item => item.severity === 'critical');
    } else if (filter === 'warning') {
      filtered = items.filter(item => item.severity === 'warning' || item.severity === 'critical');
    }

    return NextResponse.json({
      success: true,
      items: filtered,
      total: filtered.length,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message || 'Server error',
    }, { status: 500 });
  }
}
