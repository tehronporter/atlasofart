// components/admin/ArtworkManager.tsx

'use client';

import { useState, useEffect } from 'react';

interface Artwork {
  id: string;
  title: string;
  artist_display: string;
  date: string;
  region: string;
  latitude: number;
  longitude: number;
  image_url_thumbnail: string;
  is_from_getty: boolean;
  created_at: string;
}

interface PaginationState {
  page: number;
  perPage: number;
  total: number;
}

export function ArtworkManager() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({ page: 1, perPage: 50, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);

  const fetchArtworks = async (page: number = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        perPage: pagination.perPage.toString(),
        search: searchTerm,
      });
      const res = await fetch(`/api/admin/artworks?${params}`);
      const data = await res.json();

      if (data.success) {
        setArtworks(data.artworks || []);
        setPagination(data.pagination);
      } else {
        setError(data.error || 'Failed to load artworks');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArtworks(1);
  }, [searchTerm]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Artwork Library</h2>
          <p className="text-xs text-neutral-500 mt-1">{pagination.total.toLocaleString()} artworks total</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-amber-500 text-neutral-900 hover:bg-amber-400 rounded-lg font-medium text-sm transition-all"
        >
          + Add Artwork
        </button>
      </div>

      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="Search by title, artist, or region..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200 text-sm placeholder-neutral-500 focus:outline-none focus:border-amber-500/50"
        />
      </div>

      {/* Error banner */}
      {error && (
        <div className="p-4 bg-red-900/20 border border-red-800/50 rounded-xl text-sm">
          <p className="text-red-400 font-semibold">{error}</p>
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4">
          <h3 className="font-semibold text-white">Add New Artwork</h3>
          <p className="text-xs text-neutral-500 mb-4">Form coming soon — comprehensive artwork creation UI</p>
          <button
            onClick={() => setShowForm(false)}
            className="text-sm text-neutral-400 hover:text-neutral-300"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Artworks Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="px-6 py-12 text-center">
            <div className="w-8 h-8 border-2 border-amber-500/60 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-neutral-500 text-sm">Loading artworks...</p>
          </div>
        ) : artworks.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-neutral-500 text-sm">No artworks found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-800/50 border-b border-neutral-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Artist</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Region</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Source</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {artworks.map(artwork => (
                  <tr key={artwork.id} className="hover:bg-neutral-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {artwork.image_url_thumbnail && (
                          <img
                            src={artwork.image_url_thumbnail}
                            alt={artwork.title}
                            className="w-8 h-8 rounded object-cover"
                          />
                        )}
                        <span className="text-neutral-300 font-medium truncate">{artwork.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-neutral-400 text-xs">{artwork.artist_display || '—'}</td>
                    <td className="px-6 py-4 text-neutral-400 text-xs">{artwork.date || '—'}</td>
                    <td className="px-6 py-4 text-neutral-400 text-xs">{artwork.region || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded ${artwork.is_from_getty ? 'bg-amber-500/20 text-amber-400' : 'bg-neutral-700/50 text-neutral-400'}`}>
                        {artwork.is_from_getty ? 'Getty' : 'Manual'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs space-x-2">
                      <button className="text-amber-400 hover:text-amber-300">Edit</button>
                      <button className="text-red-400 hover:text-red-300">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!isLoading && pagination.total > pagination.perPage && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-neutral-500">
            Page {pagination.page} of {Math.ceil(pagination.total / pagination.perPage)}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => fetchArtworks(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-1.5 text-xs bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 rounded transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => fetchArtworks(pagination.page + 1)}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.perPage)}
              className="px-3 py-1.5 text-xs bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 rounded transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
