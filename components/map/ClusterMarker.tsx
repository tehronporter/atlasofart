// components/map/ClusterMarker.tsx
// Cluster marker shown when multiple artworks share the same location

'use client';

import { memo, useCallback, useState } from 'react';
import { Marker } from 'react-map-gl/mapbox';

interface ClusterMarkerProps {
  lat: number;
  lng: number;
  count: number;
  isSelected?: boolean;
  onHover?: (show: boolean) => void;
  onClick?: () => void;
}

const ClusterMarker = memo(function ClusterMarker({
  lat,
  lng,
  count,
  isSelected,
  onHover,
  onClick,
}: ClusterMarkerProps) {
  const [isHovering, setIsHovering] = useState(false);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.();
  }, [onClick]);

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
    onHover?.(true);
  }, [onHover]);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    onHover?.(false);
  }, [onHover]);

  // Blue color scheme with size based on count
  const baseSize = 16;
  const size = isSelected || isHovering ? baseSize + 4 : baseSize;

  return (
    <Marker longitude={lng} latitude={lat} anchor="center" style={{ zIndex: isSelected ? 20 : 5 }}>
      <div
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        role="button"
        tabIndex={0}
        aria-label={`${count} artworks at this location`}
        style={{ width: size, height: size }}
        className={`
          rounded-full flex items-center justify-center
          cursor-pointer select-none transition-all duration-150
          border-2
          ${isSelected
            ? 'bg-blue-600 text-white border-blue-300 shadow-[0_0_16px_rgba(46,83,255,0.8)]'
            : isHovering
            ? 'bg-blue-500 text-white border-blue-300 shadow-[0_0_12px_rgba(46,83,255,0.6)]'
            : 'bg-blue-500/75 text-white border-blue-700/40 hover:bg-blue-500 hover:shadow-[0_0_8px_rgba(46,83,255,0.4)]'}
        `}
      >
        <div className="w-1.5 h-1.5 bg-white rounded-full" />
      </div>
    </Marker>
  );
});

export default ClusterMarker;
