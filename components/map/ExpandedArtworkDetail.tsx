// components/map/ExpandedArtworkDetail.tsx
// Full-screen expanded artwork detail view (overlay panel)

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
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Expanded panel */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-2xl max-h-[90vh] rounded-2xl overflow-hidden border border-white/[0.15] bg-[#0f0f14]/98 backdrop-blur-lg shadow-2xl flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Image section */}
          <div className="relative w-full h-[350px] bg-neutral-900 overflow-hidden shrink-0">
            {artwork.image_url ? (
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
            ) : null}
            <div
              className={`absolute inset-0 flex flex-col items-center justify-center text-neutral-700 ${
                artwork.image_url ? 'hidden' : ''
              }`}
            >
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span className="text-sm mt-4">No image available</span>
            </div>
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none" />
          </div>

          {/* Content section */}
          <div className="flex-1 overflow-y-auto p-8">
            <div className="space-y-6">
              {/* Title */}
              <div>
                <h1 className="text-4xl font-bold text-white leading-tight">
                  {artwork.title}
                </h1>
              </div>

              {/* Artist & Date */}
              <div className="space-y-3 pb-6 border-b border-white/[0.08]">
                {artwork.artist_display && (
                  <p className="text-lg text-neutral-300">{artwork.artist_display}</p>
                )}
                {artwork.year && (
                  <p className="text-base text-amber-400/90 font-medium">{artwork.year}</p>
                )}
              </div>

              {/* Medium & Dimensions */}
              {artwork.medium && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-neutral-500 mb-2">
                    Medium
                  </p>
                  <p className="text-base text-neutral-300">{artwork.medium}</p>
                </div>
              )}

              {/* Location */}
              {(artwork.place_created || artwork.current_museum) && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-neutral-500 mb-2">
                    Location
                  </p>
                  <div className="space-y-1">
                    {artwork.place_created && (
                      <div className="flex items-start gap-2.5 text-neutral-300">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-1.5 shrink-0">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span>{artwork.place_created}</span>
                      </div>
                    )}
                    {artwork.current_museum && (
                      <p className="text-sm text-neutral-400">{artwork.current_museum}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Description */}
              {artwork.description && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-neutral-500 mb-3">
                    About this work
                  </p>
                  <p className="text-base text-neutral-400 leading-relaxed">
                    {artwork.description}
                  </p>
                </div>
              )}

              {/* Tags */}
              {artwork.tags && artwork.tags.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-neutral-500 mb-3">
                    Categories
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {artwork.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 bg-white/[0.05] border border-white/[0.08] text-sm text-neutral-400 rounded-lg hover:bg-white/[0.08] transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Getty Link */}
              {artwork.getty_url && (
                <div className="pt-4 border-t border-white/[0.08]">
                  <a
                    href={artwork.getty_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-3 bg-amber-500 hover:bg-amber-400 text-neutral-900 font-medium rounded-lg transition-colors"
                    onClick={e => e.stopPropagation()}
                  >
                    <span>View on Getty Museum</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
