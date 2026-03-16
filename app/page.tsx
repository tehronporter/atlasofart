// app/page.tsx
// Atlas of Art — Homepage
// Left sidebar panel + immersive dark map + bottom timeline

'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import TimelineShell from '@/components/controls/TimelineShell';
import { supabase } from '@/lib/supabase';
import { trackArtworkView } from '@/lib/auth';

// Load map client-side only (Mapbox requires browser APIs)
const MapShell = dynamic(() => import('@/components/map/MapShell'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#0a0a0f] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-amber-500/60 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

// ── Icons ────────────────────────────────────────────────────────────────────

function GlobeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-300">
      <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}
function MapIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  );
}
function TimelineIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}
function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}
function BookmarkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
function PinIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
function ChevronRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

// ── Nav item ─────────────────────────────────────────────────────────────────

function NavItem({ icon, label, active, href }: { icon: React.ReactNode; label: string; active?: boolean; href?: string }) {
  return (
    <a
      href={href || '#'}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
        active
          ? 'bg-white/8 text-white'
          : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/4'
      }`}
    >
      <span className={active ? 'text-amber-400' : 'text-neutral-600'}>{icon}</span>
      <span className={active ? 'font-medium' : 'font-normal'}>{label}</span>
    </a>
  );
}

// ── Transform DB row → app artwork ───────────────────────────────────────────

function transformRow(row: any) {
  return {
    id: row.id,
    title: row.title || 'Untitled',
    year: row.date || (row.date_start ? String(row.date_start) : '?'),
    year_start: row.date_start ?? -3000,
    year_end: row.date_end ?? 2000,
    region: row.region || null,
    culture: row.culture || null,
    medium: row.medium || null,
    lat: Number(row.latitude) || 0,
    lng: Number(row.longitude) || 0,
    image_url: row.image_url_primary || row.image_url_thumbnail || null,
    description: row.description || null,
    current_museum: row.repository || null,
    place_created: row.place_created || null,
    tags: row.tags || [],
    artist_display: row.artist_display || null,
  };
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Home() {
  const [allArtworks, setAllArtworks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [isEmpty, setIsEmpty] = useState(false);

  const [selectedArtworkId, setSelectedArtworkId] = useState<string | null>(null);
  const [timelineMaxYear, setTimelineMaxYear] = useState(2000);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedMedium, setSelectedMedium] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch from Supabase — no seed fallback
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const { data, error } = await supabase
          .from('artworks')
          .select('*')
          .order('date_start', { ascending: true })
          .limit(1000);

        if (cancelled) return;
        if (error) throw error;

        if (data && data.length > 0) {
          setAllArtworks(data.map(transformRow));
          setIsEmpty(false);
        } else {
          setIsEmpty(true);
        }
      } catch (err: any) {
        if (cancelled) return;
        console.error('Supabase error:', err.message);
        setDbError(err.message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const filteredArtworks = useMemo(() => {
    let result = allArtworks;

    if (timelineMaxYear < 2000) {
      result = result.filter(a => (a.year_start ?? -9999) <= timelineMaxYear);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(a =>
        a.title?.toLowerCase().includes(q) ||
        a.culture?.toLowerCase().includes(q) ||
        a.region?.toLowerCase().includes(q) ||
        a.medium?.toLowerCase().includes(q) ||
        a.place_created?.toLowerCase().includes(q) ||
        a.artist_display?.toLowerCase().includes(q) ||
        (a.tags || []).some((t: string) => t.toLowerCase().includes(q))
      );
    }

    if (selectedRegion) result = result.filter(a => a.region === selectedRegion);
    if (selectedMedium) result = result.filter(a => a.medium === selectedMedium);

    // Only pass artworks with valid coordinates to the map
    return result.filter(a => a.lat !== 0 || a.lng !== 0);
  }, [allArtworks, timelineMaxYear, searchQuery, selectedRegion, selectedMedium]);

  const selectedArtwork = useMemo(
    () => allArtworks.find(a => a.id === selectedArtworkId) || null,
    [allArtworks, selectedArtworkId]
  );

  const regions = useMemo(() => {
    const s = new Set(allArtworks.map(a => a.region).filter(Boolean));
    return Array.from(s).sort() as string[];
  }, [allArtworks]);

  const mediums = useMemo(() => {
    const s = new Set(allArtworks.map(a => a.medium).filter(Boolean));
    return Array.from(s).sort() as string[];
  }, [allArtworks]);

  const handleArtworkClick = useCallback((artwork: any) => {
    const id = artwork?.id || null;
    setSelectedArtworkId(prev => prev === id ? null : id);
    if (id) trackArtworkView(id).catch(() => {});
  }, []);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedRegion(null);
    setSelectedMedium(null);
  };

  const hasFilters = searchQuery || selectedRegion || selectedMedium;

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="h-screen w-full bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-amber-500/60 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-500 text-sm tracking-wide">Loading collection…</p>
        </div>
      </div>
    );
  }

  // ── DB error ──────────────────────────────────────────────────────────────
  if (dbError) {
    return (
      <div className="h-screen w-full bg-[#0a0a0f] flex items-center justify-center p-8">
        <div className="max-w-md text-center">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">Database Connection Error</h2>
          <p className="text-neutral-500 text-sm mb-4">{dbError}</p>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-left text-xs text-neutral-500 mb-4 space-y-1">
            <p>1. Verify <code className="text-neutral-300">NEXT_PUBLIC_SUPABASE_URL</code> in <code className="text-neutral-300">.env.local</code></p>
            <p>2. Verify <code className="text-neutral-300">NEXT_PUBLIC_SUPABASE_ANON_KEY</code></p>
            <p>3. Run <code className="text-neutral-300">supabase/schema.sql</code> in Supabase SQL Editor</p>
          </div>
          <div className="flex gap-3 justify-center">
            <a href="/admin" className="px-4 py-2 bg-amber-500 text-neutral-900 rounded-lg font-medium text-sm hover:bg-amber-400">Admin Panel</a>
            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-neutral-300 hover:bg-neutral-700">Retry</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Empty DB ──────────────────────────────────────────────────────────────
  if (isEmpty) {
    return (
      <div className="h-screen w-full bg-[#0a0a0f] flex items-center justify-center p-8">
        <div className="max-w-md text-center">
          <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-5">
            <GlobeIcon />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">Collection is Empty</h2>
          <p className="text-neutral-500 text-sm mb-6 leading-relaxed">
            The database has no artworks yet. Run Getty ingestion from the admin panel to populate
            the collection with real museum data.
          </p>
          <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-4 text-left text-xs text-neutral-500 mb-5 space-y-1.5">
            <p className="text-neutral-400 font-medium mb-2">Quick setup:</p>
            <p>1. Run <code className="text-amber-400">supabase/schema.sql</code> in Supabase SQL Editor</p>
            <p>2. Add <code className="text-amber-400">SUPABASE_SERVICE_ROLE_KEY</code> to <code className="text-amber-400">.env.local</code></p>
            <p>3. Go to Admin → click <strong className="text-amber-400">Ingest from Getty</strong></p>
            <p>4. Return here — artworks will appear on the map</p>
          </div>
          <div className="flex gap-3 justify-center">
            <a href="/admin" className="px-5 py-2.5 bg-amber-500 text-neutral-900 rounded-lg font-medium text-sm hover:bg-amber-400 transition-colors">
              Go to Admin
            </a>
            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-neutral-300 hover:bg-neutral-700 transition-colors">
              Refresh
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main layout ───────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen w-full bg-[#0a0a0f] overflow-hidden select-none">

      {/* ── LEFT PANEL ─────────────────────────────────────────────────────── */}
      <aside className="w-[290px] shrink-0 flex flex-col bg-[#111215]/95 border-r border-white/[0.06] overflow-hidden z-20">

        {/* Brand */}
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full border border-white/15 flex items-center justify-center bg-white/4 shrink-0">
              <GlobeIcon />
            </div>
            <h1 className="text-[15px] font-semibold text-white tracking-tight leading-none">
              Atlas <em className="font-light text-neutral-400 not-italic">of</em> Art
            </h1>
          </div>
          <p className="mt-2.5 text-[11px] text-neutral-500 leading-relaxed pl-[2px]">
            Explore art by place and time.
          </p>
        </div>

        <div className="border-t border-white/[0.05] mx-4" />

        {/* Navigation */}
        <nav className="px-2.5 py-2.5 space-y-0.5">
          <NavItem icon={<MapIcon />} label="Map" active href="/" />
          <NavItem icon={<TimelineIcon />} label="Timeline" href="/" />
          <NavItem icon={<GridIcon />} label="Artworks" href="/admin" />
          <NavItem icon={<BookmarkIcon />} label="Collections" href="/collections" />
        </nav>

        <div className="border-t border-white/[0.05] mx-4 my-1" />

        {/* Search + Filters */}
        <div className="px-3 py-2.5">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600 pointer-events-none">
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="Search artworks, artists…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg pl-8 pr-3 py-2 text-[12.5px] text-neutral-300 placeholder-neutral-600 focus:outline-none focus:border-amber-500/40 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-400"
              >
                <XIcon />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowFilters(f => !f)}
            className={`mt-2 flex items-center gap-1.5 text-[11px] transition-colors ${
              showFilters || selectedRegion || selectedMedium
                ? 'text-amber-400'
                : 'text-neutral-600 hover:text-neutral-400'
            }`}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            Filters
            {(selectedRegion || selectedMedium) && (
              <span className="ml-1 bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded text-[10px]">
                {[selectedRegion, selectedMedium].filter(Boolean).length}
              </span>
            )}
          </button>

          {showFilters && (
            <div className="mt-2.5 space-y-3">
              {regions.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-neutral-600 mb-1.5 px-0.5">Region</p>
                  <div className="flex flex-wrap gap-1.5">
                    {regions.slice(0, 10).map(r => (
                      <button
                        key={r}
                        onClick={() => setSelectedRegion(prev => prev === r ? null : r)}
                        className={`px-2 py-1 text-[10px] rounded-full transition-colors border ${
                          selectedRegion === r
                            ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                            : 'border-white/[0.06] text-neutral-500 hover:text-neutral-300 hover:border-white/[0.12]'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {mediums.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-neutral-600 mb-1.5 px-0.5">Medium</p>
                  <div className="flex flex-wrap gap-1.5">
                    {mediums.slice(0, 8).map(m => (
                      <button
                        key={m}
                        onClick={() => setSelectedMedium(prev => prev === m ? null : m)}
                        className={`px-2 py-1 text-[10px] rounded-full transition-colors border ${
                          selectedMedium === m
                            ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                            : 'border-white/[0.06] text-neutral-500 hover:text-neutral-300 hover:border-white/[0.12]'
                        }`}
                      >
                        {m.length > 22 ? m.slice(0, 20) + '…' : m}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {hasFilters && (
                <button onClick={clearFilters} className="text-[10px] text-neutral-600 hover:text-neutral-400 transition-colors">
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-white/[0.05] mx-4 my-1" />

        {/* Selected artwork detail / empty hint */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {selectedArtwork ? (
            <div className="px-3 pb-3">
              <div className="rounded-xl overflow-hidden border border-white/[0.08] bg-white/[0.02]">
                {/* Image */}
                <div className="relative h-[150px] bg-neutral-900 overflow-hidden">
                  {selectedArtwork.image_url ? (
                    <img
                      src={selectedArtwork.image_url}
                      alt={selectedArtwork.title}
                      className="w-full h-full object-cover"
                      crossOrigin="anonymous"
                      onError={e => {
                        const el = e.target as HTMLImageElement;
                        el.style.display = 'none';
                        el.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  {/* Fallback shown if image fails or is null */}
                  <div className={`w-full h-full flex flex-col items-center justify-center text-neutral-700 ${selectedArtwork.image_url ? 'hidden' : ''}`}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                    </svg>
                    <span className="text-[10px] mt-2">No image available</span>
                  </div>
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  {/* Close */}
                  <button
                    onClick={() => setSelectedArtworkId(null)}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:bg-black/70 transition-colors"
                    aria-label="Close"
                  >
                    <XIcon />
                  </button>
                </div>

                {/* Metadata */}
                <div className="p-3">
                  <h3 className="text-[13px] font-semibold text-white leading-snug">
                    {selectedArtwork.title}
                  </h3>

                  {selectedArtwork.artist_display && (
                    <p className="text-[11px] text-neutral-400 mt-0.5 leading-snug">{selectedArtwork.artist_display}</p>
                  )}

                  {selectedArtwork.year && (
                    <p className="text-[11px] text-amber-400/80 mt-1 font-medium">{selectedArtwork.year}</p>
                  )}

                  {selectedArtwork.medium && (
                    <p className="text-[10px] text-neutral-500 mt-0.5 italic leading-relaxed">{selectedArtwork.medium}</p>
                  )}

                  {(selectedArtwork.place_created || selectedArtwork.current_museum) && (
                    <div className="mt-2 pt-2 border-t border-white/[0.06] space-y-1">
                      {selectedArtwork.place_created && (
                        <div className="flex items-center gap-1.5 text-neutral-500">
                          <PinIcon />
                          <span className="text-[10px]">{selectedArtwork.place_created}</span>
                        </div>
                      )}
                      {selectedArtwork.current_museum && (
                        <p className="text-[10px] text-neutral-600 pl-[18px]">{selectedArtwork.current_museum}</p>
                      )}
                    </div>
                  )}

                  {selectedArtwork.tags && selectedArtwork.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {selectedArtwork.tags.slice(0, 4).map((tag: string, i: number) => (
                        <span key={i} className="text-[9px] px-1.5 py-0.5 bg-white/[0.04] border border-white/[0.06] text-neutral-500 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {selectedArtwork.description && (
                    <p className="text-[10px] text-neutral-600 mt-2 leading-relaxed line-clamp-3">
                      {selectedArtwork.description}
                    </p>
                  )}

                  {selectedArtwork.getty_url && (
                    <a
                      href={selectedArtwork.getty_url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 w-full flex items-center justify-between px-3 py-2 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.07] rounded-lg text-[11px] text-neutral-400 hover:text-neutral-200 transition-colors"
                      onClick={e => e.stopPropagation()}
                    >
                      <span>View on Getty</span>
                      <ChevronRightIcon />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="px-4 py-6 text-center">
              <div className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto mb-3">
                <MapIcon />
              </div>
              <p className="text-[11px] text-neutral-600 leading-relaxed">
                Click any marker on the map to explore an artwork
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/[0.05] px-4 py-3 flex items-center justify-between">
          <span className="text-[11px] text-neutral-600">
            <span className="text-amber-400 font-medium">{filteredArtworks.length}</span>
            {' '}of{' '}
            <span className="text-neutral-500">{allArtworks.length}</span>
            {' '}artworks
          </span>
          <a href="/admin" className="text-[10px] text-neutral-700 hover:text-neutral-400 transition-colors">
            Admin
          </a>
        </div>
      </aside>

      {/* ── MAP + TIMELINE ───────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 relative">

        <div className="flex-1 relative min-h-0">
          <MapShell
            artworks={filteredArtworks}
            selectedArtworkId={selectedArtworkId}
            onArtworkClick={handleArtworkClick}
          />

          {/* Top-right: count badge */}
          <div className="absolute top-4 right-4 z-10 pointer-events-none">
            <div className="bg-black/50 backdrop-blur-md border border-white/[0.08] rounded-lg px-3 py-1.5">
              <p className="text-[11px] text-neutral-400">
                <span className="text-amber-400 font-semibold">{filteredArtworks.length}</span>
                {' '}artworks mapped
              </p>
            </div>
          </div>

          {/* Active filter chips */}
          {(selectedRegion || selectedMedium) && (
            <div className="absolute top-12 right-4 z-10 flex flex-col gap-1.5">
              {selectedRegion && (
                <button
                  onClick={() => setSelectedRegion(null)}
                  className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md border border-amber-500/30 rounded-lg px-2.5 py-1.5 text-[11px] text-amber-400 hover:bg-amber-500/10 transition-colors"
                >
                  {selectedRegion} <XIcon />
                </button>
              )}
              {selectedMedium && (
                <button
                  onClick={() => setSelectedMedium(null)}
                  className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md border border-amber-500/30 rounded-lg px-2.5 py-1.5 text-[11px] text-amber-400 hover:bg-amber-500/10 transition-colors"
                >
                  {selectedMedium.length > 22 ? selectedMedium.slice(0, 20) + '…' : selectedMedium}
                  <XIcon />
                </button>
              )}
            </div>
          )}
        </div>

        <TimelineShell
          artworks={allArtworks}
          maxYear={timelineMaxYear}
          onMaxYearChange={setTimelineMaxYear}
        />
      </div>
    </div>
  );
}
