// components/admin/ModerationPanel.tsx

'use client';

import { useState, useEffect } from 'react';

interface ModerationItem {
  id: string;
  title: string;
  type: 'missing_coords' | 'missing_image' | 'incomplete_data';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  createdAt: string;
}

export function ModerationPanel() {
  const [items, setItems] = useState<ModerationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'critical' | 'warning'>('all');

  useEffect(() => {
    const fetchModerationItems = async () => {
      try {
        const res = await fetch(`/api/admin/moderation?filter=${selectedFilter}`);
        const data = await res.json();

        if (data.success) {
          setItems(data.items || []);
        } else {
          setError(data.error || 'Failed to load moderation items');
        }
      } catch (err: any) {
        setError(err.message || 'Network error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchModerationItems();
  }, [selectedFilter]);

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/15 border-red-500/30 text-red-400';
      case 'warning':
        return 'bg-amber-500/15 border-amber-500/30 text-amber-400';
      default:
        return 'bg-blue-500/15 border-blue-500/30 text-blue-400';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-neutral-900">Content Moderation</h2>
        <p className="text-xs text-neutral-700 mt-1">Review and resolve content quality issues</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        {(['all', 'critical', 'warning'] as const).map(filter => (
          <button
            key={filter}
            onClick={() => setSelectedFilter(filter)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              selectedFilter === filter
                ? 'bg-[#1e5a96] text-white'
                : 'bg-gray-100 text-neutral-700 hover:text-neutral-900'
            }`}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>

      {/* Error banner */}
      {error && (
        <div className="p-4 bg-red-100 border border-red-300 rounded-xl text-sm">
          <p className="text-red-700 font-semibold">{error}</p>
        </div>
      )}

      {/* Issues List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-[#1e5a96]/60 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-neutral-700 text-sm">Loading issues...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
            <p className="text-emerald-600 font-semibold">✓ All Clear</p>
            <p className="text-xs text-neutral-700 mt-1">No content issues detected</p>
          </div>
        ) : (
          items.map(item => (
            <div key={item.id} className={`border rounded-xl p-4 ${getSeverityStyle(item.severity)}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wide">
                      {item.type.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-white">{item.title}</p>
                  <p className="text-xs text-neutral-300 mt-1">{item.message}</p>
                  <p className="text-[10px] text-neutral-600 mt-2">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button className="px-3 py-1.5 text-xs bg-black/30 hover:bg-black/50 rounded transition-colors">
                    Review
                  </button>
                  <button className="px-3 py-1.5 text-xs bg-black/30 hover:bg-black/50 rounded transition-colors">
                    Fix
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info section */}
      <div className="bg-blue-950/20 border border-blue-900/30 rounded-xl p-4">
        <p className="text-xs text-blue-400 font-semibold mb-2">Moderation Features</p>
        <ul className="text-xs text-blue-400/60 space-y-1">
          <li>✓ Artworks with missing coordinates</li>
          <li>✓ Artworks with missing images</li>
          <li>✓ Incomplete metadata checks</li>
          <li>✓ Flagged collections (user-reported)</li>
        </ul>
      </div>
    </div>
  );
}
