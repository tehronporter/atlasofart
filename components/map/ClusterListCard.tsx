// components/map/ClusterListCard.tsx
// Premium floating cluster results drawer — curated location artwork list

'use client';

import { ArtworkCardData } from './FloatingArtworkCard';

interface ClusterListCardProps {
  artworks: ArtworkCardData[];
  markerX: number;
  markerY: number;
  containerWidth: number;
  containerHeight: number;
  onSelectArtwork: (artwork: ArtworkCardData) => void;
  onClose: () => void;
}

const CARD_W = 320;
const GAP = 16;

export default function ClusterListCard({
  artworks,
  markerX,
  markerY,
  containerWidth,
  containerHeight,
  onSelectArtwork,
  onClose,
}: ClusterListCardProps) {
  const CARD_H = Math.min(artworks.length * 68 + 100, 420);

  const rawLeft = markerX - CARD_W / 2;
  const rawTop = markerY - CARD_H - GAP;
  const padding = 12;
  const left = Math.max(padding, Math.min(rawLeft, containerWidth - CARD_W - padding));
  const top = Math.max(padding, Math.min(rawTop, containerHeight - CARD_H - padding));

  return (
    <div
      style={{ position: 'absolute', left, top, width: CARD_W, zIndex: 50 }}
      className="pointer-events-auto animate-in fade-in zoom-in-95 duration-200"
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
          background: 'linear-gradient(to bottom, rgba(251,191,36,0.4), rgba(251,191,36,0))',
          pointerEvents: 'none',
        }}
      />

      {/* Panel */}
      <div className="rounded-xl overflow-hidden border border-white/[0.12] bg-gradient-to-b from-[#16161c]/96 to-[#0f0f14]/96 backdrop-blur-md shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-4 py-4 border-b border-white/[0.07]">
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-white leading-tight">
              {artworks.length} {artworks.length === 1 ? 'artwork' : 'artworks'}
            </p>
            <p className="text-[10px] text-neutral-500 mt-1.5 truncate">
              {artworks[0]?.place_created || 'Same location'}
            </p>
          </div>
          <button
            onClick={e => {
              e.stopPropagation();
              onClose();
            }}
            className="w-6 h-6 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] flex items-center justify-center text-neutral-500 hover:text-neutral-400 transition-all duration-200 shrink-0"
            aria-label="Close"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Scrollable list */}
        <div className="overflow-y-auto" style={{ maxHeight: CARD_H - 80 }}>
          {artworks.map((artwork, i) => (
            <button
              key={artwork.id}
              onClick={e => {
                e.stopPropagation();
                onSelectArtwork(artwork);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-3.5 text-left hover:bg-white/[0.05] transition-all duration-200 group ${
                i < artworks.length - 1 ? 'border-b border-white/[0.04]' : ''
              }`}
            >
              {/* Thumbnail */}
              <div className="w-11 h-11 rounded-lg overflow-hidden bg-neutral-800/60 border border-white/[0.05] shrink-0 group-hover:border-white/[0.1] transition-all duration-200">
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
                  <div className="w-full h-full flex items-center justify-center text-neutral-700">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Text content */}
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-neutral-100 line-clamp-1 group-hover:text-white transition-colors">
                  {artwork.title}
                </p>
                <p className="text-[10px] text-neutral-500 mt-0.5 line-clamp-1">
                  {artwork.artist_display || artwork.year || '—'}
                </p>
              </div>

              {/* Chevron affordance */}
              <div className="text-neutral-700 group-hover:text-neutral-500 transition-colors shrink-0">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
