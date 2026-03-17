// components/map/ClusterPreviewCard.tsx
// Compact cluster preview card showing thumbnail grid + count

'use client';

import { memo, useState } from 'react';
import { ArtworkCardData } from './FloatingArtworkCard';

interface ClusterPreviewCardProps {
  artworks: ArtworkCardData[];
  count: number;
  markerX: number;
  markerY: number;
  containerWidth: number;
  containerHeight: number;
}

const ClusterPreviewCard = memo(function ClusterPreviewCard({
  artworks,
  count,
  markerX,
  markerY,
  containerWidth,
  containerHeight,
}: ClusterPreviewCardProps) {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const handleImageError = (id: string) => {
    setImageErrors(prev => new Set([...prev, id]));
  };

  // Show up to 4 artworks in 2x2 grid
  const displayArtworks = artworks.slice(0, 4);
  const CARD_W = 180;
  const CARD_H = 140;
  const GAP = 12;

  // Position above marker, centered
  const rawLeft = markerX - CARD_W / 2;
  const rawTop = markerY - CARD_H - GAP;
  const padding = 12;
  const left = Math.max(padding, Math.min(rawLeft, containerWidth - CARD_W - padding));
  const top = Math.max(padding, Math.min(rawTop, containerHeight - CARD_H - padding));

  return (
    <div
      style={{ position: 'absolute', left, top, width: CARD_W, zIndex: 50 }}
      className="pointer-events-auto animate-in fade-in slide-in-from-bottom-2 duration-200"
    >
      {/* Connector stem */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: -GAP,
          transform: 'translateX(-50%)',
          width: 2,
          height: GAP,
          background: 'linear-gradient(to bottom, rgba(46,83,255,0.4), rgba(46,83,255,0))',
          pointerEvents: 'none',
        }}
      />

      <div className="rounded-lg overflow-hidden border border-blue-200/40 bg-gradient-to-b from-white/98 to-gray-50/98 backdrop-blur-md shadow-lg">
        {/* Header with count badge */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-3 py-2 flex items-center justify-between">
          <span className="text-[10px] font-semibold text-white uppercase tracking-wider">
            {count} artwork{count !== 1 ? 's' : ''}
          </span>
          <span className="text-[9px] font-bold text-blue-100 bg-blue-400/30 px-2 py-0.5 rounded-full">
            {count}
          </span>
        </div>

        {/* 2x2 Thumbnail grid */}
        <div className="grid grid-cols-2 gap-0.5 p-2 bg-gray-100">
          {displayArtworks.map((artwork, idx) => (
            <div
              key={artwork.id}
              className="relative aspect-square bg-gray-200 rounded overflow-hidden group"
            >
              {artwork.image_url && !imageErrors.has(artwork.id) ? (
                <>
                  <img
                    src={artwork.image_url}
                    alt={artwork.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={() => handleImageError(artwork.id)}
                    crossOrigin="anonymous"
                  />
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="text-gray-500"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="px-3 py-2 bg-blue-50/50 border-t border-blue-100/30">
          <button className="w-full text-[10px] font-semibold text-blue-600 hover:text-blue-700 transition-colors">
            View All →
          </button>
        </div>
      </div>
    </div>
  );
});

export default ClusterPreviewCard;
