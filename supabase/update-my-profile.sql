-- Update your profile with your name
-- This will update the currently logged in user (based on email)

-- First, let's see what users exist:
SELECT id, email, name, role FROM public.users;

-- Update your name (replace the email with yours):
UPDATE public.users 
SET name = 'Darren Galvin'
WHERE email = 'darren@thecodegeneration.com';  -- Replace with your actual email

-- Verify the update:
SELECT id, email, name, role FROM public.users WHERE name = 'Darren Galvin';


