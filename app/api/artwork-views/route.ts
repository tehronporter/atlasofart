// app/api/artwork-views/route.ts - Log artwork views for analytics

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { artwork_id, user_id } = await req.json();

    if (!artwork_id) {
      return NextResponse.json({
        success: false,
        error: 'artwork_id is required',
      }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Insert view record (allow anonymous views by not requiring user_id)
    const { error } = await supabase
      .from('artwork_views')
      .insert({
        artwork_id,
        user_id: user_id || null,
        viewed_at: new Date().toISOString(),
      });

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message || 'Server error',
    }, { status: 500 });
  }
}
