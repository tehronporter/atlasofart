// components/admin/IngestionPanel.tsx

'use client';

import { useState, useEffect, useRef } from 'react';

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
  updated?: number;
  skipped?: number;
  noImage?: number;
  noType?: number;
  fetchFailed?: number;
  nextStartPage?: number;
  errors?: string[];
  error?: string;
  message?: string;
}

interface Stats {
  totalArtworks: number;
  gettyArtworks: number;
  withCoordinates: number;
  withImages: number;
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

interface IngestionPanelProps {
  stats: Stats;
  logs: IngestLog[];
  isLoadingStats: boolean;
  statsError: string | null;
  onRefreshStats: () => Promise<void>;
}

export function IngestionPanel({ stats, logs, isLoadingStats, statsError, onRefreshStats }: IngestionPanelProps) {
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestResult, setIngestResult] = useState<IngestResult | null>(null);
  const [startPage, setStartPage] = useState(1);
  const [pagesPerRun, setPagesPerRun] = useState(10);
  const [onlyWithImages, setOnlyWithImages] = useState(true);

  const [autoBatches, setAutoBatches] = useState(25);
  const [autoRunning, setAutoRunning] = useState(false);
  const [autoProgress, setAutoProgress] = useState({ current: 0, total: 0, totalAdded: 0, totalUpdated: 0 });
  const stopAutoRef = useRef(false);
  const currentPageRef = useRef(startPage);

  useEffect(() => { currentPageRef.current = startPage; }, [startPage]);

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
        currentPageRef.current = data.nextStartPage;
        await onRefreshStats();
      }
    } catch (err: any) {
      setIngestResult({ success: false, error: err.message || 'Network error' });
    } finally {
      setIsIngesting(false);
    }
  };

  const handleAutoRun = async () => {
    if (autoRunning) {
      stopAutoRef.current = true;
      return;
    }

    stopAutoRef.current = false;
    setAutoRunning(true);
    setAutoProgress({ current: 0, total: autoBatches, totalAdded: 0, totalUpdated: 0 });
    setIngestResult(null);
    let cumulativeAdded = 0;
    let cumulativeUpdated = 0;

    for (let i = 0; i < autoBatches; i++) {
      if (stopAutoRef.current) break;

      setAutoProgress(p => ({ ...p, current: i + 1 }));

      try {
        const res = await fetch('/api/ingest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            startPage: currentPageRef.current,
            pagesPerRun,
            onlyWithImages,
          }),
        });

        const data: IngestResult = await res.json();

        if (!data.success) {
          setIngestResult(data);
          break;
        }

        cumulativeAdded += data.added ?? 0;
        cumulativeUpdated += data.updated ?? 0;

        if (data.nextStartPage !== undefined) {
          setStartPage(data.nextStartPage);
          currentPageRef.current = data.nextStartPage;
        }

        setAutoProgress(p => ({
          ...p,
          totalAdded: cumulativeAdded,
          totalUpdated: cumulativeUpdated,
        }));

        if ((i + 1) % 5 === 0) await onRefreshStats();

      } catch (err: any) {
        setIngestResult({ success: false, error: err.message || 'Network error' });
        break;
      }
    }

    await onRefreshStats();
    setAutoRunning(false);
    setIngestResult({
      success: true,
      added: cumulativeAdded,
      updated: cumulativeUpdated,
      message: `Auto-run complete: ${cumulativeAdded} added, ${cumulativeUpdated} updated across ${autoBatches} batches.`,
    });
  };

  const dbConnected = !statsError;

  return (
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
            Artworks (HumanMadeObject) are scattered across ~42,500 pages. Each page contains ~100 activity items.
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
                {startPage !== 1 && (
                  <button
                    onClick={() => setStartPage(1)}
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
                <option value={3}>3</option>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
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
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleIngest}
              disabled={isIngesting || autoRunning || !dbConnected}
              className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${
                isIngesting || autoRunning
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
              onClick={onRefreshStats}
              disabled={isLoadingStats}
              className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
            >
              Refresh stats
            </button>
          </div>

          {/* Auto-run: chain multiple batches automatically */}
          <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-neutral-300">Auto-Run Mode</p>
                <p className="text-[10px] text-neutral-600 mt-0.5">
                  Chain multiple batches automatically — page advances after each batch
                </p>
              </div>
              {autoRunning && (
                <div className="text-right">
                  <p className="text-xs text-amber-400 font-mono tabular-nums">
                    Batch {autoProgress.current}/{autoProgress.total}
                  </p>
                  <p className="text-[10px] text-neutral-500">
                    +{autoProgress.totalAdded} added, +{autoProgress.totalUpdated} updated
                  </p>
                </div>
              )}
            </div>

            {autoRunning && (
              <div className="w-full bg-neutral-700 rounded-full h-1.5">
                <div
                  className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${(autoProgress.current / autoProgress.total) * 100}%` }}
                />
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-[10px] uppercase tracking-widest text-neutral-600 whitespace-nowrap">
                  Batches
                </label>
                <select
                  value={autoBatches}
                  onChange={e => setAutoBatches(Number(e.target.value))}
                  disabled={autoRunning || isIngesting}
                  className="bg-neutral-800 border border-neutral-700 text-sm text-neutral-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-amber-500/50 cursor-pointer"
                >
                  {[10, 25, 50, 100, 200].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <p className="text-[10px] text-neutral-600">
                ≈ {autoBatches * pagesPerRun * 100} activity items processed
              </p>
              <button
                onClick={handleAutoRun}
                disabled={!dbConnected || isIngesting}
                className={`ml-auto px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  autoRunning
                    ? 'bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30'
                    : !dbConnected || isIngesting
                    ? 'bg-neutral-700 text-neutral-500 cursor-not-allowed'
                    : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25'
                }`}
              >
                {autoRunning ? '⬛ Stop Auto-Run' : `▶ Auto-Run ${autoBatches} Batches`}
              </button>
            </div>
          </div>

          <p className="text-xs text-neutral-600">
            Tip: After each run, <code className="bg-neutral-800 px-1 rounded">Start page</code> advances automatically.
            Use Auto-Run to ingest the full Getty collection (~42,500 pages total) hands-free.
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
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { label: 'Added', value: ingestResult.added ?? 0, color: 'text-emerald-400' },
                      { label: 'Updated', value: ingestResult.updated ?? 0, color: 'text-blue-400' },
                      { label: 'No Image', value: ingestResult.noImage ?? 0, color: 'text-neutral-500' },
                      { label: 'Wrong Type', value: ingestResult.noType ?? 0, color: 'text-amber-500' },
                      { label: 'Fetch Failed', value: ingestResult.fetchFailed ?? 0, color: 'text-red-400' },
                      { label: 'Other Skip', value: Math.max(0, (ingestResult.skipped ?? 0) - (ingestResult.noType ?? 0) - (ingestResult.fetchFailed ?? 0)), color: 'text-neutral-600' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="bg-black/20 rounded-lg px-3 py-2">
                        <p className="text-[10px] text-neutral-600 mb-0.5">{label}</p>
                        <p className={`text-xl font-bold tabular-nums ${color}`}>{value}</p>
                      </div>
                    ))}
                  </div>
                  {(ingestResult.noType ?? 0) > 0 && (
                    <p className="text-xs text-amber-500/70 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                      ⚠ {ingestResult.noType} objects had an unexpected type — likely JSON-LD array format. The ingestion now handles both string and array types automatically.
                    </p>
                  )}
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
          <button onClick={onRefreshStats} className="text-xs text-amber-500 hover:text-amber-400 transition-colors">
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
    </div>
  );
}
