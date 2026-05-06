-- Fix Supabase RLS Security Advisor warnings
-- Run this in Supabase SQL Editor (or via Management API)
--
-- Issue: Several tables had policies using `USING (true)` which allowed
-- ANYONE (including unauthenticated visitors with just the public anon key)
-- to read AND in some cases modify the data.
--
-- This script tightens these policies. Reads now require authentication;
-- writes require admin/supervisor role where appropriate.

-- ─────────────────────────────────────────────────────────────────
-- CRITICAL: app_settings - Anyone could manage (insert/update/delete)
-- ─────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Anyone can manage app settings" ON app_settings;
DROP POLICY IF EXISTS "Anyone can read app settings" ON app_settings;
CREATE POLICY "Authenticated users can read app settings" ON app_settings
    FOR SELECT
    USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage app settings" ON app_settings
    FOR ALL
    USING (public.get_user_role(auth.uid()) IN ('admin', 'supervisor'));

-- ─────────────────────────────────────────────────────────────────
-- CRITICAL: machine_tpm_level_config - Anyone could manage
-- ─────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Anyone can manage tpm config" ON machine_tpm_level_config;
DROP POLICY IF EXISTS "Anyone can read tpm config" ON machine_tpm_level_config;
CREATE POLICY "Authenticated users can read tpm config" ON machine_tpm_level_config
    FOR SELECT
    USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage tpm config" ON machine_tpm_level_config
    FOR ALL
    USING (public.get_user_role(auth.uid()) IN ('admin', 'supervisor'));

-- ─────────────────────────────────────────────────────────────────
-- CRITICAL: work_centres - Anyone could manage
-- ─────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Anyone can manage work centres" ON work_centres;
DROP POLICY IF EXISTS "Anyone can read work centres" ON work_centres;
DROP POLICY IF EXISTS "Everyone can view work centres" ON work_centres;
CREATE POLICY "Authenticated users can read work centres" ON work_centres
    FOR SELECT
    USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage work centres" ON work_centres
    FOR ALL
    USING (public.get_user_role(auth.uid()) IN ('admin', 'supervisor'));

-- ─────────────────────────────────────────────────────────────────
-- Read-only fixes (USING (true) on SELECT only)
-- ─────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Everyone can view machines" ON machines;
CREATE POLICY "Authenticated users can view machines" ON machines
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Everyone can view moulds" ON moulds;
CREATE POLICY "Authenticated users can view moulds" ON moulds
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Everyone can view competencies" ON user_competencies;
CREATE POLICY "Authenticated users can view competencies" ON user_competencies
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Everyone can view maintenance tasks" ON maintenance_tasks;
CREATE POLICY "Authenticated users can view maintenance tasks" ON maintenance_tasks
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Everyone can view maintenance logs" ON maintenance_logs;
CREATE POLICY "Authenticated users can view maintenance logs" ON maintenance_logs
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Everyone can view material batches" ON material_batches;
CREATE POLICY "Authenticated users can view material batches" ON material_batches
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Everyone can view issues" ON issues;
CREATE POLICY "Authenticated users can view issues" ON issues
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- ─────────────────────────────────────────────────────────────────
-- checklist_templates - "Everyone can view active templates" had no
-- auth check; anyone with the public anon key could read templates.
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
-- Verification - run this to confirm no more USING (true) policies
-- ─────────────────────────────────────────────────────────────────
-- SELECT tablename, policyname, cmd
-- FROM pg_policies
-- WHERE schemaname = 'public' AND qual::text LIKE '%true%'
-- ORDER BY tablename, policyname;
