// components/map/NearbyArtworksTray.tsx
// Horizontal filmstrip of the nearest artworks to the currently selected one.
// Shown between the map and timeline when an artwork is selected.

'use client';

import { useRef } from 'react';
import { ArtworkCardData } from './FloatingArtworkCard';

interface NearbyArtworksTrayProps {
  artworks: ArtworkCardData[];          // nearby artworks, pre-sorted by distance
  selectedId: string;
  onSelect: (artwork: ArtworkCardData) => void;
}

export default function NearbyArtworksTray({
  artworks,
  selectedId,
  onSelect,
}: NearbyArtworksTrayProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentIndex = artworks.findIndex(a => a.id === selectedId);
  const displayIndex = currentIndex >= 0 ? currentIndex + 1 : 1;

  if (artworks.length === 0) return null;

  return (
    <div
      className="flex-none flex items-center gap-3 px-4 border-t"
      style={{
        height: 76,
        background: 'linear-gradient(90deg, rgba(10,10,15,0.97) 0%, rgba(14,14,20,0.97) 100%)',
        borderColor: 'rgba(255,255,255,0.06)',
      }}
    >
      {/* Label */}
      <div className="flex-none flex flex-col items-start justify-center pr-3 border-r border-white/[0.06]" style={{ minWidth: 64 }}>
        <p className="text-[9px] uppercase tracking-widest text-neutral-600 leading-none mb-1">Nearby</p>
        <p className="text-[10px] text-neutral-500"><span className="text-amber-400 font-medium">{displayIndex}</span><span className="text-neutral-700"> of </span>{artworks.length}</p>
      </div>

      {/* Scrollable thumbnail strip */}
      <div
        ref={scrollRef}
        className="flex items-center gap-2 overflow-x-auto flex-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {artworks.map(artwork => {
          const isActive = artwork.id === selectedId;
          return (
            <button
              key={artwork.id}
              onClick={() => onSelect(artwork)}
              title={artwork.title}
              className="shrink-0 group relative transition-all duration-200"
              style={{
                width: 48,
                height: 48,
                borderRadius: 8,
                overflow: 'hidden',
                border: isActive
                  ? '2px solid rgba(245,158,11,0.8)'
                  : '1.5px solid rgba(255,255,255,0.07)',
                transform: isActive ? 'scale(1.08)' : 'scale(1)',
                boxShadow: isActive ? '0 0 12px rgba(245,158,11,0.3)' : 'none',
              }}
            >
              {artwork.image_url ? (
                <img
                  src={artwork.image_url}
                  alt={artwork.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  crossOrigin="anonymous"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ background: 'rgba(30,30,38,0.8)' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-neutral-700">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
              )}

              {/* Hover title tooltip */}
              <div
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 rounded-md text-[9px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-10"
                style={{ background: 'rgba(0,0,0,0.85)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}
              >
                {artwork.title.length > 20 ? artwork.title.slice(0, 18) + '…' : artwork.title}
              </div>
            </button>
          );
        })}
      </div>

      {/* Keyboard hint */}
      <div className="flex-none hidden md:flex items-center gap-1.5 text-[9px] text-neutral-700">
        <span className="px-1.5 py-0.5 rounded border border-white/[0.08] text-neutral-600 font-mono">←</span>
        <span className="px-1.5 py-0.5 rounded border border-white/[0.08] text-neutral-600 font-mono">→</span>
        <span>navigate</span>
      </div>
    </div>
  );
}
