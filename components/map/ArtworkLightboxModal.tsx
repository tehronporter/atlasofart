// components/map/ArtworkLightboxModal.tsx
// Full-screen artwork lightbox — image, download, favorites, collections

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ArtworkCardData } from './FloatingArtworkCard';
import {
  addToFavorites,
  removeFromFavorites,
  isFavorited,
  getUserCollections,
  addToCollection,
  createCollection,
} from '@/lib/auth';

interface ArtworkLightboxModalProps {
  artwork: ArtworkCardData;
  onClose: () => void;
}

export default function ArtworkLightboxModal({ artwork, onClose }: ArtworkLightboxModalProps) {
  const [favorited, setFavorited]                     = useState(false);
  const [favLoading, setFavLoading]                   = useState(false);
  const [collections, setCollections]                 = useState<any[]>([]);
  const [showCollections, setShowCollections]         = useState(false);
  const [savedToCollections, setSavedToCollections]   = useState<Set<string>>(new Set());
  const [toast, setToast]                             = useState<string | null>(null);
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [newCollectionName, setNewCollectionName]     = useState('');
  const [isLoggedIn, setIsLoggedIn]                   = useState(false);
  const [imageLoaded, setImageLoaded]                 = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load auth state, favorites & collections on mount
  useEffect(() => {
    async function load() {
      try {
        const [favStatus, userCollections] = await Promise.all([
          isFavorited(artwork.id),
          getUserCollections(),
        ]);
        setFavorited(favStatus);
        setCollections(userCollections ?? []);
        setIsLoggedIn(true);

        // Pre-mark collections that already contain this artwork
        const savedIds = new Set<string>();
        for (const col of userCollections ?? []) {
          const hasItem = col.items?.some(
            (item: any) =>
              item.artwork?.id === artwork.id ||
              (item.artwork as any)?.id === artwork.id
          );
          if (hasItem) savedIds.add(col.id);
        }
        setSavedToCollections(savedIds);
      } catch {
        setIsLoggedIn(false);
      }
    }
    load();
  }, [artwork.id]);

  // Keyboard: Escape to close
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  function showToast(msg: string) {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(msg);
    toastTimerRef.current = setTimeout(() => setToast(null), 2500);
  }

  const handleToggleFavorite = useCallback(async () => {
    if (!isLoggedIn) { showToast('Sign in to save favorites'); return; }
    setFavLoading(true);
    try {
      if (favorited) {
        await removeFromFavorites(artwork.id);
        setFavorited(false);
        showToast('Removed from favorites');
      } else {
        await addToFavorites(artwork.id);
        setFavorited(true);
        showToast('Added to favorites ♥');
      }
    } catch {
      showToast('Failed to update favorites');
    } finally {
      setFavLoading(false);
    }
  }, [favorited, isLoggedIn, artwork.id]);

  const handleAddToCollection = useCallback(async (collectionId: string, collectionName: string) => {
    if (savedToCollections.has(collectionId)) return;
    try {
      await addToCollection(collectionId, artwork.id);
      setSavedToCollections(prev => new Set([...prev, collectionId]));
      showToast(`Added to "${collectionName}"`);
    } catch {
      showToast('Failed to add to collection');
    }
  }, [artwork.id, savedToCollections]);

  const handleCreateAndAdd = useCallback(async () => {
    const name = newCollectionName.trim();
    if (!name) return;
    try {
      const newCol = await createCollection(name);
      await addToCollection(newCol.id, artwork.id);
      setCollections(prev => [newCol, ...prev]);
      setSavedToCollections(prev => new Set([...prev, newCol.id]));
      setNewCollectionName('');
      setIsCreatingCollection(false);
      showToast(`Added to "${newCol.name}"`);
    } catch {
      showToast('Failed to create collection');
    }
  }, [newCollectionName, artwork.id]);

  function handleDownload() {
    if (!artwork.image_url) return;
    // Open in new tab (external images block direct download via CORS)
    window.open(artwork.image_url, '_blank', 'noopener,noreferrer');
    showToast('Opening full-size image…');
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/92 backdrop-blur-sm z-[60]"
        onClick={onClose}
      />

      {/* Modal container */}
      <div className="fixed inset-0 z-[61] flex flex-col pointer-events-none">

        {/* ── Top bar ───────────────────────────────────────────────── */}
        <div className="pointer-events-auto shrink-0 flex items-center justify-between px-5 pt-5 pb-3">
          <div className="min-w-0 flex-1 pr-4">
            <h2 className="text-white font-semibold text-[15px] leading-snug line-clamp-1">
              {artwork.title}
            </h2>
            {artwork.artist_display && (
              <p className="text-white/50 text-[12px] mt-0.5 line-clamp-1">
                {artwork.artist_display}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="shrink-0 w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors border border-white/15 text-white"
            aria-label="Close lightbox"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* ── Image area ────────────────────────────────────────────── */}
        <div className="pointer-events-auto flex-1 flex items-center justify-center px-6 min-h-0">
          {artwork.image_url ? (
            <div className="relative max-w-full max-h-full">
              {!imageLoaded && (
                <div className="absolute inset-0 bg-white/5 animate-pulse rounded-xl" />
              )}
              <img
                src={artwork.image_url}
                alt={artwork.title}
                className={`max-w-full object-contain rounded-xl shadow-2xl transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                style={{ maxHeight: 'calc(100vh - 200px)' }}
                onLoad={() => setImageLoaded(true)}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 text-white/30">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span className="text-sm">No image available</span>
            </div>
          )}
        </div>

        {/* ── Action bar ────────────────────────────────────────────── */}
        <div className="pointer-events-auto shrink-0 px-5 pb-6 pt-3">
          <div className="flex items-center gap-2.5 flex-wrap">

            {/* ♥ Favorite */}
            <button
              onClick={handleToggleFavorite}
              disabled={favLoading}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all border ${
                favorited
                  ? 'bg-red-500/20 border-red-400/40 text-red-400 hover:bg-red-500/30'
                  : 'bg-white/10 border-white/15 text-white hover:bg-white/20'
              }`}
            >
              <svg
                width="14" height="14" viewBox="0 0 24 24"
                fill={favorited ? 'currentColor' : 'none'}
                stroke="currentColor" strokeWidth="2"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {favorited ? 'Saved' : 'Favorite'}
            </button>

            {/* 📂 Collections */}
            <div className="relative">
              <button
                onClick={() => setShowCollections(v => !v)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium bg-white/10 border border-white/15 text-white hover:bg-white/20 transition-all"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
                Collections
                {savedToCollections.size > 0 && (
                  <span className="bg-[#2e5bff] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold leading-none">
                    {savedToCollections.size}
                  </span>
                )}
              </button>

              {/* Collection picker dropdown */}
              {showCollections && (
                <div className="absolute bottom-full left-0 mb-2 w-64 bg-white rounded-xl shadow-2xl border border-[#e5e7eb] overflow-hidden z-10">
                  <div className="px-4 py-3 border-b border-[#e5e7eb] flex items-center justify-between">
                    <p className="text-[12px] font-semibold text-[#111111]">Add to Collection</p>
                    <button
                      onClick={() => setShowCollections(false)}
                      className="text-[#9ca3af] hover:text-[#6b7280]"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>

                  {!isLoggedIn ? (
                    <div className="px-4 py-4 text-center">
                      <p className="text-[12px] text-[#6b7280] mb-2">Sign in to use collections</p>
                      <a
                        href="/login"
                        className="inline-block px-4 py-2 bg-[#2e5bff] text-white text-[12px] rounded-lg font-medium hover:bg-[#1a3acc] transition-colors"
                      >
                        Sign In
                      </a>
                    </div>
                  ) : (
                    <>
                      <div className="max-h-48 overflow-y-auto">
                        {collections.length === 0 ? (
                          <p className="px-4 py-3 text-[12px] text-[#9ca3af]">No collections yet — create one below</p>
                        ) : (
                          collections.map(col => {
                            const isSaved = savedToCollections.has(col.id);
                            return (
                              <button
                                key={col.id}
                                onClick={() => handleAddToCollection(col.id, col.name)}
                                disabled={isSaved}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                                  isSaved
                                    ? 'text-[#2e5bff] bg-[#eff2ff] cursor-default'
                                    : 'text-[#111111] hover:bg-[#f9fafb]'
                                }`}
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-[#9ca3af]">
                                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                                </svg>
                                <span className="flex-1 text-[13px] line-clamp-1">{col.name}</span>
                                {isSaved ? (
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0 text-[#2e5bff]">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                ) : (
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-[#d1d5db]">
                                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                                  </svg>
                                )}
                              </button>
                            );
                          })
                        )}
                      </div>

                      {/* Create new collection */}
                      <div className="border-t border-[#e5e7eb] p-2">
                        {isCreatingCollection ? (
                          <div className="flex gap-2">
                            <input
                              autoFocus
                              value={newCollectionName}
                              onChange={e => setNewCollectionName(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') handleCreateAndAdd();
                                if (e.key === 'Escape') setIsCreatingCollection(false);
                              }}
                              placeholder="Collection name…"
                              className="flex-1 px-2.5 py-1.5 text-[12px] border border-[#e5e7eb] rounded-lg focus:outline-none focus:border-[#2e5bff] text-[#111111]"
                            />
                            <button
                              onClick={handleCreateAndAdd}
                              className="px-3 py-1.5 bg-[#2e5bff] text-white text-[12px] rounded-lg hover:bg-[#1a3acc] transition-colors font-medium"
                            >
                              Create
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setIsCreatingCollection(true)}
                            className="w-full flex items-center gap-2 px-2.5 py-2 text-[12px] text-[#2e5bff] hover:bg-[#eff2ff] rounded-lg transition-colors font-medium"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <line x1="12" y1="5" x2="12" y2="19" />
                              <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            New Collection
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* ⬇️ Download / Open full size */}
            {artwork.image_url && (
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium bg-white/10 border border-white/15 text-white hover:bg-white/20 transition-all"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Full Size
              </button>
            )}

            {/* Meta pill */}
            <div className="ml-auto flex items-center gap-2">
              {artwork.year && (
                <span className="text-[11px] bg-white/10 text-white/60 px-2.5 py-1 rounded-lg border border-white/10">
                  {artwork.year}
                </span>
              )}
              {artwork.place_created && (
                <span className="text-[11px] text-white/40 hidden sm:block truncate max-w-[140px]">
                  📍 {artwork.place_created}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Toast notification ────────────────────────────────────── */}
      {toast && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[70] px-5 py-2.5 bg-[#111111] text-white text-[13px] rounded-xl shadow-2xl border border-white/10 pointer-events-none whitespace-nowrap">
          {toast}
        </div>
      )}
    </>
  );
}
