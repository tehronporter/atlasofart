// components/map/MapShell.tsx
// Mapbox native GeoJSON clustering — single WebGL layer, dramatically faster at 10,000+ artworks

'use client';

import MapGL, { MapRef, Source, Layer } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import ClusterListCard from './ClusterListCard';
import FloatingArtworkCard, { ArtworkCardData } from './FloatingArtworkCard';
import { useRef, useState, useCallback, useEffect, useMemo } from 'react';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';
const MAX_ZOOM = 12;
const CLUSTER_LIST_THRESHOLD = 40;
const OVERLAP_PX = 8;

// ── Map style options ──────────────────────────────────────────────────────────
const MAP_STYLES = {
  dark:      'mapbox://styles/mapbox/dark-v11',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
  light:     'mapbox://styles/mapbox/light-v11',
} as const;
type MapStyleKey = keyof typeof MAP_STYLES;

// ── Era color scale — step expression on year_start ───────────────────────────
// Each color matches a distinct art-historical period; works on both dark + light styles
const ERA_COLOR_EXPR: any = [
  'step', ['coalesce', ['get', 'year_start'], 9999],
  '#818cf8',         // < -1500 BCE  — Prehistoric / Ancient   (indigo)
  -1500, '#a78bfa',  // -1500→ -500  — Classical Antiquity     (violet)
   -500, '#34d399',  //  -500→  500  — Hellenistic / Roman      (emerald)
    500, '#22d3ee',  //   500→ 1400  — Medieval / Byzantine     (cyan)
   1400, '#f59e0b',  //  1400→ 1700  — Renaissance              (amber)
   1700, '#fb923c',  //  1700→ 1900  — Baroque / Enlightenment  (orange)
   1900, '#f87171',  //  1900+       — Modern / Contemporary    (rose)
];

const ERA_LEGEND = [
  { label: 'Ancient',     color: '#818cf8', years: '< 1500 BCE' },
  { label: 'Classical',   color: '#a78bfa', years: '1500–500 BCE' },
  { label: 'Hellenistic', color: '#34d399', years: '500 BCE–500 CE' },
  { label: 'Medieval',    color: '#22d3ee', years: '500–1400' },
  { label: 'Renaissance', color: '#f59e0b', years: '1400–1700' },
  { label: 'Baroque',     color: '#fb923c', years: '1700–1900' },
  { label: 'Modern',      color: '#f87171', years: '1900+' },
];

// ── Types ──────────────────────────────────────────────────────────────────────
export type MapCommand =
  | { type: 'fitBounds'; bounds: [[number, number], [number, number]] }
  | { type: 'flyTo'; lat: number; lng: number; zoom?: number };

interface MapShellProps {
  artworks?: ArtworkCardData[];
  selectedArtworkId?: string | null;
  selectedArtwork?: ArtworkCardData | null;
  onArtworkClick?: (artwork: { id?: string }) => void;
  onExpand?: () => void;
  onDoubleClick?: () => void;
  onArtworkClose?: () => void;
  mapCommand?: MapCommand | null;
  onMapCommandDone?: () => void;
  onVisibleCountChange?: (count: number) => void;
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
    year_start:     props.year_start     ?? null,
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
  onExpand,
  onDoubleClick,
  onArtworkClose,
  mapCommand,
  onMapCommandDone,
  onVisibleCountChange,
}: MapShellProps) {
  const mapRef       = useRef<MapRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [viewState, setViewState] = useState<ViewState>({ latitude: 25, longitude: 20, zoom: 1.8 });
  const [markerPos, setMarkerPos] = useState<Pos | null>(null);
  const [cursor, setCursor]       = useState('grab');

  // Map display state
  const [mapStyle, setMapStyle]   = useState<MapStyleKey>('dark');
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showLegend, setShowLegend]   = useState(false);

  // Cluster / overlap panel state
  const [clusterArtworks, setClusterArtworks] = useState<ArtworkCardData[]>([]);
  const [clusterCenter, setClusterCenter]     = useState<[number, number] | null>(null);

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
          year_start:     (a as any).year_start ?? null,
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

  // ── Recompute marker overlay on view change ────────────────────────────────
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
  }, [viewState, selectedArtwork]);

  // Clear cluster panel when individual artwork is selected
  useEffect(() => {
    if (selectedArtwork) { setClusterArtworks([]); setClusterCenter(null); }
  }, [selectedArtwork]);

  // ── Execute map commands (fitBounds / flyTo) ───────────────────────────────
  useEffect(() => {
    if (!mapCommand) return;
    const map = mapRef.current?.getMap();
    if (!map) return;
    if (mapCommand.type === 'fitBounds') {
      map.fitBounds(mapCommand.bounds, { padding: 80, maxZoom: MAX_ZOOM - 1, duration: 1200 });
    } else if (mapCommand.type === 'flyTo') {
      map.flyTo({
        center: [mapCommand.lng, mapCommand.lat],
        zoom: mapCommand.zoom ?? 9,
        duration: 1400,
        essential: true,
      });
    }
    onMapCommandDone?.();
  }, [mapCommand]);

  // ── Report visible unclustered artwork count after each move ───────────────
  const handleMoveEnd = useCallback(() => {
    if (!onVisibleCountChange) return;
    const map = mapRef.current?.getMap();
    if (!map) return;
    const features = (map as any).queryRenderedFeatures({ layers: ['unclustered-point'] }) as any[];
    const seen = new Set<string>();
    let count = 0;
    for (const f of features) {
      const id = f.properties?.id;
      if (id && !seen.has(id)) { seen.add(id); count++; }
    }
    onVisibleCountChange(count);
  }, [onVisibleCountChange]);

  // ── Map click ──────────────────────────────────────────────────────────────
  const handleMapClick = useCallback((e: any) => {
    const features: any[] = e.features ?? [];

    if (features.length === 0) {
      onArtworkClick?.({});
      setClusterArtworks([]);
      setClusterCenter(null);
      return;
    }

    const feature = features[0];

    // Cluster click
    if (feature.layer?.id === 'clusters') {
      const clusterId  = feature.properties?.cluster_id;
      const pointCount = feature.properties?.point_count ?? 0;
      const map        = mapRef.current?.getMap();
      if (!map || clusterId == null) return;

      const coords: [number, number] = feature.geometry.coordinates;
      const source = map.getSource('artworks') as any;

      if (pointCount <= CLUSTER_LIST_THRESHOLD) {
        source.getClusterLeaves(clusterId, CLUSTER_LIST_THRESHOLD, 0, (err: any, leaves: any[]) => {
          if (err || !leaves) return;
          const items = leaves.filter((l: any) => l.properties?.id).map((l: any) => propsToArtwork(l.properties));
          setClusterArtworks(items);
          setClusterCenter(coords);
          onArtworkClick?.({});
        });
        return;
      }

      source.getClusterExpansionZoom(clusterId, (err: any, zoom: number | null) => {
        if (err || zoom == null) return;
        if (zoom <= MAX_ZOOM) {
          map.easeTo({ center: coords, zoom: zoom + 0.5 });
          onArtworkClick?.({});
          setClusterArtworks([]);
          setClusterCenter(null);
        } else {
          source.getClusterLeaves(clusterId, 100, 0, (err2: any, leaves: any[]) => {
            if (err2 || !leaves) return;
            const items = leaves.filter((l: any) => l.properties?.id).map((l: any) => propsToArtwork(l.properties));
            setClusterArtworks(items);
            setClusterCenter(coords);
            onArtworkClick?.({});
          });
        }
      });
      return;
    }

    // Individual point click — detect overlapping dots
    if (feature.layer?.id === 'unclustered-point') {
      const props = feature.properties;
      if (!props?.id) return;
      const map = mapRef.current?.getMap();
      if (map && e.point) {
        const { x, y } = e.point;
        const nearby = map.queryRenderedFeatures(
          [[x - OVERLAP_PX, y - OVERLAP_PX], [x + OVERLAP_PX, y + OVERLAP_PX]],
          { layers: ['unclustered-point'] }
        );
        const seen = new Set<string>();
        const unique = nearby.filter((f: any) => {
          const id = f.properties?.id;
          if (!id || seen.has(id)) return false;
          seen.add(id);
          return true;
        });
        if (unique.length > 1) {
          const items = unique.map((f: any) => propsToArtwork(f.properties));
          setClusterArtworks(items);
          setClusterCenter(feature.geometry.coordinates);
          onArtworkClick?.({});
          return;
        }
      }
      setClusterArtworks([]);
      setClusterCenter(null);
      onArtworkClick?.({ id: props.id });
    }
  }, [onArtworkClick]);

  const handleMouseMove = useCallback((e: any) => {
    setCursor((e.features ?? []).length > 0 ? 'pointer' : 'grab');
  }, []);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div ref={containerRef} className="absolute inset-0">
      <MapGL
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        onMoveEnd={handleMoveEnd}
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
        mapStyle={MAP_STYLES[mapStyle]}
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
        fog={mapStyle === 'dark' ? {
          color: 'rgba(15, 15, 20, 0.8)',
          'high-color': 'rgba(10, 10, 15, 0.9)',
          'horizon-blend': 0.04,
          'star-intensity': 0.15,
        } : undefined}
      >
        <Source
          id="artworks"
          type="geojson"
          data={geojsonData}
          cluster={true}
          clusterMaxZoom={10}
          clusterRadius={40}
        >
          {/* ── Heatmap density layer — amber/orange gradient, fades at zoom 7+ ── */}
          {showHeatmap && (
            <Layer
              id="artwork-heatmap"
              type="heatmap"
              maxzoom={8}
              paint={{
                'heatmap-weight': 1,
                'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 0.6, 8, 2],
                'heatmap-color': [
                  'interpolate', ['linear'], ['heatmap-density'],
                  0,   'rgba(0,0,0,0)',
                  0.1, 'rgba(80,40,5,0.25)',
                  0.3, 'rgba(160,80,10,0.5)',
                  0.5, 'rgba(245,158,11,0.65)',
                  0.75,'rgba(249,115,22,0.8)',
                  1.0, 'rgba(239,68,68,0.95)',
                ],
                'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 10, 8, 26],
                'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 4, 1, 7.5, 0],
              }}
            />
          )}

          {/* Cluster outer glow */}
          <Layer
            id="cluster-glow"
            type="circle"
            filter={['has', 'point_count']}
            paint={{
              'circle-color': ['step', ['get', 'point_count'], '#f59e0b', 10, '#f97316', 100, '#ef4444'],
              'circle-radius': ['step', ['get', 'point_count'], 26, 10, 36, 100, 46],
              'circle-opacity': 0.15,
            }}
          />

          {/* Cluster circles */}
          <Layer
            id="clusters"
            type="circle"
            filter={['has', 'point_count']}
            paint={{
              'circle-color': ['step', ['get', 'point_count'], '#f59e0b', 10, '#f97316', 100, '#ef4444'],
              'circle-radius': ['step', ['get', 'point_count'], 18, 10, 26, 100, 34],
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

          {/* Individual artwork glow (era-colored) */}
          <Layer
            id="artwork-glow"
            type="circle"
            filter={['!', ['has', 'point_count']]}
            paint={{
              'circle-color': ERA_COLOR_EXPR,
              'circle-radius': ['case', ['==', ['get', 'id'], selectedArtworkId ?? ''], 16, 11],
              'circle-opacity': 0.18,
            }}
          />

          {/* Individual artwork dots — era-colored, white when selected */}
          <Layer
            id="unclustered-point"
            type="circle"
            filter={['!', ['has', 'point_count']]}
            paint={{
              'circle-color': [
                'case',
                ['==', ['get', 'id'], selectedArtworkId ?? ''],
                '#ffffff',
                ERA_COLOR_EXPR,
              ],
              'circle-radius': ['case', ['==', ['get', 'id'], selectedArtworkId ?? ''], 9, 6],
              'circle-stroke-width': ['case', ['==', ['get', 'id'], selectedArtworkId ?? ''], 3, 1.5],
              'circle-stroke-color': [
                'case',
                ['==', ['get', 'id'], selectedArtworkId ?? ''],
                'rgba(255,255,255,0.9)',
                'rgba(0,0,0,0.35)',
              ],
              'circle-opacity': 0.95,
            }}
          />
        </Source>
      </MapGL>

      {/* ── Left-side map controls ─────────────────────────────────────────── */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-2 pointer-events-auto select-none">

        {/* Map style toggle */}
        <div
          className="flex items-center gap-0.5 rounded-lg p-0.5"
          style={{ background: 'rgba(10,10,15,0.75)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)' }}
        >
          {(['dark', 'satellite', 'light'] as MapStyleKey[]).map(s => (
            <button
              key={s}
              onClick={() => setMapStyle(s)}
              className={`px-2.5 py-1.5 rounded-md text-[10px] font-medium transition-all duration-200 ${
                mapStyle === s
                  ? 'bg-white/[0.18] text-white'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              {s === 'dark' ? 'Dark' : s === 'satellite' ? 'Sat.' : 'Light'}
            </button>
          ))}
        </div>

        {/* Heatmap density toggle */}
        <button
          onClick={() => setShowHeatmap(h => !h)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all duration-200 ${
            showHeatmap
              ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400'
              : 'bg-black/60 border border-white/[0.1] text-neutral-500 hover:text-neutral-300'
          }`}
          style={{ backdropFilter: 'blur(12px)' }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
          </svg>
          Density
        </button>

        {/* Era legend toggle */}
        <button
          onClick={() => setShowLegend(l => !l)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all duration-200 ${
            showLegend
              ? 'bg-white/[0.12] border border-white/[0.2] text-white'
              : 'bg-black/60 border border-white/[0.1] text-neutral-500 hover:text-neutral-300'
          }`}
          style={{ backdropFilter: 'blur(12px)' }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          Era Legend
        </button>
      </div>

      {/* Era legend panel */}
      {showLegend && (
        <div
          className="absolute left-3 z-20 pointer-events-auto"
          style={{ top: 150 }}
        >
          <div
            className="rounded-xl px-3.5 py-3 space-y-1.5"
            style={{
              background: 'rgba(8,8,14,0.88)',
              border: '1px solid rgba(255,255,255,0.09)',
              backdropFilter: 'blur(16px)',
            }}
          >
            <p className="text-[9px] uppercase tracking-widest text-neutral-600 mb-2">Era · Dot Color</p>
            {ERA_LEGEND.map(e => (
              <div key={e.label} className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: e.color, boxShadow: `0 0 6px ${e.color}80` }} />
                <span className="text-[10px] text-neutral-300 w-[76px]">{e.label}</span>
                <span className="text-[9px] text-neutral-600">{e.years}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state overlay — when filters return no artworks */}
      {artworks.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div
            className="text-center max-w-xs px-8 py-6 rounded-2xl"
            style={{
              background: 'rgba(10,10,15,0.75)',
              border: '1px solid rgba(255,255,255,0.09)',
              backdropFilter: 'blur(16px)',
            }}
          >
            <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-400/60">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <p className="text-[13px] font-medium text-neutral-300 mb-1">No artworks match</p>
            <p className="text-[11px] text-neutral-600">Adjust filters or the timeline to see results</p>
          </div>
        </div>
      )}

      {/* Floating artwork preview card */}
      {selectedArtwork && markerPos && (
        <FloatingArtworkCard
          artwork={selectedArtwork}
          markerX={markerPos.x}
          markerY={markerPos.y}
          containerWidth={containerRef.current?.offsetWidth ?? 800}
          containerHeight={containerRef.current?.offsetHeight ?? 600}
          onExpand={onExpand}
          onDoubleClick={onDoubleClick}
          onClose={onArtworkClose}
        />
      )}

      {/* Right-side cluster / overlap panel */}
      {clusterArtworks.length > 0 && !selectedArtwork && (
        <ClusterListCard
          artworks={clusterArtworks}
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
