// components/map/MapControls.tsx
// Map navigation controls: Zoom In/Out, Full Size, Fit to Results

'use client';

import { useCallback } from 'react';

interface MapControlsProps {
  mapRef: React.RefObject<any>;
  onFullSize: () => void;
  onFitToResults?: () => void;
  showFitToResults?: boolean;
}

function ZoomInIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <line x1="11" y1="8" x2="11" y2="14" />
      <line x1="8" y1="11" x2="14" y2="11" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function ZoomOutIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <line x1="8" y1="11" x2="14" y2="11" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function FullSizeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 7V3h4M3 17v4h4M21 7V3h-4M21 17v4h-4" />
      <rect x="3" y="3" width="18" height="18" fill="none" />
    </svg>
  );
}

function FitIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

export default function MapControls({
  mapRef,
  onFullSize,
  onFitToResults,
  showFitToResults = false,
}: MapControlsProps) {
  const handleZoomIn = useCallback(() => {
    mapRef.current?.zoomIn();
  }, [mapRef]);

  const handleZoomOut = useCallback(() => {
    mapRef.current?.zoomOut();
  }, [mapRef]);

  return (
    <div
      className="absolute z-20 pointer-events-auto flex flex-col gap-2"
      style={{
        top: '12px',
        left: '12px',
      }}
    >
      {/* Full Size Button */}
      <button
        onClick={onFullSize}
        title="Full Size (zoom to world)"
        className="flex items-center justify-center w-10 h-10 rounded-lg bg-white hover:bg-gray-100 text-neutral-700 hover:text-neutral-900 shadow-sm hover:shadow-md transition-all active:scale-95"
      >
        <FullSizeIcon />
      </button>

      {/* Fit to Results Button */}
      {showFitToResults && (
        <button
          onClick={onFitToResults}
          title="Fit to Results"
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-white hover:bg-gray-100 text-neutral-700 hover:text-neutral-900 shadow-sm hover:shadow-md transition-all active:scale-95"
        >
          <FitIcon />
        </button>
      )}

      {/* Zoom In Button */}
      <button
        onClick={handleZoomIn}
        title="Zoom In"
        className="flex items-center justify-center w-10 h-10 rounded-lg bg-white hover:bg-gray-100 text-neutral-700 hover:text-neutral-900 shadow-sm hover:shadow-md transition-all active:scale-95"
      >
        <ZoomInIcon />
      </button>

      {/* Zoom Out Button */}
      <button
        onClick={handleZoomOut}
        title="Zoom Out"
        className="flex items-center justify-center w-10 h-10 rounded-lg bg-white hover:bg-gray-100 text-neutral-700 hover:text-neutral-900 shadow-sm hover:shadow-md transition-all active:scale-95"
      >
        <ZoomOutIcon />
      </button>
    </div>
  );
}
