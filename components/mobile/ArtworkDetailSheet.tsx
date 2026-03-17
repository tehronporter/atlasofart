// components/mobile/ArtworkDetailSheet.tsx
// Mobile bottom sheet content — swipeable cluster gallery + tabs

'use client';

import { useState, useEffect, useRef } from 'react';
import { type ArtworkCardData } from '../map/FloatingArtworkCard';

type Tab = 'details' | 'nearby' | 'cluster';

interface ArtworkDetailSheetProps {
  artwork: ArtworkCardData | null;
  clusterArtworks: ArtworkCardData[];
  nearbyArtworks: ArtworkCardData[];
  selectedId?: string | null;
  onSelect?: (artwork: ArtworkCardData) => void;
  savedIds?: Set<string>;
  onToggleSave?: (artwork: ArtworkCardData) => void;
}

export default function ArtworkDetailSheet({
  artwork,
  clusterArtworks,
  nearbyArtworks,
  selectedId,
  onSelect,
  savedIds,
  onToggleSave,
}: ArtworkDetailSheetProps) {
  const [activeTab, setActiveTab] = useState<Tab>('details');
  const [clusterIndex, setClusterIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const swipeStartX = useRef(0);
  const swipeStartY = useRef(0);

  useEffect(() => {
    setActiveTab('details');
    setClusterIndex(0);
  }, [artwork?.id]);

  useEffect(() => {
    if (clusterArtworks.length > 0) {
      setActiveTab('cluster');
      setClusterIndex(0);
    }
  }, [clusterArtworks.length > 0 && clusterArtworks[0]?.id]);

  if (!artwork) return null;

  const clusterArtwork = clusterArtworks[clusterIndex] ?? artwork;
  const isSaved = savedIds?.has(artwork.id) ?? false;

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'details', label: 'Details' },
    ...(nearbyArtworks.length > 0 ? [{ id: 'nearby' as Tab, label: 'Nearby', count: nearbyArtworks.length }] : []),
    ...(clusterArtworks.length > 0 ? [{ id: 'cluster' as Tab, label: `Cluster`, count: clusterArtworks.length }] : []),
  ];

  // ── Cluster swipe handlers ──────────────────────────────────────────────────
  const goToClusterIndex = (newIdx: number) => {
    if (newIdx < 0 || newIdx >= clusterArtworks.length || isAnimating) return;
    setIsAnimating(true);
    setClusterIndex(newIdx);
    onSelect?.(clusterArtworks[newIdx]);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleSwipeStart = (e: React.TouchEvent) => {
    swipeStartX.current = e.touches[0].clientX;
    swipeStartY.current = e.touches[0].clientY;
  };

  const handleSwipeEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - swipeStartX.current;
    const dy = e.changedTouches[0].clientY - swipeStartY.current;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 44) {
      if (dx < 0) goToClusterIndex(clusterIndex + 1);
      else goToClusterIndex(clusterIndex - 1);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-white">

      {/* ── Header: title + save button ────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-2 shrink-0">
        <div className="min-w-0 flex-1">
          <h2 className="text-[15px] font-semibold text-[#111111] line-clamp-2 leading-snug">
            {activeTab === 'cluster' ? clusterArtwork.title : artwork.title}
          </h2>
          <p className="text-[12px] text-[#6b7280] mt-0.5 line-clamp-1">
            {activeTab === 'cluster' ? clusterArtwork.artist_display : artwork.artist_display}
          </p>
        </div>
        {onToggleSave && (
          <button
            onClick={() => onToggleSave(artwork)}
            className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90 ${
              isSaved ? 'bg-[#eff2ff] text-[#2e5bff]' : 'bg-[#f9fafb] text-[#9ca3af]'
            }`}
            aria-label={isSaved ? 'Unsave artwork' : 'Save artwork'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        )}
      </div>

      {/* ── Tab bar ──────────────────────────────────────────────────────────── */}
      {tabs.length > 1 && (
        <div className="flex border-b border-[#e5e7eb] px-5 shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`mr-5 py-2.5 text-[13px] font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'text-[#2e5bff] border-[#2e5bff]'
                  : 'text-[#9ca3af] border-transparent'
              }`}
            >
              {tab.label}{tab.count ? ` (${tab.count})` : ''}
            </button>
          ))}
        </div>
      )}

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto min-h-0">

        {/* DETAILS TAB */}
        {activeTab === 'details' && (
          <div className="px-5 py-4 space-y-4">
            {artwork.image_url ? (
              <img src={artwork.image_url} alt={artwork.title} className="w-full rounded-xl" />
            ) : (
              <div className="w-full aspect-[4/3] bg-[#f9fafb] rounded-xl flex items-center justify-center">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-[#d1d5db]">
                  <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {artwork.year && <span className="text-[11px] font-medium bg-[#eff2ff] text-[#2e5bff] px-2.5 py-1 rounded-full">{artwork.year}</span>}
              {artwork.place_created && <span className="text-[11px] text-[#6b7280]">📍 {artwork.place_created}</span>}
            </div>
            {artwork.medium && (
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#9ca3af] font-medium mb-0.5">Medium</p>
                <p className="text-[13px] text-[#6b7280]">{artwork.medium}</p>
              </div>
            )}
            {artwork.current_museum && (
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#9ca3af] font-medium mb-0.5">Museum</p>
                <p className="text-[13px] text-[#6b7280]">{artwork.current_museum}</p>
              </div>
            )}
            {artwork.description && (
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#9ca3af] font-medium mb-1">About</p>
                <p className="text-[13px] text-[#6b7280] leading-relaxed">{artwork.description}</p>
              </div>
            )}
          </div>
        )}

        {/* NEARBY TAB */}
        {activeTab === 'nearby' && nearbyArtworks.length > 0 && (
          <div className="px-5 py-4 space-y-2">
            {nearbyArtworks.map((a) => (
              <button
                key={a.id}
                onClick={() => onSelect?.(a)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#f9fafb] active:bg-[#eff2ff] transition-colors text-left"
              >
                <div className="w-11 h-11 rounded-lg overflow-hidden bg-[#ebebeb] shrink-0">
                  {a.image_url
                    ? <img src={a.image_url} alt={a.title} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#d1d5db]"><rect x="3" y="3" width="18" height="18" rx="2" /></svg></div>
                  }
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-[#111111] line-clamp-1">{a.title}</p>
                  {a.artist_display && <p className="text-[11px] text-[#6b7280] line-clamp-1">{a.artist_display}</p>}
                  {a.year && <p className="text-[10px] text-[#2e5bff] font-medium mt-0.5">{a.year}</p>}
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#d1d5db] shrink-0"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
            ))}
          </div>
        )}

        {/* CLUSTER TAB — swipeable gallery */}
        {activeTab === 'cluster' && clusterArtworks.length > 0 && (
          <div className="flex flex-col">
            {/* Swipeable image area */}
            <div
              className="relative bg-[#f9fafb] select-none"
              onTouchStart={handleSwipeStart}
              onTouchEnd={handleSwipeEnd}
            >
              {clusterArtwork.image_url ? (
                <img
                  key={clusterArtwork.id}
                  src={clusterArtwork.image_url}
                  alt={clusterArtwork.title}
                  className="w-full h-56 object-contain"
                  draggable={false}
                />
              ) : (
                <div className="w-full h-56 flex items-center justify-center">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-[#d1d5db]">
                    <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
              )}

              {/* Left arrow */}
              {clusterIndex > 0 && (
                <button
                  onClick={() => goToClusterIndex(clusterIndex - 1)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm shadow flex items-center justify-center active:scale-90 transition-transform"
                  aria-label="Previous artwork"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
                </button>
              )}

              {/* Right arrow */}
              {clusterIndex < clusterArtworks.length - 1 && (
                <button
                  onClick={() => goToClusterIndex(clusterIndex + 1)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm shadow flex items-center justify-center active:scale-90 transition-transform"
                  aria-label="Next artwork"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
                </button>
              )}

              {/* Counter pill */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-sm text-white text-[11px] font-medium px-2.5 py-0.5 rounded-full pointer-events-none">
                {clusterIndex + 1} / {clusterArtworks.length}
              </div>
            </div>

            {/* Dot indicators (up to 12) */}
            {clusterArtworks.length <= 20 && (
              <div className="flex justify-center gap-1.5 pt-3 pb-1">
                {clusterArtworks.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goToClusterIndex(i)}
                    className={`rounded-full transition-all ${i === clusterIndex ? 'w-4 h-1.5 bg-[#2e5bff]' : 'w-1.5 h-1.5 bg-[#d1d5db]'}`}
                    aria-label={`Go to artwork ${i + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Artwork info */}
            <div className="px-5 py-3 border-b border-[#f3f4f6]">
              <p className="text-[14px] font-semibold text-[#111111] line-clamp-1">{clusterArtwork.title}</p>
              {clusterArtwork.artist_display && (
                <p className="text-[12px] text-[#6b7280] mt-0.5 line-clamp-1">{clusterArtwork.artist_display}</p>
              )}
              {clusterArtwork.year && (
                <span className="inline-block mt-1.5 text-[11px] font-medium bg-[#eff2ff] text-[#2e5bff] px-2 py-0.5 rounded-full">{clusterArtwork.year}</span>
              )}
            </div>

            {/* Thumbnail strip */}
            <div className="px-5 py-3">
              <p className="text-[10px] uppercase tracking-widest text-[#9ca3af] font-medium mb-2">All {clusterArtworks.length} artworks</p>
              <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                {clusterArtworks.map((a, idx) => (
                  <button
                    key={a.id}
                    onClick={() => goToClusterIndex(idx)}
                    className={`shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                      idx === clusterIndex ? 'border-[#2e5bff] opacity-100' : 'border-transparent opacity-50 hover:opacity-75'
                    }`}
                    aria-label={a.title}
                  >
                    {a.image_url
                      ? <img src={a.image_url} alt={a.title} className="w-full h-full object-cover" />
                      : <div className="w-full h-full bg-[#f9fafb]" />
                    }
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
