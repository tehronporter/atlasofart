// components/mobile/MobileSearchBar.tsx
// iOS-style top search bar for mobile

'use client';

import { useState } from 'react';

interface MobileSearchBarProps {
  isVisible: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  filteredCount?: number;
  totalCount?: number;
}

export default function MobileSearchBar({
  isVisible,
  searchQuery,
  onSearchChange,
  onFocus,
  onBlur,
  placeholder = 'Search artworks…',
  filteredCount,
  totalCount,
}: MobileSearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 bg-white border-b border-[#e5e7eb] z-40 lg:hidden"
      style={{
        paddingTop: 'max(0.5rem, env(safe-area-inset-top))',
      }}
    >
      <div className="px-4 py-3 pb-4">
        {/* Search Input */}
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9ca3af]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>

          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            className="w-full bg-[#f9fafb] border border-[#e5e7eb] rounded-lg pl-10 pr-10 py-2.5 text-sm text-[#111111] placeholder-[#9ca3af] focus:outline-none focus:border-[#2e5bff] focus:ring-1 focus:ring-[#2e5bff]/10 transition-all"
          />

          {/* Clear button */}
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#6b7280]"
              aria-label="Clear search"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Count info */}
        {filteredCount !== undefined && totalCount !== undefined && (
          <div className="mt-2 text-[11px] text-[#6b7280]">
            Showing <span className="font-semibold text-[#111111]">{filteredCount.toLocaleString()}</span> of{' '}
            <span className="font-semibold text-[#111111]">{totalCount.toLocaleString()}</span>
          </div>
        )}
      </div>
    </div>
  );
}
