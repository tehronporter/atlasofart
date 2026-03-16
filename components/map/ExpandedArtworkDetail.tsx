// components/map/ExpandedArtworkDetail.tsx
// Premium museum object detail view — expanded artwork exhibition panel
// Includes prev/next navigation through nearby artworks

'use client';

import { useEffect, useState } from 'react';
import { ArtworkCardData } from './FloatingArtworkCard';

function getHeroImageHeight(imageWidth: number | null | undefined, imageHeight: number | null | undefined): number {
  if (!imageWidth || !imageHeight) return 400;
  const aspectRatio = imageWidth / imageHeight;
  const maxWidth = 900;
  const calculatedHeight = maxWidth / aspectRatio;
  return Math.min(Math.max(calculatedHeight, 280), 480);
}

interface ExpandedArtworkDetailProps {
  artwork: ArtworkCardData;
  onClose?: () => void;
  // Prev/next navigation
  nearbyArtworks?: ArtworkCardData[];
  onNavigate?: (artwork: ArtworkCardData) => void;
}

export default function ExpandedArtworkDetail({
  artwork,
  onClose,
  nearbyArtworks = [],
  onNavigate,
}: ExpandedArtworkDetailProps) {
  const [isImageLoading, setIsImageLoading] = useState(!!artwork.image_url);
  const [imageLoadError, setImageLoadError] = useState(false);
  const heroImageHeight = getHeroImageHeight(artwork.image_width, artwork.image_height);

  // Reset image state when artwork changes
  useEffect(() => {
    setIsImageLoading(!!artwork.image_url);
    setImageLoadError(false);
  }, [artwork.id]);

  // Lock body scroll while open; keyboard shortcuts
  useEffect(() => {
    document.body.style.overflow = 'hidden';

    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose?.();
      if (e.key === 'ArrowRight' && nearbyArtworks.length > 0) {
        const idx = nearbyArtworks.findIndex(a => a.id === artwork.id);
        const next = nearbyArtworks[(idx + 1) % nearbyArtworks.length];
        if (next) onNavigate?.(next);
      }
      if (e.key === 'ArrowLeft' && nearbyArtworks.length > 0) {
        const idx = nearbyArtworks.findIndex(a => a.id === artwork.id);
        const prev = nearbyArtworks[(idx - 1 + nearbyArtworks.length) % nearbyArtworks.length];
        if (prev) onNavigate?.(prev);
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [artwork.id, nearbyArtworks, onClose, onNavigate]);

  const currentIndex = nearbyArtworks.findIndex(a => a.id === artwork.id);
  const hasPrev = nearbyArtworks.length > 0;
  const hasNext = nearbyArtworks.length > 0;
  const prevArtwork = hasPrev ? nearbyArtworks[(currentIndex - 1 + nearbyArtworks.length) % nearbyArtworks.length] : null;
  const nextArtwork = hasNext ? nearbyArtworks[(currentIndex + 1) % nearbyArtworks.length] : null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-3xl max-h-[92vh] rounded-2xl overflow-hidden border border-white/[0.1] shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-300"
          style={{ background: 'linear-gradient(180deg, #0f0f14 0%, #0a0a0f 60%, #05050a 100%)' }}
          onClick={e => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-9 h-9 rounded-xl bg-white/[0.07] hover:bg-white/[0.13] border border-white/[0.1] flex items-center justify-center text-white/50 hover:text-white/80 transition-all duration-200"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Keyboard hints */}
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
            {nearbyArtworks.length > 0 && (
              <div
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] text-neutral-600"
                style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <span className="font-mono text-neutral-500">←→</span>
                <span>navigate nearby</span>
              </div>
            )}
            <div
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] text-neutral-600"
              style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <span className="font-mono text-neutral-500">Esc</span>
              <span>close</span>
            </div>
          </div>

          {/* Hero image */}
          <div
            className="relative w-full bg-neutral-950/90 overflow-hidden shrink-0 flex items-center justify-center"
            style={{ height: `${heroImageHeight}px` }}
          >
            {isImageLoading && !imageLoadError && (
              <div className="absolute inset-0 bg-neutral-800/50 animate-pulse" />
            )}

            {artwork.image_url && !imageLoadError ? (
              <>
                <img
                  src={artwork.image_url}
                  alt={artwork.title}
                  className="w-full h-full object-contain"
                  crossOrigin="anonymous"
                  onLoad={() => setIsImageLoading(false)}
                  onError={() => { setIsImageLoading(false); setImageLoadError(true); }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 pointer-events-none" />
              </>
            ) : null}

            {(!artwork.image_url || imageLoadError) && (
              <div className="flex flex-col items-center justify-center text-neutral-700 gap-3">
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <span className="text-sm text-neutral-600">
                  {imageLoadError ? 'Image unavailable' : 'No image available'}
                </span>
              </div>
            )}
          </div>

          {/* Metadata — scrollable */}
          <div className="flex-1 overflow-y-auto" style={{ background: 'linear-gradient(180deg, #0f0f14 0%, #0a0a0f 100%)' }}>
            <div className="p-8 md:p-10 space-y-7">
              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-light text-white leading-tight tracking-tight">
                {artwork.title}
              </h1>

              {/* Artist + Date */}
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

              {/* Technical details */}
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

              {/* Museum */}
              {artwork.current_museum && (
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <p className="text-xs uppercase tracking-widest text-neutral-500 mb-2">Collection</p>
                  <p className="text-sm text-neutral-300">{artwork.current_museum}</p>
                </div>
              )}

              {/* Description */}
              {artwork.description && (
                <div className="pt-4 border-t border-white/[0.07]">
                  <p className="text-xs uppercase tracking-widest text-neutral-500 mb-4">About This Work</p>
                  <p className="text-base text-neutral-400 leading-relaxed line-clamp-6">{artwork.description}</p>
                </div>
              )}

              {/* Tags */}
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

              {/* Getty link */}
              {artwork.getty_url && (
                <div className="pt-4 border-t border-white/[0.07]">
                  <a
                    href={artwork.getty_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-neutral-900 font-medium rounded-lg transition-all duration-200 hover:shadow-lg text-sm"
                    onClick={e => e.stopPropagation()}
                  >
                    <span>View on Getty Museum</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* ── Prev / Next navigation bar ─────────────────────────────────────── */}
          {nearbyArtworks.length > 0 && (
            <div
              className="flex-none flex items-stretch border-t"
              style={{ borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(5,5,10,0.9)' }}
            >
              {/* Prev */}
              <button
                onClick={() => prevArtwork && onNavigate?.(prevArtwork)}
                disabled={!prevArtwork}
                className="flex-1 flex items-center gap-3 px-5 py-3.5 text-left hover:bg-white/[0.04] transition-colors disabled:opacity-30 border-r border-white/[0.05]"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-500 shrink-0">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                {prevArtwork && (
                  <div className="flex items-center gap-2.5 min-w-0">
                    {prevArtwork.image_url && (
                      <img src={prevArtwork.image_url} alt="" className="w-8 h-8 rounded object-cover shrink-0 opacity-70" />
                    )}
                    <div className="min-w-0">
                      <p className="text-[9px] text-neutral-600 uppercase tracking-widest mb-0.5">Previous</p>
                      <p className="text-[11px] text-neutral-400 truncate">{prevArtwork.title}</p>
                    </div>
                  </div>
                )}
              </button>

              {/* Nearby count */}
              <div className="flex items-center justify-center px-4">
                <span className="text-[9px] text-neutral-600 whitespace-nowrap">
                  {nearbyArtworks.length} nearby
                </span>
              </div>

              {/* Next */}
              <button
                onClick={() => nextArtwork && onNavigate?.(nextArtwork)}
                disabled={!nextArtwork}
                className="flex-1 flex items-center justify-end gap-3 px-5 py-3.5 text-right hover:bg-white/[0.04] transition-colors disabled:opacity-30 border-l border-white/[0.05]"
              >
                {nextArtwork && (
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="min-w-0">
                      <p className="text-[9px] text-neutral-600 uppercase tracking-widest mb-0.5 text-right">Next</p>
                      <p className="text-[11px] text-neutral-400 truncate">{nextArtwork.title}</p>
                    </div>
                    {nextArtwork.image_url && (
                      <img src={nextArtwork.image_url} alt="" className="w-8 h-8 rounded object-cover shrink-0 opacity-70" />
                    )}
                  </div>
                )}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-500 shrink-0">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
