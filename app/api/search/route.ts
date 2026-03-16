// app/api/search/route.ts - Advanced search API
// Phase 15: Enhanced search capabilities

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const region = searchParams.get('region');
    const medium = searchParams.get('medium');
    const culture = searchParams.get('culture');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    let builder = supabaseAdmin
      .from('artworks')
      .select('*')
      .limit(limit);

    // Full-text search
    if (query) {
      builder = builder.or(
        `title.ilike.%${query}%,description.ilike.%${query}%,culture.ilike.%${query}%`
      );
    }

    // Filters
    if (region) builder = builder.eq('region', region);
    if (medium) builder = builder.eq('medium', medium);
    if (culture) builder = builder.eq('culture', culture);
    
    if (dateFrom) {
      builder = builder.gte('date_end', parseInt(dateFrom, 10));
    }
    if (dateTo) {
      builder = builder.lte('date_start', parseInt(dateTo, 10));
    }

    const { data, error } = await builder;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      count: data.length,
      results: data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
