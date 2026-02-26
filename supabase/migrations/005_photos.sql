-- Add image_urls array column to listings
ALTER TABLE listings ADD COLUMN IF NOT EXISTS image_urls text[] DEFAULT '{}';

-- Create public storage bucket for listing images
-- NOTE: Run this in the Supabase dashboard > Storage or via the Supabase CLI.
-- The bucket must be created manually:
--   Name: listing-images
--   Public: true (enable public read access)
