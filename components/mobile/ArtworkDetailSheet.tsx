// components/mobile/ArtworkDetailSheet.tsx
// Mobile bottom sheet content for artwork details with tabs (Details/Nearby/Cluster)

'use client';

import { useState, useEffect } from 'react';
import { type ArtworkCardData } from '../map/FloatingArtworkCard';
import ArtworkClusterFeed from '../map/ArtworkClusterFeed';

type Tab = 'details' | 'nearby' | 'cluster';

interface ArtworkDetailSheetProps {
  artwork: ArtworkCardData | null;
  clusterArtworks: ArtworkCardData[];
  nearbyArtworks: ArtworkCardData[];
  selectedId?: string | null;
  onSelect?: (artwork: ArtworkCardData) => void;
}

export default function ArtworkDetailSheet({
  artwork,
  clusterArtworks,
  nearbyArtworks,
  selectedId,
  onSelect,
}: ArtworkDetailSheetProps) {
  const [activeTab, setActiveTab] = useState<Tab>('details');
  const [clusterIndex, setClusterIndex] = useState(0);

  // Reset to details when selected artwork changes
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

  if (!artwork) return null;

  const clusterArtwork = clusterArtworks[clusterIndex] ?? artwork;

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'details', label: 'Details' },
    ...(nearbyArtworks.length > 0 ? [{ id: 'nearby' as Tab, label: 'Nearby', count: nearbyArtworks.length }] : []),
    ...(clusterArtworks.length > 0 ? [{ id: 'cluster' as Tab, label: 'Cluster', count: clusterArtworks.length }] : []),
  ];

  return (
    <div className="w-full h-full flex flex-col bg-white">
      {/* Tab Bar */}
      {tabs.length > 1 && (
        <div className="flex gap-1 border-b border-[#e5e7eb] px-6 pt-3 pb-0 shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-0 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'text-[#2e5bff] border-[#2e5bff]'
                  : 'text-[#9ca3af] border-transparent hover:text-[#6b7280]'
              }`}
            >
              {tab.label} {tab.count && <span className="text-[11px] ml-1">({tab.count})</span>}
            </button>
          ))}
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {/* ── DETAILS TAB ── */}
        {activeTab === 'details' && (
          <div className="space-y-4">
            {/* Image */}
            {artwork.image_url ? (
              <img src={artwork.image_url} alt={artwork.title} className="w-full rounded-lg" />
            ) : (
              <div className="w-full aspect-square bg-[#f9fafb] rounded-lg flex items-center justify-center">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-[#d1d5db]">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
            )}

            {/* Metadata */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-[#111111]">{artwork.title}</h3>

              {artwork.artist_display && (
                <p className="text-sm text-[#6b7280]">{artwork.artist_display}</p>
              )}

              <div className="flex flex-wrap gap-2">
                {artwork.year && (
                  <span className="text-xs font-medium bg-[#eff2ff] text-[#2e5bff] px-2.5 py-1 rounded-lg">
                    {artwork.year}
                  </span>
                )}
                {artwork.place_created && (
                  <span className="text-xs text-[#6b7280]">📍 {artwork.place_created}</span>
                )}
              </div>

              {artwork.medium && (
                <div className="text-xs">
                  <p className="text-[#9ca3af] font-medium">Medium</p>
                  <p className="text-[#6b7280]">{artwork.medium}</p>
                </div>
              )}

              {artwork.current_museum && (
                <div className="text-xs">
                  <p className="text-[#9ca3af] font-medium">Museum</p>
                  <p className="text-[#6b7280]">{artwork.current_museum}</p>
                </div>
              )}

              {artwork.description && (
                <p className="text-sm text-[#6b7280] leading-relaxed">{artwork.description}</p>
              )}
            </div>
          </div>
        )}

        {/* ── NEARBY TAB ── */}
        {activeTab === 'nearby' && nearbyArtworks.length > 0 && (
          <div className="space-y-2">
            {nearbyArtworks.map((a) => (
              <button
                key={a.id}
                onClick={() => onSelect?.(a)}
                className="w-full flex items-start gap-3 p-3 rounded-lg bg-[#f9fafb] hover:bg-[#eff2ff] transition-colors border border-[#e5e7eb] text-left"
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
                  <p className="text-xs font-semibold text-[#111111] line-clamp-1">{a.title}</p>
                  {a.artist_display && (
                    <p className="text-[11px] text-[#6b7280] line-clamp-1">{a.artist_display}</p>
                  )}
                  {a.year && <p className="text-[10px] text-[#2e5bff] font-medium mt-0.5">{a.year}</p>}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* ── CLUSTER TAB ── */}
        {activeTab === 'cluster' && clusterArtworks.length > 0 && (
          <div className="space-y-3">
            {/* Current cluster artwork preview */}
            <div className="rounded-lg overflow-hidden bg-[#f9fafb]">
              {clusterArtwork.image_url ? (
                <img src={clusterArtwork.image_url} alt={clusterArtwork.title} className="w-full h-48 object-contain" />
              ) : (
                <div className="w-full h-48 flex items-center justify-center">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-[#d1d5db]">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
              )}
            </div>

            {/* Cluster metadata */}
            <div className="text-xs">
              <h4 className="font-semibold text-[#111111]">{clusterArtwork.title}</h4>
              {clusterArtwork.artist_display && (
                <p className="text-[#6b7280]">{clusterArtwork.artist_display}</p>
              )}
              {clusterArtwork.year && (
                <p className="text-[#2e5bff] font-medium mt-1">{clusterArtwork.year}</p>
              )}
            </div>

            {/* Cluster grid */}
            <div className="pt-2">
              <p className="text-[11px] uppercase tracking-widest text-[#9ca3af] mb-3 font-medium">
                All {clusterArtworks.length} artworks
              </p>
              <div className="grid grid-cols-3 gap-2">
                {clusterArtworks.map((a, idx) => (
                  <button
                    key={a.id}
                    onClick={() => {
                      setClusterIndex(idx);
                      onSelect?.(a);
                    }}
                    className={`relative aspect-square rounded-lg overflow-hidden transition-all border ${
                      idx === clusterIndex
                        ? 'ring-2 ring-[#2e5bff] border-[#2e5bff]'
                        : 'opacity-60 hover:opacity-90 border-[#e5e7eb]'
                    }`}
                  >
                    {a.image_url ? (
                      <img src={a.image_url} alt={a.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[#f9fafb] flex items-center justify-center">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#d1d5db]">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                        </svg>
                      </div>
                    )}
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
