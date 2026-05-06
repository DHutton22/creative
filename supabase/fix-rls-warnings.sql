-- Fix Supabase RLS Security Advisor warnings
-- Run this in Supabase SQL Editor
--
-- Issue: machines, checklist_templates and work_centres tables had policies
-- using `USING (true)` which exposed all rows to ANYONE with the anon key
-- (i.e. any visitor to the deployed site, no login required).
-- Since this is an internal app, all reads should require authentication.

-- ─────────────────────────────────────────────────────────────────
-- machines table
-- ─────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Everyone can view machines" ON machines;
CREATE POLICY "Authenticated users can view machines" ON machines
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- ─────────────────────────────────────────────────────────────────
-- checklist_templates table
-- (active templates were viewable by anyone - now require auth)
-- ─────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Everyone can view active templates" ON checklist_templates;
CREATE POLICY "Authenticated users can view active templates" ON checklist_templates
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND (
            status = 'active' OR
            public.get_user_role(auth.uid()) IN ('admin', 'supervisor')
        )
    );

-- ─────────────────────────────────────────────────────────────────
-- work_centres table
-- ─────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Everyone can view work centres" ON work_centres;
CREATE POLICY "Authenticated users can view work centres" ON work_centres
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- ─────────────────────────────────────────────────────────────────
-- moulds table (also has USING(true) per schema.sql)
-- ─────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Everyone can view moulds" ON moulds;
CREATE POLICY "Authenticated users can view moulds" ON moulds
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- ─────────────────────────────────────────────────────────────────
-- user_competencies table
-- ─────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Everyone can view competencies" ON user_competencies;
CREATE POLICY "Authenticated users can view competencies" ON user_competencies
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- ─────────────────────────────────────────────────────────────────
-- maintenance_tasks
-- ─────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Everyone can view maintenance tasks" ON maintenance_tasks;
CREATE POLICY "Authenticated users can view maintenance tasks" ON maintenance_tasks
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- ─────────────────────────────────────────────────────────────────
-- maintenance_logs
-- ─────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Everyone can view maintenance logs" ON maintenance_logs;
CREATE POLICY "Authenticated users can view maintenance logs" ON maintenance_logs
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- ─────────────────────────────────────────────────────────────────
-- material_batches
-- ─────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Everyone can view material batches" ON material_batches;
CREATE POLICY "Authenticated users can view material batches" ON material_batches
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- ─────────────────────────────────────────────────────────────────
-- issues
-- ─────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Everyone can view issues" ON issues;
CREATE POLICY "Authenticated users can view issues" ON issues
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- Verify - run this after the policies are applied to make sure all is well
-- SELECT schemaname, tablename, policyname, cmd, qual
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;
