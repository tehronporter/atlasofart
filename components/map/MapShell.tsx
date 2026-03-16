// MapShell.tsx - Map component with generic artwork type
// Phase 13: Supabase-compatible

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
  onArtworkClick 
}: MapShellProps) {
  const [viewState, setViewState] = useState({
    latitude: 30,
    longitude: 15,
    zoom: 1.5,
  });

  return (
    <>
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
        maxZoom={10}
        onClick={() => onArtworkClick?.({})}
      >
        {artworks.map((artwork) => (
          <ArtworkMarker
            key={artwork.id}
            artwork={artwork}
            isSelected={selectedArtworkId === artwork.id}
            onClick={(a) => onArtworkClick?.({ id: a.id })}
          />
        ))}
      </Map>

      <div className="hidden sm:block absolute top-4 left-4 pointer-events-none">
        <div className="bg-neutral-900/80 backdrop-blur-sm px-4 py-3 rounded-lg border border-neutral-800">
          <h1 className="text-sm font-semibold text-white">Atlas of Art</h1>
          <p className="text-xs text-neutral-500 mt-0.5">Explore art across time and space</p>
        </div>
      </div>

      <div className="absolute top-4 right-4 pointer-events-none">
        <div className="bg-neutral-900/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-neutral-800">
          <p className="text-xs text-neutral-400">
            <span className="text-amber-500 font-semibold">{artworks.length}</span> artworks
          </p>
        </div>
      </div>
    </>
  );
}
