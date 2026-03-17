// app/collections/page.tsx — Collections page, brand palette

'use client';

import { useState, useEffect } from 'react';
import { getUserCollections, createCollection } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function CollectionsPage() {
  const [collections, setCollections] = useState<any[]>([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [showCreate, setShowCreate]   = useState(false);
  const [newName, setNewName]         = useState('');
  const [newDesc, setNewDesc]         = useState('');
  const [creating, setCreating]       = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => { loadCollections(); }, []);

  async function loadCollections() {
    setIsLoading(true);
    try {
      const data = await getUserCollections();
      setCollections(data);
    } catch {
      setCollections([]);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    setCreateError(null);
    try {
      await createCollection(newName.trim(), newDesc || undefined);
      setNewName('');
      setNewDesc('');
      setShowCreate(false);
      loadCollections();
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create collection');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f9fafb]">

      {/* ── Top nav ────────────────────────────────────────────── */}
      <nav className="bg-white border-b border-[#e5e7eb] sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center gap-3">
          <a
            href="/"
            className="w-8 h-8 rounded-lg bg-[#f9fafb] hover:bg-[#eff2ff] border border-[#e5e7eb] flex items-center justify-center transition-colors text-[#6b7280] hover:text-[#2e5bff]"
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
            <span className="text-[13px] text-[#9ca3af]">Atlas of Art</span>
            <span className="text-[#d1d5db]">/</span>
            <span className="text-[13px] font-semibold text-[#111111]">Collections</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <a href="/favorites" className="text-[12px] text-[#6b7280] hover:text-[#2e5bff] transition-colors hidden sm:block">
              Favorites
            </a>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium bg-[#2e5bff] text-white rounded-lg hover:bg-[#1a3acc] transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New Collection
            </button>
          </div>
        </div>
      </nav>

      {/* ── Content ────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 py-8">

        <div className="mb-7">
          <h1 className="text-2xl font-bold text-[#111111] mb-1">My Collections</h1>
          <p className="text-[13px] text-[#6b7280]">
            {isLoading ? 'Loading…' : `${collections.length} collection${collections.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Explainer */}
        <div className="mb-6 p-4 bg-white rounded-xl border border-[#e5e7eb] flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#eff2ff] flex items-center justify-center shrink-0 mt-0.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2e5bff" strokeWidth="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[#111111]">Curated collections — your named art groups</p>
            <p className="text-[12px] text-[#6b7280] mt-0.5">
              Create named collections like "Japanese Woodblock" or "Renaissance Portraits". Add artworks from the map or your{' '}
              <a href="/favorites" className="text-[#2e5bff] hover:underline">Favorites</a>.
            </p>
          </div>
        </div>

        {/* Loading skeletons */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white rounded-xl border border-[#e5e7eb] p-6 animate-pulse">
                <div className="h-5 bg-[#f3f4f6] rounded w-3/4 mb-3" />
                <div className="h-3 bg-[#f3f4f6] rounded w-full mb-2" />
                <div className="h-3 bg-[#f3f4f6] rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : collections.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-[#eff2ff] flex items-center justify-center mx-auto mb-5">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2e5bff" strokeWidth="1.5">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-[#111111] mb-2">No collections yet</h3>
            <p className="text-[13px] text-[#6b7280] mb-5">
              Create your first collection to start curating artworks
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2e5bff] text-white text-[13px] font-medium rounded-xl hover:bg-[#1a3acc] transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Create First Collection
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {collections.map(col => {
              // Get cover image from first item
              const coverImg = col.items?.[0]?.artwork?.image_url || col.items?.[0]?.artwork?.image_url_thumbnail;
              return (
                <div
                  key={col.id}
                  className="bg-white rounded-xl border border-[#e5e7eb] overflow-hidden hover:border-[#2e5bff]/30 hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => router.push(`/collections/${col.id}`)}
                >
                  {/* Cover image strip */}
                  <div className="h-36 bg-[#f9fafb] overflow-hidden relative">
                    {coverImg ? (
                      <img
                        src={coverImg}
                        alt={col.name}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-[#d1d5db]">
                          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                        </svg>
                      </div>
                    )}
                    {col.is_public && (
                      <span className="absolute top-2 right-2 text-[10px] bg-[#2e5bff]/90 text-white px-2 py-0.5 rounded-full">
                        Public
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-[14px] font-semibold text-[#111111] mb-1 line-clamp-1">{col.name}</h3>
                    {col.description && (
                      <p className="text-[12px] text-[#6b7280] line-clamp-2 mb-2">{col.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-[#9ca3af]">
                        {col.items?.length || 0} artwork{(col.items?.length || 0) !== 1 ? 's' : ''}
                      </span>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#d1d5db] group-hover:text-[#2e5bff] transition-colors">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Create new card */}
            <button
              onClick={() => setShowCreate(true)}
              className="bg-white rounded-xl border-2 border-dashed border-[#e5e7eb] hover:border-[#2e5bff]/40 hover:bg-[#eff2ff]/30 transition-all p-6 flex flex-col items-center justify-center gap-3 text-[#9ca3af] hover:text-[#2e5bff] group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#f9fafb] group-hover:bg-[#eff2ff] border border-[#e5e7eb] flex items-center justify-center transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </div>
              <span className="text-[13px] font-medium">New Collection</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Create collection modal ─────────────────────────────── */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#e5e7eb] w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 pt-6 pb-5 border-b border-[#e5e7eb] flex items-center justify-between">
              <h2 className="text-[16px] font-semibold text-[#111111]">New Collection</h2>
              <button
                onClick={() => { setShowCreate(false); setCreateError(null); }}
                className="w-7 h-7 rounded-lg bg-[#f9fafb] border border-[#e5e7eb] flex items-center justify-center text-[#6b7280] hover:text-[#111111] transition-colors"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreate} className="px-6 py-5 space-y-4">
              {createError && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-[12px] text-red-600">
                  {createError}
                </div>
              )}
              <div>
                <label className="block text-[12px] font-medium text-[#111111] mb-1.5">Name <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  required
                  placeholder="e.g. Japanese Woodblock Prints"
                  className="w-full px-3.5 py-2.5 bg-[#f9fafb] border border-[#e5e7eb] rounded-lg text-[#111111] text-[13px] placeholder-[#9ca3af] focus:outline-none focus:border-[#2e5bff] focus:ring-2 focus:ring-[#2e5bff]/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#111111] mb-1.5">Description <span className="text-[#9ca3af] font-normal">(optional)</span></label>
                <textarea
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="What's this collection about?"
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-[#f9fafb] border border-[#e5e7eb] rounded-lg text-[#111111] text-[13px] placeholder-[#9ca3af] focus:outline-none focus:border-[#2e5bff] focus:ring-2 focus:ring-[#2e5bff]/10 transition-all resize-none"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={creating || !newName.trim()}
                  className="flex-1 py-2.5 bg-[#2e5bff] text-white text-[13px] font-semibold rounded-lg hover:bg-[#1a3acc] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {creating ? 'Creating…' : 'Create Collection'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowCreate(false); setCreateError(null); }}
                  className="flex-1 py-2.5 bg-[#f9fafb] text-[#6b7280] text-[13px] font-medium border border-[#e5e7eb] rounded-lg hover:bg-[#f3f4f6] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
