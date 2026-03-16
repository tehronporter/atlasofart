// app/admin/page.tsx
// Atlas of Art — Admin Dashboard (Getty Linked Art API)

'use client';

import { useState, useEffect } from 'react';

interface Stats {
  totalArtworks: number;
  gettyArtworks: number;
  withCoordinates: number;
  withImages: number;
}

interface IngestLog {
  id: string;
  batch_id: string;
  status: string;
  artworks_added: number;
  artworks_updated: number;
  errors?: string[] | null;
  metadata?: any;
  created_at: string;
  completed_at?: string | null;
}

interface IngestResult {
  success: boolean;
  added?: number;
  skipped?: number;
  noImage?: number;
  nextStartPage?: number;
  errors?: string[];
  error?: string;
  message?: string;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    completed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    processing: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    failed: 'bg-red-500/15 text-red-400 border-red-500/30',
    pending: 'bg-neutral-500/15 text-neutral-400 border-neutral-500/30',
  };
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded border font-medium uppercase tracking-wider ${styles[status] ?? styles.pending}`}>
      {status}
    </span>
  );
}

function StatCard({ label, value, sub, accent }: { label: string; value: number | string; sub?: string; accent?: boolean }) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
      <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider mb-2">{label}</p>
      <p className={`text-3xl font-bold tabular-nums ${accent ? 'text-amber-400' : 'text-white'}`}>{value}</p>
      {sub && <p className="text-xs text-neutral-600 mt-1">{sub}</p>}
    </div>
  );
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats>({ totalArtworks: 0, gettyArtworks: 0, withCoordinates: 0, withImages: 0 });
  const [logs, setLogs] = useState<IngestLog[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isIngesting, setIsIngesting] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [ingestResult, setIngestResult] = useState<IngestResult | null>(null);
  const [startPage, setStartPage] = useState(35000);
  const [pagesPerRun, setPagesPerRun] = useState(3);
  const [onlyWithImages, setOnlyWithImages] = useState(true);

  const fetchStats = async () => {
    try {
      setStatsError(null);
      const res = await fetch('/api/ingest');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats ?? { totalArtworks: 0, gettyArtworks: 0, withCoordinates: 0, withImages: 0 });
        setLogs(data.recentLogs ?? []);
      } else {
        setStatsError(data.error || 'Failed to load stats');
      }
    } catch (err: any) {
      setStatsError(err.message || 'Network error');
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const handleIngest = async () => {
    setIsIngesting(true);
    setIngestResult(null);

    try {
      const res = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startPage, pagesPerRun, onlyWithImages }),
      });

      const data: IngestResult = await res.json();
      setIngestResult(data);

      if (data.success && data.nextStartPage !== undefined) {
        setStartPage(data.nextStartPage);
        await fetchStats();
      }
    } catch (err: any) {
      setIngestResult({ success: false, error: err.message || 'Network error' });
    } finally {
      setIsIngesting(false);
    }
  };

  const dbConnected = !statsError;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-neutral-100">
      {/* Header */}
      <div className="border-b border-neutral-800/60 bg-neutral-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="text-neutral-500 hover:text-neutral-300 transition-colors text-sm">
              ← Map
            </a>
            <span className="text-neutral-700">/</span>
            <h1 className="text-sm font-semibold text-white">Admin</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${dbConnected ? 'bg-emerald-500' : 'bg-red-500'} shadow-[0_0_6px_currentColor]`} />
            <span className="text-xs text-neutral-500">
              {isLoadingStats ? 'Connecting…' : dbConnected ? 'Supabase connected' : 'Supabase error'}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">

        {/* Stats error banner */}
        {statsError && (
          <div className="p-4 bg-red-900/20 border border-red-800/50 rounded-xl text-sm">
            <p className="text-red-400 font-semibold mb-1">Supabase Connection Error</p>
            <p className="text-red-500/70 text-xs font-mono mb-3">{statsError}</p>
            <div className="text-xs text-red-500/60 space-y-1">
              <p>1. Check <code className="bg-red-900/30 px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code> in <code className="bg-red-900/30 px-1 rounded">.env.local</code></p>
              <p>2. Check <code className="bg-red-900/30 px-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code></p>
              <p>3. Check <code className="bg-red-900/30 px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code> (required for ingestion)</p>
              <p>4. Run <code className="bg-red-900/30 px-1 rounded">supabase/schema.sql</code> in Supabase SQL Editor</p>
            </div>
          </div>
        )}

        {/* Stats grid */}
        <div>
          <h2 className="text-xs uppercase tracking-widest text-neutral-600 font-medium mb-4">Database Overview</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Artworks"
              value={isLoadingStats ? '—' : stats.totalArtworks.toLocaleString()}
              sub="stored in Supabase"
            />
            <StatCard
              label="Getty Sourced"
              value={isLoadingStats ? '—' : stats.gettyArtworks.toLocaleString()}
              sub="via Linked Art API"
              accent
            />
            <StatCard
              label="With Coordinates"
              value={isLoadingStats ? '—' : stats.withCoordinates.toLocaleString()}
              sub="plotted on map"
            />
            <StatCard
              label="With Images"
              value={isLoadingStats ? '—' : stats.withImages.toLocaleString()}
              sub="IIIF images available"
            />
          </div>
        </div>

        {/* Ingestion panel */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-neutral-800">
            <h2 className="font-semibold text-white">J. Paul Getty Museum — Linked Art API</h2>
            <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">
              Fetches artworks from the Getty Linked Art API activity stream at{' '}
              <code className="bg-neutral-800 px-1 rounded text-neutral-400">data.getty.edu</code>.
              HumanMadeObject entries concentrate around pages 35,000+. Each page contains ~100 activity items.
              Coordinates are geocoded from provenance metadata. Duplicates are automatically skipped via upsert.
            </p>
          </div>

          <div className="px-6 py-5 space-y-5">
            {/* Config row */}
            <div className="flex items-end gap-6 flex-wrap">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-neutral-600 block mb-1.5">Start page</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    step={pagesPerRun}
                    value={startPage}
                    onChange={e => setStartPage(Number(e.target.value))}
                    disabled={isIngesting}
                    className="w-28 bg-neutral-800 border border-neutral-700 text-sm text-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500/50 tabular-nums"
                  />
                  {startPage !== 35000 && (
                    <button
                      onClick={() => setStartPage(35000)}
                      className="text-xs text-neutral-600 hover:text-neutral-400 transition-colors"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest text-neutral-600 block mb-1.5">Pages per run</label>
                <select
                  value={pagesPerRun}
                  onChange={e => setPagesPerRun(Number(e.target.value))}
                  disabled={isIngesting}
                  className="bg-neutral-800 border border-neutral-700 text-sm text-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500/50 cursor-pointer"
                >
                  <option value={1}>1</option>
                  <option value={3}>3</option>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest text-neutral-600 block mb-1.5">Filter</label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <div
                    onClick={() => !isIngesting && setOnlyWithImages(!onlyWithImages)}
                    className={`w-9 h-5 rounded-full transition-colors relative ${onlyWithImages ? 'bg-amber-500' : 'bg-neutral-700'} ${isIngesting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${onlyWithImages ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </div>
                  <span className="text-xs text-neutral-400">Images only</span>
                </label>
              </div>
            </div>

            {/* Action row */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleIngest}
                disabled={isIngesting || !dbConnected}
                className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${
                  isIngesting
                    ? 'bg-neutral-700 text-neutral-400 cursor-not-allowed'
                    : !dbConnected
                    ? 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
                    : 'bg-amber-500 text-neutral-900 hover:bg-amber-400 active:scale-[0.98] shadow-[0_0_20px_rgba(251,191,36,0.15)]'
                }`}
              >
                {isIngesting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-[1.5px] border-neutral-400 border-t-transparent rounded-full animate-spin" />
                    Ingesting…
                  </span>
                ) : (
                  `Ingest ${pagesPerRun} page${pagesPerRun !== 1 ? 's' : ''} from page ${startPage.toLocaleString()}`
                )}
              </button>

              <button
                onClick={fetchStats}
                disabled={isLoadingStats}
                className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
              >
                Refresh stats
              </button>
            </div>

            <p className="text-xs text-neutral-600">
              Tip: After each run, <code className="bg-neutral-800 px-1 rounded">Start page</code> advances automatically.
              Run repeatedly to ingest the full Getty collection (~42,500 pages total).
            </p>

            {/* Result card */}
            {ingestResult && (
              <div className={`rounded-xl border p-4 ${
                ingestResult.success
                  ? 'bg-emerald-500/[0.06] border-emerald-500/20'
                  : 'bg-red-500/[0.06] border-red-500/20'
              }`}>
                {ingestResult.success ? (
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-emerald-400">Ingestion complete ✓</p>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Added', value: ingestResult.added ?? 0, color: 'text-emerald-400' },
                        { label: 'Skipped', value: ingestResult.skipped ?? 0, color: 'text-neutral-500' },
                        { label: 'No Image', value: ingestResult.noImage ?? 0, color: 'text-neutral-600' },
                      ].map(({ label, value, color }) => (
                        <div key={label} className="bg-black/20 rounded-lg px-3 py-2">
                          <p className="text-[10px] text-neutral-600 mb-0.5">{label}</p>
                          <p className={`text-xl font-bold tabular-nums ${color}`}>{value}</p>
                        </div>
                      ))}
                    </div>
                    {ingestResult.nextStartPage !== undefined && (
                      <p className="text-xs text-neutral-500">
                        Next run starts at page{' '}
                        <span className="text-neutral-300 font-mono">{ingestResult.nextStartPage.toLocaleString()}</span>
                        {' '}— already updated above.
                      </p>
                    )}
                    {ingestResult.errors && ingestResult.errors.length > 0 && (
                      <details className="text-xs">
                        <summary className="text-amber-500/60 cursor-pointer hover:text-amber-400 transition-colors">
                          {ingestResult.errors.length} object errors (expand)
                        </summary>
                        <div className="mt-2 space-y-0.5 font-mono max-h-32 overflow-y-auto">
                          {ingestResult.errors.map((e, i) => (
                            <p key={i} className="text-red-500/50 text-[10px]">{e}</p>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-semibold text-red-400 mb-1">Ingestion failed</p>
                    <p className="text-xs text-red-500/60 font-mono">{ingestResult.error}</p>
                    {ingestResult.error?.includes('not configured') && (
                      <p className="mt-2 text-xs text-neutral-500">
                        Add <code className="bg-neutral-800 px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code> to{' '}
                        <code className="bg-neutral-800 px-1 rounded">.env.local</code> and restart the dev server.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Ingestion logs */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
            <h2 className="font-semibold text-white text-sm">Recent Ingestion Runs</h2>
            <button onClick={fetchStats} className="text-xs text-amber-500 hover:text-amber-400 transition-colors">
              Refresh
            </button>
          </div>

          {logs.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p className="text-xs text-neutral-600">No ingestion logs yet. Run an ingestion above to get started.</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-800">
              {logs.map(log => (
                <div key={log.id} className="px-6 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <StatusBadge status={log.status} />
                        <span className="text-[10px] text-neutral-600 font-mono truncate">{log.batch_id}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-neutral-500">
                        <span>
                          <span className="text-emerald-400 font-semibold tabular-nums">{log.artworks_added ?? 0}</span> added
                        </span>
                        <span>
                          <span className="text-neutral-300 font-semibold tabular-nums">{log.artworks_updated ?? 0}</span> updated
                        </span>
                        {log.metadata?.source && (
                          <span className="text-neutral-700">via {log.metadata.source}</span>
                        )}
                        {log.metadata?.startPage && (
                          <span className="text-neutral-700">page {log.metadata.startPage.toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[10px] text-neutral-600 tabular-nums">
                        {new Date(log.created_at).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                      {log.completed_at && log.created_at && (
                        <p className="text-[10px] text-neutral-700 mt-0.5">
                          {Math.round((new Date(log.completed_at).getTime() - new Date(log.created_at).getTime()) / 1000)}s
                        </p>
                      )}
                    </div>
                  </div>
                  {log.errors && log.errors.length > 0 && (
                    <details className="mt-2">
                      <summary className="text-[10px] text-amber-500/50 cursor-pointer hover:text-amber-400">
                        {log.errors.length} errors
                      </summary>
                      <div className="mt-1 space-y-0.5 font-mono">
                        {log.errors.slice(0, 5).map((e, i) => (
                          <p key={i} className="text-[10px] text-red-500/40">{e}</p>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Setup guide */}
        <div className="bg-blue-950/20 border border-blue-900/30 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-blue-300 mb-3">Getty Ingestion Guide</h3>
          <ol className="space-y-2 text-xs text-blue-400/60">
            <li className="flex items-start gap-2">
              <span className="bg-blue-500/20 text-blue-400 rounded px-1.5 py-0.5 font-mono text-[10px] shrink-0">1</span>
              Run <code className="bg-blue-950/50 px-1 rounded">supabase/schema.sql</code> in the Supabase SQL Editor
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-blue-500/20 text-blue-400 rounded px-1.5 py-0.5 font-mono text-[10px] shrink-0">2</span>
              Ensure <code className="bg-blue-950/50 px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code> is in <code className="bg-blue-950/50 px-1 rounded">.env.local</code>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-blue-500/20 text-blue-400 rounded px-1.5 py-0.5 font-mono text-[10px] shrink-0">3</span>
              Click Ingest — start page defaults to 35,000 where HumanMadeObject entries concentrate
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-blue-500/20 text-blue-400 rounded px-1.5 py-0.5 font-mono text-[10px] shrink-0">4</span>
              Run multiple batches — start page auto-advances after each run
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-blue-500/20 text-blue-400 rounded px-1.5 py-0.5 font-mono text-[10px] shrink-0">5</span>
              Visit <a href="/" className="text-blue-300 hover:underline">the map</a> — artworks appear automatically
            </li>
          </ol>
        </div>

      </div>
    </div>
  );
}
