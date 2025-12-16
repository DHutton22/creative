-- Update a user's role to admin
-- Replace 'USER_EMAIL_HERE' with the actual user's email

-- Option 1: Update by email
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'USER_EMAIL_HERE';

-- Option 2: Update by ID (if you know the user's ID)
-- UPDATE public.users 
-- SET role = 'admin' 
-- WHERE id = 'USER_UUID_HERE';

-- Verify the update
SELECT id, email, name, role FROM public.users;


