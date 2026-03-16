// components/map/FloatingArtworkCard.tsx
// Compact floating preview card anchored near map marker

'use client';

import { useEffect, useState, useRef } from 'react';
import { useMap } from 'react-map-gl/mapbox';

interface ArtworkData {
  id: string;
  lat: number;
  lng: number;
  title: string;
  image_url: string | null;
  artist_display: string | null;
  year: string;
  place_created: string | null;
  current_museum: string | null;
  medium: string | null;
  tags: string[];
  description: string | null;
  getty_url?: string;
}

interface FloatingArtworkCardProps {
  artwork: ArtworkData;
  onDoubleClick?: () => void;
  onClose?: () => void;
}

export default function FloatingArtworkCard({
  artwork,
  onDoubleClick,
  onClose,
}: FloatingArtworkCardProps) {
  const mapRef = useMap();
  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!mapRef.current || !artwork) {
      setIsVisible(false);
      return;
    }

    setIsVisible(true);

    const updatePosition = () => {
      const map = mapRef.current?.getMap?.();
      if (!map || !cardRef.current) return;

      // Convert lat/lng to pixel coordinates
      const point = map.project([artwork.lng, artwork.lat]);
      const cardWidth = 320;
      const cardHeight = 420;
      const offsetX = -cardWidth / 2;
      const offsetY = -cardHeight - 12; // 12px gap above marker

      let x = point.x + offsetX;
      let y = point.y + offsetY;

      // Prevent card from going off-screen (left/right)
      const padding = 12;
      const maxX = window.innerWidth - cardWidth - padding;
      if (x < padding) x = padding;
      if (x > maxX) x = maxX;

      // Prevent card from going off-screen (top)
      const maxY = window.innerHeight - cardHeight - 80; // 80px for bottom bar
      if (y < padding) y = padding;

      setPosition({ x, y });
    };

    updatePosition();

    const handleMapMove = () => updatePosition();
    const map = mapRef.current?.getMap?.();
    if (map) {
      map.on('move', handleMapMove);
      map.on('zoom', handleMapMove);
      return () => {
        map.off('move', handleMapMove);
        map.off('zoom', handleMapMove);
      };
    }
  }, [artwork, mapRef]);

  if (!isVisible || !artwork) return null;

  return (
    <div
      ref={cardRef}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '320px',
        zIndex: 50,
      }}
      className="pointer-events-auto"
      onDoubleClick={onDoubleClick}
    >
      <div className="rounded-xl overflow-hidden border border-white/[0.12] bg-[#1a1a1f]/95 backdrop-blur-sm shadow-2xl hover:border-white/[0.18] transition-colors">
        {/* Image */}
        <div className="relative h-[120px] bg-neutral-900 overflow-hidden group cursor-pointer">
          {artwork.image_url ? (
            <img
              src={artwork.image_url}
              alt={artwork.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              crossOrigin="anonymous"
              onError={e => {
                const el = e.target as HTMLImageElement;
                el.style.display = 'none';
                el.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center text-neutral-700 ${
              artwork.image_url ? 'hidden' : ''
            }`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          {/* Close button */}
          <button
            onClick={e => {
              e.stopPropagation();
              onClose?.();
            }}
            className="absolute top-2 right-2 w-5 h-5 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/80 transition-colors"
            aria-label="Close"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-3 space-y-2 max-h-[300px] overflow-y-auto">
          <h3 className="text-[12px] font-semibold text-white leading-snug line-clamp-2">
            {artwork.title}
          </h3>

          {artwork.artist_display && (
            <p className="text-[10px] text-neutral-400 leading-snug">{artwork.artist_display}</p>
          )}

          {artwork.year && (
            <p className="text-[10px] text-amber-400/80 font-medium">{artwork.year}</p>
          )}

          {artwork.medium && (
            <p className="text-[9px] text-neutral-500 italic">{artwork.medium}</p>
          )}

          {artwork.place_created && (
            <div className="flex items-start gap-1.5 text-neutral-500 pt-1.5 border-t border-white/[0.06]">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span className="text-[9px] line-clamp-1">{artwork.place_created}</span>
            </div>
          )}

          {artwork.tags && artwork.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {artwork.tags.slice(0, 3).map((tag, i) => (
                <span
                  key={i}
                  className="text-[8px] px-1.5 py-0.5 bg-white/[0.04] border border-white/[0.06] text-neutral-500 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <p className="text-[9px] text-neutral-500 pt-1 text-center italic">
            Double-click to expand
          </p>
        </div>
      </div>
    </div>
  );
}
