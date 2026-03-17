// app/collections/[id]/page.tsx — Collection detail page, brand palette

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

interface Collection {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

interface CollectionItem {
  id: string;
  artwork_id: string;
  notes: string | null;
  artwork: {
    id: string;
    title: string;
    artist_display: string;
    date: string;
    image_url: string;
    image_url_thumbnail: string;
    region: string;
  };
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function CollectionDetailPage() {
  const params       = useParams();
  const router       = useRouter();
  const collectionId = params.id as string;

  const [collection, setCollection]       = useState<Collection | null>(null);
  const [items, setItems]                 = useState<CollectionItem[]>([]);
  const [isLoading, setIsLoading]         = useState(true);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editName, setEditName]           = useState('');
  const [editDesc, setEditDesc]           = useState('');
  const [saving, setSaving]               = useState(false);
  const [removing, setRemoving]           = useState<Set<string>>(new Set());

  useEffect(() => { loadCollection(); }, [collectionId]);

  async function loadCollection() {
    setIsLoading(true);
    try {
      const { data: collData, error: collError } = await supabase
        .from('collections').select('*').eq('id', collectionId).single();
      if (collError) throw collError;
      setCollection(collData);
      setEditName(collData.name);
      setEditDesc(collData.description || '');

      const { data: itemsData, error: itemsError } = await supabase
        .from('collection_items')
        .select(`id, artwork_id, notes, artwork:artwork_id (id, title, artist_display, date, image_url, image_url_thumbnail, region)`)
        .eq('collection_id', collectionId)
        .order('created_at', { ascending: false });
      if (itemsError) throw itemsError;
      setItems((itemsData || []) as unknown as CollectionItem[]);
    } catch (error) {
      console.error('Failed to load collection:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUpdateCollection() {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('collections')
        .update({ name: editName, description: editDesc || null })
        .eq('id', collectionId);
      if (error) throw error;
      setIsEditingInfo(false);
      loadCollection();
    } catch {
      alert('Failed to update collection');
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoveItem(itemId: string) {
    setRemoving(prev => new Set([...prev, itemId]));
    try {
      const { error } = await supabase.from('collection_items').delete().eq('id', itemId);
      if (error) throw error;
      setItems(prev => prev.filter(i => i.id !== itemId));
    } catch {
      alert('Failed to remove item');
    } finally {
      setRemoving(prev => { const s = new Set(prev); s.delete(itemId); return s; });
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#6b7280]">
          <div className="w-5 h-5 border-2 border-[#2e5bff] border-t-transparent rounded-full animate-spin" />
          <span className="text-[13px]">Loading collection…</span>
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#9ca3af] mb-4 text-[14px]">Collection not found</p>
          <a href="/collections" className="text-[#2e5bff] hover:underline text-[13px]">
            ← Back to Collections
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9fafb]">

      {/* ── Top nav ────────────────────────────────────────────── */}
      <nav className="bg-white border-b border-[#e5e7eb] sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center gap-3">
          <a
            href="/collections"
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
            <a href="/collections" className="text-[13px] text-[#9ca3af] hover:text-[#6b7280] transition-colors hidden sm:block">Collections</a>
            <span className="text-[#d1d5db] hidden sm:block">/</span>
            <span className="text-[13px] font-semibold text-[#111111] truncate max-w-[200px]">{collection.name}</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[11px] text-[#9ca3af]">
              {items.length} artwork{items.length !== 1 ? 's' : ''}
            </span>
            {!isEditingInfo && (
              <button
                onClick={() => setIsEditingInfo(true)}
                className="px-3 py-1.5 text-[12px] text-[#6b7280] bg-[#f9fafb] hover:bg-[#eff2ff] hover:text-[#2e5bff] border border-[#e5e7eb] rounded-lg transition-colors"
              >
                Edit
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ── Content ────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Header / Edit */}
        {isEditingInfo ? (
          <div className="mb-7 bg-white rounded-xl border border-[#e5e7eb] p-6 space-y-4">
            <h2 className="text-[15px] font-semibold text-[#111111]">Edit Collection</h2>
            <div>
              <label className="block text-[12px] font-medium text-[#111111] mb-1.5">Name</label>
              <input
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#f9fafb] border border-[#e5e7eb] rounded-lg text-[#111111] text-[13px] focus:outline-none focus:border-[#2e5bff] focus:ring-2 focus:ring-[#2e5bff]/10 transition-all"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#111111] mb-1.5">Description</label>
              <textarea
                value={editDesc}
                onChange={e => setEditDesc(e.target.value)}
                rows={3}
                className="w-full px-3.5 py-2.5 bg-[#f9fafb] border border-[#e5e7eb] rounded-lg text-[#111111] text-[13px] focus:outline-none focus:border-[#2e5bff] focus:ring-2 focus:ring-[#2e5bff]/10 transition-all resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleUpdateCollection}
                disabled={saving}
                className="px-5 py-2 bg-[#2e5bff] text-white text-[13px] font-semibold rounded-lg hover:bg-[#1a3acc] disabled:opacity-50 transition-colors"
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
              <button
                onClick={() => setIsEditingInfo(false)}
                className="px-5 py-2 bg-[#f9fafb] text-[#6b7280] text-[13px] border border-[#e5e7eb] rounded-lg hover:bg-[#f3f4f6] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-7">
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-[#111111] mb-1">{collection.name}</h1>
                {collection.description && (
                  <p className="text-[13px] text-[#6b7280] leading-relaxed">{collection.description}</p>
                )}
                <div className="flex items-center gap-3 mt-2 text-[11px] text-[#9ca3af]">
                  <span>Updated {new Date(collection.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  {collection.is_public && (
                    <span className="bg-[#eff2ff] text-[#2e5bff] px-2 py-0.5 rounded-full text-[10px] font-medium">Public</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Items grid */}
        {items.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-[#eff2ff] flex items-center justify-center mx-auto mb-5">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2e5bff" strokeWidth="1.5">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-[#111111] mb-2">No artworks yet</h3>
            <p className="text-[13px] text-[#6b7280] mb-5">
              Double-click any artwork on the map and use "Add to Collection"
            </p>
            <a
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2e5bff] text-white text-[13px] font-medium rounded-xl hover:bg-[#1a3acc] transition-colors"
            >
              Explore the Map
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map(item => {
              const art = item.artwork as any;
              const isRemoving = removing.has(item.id);
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-[#e5e7eb] overflow-hidden hover:border-[#2e5bff]/30 hover:shadow-md transition-all group"
                >
                  <div className="h-48 bg-[#f9fafb] overflow-hidden">
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
                  <div className="p-4">
                    <h3 className="text-[14px] font-semibold text-[#111111] line-clamp-1 mb-1">{art?.title}</h3>
                    {art?.artist_display && (
                      <p className="text-[12px] text-[#6b7280] line-clamp-1 mb-1">{art.artist_display}</p>
                    )}
                    <p className="text-[11px] font-medium text-[#2e5bff] mb-2">{art?.date || '—'}</p>
                    {item.notes && (
                      <p className="text-[11px] text-[#6b7280] italic mb-2 line-clamp-2">"{item.notes}"</p>
                    )}
                    {art?.region && (
                      <p className="text-[11px] text-[#9ca3af] mb-3">📍 {art.region}</p>
                    )}
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleRemoveItem(item.id)}
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
