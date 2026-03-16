// app/page.tsx - Supabase homepage (Phase 13)

'use client';

import { useState, useEffect, useMemo } from 'react';
import MapShell from '@/components/map/MapShell';
import TimelineShell from '@/components/controls/TimelineShell';
import ArtworkDrawerShell from '@/components/drawer/ArtworkDrawerShell';
import SearchBar from '@/components/search/SearchBar';
import UserMenu from '@/components/auth/UserMenu';
import { supabase } from '@/lib/supabase';
import { trackArtworkView } from '@/lib/auth';

export default function Home() {
  const [selectedArtworkId, setSelectedArtworkId] = useState<string | null>(null);
  const [timelineMaxYear, setTimelineMaxYear] = useState(2000);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedMedium, setSelectedMedium] = useState<string | null>(null);
  const [allArtworks, setAllArtworks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchArtworks() {
      try {
        const { data, error: fetchError } = await supabase
          .from('artworks')
          .select('*')
          .order('date_start', { ascending: true });

        if (fetchError) throw fetchError;

        const transformed = (data || []).map((row: any) => ({
          id: row.id,
          title: row.title || 'Untitled',
          year: row.date || `${row.date_start || '?'}`,
          year_start: row.date_start || -3000,
          year_end: row.date_end || 2000,
          region: row.region || 'Unknown',
          culture: row.culture || 'Unknown',
          medium: row.medium || 'Unknown',
          latitude: Number(row.latitude) || 0,
          longitude: Number(row.longitude) || 0,
          image_url: row.image_url_primary || row.image_url_thumbnail || '/placeholder.jpg',
          description: row.description || 'No description available',
          current_museum: row.repository || 'Unknown',
          place_created: row.place_created || 'Unknown',
          tags: row.tags || [],
        }));

        setAllArtworks(transformed);
        setIsLoading(false);
      } catch (err: any) {
        setError(err.message || 'Failed to load artworks');
        setIsLoading(false);
      }
    }

    fetchArtworks();
  }, []);

  const filteredArtworks = useMemo(() => {
    let result = allArtworks;
    if (timelineMaxYear < 2000) result = result.filter((a: any) => a.year_end <= timelineMaxYear);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((a: any) => 
        a.title.toLowerCase().includes(q) ||
        a.culture.toLowerCase().includes(q) ||
        a.region.toLowerCase().includes(q) ||
        a.medium.toLowerCase().includes(q) ||
        (a.tags || []).some((t: string) => t.toLowerCase().includes(q)) ||
        a.description.toLowerCase().includes(q)
      );
    }
    if (selectedRegion) result = result.filter((a: any) => a.region === selectedRegion);
    if (selectedMedium) result = result.filter((a: any) => a.medium === selectedMedium);
    return result;
  }, [allArtworks, timelineMaxYear, searchQuery, selectedRegion, selectedMedium]);

  const selectedArtwork = useMemo(() => 
    allArtworks.find(a => a.id === selectedArtworkId) || null,
  [allArtworks, selectedArtworkId]);

  const handleArtworkClick = (artwork: any) => {
    const id = artwork?.id || null;
    setSelectedArtworkId(id);
    if (id) trackArtworkView(id).catch(console.error);
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-400">Loading artworks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-bold text-white mb-2">Connection Error</h2>
          <p className="text-neutral-400 mb-4">{error}</p>
          <div className="bg-neutral-900 border border-neutral-800 rounded p-4 mb-4 text-left text-sm">
            <p className="text-amber-500 font-semibold mb-2">Setup Required:</p>
            <ol className="list-decimal list-inside space-y-1 text-neutral-300">
              <li>Run Supabase schema in SQL Editor</li>
              <li>Trigger Getty ingestion from /admin</li>
              <li>Or add sample artworks manually</li>
            </ol>
          </div>
          <div className="flex gap-3 justify-center">
            <a href="/admin" className="px-4 py-2 bg-amber-500 text-neutral-900 rounded font-medium hover:bg-amber-400">Go to Admin</a>
            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-neutral-800 rounded hover:bg-neutral-700">Retry</button>
          </div>
        </div>
      </div>
    );
  }

  if (allArtworks.length === 0) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-bold text-white mb-2">No Artworks Found</h2>
          <p className="text-neutral-400 mb-4">The database is empty. Import artworks to get started.</p>
          <div className="flex gap-3 justify-center">
            <a href="/admin" className="px-4 py-2 bg-amber-500 text-neutral-900 rounded font-medium hover:bg-amber-400">Import from Getty</a>
            <a href="/" className="px-4 py-2 bg-neutral-800 rounded hover:bg-neutral-700">Refresh</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full bg-black overflow-hidden">
      <div className="flex-1 relative">
        {/* User menu in top right */}
        <div className="absolute top-4 right-4 z-30">
          <UserMenu />
        </div>

        <SearchBar artworks={allArtworks} onSearchChange={setSearchQuery} onRegionFilter={setSelectedRegion} onMediumFilter={setSelectedMedium} />
        <MapShell artworks={filteredArtworks} selectedArtworkId={selectedArtworkId} onArtworkClick={handleArtworkClick} />
        <ArtworkDrawerShell artwork={selectedArtwork} isOpen={!!selectedArtworkId} onClose={() => setSelectedArtworkId(null)} onArtworkSelect={handleArtworkClick} allArtworks={filteredArtworks} />
      </div>
      <TimelineShell artworks={allArtworks} maxYear={timelineMaxYear} onMaxYearChange={setTimelineMaxYear} />
    </div>
  );
}
