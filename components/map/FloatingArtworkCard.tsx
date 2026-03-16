// components/map/FloatingArtworkCard.tsx
// Compact floating preview card anchored near map marker
// Position is computed externally by MapShell via map.project()

'use client';

import { useRef, useEffect } from 'react';

export interface ArtworkCardData {
  id: string;
  lat: number;
  lng: number;
  title: string;
  image_url: string | null;
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
  /** Marker's pixel coords relative to the map container */
  markerX: number;
  markerY: number;
  /** Width of the container (for edge clamping) */
  containerWidth: number;
  containerHeight: number;
  onDoubleClick?: () => void;
  onClose?: () => void;
}

const CARD_W = 300;
const CARD_H_APPROX = 360;
const GAP = 14; // px above marker

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

  // Center the card horizontally over the marker, then clamp to container
  const rawLeft = markerX - CARD_W / 2;
  const rawTop  = markerY - CARD_H_APPROX - GAP;

  const padding = 12;
  const left = Math.max(padding, Math.min(rawLeft, containerWidth  - CARD_W - padding));
  const top  = Math.max(padding, Math.min(rawTop,  containerHeight - CARD_H_APPROX - padding));

  return (
    <div
      ref={cardRef}
      style={{ position: 'absolute', left, top, width: CARD_W, zIndex: 50 }}
      className="pointer-events-auto"
      onDoubleClick={onDoubleClick}
    >
      {/* Connector line / stem */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: -GAP,
          transform: 'translateX(-50%)',
          width: 2,
          height: GAP,
          background: 'linear-gradient(to bottom, rgba(251,191,36,0.5), rgba(251,191,36,0))',
          pointerEvents: 'none',
        }}
      />

      <div className="rounded-xl overflow-hidden border border-white/[0.14] bg-[#16161c]/97 backdrop-blur-md shadow-2xl transition-all duration-150 hover:border-amber-500/30">
        {/* Image */}
        <div className="relative h-[110px] bg-neutral-900 overflow-hidden group cursor-pointer">
          {artwork.image_url ? (
            <img
              src={artwork.image_url}
              alt={artwork.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              crossOrigin="anonymous"
              onError={e => {
                const el = e.target as HTMLImageElement;
                el.style.display = 'none';
                el.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`absolute inset-0 flex flex-col items-center justify-center text-neutral-700 ${artwork.image_url ? 'hidden' : ''}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#16161c]/70 via-transparent to-transparent pointer-events-none" />
          <button
            onClick={e => { e.stopPropagation(); onClose?.(); }}
            className="absolute top-2 right-2 w-5 h-5 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:bg-black/80 transition-colors"
            aria-label="Close"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-3 pt-2.5 pb-3 space-y-1.5">
          <h3 className="text-[12px] font-semibold text-white leading-snug line-clamp-2">
            {artwork.title}
          </h3>

          {artwork.artist_display && (
            <p className="text-[10px] text-neutral-400 leading-snug line-clamp-1">
              {artwork.artist_display}
            </p>
          )}

          <div className="flex items-center gap-2">
            {artwork.year && (
              <span className="text-[10px] text-amber-400/90 font-medium">{artwork.year}</span>
            )}
            {artwork.medium && (
              <span className="text-[9px] text-neutral-500 italic line-clamp-1 flex-1">{artwork.medium}</span>
            )}
          </div>

          {artwork.place_created && (
            <div className="flex items-start gap-1.5 text-neutral-500 pt-1.5 border-t border-white/[0.05]">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0 text-amber-500/50">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span className="text-[9px] line-clamp-1">{artwork.place_created}</span>
            </div>
          )}

          {artwork.tags && artwork.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-0.5">
              {artwork.tags.slice(0, 3).map((tag, i) => (
                <span key={i} className="text-[8px] px-1.5 py-0.5 bg-white/[0.04] border border-white/[0.06] text-neutral-500 rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <p className="text-[8.5px] text-neutral-600 text-center pt-1">
            Double-click to expand
          </p>
        </div>
      </div>
    </div>
  );
}
