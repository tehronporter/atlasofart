-- Atlas of Art - Supabase Schema
-- Phase 11: Database Foundation
-- Run this in Supabase SQL Editor to create tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Artworks table
CREATE TABLE IF NOT EXISTS artworks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  object_id TEXT UNIQUE, -- Getty object ID for deduplication
  title TEXT NOT NULL,
  artist_display TEXT,
  date TEXT,
  date_start INTEGER,
  date_end INTEGER,
  region TEXT,
  culture TEXT,
  medium TEXT,
  dimensions TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  image_url_primary TEXT,
  image_url_thumbnail TEXT,
  image_width INTEGER,   -- natural pixel width from IIIF info.json (for aspect ratio)
  image_height INTEGER,  -- natural pixel height from IIIF info.json (for aspect ratio)
  description TEXT,
  repository TEXT,
  place_created TEXT,
  tags TEXT[],
  getty_url TEXT,
  is_from_getty BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_artworks_date_range ON artworks (date_start, date_end);
CREATE INDEX IF NOT EXISTS idx_artworks_region ON artworks (region);
CREATE INDEX IF NOT EXISTS idx_artworks_culture ON artworks (culture);
CREATE INDEX IF NOT EXISTS idx_artworks_is_from_getty ON artworks (is_from_getty);
CREATE INDEX IF NOT EXISTS idx_artworks_object_id ON artworks (object_id);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_artworks_search ON artworks USING GIN (
  to_tsvector('english', 
    COALESCE(title, '') || ' ' || 
    COALESCE(artist_display, '') || ' ' || 
    COALESCE(description, '') || ' ' ||
    COALESCE(culture, '') || ' ' ||
    COALESCE(region, '')
  )
);

-- Ingestion logs table
CREATE TABLE IF NOT EXISTS ingestion_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
  artworks_added INTEGER DEFAULT 0,
  artworks_updated INTEGER DEFAULT 0,
  errors TEXT[],
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Create updated_at trigger
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

-- Row Level Security (RLS)
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingestion_logs ENABLE ROW LEVEL SECURITY;

-- Policies for artworks
-- Allow anyone to read artworks (public map)
CREATE POLICY "Artworks are viewable by everyone"
  ON artworks FOR SELECT
  USING (true);

-- Only authenticated users can insert (via service role)
CREATE POLICY "Artworks insertable by service role"
  ON artworks FOR INSERT
  WITH CHECK (true);

-- Only authenticated users can update (via service role)
CREATE POLICY "Artworks updatable by service role"
  ON artworks FOR UPDATE
  USING (true);

-- Policies for ingestion_logs
CREATE POLICY "Ingestion logs viewable by everyone"
  ON ingestion_logs FOR SELECT
  USING (true);

CREATE POLICY "Ingestion logs manageable by service role"
  ON ingestion_logs FOR ALL
  USING (true)
  WITH CHECK (true);

-- Comments for documentation
COMMENT ON TABLE artworks IS 'Artwork metadata from Getty and other sources';
COMMENT ON TABLE ingestion_logs IS 'Logs for Getty API ingestion batches';
COMMENT ON COLUMN artworks.object_id IS 'Getty Museum object ID for deduplication';
COMMENT ON COLUMN artworks.is_from_getty IS 'True if ingested from Getty API';
