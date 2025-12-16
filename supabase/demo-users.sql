-- Demo Users for Creative Composites
-- Note: These users need to be created in Supabase Auth first, 
-- then this script updates their profiles with names and roles.

-- To create users manually in Supabase:
-- 1. Go to Authentication > Users
-- 2. Click "Add user" > "Create new user"
-- 3. Enter email and password
-- 4. Then run this script to update their profile

-- Update the logged-in user to have a proper name (run this after signing up)
-- Replace the email with your actual email
UPDATE public.users 
SET name = 'Darren Galvin', role = 'admin'
WHERE email = 'darren@example.com';  -- Change this to your actual email

-- If you want to see all users and their details:
SELECT id, email, name, role, created_at FROM public.users;

-- Alternative: If you want to insert demo operator accounts
-- (You'd need to create these in Auth first with these exact emails)
/*
INSERT INTO public.users (id, email, name, role) VALUES
  (gen_random_uuid(), 'john.smith@creativecomposites.co.uk', 'John Smith', 'operator'),
  (gen_random_uuid(), 'sarah.wilson@creativecomposites.co.uk', 'Sarah Wilson', 'operator'),
  (gen_random_uuid(), 'mike.johnson@creativecomposites.co.uk', 'Mike Johnson', 'supervisor'),
  (gen_random_uuid(), 'emma.brown@creativecomposites.co.uk', 'Emma Brown', 'maintenance'),
  (gen_random_uuid(), 'tom.davis@creativecomposites.co.uk', 'Tom Davis', 'quality')
ON CONFLICT (email) DO UPDATE SET 
  name = EXCLUDED.name,
  role = EXCLUDED.role;
*/


