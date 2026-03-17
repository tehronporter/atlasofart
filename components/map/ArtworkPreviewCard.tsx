// components/map/ArtworkPreviewCard.tsx
// Compact artwork preview card for individual markers

'use client';

import { memo, useState } from 'react';
import { ArtworkCardData } from './FloatingArtworkCard';

interface ArtworkPreviewCardProps {
  artwork: ArtworkCardData;
  markerX: number;
  markerY: number;
  containerWidth: number;
  containerHeight: number;
}

const ArtworkPreviewCard = memo(function ArtworkPreviewCard({
  artwork,
  markerX,
  markerY,
  containerWidth,
  containerHeight,
}: ArtworkPreviewCardProps) {
  const [isImageLoading, setIsImageLoading] = useState(!!artwork.image_url);
  const [imageLoadError, setImageLoadError] = useState(false);

  const CARD_W = 160;
  const CARD_H = 120;
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
        {/* Thumbnail */}
        <div className="relative bg-gray-100 overflow-hidden group flex items-center justify-center h-20">
          {isImageLoading && !imageLoadError && (
            <div className="absolute inset-0 bg-gray-200/50 animate-pulse" />
          )}

          {artwork.image_url && !imageLoadError ? (
            <>
              <img
                src={artwork.image_url}
                alt={artwork.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                crossOrigin="anonymous"
                onLoad={() => setIsImageLoading(false)}
                onError={() => {
                  setIsImageLoading(false);
                  setImageLoadError(true);
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
            </>
          ) : (
            <div className="flex items-center justify-center text-neutral-500">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-2.5 space-y-1.5 border-t border-blue-100/30">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-[11px] font-semibold text-gray-900 leading-tight line-clamp-2 flex-1">
              {artwork.title}
            </h3>
          </div>

          <div className="flex items-center gap-2 text-[9px]">
            {artwork.year && (
              <span className="font-medium text-blue-600">{artwork.year}</span>
            )}
            {artwork.medium && (
              <span className="text-gray-500 italic truncate">{artwork.medium}</span>
            )}
          </div>

          {artwork.artist_display && (
            <p className="text-[9px] text-gray-600 line-clamp-1">{artwork.artist_display}</p>
          )}
        </div>
      </div>
    </div>
  );
});

export default ArtworkPreviewCard;
