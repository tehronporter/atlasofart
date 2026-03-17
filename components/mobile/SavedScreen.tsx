// components/mobile/SavedScreen.tsx
// Mobile full-screen saved artworks list

'use client';

import { type ArtworkCardData } from '../map/FloatingArtworkCard';

interface SavedScreenProps {
  artworks: ArtworkCardData[];
  savedIds: Set<string>;
  onSelectArtwork: (artwork: ArtworkCardData) => void;
  onToggleSave: (artwork: ArtworkCardData) => void;
}

export default function SavedScreen({ artworks, savedIds, onSelectArtwork, onToggleSave }: SavedScreenProps) {
  const savedArtworks = artworks.filter(a => savedIds.has(a.id));

  return (
    <div className="fixed inset-0 bg-white z-30 flex flex-col lg:hidden" style={{ paddingBottom: 'max(4rem, calc(4rem + env(safe-area-inset-bottom)))' }}>
      {/* Header */}
      <div className="px-5 pt-14 pb-4 border-b border-[#e5e7eb] shrink-0">
        <h1 className="text-[20px] font-semibold text-[#111111]">Saved</h1>
        <p className="text-[13px] text-[#9ca3af] mt-0.5">
          {savedArtworks.length === 0 ? 'No saved artworks yet' : `${savedArtworks.length} artwork${savedArtworks.length === 1 ? '' : 's'}`}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {savedArtworks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-8 text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#f9fafb] flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#d1d5db]">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <div>
              <p className="text-[15px] font-medium text-[#111111]">No saved artworks</p>
              <p className="text-[13px] text-[#9ca3af] mt-1 leading-relaxed">Tap the heart on any artwork to save it here for later.</p>
            </div>
          </div>
        ) : (
          <div className="px-5 py-4 space-y-2">
            {savedArtworks.map((artwork) => (
              <div
                key={artwork.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-[#f9fafb] active:bg-[#eff2ff] transition-colors"
              >
                {/* Thumbnail */}
                <button
                  onClick={() => onSelectArtwork(artwork)}
                  className="w-14 h-14 rounded-lg overflow-hidden bg-[#ebebeb] shrink-0"
                >
                  {artwork.image_url ? (
                    <img src={artwork.image_url} alt={artwork.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#d1d5db]">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                      </svg>
                    </div>
                  )}
                </button>

                {/* Info */}
                <button
                  onClick={() => onSelectArtwork(artwork)}
                  className="min-w-0 flex-1 text-left"
                >
                  <p className="text-[13px] font-medium text-[#111111] line-clamp-1">{artwork.title}</p>
                  {artwork.artist_display && (
                    <p className="text-[11px] text-[#6b7280] line-clamp-1 mt-0.5">{artwork.artist_display}</p>
                  )}
                  {artwork.year && (
                    <p className="text-[10px] text-[#2e5bff] font-medium mt-1">{artwork.year}</p>
                  )}
                </button>

                {/* Unsave button */}
                <button
                  onClick={() => onToggleSave(artwork)}
                  className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-[#eff2ff] text-[#2e5bff] active:scale-90 transition-transform"
                  aria-label="Remove from saved"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
