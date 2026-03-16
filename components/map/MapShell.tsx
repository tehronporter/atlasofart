// components/map/MapShell.tsx
// Immersive dark world map with artwork markers + floating preview card + clustering
// Card position computed from map ref — no external Map context required

'use client';

import MapGL, { MapRef } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import ArtworkMarker from './ArtworkMarker';
import ClusterMarker from './ClusterMarker';
import ClusterListCard from './ClusterListCard';
import FloatingArtworkCard, { ArtworkCardData } from './FloatingArtworkCard';
import { useRef, useState, useCallback, useEffect, useMemo } from 'react';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';
const DARK_STYLE = 'mapbox://styles/mapbox/dark-v11';

// ── Clustering helpers ────────────────────────────────────────────────────────
// Key artworks by a bucket of their lat/lng (4 decimal precision ≈ 11m).
// Since we geocode to city/country centroids, exact duplicates are common.
function coordKey(lat: number, lng: number) {
  return `${lat.toFixed(4)},${lng.toFixed(4)}`;
}

type Cluster = {
  key: string;
  lat: number;
  lng: number;
  artworks: ArtworkCardData[];
};

function buildClusters(artworks: ArtworkCardData[]): Cluster[] {
  const map = new Map<string, Cluster>();
  for (const a of artworks) {
    if (a.lat === 0 && a.lng === 0) continue;
    const k = coordKey(a.lat, a.lng);
    if (map.has(k)) {
      map.get(k)!.artworks.push(a);
    } else {
      map.set(k, { key: k, lat: a.lat, lng: a.lng, artworks: [a] });
    }
  }
  return Array.from(map.values());
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface ArtworkData extends ArtworkCardData {}

interface MapShellProps {
  artworks?: ArtworkData[];
  selectedArtworkId?: string | null;
  selectedArtwork?: ArtworkData | null;
  onArtworkClick?: (artwork: { id?: string }) => void;
  onDoubleClick?: () => void;
  onArtworkClose?: () => void;
}

interface ViewState {
  latitude: number;
  longitude: number;
  zoom: number;
}

interface MarkerPos { x: number; y: number }

// ── Component ─────────────────────────────────────────────────────────────────

export default function MapShell({
  artworks = [],
  selectedArtworkId = null,
  selectedArtwork = null,
  onArtworkClick,
  onDoubleClick,
  onArtworkClose,
}: MapShellProps) {
  const mapRef = useRef<MapRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [viewState, setViewState] = useState<ViewState>({
    latitude: 25,
    longitude: 20,
    zoom: 1.8,
  });

  const [markerPos, setMarkerPos] = useState<MarkerPos | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });

  // Cluster selection (null = no cluster selected, key = selected cluster key)
  const [selectedClusterKey, setSelectedClusterKey] = useState<string | null>(null);
  const [clusterPos, setClusterPos] = useState<MarkerPos | null>(null);

  // ── Clustering ────────────────────────────────────────────────────────────
  const clusters = useMemo(() => buildClusters(artworks), [artworks]);

  const selectedCluster = useMemo(
    () => selectedClusterKey ? clusters.find(c => c.key === selectedClusterKey) ?? null : null,
    [clusters, selectedClusterKey]
  );

  // ── Position helpers ──────────────────────────────────────────────────────
  const projectPoint = useCallback((lat: number, lng: number): MarkerPos | null => {
    if (!mapRef.current) return null;
    try {
      const map = mapRef.current.getMap();
      const pt = map.project([lng, lat]);
      return { x: pt.x, y: pt.y };
    } catch {
      return null;
    }
  }, []);

  const computeMarkerPos = useCallback(() => {
    if (!selectedArtwork) { setMarkerPos(null); return; }
    setMarkerPos(projectPoint(selectedArtwork.lat, selectedArtwork.lng));
  }, [selectedArtwork, projectPoint]);

  const computeClusterPos = useCallback(() => {
    if (!selectedCluster) { setClusterPos(null); return; }
    setClusterPos(projectPoint(selectedCluster.lat, selectedCluster.lng));
  }, [selectedCluster, projectPoint]);

  // Recompute on every map move / artwork change
  useEffect(() => {
    computeMarkerPos();
    computeClusterPos();
  }, [viewState, computeMarkerPos, computeClusterPos]);

  // Clear cluster selection when artwork selection changes
  useEffect(() => {
    if (selectedArtwork) setSelectedClusterKey(null);
  }, [selectedArtwork]);

  // ── Container resize tracking ─────────────────────────────────────────────
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

  // ── Cluster click handler ─────────────────────────────────────────────────
  const handleClusterClick = useCallback((cluster: Cluster) => {
    if (cluster.artworks.length === 1) {
      // Single-artwork cluster — treat same as regular marker click
      onArtworkClick?.({ id: cluster.artworks[0].id });
      setSelectedClusterKey(null);
    } else {
      onArtworkClick?.({}); // clear any selected artwork
      setSelectedClusterKey(prev =>
        prev === cluster.key ? null : cluster.key
      );
    }
  }, [onArtworkClick]);

  // ── Clear all selections on empty map click ───────────────────────────────
  const handleMapClick = useCallback(() => {
    onArtworkClick?.({});
    setSelectedClusterKey(null);
  }, [onArtworkClick]);

  return (
    <div ref={containerRef} className="absolute inset-0">
      <MapGL
        ref={mapRef}
        {...viewState}
        onMove={evt => {
          setViewState(evt.viewState);
          // Inline recompute to avoid stale closure
          if (selectedArtwork) {
            try {
              const map = mapRef.current?.getMap();
              if (map) {
                const pt = map.project([selectedArtwork.lng, selectedArtwork.lat]);
                setMarkerPos({ x: pt.x, y: pt.y });
              }
            } catch { /* ignore */ }
          }
          if (selectedCluster) {
            try {
              const map = mapRef.current?.getMap();
              if (map) {
                const pt = map.project([selectedCluster.lng, selectedCluster.lat]);
                setClusterPos({ x: pt.x, y: pt.y });
              }
            } catch { /* ignore */ }
          }
        }}
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
        onClick={handleMapClick}
        fog={{
          color: 'rgba(15, 15, 20, 0.8)',
          'high-color': 'rgba(10, 10, 15, 0.9)',
          'horizon-blend': 0.04,
          'star-intensity': 0.15,
        }}
      >
        {clusters.map(cluster => {
          if (cluster.artworks.length === 1) {
            const artwork = cluster.artworks[0];
            return (
              <ArtworkMarker
                key={artwork.id}
                artwork={artwork}
                isSelected={selectedArtworkId === artwork.id}
                onClick={a => onArtworkClick?.({ id: a.id })}
              />
            );
          }
          return (
            <ClusterMarker
              key={cluster.key}
              lat={cluster.lat}
              lng={cluster.lng}
              count={cluster.artworks.length}
              isSelected={selectedClusterKey === cluster.key}
              onClick={() => handleClusterClick(cluster)}
            />
          );
        })}
      </MapGL>

      {/* Single-artwork floating preview card */}
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

      {/* Cluster list card */}
      {selectedCluster && clusterPos && !selectedArtwork && (
        <ClusterListCard
          artworks={selectedCluster.artworks}
          markerX={clusterPos.x}
          markerY={clusterPos.y}
          containerWidth={containerSize.width}
          containerHeight={containerSize.height}
          onSelectArtwork={artwork => {
            setSelectedClusterKey(null);
            onArtworkClick?.({ id: artwork.id });
          }}
          onClose={() => setSelectedClusterKey(null)}
        />
      )}
    </div>
  );
}
