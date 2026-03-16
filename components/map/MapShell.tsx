// components/map/MapShell.tsx
// Mapbox native GeoJSON clustering — Source + Layer renders all markers as a single WebGL layer
// At 10,000+ artworks this is dramatically faster than React <Marker> components

'use client';

import MapGL, { MapRef, Source, Layer } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import ClusterListCard from './ClusterListCard';
import FloatingArtworkCard, { ArtworkCardData } from './FloatingArtworkCard';
import { useRef, useState, useCallback, useEffect, useMemo } from 'react';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';
const DARK_STYLE   = 'mapbox://styles/mapbox/dark-v11';
const MAX_ZOOM     = 12;

// ── Types ──────────────────────────────────────────────────────────────────────

interface MapShellProps {
  artworks?: ArtworkCardData[];
  selectedArtworkId?: string | null;
  selectedArtwork?: ArtworkCardData | null;
  onArtworkClick?: (artwork: { id?: string }) => void;
  onDoubleClick?: () => void;
  onArtworkClose?: () => void;
}

interface ViewState { latitude: number; longitude: number; zoom: number }
interface Pos { x: number; y: number }

// ── Helpers ────────────────────────────────────────────────────────────────────

function propsToArtwork(props: any): ArtworkCardData {
  return {
    id:             props.id,
    title:          props.title          ?? 'Untitled',
    artist_display: props.artist_display ?? null,
    image_url:      props.image_url      ?? null,
    image_width:    props.image_width    ?? null,
    image_height:   props.image_height   ?? null,
    year:           props.year           ?? '?',
    place_created:  props.place_created  ?? null,
    medium:         props.medium         ?? null,
    tags:           typeof props.tags === 'string' ? JSON.parse(props.tags) : (props.tags ?? []),
    description:    props.description    ?? null,
    getty_url:      props.getty_url      ?? undefined,
    current_museum: props.current_museum ?? null,
    lat:            props.lat            ?? 0,
    lng:            props.lng            ?? 0,
  };
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function MapShell({
  artworks = [],
  selectedArtworkId = null,
  selectedArtwork = null,
  onArtworkClick,
  onDoubleClick,
  onArtworkClose,
}: MapShellProps) {
  const mapRef       = useRef<MapRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [viewState, setViewState] = useState<ViewState>({ latitude: 25, longitude: 20, zoom: 1.8 });
  const [markerPos, setMarkerPos]       = useState<Pos | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
  const [cursor, setCursor] = useState('grab');

  // Cluster list panel state (same-location artworks at max zoom)
  const [clusterArtworks, setClusterArtworks] = useState<ArtworkCardData[]>([]);
  const [clusterCenter, setClusterCenter]     = useState<[number, number] | null>(null);
  const [clusterPos, setClusterPos]           = useState<Pos | null>(null);

  // ── Build GeoJSON ──────────────────────────────────────────────────────────
  const geojsonData = useMemo((): GeoJSON.FeatureCollection => ({
    type: 'FeatureCollection',
    features: artworks
      .filter(a => !(a.lat === 0 && a.lng === 0))
      .map(a => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [a.lng, a.lat] },
        properties: {
          id:             a.id,
          title:          a.title,
          artist_display: a.artist_display,
          image_url:      a.image_url,
          image_width:    a.image_width  ?? null,
          image_height:   a.image_height ?? null,
          year:           a.year,
          place_created:  a.place_created,
          medium:         a.medium,
          tags:           JSON.stringify(a.tags ?? []),
          description:    a.description,
          getty_url:      a.getty_url ?? null,
          current_museum: a.current_museum,
          lat:            a.lat,
          lng:            a.lng,
        },
      })),
  }), [artworks]);

  // ── Recompute overlay positions on every move/data change ──────────────────
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    if (selectedArtwork) {
      try {
        const pt = map.project([selectedArtwork.lng, selectedArtwork.lat]);
        setMarkerPos({ x: pt.x, y: pt.y });
      } catch { setMarkerPos(null); }
    } else {
      setMarkerPos(null);
    }

    if (clusterCenter) {
      try {
        const pt = map.project(clusterCenter);
        setClusterPos({ x: pt.x, y: pt.y });
      } catch { setClusterPos(null); }
    }
  }, [viewState, selectedArtwork, clusterCenter]);

  // Clear cluster panel when an artwork is selected
  useEffect(() => {
    if (selectedArtwork) {
      setClusterArtworks([]);
      setClusterCenter(null);
    }
  }, [selectedArtwork]);

  // ── Container resize tracking ──────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setContainerSize({ width, height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ── Map click — handles cluster expand + individual point select ───────────
  const handleMapClick = useCallback((e: any) => {
    const features: any[] = e.features ?? [];

    if (features.length === 0) {
      onArtworkClick?.({});
      setClusterArtworks([]);
      setClusterCenter(null);
      return;
    }

    const feature = features[0];

    // ── Cluster click ────────────────────────────────────────────────────────
    if (feature.layer?.id === 'clusters') {
      const clusterId = feature.properties?.cluster_id;
      const map = mapRef.current?.getMap();
      if (!map || clusterId == null) return;

      const coords: [number, number] = feature.geometry.coordinates;
      const source = map.getSource('artworks') as any;

      source.getClusterExpansionZoom(clusterId, (err: any, zoom: number | null) => {
        if (err || zoom == null) return;

        if (zoom <= MAX_ZOOM) {
          // Zoom in to expand cluster
          map.easeTo({ center: coords, zoom: zoom + 0.5 });
          onArtworkClick?.({});
          setClusterArtworks([]);
          setClusterCenter(null);
        } else {
          // Already at max zoom — fetch leaves and show list panel
          source.getClusterLeaves(clusterId, 100, 0, (err2: any, leaves: any[]) => {
            if (err2 || !leaves) return;
            const items = leaves
              .filter((l: any) => l.properties?.id)
              .map((l: any) => propsToArtwork(l.properties));
            setClusterArtworks(items);
            setClusterCenter(coords);
            onArtworkClick?.({});
          });
        }
      });
      return;
    }

    // ── Individual point click ───────────────────────────────────────────────
    if (feature.layer?.id === 'unclustered-point') {
      const props = feature.properties;
      if (!props?.id) return;
      setClusterArtworks([]);
      setClusterCenter(null);
      onArtworkClick?.({ id: props.id });
    }
  }, [onArtworkClick]);

  // ── Hover cursor ───────────────────────────────────────────────────────────
  const handleMouseMove = useCallback((e: any) => {
    const features: any[] = e.features ?? [];
    setCursor(features.length > 0 ? 'pointer' : 'grab');
  }, []);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div ref={containerRef} className="absolute inset-0">
      <MapGL
        ref={mapRef}
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
        maxZoom={MAX_ZOOM}
        cursor={cursor}
        onClick={handleMapClick}
        onMouseMove={handleMouseMove}
        interactiveLayerIds={['clusters', 'unclustered-point']}
        fog={{
          color: 'rgba(15, 15, 20, 0.8)',
          'high-color': 'rgba(10, 10, 15, 0.9)',
          'horizon-blend': 0.04,
          'star-intensity': 0.15,
        }}
      >
        <Source
          id="artworks"
          type="geojson"
          data={geojsonData}
          cluster={true}
          clusterMaxZoom={10}
          clusterRadius={40}
        >
          {/* Cluster glow — subtle outer ring */}
          <Layer
            id="cluster-glow"
            type="circle"
            filter={['has', 'point_count']}
            paint={{
              'circle-color': [
                'step', ['get', 'point_count'],
                '#f59e0b',
                10,  '#f97316',
                100, '#ef4444',
              ],
              'circle-radius': [
                'step', ['get', 'point_count'],
                26, 10, 36, 100, 46,
              ],
              'circle-opacity': 0.15,
            }}
          />

          {/* Cluster circles — size + colour scale with count */}
          <Layer
            id="clusters"
            type="circle"
            filter={['has', 'point_count']}
            paint={{
              'circle-color': [
                'step', ['get', 'point_count'],
                '#f59e0b',   // amber  < 10
                10,  '#f97316',   // orange < 100
                100, '#ef4444',   // red    >= 100
              ],
              'circle-radius': [
                'step', ['get', 'point_count'],
                18,
                10,  26,
                100, 34,
              ],
              'circle-stroke-width': 2.5,
              'circle-stroke-color': 'rgba(255,255,255,0.35)',
              'circle-opacity': 0.95,
            }}
          />

          {/* Cluster count labels */}
          <Layer
            id="cluster-count"
            type="symbol"
            filter={['has', 'point_count']}
            layout={{
              'text-field': '{point_count_abbreviated}',
              'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
              'text-size': 13,
            }}
            paint={{ 'text-color': '#ffffff' }}
          />

          {/* Individual artwork glow — subtle outer ring */}
          <Layer
            id="artwork-glow"
            type="circle"
            filter={['!', ['has', 'point_count']]}
            paint={{
              'circle-color': '#f59e0b',
              'circle-radius': [
                'case',
                ['==', ['get', 'id'], selectedArtworkId ?? ''],
                14, 10,
              ],
              'circle-opacity': 0.12,
            }}
          />

          {/* Individual artwork dots — highlight when selected */}
          <Layer
            id="unclustered-point"
            type="circle"
            filter={['!', ['has', 'point_count']]}
            paint={{
              'circle-color': [
                'case',
                ['==', ['get', 'id'], selectedArtworkId ?? ''],
                '#fde68a',
                '#f59e0b',
              ],
              'circle-radius': [
                'case',
                ['==', ['get', 'id'], selectedArtworkId ?? ''],
                9, 6,
              ],
              'circle-stroke-width': [
                'case',
                ['==', ['get', 'id'], selectedArtworkId ?? ''],
                3, 2,
              ],
              'circle-stroke-color': [
                'case',
                ['==', ['get', 'id'], selectedArtworkId ?? ''],
                'rgba(255,255,255,0.8)',
                'rgba(255,255,255,0.4)',
              ],
              'circle-opacity': 0.98,
            }}
          />
        </Source>
      </MapGL>

      {/* Floating artwork preview card */}
      {selectedArtwork && markerPos && (
        <FloatingArtworkCard
          artwork={selectedArtwork}
          markerX={markerPos.x}
          markerY={markerPos.y}
          containerWidth={containerSize.width}
          containerHeight={containerSize.height}
          onDoubleClick={onDoubleClick}
          onClose={onArtworkClose}
        />
      )}

      {/* Cluster list panel — shown when cluster can't expand further */}
      {clusterArtworks.length > 0 && clusterPos && !selectedArtwork && (
        <ClusterListCard
          artworks={clusterArtworks}
          markerX={clusterPos.x}
          markerY={clusterPos.y}
          containerWidth={containerSize.width}
          containerHeight={containerSize.height}
          onSelectArtwork={artwork => {
            setClusterArtworks([]);
            setClusterCenter(null);
            onArtworkClick?.({ id: artwork.id });
          }}
          onClose={() => {
            setClusterArtworks([]);
            setClusterCenter(null);
          }}
        />
      )}
    </div>
  );
}
