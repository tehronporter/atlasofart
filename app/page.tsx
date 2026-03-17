// app/page.tsx
// Atlas of Art — Homepage
// Left sidebar + immersive dark map + nearby tray + timeline + all UX improvements

'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import TimelineShell from '@/components/controls/TimelineShell';
import ExpandedArtworkDetail from '@/components/map/ExpandedArtworkDetail';
import NearbyArtworksTray from '@/components/map/NearbyArtworksTray';
import ClusterListCard from '@/components/map/ClusterListCard';
import MobileSearchSheet from '@/components/mobile/MobileSearchSheet';
import Toast from '@/components/common/Toast';
import AuthButton from '@/components/auth/AuthButton';
import UserProfileSection from '@/components/dashboard/UserProfileSection';
import UserQuickLinks from '@/components/dashboard/UserQuickLinks';
import AdminSection from '@/components/dashboard/AdminSection';
import { trackArtworkView } from '@/lib/auth';
import type { MapCommand } from '@/components/map/MapShell';

const MapShell = dynamic(() => import('@/components/map/MapShell'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#0a0a0f] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-amber-500/60 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

// ── Icons ─────────────────────────────────────────────────────────────────────

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
function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
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
function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
function FitIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
    </svg>
  );
}
function DiceIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width="20" height="20" rx="3" />
      <circle cx="8" cy="8" r="1.5" fill="currentColor" />
      <circle cx="16" cy="8" r="1.5" fill="currentColor" />
      <circle cx="8" cy="16" r="1.5" fill="currentColor" />
      <circle cx="16" cy="16" r="1.5" fill="currentColor" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}
function ShareIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

// ── Haversine distance (km) ────────────────────────────────────────────────────
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Nav item ──────────────────────────────────────────────────────────────────
function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:ring-offset-2 focus:ring-offset-[#0d0d11] ${
        active
          ? 'bg-gradient-to-r from-amber-500/15 to-amber-500/5 border border-amber-500/20 text-white'
          : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.05] border border-transparent'
      }`}
    >
      <span className={`transition-colors ${active ? 'text-amber-400' : 'text-neutral-600'}`}>{icon}</span>
      <span className={active ? 'font-medium text-white' : 'font-normal'}>{label}</span>
    </button>
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
  // ── Data ────────────────────────────────────────────────────────────────────
  const [allArtworks, setAllArtworks] = useState<any[]>([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [dbError, setDbError]         = useState<string | null>(null);
  const [isEmpty, setIsEmpty]         = useState(false);

  // ── UI state ────────────────────────────────────────────────────────────────
  const [selectedArtworkId, setSelectedArtworkId]       = useState<string | null>(null);
  const [isExpandedDetailOpen, setIsExpandedDetailOpen] = useState(false);
  const [timelineMaxYear, setTimelineMaxYear]           = useState(2000);
  const [searchQuery, setSearchQuery]                   = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion]             = useState<string | null>(null);
  const [selectedMedium, setSelectedMedium]             = useState<string | null>(null);
  const [showFilters, setShowFilters]                   = useState(false);
  const [currentView, setCurrentView]                   = useState<'map' | 'artworks'>('map');
  const [mobileSheetOpen, setMobileSheetOpen]           = useState(false);

  // ── Map command (fit / flyTo) ────────────────────────────────────────────────
  const [mapCommand, setMapCommand] = useState<MapCommand | null>(null);

  // ── Visible count reported by MapShell ──────────────────────────────────────
  const [visibleCount, setVisibleCount] = useState(0);

  // ── Breadcrumb history (last 5 viewed artwork IDs) ──────────────────────────
  const [viewHistory, setViewHistory] = useState<string[]>([]);

  // ── Share toast ─────────────────────────────────────────────────────────────
  const [showCopied, setShowCopied] = useState(false);

  // ── Toast notifications ──────────────────────────────────────────────────────
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' | 'error' } | null>(null);

  // ── Cluster data (from MapShell) ──────────────────────────────────────────────
  const [clusterArtworks, setClusterArtworks] = useState<any[]>([]);
  const [clusterCenter, setClusterCenter] = useState<[number, number] | null>(null);

  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // ── Fetch all artworks ───────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        let page = 0;
        const limit = 5000;
        let allRows: any[] = [];
        let hasMore = true;
        while (hasMore) {
          const res = await fetch(`/api/artworks?page=${page}&limit=${limit}`);
          if (!res.ok) throw new Error((await res.text()) || `HTTP ${res.status}`);
          const json = await res.json();
          if (cancelled) return;
          allRows = [...allRows, ...json.artworks];
          hasMore = json.hasMore;
          page++;
        }
        if (cancelled) return;
        if (allRows.length > 0) {
          setAllArtworks(allRows.map(transformRow));
          setIsEmpty(false);
        } else {
          setIsEmpty(true);
        }
      } catch (err: any) {
        if (!cancelled) { console.error(err.message); setDbError(err.message); }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  // ── Read URL params on mount ────────────────────────────────────────────────
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const artwork = p.get('artwork');
    if (artwork) setSelectedArtworkId(artwork);
    const region = p.get('region');
    if (region) setSelectedRegion(region);
    const medium = p.get('medium');
    if (medium) setSelectedMedium(medium);
    const q = p.get('q');
    if (q) setSearchQuery(q);
  }, []);

  // ── Write URL params when state changes ────────────────────────────────────
  useEffect(() => {
    const p = new URLSearchParams();
    if (selectedArtworkId)   p.set('artwork', selectedArtworkId);
    if (selectedRegion)      p.set('region', selectedRegion);
    if (selectedMedium)      p.set('medium', selectedMedium);
    if (debouncedSearchQuery) p.set('q', debouncedSearchQuery);
    const qs = p.toString();
    window.history.replaceState({}, '', qs ? `?${qs}` : window.location.pathname);
  }, [selectedArtworkId, selectedRegion, selectedMedium, debouncedSearchQuery]);

  // ── Debounce search ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300);
    return () => { if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current); };
  }, [searchQuery]);

  // ── Show toast when search returns no results ────────────────────────────────
  useEffect(() => {
    if ((searchQuery || selectedRegion || selectedMedium) && allArtworks.length > 0 && filteredArtworks.length === 0) {
      setToast({ message: 'No artworks match your filters. Try adjusting your search.', type: 'info' });
    }
  }, [searchQuery, selectedRegion, selectedMedium, filteredArtworks.length, allArtworks.length]);

  // ── Filtered artworks ───────────────────────────────────────────────────────
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

  // ── Nearby artworks (sorted by Haversine distance from selected) ───────────
  const nearbyArtworks = useMemo(() => {
    if (!selectedArtwork || (!selectedArtwork.lat && !selectedArtwork.lng)) return [];
    return filteredArtworks
      .filter(a => a.id !== selectedArtwork.id && (a.lat !== 0 || a.lng !== 0))
      .map(a => ({ ...a, _dist: haversineKm(selectedArtwork.lat, selectedArtwork.lng, a.lat, a.lng) }))
      .sort((a, b) => a._dist - b._dist)
      .slice(0, 10);
  }, [selectedArtwork, filteredArtworks]);

  // ── Artwork selection ───────────────────────────────────────────────────────
  const handleArtworkClick = useCallback((artwork: any) => {
    const id = artwork?.id || null;
    setSelectedArtworkId(prev => {
      if (id && prev !== id) setIsExpandedDetailOpen(false);
      return prev === id ? null : id;
    });
    if (id) {
      trackArtworkView(id).catch(() => {});
      setViewHistory(prev => {
        const filtered = prev.filter(x => x !== id);
        return [id, ...filtered].slice(0, 5);
      });
    }
  }, []);

  // ── Surprise Me — fly to a random artwork ──────────────────────────────────
  const handleSurpriseMe = useCallback(() => {
    if (filteredArtworks.length === 0) return;
    const pick = filteredArtworks[Math.floor(Math.random() * filteredArtworks.length)];
    setSelectedArtworkId(pick.id);
    setIsExpandedDetailOpen(false);
    setMapCommand({ type: 'flyTo', lat: pick.lat, lng: pick.lng, zoom: 9 });
    trackArtworkView(pick.id).catch(() => {});
    setViewHistory(prev => [pick.id, ...prev.filter(x => x !== pick.id)].slice(0, 5));
  }, [filteredArtworks]);

  // ── Fit map to all filtered artworks ───────────────────────────────────────
  const handleFitToResults = useCallback(() => {
    if (filteredArtworks.length === 0) return;
    const lats = filteredArtworks.map(a => a.lat).filter(Boolean);
    const lngs = filteredArtworks.map(a => a.lng).filter(Boolean);
    if (lats.length === 0) return;
    setMapCommand({
      type: 'fitBounds',
      bounds: [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
      ],
    });
  }, [filteredArtworks]);

  // ── Share — copy current URL to clipboard ──────────────────────────────────
  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setShowCopied(true);
      setToast({ message: 'Link copied to clipboard', type: 'success' });
      setTimeout(() => setShowCopied(false), 2000);
    }).catch(() => {
      setToast({ message: 'Failed to copy link', type: 'error' });
    });
  }, []);

  // ── Keyboard navigation ─────────────────────────────────────────────────────
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      // Don't intercept when typing in an input
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
      if (e.key === 'Escape') {
        if (isExpandedDetailOpen) { setIsExpandedDetailOpen(false); return; }
        if (selectedArtworkId) { setSelectedArtworkId(null); return; }
      }
      if (!selectedArtwork || isExpandedDetailOpen) return;
      if (e.key === 'ArrowRight' && nearbyArtworks.length > 0) {
        const idx = nearbyArtworks.findIndex(a => a.id === selectedArtworkId);
        const next = nearbyArtworks[(idx + 1) % nearbyArtworks.length];
        if (next) {
          setSelectedArtworkId(next.id);
          setMapCommand({ type: 'flyTo', lat: next.lat, lng: next.lng });
          setViewHistory(prev => [next.id, ...prev.filter(x => x !== next.id)].slice(0, 5));
        }
      }
      if (e.key === 'ArrowLeft' && nearbyArtworks.length > 0) {
        const idx = nearbyArtworks.findIndex(a => a.id === selectedArtworkId);
        const prev = nearbyArtworks[(idx - 1 + nearbyArtworks.length) % nearbyArtworks.length];
        if (prev) {
          setSelectedArtworkId(prev.id);
          setMapCommand({ type: 'flyTo', lat: prev.lat, lng: prev.lng });
          setViewHistory(prevH => [prev.id, ...prevH.filter(x => x !== prev.id)].slice(0, 5));
        }
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedArtwork, selectedArtworkId, nearbyArtworks, isExpandedDetailOpen]);

  const clearFilters = () => { setSearchQuery(''); setSelectedRegion(null); setSelectedMedium(null); };
  const hasFilters = searchQuery || selectedRegion || selectedMedium;

  // ── Artwork history objects (for breadcrumb display) ────────────────────────
  const historyArtworks = useMemo(
    () => viewHistory.map(id => allArtworks.find(a => a.id === id)).filter(Boolean) as any[],
    [viewHistory, allArtworks]
  );

  // ── Loading ────────────────────────────────────────────────────────────────
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

  if (dbError) {
    return (
      <div className="h-screen w-full bg-[#0a0a0f] flex items-center justify-center p-8">
        <div className="max-w-md text-center">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-red-400">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">Database Connection Error</h2>
          <p className="text-neutral-500 text-sm mb-4">{dbError}</p>
          <div className="flex gap-3 justify-center">
            <a href="/admin" className="px-4 py-2 bg-amber-500 text-neutral-900 rounded-lg font-medium text-sm hover:bg-amber-400">Admin Panel</a>
            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-neutral-300 hover:bg-neutral-700">Retry</button>
          </div>
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="h-screen w-full bg-[#0a0a0f] flex items-center justify-center p-8">
        <div className="max-w-md text-center">
          <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-5">
            <GlobeIcon />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">Collection is Empty</h2>
          <p className="text-neutral-500 text-sm mb-6 leading-relaxed">
            The database has no artworks yet. Run Getty ingestion from the admin panel to populate the collection.
          </p>
          <div className="flex gap-3 justify-center">
            <a href="/admin" className="px-5 py-2.5 bg-amber-500 text-neutral-900 rounded-lg font-medium text-sm hover:bg-amber-400 transition-colors">Go to Admin</a>
            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-neutral-300 hover:bg-neutral-700 transition-colors">Refresh</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main layout ────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen w-full bg-white overflow-hidden select-none">

      {/* ── LEFT SIDEBAR ──────────────────────────────────────────────────────── */}
      <aside className="hidden lg:flex w-[220px] shrink-0 flex-col bg-[#1e5a96] border-r border-white/20 overflow-hidden z-20">

        {/* Brand */}
        <div className="px-5 pt-6 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg border border-white/25 flex items-center justify-center bg-white/15 shrink-0">
              <GlobeIcon />
            </div>
            <h1 className="text-[14px] font-light text-white tracking-tight leading-none">
              Atlas <span className="font-extralight text-white/70">of Art</span>
            </h1>
          </div>
          <p className="mt-3 text-[11px] text-white/70 leading-relaxed">
            Explore global artworks by place and era.
          </p>
        </div>

        <div className="border-t border-white/[0.15] mx-4" />

        {/* Navigation */}
        <nav className="px-2.5 py-2.5 space-y-0.5">
          <NavItem icon={<MapIcon />} label="Map" active={currentView === 'map'} onClick={() => setCurrentView('map')} />
          <NavItem icon={<GridIcon />} label="Artworks" active={currentView === 'artworks'} onClick={() => setCurrentView('artworks')} />
        </nav>

        <div className="border-t border-white/[0.05] mx-4 my-1" />

        {/* Search + Filters */}
        <div className="px-3.5 py-3 space-y-2.5">
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-600 pointer-events-none">
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="Search artworks…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg pl-9 pr-8 py-2.5 text-[12px] text-neutral-200 placeholder-neutral-700 focus:outline-none focus:bg-white/[0.06] focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all duration-200"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-400">
                <XIcon />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowFilters(f => !f)}
            className={`w-full flex items-center gap-1.5 text-[11px] font-medium transition-all duration-200 px-2.5 py-2 rounded-lg border ${
              showFilters || selectedRegion || selectedMedium
                ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.04] border-white/[0.08]'
            }`}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
            <div className="mt-2 space-y-3 pb-2 max-h-64 overflow-y-auto">
              {regions.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-neutral-600 mb-1.5 px-0.5">Region</p>
                  <div className="flex flex-wrap gap-1.5">
                    {regions.slice(0, 10).map(r => (
                      <button
                        key={r}
                        onClick={() => setSelectedRegion(prev => prev === r ? null : r)}
                        className={`px-2 py-1 text-[10px] rounded-full transition-all border ${
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
                        className={`px-2 py-1 text-[10px] rounded-full transition-all border ${
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
                <button onClick={clearFilters} className="text-[10px] text-neutral-600 hover:text-neutral-400 transition-colors px-0.5">
                  ✕ Clear all filters
                </button>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-white/[0.05] mx-4 my-1" />

        {/* Hint / empty state */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden flex items-center justify-center px-4 py-8">
          <div className="text-center">
            {filteredArtworks.length === 0 && hasFilters ? (
              <>
                <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-400/60">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <p className="text-[11px] text-neutral-600 leading-relaxed font-light mb-2">No artworks match your filters</p>
                <button onClick={clearFilters} className="text-[10px] text-amber-400 hover:text-amber-300 transition-colors font-medium">
                  Clear filters
                </button>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/[0.08] flex items-center justify-center mx-auto mb-4">
                  <MapIcon />
                </div>
                <p className="text-[11px] text-neutral-600 leading-relaxed font-light">
                  Click a marker to explore artwork details
                </p>
              </>
            )}
          </div>
        </div>

        {/* Viewed history breadcrumb */}
        {historyArtworks.length > 0 && (
          <div className="px-3.5 py-3 border-t border-white/[0.04]">
            <p className="text-[9px] uppercase tracking-widest text-neutral-700 mb-2">Recently Viewed</p>
            <div className="flex items-center gap-1.5">
              {historyArtworks.map(a => (
                <button
                  key={a.id}
                  onClick={() => handleArtworkClick(a)}
                  title={a.title}
                  className={`w-9 h-9 rounded-lg overflow-hidden border shrink-0 transition-all duration-200 ${
                    a.id === selectedArtworkId
                      ? 'border-amber-500/60 ring-1 ring-amber-500/30'
                      : 'border-white/[0.06] hover:border-white/[0.15]'
                  }`}
                >
                  {a.image_url ? (
                    <img src={a.image_url} alt={a.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-neutral-800/60 flex items-center justify-center">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-neutral-700">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-white/[0.04] bg-gradient-to-b from-transparent to-black/10 flex-1 overflow-y-auto flex flex-col">
          <div className="flex-1 overflow-y-auto">
            <UserProfileSection />
            <UserQuickLinks />
            <AdminSection />
          </div>
          <div className="border-t border-white/[0.04] px-4 py-3.5 mt-auto">
            <div className="mb-3"><AuthButton /></div>
            <span className="text-[10px] text-white/70 flex items-center justify-between">
              <span>
                <span className="text-amber-300 font-semibold">{filteredArtworks.length}</span>
                <span className="text-white/60"> of </span>
                <span className="text-white/70">{allArtworks.length}</span>
              </span>
            </span>
          </div>
        </div>
      </aside>

      {/* ── CONTENT AREA ──────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 relative">

        {/* Map View */}
        {currentView === 'map' && (
          <div className="flex-1 flex flex-row min-w-0 relative">
            {/* Left section: Map + Controls + Cluster List */}
            <div className="flex-1 flex flex-col min-w-0 relative">
              {/* Map container */}
              <div className="flex-1 relative min-h-0">
              <MapShell
                artworks={filteredArtworks}
                selectedArtworkId={selectedArtworkId}
                selectedArtwork={!isExpandedDetailOpen ? selectedArtwork : null}
                onArtworkClick={handleArtworkClick}
                onExpand={() => setIsExpandedDetailOpen(true)}
                onDoubleClick={() => setIsExpandedDetailOpen(true)}
                onArtworkClose={() => setSelectedArtworkId(null)}
                mapCommand={mapCommand}
                onMapCommandDone={() => setMapCommand(null)}
                onVisibleCountChange={setVisibleCount}
                onClusterChange={(artworks, center) => {
                  setClusterArtworks(artworks);
                  setClusterCenter(center);
                }}
              />

              {/* Expanded detail modal */}
              {selectedArtwork && isExpandedDetailOpen && (
                <ExpandedArtworkDetail
                  artwork={selectedArtwork}
                  onClose={() => setIsExpandedDetailOpen(false)}
                  nearbyArtworks={nearbyArtworks}
                  onNavigate={artwork => {
                    setSelectedArtworkId(artwork.id);
                    setMapCommand({ type: 'flyTo', lat: artwork.lat, lng: artwork.lng });
                    setViewHistory(prev => [artwork.id, ...prev.filter(x => x !== artwork.id)].slice(0, 5));
                  }}
                />
              )}

              {/* ── Top controls (left on lg+, right on smaller screens) ────────────── */}
              <div className="absolute top-4 left-4 lg:right-4 lg:left-auto z-10 flex flex-col lg:items-end items-start gap-2">
                {/* Count + visible */}
                <div
                  className="pointer-events-none px-3 py-1.5 rounded-lg"
                  style={{ background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' }}
                >
                  <p className="text-[11px] text-neutral-400">
                    <span className="text-amber-400 font-semibold">{filteredArtworks.length}</span>
                    {' artworks'}
                    {visibleCount > 0 && visibleCount < filteredArtworks.length && (
                      <span className="text-neutral-600"> · <span className="text-neutral-500">{visibleCount} in view</span></span>
                    )}
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1.5 pointer-events-auto">
                  {/* Fit to results */}
                  <button
                    onClick={handleFitToResults}
                    title="Fit map to all results"
                    className="h-8 px-2.5 flex items-center gap-1.5 rounded-lg text-[10px] font-medium text-neutral-400 hover:text-white transition-all duration-200"
                    style={{ background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)' }}
                  >
                    <FitIcon />
                    Fit
                  </button>

                  {/* Surprise Me */}
                  <button
                    onClick={handleSurpriseMe}
                    title="Fly to a random artwork"
                    className="h-8 px-2.5 flex items-center gap-1.5 rounded-lg text-[10px] font-medium text-neutral-400 hover:text-amber-400 transition-all duration-200"
                    style={{ background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(245,158,11,0.3)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)'; }}
                  >
                    <DiceIcon />
                    Surprise
                  </button>

                  {/* Share */}
                  <button
                    onClick={handleShare}
                    title="Copy link to this view"
                    className="h-8 px-2.5 flex items-center gap-1.5 rounded-lg text-[10px] font-medium transition-all duration-200"
                    style={{
                      background: showCopied ? 'rgba(34,197,94,0.15)' : 'rgba(0,0,0,0.55)',
                      border: showCopied ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(12px)',
                      color: showCopied ? 'rgb(134,239,172)' : 'rgba(163,163,163,1)',
                    }}
                  >
                    <ShareIcon />
                    {showCopied ? 'Copied!' : 'Share'}
                  </button>
                </div>

                {/* Active filter chips */}
                {(selectedRegion || selectedMedium) && (
                  <div className="flex flex-col gap-1 items-end pointer-events-auto">
                    {selectedRegion && (
                      <button
                        onClick={() => setSelectedRegion(null)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] text-amber-400 hover:bg-amber-500/10 transition-colors"
                        style={{ background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(245,158,11,0.3)', backdropFilter: 'blur(12px)' }}
                      >
                        {selectedRegion} <XIcon />
                      </button>
                    )}
                    {selectedMedium && (
                      <button
                        onClick={() => setSelectedMedium(null)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] text-amber-400 hover:bg-amber-500/10 transition-colors"
                        style={{ background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(245,158,11,0.3)', backdropFilter: 'blur(12px)' }}
                      >
                        {selectedMedium.length > 22 ? selectedMedium.slice(0, 20) + '…' : selectedMedium} <XIcon />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Mobile search FAB */}
              <button
                onClick={() => setMobileSheetOpen(true)}
                className="lg:hidden absolute bottom-4 right-4 z-30 w-12 h-12 rounded-full flex items-center justify-center shadow-2xl transition-all duration-200 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #fb923c)', color: '#1a1000' }}
                aria-label="Open search"
              >
                <SearchIcon />
              </button>
            </div>

              {/* Nearby artworks tray — shown when artwork is selected */}
              {selectedArtwork && nearbyArtworks.length > 0 && !isExpandedDetailOpen && (
                <NearbyArtworksTray
                  artworks={nearbyArtworks}
                  selectedId={selectedArtworkId!}
                  onSelect={a => {
                    handleArtworkClick(a);
                    setMapCommand({ type: 'flyTo', lat: a.lat, lng: a.lng });
                  }}
                />
              )}

              {/* Cluster list — shown at bottom when cluster is selected */}
              {clusterArtworks.length > 0 && (
                <ClusterListCard
                  artworks={clusterArtworks}
                  center={clusterCenter}
                  onSelect={a => {
                    handleArtworkClick(a);
                    setMapCommand({ type: 'flyTo', lat: a.lat, lng: a.lng });
                  }}
                  onClose={() => {
                    setClusterArtworks([]);
                    setClusterCenter(null);
                  }}
                />
              )}
            </div>
            {/* End of left section */}

            {/* Right section: Timeline */}
            <div className="shrink-0 w-60 overflow-hidden hidden lg:flex flex-col bg-[#0e0f12]/95 border-l border-white/[0.05]">
              <TimelineShell
                artworks={allArtworks}
                maxYear={timelineMaxYear}
                onMaxYearChange={setTimelineMaxYear}
              />
            </div>
            {/* End of right section */}
          </div>
        )}

        {/* Artworks Grid View */}
        {currentView === 'artworks' && (
          <div className="flex-1 relative min-h-0 overflow-auto">
            <div className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredArtworks.map(artwork => (
                  <button
                    key={artwork.id}
                    onClick={() => handleArtworkClick(artwork)}
                    className="group relative overflow-hidden rounded-lg aspect-square bg-neutral-900 border border-neutral-800 hover:border-amber-500/50 transition-all duration-300"
                  >
                    {artwork.image_url && (
                      <img
                        src={artwork.image_url}
                        alt={artwork.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-2">
                        <p className="text-[11px] text-white font-medium line-clamp-2">{artwork.title}</p>
                        <p className="text-[9px] text-neutral-300 mt-0.5">{artwork.year}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              {filteredArtworks.length === 0 && (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-400/60">
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                    </div>
                    <p className="text-sm text-neutral-600 leading-relaxed font-light mb-3">No artworks match your filters</p>
                    <p className="text-xs text-neutral-700 mb-4">Try adjusting your search, region, or medium to find artworks</p>
                    {hasFilters && (
                      <button onClick={clearFilters} className="text-xs text-amber-400 hover:text-amber-300 transition-colors font-medium">
                        Clear all filters
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile search & filter sheet */}
      <MobileSearchSheet
        isOpen={mobileSheetOpen}
        onClose={() => setMobileSheetOpen(false)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        regions={regions}
        selectedRegion={selectedRegion}
        onRegionChange={setSelectedRegion}
        mediums={mediums}
        selectedMedium={selectedMedium}
        onMediumChange={setSelectedMedium}
        onClearFilters={clearFilters}
        filteredCount={filteredArtworks.length}
        totalCount={allArtworks.length}
      />

      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  );
}
