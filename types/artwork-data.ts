// types/artwork-data.ts - Shared artwork type for Supabase-backed app
// Phase 13: Consolidated artwork interface

export interface ArtworkData {
  id: string;
  title: string;
  year: string;
  year_start: number;
  year_end: number;
  region: string;
  culture: string;
  medium: string;
  lat: number;
  lng: number;
  image_url: string;
  description: string;
  current_museum: string;
  place_created: string;
  tags: string[];
}
