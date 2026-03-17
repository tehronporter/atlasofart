// components/map/ArtworkClusterFeed.tsx
// Instagram-style scrollable grid feed for cluster artworks

'use client';

import { ArtworkCardData } from './FloatingArtworkCard';

interface ArtworkClusterFeedProps {
  artworks: ArtworkCardData[];
  onArtworkClick: (artwork: ArtworkCardData) => void;
  containerWidth: number;
  containerHeight: number;
}

export default function ArtworkClusterFeed({
  artworks,
  onArtworkClick,
  containerWidth,
  containerHeight,
}: ArtworkClusterFeedProps) {
  return (
    <div className="w-full h-full overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
      <div
        className="grid gap-2 p-2 w-full"
        style={{
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        }}
      >
        {artworks.map((artwork) => (
          <button
            key={artwork.id}
            onClick={() => onArtworkClick(artwork)}
            className="relative aspect-square rounded-lg overflow-hidden bg-neutral-100 hover:bg-neutral-200 transition-all group"
          >
            {/* Image */}
            {artwork.image_url ? (
              <img
                src={artwork.image_url}
                alt={artwork.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-neutral-300 flex items-center justify-center">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-neutral-400"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
              </div>
            )}

            {/* Overlay with text */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2">
              <h3 className="text-white text-xs font-semibold truncate line-clamp-1">
                {artwork.title}
              </h3>
              {artwork.artist_display && (
                <p className="text-white/80 text-[10px] truncate line-clamp-1">
                  {artwork.artist_display}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
