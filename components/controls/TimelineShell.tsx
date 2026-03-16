// components/controls/TimelineShell.tsx
// Premium timeline control — anchored at bottom of map area

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
  onMaxYearChange,
}: TimelineShellProps) {
  const { minYear, absoluteMaxYear } = useMemo(() => {
    if (artworks.length === 0) return { minYear: -3000, absoluteMaxYear: 2000 };
    const starts = artworks.map(a => a.year_start ?? 0).filter(y => typeof y === 'number' && !isNaN(y));
    const ends = artworks.map(a => a.year_end ?? 0).filter(y => typeof y === 'number' && !isNaN(y));
    if (starts.length === 0) return { minYear: -3000, absoluteMaxYear: 2000 };
    return {
      minYear: Math.min(...starts),
      absoluteMaxYear: Math.max(...ends),
    };
  }, [artworks]);

  const currentMax = maxYear ?? absoluteMaxYear;

  const formatYear = (year: number) => {
    if (year < 0) return `${Math.abs(year)} BCE`;
    if (year === 0) return 'Year 0';
    return `${year} CE`;
  };

  const pct = absoluteMaxYear === minYear
    ? 100
    : Math.max(0, Math.min(100, Math.round(((currentMax - minYear) / (absoluteMaxYear - minYear)) * 100)));

  const visibleCount = artworks.filter(a =>
    currentMax >= absoluteMaxYear ? true : (a.year_start ?? 0) <= currentMax
  ).length;

  const viewingLabel = currentMax >= absoluteMaxYear
    ? 'All eras'
    : `Up to ${formatYear(currentMax)}`;

  return (
    <div className="h-[60px] shrink-0 bg-[#0e0f12]/95 backdrop-blur-sm border-t border-white/[0.05] flex items-center px-3 md:px-5 gap-2 md:gap-5 overflow-x-auto">
      {/* Min year */}
      <span className="text-[10px] md:text-[11px] text-neutral-600 font-mono whitespace-nowrap shrink-0 tabular-nums">
        {formatYear(minYear)}
      </span>

      {/* Slider */}
      <div className="flex-1 relative flex items-center">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-white/[0.07] rounded-full w-full pointer-events-none" />
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-amber-500/50 rounded-full pointer-events-none transition-all duration-75"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={minYear}
          max={absoluteMaxYear}
          value={currentMax}
          onChange={e => onMaxYearChange?.(parseInt(e.target.value, 10))}
          className="
            w-full relative z-10 h-5 appearance-none bg-transparent cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-[14px]
            [&::-webkit-slider-thumb]:h-[14px]
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-amber-400
            [&::-webkit-slider-thumb]:border-[2px]
            [&::-webkit-slider-thumb]:border-[#0e0f12]
            [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(251,191,36,0.45)]
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-moz-range-thumb]:w-[14px]
            [&::-moz-range-thumb]:h-[14px]
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-amber-400
            [&::-moz-range-thumb]:border-[2px]
            [&::-moz-range-thumb]:border-[#0e0f12]
            [&::-moz-range-thumb]:cursor-pointer
          "
        />
      </div>

      {/* Max year */}
      <span className="hidden sm:inline text-[10px] md:text-[11px] text-neutral-600 font-mono whitespace-nowrap shrink-0 tabular-nums">
        {formatYear(absoluteMaxYear)}
      </span>

      <div className="hidden md:block w-px h-5 bg-white/[0.07] shrink-0" />

      {/* Viewing display — hidden on small screens */}
      <div className="hidden md:block shrink-0 text-right">
        <p className="text-[10px] text-neutral-600 leading-none mb-0.5">Viewing</p>
        <p className="text-[12px] text-neutral-300 font-medium leading-none tabular-nums whitespace-nowrap">
          {viewingLabel}
        </p>
      </div>

      <div className="hidden md:block w-px h-5 bg-white/[0.07] shrink-0" />

      {/* Artwork count */}
      <div className="shrink-0 text-right min-w-[36px]">
        <p className="text-[10px] text-neutral-600 leading-none mb-0.5">Shown</p>
        <p className="text-[13px] font-semibold text-amber-400 leading-none tabular-nums">
          {visibleCount}
        </p>
      </div>
    </div>
  );
}
