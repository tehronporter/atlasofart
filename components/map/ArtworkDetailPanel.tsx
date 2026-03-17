// components/map/ArtworkDetailPanel.tsx
// Unified single-scroll detail panel — no tab switching
// Cluster strip always visible below artwork details

'use client';

import { memo, useState, useEffect, useRef } from 'react';
import { type ArtworkCardData } from './FloatingArtworkCard';
import ArtworkLightboxModal from './ArtworkLightboxModal';

interface ArtworkDetailPanelProps {
  artwork: ArtworkCardData | null;
  clusterArtworks: ArtworkCardData[];
  nearbyArtworks: ArtworkCardData[];
  selectedId?: string | null;
  onSelect?: (artwork: ArtworkCardData) => void;
  onClose?: () => void;
}

const ArtworkDetailPanel = memo(function ArtworkDetailPanel({
  artwork,
  clusterArtworks,
  nearbyArtworks,
  selectedId,
  onSelect,
  onClose,
}: ArtworkDetailPanelProps) {
  const [displayIndex, setDisplayIndex]       = useState(0);
  const [nearbyOpen, setNearbyOpen]           = useState(true);
  const [lightboxArtwork, setLightboxArtwork] = useState<ArtworkCardData | null>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  // Reset index when individual artwork changes
  useEffect(() => { setDisplayIndex(0); }, [artwork?.id]);

  // Reset index when a new cluster loads
  useEffect(() => {
    setDisplayIndex(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clusterArtworks[0]?.id]);

  // Scroll active thumbnail into view in the strip
  useEffect(() => {
    if (!stripRef.current) return;
    const el = stripRef.current.querySelector<HTMLElement>('[data-active="true"]');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [displayIndex]);

  // Derive the artwork shown in the main image/metadata section
  const displayedArtwork = clusterArtworks.length > 0
    ? (clusterArtworks[displayIndex] ?? clusterArtworks[0])
    : artwork;

  if (!displayedArtwork) return null;

  const hasCluster = clusterArtworks.length > 0;
  const hasNearby  = nearbyArtworks.length > 0;

  function goTo(idx: number) {
    setDisplayIndex(Math.max(0, Math.min(clusterArtworks.length - 1, idx)));
  }

  return (
    <>
      <div className="hidden lg:flex fixed right-0 top-0 bottom-0 w-96 bg-white shadow-lg border-l border-[#e5e7eb] z-30 flex-col animate-in slide-in-from-right-full duration-300">

        {/* ── Sticky header ─────────────────────────────────────── */}
        <div className="bg-white border-b border-[#e5e7eb] px-5 pt-5 pb-4 shrink-0">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="text-[15px] font-semibold text-[#111111] leading-snug line-clamp-2">
                {displayedArtwork.title}
              </h2>
              {displayedArtwork.artist_display && (
                <p className="text-[12px] text-[#6b7280] mt-1 line-clamp-1">
                  {displayedArtwork.artist_display}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {displayedArtwork.year && (
                  <span className="text-[11px] font-medium bg-[#eff2ff] text-[#2e5bff] px-2.5 py-0.5 rounded-md">
                    {displayedArtwork.year}
                  </span>
                )}
                {displayedArtwork.place_created && (
                  <span className="text-[11px] text-[#9ca3af] truncate max-w-[160px]">
                    📍 {displayedArtwork.place_created}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-[#f9fafb] hover:bg-[#eff2ff] text-[#6b7280] hover:text-[#2e5bff] flex items-center justify-center transition-colors shrink-0 border border-[#e5e7eb] mt-0.5"
              aria-label="Close panel"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Scrollable body ───────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">

          {/* ── Main image ──────────────────────────────────────── */}
          <div
            className="relative bg-[#f9fafb] overflow-hidden cursor-zoom-in group shrink-0"
            style={{ height: 240 }}
            onDoubleClick={() => setLightboxArtwork(displayedArtwork)}
            title="Double-click to expand"
          >
            {displayedArtwork.image_url ? (
              <>
                <img
                  key={displayedArtwork.id}
                  src={displayedArtwork.image_url}
                  alt={displayedArtwork.title}
                  className="w-full h-full object-contain transition-opacity duration-200"
                />
                {/* Hover hint */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none flex items-end justify-center pb-3">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-white bg-black/50 px-2.5 py-1 rounded-full pointer-events-none">
                    Double-click to expand
                  </span>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-[#d1d5db]">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
            )}

            {/* Cluster prev/next arrows on image */}
            {hasCluster && clusterArtworks.length > 1 && (
              <>
                <button
                  onClick={e => { e.stopPropagation(); goTo(displayIndex - 1); }}
                  disabled={displayIndex === 0}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/85 hover:bg-white disabled:opacity-20 text-[#111111] flex items-center justify-center transition-all border border-white/60 shadow-sm"
                  aria-label="Previous"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <button
                  onClick={e => { e.stopPropagation(); goTo(displayIndex + 1); }}
                  disabled={displayIndex === clusterArtworks.length - 1}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/85 hover:bg-white disabled:opacity-20 text-[#111111] flex items-center justify-center transition-all border border-white/60 shadow-sm"
                  aria-label="Next"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
                <div className="absolute bottom-2.5 left-0 right-0 flex justify-center pointer-events-none">
                  <span className="text-[10px] text-[#111111] bg-white/85 px-2.5 py-0.5 rounded-full shadow-sm">
                    {displayIndex + 1} / {clusterArtworks.length}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* ── Artwork metadata ────────────────────────────────── */}
          <div className="px-5 py-4 space-y-3">
            {displayedArtwork.medium && (
              <p className="text-[12px] text-[#6b7280] italic">{displayedArtwork.medium}</p>
            )}
            {displayedArtwork.current_museum && (
              <div className="flex items-start gap-2.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2e5bff" strokeWidth="2" className="mt-0.5 shrink-0">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                <span className="text-[12px] text-[#6b7280] leading-snug">{displayedArtwork.current_museum}</span>
              </div>
            )}
            {displayedArtwork.description && (
              <p className="text-[12px] text-[#4b5563] leading-relaxed line-clamp-4">
                {displayedArtwork.description}
              </p>
            )}

            {/* Action row */}
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={() => onSelect?.(displayedArtwork)}
                className="flex items-center gap-1.5 text-[12px] text-[#2e5bff] hover:text-[#1a3acc] font-medium transition-colors"
              >
                View on map
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
              <button
                onClick={() => setLightboxArtwork(displayedArtwork)}
                className="flex items-center gap-1.5 text-[12px] text-[#9ca3af] hover:text-[#6b7280] transition-colors ml-auto"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                Save
              </button>
            </div>
          </div>

          {/* ── Cluster thumbnail strip ──────────────────────────── */}
          {hasCluster && (
            <div className="border-t border-[#e5e7eb]">
              <div className="px-5 pt-4 pb-2 flex items-center justify-between">
                <p className="text-[11px] font-semibold text-[#111111] uppercase tracking-wider">
                  {clusterArtworks.length} artworks in this area
                </p>
              </div>

              {/* Horizontal scrollable thumbnail strip */}
              <div
                ref={stripRef}
                className="flex gap-2 px-5 pb-4 overflow-x-auto scrollbar-hide"
                style={{ scrollbarWidth: 'none' }}
              >
                {clusterArtworks.map((art, idx) => {
                  const isActive = idx === displayIndex;
                  return (
                    <button
                      key={art.id}
                      data-active={isActive ? 'true' : 'false'}
                      onClick={() => setDisplayIndex(idx)}
                      className={`shrink-0 w-[68px] h-[68px] rounded-lg overflow-hidden border-2 transition-all ${
                        isActive
                          ? 'border-[#2e5bff] shadow-md scale-[1.04]'
                          : 'border-[#e5e7eb] hover:border-[#2e5bff]/40 hover:scale-[1.02]'
                      }`}
                      title={art.title}
                      aria-label={art.title}
                    >
                      {art.image_url ? (
                        <img
                          src={art.image_url}
                          alt={art.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#f9fafb] flex items-center justify-center">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-[#d1d5db]">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Nearby artworks ─────────────────────────────────── */}
          {hasNearby && (
            <div className="border-t border-[#e5e7eb]">
              {/* Collapsible header */}
              <button
                onClick={() => setNearbyOpen(v => !v)}
                className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-[#f9fafb] transition-colors"
              >
                <span className="text-[11px] font-semibold text-[#111111] uppercase tracking-wider">
                  Nearby ({nearbyArtworks.length})
                </span>
                <svg
                  width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  className={`text-[#9ca3af] transition-transform duration-200 ${nearbyOpen ? 'rotate-180' : ''}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {nearbyOpen && (
                <div className="pb-3 space-y-0.5">
                  {nearbyArtworks.map(a => (
                    <button
                      key={a.id}
                      onClick={() => onSelect?.(a)}
                      className={`w-full flex items-center gap-3 px-5 py-2.5 transition-all text-left ${
                        a.id === selectedId
                          ? 'bg-[#eff2ff]'
                          : 'hover:bg-[#f9fafb]'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#f9fafb] shrink-0 border border-[#e5e7eb]">
                        {a.image_url ? (
                          <img src={a.image_url} alt={a.title} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#d1d5db]">
                              <rect x="3" y="3" width="18" height="18" rx="2" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[12px] font-medium text-[#111111] line-clamp-1">{a.title}</p>
                        {a.artist_display && (
                          <p className="text-[11px] text-[#9ca3af] line-clamp-1">{a.artist_display}</p>
                        )}
                      </div>
                      {a.year && (
                        <span className="text-[10px] text-[#2e5bff] font-medium shrink-0">{a.year}</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Bottom padding */}
          <div className="h-6" />
        </div>
      </div>

      {/* ── Lightbox ──────────────────────────────────────────────── */}
      {lightboxArtwork && (
        <ArtworkLightboxModal
          artwork={lightboxArtwork}
          onClose={() => setLightboxArtwork(null)}
        />
      )}
    </>
  );
});

export default ArtworkDetailPanel;
export type { ArtworkCardData };
