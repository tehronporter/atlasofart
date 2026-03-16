// app/analytics/page.tsx - Analytics Dashboard
// Phase 16: User engagement and artwork analytics

'use client';

import { useState, useEffect } from 'react';

interface Analytics {
  totalArtworks: number;
  totalViews: number;
  totalUsers: number;
  topArtworks: any[];
  viewsByRegion: any[];
  recentActivity: any[];
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    try {
      // In production, fetch from /api/analytics
      // For now, show placeholder data
      setAnalytics({
        totalArtworks: 0,
        totalViews: 0,
        totalUsers: 0,
        topArtworks: [],
        viewsByRegion: [],
        recentActivity: [],
      });
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-neutral-400">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-neutral-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
            <p className="text-neutral-400">Track engagement and artwork performance</p>
          </div>
          <a href="/" className="text-amber-500 hover:text-amber-400">← Back to Map</a>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
            <h3 className="text-sm text-neutral-400 mb-2">Total Artworks</h3>
            <p className="text-3xl font-bold text-white">{analytics?.totalArtworks || 0}</p>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
            <h3 className="text-sm text-neutral-400 mb-2">Total Views</h3>
            <p className="text-3xl font-bold text-amber-500">{analytics?.totalViews || 0}</p>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
            <h3 className="text-sm text-neutral-400 mb-2">Active Users</h3>
            <p className="text-3xl font-bold text-amber-500">{analytics?.totalUsers || 0}</p>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
            <h3 className="text-sm text-neutral-400 mb-2">Collections</h3>
            <p className="text-3xl font-bold text-amber-500">0</p>
          </div>
        </div>

        {/* Charts Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Top Viewed Artworks</h3>
            <p className="text-neutral-500 text-sm">Requires Supabase analytics setup</p>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Views by Region</h3>
            <p className="text-neutral-500 text-sm">Requires Supabase analytics setup</p>
          </div>
        </div>

        {/* Setup Instructions */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Analytics Setup Required</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-neutral-300">
            <li>Configure Supabase artwork_views table</li>
            <li>Enable real-time analytics in Supabase dashboard</li>
            <li>Add tracking to artwork detail views</li>
            <li>Deploy analytics API endpoint</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
