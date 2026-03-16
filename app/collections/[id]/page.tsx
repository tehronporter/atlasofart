// app/collections/[id]/page.tsx - Collection detail page

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
  const params = useParams();
  const router = useRouter();
  const collectionId = params.id as string;

  const [collection, setCollection] = useState<Collection | null>(null);
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  useEffect(() => {
    loadCollection();
  }, [collectionId]);

  async function loadCollection() {
    try {
      // Get collection details
      const { data: collData, error: collError } = await supabase
        .from('collections')
        .select('*')
        .eq('id', collectionId)
        .single();

      if (collError) throw collError;
      setCollection(collData);
      setEditName(collData.name);
      setEditDesc(collData.description || '');

      // Get collection items with artwork details
      const { data: itemsData, error: itemsError } = await supabase
        .from('collection_items')
        .select(`
          id,
          artwork_id,
          notes,
          artwork:artwork_id (
            id,
            title,
            artist_display,
            date,
            image_url,
            image_url_thumbnail,
            region
          )
        `)
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
    try {
      const { error } = await supabase
        .from('collections')
        .update({ name: editName, description: editDesc || null })
        .eq('id', collectionId);

      if (error) throw error;
      setIsEditingInfo(false);
      loadCollection();
    } catch (error) {
      console.error('Failed to update:', error);
      alert('Failed to update collection');
    }
  }

  async function handleRemoveItem(itemId: string) {
    try {
      const { error } = await supabase
        .from('collection_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      loadCollection();
    } catch (error) {
      console.error('Failed to remove:', error);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-neutral-400">Loading...</p>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-500 mb-4">Collection not found</p>
          <a href="/collections" className="text-amber-500 hover:text-amber-400">
            ← Back to Collections
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-neutral-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <a href="/collections" className="text-amber-500 hover:text-amber-400 text-sm mb-4 inline-block">
            ← Back to Collections
          </a>

          {!isEditingInfo ? (
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">{collection.name}</h1>
                {collection.description && (
                  <p className="text-neutral-400 text-lg mb-4">{collection.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-neutral-500">
                  <span>{items.length} artwork{items.length !== 1 ? 's' : ''}</span>
                  {collection.is_public && (
                    <span className="text-green-400">🌍 Public</span>
                  )}
                  <span>Updated {new Date(collection.updated_at).toLocaleDateString()}</span>
                </div>
              </div>

              <button
                onClick={() => setIsEditingInfo(true)}
                className="px-4 py-2 text-sm text-amber-500 hover:text-amber-400 transition-colors"
              >
                Edit
              </button>
            </div>
          ) : (
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 space-y-4">
              <div>
                <label className="text-sm text-neutral-400 block mb-2">Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-sm text-neutral-400 block mb-2">Description</label>
                <textarea
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-white focus:outline-none focus:border-amber-500"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleUpdateCollection}
                  className="px-4 py-2 bg-amber-500 text-neutral-900 rounded font-medium hover:bg-amber-400 text-sm"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditingInfo(false)}
                  className="px-4 py-2 bg-neutral-800 rounded hover:bg-neutral-700 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Items Grid */}
        {items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-neutral-500 mb-4">No artworks in this collection yet</p>
            <a href="/favorites" className="text-amber-500 hover:text-amber-400 text-sm">
              Add favorites to your collection
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(item => {
              const artwork = item.artwork as any;
              return (
                <div
                  key={item.id}
                  className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden hover:border-neutral-700 transition-colors"
                >
                  {artwork?.image_url && artwork.image_url !== '/placeholder.jpg' ? (
                    <img
                      src={artwork.image_url}
                      alt={artwork.title}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-neutral-800 flex items-center justify-center">
                      <span className="text-neutral-500 text-sm">No image</span>
                    </div>
                  )}

                  <div className="p-4">
                    <h3 className="font-semibold mb-1 line-clamp-1">{artwork?.title}</h3>
                    <p className="text-amber-500 text-sm mb-2">{artwork?.date || '—'}</p>
                    {artwork?.artist_display && (
                      <p className="text-xs text-neutral-400 mb-2 line-clamp-1">{artwork.artist_display}</p>
                    )}
                    {item.notes && (
                      <p className="text-xs text-neutral-500 mb-3 line-clamp-2">{item.notes}</p>
                    )}
                    {artwork?.region && (
                      <p className="text-xs text-neutral-600 mb-3">📍 {artwork.region}</p>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="flex-1 px-3 py-1.5 bg-red-900/20 text-red-400 text-xs rounded hover:bg-red-900/30 transition-colors"
                      >
                        Remove
                      </button>
                      <a
                        href="/"
                        className="flex-1 px-3 py-1.5 bg-neutral-800 text-neutral-300 text-xs rounded hover:bg-neutral-700 transition-colors text-center"
                      >
                        View Map
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8 flex gap-4">
          <a href="/" className="text-amber-500 hover:text-amber-400 text-sm">← Back to Map</a>
          <a href="/collections" className="text-amber-500 hover:text-amber-400 text-sm">Back to Collections</a>
        </div>
      </div>
    </div>
  );
}
