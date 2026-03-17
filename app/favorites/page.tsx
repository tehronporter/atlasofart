// app/favorites/page.tsx — Favorites page, brand palette

'use client';

import { useState, useEffect } from 'react';
import { getUserFavorites, removeFromFavorites } from '@/lib/auth';

type SortOption = 'recent' | 'oldest' | 'alphabetical';

export default function FavoritesPage() {
  const [favorites, setFavorites]       = useState<any[]>([]);
  const [sortBy, setSortBy]             = useState<SortOption>('recent');
  const [filterRegion, setFilterRegion] = useState('');
  const [isLoading, setIsLoading]       = useState(true);
  const [regions, setRegions]           = useState<string[]>([]);
  const [removing, setRemoving]         = useState<Set<string>>(new Set());

  useEffect(() => { loadFavorites(); }, []);

  async function loadFavorites() {
    setIsLoading(true);
    try {
      const data = await getUserFavorites();
      setFavorites(data);
      const uniqueRegions = [...new Set(data.map((f: any) => f.artwork?.region).filter(Boolean))] as string[];
      setRegions(uniqueRegions);
    } catch {
      setFavorites([]);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRemove(artworkId: string) {
    setRemoving(prev => new Set([...prev, artworkId]));
    try {
      await removeFromFavorites(artworkId);
      setFavorites(prev => prev.filter(f => f.artwork?.id !== artworkId && f.artwork_id !== artworkId));
    } catch {
      alert('Failed to remove');
    } finally {
      setRemoving(prev => { const s = new Set(prev); s.delete(artworkId); return s; });
    }
  }

  function sortFavorites(items: any[]) {
    const sorted = [...items];
    switch (sortBy) {
      case 'recent':       return sorted.reverse();
      case 'oldest':       return sorted;
      case 'alphabetical': return sorted.sort((a, b) => (a.artwork?.title || '').localeCompare(b.artwork?.title || ''));
      default:             return sorted;
    }
  }

  const filtered = favorites.filter(fav => !filterRegion || fav.artwork?.region === filterRegion);
  const sorted   = sortFavorites(filtered);

  return (
    <div className="min-h-screen bg-[#f9fafb]">

      {/* ── Top nav ────────────────────────────────────────────── */}
      <nav className="bg-white border-b border-[#e5e7eb] sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center gap-3">
          <a
            href="/"
            className="w-8 h-8 rounded-lg bg-[#f9fafb] hover:bg-[#eff2ff] border border-[#e5e7eb] flex items-center justify-center transition-colors text-[#6b7280] hover:text-[#2e5bff]"
            aria-label="Back to map"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </a>
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-md bg-[#2e5bff] flex items-center justify-center shrink-0">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
            <span className="text-[13px] text-[#9ca3af] font-normal">Atlas of Art</span>
            <span className="text-[#d1d5db]">/</span>
            <span className="text-[13px] font-semibold text-[#111111] truncate">Favorites</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <a href="/collections" className="text-[12px] text-[#6b7280] hover:text-[#2e5bff] transition-colors hidden sm:block">
              Collections
            </a>
            <a
              href="/collections"
              className="px-3 py-1.5 text-[12px] font-medium bg-[#2e5bff] text-white rounded-lg hover:bg-[#1a3acc] transition-colors"
            >
              My Collections
            </a>
          </div>
        </div>
      </nav>

      {/* ── Content ────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Page header */}
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-[#111111] mb-1">My Favorites</h1>
          <p className="text-[13px] text-[#6b7280]">
            {isLoading ? 'Loading…' : `${favorites.length} saved artwork${favorites.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Explainer */}
        <div className="mb-6 p-4 bg-white rounded-xl border border-[#e5e7eb] flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#eff2ff] flex items-center justify-center shrink-0 mt-0.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2e5bff" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[#111111]">Quick saves — your personal bookmarks</p>
            <p className="text-[12px] text-[#6b7280] mt-0.5">
              Favorites are a fast way to bookmark artworks you love. For curated, named groups use{' '}
              <a href="/collections" className="text-[#2e5bff] hover:underline">Collections</a>.
            </p>
          </div>
        </div>

        {/* Controls */}
        {favorites.length > 0 && (
          <div className="mb-5 flex flex-wrap gap-3 items-center">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortOption)}
              className="px-3 py-2 bg-white border border-[#e5e7eb] rounded-lg text-[#111111] text-[13px] focus:outline-none focus:border-[#2e5bff] focus:ring-2 focus:ring-[#2e5bff]/10"
            >
              <option value="recent">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="alphabetical">A – Z</option>
            </select>

            {regions.length > 0 && (
              <select
                value={filterRegion}
                onChange={e => setFilterRegion(e.target.value)}
                className="px-3 py-2 bg-white border border-[#e5e7eb] rounded-lg text-[#111111] text-[13px] focus:outline-none focus:border-[#2e5bff] focus:ring-2 focus:ring-[#2e5bff]/10"
              >
                <option value="">All regions</option>
                {regions.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            )}

            {(filterRegion || sortBy !== 'recent') && (
              <button
                onClick={() => { setSortBy('recent'); setFilterRegion(''); }}
                className="text-[12px] text-[#9ca3af] hover:text-[#6b7280] transition-colors ml-auto"
              >
                Reset filters
              </button>
            )}
          </div>
        )}

        {/* Loading */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-white rounded-xl border border-[#e5e7eb] overflow-hidden animate-pulse">
                <div className="h-48 bg-[#f3f4f6]" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-[#f3f4f6] rounded w-3/4" />
                  <div className="h-3 bg-[#f3f4f6] rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-[#eff2ff] flex items-center justify-center mx-auto mb-5">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2e5bff" strokeWidth="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-[#111111] mb-2">
              {favorites.length === 0 ? 'No favorites yet' : 'No results match your filters'}
            </h3>
            <p className="text-[13px] text-[#6b7280] mb-5">
              {favorites.length === 0
                ? 'Explore the map and double-click an artwork to save it here'
                : 'Try adjusting your sort or region filter'}
            </p>
            {favorites.length === 0 && (
              <a
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2e5bff] text-white text-[13px] font-medium rounded-xl hover:bg-[#1a3acc] transition-colors"
              >
                Explore the Map
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </a>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {sorted.map(fav => {
              const art = fav.artwork;
              const artId = art?.id || fav.artwork_id;
              const isRemoving = removing.has(artId);
              return (
                <div
                  key={fav.id}
                  className="bg-white rounded-xl border border-[#e5e7eb] overflow-hidden hover:border-[#2e5bff]/30 hover:shadow-md transition-all group"
                >
                  {/* Image */}
                  <div className="relative h-48 bg-[#f9fafb] overflow-hidden">
                    {art?.image_url && art.image_url !== '/placeholder.jpg' ? (
                      <img
                        src={art.image_url}
                        alt={art.title}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-[#d1d5db]">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="text-[14px] font-semibold text-[#111111] line-clamp-1 mb-1">{art?.title}</h3>
                    {art?.artist_display && (
                      <p className="text-[12px] text-[#6b7280] line-clamp-1 mb-1">{art.artist_display}</p>
                    )}
                    <p className="text-[11px] font-medium text-[#2e5bff] mb-2">
                      {art?.year || art?.date || '—'}
                    </p>
                    {art?.region && (
                      <p className="text-[11px] text-[#9ca3af] mb-3">📍 {art.region}</p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleRemove(artId)}
                        disabled={isRemoving}
                        className="flex-1 py-1.5 text-[12px] text-[#ef4444] bg-red-50 hover:bg-red-100 border border-red-100 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {isRemoving ? 'Removing…' : 'Remove'}
                      </button>
                      <a
                        href="/"
                        className="flex-1 py-1.5 text-[12px] text-[#6b7280] bg-[#f9fafb] hover:bg-[#eff2ff] hover:text-[#2e5bff] border border-[#e5e7eb] rounded-lg transition-colors text-center"
                      >
                        View on Map
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
