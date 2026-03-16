// app/collections/page.tsx - User collections page
// Phase 14: Collections UI

'use client';

import { useState, useEffect } from 'react';
import { getUserCollections, createCollection } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function CollectionsPage() {
  const [collections, setCollections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const router = useRouter();

  useEffect(() => {
    loadCollections();
  }, []);

  async function loadCollections() {
    try {
      const data = await getUserCollections();
      setCollections(data);
    } catch (error) {
      console.error('Failed to load collections:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createCollection(newName, newDesc || undefined);
      setNewName('');
      setNewDesc('');
      setShowCreate(false);
      loadCollections();
    } catch (error: any) {
      alert('Failed to create: ' + error.message);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-neutral-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-neutral-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Collections</h1>
            <p className="text-neutral-400">Organize your favorite artworks</p>
          </div>
          
          <div className="flex gap-3">
            <a
              href="/favorites"
              className="px-4 py-2 bg-neutral-800 rounded hover:bg-neutral-700 transition-colors"
            >
              View Favorites
            </a>
            <button
              onClick={() => setShowCreate(true)}
              className="px-4 py-2 bg-amber-500 text-neutral-900 rounded font-medium hover:bg-amber-400 transition-colors"
            >
              New Collection
            </button>
          </div>
        </div>

        {showCreate && (
          <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Create Collection</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm text-neutral-400 mb-1">Name</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-neutral-400 mb-1">Description (optional)</label>
                  <textarea
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-white focus:outline-none focus:border-amber-500"
                    rows={3}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-amber-500 text-neutral-900 rounded font-medium hover:bg-amber-400"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className="flex-1 px-4 py-2 bg-neutral-800 rounded hover:bg-neutral-700"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {collections.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-neutral-500 mb-4">No collections yet</p>
            <button
              onClick={() => setShowCreate(true)}
              className="px-6 py-3 bg-amber-500 text-neutral-900 rounded font-medium hover:bg-amber-400"
            >
              Create Your First Collection
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection) => (
              <div
                key={collection.id}
                className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 hover:border-neutral-700 transition-colors cursor-pointer"
                onClick={() => router.push(`/collections/${collection.id}`)}
              >
                <h3 className="text-lg font-semibold mb-2">{collection.name}</h3>
                {collection.description && (
                  <p className="text-sm text-neutral-400 mb-4 line-clamp-2">{collection.description}</p>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-500">
                    {collection.items?.length || 0} artworks
                  </span>
                  {collection.is_public && (
                    <span className="text-xs bg-green-900/30 text-green-400 px-2 py-0.5 rounded">Public</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8">
          <a href="/" className="text-amber-500 hover:text-amber-400 text-sm">← Back to Map</a>
        </div>
      </div>
    </div>
  );
}
