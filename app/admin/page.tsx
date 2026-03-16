// app/admin/page.tsx - Admin page for ingestion and stats
// Phase 12: Admin UI

'use client';

import { useState, useEffect } from 'react';

interface IngestStats {
  totalArtworks: number;
  gettyArtworks: number;
}

interface IngestLog {
  id: string;
  batch_id: string;
  status: string;
  artworks_added: number;
  artworks_updated: number;
  created_at: string;
}

export default function AdminPage() {
  const [stats, setStats] = useState<IngestStats | null>(null);
  const [logs, setLogs] = useState<IngestLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/ingest');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
        setLogs(data.recentLogs || []);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch stats');
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleIngest = async () => {
    setIsIngesting(true);
    setError(null);

    try {
      const response = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batchSize: 100,
          maxPages: 5,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`Ingestion complete!\nAdded: ${data.added}\nUpdated: ${data.updated}`);
        fetchStats();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Ingestion failed');
    } finally {
      setIsIngesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-neutral-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Atlas of Art - Admin</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
            <h2 className="text-sm font-medium text-neutral-400 mb-2">Total Artworks</h2>
            <p className="text-4xl font-bold text-white">
              {stats?.totalArtworks ?? '—'}
            </p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
            <h2 className="text-sm font-medium text-neutral-400 mb-2">From Getty</h2>
            <p className="text-4xl font-bold text-amber-500">
              {stats?.gettyArtworks ?? '—'}
            </p>
          </div>
        </div>

        {/* Ingestion Controls */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Getty Ingestion</h2>
          
          <p className="text-neutral-400 mb-4">
            Fetch artworks from the Getty Museum Open Content API and ingest them into the database.
          </p>

          {error && (
            <div className="mb-4 p-4 bg-red-900/20 border border-red-800 rounded text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleIngest}
            disabled={isIngesting}
            className={`
              px-6 py-3 rounded-lg font-medium transition-colors
              ${isIngesting
                ? 'bg-neutral-700 text-neutral-400 cursor-not-allowed'
                : 'bg-amber-500 text-neutral-900 hover:bg-amber-400'
              }
            `}
          >
            {isIngesting ? 'Ingesting...' : 'Start Ingestion (500 artworks)'}
          </button>

          <p className="text-xs text-neutral-500 mt-3">
            This will fetch up to 500 artworks from Getty API. May take 1-2 minutes.
          </p>
        </div>

        {/* Recent Ingestion Logs */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Ingestions</h2>
          
          <button
            onClick={fetchStats}
            className="text-sm text-amber-500 hover:text-amber-400 mb-4"
          >
            Refresh
          </button>

          {logs.length === 0 ? (
            <p className="text-neutral-500 text-sm">No ingestion logs yet.</p>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 bg-neutral-800/50 rounded border border-neutral-700"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs text-neutral-400">{log.batch_id}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      log.status === 'completed' ? 'bg-green-900/30 text-green-400' :
                      log.status === 'processing' ? 'bg-blue-900/30 text-blue-400' :
                      log.status === 'failed' ? 'bg-red-900/30 text-red-400' :
                      'bg-neutral-700 text-neutral-400'
                    }`}>
                      {log.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-neutral-500">Added:</span>
                      <span className="ml-2 text-neutral-200">{log.artworks_added}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500">Updated:</span>
                      <span className="ml-2 text-neutral-200">{log.artworks_updated}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500">Date:</span>
                      <span className="ml-2 text-neutral-200">
                        {new Date(log.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Back to Map */}
        <div className="mt-8">
          <a
            href="/"
            className="text-amber-500 hover:text-amber-400 text-sm"
          >
            ← Back to Map
          </a>
        </div>
      </div>
    </div>
  );
}
