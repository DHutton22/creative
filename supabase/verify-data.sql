-- Verify data exists in the database
-- Run these queries in Supabase SQL Editor

-- Check machines
SELECT COUNT(*) as machine_count FROM public.machines;
SELECT id, name, status FROM public.machines LIMIT 10;

-- Check users
SELECT COUNT(*) as user_count FROM public.users;
SELECT id, email, name, role FROM public.users;

-- Check checklist templates
SELECT COUNT(*) as template_count FROM public.checklist_templates;

-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('machines', 'users', 'checklist_templates', 'checklist_runs');

-- Check RLS policies on machines
SELECT pol.polname, pol.polcmd, pol.polpermissive
FROM pg_policy pol
JOIN pg_class cls ON pol.polrelid = cls.oid
WHERE cls.relname = 'machines';


