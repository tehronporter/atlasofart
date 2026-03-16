// components/map/FloatingArtworkCard.tsx
// Premium compact floating preview card — elegant artwork preview anchored to marker
// Responsive widths + dynamic aspect ratio for artwork images (object-fit: contain)

'use client';

import { useRef, useState } from 'react';

export interface ArtworkCardData {
  id: string;
  lat: number;
  lng: number;
  title: string;
  image_url: string | null;
  image_width?: number | null;
  image_height?: number | null;
  artist_display: string | null;
  year: string;
  place_created: string | null;
  current_museum: string | null;
  medium: string | null;
  tags: string[];
  description: string | null;
  getty_url?: string;
}

interface FloatingArtworkCardProps {
  artwork: ArtworkCardData;
  markerX: number;
  markerY: number;
  containerWidth: number;
  containerHeight: number;
  onDoubleClick?: () => void;
  onClose?: () => void;
}

// Responsive card width based on screen size
function getCardWidth(): number {
  if (typeof window === 'undefined') return 320;
  const w = window.innerWidth;
  if (w < 640) return Math.min(w - 24, 320); // mobile: 90vw minus padding
  if (w < 1024) return 280; // tablet
  return 320; // desktop
}

// Calculate image height based on aspect ratio to fit within card
function getImageHeight(imageWidth: number | null | undefined, imageHeight: number | null | undefined, cardWidth: number): number {
  if (!imageWidth || !imageHeight) return 140; // default height if no dimensions
  const aspectRatio = imageWidth / imageHeight;
  const maxWidth = cardWidth - 0; // no padding in image container
  const calculatedHeight = maxWidth / aspectRatio;
  return Math.min(Math.max(calculatedHeight, 100), 280); // min 100px, max 280px
}

const GAP = 16;

export default function FloatingArtworkCard({
  artwork,
  markerX,
  markerY,
  containerWidth,
  containerHeight,
  onDoubleClick,
  onClose,
}: FloatingArtworkCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isImageLoading, setIsImageLoading] = useState(!!artwork.image_url);
  const [imageLoadError, setImageLoadError] = useState(false);

  const CARD_W = getCardWidth();
  const imageHeight = getImageHeight(artwork.image_width, artwork.image_height, CARD_W);
  const CARD_H = 380; // base height, but can vary with image

  const rawLeft = markerX - CARD_W / 2;
  const rawTop = markerY - CARD_H - GAP;

  const padding = 12;
  const left = Math.max(padding, Math.min(rawLeft, containerWidth - CARD_W - padding));
  const top = Math.max(padding, Math.min(rawTop, containerHeight - CARD_H - padding));

  return (
    <div
      ref={cardRef}
      style={{ position: 'absolute', left, top, width: CARD_W, zIndex: 50 }}
      className="pointer-events-auto animate-in fade-in zoom-in-95 duration-200"
      onDoubleClick={onDoubleClick}
    >
      {/* Connector stem to marker */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: -GAP,
          transform: 'translateX(-50%)',
          width: 2,
          height: GAP,
          background: 'linear-gradient(to bottom, rgba(251,191,36,0.4), rgba(251,191,36,0))',
          pointerEvents: 'none',
        }}
      />

      {/* Card surface */}
      <div className="rounded-xl overflow-hidden border border-white/[0.12] bg-gradient-to-b from-[#16161c]/96 to-[#0f0f14]/96 backdrop-blur-md shadow-2xl hover:border-white/[0.18] transition-all duration-300 hover:shadow-2xl">
        {/* Image container — dynamic height with object-fit contain */}
        <div
          className="relative bg-neutral-950/80 overflow-hidden group flex items-center justify-center"
          style={{ height: `${imageHeight}px` }}
        >
          {/* Loading skeleton */}
          {isImageLoading && !imageLoadError && (
            <div className="absolute inset-0 bg-neutral-800/50 animate-pulse" />
          )}

          {artwork.image_url && !imageLoadError ? (
            <>
              <img
                src={artwork.image_url}
                alt={artwork.title}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                crossOrigin="anonymous"
                onLoad={() => setIsImageLoading(false)}
                onError={() => {
                  setIsImageLoading(false);
                  setImageLoadError(true);
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            </>
          ) : null}

          {/* No image or failed to load */}
          {!artwork.image_url || imageLoadError ? (
            <div className="flex flex-col items-center justify-center text-neutral-700 gap-2">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              {imageLoadError && <span className="text-[9px] text-neutral-600">Image unavailable</span>}
            </div>
          ) : null}

          {/* Close button */}
          <button
            onClick={e => {
              e.stopPropagation();
              onClose?.();
            }}
            className="absolute top-2.5 right-2.5 w-6 h-6 rounded-lg bg-black/50 hover:bg-black/70 border border-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all duration-200 backdrop-blur"
            aria-label="Close"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content area */}
        <div className="p-3.5 space-y-2.5">
          {/* Title */}
          <h3 className="text-[13px] font-semibold text-white leading-tight line-clamp-2">
            {artwork.title}
          </h3>

          {/* Artist */}
          {artwork.artist_display && (
            <p className="text-[11px] text-neutral-400 leading-snug line-clamp-1">
              {artwork.artist_display}
            </p>
          )}

          {/* Year + Medium */}
          <div className="flex items-center gap-2 pt-0.5">
            {artwork.year && (
              <span className="text-[11px] text-amber-400/90 font-medium">{artwork.year}</span>
            )}
            {artwork.medium && (
              <span className="text-[10px] text-neutral-500 italic flex-1 truncate">{artwork.medium}</span>
            )}
          </div>

          {/* Place */}
          {artwork.place_created && (
            <div className="flex items-start gap-1.5 text-neutral-500 pt-1.5 border-t border-white/[0.06]">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0 text-amber-500/50">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span className="text-[10px] leading-snug flex-1">{artwork.place_created}</span>
            </div>
          )}

          {/* Tags */}
          {artwork.tags && artwork.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {artwork.tags.slice(0, 3).map((tag, i) => (
                <span
                  key={i}
                  className="text-[8.5px] px-1.5 py-0.5 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.06] text-neutral-500 rounded transition-all duration-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Affordance */}
          <p className="text-[9px] text-neutral-600/80 text-center pt-0.5 italic">
            Double-click to expand
          </p>
        </div>
      </div>
    </div>
  );
}
