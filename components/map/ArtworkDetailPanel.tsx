// components/map/ArtworkDetailPanel.tsx
// Right-side detail panel — tabbed: Details | Nearby | Cluster

'use client';

import { memo, useState, useEffect } from 'react';
import { type ArtworkCardData } from './FloatingArtworkCard';
import ArtworkClusterFeed from './ArtworkClusterFeed';

type Tab = 'details' | 'nearby' | 'cluster';

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
  const [activeTab, setActiveTab] = useState<Tab>('details');
  const [clusterIndex, setClusterIndex] = useState(0);

  // Reset to details when the selected artwork changes
  useEffect(() => {
    setActiveTab('details');
    setClusterIndex(0);
  }, [artwork?.id]);

  // Auto-switch to cluster tab when a new cluster is loaded
  useEffect(() => {
    if (clusterArtworks.length > 0) {
      setActiveTab('cluster');
      setClusterIndex(0);
    }
  }, [clusterArtworks.length > 0 && clusterArtworks[0]?.id]);

  const displayArtwork = artwork ?? clusterArtworks[0] ?? null;
  if (!displayArtwork) return null;

  const clusterArtwork = clusterArtworks[clusterIndex] ?? displayArtwork;

  const tabs: { id: Tab; label: string }[] = [
    { id: 'details', label: 'Details' },
    ...(nearbyArtworks.length > 0 ? [{ id: 'nearby' as Tab, label: `Nearby (${nearbyArtworks.length})` }] : []),
    ...(clusterArtworks.length > 0 ? [{ id: 'cluster' as Tab, label: `Cluster (${clusterArtworks.length})` }] : []),
  ];

  const headerArtwork = activeTab === 'cluster' ? clusterArtwork : displayArtwork;

  return (
    <div className="hidden lg:flex fixed right-0 top-0 bottom-0 w-96 bg-white shadow-lg border-l border-[#e5e7eb] z-30 flex-col animate-in slide-in-from-right-full duration-300">

      {/* ── Header: title + meta + tabs ──────────────────────────────────── */}
      <div className="bg-white border-b border-[#e5e7eb] px-6 pt-5 pb-4 shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-[#111111] leading-snug line-clamp-2">
              {headerArtwork.title}
            </h2>
            {headerArtwork.artist_display && (
              <p className="text-[12px] text-[#6b7280] mt-2 line-clamp-1 font-normal">
                {headerArtwork.artist_display}
              </p>
            )}
            <div className="flex items-center gap-2.5 mt-3 flex-wrap">
              {headerArtwork.year && (
                <span className="text-[11px] font-medium bg-[#eff2ff] text-[#2e5bff] px-2.5 py-1 rounded-lg">
                  {headerArtwork.year}
                </span>
              )}
              {headerArtwork.place_created && (
                <span className="text-[11px] text-[#6b7280] truncate max-w-[180px]">
                  📍 {headerArtwork.place_created}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-[#f9fafb] hover:bg-[#eff2ff] text-[#6b7280] hover:text-[#2e5bff] flex items-center justify-center transition-colors shrink-0 border border-[#e5e7eb]"
            aria-label="Close panel"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Tab bar */}
        {tabs.length > 1 && (
          <div className="flex gap-1 mt-4 border-t border-[#e5e7eb] -mx-6 px-6 pt-3">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 text-[12px] font-medium transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'border-[#2e5bff] text-[#2e5bff]'
                    : 'border-transparent text-[#9ca3af] hover:text-[#6b7280]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Scrollable content ───────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">

        {/* ── DETAILS TAB ── */}
        {activeTab === 'details' && (
          <div className="flex flex-col">
            {/* Image */}
            <div className="relative bg-[#f9fafb] overflow-hidden flex-shrink-0" style={{ height: 280 }}>
              {displayArtwork.image_url ? (
                <>
                  <img
                    src={displayArtwork.image_url}
                    alt={displayArtwork.title}
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/5 via-transparent to-transparent pointer-events-none" />
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-[#d1d5db]">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
              )}
            </div>

            {/* Metadata */}
            <div className="px-6 py-5 space-y-4">
              {displayArtwork.medium && (
                <p className="text-[12px] text-[#6b7280] italic">{displayArtwork.medium}</p>
              )}
              {displayArtwork.current_museum && (
                <div className="flex items-start gap-3">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0 text-[#2e5bff]">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  <span className="text-[12px] text-[#6b7280] leading-snug">{displayArtwork.current_museum}</span>
                </div>
              )}
              {displayArtwork.description && (
                <div className="pt-4 border-t border-[#e5e7eb]">
                  <p className="text-[13px] text-[#4b5563] leading-relaxed">{displayArtwork.description}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── NEARBY TAB ── */}
        {activeTab === 'nearby' && (
          <div className="px-4 py-3 space-y-2">
            {nearbyArtworks.length === 0 ? (
              <p className="text-sm text-[#9ca3af] text-center py-12">No nearby artworks</p>
            ) : (
              nearbyArtworks.map(a => (
                <button
                  key={a.id}
                  onClick={() => onSelect?.(a)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left border ${
                    a.id === selectedId
                      ? 'bg-[#eff2ff] border-[#2e5bff]/30'
                      : 'hover:bg-[#f9fafb] border-transparent'
                  }`}
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#f9fafb] shrink-0 border border-[#e5e7eb]">
                    {a.image_url ? (
                      <img src={a.image_url} alt={a.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#d1d5db]">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-[#111111] line-clamp-1">{a.title}</p>
                    {a.artist_display && (
                      <p className="text-[12px] text-[#6b7280] line-clamp-1">{a.artist_display}</p>
                    )}
                    {a.year && (
                      <p className="text-[11px] text-[#2e5bff] font-medium mt-0.5">{a.year}</p>
                    )}
                  </div>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#d1d5db] shrink-0">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              ))
            )}
            {/* Keyboard hint */}
            <p className="text-center text-[11px] text-[#9ca3af] pt-3">
              Use <kbd className="px-1 py-0.5 rounded border border-[#e5e7eb] font-mono text-[9px] text-[#6b7280]">←</kbd>{' '}
              <kbd className="px-1 py-0.5 rounded border border-[#e5e7eb] font-mono text-[9px] text-[#6b7280]">→</kbd> to navigate
            </p>
          </div>
        )}

        {/* ── CLUSTER TAB ── */}
        {activeTab === 'cluster' && clusterArtworks.length > 0 && (
          <div className="flex flex-col">
            {/* Current cluster artwork image */}
            <div className="relative bg-[#f9fafb] overflow-hidden flex-shrink-0" style={{ height: 260 }}>
              {clusterArtwork.image_url ? (
                <>
                  <img
                    src={clusterArtwork.image_url}
                    alt={clusterArtwork.title}
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/5 via-transparent to-transparent pointer-events-none" />
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-[#d1d5db]">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
              )}

              {/* Prev / Next arrows */}
              {clusterArtworks.length > 1 && (
                <>
                  <button
                    onClick={() => {
                      const i = Math.max(0, clusterIndex - 1);
                      setClusterIndex(i);
                      onSelect?.(clusterArtworks[i]);
                    }}
                    disabled={clusterIndex === 0}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/70 hover:bg-white disabled:opacity-25 text-[#111111] flex items-center justify-center transition-all border border-white"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      const i = Math.min(clusterArtworks.length - 1, clusterIndex + 1);
                      setClusterIndex(i);
                      onSelect?.(clusterArtworks[i]);
                    }}
                    disabled={clusterIndex === clusterArtworks.length - 1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/70 hover:bg-white disabled:opacity-25 text-[#111111] flex items-center justify-center transition-all border border-white"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                  {/* Counter */}
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center pointer-events-none">
                    <span className="text-[10px] text-[#111111] bg-white/80 px-2.5 py-0.5 rounded-full">
                      {clusterIndex + 1} / {clusterArtworks.length}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Cluster artwork metadata */}
            <div className="px-6 py-5 border-b border-[#e5e7eb] space-y-2">
              <h3 className="text-base font-semibold text-[#111111] line-clamp-2">{clusterArtwork.title}</h3>
              {clusterArtwork.artist_display && (
                <p className="text-[12px] text-[#6b7280]">{clusterArtwork.artist_display}</p>
              )}
              <div className="flex items-center gap-2.5 flex-wrap pt-1">
                {clusterArtwork.year && (
                  <span className="text-[11px] font-medium text-[#2e5bff] bg-[#eff2ff] px-2.5 py-1 rounded-lg">
                    {clusterArtwork.year}
                  </span>
                )}
                {clusterArtwork.medium && (
                  <span className="text-[11px] text-[#6b7280] italic">{clusterArtwork.medium}</span>
                )}
              </div>
              {clusterArtwork.description && (
                <p className="text-[12px] text-[#6b7280] leading-relaxed line-clamp-3 pt-2">
                  {clusterArtwork.description}
                </p>
              )}
            </div>

            {/* Artwork feed grid */}
            <div className="flex-1 flex flex-col min-h-0 px-6 py-4">
              <p className="text-[11px] uppercase tracking-widest text-[#9ca3af] mb-3 font-medium shrink-0">
                All {clusterArtworks.length} artworks
              </p>
              <div className="flex-1 min-h-0">
                <ArtworkClusterFeed
                  artworks={clusterArtworks}
                  onArtworkClick={(artwork) => {
                    const idx = clusterArtworks.findIndex(a => a.id === artwork.id);
                    if (idx !== -1) {
                      setClusterIndex(idx);
                      onSelect?.(artwork);
                    }
                  }}
                  containerWidth={384 - 48} // w-96 (384px) - px-6 x2 (48px)
                  containerHeight={400} // Approximate, will be dynamic
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default ArtworkDetailPanel;
export type { ArtworkCardData };
