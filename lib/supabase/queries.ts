// lib/supabase/queries.ts - Supabase query functions
// Phase 11: Database queries for artworks

import { supabase, supabaseAdmin, type Database } from '.';

type ArtworkRow = Database['public']['Tables']['artworks']['Row'];
type ArtworkInsert = Database['public']['Tables']['artworks']['Insert'];

/**
 * Fetch all artworks (with optional limits for pagination)
 */
export async function getArtworks(limit = 100, offset = 0) {
  const client = supabaseAdmin || supabase;
  
  const { data, error } = await client
    .from('artworks')
    .select('*')
    .order('date_start', { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data;
}

/**
 * Fetch artworks filtered by date range
 */
export async function getArtworksByDateRange(maxYear: number) {
  const client = supabaseAdmin || supabase;
  
  const { data, error } = await client
    .from('artworks')
    .select('*')
    .lte('date_end', maxYear)
    .order('date_start', { ascending: true });

  if (error) throw error;
  return data;
}

/**
 * Fetch artworks with search query (full-text search)
 */
export async function searchArtworks(query: string, limit = 50) {
  const client = supabaseAdmin || supabase;
  
  const { data, error } = await client
    .from('artworks')
    .select('*')
    .textSearch('title', query, {
      config: 'english',
      type: 'websearch',
    })
    .limit(limit);

  if (error) throw error;
  return data;
}

/**
 * Fetch artworks filtered by region
 */
export async function getArtworksByRegion(region: string) {
  const client = supabaseAdmin || supabase;
  
  const { data, error } = await client
    .from('artworks')
    .select('*')
    .eq('region', region)
    .order('date_start', { ascending: true });

  if (error) throw error;
  return data;
}

/**
 * Fetch distinct regions for filter dropdown
 */
export async function getDistinctRegions() {
  const client = supabaseAdmin || supabase;
  
  const { data, error } = await client
    .from('artworks')
    .select('region')
    .not('region', 'is', null);

  if (error) throw error;
  
  const regions = Array.from(new Set(data.map(r => r.region).filter(Boolean)));
  return regions as string[];
}

/**
 * Fetch distinct mediums for filter dropdown
 */
export async function getDistinctMediums() {
  const client = supabaseAdmin || supabase;
  
  const { data, error } = await client
    .from('artworks')
    .select('medium')
    .not('medium', 'is', null);

  if (error) throw error;
  
  const mediums = Array.from(new Set(data.map(m => m.medium).filter(Boolean)));
  return mediums as string[];
}

/**
 * Get artwork by ID
 */
export async function getArtworkById(id: string) {
  const client = supabaseAdmin || supabase;
  
  const { data, error } = await client
    .from('artworks')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get artwork by Getty object ID (for deduplication)
 */
export async function getArtworkByObjectId(objectId: string) {
  const client = supabaseAdmin || supabase;
  
  const { data, error } = await client
    .from('artworks')
    .select('*')
    .eq('object_id', objectId)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
  return data;
}

/**
 * Insert or update artwork (upsert)
 */
export async function upsertArtwork(artwork: ArtworkInsert) {
  const client = supabaseAdmin || supabase;
  
  const { data, error } = await client
    .from('artworks')
    .upsert(artwork, {
      onConflict: 'object_id', // Use Getty object ID for deduplication
      ignoreDuplicates: false,
    })
    .select()
    .single();

  if (error) throw error;
  return { data, isNew: !artwork.object_id };
}

/**
 * Get total artwork count
 */
export async function getArtworkCount() {
  const client = supabaseAdmin || supabase;
  
  const { data, error } = await client
    .from('artworks')
    .select('*', { count: 'exact', head: true });

  if (error) throw error;
  return data.length;
}

/**
 * Get artworks ingested from Getty
 */
export async function getGettyArtworks(limit = 100) {
  const client = supabaseAdmin || supabase;
  
  const { data, error } = await client
    .from('artworks')
    .select('*')
    .eq('is_from_getty', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}
