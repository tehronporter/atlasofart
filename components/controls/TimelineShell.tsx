// components/controls/TimelineShell.tsx
// Enhanced timeline with histogram visualization

'use client';

import { useMemo, useState } from 'react';

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
  const [isDragging, setIsDragging] = useState(false);

  const { minYear, absoluteMaxYear, histogram, maxCount } = useMemo(() => {
    if (artworks.length === 0) return { minYear: -3000, absoluteMaxYear: 2000, histogram: [], maxCount: 0 };

    const starts = artworks.map(a => a.year_start ?? 0).filter(y => typeof y === 'number' && !isNaN(y));
    const ends = artworks.map(a => a.year_end ?? 0).filter(y => typeof y === 'number' && !isNaN(y));
    if (starts.length === 0) return { minYear: -3000, absoluteMaxYear: 2000, histogram: [], maxCount: 0 };

    const min = Math.min(...starts);
    const max = Math.max(...ends);

    // Create 50-year bins for histogram
    const binSize = 50;
    const binCount = Math.ceil((max - min) / binSize) + 1;
    const bins: number[] = new Array(binCount).fill(0);

    artworks.forEach(artwork => {
      const start = artwork.year_start ?? min;
      const end = artwork.year_end ?? max;
      // Count artwork in all bins it spans
      for (let year = Math.max(start, min); year <= Math.min(end, max); year += binSize) {
        const binIndex = Math.floor((year - min) / binSize);
        if (binIndex >= 0 && binIndex < bins.length) {
          bins[binIndex]++;
        }
      }
    });

    const maxBinCount = Math.max(...bins, 1);

    const histogram = bins.map((count, idx) => ({
      year: min + idx * binSize,
      count,
      percentage: (count / maxBinCount) * 100,
    }));

    return { minYear: min, absoluteMaxYear: max, histogram, maxCount: maxBinCount };
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
    <div className="h-full w-full bg-white/95 backdrop-blur-sm border-t border-gray-200 flex flex-col p-4 md:p-6 gap-4">
      {/* Header */}
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-neutral-600 mb-1">Timeline</p>
          <p className="text-lg md:text-2xl font-light text-neutral-900">{viewingLabel}</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-neutral-500 mb-1">Artworks shown</p>
          <p className="text-2xl font-semibold text-amber-400">{visibleCount}</p>
        </div>
      </div>

      {/* Histogram */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-end justify-between gap-0.5 h-full">
          {histogram.map((bin, idx) => (
            <div
              key={idx}
              className="flex-1 flex flex-col items-center justify-end group cursor-pointer"
              onClick={() => onMaxYearChange?.(bin.year + 50)}
              title={`${formatYear(bin.year)}: ${bin.count} artworks`}
            >
              {/* Bar */}
              <div
                className={`w-full rounded-t transition-all duration-150 ${
                  bin.year <= currentMax
                    ? 'bg-gradient-to-t from-amber-500 to-amber-400'
                    : 'bg-gray-300 group-hover:bg-gray-400'
                }`}
                style={{ height: `${Math.max(2, bin.percentage)}%` }}
              />

              {/* Tooltip on hover */}
              <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 backdrop-blur px-2 py-1 rounded text-[9px] text-neutral-900 whitespace-nowrap pointer-events-none">
                {bin.count} artworks
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Slider */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] text-neutral-500 font-mono whitespace-nowrap">
            {formatYear(minYear)}
          </span>
          <div className="flex-1 relative flex items-center h-8">
            {/* Track background */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 bg-gray-300 rounded-full w-full pointer-events-none" />

            {/* Active track */}
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 bg-gradient-to-r from-amber-500 to-amber-400 rounded-full pointer-events-none transition-all duration-75"
              style={{ width: `${pct}%` }}
            />

            {/* Range input */}
            <input
              type="range"
              min={minYear}
              max={absoluteMaxYear}
              value={currentMax}
              onChange={e => onMaxYearChange?.(parseInt(e.target.value, 10))}
              onMouseDown={() => setIsDragging(true)}
              onMouseUp={() => setIsDragging(false)}
              onTouchStart={() => setIsDragging(true)}
              onTouchEnd={() => setIsDragging(false)}
              className="
                w-full relative z-10 h-8 appearance-none bg-transparent cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-6
                [&::-webkit-slider-thumb]:h-6
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-amber-400
                [&::-webkit-slider-thumb]:border-2
                [&::-webkit-slider-thumb]:border-white
                [&::-webkit-slider-thumb]:shadow-lg
                [&::-webkit-slider-thumb]:shadow-amber-500/50
                [&::-webkit-slider-thumb]:cursor-grab
                [&::-webkit-slider-thumb]:active:cursor-grabbing
                [&::-webkit-slider-thumb]:hover:bg-amber-300
                [&::-webkit-slider-thumb]:hover:scale-110
                [&::-webkit-slider-thumb]:transition-all
                [&::-moz-range-thumb]:w-6
                [&::-moz-range-thumb]:h-6
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-amber-400
                [&::-moz-range-thumb]:border-2
                [&::-moz-range-thumb]:border-white
                [&::-moz-range-thumb]:cursor-grab
                [&::-moz-range-thumb]:active:cursor-grabbing
                [&::-moz-range-thumb]:hover:bg-amber-300
                [&::-moz-range-thumb]:hover:scale-110
                [&::-moz-range-thumb]:shadow-lg
                [&::-moz-range-thumb]:shadow-amber-500/50
                [&::-moz-range-thumb]:transition-all
              "
            />

            {/* Year tooltip while dragging */}
            {isDragging && (
              <div
                className="absolute -top-10 text-center pointer-events-none"
                style={{ left: `${pct}%`, transform: 'translateX(-50%)' }}
              >
                <div className="bg-black/90 backdrop-blur px-3 py-1.5 rounded-lg whitespace-nowrap">
                  <p className="text-sm font-semibold text-amber-400">{formatYear(currentMax)}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">{visibleCount} artworks</p>
                </div>
              </div>
            )}
          </div>
          <span className="text-[11px] text-neutral-500 font-mono whitespace-nowrap">
            {formatYear(absoluteMaxYear)}
          </span>
        </div>

        {/* Quick jump buttons */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => onMaxYearChange?.(minYear)}
            className="px-2.5 py-1.5 text-[10px] rounded-lg bg-white/[0.04] border border-white/[0.08] text-neutral-400 hover:bg-gray-300 hover:text-neutral-200 transition-all"
          >
            Start
          </button>
          <button
            onClick={() => onMaxYearChange?.(Math.floor((minYear + absoluteMaxYear) / 2))}
            className="px-2.5 py-1.5 text-[10px] rounded-lg bg-white/[0.04] border border-white/[0.08] text-neutral-400 hover:bg-gray-300 hover:text-neutral-200 transition-all"
          >
            Midpoint
          </button>
          <button
            onClick={() => onMaxYearChange?.(absoluteMaxYear)}
            className="px-2.5 py-1.5 text-[10px] rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-all"
          >
            All Time
          </button>
        </div>
      </div>
    </div>
  );
}
