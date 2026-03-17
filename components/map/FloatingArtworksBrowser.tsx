// components/map/FloatingArtworksBrowser.tsx
// Floating grid browser for browsing all artworks without leaving the map

'use client';

import { memo, useEffect, useCallback, useRef } from 'react';

interface Artwork {
  id: string;
  title: string;
  image_url: string | null;
  year: string;
  medium: string | null;
  artist_display: string | null;
  lat: number;
  lng: number;
}

interface FloatingArtworksBrowserProps {
  artworks: Artwork[];
  selectedId?: string | null;
  onSelect?: (artwork: Artwork) => void;
  onClose?: () => void;
}

const FloatingArtworksBrowser = memo(function FloatingArtworksBrowser({
  artworks,
  selectedId,
  onSelect,
  onClose,
}: FloatingArtworksBrowserProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Close on ESC key
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose?.();
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Close on background click
  const handleBackgroundClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose?.();
    }
  }, [onClose]);

  return (
    <div
      onClick={handleBackgroundClick}
      className="absolute inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-white">Browse Artworks</h2>
            <p className="text-sm text-blue-100 mt-1">{artworks.length} artworks</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-lg bg-blue-400/30 hover:bg-blue-400/50 text-white flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Grid */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          {artworks.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-gray-500">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-3 opacity-50">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <p className="text-sm font-medium">No artworks match your filters</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 p-6">
              {artworks.map(artwork => (
                <button
                  key={artwork.id}
                  onClick={() => onSelect?.(artwork)}
                  className={`group relative overflow-hidden rounded-lg aspect-square bg-gray-100 border-2 transition-all duration-200 ${
                    selectedId === artwork.id
                      ? 'border-blue-500 ring-2 ring-blue-400 ring-offset-2'
                      : 'border-gray-200 hover:border-blue-400'
                  }`}
                >
                  {artwork.image_url ? (
                    <>
                      <img
                        src={artwork.image_url}
                        alt={artwork.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-2">
                          <p className="text-[10px] text-white font-medium line-clamp-2">{artwork.title}</p>
                          {artwork.year && <p className="text-[8px] text-gray-200 mt-0.5">{artwork.year}</p>}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 p-2">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-gray-400 mb-1">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                      <p className="text-[8px] text-gray-500 text-center line-clamp-2">{artwork.title}</p>
                    </div>
                  )}

                  {/* Selected indicator */}
                  {selectedId === artwork.id && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="px-6 py-3 bg-gray-50 border-t text-center text-[11px] text-gray-500 shrink-0">
          Click an artwork to select • Press ESC to close
        </div>
      </div>
    </div>
  );
});

export default FloatingArtworksBrowser;
