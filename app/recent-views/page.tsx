// app/recent-views/page.tsx - Recent artwork views

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

export default function RecentViewsPage() {
  const [views, setViews] = useState<ViewedArtwork[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadViews();
  }, []);

  async function loadViews() {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch recent views
      const { data, error } = await supabase
        .from('artwork_views')
        .select(`
          id,
          artwork_id,
          viewed_at,
          artwork:artwork_id (
            id,
            title,
            artist_display,
            date,
            image_url_thumbnail,
            region
          )
        `)
        .eq('user_id', user.id)
        .order('viewed_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setViews((data || []) as unknown as ViewedArtwork[]);
    } catch (error) {
      console.error('Failed to load views:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleClearHistory() {
    if (!confirm('Clear all viewing history? This cannot be undone.')) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('artwork_views')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      setViews([]);
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-neutral-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-neutral-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Recent Views</h1>
            <p className="text-neutral-400">{views.length} artwork{views.length !== 1 ? 's' : ''} viewed</p>
          </div>
          {views.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="px-4 py-2 text-sm text-red-400 hover:text-red-300 transition-colors"
            >
              Clear History
            </button>
          )}
        </div>

        {views.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-neutral-500 mb-4">No viewing history yet</p>
            <p className="text-sm text-neutral-600">Start exploring the map to see your recently viewed artworks here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {views.map(view => {
              const artwork = view.artwork as any;
              return (
                <div
                  key={view.id}
                  className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 hover:border-neutral-700 transition-colors flex gap-4"
                >
                  {artwork?.image_url_thumbnail && (
                    <img
                      src={artwork.image_url_thumbnail}
                      alt={artwork.title}
                      className="w-20 h-20 rounded object-cover shrink-0"
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold mb-1 line-clamp-1">{artwork?.title || 'Unknown Artwork'}</h3>
                    <p className="text-sm text-amber-500 mb-1">{artwork?.date || artwork?.year || '—'}</p>
                    {artwork?.artist_display && (
                      <p className="text-xs text-neutral-500 line-clamp-1">{artwork.artist_display}</p>
                    )}
                    {artwork?.region && (
                      <p className="text-xs text-neutral-600 mt-1">📍 {artwork.region}</p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs text-neutral-500">{formatTime(view.viewed_at)}</p>
                    <a
                      href="/"
                      className="text-xs text-amber-500 hover:text-amber-400 mt-2 inline-block"
                    >
                      View on Map
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8 flex gap-4">
          <a href="/" className="text-amber-500 hover:text-amber-400 text-sm">← Back to Map</a>
          <a href="/favorites" className="text-amber-500 hover:text-amber-400 text-sm">View Favorites</a>
          <a href="/collections" className="text-amber-500 hover:text-amber-400 text-sm">View Collections</a>
        </div>
      </div>
    </div>
  );
}
