// app/favorites/page.tsx - Enhanced user favorites page

'use client';

import { useState, useEffect } from 'react';
import { getUserFavorites, removeFromFavorites } from '@/lib/auth';

type SortOption = 'recent' | 'oldest' | 'alphabetical' | 'date';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [filterRegion, setFilterRegion] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [regions, setRegions] = useState<string[]>([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  async function loadFavorites() {
    try {
      const data = await getUserFavorites();
      setFavorites(data);

      // Extract unique regions
      const uniqueRegions = [...new Set(data.map((f: any) => f.artwork?.region).filter(Boolean))];
      setRegions(uniqueRegions as string[]);
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRemove(favoriteId: string) {
    try {
      await removeFromFavorites(favoriteId);
      loadFavorites();
    } catch (error) {
      console.error('Failed to remove:', error);
    }
  }

  function sortFavorites(items: any[]) {
    const sorted = [...items];
    switch (sortBy) {
      case 'recent':
        return sorted.reverse(); // Reverse for newest first
      case 'oldest':
        return sorted;
      case 'alphabetical':
        return sorted.sort((a, b) =>
          (a.artwork?.title || '').localeCompare(b.artwork?.title || '')
        );
      case 'date':
        return sorted.sort((a, b) =>
          ((a.artwork?.date || '') || '').localeCompare(b.artwork?.date || '')
        );
      default:
        return sorted;
    }
  }

  const filtered = favorites.filter(fav =>
    !filterRegion || fav.artwork?.region === filterRegion
  );
  const sorted = sortFavorites(filtered);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-neutral-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-neutral-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Favorites</h1>
          <p className="text-neutral-400">{favorites.length} bookmarked artwork{favorites.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Controls */}
        {favorites.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-4 items-center">
            <div>
              <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-2">Sort by</label>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as SortOption)}
                className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-neutral-300 text-sm focus:outline-none focus:border-amber-500"
              >
                <option value="recent">Date Added (Newest)</option>
                <option value="oldest">Date Added (Oldest)</option>
                <option value="alphabetical">Title (A-Z)</option>
                <option value="date">Artwork Date</option>
              </select>
            </div>

            {regions.length > 0 && (
              <div>
                <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-2">Region</label>
                <select
                  value={filterRegion}
                  onChange={e => setFilterRegion(e.target.value)}
                  className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-neutral-300 text-sm focus:outline-none focus:border-amber-500"
                >
                  <option value="">All Regions</option>
                  {regions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>
            )}

            {(filterRegion || sortBy !== 'recent') && (
              <button
                onClick={() => {
                  setSortBy('recent');
                  setFilterRegion('');
                }}
                className="ml-auto text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
              >
                Reset filters
              </button>
            )}
          </div>
        )}

        {sorted.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-neutral-500 mb-4">
              {favorites.length === 0
                ? 'No favorites yet'
                : 'No artworks match your filter'}
            </p>
            <p className="text-sm text-neutral-600">
              {favorites.length === 0
                ? 'Click artwork markers on the map to view details and add to favorites'
                : 'Try adjusting your filters'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sorted.map((fav) => {
              const artwork = fav.artwork;
              return (
                <div
                  key={fav.id}
                  className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden hover:border-neutral-700 transition-colors"
                >
                  {artwork?.image_url && artwork.image_url !== '/placeholder.jpg' ? (
                    <img
                      src={artwork.image_url}
                      alt={artwork.title}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-neutral-800 flex items-center justify-center">
                      <span className="text-neutral-500 text-sm">No image</span>
                    </div>
                  )}

                  <div className="p-4">
                    <h3 className="font-semibold mb-1 line-clamp-1">{artwork?.title}</h3>
                    <p className="text-amber-500 text-sm mb-2">{artwork?.year || artwork?.date || '—'}</p>
                    {artwork?.culture && (
                      <p className="text-xs text-neutral-400 mb-3">{artwork.culture}</p>
                    )}
                    {artwork?.region && (
                      <p className="text-xs text-neutral-500 mb-3">📍 {artwork.region}</p>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRemove(artwork.id)}
                        className="flex-1 px-3 py-1.5 bg-red-900/20 text-red-400 text-sm rounded hover:bg-red-900/30 transition-colors"
                      >
                        Remove
                      </button>
                      <a
                        href="/"
                        className="flex-1 px-3 py-1.5 bg-neutral-800 text-neutral-300 text-sm rounded hover:bg-neutral-700 transition-colors text-center"
                      >
                        View Map
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8 flex gap-4">
          <a href="/" className="text-amber-500 hover:text-amber-400 text-sm">← Back to Map</a>
          <a href="/collections" className="text-amber-500 hover:text-amber-400 text-sm">View Collections</a>
          <a href="/recent-views" className="text-amber-500 hover:text-amber-400 text-sm">Recent Views</a>
        </div>
      </div>
    </div>
  );
}
