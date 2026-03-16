-- Phase 11: Supabase Database Schema for Atlas of Art
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Artworks table
CREATE TABLE IF NOT EXISTS artworks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  year_display TEXT NOT NULL,
  year_start INTEGER NOT NULL,
  year_end INTEGER NOT NULL,
  region TEXT NOT NULL,
  culture TEXT NOT NULL,
  medium TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  image_url TEXT,
  image_high_res_url TEXT,
  description TEXT NOT NULL,
  current_museum TEXT,
  place_created TEXT NOT NULL,
  getty_object_id TEXT UNIQUE,
  source TEXT DEFAULT 'seed',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tags table (normalized)
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Artwork-Tags junction table
CREATE TABLE IF NOT EXISTS artwork_tags (
  artwork_id UUID REFERENCES artworks(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (artwork_id, tag_id)
);

-- Users table (extends Supabase auth)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Collections (user-curated)
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Collection items
CREATE TABLE IF NOT EXISTS collection_items (
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  artwork_id UUID REFERENCES artworks(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (collection_id, artwork_id)
);

-- Favorites (quick bookmarks)
CREATE TABLE IF NOT EXISTS favorites (
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  artwork_id UUID REFERENCES artworks(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, artwork_id)
);

-- View history (for analytics and recommendations)
CREATE TABLE IF NOT EXISTS view_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  artwork_id UUID REFERENCES artworks(id) ON DELETE CASCADE NOT NULL,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Getty ingestion log
CREATE TABLE IF NOT EXISTS ingestion_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source TEXT NOT NULL,
  records_ingested INTEGER NOT NULL,
  records_failed INTEGER DEFAULT 0,
  errors TEXT[],
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_artworks_region ON artworks(region);
CREATE INDEX IF NOT EXISTS idx_artworks_culture ON artworks(culture);
CREATE INDEX IF NOT EXISTS idx_artworks_year_range ON artworks(year_start, year_end);
CREATE INDEX IF NOT EXISTS idx_artworks_location ON artworks(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_artworks_getty_id ON artworks(getty_object_id);
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_user ON collections(user_id);
CREATE INDEX IF NOT EXISTS idx_view_history_artwork ON view_history(artwork_id);
CREATE INDEX IF NOT EXISTS idx_view_history_user ON view_history(user_id);

-- Row Level Security (RLS)
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE artwork_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE view_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingestion_log ENABLE ROW LEVEL SECURITY;

-- Artworks: Everyone can read, only service role can write
CREATE POLICY "Artworks are viewable by everyone"
  ON artworks FOR SELECT
  USING (true);

CREATE POLICY "Artworks are insertable by service role only"
  ON artworks FOR INSERT
  WITH CHECK (auth.uid() IS NULL);

CREATE POLICY "Artworks are updatable by service role only"
  ON artworks FOR UPDATE
  USING (auth.uid() IS NULL);

-- Tags: Everyone can read, service role writes
CREATE POLICY "Tags are viewable by everyone"
  ON tags FOR SELECT
  USING (true);

-- User profiles: Users can read all, update own
CREATE POLICY "User profiles are viewable by everyone"
  ON user_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Collections: Users manage own, read public
CREATE POLICY "Users can view public collections"
  ON collections FOR SELECT
  USING (is_public = true OR user_id = auth.uid());

CREATE POLICY "Users can manage own collections"
  ON collections FOR ALL
  USING (user_id = auth.uid());

-- Favorites: Users manage own
CREATE POLICY "Users can manage own favorites"
  ON favorites FOR ALL
  USING (user_id = auth.uid());

-- View history: Users insert own, service role reads all
CREATE POLICY "Users can insert own view history"
  ON view_history FOR INSERT
  WITH CHECK (user_id = auth.uid() OR auth.uid() IS NULL);

CREATE POLICY "Service role can read all view history"
  ON view_history FOR SELECT
  USING (auth.uid() IS NULL);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_artworks_updated_at
  BEFORE UPDATE ON artworks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collections_updated_at
  BEFORE UPDATE ON collections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();
