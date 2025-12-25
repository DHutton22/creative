-- Add username column to users table for internal (non-email) users
-- Run this in your Supabase SQL Editor

-- Add username column
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS username VARCHAR(50);

-- Add unique constraint on username (but allow NULLs for email users)
CREATE UNIQUE INDEX IF NOT EXISTS users_username_unique 
ON public.users (username) 
WHERE username IS NOT NULL;

-- Add comment explaining the field
COMMENT ON COLUMN public.users.username IS 'Username for internal users who log in without email. NULL for email-based users.';

-- Create index for faster username lookups during login
CREATE INDEX IF NOT EXISTS users_username_idx ON public.users (username) WHERE username IS NOT NULL;

