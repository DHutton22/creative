-- Update Darren Galvin's role to admin
-- Run this in the Supabase SQL Editor

-- First, let's see what users exist
SELECT id, email, name, role FROM users;

-- Update the role for Darren Galvin to admin
UPDATE users 
SET role = 'admin' 
WHERE email ILIKE '%darren%' OR name ILIKE '%darren%';

-- Verify the change
SELECT id, email, name, role FROM users WHERE role = 'admin';
