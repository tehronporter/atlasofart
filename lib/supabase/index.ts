// lib/supabase.ts - Supabase client configuration
// Phase 11: Supabase Backend Foundation

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Client for browser/client-side operations (uses anon key with RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for server-side operations (bypasses RLS)
// Only use in server components, API routes, or server actions
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// Database types (generated from Supabase schema)
export interface Database {
  public: {
    Tables: {
      artworks: {
        Row: {
          id: string;
          object_id: string | null;
          title: string;
          artist_display: string | null;
          date: string | null;
          date_start: number | null;
          date_end: number | null;
          region: string | null;
          culture: string | null;
          medium: string | null;
          dimensions: string | null;
          latitude: number | null;
          longitude: number | null;
          image_url_primary: string | null;
          image_url_thumbnail: string | null;
          description: string | null;
          repository: string | null;
          place_created: string | null;
          tags: string[] | null;
          getty_url: string | null;
          is_from_getty: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          object_id?: string | null;
          title: string;
          artist_display?: string | null;
          date?: string | null;
          date_start?: number | null;
          date_end?: number | null;
          region?: string | null;
          culture?: string | null;
          medium?: string | null;
          dimensions?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          image_url_primary?: string | null;
          image_url_thumbnail?: string | null;
          description?: string | null;
          repository?: string | null;
          place_created?: string | null;
          tags?: string[] | null;
          getty_url?: string | null;
          is_from_getty?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          object_id?: string | null;
          title?: string;
          artist_display?: string | null;
          date?: string | null;
          date_start?: number | null;
          date_end?: number | null;
          region?: string | null;
          culture?: string | null;
          medium?: string | null;
          dimensions?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          image_url_primary?: string | null;
          image_url_thumbnail?: string | null;
          description?: string | null;
          repository?: string | null;
          place_created?: string | null;
          tags?: string[] | null;
          getty_url?: string | null;
          is_from_getty?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      ingestion_logs: {
        Row: {
          id: string;
          batch_id: string;
          status: 'pending' | 'processing' | 'completed' | 'failed';
          artworks_added: number;
          artworks_updated: number;
          errors: string[] | null;
          metadata: Record<string, unknown> | null;
          created_at: string;
          completed_at: string | null;
        };
      };
    };
  };
}
