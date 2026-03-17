// app/recent-views/page.tsx — Recent views, brand palette

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

interface ViewedArtwork {
  id: string;
  artwork_id: string;
  viewed_at: string;
  artwork: {
    id: string;
    title: string;
    artist_display: string;
    date: string;
    image_url_thumbnail: string;
    region: string;
  };
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

function formatTime(dateString: string) {
  const date    = new Date(dateString);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60)     return 'Just now';
  if (seconds < 3600)   return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400)  return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function RecentViewsPage() {
  const [views, setViews]       = useState<ViewedArtwork[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { loadViews(); }, []);

  async function loadViews() {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('artwork_views')
        .select(`id, artwork_id, viewed_at, artwork:artwork_id (id, title, artist_display, date, image_url_thumbnail, region)`)
        .eq('user_id', user.id)
        .order('viewed_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setViews((data || []) as unknown as ViewedArtwork[]);
    } catch {
      setViews([]);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleClearHistory() {
    if (!confirm('Clear all viewing history? This cannot be undone.')) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('artwork_views').delete().eq('user_id', user.id);
      setViews([]);
    } catch {
      alert('Failed to clear history');
    }
  }

  return (
    <div className="min-h-screen bg-[#f9fafb]">

      {/* ── Top nav ────────────────────────────────────────────── */}
      <nav className="bg-white border-b border-[#e5e7eb] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center gap-3">
          <a
            href="/"
            className="w-8 h-8 rounded-lg bg-[#f9fafb] hover:bg-[#eff2ff] border border-[#e5e7eb] flex items-center justify-center transition-colors text-[#6b7280] hover:text-[#2e5bff]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </a>
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-md bg-[#2e5bff] flex items-center justify-center shrink-0">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
            <span className="text-[13px] text-[#9ca3af]">Atlas of Art</span>
            <span className="text-[#d1d5db]">/</span>
            <span className="text-[13px] font-semibold text-[#111111]">Recent Views</span>
          </div>
          {views.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="ml-auto text-[12px] text-[#ef4444] hover:text-red-600 transition-colors"
            >
              Clear History
            </button>
          )}
        </div>
      </nav>

      {/* ── Content ────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-6 py-8">

        <div className="mb-7">
          <h1 className="text-2xl font-bold text-[#111111] mb-1">Recently Viewed</h1>
          <p className="text-[13px] text-[#6b7280]">
            {isLoading ? 'Loading…' : `${views.length} artwork${views.length !== 1 ? 's' : ''} viewed`}
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="bg-white rounded-xl border border-[#e5e7eb] p-4 flex gap-4 animate-pulse">
                <div className="w-20 h-20 rounded-lg bg-[#f3f4f6] shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-[#f3f4f6] rounded w-2/3" />
                  <div className="h-3 bg-[#f3f4f6] rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : views.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-[#eff2ff] flex items-center justify-center mx-auto mb-5">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2e5bff" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-[#111111] mb-2">No viewing history</h3>
            <p className="text-[13px] text-[#6b7280] mb-5">
              Start exploring the map to see your recently viewed artworks here
            </p>
            <a
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2e5bff] text-white text-[13px] font-medium rounded-xl hover:bg-[#1a3acc] transition-colors"
            >
              Explore the Map
            </a>
          </div>
        ) : (
          <div className="space-y-2">
            {views.map(view => {
              const art = view.artwork as any;
              return (
                <div
                  key={view.id}
                  className="bg-white rounded-xl border border-[#e5e7eb] p-4 flex gap-4 hover:border-[#2e5bff]/30 hover:shadow-sm transition-all group"
                >
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-[#f9fafb] border border-[#e5e7eb] shrink-0">
                    {art?.image_url_thumbnail ? (
                      <img
                        src={art.image_url_thumbnail}
                        alt={art.title}
                        className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-[#d1d5db]">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 py-0.5">
                    <h3 className="text-[14px] font-semibold text-[#111111] line-clamp-1 mb-0.5">
                      {art?.title || 'Unknown Artwork'}
                    </h3>
                    <p className="text-[11px] font-medium text-[#2e5bff] mb-1">
                      {art?.date || art?.year || '—'}
                    </p>
                    {art?.artist_display && (
                      <p className="text-[12px] text-[#6b7280] line-clamp-1">{art.artist_display}</p>
                    )}
                    {art?.region && (
                      <p className="text-[11px] text-[#9ca3af] mt-0.5">📍 {art.region}</p>
                    )}
                  </div>

                  <div className="text-right shrink-0 flex flex-col items-end justify-between py-0.5">
                    <p className="text-[11px] text-[#9ca3af]">{formatTime(view.viewed_at)}</p>
                    <a
                      href="/"
                      className="text-[12px] text-[#2e5bff] hover:text-[#1a3acc] font-medium transition-colors"
                    >
                      View on Map →
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
