// components/map/ClusterListCard.tsx
// Fixed right-side panel — shown when a cluster or overlapping artworks are selected
// Replaces the old floating popover with a proper scrollable side drawer

'use client';

import { ArtworkCardData } from './FloatingArtworkCard';

interface ClusterListCardProps {
  artworks: ArtworkCardData[];
  onSelectArtwork: (artwork: ArtworkCardData) => void;
  onClose: () => void;
}

export default function ClusterListCard({
  artworks,
  onSelectArtwork,
  onClose,
}: ClusterListCardProps) {
  const location = artworks[0]?.place_created || 'Selected area';

  return (
    <div
      className="absolute right-0 top-0 bottom-0 z-50 pointer-events-auto flex flex-col"
      style={{
        width: 340,
        background: 'linear-gradient(180deg, rgba(18,18,24,0.97) 0%, rgba(13,13,18,0.97) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderLeft: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '-24px 0 64px rgba(0,0,0,0.55)',
        animation: 'slideInFromRight 0.22s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      <style>{`
        @keyframes slideInFromRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);   opacity: 1; }
        }
      `}</style>

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex-none px-5 pt-5 pb-4 border-b border-white/[0.06]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-1.5">
              {/* Count badge */}
              <span
                className="inline-flex items-center justify-center rounded-full text-[11px] font-bold"
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
              <p className="text-[13px] font-semibold text-white tracking-tight">
                {artworks.length === 1 ? 'Artwork' : 'Artworks'}
              </p>
            </div>
            <p className="text-[11px] text-neutral-500 truncate leading-tight">{location}</p>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="mt-0.5 shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-neutral-600 hover:text-neutral-300 transition-colors duration-200"
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
      </div>

      {/* ── Scrollable list ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {artworks.map((artwork, i) => (
          <button
            key={artwork.id}
            onClick={e => {
              e.stopPropagation();
              onSelectArtwork(artwork);
            }}
            className={`w-full flex items-start gap-3.5 px-4 py-4 text-left transition-colors duration-150 group ${
              i < artworks.length - 1 ? 'border-b border-white/[0.04]' : ''
            }`}
            style={{ background: 'transparent' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.035)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            }}
          >
            {/* Thumbnail */}
            <div
              className="shrink-0 rounded-lg overflow-hidden"
              style={{
                width: 52,
                height: 52,
                background: 'rgba(30,30,38,0.8)',
                border: '1px solid rgba(255,255,255,0.06)',
                transition: 'border-color 0.2s',
              }}
            >
              {artwork.image_url ? (
                <img
                  src={artwork.image_url}
                  alt={artwork.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  crossOrigin="anonymous"
                  onError={e => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-700">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
              )}
            </div>

            {/* Text content */}
            <div className="flex-1 min-w-0 pt-0.5">
              <p className="text-[12px] font-medium text-neutral-200 group-hover:text-white line-clamp-2 leading-snug transition-colors duration-150">
                {artwork.title}
              </p>

              {artwork.artist_display && (
                <p className="text-[10px] text-neutral-500 mt-1 line-clamp-1">
                  {artwork.artist_display}
                </p>
              )}

              {/* Meta badges */}
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                {artwork.year && artwork.year !== '?' && (
                  <span
                    className="text-[9px] font-semibold tracking-wide px-1.5 py-0.5 rounded-full"
                    style={{
                      color: '#f59e0b',
                      background: 'rgba(245,158,11,0.10)',
                      border: '1px solid rgba(245,158,11,0.18)',
                    }}
                  >
                    {artwork.year}
                  </span>
                )}
                {artwork.medium && (
                  <span className="text-[9px] text-neutral-600 line-clamp-1 max-w-[160px]">
                    {artwork.medium}
                  </span>
                )}
              </div>

              {artwork.current_museum && (
                <p className="text-[9px] text-neutral-700 mt-1 line-clamp-1">
                  {artwork.current_museum}
                </p>
              )}
            </div>

            {/* Chevron */}
            <div
              className="shrink-0 mt-1 transition-colors duration-150"
              style={{ color: 'rgba(115,115,115,0.5)' }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </button>
        ))}
      </div>

      {/* ── Footer hint ─────────────────────────────────────────────── */}
      <div className="flex-none px-5 py-3 border-t border-white/[0.04]">
        <p className="text-[9px] text-neutral-700 text-center tracking-wide uppercase">
          Click an artwork to preview
        </p>
      </div>
    </div>
  );
}
