// components/map/MapShell.tsx
// Immersive dark world map with artwork markers

'use client';

import Map from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import ArtworkMarker from './ArtworkMarker';
import { useState } from 'react';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';
const DARK_STYLE = 'mapbox://styles/mapbox/dark-v11';

interface ArtworkData {
  id: string;
  lat: number;
  lng: number;
  title: string;
}

interface MapShellProps {
  artworks?: ArtworkData[];
  selectedArtworkId?: string | null;
  onArtworkClick?: (artwork: { id?: string }) => void;
}

export default function MapShell({
  artworks = [],
  selectedArtworkId = null,
  onArtworkClick,
}: MapShellProps) {
  const [viewState, setViewState] = useState({
    latitude: 25,
    longitude: 20,
    zoom: 1.8,
  });

  return (
    // Wrapping div ensures height:100% works regardless of flex context
    <div className="absolute inset-0">
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
        mapStyle={DARK_STYLE}
        projection="globe"
        dragRotate={false}
        touchZoomRotate={false}
        doubleClickZoom={false}
        keyboard={false}
        scrollZoom={true}
        minZoom={1}
        maxZoom={12}
        onClick={() => onArtworkClick?.({})}
        fog={{
          color: 'rgba(15, 15, 20, 0.8)',
          'high-color': 'rgba(10, 10, 15, 0.9)',
          'horizon-blend': 0.04,
          'star-intensity': 0.15,
        }}
      >
        {artworks.map(artwork => (
          artwork.lat !== 0 || artwork.lng !== 0 ? (
            <ArtworkMarker
              key={artwork.id}
              artwork={artwork}
              isSelected={selectedArtworkId === artwork.id}
              onClick={a => onArtworkClick?.({ id: a.id })}
            />
          ) : null
        ))}
      </Map>
    </div>
  );
}
