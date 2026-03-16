// app/page.tsx
// Atlas of Art — Homepage
// Left sidebar panel + immersive dark map + bottom timeline + floating marker cards

'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import TimelineShell from '@/components/controls/TimelineShell';
import ExpandedArtworkDetail from '@/components/map/ExpandedArtworkDetail';
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
      aria-current={active ? 'page' : undefined}
      className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:ring-offset-2 focus:ring-offset-[#0d0d11] ${
        active
          ? 'bg-gradient-to-r from-amber-500/15 to-amber-500/5 border border-amber-500/20 text-white'
          : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.05] border border-transparent'
      }`}
    >
      <span className={`transition-colors ${active ? 'text-amber-400' : 'text-neutral-600'}`}>{icon}</span>
      <span className={active ? 'font-medium text-white' : 'font-normal'}>{label}</span>
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
    image_width: row.image_width || null,
    image_height: row.image_height || null,
  };
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Home() {
  const [allArtworks, setAllArtworks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [isEmpty, setIsEmpty] = useState(false);

  const [selectedArtworkId, setSelectedArtworkId] = useState<string | null>(null);
  const [isExpandedDetailOpen, setIsExpandedDetailOpen] = useState(false);
  const [timelineMaxYear, setTimelineMaxYear] = useState(2000);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedMedium, setSelectedMedium] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

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

  // Debounce search query — avoid excessive filtering on large datasets
  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchQuery]);

  const filteredArtworks = useMemo(() => {
    let result = allArtworks;

    if (timelineMaxYear < 2000) {
      result = result.filter(a => (a.year_start ?? -9999) <= timelineMaxYear);
    }

    if (debouncedSearchQuery.trim()) {
      const q = debouncedSearchQuery.toLowerCase();
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
  }, [allArtworks, timelineMaxYear, debouncedSearchQuery, selectedRegion, selectedMedium]);

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
    setSelectedArtworkId(prev => {
      // Switching to a different artwork — collapse any expanded view
      if (id && prev !== id) setIsExpandedDetailOpen(false);
      return prev === id ? null : id;
    });
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
      <aside className="hidden lg:flex w-[290px] shrink-0 flex-col bg-gradient-to-b from-[#111215] to-[#0d0d11] border-r border-white/[0.08] overflow-hidden z-20">

        {/* Brand */}
        <div className="px-5 pt-6 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg border border-white/15 flex items-center justify-center bg-gradient-to-br from-white/8 to-white/4 shrink-0">
              <GlobeIcon />
            </div>
            <h1 className="text-[14px] font-light text-white tracking-tight leading-none">
              Atlas <span className="font-extralight text-neutral-500">of Art</span>
            </h1>
          </div>
          <p className="mt-3 text-[11px] text-neutral-600 leading-relaxed">
            Explore global artworks by place and era.
          </p>
        </div>

        <div className="border-t border-white/[0.04] mx-4" />

        {/* Navigation */}
        <nav className="px-2.5 py-2.5 space-y-0.5">
          <NavItem icon={<MapIcon />} label="Map" active href="/" />
          <NavItem icon={<TimelineIcon />} label="Timeline" href="/" />
          <NavItem icon={<GridIcon />} label="Artworks" href="/admin" />
          <NavItem icon={<BookmarkIcon />} label="Collections" href="/collections" />
        </nav>

        <div className="border-t border-white/[0.05] mx-4 my-1" />

        {/* Search + Filters */}
        <div className="px-3.5 py-3">
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-600 pointer-events-none">
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="Search artworks…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg pl-9 pr-3 py-2.5 text-[12px] text-neutral-200 placeholder-neutral-700 focus:outline-none focus:bg-white/[0.06] focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all duration-200"
              aria-label="Search artworks"
              aria-describedby="search-help"
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
            className={`mt-3 flex items-center gap-1.5 text-[11px] font-medium transition-all duration-200 px-2 py-1.5 rounded-lg ${
              showFilters || selectedRegion || selectedMedium
                ? 'text-amber-400 bg-amber-500/10'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            <span>Filters</span>
            {(selectedRegion || selectedMedium) && (
              <span className="ml-auto bg-amber-500/30 text-amber-300 px-2 py-0.5 rounded text-[9px] font-semibold">
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
                        aria-pressed={selectedRegion === r}
                        className={`px-2 py-1 text-[10px] rounded-full transition-all border focus:outline-none focus:ring-1 focus:ring-amber-500/50 active:scale-95 ${
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
                        aria-pressed={selectedMedium === m}
                        className={`px-2 py-1 text-[10px] rounded-full transition-all border focus:outline-none focus:ring-1 focus:ring-amber-500/50 active:scale-95 ${
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

        {/* Hint / Empty state */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden flex items-center justify-center px-4 py-8">
          <div className="text-center">
            {filteredArtworks.length === 0 && hasFilters ? (
              <>
                <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-400/60">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <p className="text-[11px] text-neutral-600 leading-relaxed font-light mb-2">
                  No artworks match your filters
                </p>
                <button
                  onClick={clearFilters}
                  className="text-[10px] text-amber-400 hover:text-amber-300 transition-colors font-medium"
                >
                  Clear filters to see all
                </button>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/[0.08] flex items-center justify-center mx-auto mb-4">
                  <MapIcon />
                </div>
                <p className="text-[11px] text-neutral-600 leading-relaxed font-light">
                  Click a marker on the map to explore artwork details
                </p>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/[0.04] bg-gradient-to-b from-transparent to-black/10 px-4 py-3.5 flex items-center justify-between">
          <span className="text-[10px] text-neutral-600">
            <span className="text-amber-400 font-semibold">{filteredArtworks.length}</span>
            <span className="text-neutral-700"> of </span>
            <span className="text-neutral-600">{allArtworks.length}</span>
          </span>
          <a href="/admin" className="text-[10px] text-neutral-700 hover:text-amber-400 transition-colors font-light">
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
            selectedArtwork={!isExpandedDetailOpen ? selectedArtwork : null}
            onArtworkClick={handleArtworkClick}
            onDoubleClick={() => setIsExpandedDetailOpen(true)}
            onArtworkClose={() => setSelectedArtworkId(null)}
          />

          {/* Expanded artwork detail overlay */}
          {selectedArtwork && isExpandedDetailOpen && (
            <ExpandedArtworkDetail
              artwork={selectedArtwork}
              onClose={() => setIsExpandedDetailOpen(false)}
            />
          )}

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
