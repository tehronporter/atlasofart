// components/map/ArtworkMarker.tsx
// Artwork pin marker — clicking updates the left panel detail card (no popup)

'use client';

import { memo, useCallback } from 'react';
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
  onClick?: (artwork: ArtworkMarkerData) => void;
}

const ArtworkMarker = memo(function ArtworkMarker({ artwork, isSelected, onClick }: ArtworkMarkerProps) {
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.(artwork);
  }, [artwork, onClick]);

  return (
    <Marker
      longitude={artwork.lng}
      latitude={artwork.lat}
      anchor="center"
      style={{ cursor: 'pointer', zIndex: isSelected ? 10 : 1 }}
    >
      <div
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-label={`View ${artwork.title}`}
        title={artwork.title}
        className={`rounded-full border-2 transition-all duration-150 ${
          isSelected
            ? 'w-5 h-5 bg-white border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.8)]'
            : 'w-3.5 h-3.5 bg-amber-500 border-amber-900/60 hover:w-5 hover:h-5 hover:shadow-[0_0_10px_rgba(251,191,36,0.6)]'
        }`}
      />
    </Marker>
  );
});

export default ArtworkMarker;
