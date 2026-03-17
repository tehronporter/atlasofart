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
  alreadyExists?: number;
  noImage?: number;
  fetchFailed?: number;
  nextOffset?: number;
  finished?: boolean;
  errors?: string[];
  error?: string;
  message?: string;
}

interface Stats {
  totalArtworks: number;
  gettyArtworks: number;
  withCoordinates: number;
  withImages: number;
  totalGettyAvailable?: number;
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
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <p className="text-xs text-neutral-700 font-medium uppercase tracking-wider mb-2">{label}</p>
      <p className={`text-3xl font-bold tabular-nums ${accent ? 'text-amber-600' : 'text-neutral-900'}`}>{value}</p>
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
  const [offset, setOffset] = useState(0);
  const [batchSize, setBatchSize] = useState(50);

  const [autoBatches, setAutoBatches] = useState(25);
  const [autoRunning, setAutoRunning] = useState(false);
  const [autoProgress, setAutoProgress] = useState({ current: 0, total: 0, totalAdded: 0, totalSkipped: 0 });
  const stopAutoRef = useRef(false);
  const currentOffsetRef = useRef(offset);

  useEffect(() => { currentOffsetRef.current = offset; }, [offset]);

  const handleIngest = async () => {
    setIsIngesting(true);
    setIngestResult(null);

    try {
      const res = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offset, batchSize }),
      });

      const data: IngestResult = await res.json();
      setIngestResult(data);

      if (data.success && data.nextOffset !== undefined) {
        setOffset(data.nextOffset);
        currentOffsetRef.current = data.nextOffset;
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
    setAutoProgress({ current: 0, total: autoBatches, totalAdded: 0, totalSkipped: 0 });
    setIngestResult(null);
    let cumulativeAdded = 0;
    let cumulativeSkipped = 0;

    for (let i = 0; i < autoBatches; i++) {
      if (stopAutoRef.current) break;

      setAutoProgress(p => ({ ...p, current: i + 1 }));

      try {
        const res = await fetch('/api/ingest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            offset: currentOffsetRef.current,
            batchSize,
          }),
        });

        const data: IngestResult = await res.json();

        if (!data.success) {
          setIngestResult(data);
          break;
        }

        cumulativeAdded += data.added ?? 0;
        cumulativeSkipped += data.alreadyExists ?? 0;

        if (data.nextOffset !== undefined) {
          setOffset(data.nextOffset);
          currentOffsetRef.current = data.nextOffset;
        }

        setAutoProgress(p => ({
          ...p,
          totalAdded: cumulativeAdded,
          totalSkipped: cumulativeSkipped,
        }));

        // Stop if we've reached the end
        if (data.finished) break;

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
      alreadyExists: cumulativeSkipped,
      message: `Auto-run complete: ${cumulativeAdded} added, ${cumulativeSkipped} already in DB across ${autoBatches} batches.`,
    });
  };

  const dbConnected = !statsError;
  const totalAvailable = stats.totalGettyAvailable ?? 0;
  const progressPct = totalAvailable > 0 ? Math.round((stats.gettyArtworks / totalAvailable) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
      {/* Stats error banner */}
      {statsError && (
        <div className="p-4 bg-red-100 border border-red-300 rounded-xl text-sm">
          <p className="text-red-700 font-semibold mb-1">Supabase Connection Error</p>
          <p className="text-red-600 text-xs font-mono mb-3">{statsError}</p>
          <div className="text-xs text-red-700 space-y-1">
            <p>1. Check <code className="bg-red-200 px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code> in <code className="bg-red-200 px-1 rounded">.env.local</code></p>
            <p>2. Check <code className="bg-red-200 px-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code></p>
            <p>3. Check <code className="bg-red-200 px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code> (required for ingestion)</p>
            <p>4. Run <code className="bg-red-200 px-1 rounded">supabase/schema.sql</code> in Supabase SQL Editor</p>
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div>
        <h2 className="text-xs uppercase tracking-widest text-neutral-700 font-medium mb-4">Database Overview</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Artworks"
            value={isLoadingStats ? '—' : stats.totalArtworks.toLocaleString()}
            sub="stored in Supabase"
          />
          <StatCard
            label="Getty Sourced"
            value={isLoadingStats ? '—' : stats.gettyArtworks.toLocaleString()}
            sub={totalAvailable > 0 ? `${progressPct}% of ${totalAvailable.toLocaleString()} available` : 'via SPARQL'}
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
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="font-semibold text-neutral-900">J. Paul Getty Museum — SPARQL Ingestion</h2>
          <p className="text-xs text-neutral-700 mt-1.5 leading-relaxed">
            Queries the Getty SPARQL endpoint to discover all artworks with images (~{totalAvailable > 0 ? totalAvailable.toLocaleString() : '123,500'} objects).
            Each batch fetches unique object URIs, skips already-ingested ones instantly, and fetches only new objects from Getty.
          </p>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Config row */}
          <div className="flex items-end gap-6 flex-wrap">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-neutral-700 block mb-1.5">Offset</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  step={batchSize}
                  value={offset}
                  onChange={e => setOffset(Number(e.target.value))}
                  disabled={isIngesting || autoRunning}
                  className="w-28 bg-gray-100 border border-gray-200 text-sm text-neutral-900 rounded-lg px-3 py-2 focus:outline-none focus:border-[#2e53ff]/50 tabular-nums"
                />
                {offset !== 0 && (
                  <button
                    onClick={() => setOffset(0)}
                    className="text-xs text-neutral-700 hover:text-neutral-900 transition-colors"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest text-neutral-600 block mb-1.5">Batch size</label>
              <select
                value={batchSize}
                onChange={e => setBatchSize(Number(e.target.value))}
                disabled={isIngesting || autoRunning}
                className="bg-gray-100 border border-gray-200 text-sm text-neutral-900 rounded-lg px-3 py-2 focus:outline-none focus:border-[#2e53ff]/50 cursor-pointer"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            {totalAvailable > 0 && (
              <div className="flex-1 min-w-[200px]">
                <label className="text-[10px] uppercase tracking-widest text-neutral-600 block mb-1.5">
                  Collection progress
                </label>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#2e53ff] h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(progressPct, 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-neutral-600 mt-1">
                  {stats.gettyArtworks.toLocaleString()} / {totalAvailable.toLocaleString()} objects ingested
                </p>
              </div>
            )}
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
                  : 'bg-amber-500 text-neutral-900 hover:bg-amber-400 active:scale-[0.98] shadow-[0_0_20px_rgba(30,90,150,0.15)]'
              }`}
            >
              {isIngesting ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-[1.5px] border-gray-600 border-t-transparent rounded-full animate-spin" />
                  Ingesting…
                </span>
              ) : (
                `Ingest ${batchSize} objects from offset ${offset.toLocaleString()}`
              )}
            </button>

            <button
              onClick={onRefreshStats}
              disabled={isLoadingStats}
              className="text-xs text-neutral-700 hover:text-neutral-900 transition-colors"
            >
              Refresh stats
            </button>
          </div>

          {/* Auto-run */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-neutral-900">Auto-Run Mode</p>
                <p className="text-[10px] text-neutral-600 mt-0.5">
                  Chain multiple batches — offset advances after each batch
                </p>
              </div>
              {autoRunning && (
                <div className="text-right">
                  <p className="text-xs text-amber-400 font-mono tabular-nums">
                    Batch {autoProgress.current}/{autoProgress.total}
                  </p>
                  <p className="text-[10px] text-neutral-500">
                    +{autoProgress.totalAdded} added, {autoProgress.totalSkipped} skipped
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
                  className="bg-gray-100 border border-gray-200 text-sm text-neutral-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-amber-500/50 cursor-pointer"
                >
                  {[10, 25, 50, 100].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <p className="text-[10px] text-neutral-600">
                ≈ {(autoBatches * batchSize).toLocaleString()} unique objects checked
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
            Tip: The offset advances automatically after each batch. Use Auto-Run to ingest the full Getty collection hands-free.
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
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { label: 'Added', value: ingestResult.added ?? 0, color: 'text-emerald-400' },
                      { label: 'Already in DB', value: ingestResult.alreadyExists ?? 0, color: 'text-blue-400' },
                      { label: 'No Image', value: ingestResult.noImage ?? 0, color: 'text-neutral-500' },
                      { label: 'Fetch Failed', value: ingestResult.fetchFailed ?? 0, color: 'text-red-400' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="bg-black/20 rounded-lg px-3 py-2">
                        <p className="text-[10px] text-neutral-600 mb-0.5">{label}</p>
                        <p className={`text-xl font-bold tabular-nums ${color}`}>{value}</p>
                      </div>
                    ))}
                  </div>
                  {ingestResult.nextOffset !== undefined && !ingestResult.finished && (
                    <p className="text-xs text-neutral-500">
                      Next batch starts at offset{' '}
                      <span className="text-neutral-300 font-mono">{ingestResult.nextOffset.toLocaleString()}</span>
                    </p>
                  )}
                  {ingestResult.finished && (
                    <p className="text-xs text-emerald-400/80 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                      🎉 Reached the end of the Getty collection! All available objects have been processed.
                    </p>
                  )}
                  {ingestResult.errors && ingestResult.errors.length > 0 && (
                    <details className="text-xs">
                      <summary className="text-amber-500/60 cursor-pointer hover:text-amber-400 transition-colors">
                        {ingestResult.errors.length} errors (expand)
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
                      {log.metadata?.source && (
                        <span className="text-neutral-700">via {log.metadata.source}</span>
                      )}
                      {log.metadata?.offset !== undefined && (
                        <span className="text-neutral-700">offset {log.metadata.offset.toLocaleString()}</span>
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
