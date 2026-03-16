// components/mobile/MobileSearchSheet.tsx
// Bottom-anchored search and filter drawer — shown on mobile (< lg) only.
// Slides up from the bottom when the search FAB is tapped.

'use client';

import { useEffect, useRef } from 'react';

interface MobileSearchSheetProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  regions: string[];
  selectedRegion: string | null;
  onRegionChange: (r: string | null) => void;
  mediums: string[];
  selectedMedium: string | null;
  onMediumChange: (m: string | null) => void;
  onClearFilters: () => void;
  filteredCount: number;
  totalCount: number;
}

export default function MobileSearchSheet({
  isOpen,
  onClose,
  searchQuery,
  onSearchChange,
  regions,
  selectedRegion,
  onRegionChange,
  mediums,
  selectedMedium,
  onMediumChange,
  onClearFilters,
  filteredCount,
  totalCount,
}: MobileSearchSheetProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus search input when sheet opens
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 250);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const hasFilters = searchQuery || selectedRegion || selectedMedium;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className="fixed inset-x-0 bottom-0 z-50 lg:hidden transition-transform duration-300 ease-out"
        style={{ transform: isOpen ? 'translateY(0)' : 'translateY(100%)' }}
      >
        <div
          className="rounded-t-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, #151519 0%, #0f0f14 100%)',
            border: '1px solid rgba(255,255,255,0.09)',
            borderBottom: 'none',
            maxHeight: '80vh',
          }}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-white/20" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
            <p className="text-[13px] font-medium text-white">Search & Filter</p>
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-neutral-500">
                <span className="text-amber-400 font-semibold">{filteredCount}</span>
                {' of '}
                <span>{totalCount}</span>
              </span>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-500 hover:text-neutral-300 transition-colors"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          {/* Scrollable content */}
          <div className="overflow-y-auto px-5 py-4 space-y-5" style={{ maxHeight: 'calc(80vh - 80px)' }}>
            {/* Search input */}
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-600 pointer-events-none">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <input
                ref={inputRef}
                type="text"
                placeholder="Search artworks…"
                value={searchQuery}
                onChange={e => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-9 py-3 rounded-xl text-[14px] text-neutral-200 placeholder-neutral-600 focus:outline-none transition-all duration-200"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = 'rgba(245,158,11,0.5)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-400"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>

            {/* Region filter */}
            {regions.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-widest text-neutral-600 mb-2.5">Region</p>
                <div className="flex flex-wrap gap-2">
                  {regions.slice(0, 12).map(r => (
                    <button
                      key={r}
                      onClick={() => onRegionChange(selectedRegion === r ? null : r)}
                      className={`px-3 py-1.5 text-[12px] rounded-full transition-all border ${
                        selectedRegion === r
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                          : 'border-white/[0.08] text-neutral-500 hover:text-neutral-300 hover:border-white/[0.15]'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Medium filter */}
            {mediums.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-widest text-neutral-600 mb-2.5">Medium</p>
                <div className="flex flex-wrap gap-2">
                  {mediums.slice(0, 10).map(m => (
                    <button
                      key={m}
                      onClick={() => onMediumChange(selectedMedium === m ? null : m)}
                      className={`px-3 py-1.5 text-[12px] rounded-full transition-all border ${
                        selectedMedium === m
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                          : 'border-white/[0.08] text-neutral-500 hover:text-neutral-300 hover:border-white/[0.15]'
                      }`}
                    >
                      {m.length > 24 ? m.slice(0, 22) + '…' : m}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Clear + Done */}
            <div className="flex gap-3 pb-4">
              {hasFilters && (
                <button
                  onClick={onClearFilters}
                  className="flex-1 py-3 rounded-xl text-[13px] text-neutral-500 hover:text-neutral-300 transition-colors border border-white/[0.08] hover:border-white/[0.15]"
                >
                  Clear all
                </button>
              )}
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl text-[13px] font-medium transition-all"
                style={{
                  background: 'linear-gradient(135deg, rgba(245,158,11,0.85), rgba(251,146,60,0.85))',
                  color: '#1a1000',
                }}
              >
                Show {filteredCount} results
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
