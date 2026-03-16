// ArtworkMarker.tsx - Simple marker with generic type
// Phase 13: Compatible with Supabase data

'use client';

import { memo, useState, useCallback } from 'react';
import { Marker, Popup } from 'react-map-gl/mapbox';

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
  const [showPopup, setShowPopup] = useState(false);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPopup(true);
    onClick?.(artwork);
  }, [artwork, onClick]);

  return (
    <>
      <Marker
        longitude={artwork.lng}
        latitude={artwork.lat}
        anchor="bottom"
        style={{ cursor: 'pointer' }}
      >
        <div
          className={`w-4 h-4 rounded-full border-2 transition-transform duration-200 shadow-lg shadow-amber-500/50 ${
            isSelected 
              ? 'bg-white border-amber-500 scale-125' 
              : 'bg-amber-500 border-neutral-900 hover:scale-110'
          }`}
          onClick={handleClick}
          role="button"
          tabIndex={0}
          aria-label={`View ${artwork.title}`}
        />
      </Marker>

      {showPopup && (
        <Popup
          longitude={artwork.lng}
          latitude={artwork.lat}
          anchor="bottom"
          offset={25}
          closeOnClick={false}
          onClose={() => setShowPopup(false)}
          className="artwork-popup"
        >
          <div className="max-w-[200px]">
            <h3 className="font-semibold text-neutral-900 text-sm">{artwork.title}</h3>
          </div>
        </Popup>
      )}
    </>
  );
});

export default ArtworkMarker;
