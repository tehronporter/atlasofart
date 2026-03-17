// components/map/ClusterListCard.tsx
// Bottom panel — shown when a cluster or overlapping artworks are selected
// Displays artworks in a horizontal scrollable filmstrip

'use client';

import { useRef } from 'react';
import { ArtworkCardData } from './FloatingArtworkCard';

interface ClusterListCardProps {
  artworks: ArtworkCardData[];
  center?: [number, number] | null;
  onSelect: (artwork: ArtworkCardData) => void;
  onClose: () => void;
}

export default function ClusterListCard({
  artworks,
  center,
  onSelect,
  onClose,
}: ClusterListCardProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const location = artworks[0]?.place_created || 'Selected area';

  if (artworks.length === 0) return null;

  return (
    <div
      className="flex-none flex flex-col border-t pointer-events-auto"
      style={{
        height: 176, // h-44
        background: 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,249,250,0.98) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderColor: '#e0e0e0',
      }}
    >
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex-none flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Count badge */}
          <span
            className="inline-flex items-center justify-center rounded-full text-[11px] font-bold shrink-0"
            style={{
              minWidth: 26,
              height: 26,
              padding: '0 7px',
              background: 'rgba(245,158,11,0.18)',
              color: '#f59e0b',
              border: '1px solid rgba(245,158,11,0.28)',
            }}
          >
            {artworks.length}
          </span>
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-neutral-900 truncate">
              {artworks.length === 1 ? 'Artwork' : 'Artworks'}
            </p>
            <p className="text-[10px] text-neutral-500 truncate leading-tight">{location}</p>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-neutral-600 hover:text-neutral-300 transition-colors duration-200"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
          aria-label="Close panel"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* ── Horizontal scrollable artwork strip ─────────────────────── */}
      <div
        ref={scrollRef}
        className="flex-1 flex items-center gap-2 overflow-x-auto px-4 py-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {artworks.map((artwork) => (
          <button
            key={artwork.id}
            onClick={() => onSelect(artwork)}
            title={artwork.title}
            className="shrink-0 group relative transition-all duration-200 rounded-lg overflow-hidden"
            style={{
              width: 96,
              height: 96,
              border: '1.5px solid rgba(255,255,255,0.07)',
              background: 'rgba(20,20,28,0.6)',
            }}
          >
            {artwork.image_url ? (
              <img
                src={artwork.image_url}
                alt={artwork.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                crossOrigin="anonymous"
                onError={e => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-neutral-700">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
            )}

            {/* Hover overlay */}
            <div
              className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
              style={{ backdropFilter: 'blur(2px)' }}
            />

            {/* Title tooltip on hover */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 backdrop-blur px-2 py-1 rounded text-[9px] text-neutral-900 whitespace-nowrap pointer-events-none z-10">
              {artwork.title.length > 20 ? artwork.title.slice(0, 18) + '…' : artwork.title}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
