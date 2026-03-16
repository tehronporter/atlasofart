// components/admin/AnalyticsPanel.tsx

'use client';

import { useState, useEffect } from 'react';

interface KPI {
  label: string;
  value: number | string;
  icon: string;
  color: string;
}

export function AnalyticsPanel() {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('/api/admin/stats');
        const data = await res.json();

        if (data.success) {
          setKpis([
            {
              label: 'Total Users',
              value: data.totalUsers || 0,
              icon: '👥',
              color: 'bg-blue-500/15 text-blue-400',
            },
            {
              label: 'Active This Month',
              value: data.activeUsers || 0,
              icon: '⚡',
              color: 'bg-emerald-500/15 text-emerald-400',
            },
            {
              label: 'Total Favorites',
              value: (data.totalFavorites || 0).toLocaleString(),
              icon: '⭐',
              color: 'bg-amber-500/15 text-amber-400',
            },
            {
              label: 'Total Collections',
              value: (data.totalCollections || 0).toLocaleString(),
              icon: '📚',
              color: 'bg-purple-500/15 text-purple-400',
            },
          ]);
        } else {
          setError(data.error || 'Failed to load analytics');
        }
      } catch (err: any) {
        setError(err.message || 'Network error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
      {/* Error banner */}
      {error && (
        <div className="p-4 bg-red-900/20 border border-red-800/50 rounded-xl text-sm">
          <p className="text-red-400 font-semibold">{error}</p>
        </div>
      )}

      {/* KPI Cards */}
      {isLoading ? (
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-amber-500/60 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-neutral-500 text-sm">Loading analytics...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map(kpi => (
              <div key={kpi.label} className={`rounded-xl border border-neutral-800 p-5 ${kpi.color.replace('text-', 'border-').replace('/15', '/30')}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-neutral-400 uppercase tracking-wider mb-2">{kpi.label}</p>
                    <p className="text-2xl font-bold text-white tabular-nums">{kpi.value}</p>
                  </div>
                  <span className="text-2xl">{kpi.icon}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Placeholder */}
          <div className="space-y-6">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 text-center">
              <p className="text-neutral-500 text-sm">📊 View Analytics Charts</p>
              <p className="text-xs text-neutral-600 mt-2">Bar charts, line graphs, and heatmaps coming soon</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-white mb-4">Most Viewed Artworks</h3>
                <p className="text-xs text-neutral-500">Top 10 artworks by view count — data visualization coming soon</p>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-white mb-4">Views by Region</h3>
                <p className="text-xs text-neutral-500">Geographic distribution of artwork views — map coming soon</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
