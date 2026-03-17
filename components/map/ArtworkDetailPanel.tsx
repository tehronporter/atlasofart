// components/map/ArtworkDetailPanel.tsx
// Right-side detail panel with single artwork view and Instagram-style cluster feed

'use client';

import { memo, useState, useRef, useEffect } from 'react';
import { type ArtworkCardData } from './FloatingArtworkCard';

interface ArtworkDetailPanelProps {
  artwork: ArtworkCardData | null;
  clusterArtworks: ArtworkCardData[];
  selectedId?: string | null;
  onSelect?: (artwork: ArtworkCardData) => void;
  onClose?: () => void;
}

const ArtworkDetailPanel = memo(function ArtworkDetailPanel({
  artwork,
  clusterArtworks,
  selectedId,
  onSelect,
  onClose,
}: ArtworkDetailPanelProps) {
  const [isClusterFeed, setIsClusterFeed] = useState(false);
  const [currentClusterIndex, setCurrentClusterIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Reset to single view when artwork changes
  useEffect(() => {
    setIsClusterFeed(false);
    setCurrentClusterIndex(0);
  }, [artwork?.id]);

  if (!artwork) return null;

  const currentClusterArtwork = isClusterFeed && clusterArtworks.length > 0
    ? clusterArtworks[currentClusterIndex]
    : artwork;

  const handlePrevious = () => {
    if (currentClusterIndex > 0) {
      setCurrentClusterIndex(currentClusterIndex - 1);
      onSelect?.(clusterArtworks[currentClusterIndex - 1]);
    }
  };

  const handleNext = () => {
    if (currentClusterIndex < clusterArtworks.length - 1) {
      setCurrentClusterIndex(currentClusterIndex + 1);
      onSelect?.(clusterArtworks[currentClusterIndex + 1]);
    }
  };

  const handleClusterSelect = (index: number) => {
    setCurrentClusterIndex(index);
    onSelect?.(clusterArtworks[index]);
  };

  return (
    <div className="fixed right-0 top-0 bottom-0 w-96 bg-white shadow-2xl z-30 flex flex-col animate-in slide-in-from-right-full duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4 flex items-center justify-between shrink-0">
        <h2 className="text-lg font-semibold text-white">
          {isClusterFeed ? `Artworks in Cluster (${clusterArtworks.length})` : 'Artwork Details'}
        </h2>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg bg-blue-400/30 hover:bg-blue-400/50 text-white flex items-center justify-center transition-colors"
          aria-label="Close panel"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        {isClusterFeed ? (
          /* Instagram-style cluster feed */
          <>
            {/* Current artwork image */}
            <div className="relative bg-gray-100 flex-shrink-0 h-96 overflow-hidden group">
              {currentClusterArtwork.image_url ? (
                <>
                  <img
                    src={currentClusterArtwork.image_url}
                    alt={currentClusterArtwork.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-gray-500">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
              )}

              {/* Navigation arrows */}
              {clusterArtworks.length > 1 && (
                <>
                  <button
                    onClick={handlePrevious}
                    disabled={currentClusterIndex === 0}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 disabled:opacity-30 text-white flex items-center justify-center transition-all"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={currentClusterIndex === clusterArtworks.length - 1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 disabled:opacity-30 text-white flex items-center justify-center transition-all"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>

                  {/* Progress indicator */}
                  <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1.5 px-4">
                    {clusterArtworks.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleClusterSelect(idx)}
                        className={`h-1 rounded-full transition-all ${
                          idx === currentClusterIndex
                            ? 'w-8 bg-white'
                            : 'w-2 bg-white/50 hover:bg-white/70'
                        }`}
                        aria-label={`Go to artwork ${idx + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Artwork info */}
            <div className="flex-1 p-5 space-y-4 overflow-y-auto">
              <div>
                <h3 className="text-lg font-bold text-gray-900 line-clamp-2">{currentClusterArtwork.title}</h3>
                {currentClusterArtwork.artist_display && (
                  <p className="text-sm text-gray-600 mt-1">{currentClusterArtwork.artist_display}</p>
                )}
              </div>

              {currentClusterArtwork.year && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded">
                    {currentClusterArtwork.year}
                  </span>
                  {currentClusterArtwork.medium && (
                    <span className="text-xs text-gray-500">{currentClusterArtwork.medium}</span>
                  )}
                </div>
              )}

              {currentClusterArtwork.place_created && (
                <div className="flex items-start gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0 text-blue-600">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span className="text-sm text-gray-600">{currentClusterArtwork.place_created}</span>
                </div>
              )}

              {currentClusterArtwork.description && (
                <p className="text-sm text-gray-600 leading-relaxed">{currentClusterArtwork.description}</p>
              )}
            </div>
          </>
        ) : (
          /* Single artwork view */
          <>
            {/* Image */}
            <div className="relative bg-gray-100 h-96 overflow-hidden group flex-shrink-0">
              {artwork.image_url ? (
                <>
                  <img
                    src={artwork.image_url}
                    alt={artwork.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-gray-500">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex-1 p-5 space-y-4 overflow-y-auto">
              <div>
                <h3 className="text-lg font-bold text-gray-900 line-clamp-2">{artwork.title}</h3>
                {artwork.artist_display && (
                  <p className="text-sm text-gray-600 mt-1">{artwork.artist_display}</p>
                )}
              </div>

              {artwork.year && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded">
                    {artwork.year}
                  </span>
                  {artwork.medium && (
                    <span className="text-xs text-gray-500">{artwork.medium}</span>
                  )}
                </div>
              )}

              {artwork.place_created && (
                <div className="flex items-start gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0 text-blue-600">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span className="text-sm text-gray-600">{artwork.place_created}</span>
                </div>
              )}

              {artwork.description && (
                <p className="text-sm text-gray-600 leading-relaxed">{artwork.description}</p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Footer actions */}
      {clusterArtworks.length > 0 && !isClusterFeed && (
        <div className="border-t px-5 py-3 shrink-0">
          <button
            onClick={() => {
              setIsClusterFeed(true);
              setCurrentClusterIndex(clusterArtworks.findIndex(a => a.id === artwork.id) || 0);
            }}
            className="w-full py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
          >
            View All ({clusterArtworks.length})
          </button>
        </div>
      )}

      {isClusterFeed && (
        <div className="border-t px-5 py-3 shrink-0">
          <button
            onClick={() => setIsClusterFeed(false)}
            className="w-full py-2 px-4 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-900 text-sm font-medium transition-colors"
          >
            Back to Details
          </button>
        </div>
      )}
    </div>
  );
});

export default ArtworkDetailPanel;
export type { ArtworkCardData };
