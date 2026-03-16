// app/admin/page.tsx - Fixed admin page
// Phase 12: Admin UI - Null-safe version

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
  const [stats, setStats] = useState<IngestStats>({ totalArtworks: 0, gettyArtworks: 0 });
  const [logs, setLogs] = useState<IngestLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/ingest');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats || { totalArtworks: 0, gettyArtworks: 0 });
        setLogs(data.recentLogs || []);
      } else {
        setError(data.error || 'Failed to fetch stats');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch stats');
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
          batchSize: 50,
          maxPages: 2,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`Ingestion complete!\nAdded: ${data.added}\nUpdated: ${data.updated}`);
        fetchStats();
      } else {
        setError(data.error || 'Ingestion failed');
      }
    } catch (err: any) {
      setError(err.message || 'Ingestion failed');
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
            <p className="text-4xl font-bold text-white">{stats?.totalArtworks ?? 0}</p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
            <h2 className="text-sm font-medium text-neutral-400 mb-2">From Getty</h2>
            <p className="text-4xl font-bold text-amber-500">{stats?.gettyArtworks ?? 0}</p>
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
              <strong>Error:</strong> {error}
            </div>
          )}

          <button
            onClick={handleIngest}
            disabled={isIngesting}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              isIngesting
                ? 'bg-neutral-700 text-neutral-400 cursor-not-allowed'
                : 'bg-amber-500 text-neutral-900 hover:bg-amber-400'
            }`}
          >
            {isIngesting ? 'Ingesting...' : 'Start Ingestion (100 artworks)'}
          </button>

          <p className="text-xs text-neutral-500 mt-3">
            This will fetch up to 100 artworks from Getty API. May take 30-60 seconds.
          </p>

          <div className="mt-6 p-4 bg-blue-900/20 border border-blue-800 rounded text-sm">
            <p className="text-blue-400 font-semibold mb-2">ℹ️ Supabase Setup Check:</p>
            <ol className="list-decimal list-inside space-y-1 text-blue-300">
              <li>Run <code className="bg-blue-900/50 px-1 rounded">supabase/schema.sql</code></li>
              <li>Run <code className="bg-blue-900/50 px-1 rounded">supabase/schema-14-auth.sql</code></li>
              <li>Verify tables exist in Supabase dashboard</li>
            </ol>
          </div>
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
            <p className="text-neutral-500 text-sm">No ingestion logs yet. Click "Start Ingestion" to begin.</p>
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
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8">
          <a href="/" className="text-amber-500 hover:text-amber-400 text-sm">← Back to Map</a>
        </div>
      </div>
    </div>
  );
}
