// lib/auth.ts - Authentication utilities
// Phase 14: User Authentication

import { supabase, supabaseAdmin } from './supabase';

/**
 * Sign up with email/password
 */
export async function signUp(email: string, password: string, fullName?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) throw error;
  return data;
}

/**
 * Sign in with email/password
 */
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

/**
 * Sign out
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Get current session
 */
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

/**
 * Get current user
 */
export async function getUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
}

/**
 * Update user profile
 */
export async function updateProfile(updates: {
  full_name?: string;
  avatar_url?: string;
  is_public?: boolean;
}) {
  const user = await getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (error) throw error;
}

/**
 * Get user profile
 */
export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Add artwork to favorites
 */
export async function addToFavorites(artworkId: string) {
  const user = await getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('favorites')
    .insert({
      user_id: user.id,
      artwork_id: artworkId,
    });

  if (error) throw error;
}

/**
 * Remove from favorites
 */
export async function removeFromFavorites(artworkId: string) {
  const user = await getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', user.id)
    .eq('artwork_id', artworkId);

  if (error) throw error;
}

/**
 * Get user favorites
 */
export async function getUserFavorites() {
  const user = await getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('favorites')
    .select(`
      *,
      artwork:artworks(*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Check if artwork is favorited
 */
export async function isFavorited(artworkId: string): Promise<boolean> {
  const user = await getUser();
  if (!user) return false;

  const { data } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('artwork_id', artworkId)
    .single();

  return !!data;
}

/**
 * Create collection
 */
export async function createCollection(name: string, description?: string, isPublic = false) {
  const user = await getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('collections')
    .insert({
      user_id: user.id,
      name,
      description,
      is_public: isPublic,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Add artwork to collection
 */
export async function addToCollection(collectionId: string, artworkId: string, notes?: string) {
  const { error } = await supabase
    .from('collection_items')
    .insert({
      collection_id: collectionId,
      artwork_id: artworkId,
      notes,
    });

  if (error) throw error;
}

/**
 * Get user collections
 */
export async function getUserCollections() {
  const user = await getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('collections')
    .select(`
      *,
      items:collection_items(
        artwork:artworks(*)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Track artwork view
 */
export async function trackArtworkView(artworkId: string) {
  const user = await getUser();

  // Allow anonymous views too
  await supabase
    .from('artwork_views')
    .insert({
      user_id: user?.id || null,
      artwork_id: artworkId,
    });
}
