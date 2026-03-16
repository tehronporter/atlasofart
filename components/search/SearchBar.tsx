// components/search/SearchBar.tsx - Generic artwork search
// Phase 13: Works with Supabase data

'use client';

import { useState, useMemo } from 'react';

interface ArtworkData {
  id: string;
  title: string;
  culture: string;
  region: string;
  medium: string;
  tags: string[];
  description: string;
}

interface SearchBarProps {
  artworks?: ArtworkData[];
  onSearchChange?: (query: string) => void;
  onRegionFilter?: (region: string | null) => void;
  onMediumFilter?: (medium: string | null) => void;
}

export default function SearchBar({ 
  artworks = [],
  onSearchChange,
  onRegionFilter,
  onMediumFilter 
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedMedium, setSelectedMedium] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const { regions, mediums } = useMemo(() => {
    const regionSet = new Set(artworks.map(a => a.region).filter(Boolean));
    const mediumSet = new Set(artworks.map(a => a.medium).filter(Boolean));
    return {
      regions: Array.from(regionSet).sort(),
      mediums: Array.from(mediumSet).sort(),
    };
  }, [artworks]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    onSearchChange?.(query);
  };

  const handleRegionSelect = (region: string) => {
    const newRegion = selectedRegion === region ? null : region;
    setSelectedRegion(newRegion);
    onRegionFilter?.(newRegion);
  };

  const handleMediumSelect = (medium: string) => {
    const newMedium = selectedMedium === medium ? null : medium;
    setSelectedMedium(newMedium);
    onMediumFilter?.(newMedium);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedRegion(null);
    setSelectedMedium(null);
    onSearchChange?.('');
    onRegionFilter?.(null);
    onMediumFilter?.(null);
  };

  const hasActiveFilters = searchQuery || selectedRegion || selectedMedium;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 w-full max-w-2xl px-4">
      <div className="flex items-center gap-2 bg-neutral-900/90 backdrop-blur-sm border border-neutral-800 rounded-lg px-4 py-2.5">
        <svg className="w-4 h-4 text-neutral-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        
        <input
          type="text"
          placeholder="Search artworks, cultures, tags..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="flex-1 bg-transparent text-neutral-200 placeholder-neutral-500 text-sm focus:outline-none"
        />
        
        {hasActiveFilters && (
          <button onClick={clearFilters} className="text-neutral-500 hover:text-neutral-300 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`p-1.5 rounded transition-colors ${
            isExpanded ? 'bg-neutral-800 text-amber-500' : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
        </button>
      </div>

      {isExpanded && (
        <div className="mt-3 bg-neutral-900/90 backdrop-blur-sm border border-neutral-800 rounded-lg p-4 space-y-4">
          <div>
            <h3 className="text-xs font-medium text-neutral-400 mb-2">Region</h3>
            <div className="flex flex-wrap gap-2">
              {regions.map((region) => (
                <button
                  key={region}
                  onClick={() => handleRegionSelect(region)}
                  className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                    selectedRegion === region
                      ? 'bg-amber-500 text-neutral-900 font-medium'
                      : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-medium text-neutral-400 mb-2">Medium</h3>
            <div className="flex flex-wrap gap-2">
              {mediums.map((medium) => (
                <button
                  key={medium}
                  onClick={() => handleMediumSelect(medium)}
                  className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                    selectedMedium === medium
                      ? 'bg-amber-500 text-neutral-900 font-medium'
                      : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                  }`}
                >
                  {medium}
                </button>
              ))}
            </div>
          </div>

          {hasActiveFilters && (
            <div className="pt-3 border-t border-neutral-800">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-neutral-500">Active:</span>
                {selectedRegion && (
                  <span className="text-xs bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded">{selectedRegion}</span>
                )}
                {selectedMedium && (
                  <span className="text-xs bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded">{selectedMedium}</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
