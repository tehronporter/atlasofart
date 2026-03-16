// components/map/ExpandedArtworkDetail.tsx
// Premium museum object detail view — expanded artwork exhibition panel

'use client';

import { useEffect } from 'react';

interface ArtworkData {
  id: string;
  lat: number;
  lng: number;
  title: string;
  image_url: string | null;
  artist_display: string | null;
  year: string;
  place_created: string | null;
  current_museum: string | null;
  medium: string | null;
  tags: string[];
  description: string | null;
  getty_url?: string;
}

interface ExpandedArtworkDetailProps {
  artwork: ArtworkData;
  onClose?: () => void;
}

export default function ExpandedArtworkDetail({
  artwork,
  onClose,
}: ExpandedArtworkDetailProps) {
  // Prevent scroll on body when overlay is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <>
      {/* Backdrop — soft dark with blur */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Expanded panel — premium exhibit viewer */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-3xl max-h-[92vh] rounded-2xl overflow-hidden border border-white/[0.12] bg-gradient-to-b from-[#0f0f14] via-[#0a0a0f] to-[#05050a] backdrop-blur-xl shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-300"
          onClick={e => e.stopPropagation()}
        >
          {/* Close button — integrated top right */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 z-10 w-10 h-10 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.1] flex items-center justify-center text-white/50 hover:text-white/80 transition-all duration-200 backdrop-blur"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* ── Image section — hero ─────────────────────────────────────────────── */}
          <div className="relative w-full bg-neutral-950/90 overflow-hidden shrink-0 flex items-center justify-center" style={{ height: '420px' }}>
            {artwork.image_url ? (
              <>
                <img
                  src={artwork.image_url}
                  alt={artwork.title}
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                  onError={e => {
                    const el = e.target as HTMLImageElement;
                    el.style.display = 'none';
                    el.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                {/* Subtle overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 pointer-events-none" />
              </>
            ) : null}
            <div
              className={`absolute inset-0 flex flex-col items-center justify-center text-neutral-700 ${
                artwork.image_url ? 'hidden' : ''
              }`}
            >
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span className="text-sm mt-4 text-neutral-600">No image available</span>
            </div>
          </div>

          {/* ── Metadata section — editorial layout ────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#0f0f14] to-[#0a0a0f]">
            <div className="p-10 space-y-8">
              {/* ── Title ──────────────────────────────────────────────────────────── */}
              <div className="space-y-2">
                <h1 className="text-5xl font-light text-white leading-tight tracking-tight">
                  {artwork.title}
                </h1>
              </div>

              {/* ── Artist & Primary Info ──────────────────────────────────────────── */}
              <div className="space-y-4 pb-6 border-b border-white/[0.07]">
                {artwork.artist_display && (
                  <div>
                    <p className="text-xs uppercase tracking-widest text-neutral-500 mb-1.5">Artist</p>
                    <p className="text-xl text-neutral-100 font-light">{artwork.artist_display}</p>
                  </div>
                )}
                {artwork.year && (
                  <div>
                    <p className="text-xs uppercase tracking-widest text-neutral-500 mb-1.5">Date</p>
                    <p className="text-lg text-amber-400/95 font-light">{artwork.year}</p>
                  </div>
                )}
              </div>

              {/* ── Technical Details ──────────────────────────────────────────────── */}
              <div className="grid grid-cols-2 gap-8">
                {artwork.medium && (
                  <div>
                    <p className="text-xs uppercase tracking-widest text-neutral-500 mb-2">Medium</p>
                    <p className="text-sm text-neutral-300 leading-relaxed">{artwork.medium}</p>
                  </div>
                )}
                {artwork.place_created && (
                  <div>
                    <p className="text-xs uppercase tracking-widest text-neutral-500 mb-2">Place Created</p>
                    <p className="text-sm text-neutral-300">{artwork.place_created}</p>
                  </div>
                )}
              </div>

              {/* ── Museum Info ───────────────────────────────────────────────────── */}
              {artwork.current_museum && (
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <p className="text-xs uppercase tracking-widest text-neutral-500 mb-2">Collection</p>
                  <p className="text-sm text-neutral-300">{artwork.current_museum}</p>
                </div>
              )}

              {/* ── Description ────────────────────────────────────────────────────── */}
              {artwork.description && (
                <div className="pt-4 border-t border-white/[0.07]">
                  <p className="text-xs uppercase tracking-widest text-neutral-500 mb-4">About This Work</p>
                  <p className="text-base text-neutral-400 leading-relaxed line-clamp-6">
                    {artwork.description}
                  </p>
                </div>
              )}

              {/* ── Tags / Classification ──────────────────────────────────────────── */}
              {artwork.tags && artwork.tags.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-neutral-500 mb-3">Categories</p>
                  <div className="flex flex-wrap gap-2">
                    {artwork.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.07] text-xs text-neutral-400 rounded-lg transition-all duration-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Museum Link ────────────────────────────────────────────────────── */}
              {artwork.getty_url && (
                <div className="pt-4 border-t border-white/[0.07]">
                  <a
                    href={artwork.getty_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-neutral-900 font-medium rounded-lg transition-all duration-200 hover:shadow-lg"
                    onClick={e => e.stopPropagation()}
                  >
                    <span>View on Getty Museum</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
