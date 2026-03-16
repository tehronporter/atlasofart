// app/api/artworks/route.ts
// Paginated artworks endpoint — selects only map-required columns
// Supports page/limit/region/dateStart/dateEnd query params

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const SELECTED_COLUMNS = [
  'id', 'title', 'artist_display', 'date', 'date_start', 'date_end',
  'latitude', 'longitude',
  'image_url_primary', 'image_url_thumbnail', 'image_width', 'image_height',
  'place_created', 'medium', 'culture', 'region', 'tags', 'getty_url',
  'repository', 'description',
].join(', ');

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page   = Math.max(0, parseInt(searchParams.get('page')  ?? '0',  10));
  const limit  = Math.min(5000, parseInt(searchParams.get('limit') ?? '5000', 10));
  const offset = page * limit;
  const region    = searchParams.get('region');
  const dateStart = searchParams.get('dateStart');
  const dateEnd   = searchParams.get('dateEnd');

  const supabase = createClient(supabaseUrl, supabaseKey);

  let query = supabase
    .from('artworks')
    .select(SELECTED_COLUMNS)
    .not('latitude', 'is', null)
    .not('longitude', 'is', null)
    .order('date_start', { ascending: true, nullsFirst: false })
    .range(offset, offset + limit - 1);

  if (region)    query = query.eq('region', region);
  if (dateStart) query = query.gte('date_start', parseInt(dateStart, 10));
  if (dateEnd)   query = query.lte('date_end',   parseInt(dateEnd,   10));

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    artworks: data ?? [],
    page,
    limit,
    hasMore: (data?.length ?? 0) === limit,
  });
}
