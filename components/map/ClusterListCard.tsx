// components/map/ClusterListCard.tsx
// Floating card that shows a scrollable list of artworks at a clustered location

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

const CARD_W = 280;
const GAP = 14;

export default function ClusterListCard({
  artworks,
  markerX,
  markerY,
  containerWidth,
  containerHeight,
  onSelectArtwork,
  onClose,
}: ClusterListCardProps) {
  const CARD_H = Math.min(artworks.length * 64 + 60, 380);

  const rawLeft = markerX - CARD_W / 2;
  const rawTop  = markerY - CARD_H - GAP;
  const padding = 12;
  const left = Math.max(padding, Math.min(rawLeft, containerWidth  - CARD_W - padding));
  const top  = Math.max(padding, Math.min(rawTop,  containerHeight - CARD_H - padding));

  return (
    <div
      style={{ position: 'absolute', left, top, width: CARD_W, zIndex: 50 }}
      className="pointer-events-auto"
    >
      {/* Stem */}
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

      <div className="rounded-xl overflow-hidden border border-white/[0.14] bg-[#16161c]/97 backdrop-blur-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/[0.07]">
          <div>
            <p className="text-[11px] font-semibold text-white">
              {artworks.length} artworks here
            </p>
            <p className="text-[9px] text-neutral-500 mt-0.5 truncate">
              {artworks[0]?.place_created || 'Same location'}
            </p>
          </div>
          <button
            onClick={e => { e.stopPropagation(); onClose(); }}
            className="w-5 h-5 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-neutral-500 hover:text-white transition-colors"
            aria-label="Close"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* List */}
        <div className="overflow-y-auto" style={{ maxHeight: CARD_H - 52 }}>
          {artworks.map((artwork, i) => (
            <button
              key={artwork.id}
              onClick={e => { e.stopPropagation(); onSelectArtwork(artwork); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-white/[0.05] transition-colors ${
                i < artworks.length - 1 ? 'border-b border-white/[0.04]' : ''
              }`}
            >
              {/* Thumbnail */}
              <div className="w-10 h-10 rounded-md overflow-hidden bg-neutral-800 shrink-0">
                {artwork.image_url ? (
                  <img
                    src={artwork.image_url}
                    alt={artwork.title}
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-700">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-medium text-neutral-200 line-clamp-1">
                  {artwork.title}
                </p>
                <p className="text-[9px] text-neutral-500 mt-0.5 line-clamp-1">
                  {artwork.artist_display || artwork.year || '—'}
                </p>
              </div>

              {/* Chevron */}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-700 shrink-0">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
