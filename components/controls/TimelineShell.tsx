// components/controls/TimelineShell.tsx
// Vertical timeline — histogram as horizontal bars, vertical slider

'use client';

import { useMemo, useState } from 'react';

interface TimelineShellProps {
  artworks?: any[];
  maxYear?: number;
  onMaxYearChange?: (year: number) => void;
  onCollapse?: () => void;
}

export default function TimelineShell({
  artworks = [],
  maxYear,
  onMaxYearChange,
  onCollapse,
}: TimelineShellProps) {
  const [isDragging, setIsDragging] = useState(false);

  const { minYear, absoluteMaxYear, histogram, maxCount } = useMemo(() => {
    if (artworks.length === 0) return { minYear: -3000, absoluteMaxYear: 2000, histogram: [], maxCount: 0 };

    const starts = artworks.map(a => a.year_start ?? 0).filter(y => typeof y === 'number' && !isNaN(y));
    const ends = artworks.map(a => a.year_end ?? 0).filter(y => typeof y === 'number' && !isNaN(y));
    if (starts.length === 0) return { minYear: -3000, absoluteMaxYear: 2000, histogram: [], maxCount: 0 };

    const min = Math.min(...starts);
    const max = Math.max(...ends);

    // Create 50-year bins
    const binSize = 50;
    const binCount = Math.ceil((max - min) / binSize) + 1;
    const bins: number[] = new Array(binCount).fill(0);

    artworks.forEach(artwork => {
      const start = artwork.year_start ?? min;
      const end = artwork.year_end ?? max;
      for (let year = Math.max(start, min); year <= Math.min(end, max); year += binSize) {
        const binIndex = Math.floor((year - min) / binSize);
        if (binIndex >= 0 && binIndex < bins.length) bins[binIndex]++;
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
    : `To ${formatYear(currentMax)}`;

  return (
    <div className="h-full w-full flex flex-col" style={{ background: '#2e53ff' }}>

      {/* ── Header ── */}
      <div className="px-4 pt-4 pb-3 flex items-start justify-between shrink-0">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-white/50 mb-0.5">Timeline</p>
          <p className="text-base font-light text-white leading-tight">{viewingLabel}</p>
          <p className="text-[11px] text-white/60 mt-0.5">
            <span className="text-amber-300 font-semibold">{visibleCount.toLocaleString()}</span> shown
          </p>
        </div>
        <button
          onClick={onCollapse}
          className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white/70 hover:text-white transition-all mt-0.5"
          title="Collapse timeline"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* ── Vertical scrubber + horizontal bar histogram ── */}
      <div className="flex-1 flex flex-row min-h-0 px-3 pb-3 gap-2">

        {/* Vertical slider column */}
        <div className="flex flex-col items-center gap-1.5 shrink-0" style={{ width: 32 }}>
          {/* Max label (top = newest since we drag down) */}
          <span className="text-[8px] text-white/50 font-mono text-center leading-tight">
            {formatYear(absoluteMaxYear).replace(' ', '\n')}
          </span>

          {/* Slider wrapper */}
          <div className="flex-1 relative flex justify-center items-stretch" style={{ minHeight: 60 }}>
            {/* Track background */}
            <div className="absolute left-1/2 -translate-x-1/2 w-1.5 rounded-full bg-white/20"
              style={{ top: 0, bottom: 0 }} />
            {/* Active track — from top to thumb */}
            <div className="absolute left-1/2 -translate-x-1/2 w-1.5 rounded-full bg-gradient-to-b from-amber-400 to-amber-500"
              style={{ top: 0, height: `${pct}%` }} />

            {/* Vertical range input */}
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
                absolute inset-0 opacity-0 cursor-pointer z-10
              "
              style={{
                writingMode: 'vertical-lr',
                direction: 'rtl',
                width: '100%',
                height: '100%',
                WebkitAppearance: 'slider-vertical',
              } as any}
            />

            {/* Custom thumb indicator */}
            <div
              className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
              style={{ top: `${pct}%`, transform: 'translate(-50%, -50%)' }}
            >
              <div className="w-4 h-4 rounded-full bg-amber-400 border-2 border-white shadow-lg shadow-amber-500/40" />
              {isDragging && (
                <div className="absolute left-6 top-1/2 -translate-y-1/2 bg-black/90 px-2 py-1 rounded-lg whitespace-nowrap z-20">
                  <p className="text-[10px] font-semibold text-amber-400">{formatYear(currentMax)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Min label (bottom = oldest) */}
          <span className="text-[8px] text-white/50 font-mono text-center leading-tight">
            {formatYear(minYear).replace(' ', '\n')}
          </span>
        </div>

        {/* Horizontal bar chart */}
        <div className="flex-1 flex flex-col justify-between gap-px min-h-0">
          {histogram.map((bin, idx) => {
            const active = bin.year <= currentMax;
            return (
              <div
                key={idx}
                className="flex items-center flex-1 group cursor-pointer"
                onClick={() => onMaxYearChange?.(bin.year + 50)}
                title={`${formatYear(bin.year)}: ${bin.count} artworks`}
              >
                <div
                  className={`h-full rounded-r transition-all duration-150 ${
                    active
                      ? 'bg-gradient-to-r from-amber-400 to-amber-300'
                      : 'bg-white/15 group-hover:bg-white/28'
                  }`}
                  style={{ width: `${Math.max(2, bin.percentage)}%`, minHeight: 1 }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Quick jump buttons ── */}
      <div className="px-3 pb-4 flex gap-1.5 shrink-0">
        <button
          onClick={() => onMaxYearChange?.(minYear)}
          className="flex-1 py-1.5 text-[9px] rounded-lg bg-white/15 border border-white/25 text-white/80 hover:bg-white/25 hover:text-white transition-all"
        >
          Start
        </button>
        <button
          onClick={() => onMaxYearChange?.(Math.floor((minYear + absoluteMaxYear) / 2))}
          className="flex-1 py-1.5 text-[9px] rounded-lg bg-white/15 border border-white/25 text-white/80 hover:bg-white/25 hover:text-white transition-all"
        >
          Midpoint
        </button>
        <button
          onClick={() => onMaxYearChange?.(absoluteMaxYear)}
          className="flex-1 py-1.5 text-[9px] rounded-lg bg-amber-400/20 border border-amber-400/40 text-amber-300 hover:bg-amber-400/30 transition-all"
        >
          All Time
        </button>
      </div>
    </div>
  );
}
