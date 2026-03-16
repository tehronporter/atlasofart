// app/api/auth/check-admin/route.ts - Check if current user is admin

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Get auth token from header
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, isAdmin: false });
    }

    const token = authHeader.substring(7);

    // Create client with service role (bypasses RLS)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get user from token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json({ success: false, isAdmin: false });
    }

    // Fetch profile with service role (bypasses RLS)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ success: false, isAdmin: false });
    }

    return NextResponse.json({
      success: true,
      isAdmin: profile.role === 'admin',
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message || 'Server error',
      isAdmin: false,
    }, { status: 500 });
  }
}
