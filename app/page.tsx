// app/page.tsx
// Atlas of Art — Homepage
// Left sidebar + immersive dark map + nearby tray + timeline + all UX improvements

'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import TimelineShell from '@/components/controls/TimelineShell';
import ExpandedArtworkDetail from '@/components/map/ExpandedArtworkDetail';
import MobileSearchSheet from '@/components/mobile/MobileSearchSheet';
import MobileTabBar, { type TabType } from '@/components/mobile/MobileTabBar';
import MobileSearchBar from '@/components/mobile/MobileSearchBar';
import BottomSheet from '@/components/mobile/BottomSheet';
import ArtworkDetailSheet from '@/components/mobile/ArtworkDetailSheet';
import SavedScreen from '@/components/mobile/SavedScreen';
import ProfileScreen from '@/components/mobile/ProfileScreen';
import Toast from '@/components/common/Toast';
import AuthButton from '@/components/auth/AuthButton';
import UserProfileSection from '@/components/dashboard/UserProfileSection';
import UserQuickLinks from '@/components/dashboard/UserQuickLinks';
import AdminSection from '@/components/dashboard/AdminSection';
import FloatingArtworksBrowser from '@/components/map/FloatingArtworksBrowser';
import ArtworkDetailPanel, { type ArtworkCardData } from '@/components/map/ArtworkDetailPanel';
import { ERA_LEGEND } from '@/components/map/eraLegend';
import { trackArtworkView } from '@/lib/auth';
import type { MapCommand } from '@/components/map/MapShell';

const MapShell = dynamic(() => import('@/components/map/MapShell'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#2e53ff] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

// ── Icons ─────────────────────────────────────────────────────────────────────

function GlobeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#6b7280]">
      <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}
function MapIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#2e5bff]">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  );
}
function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#6b7280]">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#6b7280]">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#6b7280]">
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
      className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#2e5bff]/30 focus:ring-offset-2 focus:ring-offset-transparent ${
        active
          ? 'bg-[#eff2ff] border border-[#2e5bff]/20 text-[#2e5bff]'
          : 'text-[#9ca3af] hover:text-[#6b7280] hover:bg-[#f9fafb] border border-transparent'
      }`}
    >
      <span className={`transition-colors ${active ? 'text-[#2e5bff]' : 'text-[#9ca3af]'}`}>{icon}</span>
      <span className={active ? 'font-medium text-[#2e5bff]' : 'font-normal text-[#6b7280]'}>{label}</span>
    </button>
  );
}

// ── Transform DB row → app artwork ───────────────────────────────────────────
function transformRow(row: any): ArtworkCardData & { year_start: number; year_end: number; region: string | null; culture: string | null } {
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

// ── Type for artwork with extra properties ────────────────────────────────────
type Artwork = ArtworkCardData & { year_start: number; year_end: number; region: string | null; culture: string | null };

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Home() {
  // ── Data ────────────────────────────────────────────────────────────────────
  const [allArtworks, setAllArtworks] = useState<Artwork[]>([]);
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
  const [browserOpen, setBrowserOpen]                   = useState(false);
  const [mobileSheetOpen, setMobileSheetOpen]           = useState(false);
  const [timelineCollapsed, setTimelineCollapsed]       = useState(false);
  const [eraLegendOpen, setEraLegendOpen]               = useState(false);
  const [activeTab, setActiveTab]                       = useState<TabType>('map');
  const [showMobileSearchBar, setShowMobileSearchBar]   = useState(false);

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
  const [clusterArtworks, setClusterArtworks] = useState<ArtworkCardData[]>([]);
  const [clusterCenter, setClusterCenter] = useState<[number, number] | null>(null);

  // ── Saved artworks (localStorage-backed) ────────────────────────────────────
  const [savedIds, setSavedIds] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const stored = localStorage.getItem('savedArtworkIds');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch { return new Set(); }
  });

  const handleToggleSave = useCallback((artwork: ArtworkCardData) => {
    setSavedIds(prev => {
      const next = new Set(prev);
      if (next.has(artwork.id)) next.delete(artwork.id);
      else next.add(artwork.id);
      localStorage.setItem('savedArtworkIds', JSON.stringify(Array.from(next)));
      return next;
    });
  }, []);

  // ── Sync state ───────────────────────────────────────────────────────────────
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(
    typeof window !== 'undefined' ? localStorage.getItem('lastArtworkSyncTime') : null
  );

  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // ── Fetch all artworks ───────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        let page = 0;
        const limit = 1000; // Supabase max per request
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

  // ── Sync artworks every 30 minutes for new additions ────────────────────────
  useEffect(() => {
    const SYNC_INTERVAL = 30 * 60 * 1000; // 30 minutes

    const syncArtworks = async () => {
      try {
        const syncTime = lastSyncTime || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const res = await fetch(`/api/artworks/sync?lastSyncTime=${encodeURIComponent(syncTime)}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();
        if (json.newCount > 0 && json.artworks?.length > 0) {
          // Transform new artworks
          const newArtworks = json.artworks.map(transformRow);

          // Merge new artworks, avoiding duplicates
          setAllArtworks(prev => {
            const prevIds = new Set(prev.map(a => a.id));
            const uniqueNew = newArtworks.filter((a: Artwork) => !prevIds.has(a.id));
            return [...prev, ...uniqueNew];
          });

          // Show toast notification
          setToast({
            message: `${json.newCount} new artwork${json.newCount === 1 ? '' : 's'} added!`,
            type: 'success',
          });

          // Update last sync time
          const now = new Date().toISOString();
          setLastSyncTime(now);
          localStorage.setItem('lastArtworkSyncTime', now);
        }
      } catch (err) {
        console.error('Sync error:', err);
      }
    };

    // Set up polling interval (starts after initial load)
    const timer = setInterval(syncArtworks, SYNC_INTERVAL);

    return () => clearInterval(timer);
  }, [lastSyncTime]);

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

  // ── Show toast when search returns no results ────────────────────────────────
  useEffect(() => {
    if ((searchQuery || selectedRegion || selectedMedium) && allArtworks.length > 0 && filteredArtworks.length === 0) {
      setToast({ message: 'No artworks match your filters. Try adjusting your search.', type: 'info' });
    }
  }, [searchQuery, selectedRegion, selectedMedium, filteredArtworks.length, allArtworks.length]);

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

  // ── Stable cluster change handler (avoids ref-change loop in MapShell) ──────
  const handleClusterChange = useCallback((artworks: ArtworkCardData[], center: [number, number] | null) => {
    setClusterArtworks(artworks);
    setClusterCenter(center);
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
      <div className="h-screen w-full bg-[#f5f6f7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#2e5bff]/60 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#6b7280] text-sm tracking-wide">Loading collection…</p>
        </div>
      </div>
    );
  }

  if (dbError) {
    return (
      <div className="h-screen w-full bg-[#f5f6f7] flex items-center justify-center p-8">
        <div className="max-w-md text-center">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-red-500">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-[#111111] mb-2">Database Connection Error</h2>
          <p className="text-[#6b7280] text-sm mb-4">{dbError}</p>
          <div className="flex gap-3 justify-center">
            <a href="/admin" className="px-4 py-2 bg-[#2e5bff] text-white rounded-lg font-medium text-sm hover:bg-[#2e5bff]/90">Admin Panel</a>
            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-white border border-[#e5e7eb] rounded-lg text-sm text-[#6b7280] hover:bg-[#f9fafb]">Retry</button>
          </div>
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="h-screen w-full bg-[#f5f6f7] flex items-center justify-center p-8">
        <div className="max-w-md text-center">
          <div className="w-14 h-14 rounded-full bg-[#fef3c7] border border-[#fcd34d] flex items-center justify-center mx-auto mb-5">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-[#111111] mb-2">Collection is Empty</h2>
          <p className="text-[#6b7280] text-sm mb-6 leading-relaxed">
            The database has no artworks yet. Run Getty ingestion from the admin panel to populate the collection.
          </p>
          <div className="flex gap-3 justify-center">
            <a href="/admin" className="px-5 py-2.5 bg-[#2e5bff] text-white rounded-lg font-medium text-sm hover:bg-[#2e5bff]/90 transition-colors">Go to Admin</a>
            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-white border border-[#e5e7eb] rounded-lg text-sm text-[#6b7280] hover:bg-[#f9fafb] transition-colors">Refresh</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main layout ────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen w-full bg-[#f5f6f7] overflow-hidden select-none">

      {/* ── LEFT SIDEBAR ──────────────────────────────────────────────────────── */}
      <aside className="hidden lg:flex w-[220px] shrink-0 flex-col bg-white border-r border-[#e5e7eb] overflow-hidden z-20">

        {/* Brand */}
        <div className="px-5 pt-6 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg border border-[#2e5bff]/20 flex items-center justify-center bg-[#eff2ff] shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2e5bff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
            <h1 className="text-[14px] font-light text-[#111111] tracking-tight leading-none">
              Atlas <span className="font-extralight text-[#6b7280]">of Art</span>
            </h1>
          </div>
          <p className="mt-3 text-[11px] text-[#6b7280] leading-relaxed">
            Explore global artworks by place and era.
          </p>
        </div>

        <div className="border-t border-[#e5e7eb] mx-4" />

        {/* Navigation */}
        <nav className="px-2.5 py-2.5 space-y-0.5">
          <NavItem icon={<MapIcon />} label="Map" active={true} />
        </nav>

        <div className="border-t border-white/[0.05] mx-4 my-1" />

        {/* Search */}
        <div className="px-3.5 py-3 space-y-2">
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9ca3af] pointer-events-none">
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="Search artworks…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#e5e7eb] rounded-lg pl-9 pr-16 py-2.5 text-[12px] text-[#111111] placeholder-[#9ca3af] focus:outline-none focus:border-[#2e5bff] focus:ring-1 focus:ring-[#2e5bff]/10 transition-all duration-200"
            />
            {/* Inline count badge */}
            <span className="absolute right-8 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-[#9ca3af] pointer-events-none">
              {filteredArtworks.length.toLocaleString()}
            </span>
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#6b7280]">
                <XIcon />
              </button>
            )}
          </div>

          {/* Filters toggle */}
          <button
            onClick={() => setShowFilters(f => !f)}
            className={`w-full flex items-center gap-1.5 text-[11px] font-medium transition-all duration-200 px-2.5 py-2 rounded-lg border ${
              showFilters || selectedRegion || selectedMedium
                ? 'text-[#2e5bff] bg-[#eff2ff] border-[#2e5bff]/20'
                : 'text-[#9ca3af] hover:text-[#6b7280] hover:bg-[#f9fafb] border-[#e5e7eb]'
            }`}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            <span>Filters</span>
            {(selectedRegion || selectedMedium) && (
              <span className="ml-auto bg-[#2e5bff]/10 text-[#2e5bff] px-2 py-0.5 rounded text-[9px] font-semibold">
                {[selectedRegion, selectedMedium].filter(Boolean).length}
              </span>
            )}
          </button>

          {showFilters && (
            <div className="space-y-3 pb-1 max-h-56 overflow-y-auto">
              {regions.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[#9ca3af] mb-1.5 px-0.5">Region</p>
                  <div className="flex flex-wrap gap-1.5">
                    {regions.slice(0, 10).map(r => (
                      <button
                        key={r}
                        onClick={() => setSelectedRegion(prev => prev === r ? null : r)}
                        className={`px-2 py-1 text-[10px] rounded-full transition-all border ${
                          selectedRegion === r
                            ? 'bg-[#eff2ff] border-[#2e5bff]/20 text-[#2e5bff]'
                            : 'border-[#e5e7eb] text-[#9ca3af] hover:text-[#6b7280] hover:bg-[#f9fafb]'
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
                  <p className="text-[10px] uppercase tracking-widest text-[#9ca3af] mb-1.5 px-0.5">Medium</p>
                  <div className="flex flex-wrap gap-1.5">
                    {mediums.slice(0, 8).map(m => (
                      <button
                        key={m}
                        onClick={() => setSelectedMedium(prev => prev === m ? null : m)}
                        className={`px-2 py-1 text-[10px] rounded-full transition-all border ${
                          selectedMedium === m
                            ? 'bg-[#eff2ff] border-[#2e5bff]/20 text-[#2e5bff]'
                            : 'border-[#e5e7eb] text-[#9ca3af] hover:text-[#6b7280] hover:bg-[#f9fafb]'
                        }`}
                      >
                        {m.length > 22 ? m.slice(0, 20) + '…' : m}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {hasFilters && (
                <button onClick={clearFilters} className="text-[10px] text-[#9ca3af] hover:text-[#6b7280] transition-colors px-0.5">
                  ✕ Clear all filters
                </button>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-[#e5e7eb] mx-4 my-1" />

        {/* Actions */}
        <div className="px-3.5 py-3 space-y-1.5">
          {/* Surprise Me — primary CTA */}
          <button
            onClick={handleSurpriseMe}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-[#2e5bff] text-white text-[12px] font-semibold hover:bg-[#2e5bff]/90 transition-all shadow-sm"
          >
            <DiceIcon />
            <span>Surprise Me</span>
          </button>
          <button
            onClick={() => setBrowserOpen(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[#f9fafb] border border-[#e5e7eb] text-[11px] text-[#6b7280] hover:bg-white hover:text-[#111111] transition-all"
          >
            <GridIcon />
            <span>Browse Artworks</span>
          </button>
          <button
            onClick={handleFitToResults}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[#f9fafb] border border-[#e5e7eb] text-[11px] text-[#6b7280] hover:bg-white hover:text-[#111111] transition-all"
          >
            <FitIcon />
            <span>Fit to Results</span>
          </button>
          <button
            onClick={handleShare}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border text-[11px] transition-all ${
              showCopied
                ? 'bg-[#eff2ff] border-[#2e5bff]/20 text-[#2e5bff]'
                : 'bg-[#f9fafb] border-[#e5e7eb] text-[#6b7280] hover:bg-white hover:text-[#111111]'
            }`}
          >
            <ShareIcon />
            <span>{showCopied ? '✓ Copied!' : 'Share Link'}</span>
          </button>
        </div>

        <div className="border-t border-[#e5e7eb] mx-4 my-1" />

        {/* Era Legend — collapsible */}
        <div className="px-3.5 py-2">
          <button
            onClick={() => setEraLegendOpen(o => !o)}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-[11px] font-medium transition-all border ${
              eraLegendOpen
                ? 'bg-[#eff2ff] border-[#2e5bff]/20 text-[#2e5bff]'
                : 'bg-[#f9fafb] border-[#e5e7eb] text-[#9ca3af] hover:text-[#6b7280] hover:bg-white'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>Era Legend</span>
            </div>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              className={`transition-transform ${eraLegendOpen ? 'rotate-180' : ''}`}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {eraLegendOpen && (
            <div className="mt-2 px-1 space-y-1.5">
              {ERA_LEGEND.map(e => (
                <div key={e.label} className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: e.color }} />
                  <span className="text-[10px] text-[#6b7280] w-[72px]">{e.label}</span>
                  <span className="text-[9px] text-[#9ca3af]">{e.years}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-[#e5e7eb] mx-4 my-1" />

        {/* Account / Library / Admin */}
        <UserProfileSection />
        <UserQuickLinks />
        <AdminSection />

        {/* Recently Viewed */}
        {historyArtworks.length > 0 && (
          <div className="border-t border-[#e5e7eb] mx-3.5 pt-2.5 mt-auto">
            <p className="text-[9px] uppercase tracking-widest text-[#9ca3af] mb-2 px-0.5">Recently Viewed</p>
            <div className="flex items-center gap-1.5 px-0.5">
              {historyArtworks.map(a => (
                <button
                  key={a.id}
                  onClick={() => handleArtworkClick(a)}
                  title={a.title}
                  className={`w-8 h-8 rounded-lg overflow-hidden border shrink-0 transition-all duration-200 ${
                    a.id === selectedArtworkId
                      ? 'border-[#2e5bff] ring-1 ring-[#2e5bff]/20'
                      : 'border-[#e5e7eb] hover:border-[#2e5bff]/30'
                  }`}
                >
                  {a.image_url ? (
                    <img src={a.image_url} alt={a.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#f9fafb] flex items-center justify-center">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#d1d5db]">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bottom auth */}
        <div className="border-t border-[#e5e7eb] mx-3.5 pt-2.5 mt-2 mb-3">
          <AuthButton />
        </div>
      </aside>

      {/* ── CONTENT AREA ──────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 relative lg:pb-0 pb-[62px]">

        {/* Map View */}
        <div className="flex-1 flex flex-row min-w-0 relative">
            {/* Left section: Map + Controls + Cluster List */}
            <div className="flex-1 flex flex-col min-w-0 relative">
              {/* Map container */}
              <div className="flex-1 relative min-h-0">
              <MapShell
                artworks={filteredArtworks}
                selectedArtworkId={selectedArtworkId}
                selectedArtwork={null}
                onArtworkClick={handleArtworkClick}
                onExpand={() => setIsExpandedDetailOpen(true)}
                onDoubleClick={() => setIsExpandedDetailOpen(true)}
                onArtworkClose={() => setSelectedArtworkId(null)}
                mapCommand={mapCommand}
                onMapCommandDone={() => setMapCommand(null)}
                onVisibleCountChange={setVisibleCount}
                onClusterChange={handleClusterChange}
                onFitToResults={handleFitToResults}
                eraLegendOpen={eraLegendOpen}
              />

              {/* Right-side detail panel */}
              {(selectedArtwork || clusterArtworks.length > 0) && !isExpandedDetailOpen && (
                <ArtworkDetailPanel
                  artwork={selectedArtwork}
                  clusterArtworks={clusterArtworks}
                  nearbyArtworks={nearbyArtworks as ArtworkCardData[]}
                  selectedId={selectedArtworkId}
                  onSelect={artwork => {
                    handleArtworkClick(artwork);
                    setMapCommand({ type: 'flyTo', lat: artwork.lat, lng: artwork.lng });
                  }}
                  onClose={() => {
                    setSelectedArtworkId(null);
                    setClusterArtworks([]);
                    setClusterCenter(null);
                  }}
                />
              )}

              {/* Expanded detail modal */}
              {selectedArtwork && isExpandedDetailOpen && (
                <ExpandedArtworkDetail
                  artwork={selectedArtwork}
                  onClose={() => setIsExpandedDetailOpen(false)}
                  nearbyArtworks={nearbyArtworks as ArtworkCardData[]}
                  onNavigate={artwork => {
                    setSelectedArtworkId(artwork.id);
                    setMapCommand({ type: 'flyTo', lat: artwork.lat, lng: artwork.lng });
                    setViewHistory(prev => [artwork.id, ...prev.filter(x => x !== artwork.id)].slice(0, 5));
                  }}
                />
              )}

              {/* Active filter chips (floating, top-right) */}
              {(selectedRegion || selectedMedium) && (
                <div className="absolute top-4 right-4 z-10 flex flex-col gap-1 items-end pointer-events-auto">
                  {selectedRegion && (
                    <button
                      onClick={() => setSelectedRegion(null)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] text-[#2e5bff] hover:bg-[#eff2ff] transition-colors font-medium"
                      style={{ background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(46,91,255,0.2)', backdropFilter: 'blur(12px)' }}
                    >
                      {selectedRegion} <XIcon />
                    </button>
                  )}
                  {selectedMedium && (
                    <button
                      onClick={() => setSelectedMedium(null)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] text-[#2e5bff] hover:bg-[#eff2ff] transition-colors font-medium"
                      style={{ background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(46,91,255,0.2)', backdropFilter: 'blur(12px)' }}
                    >
                      {selectedMedium.length > 22 ? selectedMedium.slice(0, 20) + '…' : selectedMedium} <XIcon />
                    </button>
                  )}
                </div>
              )}

              {/* Mobile FAB removed - now using bottom tab bar */}
            </div>

            </div>
            {/* End of left section */}

            {/* Right section: Timeline (collapsible) */}
            <div className={`shrink-0 overflow-hidden hidden lg:flex flex-col border-l border-[#e5e7eb] transition-all duration-300 ${timelineCollapsed ? 'w-10' : 'w-60'}`}
              style={{ background: 'white' }}
            >
              {timelineCollapsed ? (
                /* Collapsed strip */
                <div className="flex flex-col items-center py-4 gap-3 h-full">
                  <button
                    onClick={() => setTimelineCollapsed(false)}
                    className="p-1.5 rounded-lg bg-[#f9fafb] hover:bg-[#eff2ff] text-[#9ca3af] hover:text-[#2e5bff] transition-all border border-[#e5e7eb]"
                    title="Expand timeline"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-[9px] uppercase tracking-widest text-[#9ca3af] font-medium"
                      style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                      Timeline
                    </p>
                  </div>
                </div>
              ) : (
                /* Expanded panel */
                <TimelineShell
                  artworks={allArtworks}
                  maxYear={timelineMaxYear}
                  onMaxYearChange={setTimelineMaxYear}
                  onCollapse={() => setTimelineCollapsed(true)}
                />
              )}
            </div>
            {/* End of right section */}
        </div>
      </div>

      {/* Floating artworks browser */}
      {browserOpen && (
        <FloatingArtworksBrowser
          artworks={filteredArtworks}
          selectedId={selectedArtworkId}
          onSelect={artwork => {
            handleArtworkClick(artwork);
            setMapCommand({ type: 'flyTo', lat: artwork.lat, lng: artwork.lng });
            setBrowserOpen(false);
          }}
          onClose={() => setBrowserOpen(false)}
        />
      )}

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

      {/* ── MOBILE COMPONENTS (iOS Optimized) ──────────────────────────────────── */}

      {/* Mobile Search Bar - Top */}
      <MobileSearchBar
        isVisible={showMobileSearchBar}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onFocus={() => setShowMobileSearchBar(true)}
        onBlur={() => setTimeout(() => setShowMobileSearchBar(false), 200)}
        filteredCount={filteredArtworks.length}
        totalCount={allArtworks.length}
      />

      {/* Mobile Bottom Sheet for Artwork Detail */}
      {selectedArtwork && !isExpandedDetailOpen && activeTab === 'map' && (
        <BottomSheet
          isOpen={!!selectedArtwork}
          onClose={() => setSelectedArtworkId(null)}
          snapPoints={[30, 70, 95]}
          initialSnap={1}
          showGrabHandle={true}
        >
          <ArtworkDetailSheet
            artwork={selectedArtwork}
            clusterArtworks={clusterArtworks}
            nearbyArtworks={nearbyArtworks}
            selectedId={selectedArtworkId}
            savedIds={savedIds}
            onToggleSave={handleToggleSave}
            onSelect={(artwork) => {
              setSelectedArtworkId(artwork.id);
              setMapCommand({ type: 'flyTo', lat: artwork.lat, lng: artwork.lng });
            }}
          />
        </BottomSheet>
      )}

      {/* Mobile Saved Screen */}
      {activeTab === 'saved' && (
        <SavedScreen
          artworks={allArtworks}
          savedIds={savedIds}
          onSelectArtwork={(artwork) => {
            setSelectedArtworkId(artwork.id);
            setMapCommand({ type: 'flyTo', lat: artwork.lat, lng: artwork.lng });
            setActiveTab('map');
          }}
          onToggleSave={handleToggleSave}
        />
      )}

      {/* Mobile Profile Screen */}
      {activeTab === 'profile' && (
        <ProfileScreen savedCount={savedIds.size} />
      )}

      {/* Mobile Tab Bar - Bottom */}
      <MobileTabBar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === 'search') {
            setShowMobileSearchBar(true);
          } else if (tab === 'map') {
            setShowMobileSearchBar(false);
          }
        }}
      />
    </div>
  );
}
