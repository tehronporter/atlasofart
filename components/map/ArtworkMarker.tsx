// components/map/ArtworkMarker.tsx
// Artwork pin marker — clicking updates the left panel detail card (no popup)

'use client';

import { memo, useCallback, useState } from 'react';
import { Marker } from 'react-map-gl/mapbox';

interface ArtworkMarkerData {
  id: string;
  lat: number;
  lng: number;
  title: string;
}

interface ArtworkMarkerProps {
  artwork: ArtworkMarkerData;
  isSelected?: boolean;
  onHover?: (show: boolean) => void;
  onClick?: (artwork: ArtworkMarkerData) => void;
}

const ArtworkMarker = memo(function ArtworkMarker({ artwork, isSelected, onHover, onClick }: ArtworkMarkerProps) {
  const [isHovering, setIsHovering] = useState(false);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.(artwork);
  }, [artwork, onClick]);

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
    onHover?.(true);
  }, [onHover]);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    onHover?.(false);
  }, [onHover]);

  const size = isSelected || isHovering ? 6 : 4;

  return (
    <Marker
      longitude={artwork.lng}
      latitude={artwork.lat}
      anchor="center"
      style={{ cursor: 'pointer', zIndex: isSelected ? 10 : 1 }}
    >
      <div
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        role="button"
        tabIndex={0}
        aria-label={`View ${artwork.title}`}
        title={artwork.title}
        style={{ width: size, height: size }}
        className={`
          rounded-full border-2 transition-all duration-150
          ${isSelected
            ? 'bg-white border-blue-500 shadow-[0_0_12px_rgba(46,83,255,0.8)]'
            : isHovering
            ? 'bg-blue-500 border-blue-400 shadow-[0_0_8px_rgba(46,83,255,0.6)]'
            : 'bg-blue-500 border-blue-700/60 hover:shadow-[0_0_6px_rgba(46,83,255,0.4)]'}
        `}
      />
    </Marker>
  );
});

export default ArtworkMarker;
