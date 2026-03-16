// app/favorites/page.tsx - User favorites page
// Phase 14: Favorites UI

'use client';

import { useState, useEffect } from 'react';
import { getUserFavorites, removeFromFavorites } from '@/lib/auth';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  async function loadFavorites() {
    try {
      const data = await getUserFavorites();
      setFavorites(data);
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
          <p className="text-neutral-400">Bookmarked artworks</p>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-neutral-500 mb-4">No favorites yet</p>
            <p className="text-sm text-neutral-600">Click artwork markers on the map to view details and add to favorites</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((fav) => {
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
                    <p className="text-amber-500 text-sm mb-2">{artwork?.year}</p>
                    {artwork?.culture && (
                      <p className="text-xs text-neutral-400 mb-3">{artwork.culture}</p>
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
                        View
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
        </div>
      </div>
    </div>
  );
}
