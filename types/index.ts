// types/index.ts - Consolidated types for Atlas of Art
// Phase 13: Single source of truth

export interface ArtworkData {
  id: string;
  title: string;
  year: string;
  year_start: number;
  year_end: number;
  region: string;
  culture: string;
  medium: string;
  latitude: number;
  longitude: number;
  image_url: string;
  description: string;
  current_museum: string;
  place_created: string;
  tags: string[];
}

export interface ArtworkMarkerData {
  id: string;
  lat: number;
  lng: number;
  title: string;
}
