// app/api/admin/stats/route.ts

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    // Get user statistics
    const { data: users, count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' });

    const { count: totalFavorites } = await supabase
      .from('favorites')
      .select('*', { count: 'exact' });

    const { count: totalCollections } = await supabase
      .from('collections')
      .select('*', { count: 'exact' });

    // Calculate active users (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count: activeUsers } = await supabase
      .from('artwork_views')
      .select('*', { count: 'exact' })
      .gte('viewed_at', thirtyDaysAgo.toISOString());

    return NextResponse.json({
      success: true,
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      totalFavorites: totalFavorites || 0,
      totalCollections: totalCollections || 0,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message || 'Server error',
    }, { status: 500 });
  }
}
