-- Migration: Add image dimension columns to artworks table
-- Run this in Supabase SQL Editor if your artworks table already exists

ALTER TABLE artworks
  ADD COLUMN IF NOT EXISTS image_width INTEGER,
  ADD COLUMN IF NOT EXISTS image_height INTEGER;

COMMENT ON COLUMN artworks.image_width IS 'Natural pixel width from IIIF info.json — used for aspect ratio display (no cropping)';
COMMENT ON COLUMN artworks.image_height IS 'Natural pixel height from IIIF info.json — used for aspect ratio display (no cropping)';
