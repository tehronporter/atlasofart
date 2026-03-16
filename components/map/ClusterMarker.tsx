// components/map/ClusterMarker.tsx
// Cluster marker shown when multiple artworks share the same location

'use client';

import { memo, useCallback } from 'react';
import { Marker } from 'react-map-gl/mapbox';

interface ClusterMarkerProps {
  lat: number;
  lng: number;
  count: number;
  isSelected?: boolean;
  onClick?: () => void;
}

const ClusterMarker = memo(function ClusterMarker({
  lat,
  lng,
  count,
  isSelected,
  onClick,
}: ClusterMarkerProps) {
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.();
  }, [onClick]);

  const size = count >= 20 ? 40 : count >= 10 ? 34 : count >= 5 ? 30 : 26;
  const fontSize = count >= 100 ? 9 : count >= 10 ? 10 : 11;

  return (
    <Marker longitude={lng} latitude={lat} anchor="center" style={{ zIndex: isSelected ? 20 : 5 }}>
      <div
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-label={`${count} artworks at this location`}
        style={{ width: size, height: size }}
        className={`
          rounded-full flex items-center justify-center
          font-bold tabular-nums cursor-pointer select-none
          transition-all duration-150
          ${isSelected
            ? 'bg-amber-400 text-neutral-900 border-2 border-amber-200 shadow-[0_0_16px_rgba(251,191,36,0.9)]'
            : 'bg-amber-500/85 text-neutral-900 border-2 border-amber-900/40 hover:bg-amber-400 hover:shadow-[0_0_12px_rgba(251,191,36,0.7)]'}
        `}
      >
        <span style={{ fontSize }}>{count}</span>
      </div>
    </Marker>
  );
});

export default ClusterMarker;
