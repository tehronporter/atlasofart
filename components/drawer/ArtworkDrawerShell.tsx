// ArtworkDrawerShell.tsx - Detail panel with generic type
// Phase 13: Supabase-compatible

'use client';

import { findRelatedWorks, getRelationshipReasons } from '@/lib/related-works';
import { useMemo } from 'react';

interface ArtworkData {
  id: string;
  title: string;
  year: string;
  year_start: number;
  year_end: number;
  culture: string | null;
  region: string | null;
  medium: string | null;
  place_created: string | null;
  tags: string[] | null;
  description: string | null;
  current_museum: string | null;
  image_url: string | null;
}

interface ArtworkDrawerShellProps {
  artwork: ArtworkData | null;
  isOpen: boolean;
  onClose: () => void;
  onArtworkSelect?: (artwork: ArtworkData) => void;
  allArtworks?: ArtworkData[];
}

export default function ArtworkDrawerShell({ 
  artwork, 
  isOpen, 
  onClose,
  onArtworkSelect,
  allArtworks = []
}: ArtworkDrawerShellProps) {
  if (!artwork) return null;

  const relatedWorks = useMemo(() => {
    return findRelatedWorks(artwork, allArtworks, { maxResults: 3 });
  }, [artwork, allArtworks]);

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 z-40 sm:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-neutral-900 border-l border-neutral-800 transform transition-transform duration-300 ease-in-out z-50 overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white z-10 p-2"
          aria-label="Close"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="min-h-full flex flex-col">
          <div className="w-full h-48 sm:h-64 bg-neutral-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {artwork.image_url && artwork.image_url !== '/placeholder.jpg' ? (
              <img src={artwork.image_url} alt={artwork.title} className="w-full h-full object-contain bg-black" />
            ) : (
              <div className="text-neutral-500 text-center px-4">
                <svg className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-xs sm:text-sm">Image not available</p>
              </div>
            )}
          </div>

          <div className="flex-1 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-2">{artwork.title}</h2>
            <p className="text-amber-500 text-xs sm:text-sm font-medium mb-4">{artwork.year}</p>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:block sm:space-y-4">
                {artwork.culture && (
                  <div>
                    <h3 className="text-[10px] sm:text-xs uppercase tracking-wide text-neutral-500 mb-1">Culture</h3>
                    <p className="text-neutral-200 text-xs sm:text-sm">{artwork.culture}</p>
                  </div>
                )}
                {artwork.region && (
                  <div>
                    <h3 className="text-[10px] sm:text-xs uppercase tracking-wide text-neutral-500 mb-1">Region</h3>
                    <p className="text-neutral-200 text-xs sm:text-sm">{artwork.region}</p>
                  </div>
                )}
                {artwork.place_created && (
                  <div>
                    <h3 className="text-[10px] sm:text-xs uppercase tracking-wide text-neutral-500 mb-1">Place</h3>
                    <p className="text-neutral-200 text-xs sm:text-sm">{artwork.place_created}</p>
                  </div>
                )}
                {artwork.medium && (
                  <div>
                    <h3 className="text-[10px] sm:text-xs uppercase tracking-wide text-neutral-500 mb-1">Medium</h3>
                    <p className="text-neutral-200 text-xs sm:text-sm">{artwork.medium}</p>
                  </div>
                )}
              </div>

              {artwork.current_museum && (
                <div>
                  <h3 className="text-[10px] sm:text-xs uppercase tracking-wide text-neutral-500 mb-1">Location</h3>
                  <p className="text-neutral-200 text-xs sm:text-sm">{artwork.current_museum}</p>
                </div>
              )}

              {artwork.tags && artwork.tags.length > 0 && (
                <div>
                  <h3 className="text-[10px] sm:text-xs uppercase tracking-wide text-neutral-500 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {artwork.tags.map((tag, i) => (
                      <span key={i} className="px-2 py-1 bg-neutral-800 text-neutral-400 text-[10px] sm:text-xs rounded">{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              {artwork.description && (
                <div>
                  <h3 className="text-[10px] sm:text-xs uppercase tracking-wide text-neutral-500 mb-2">Description</h3>
                  <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed">{artwork.description}</p>
                </div>
              )}

              {relatedWorks.length > 0 && (
                <div className="pt-4 border-t border-neutral-800 mt-4">
                  <h3 className="text-xs sm:text-sm font-semibold text-neutral-300 mb-3">Related Works</h3>
                  <div className="space-y-2 sm:space-y-3">
                    {relatedWorks.map((related) => {
                      const reasons = getRelationshipReasons(artwork, related);
                      return (
                        <div 
                          key={related.id}
                          className="p-2.5 sm:p-3 bg-neutral-800/50 rounded-lg cursor-pointer hover:bg-neutral-800 transition-colors"
                          onClick={() => onArtworkSelect?.(related as any)}
                        >
                          <h4 className="text-xs sm:text-sm font-medium text-neutral-200">{related.title}</h4>
                          <p className="text-[10px] sm:text-xs text-amber-500 mt-1">{related.year}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {reasons.slice(0, 2).map((reason, i) => (
                              <span key={i} className="text-[9px] sm:text-[10px] text-neutral-500 bg-neutral-800 px-1.5 py-0.5 rounded">{reason}</span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
