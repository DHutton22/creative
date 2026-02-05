-- Add reference_image_url to checklist items in json_definition
-- This field will be part of the JSONB structure in checklist_templates

-- Add photo_url to checklist_answers for user-uploaded images
ALTER TABLE checklist_answers 
ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Create a storage bucket for checklist images if it doesn't exist
-- Run this in the Supabase dashboard Storage section or via API

-- Instructions:
-- 1. Go to Storage in Supabase Dashboard
-- 2. Create a new bucket called 'checklist-images'
-- 3. Set it to public or implement RLS policies:

-- Example RLS policies for checklist-images bucket:
-- Allow authenticated users to upload images
-- Allow everyone to view images

-- Note: The reference_image_url field will be added to the json_definition
-- structure in checklist_templates. No schema change needed for that.

COMMENT ON COLUMN checklist_answers.photo_url IS 'URL of the photo uploaded by the user when completing this checklist item';





