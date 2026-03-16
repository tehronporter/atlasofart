// TimelineShell.tsx - Simple timeline filter
// Phase 5: Timeline Filtering

'use client';

import { useMemo } from 'react';

interface TimelineShellProps {
  artworks?: any[];
  maxYear?: number;
  onMaxYearChange?: (year: number) => void;
}

export default function TimelineShell({ 
  artworks = [],
  maxYear,
  onMaxYearChange 
}: TimelineShellProps) {
  const { minYear, absoluteMaxYear } = useMemo(() => {
    if (artworks.length === 0) return { minYear: -3000, absoluteMaxYear: 2000 };
    
    const years = artworks.flatMap(a => [a.year_start, a.year_end]);
    return {
      minYear: Math.min(...years),
      absoluteMaxYear: Math.max(...years),
    };
  }, [artworks]);

  const currentMax = maxYear ?? absoluteMaxYear;

  const formatYear = (year: number) => {
    if (year < 0) return `${Math.abs(year)} BCE`;
    if (year === 0) return '1 BCE/1 CE';
    return `${year} CE`;
  };

  const visibleCount = artworks.filter(a => a.year_end <= currentMax).length;

  return (
    <div className="h-16 bg-neutral-950 border-t border-neutral-800 flex items-center px-6 gap-4">
      <div className="text-neutral-400 text-sm font-medium whitespace-nowrap">
        Timeline
      </div>
      
      <div className="flex-1 flex items-center gap-3">
        <span className="text-amber-500 text-xs w-16 text-right font-medium">
          {formatYear(minYear)}
        </span>
        
        <input
          type="range"
          min={minYear}
          max={absoluteMaxYear}
          value={currentMax}
          onChange={(e) => onMaxYearChange?.(parseInt(e.target.value, 10))}
          className="flex-1 h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-amber-500
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-neutral-900
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:shadow-lg
            [&::-moz-range-thumb]:w-4
            [&::-moz-range-thumb]:h-4
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-amber-500
            [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-neutral-900
            [&::-moz-range-thumb]:cursor-pointer
          "
        />
        
        <span className="text-neutral-300 text-xs w-16 font-medium">
          {formatYear(currentMax)}
        </span>
      </div>
      
      <div className="text-neutral-500 text-xs whitespace-nowrap border-l border-neutral-800 pl-4">
        <span className="text-amber-500">{visibleCount}</span> artworks
      </div>
    </div>
  );
}
