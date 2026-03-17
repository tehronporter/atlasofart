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
            background: 'linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)',
            border: '1px solid #e0e0e0',
            borderBottom: 'none',
            maxHeight: '80vh',
          }}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-gray-300" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
            <p className="text-[13px] font-medium text-neutral-900">Search & Filter</p>
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-neutral-700">
                <span className="text-amber-500 font-semibold">{filteredCount}</span>
                {' of '}
                <span>{totalCount}</span>
              </span>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-600 hover:text-neutral-800 transition-colors"
                style={{ background: '#f0f0f0', border: '1px solid #e0e0e0' }}
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
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
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
                className="w-full pl-10 pr-9 py-3 rounded-xl text-[14px] text-neutral-900 placeholder-gray-400 focus:outline-none transition-all duration-200"
                style={{
                  background: '#f8f9fa',
                  border: '1px solid #e0e0e0',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = '#2e53ff'; }}
                onBlur={e => { e.currentTarget.style.borderColor = '#e0e0e0'; }}
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                <p className="text-[10px] uppercase tracking-widest text-neutral-700 mb-2.5">Region</p>
                <div className="flex flex-wrap gap-2">
                  {regions.slice(0, 12).map(r => (
                    <button
                      key={r}
                      onClick={() => onRegionChange(selectedRegion === r ? null : r)}
                      className={`px-3 py-1.5 text-[12px] rounded-full transition-all border ${
                        selectedRegion === r
                          ? 'bg-amber-100 border-amber-300 text-amber-700'
                          : 'border-gray-300 text-neutral-700 hover:text-neutral-900 hover:border-gray-400'
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
                <p className="text-[10px] uppercase tracking-widest text-neutral-700 mb-2.5">Medium</p>
                <div className="flex flex-wrap gap-2">
                  {mediums.slice(0, 10).map(m => (
                    <button
                      key={m}
                      onClick={() => onMediumChange(selectedMedium === m ? null : m)}
                      className={`px-3 py-1.5 text-[12px] rounded-full transition-all border ${
                        selectedMedium === m
                          ? 'bg-amber-100 border-amber-300 text-amber-700'
                          : 'border-gray-300 text-neutral-700 hover:text-neutral-900 hover:border-gray-400'
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
                  className="flex-1 py-3 rounded-xl text-[13px] text-neutral-700 hover:text-neutral-900 transition-colors border border-gray-300 hover:border-gray-400"
                >
                  Clear all
                </button>
              )}
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl text-[13px] font-medium transition-all"
                style={{
                  background: '#2e53ff',
                  color: '#ffffff',
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
