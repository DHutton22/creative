-- Fix infinite recursion in users table RLS policy
-- Run this in Supabase SQL Editor

-- Drop the problematic policies
DROP POLICY IF EXISTS "Admins can manage users" ON users;
DROP POLICY IF EXISTS "Users can view all users" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Create a security definer function to check user role without triggering RLS
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS user_role AS $$
DECLARE
    user_role_value user_role;
BEGIN
    SELECT role INTO user_role_value FROM public.users WHERE id = user_id;
    RETURN user_role_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create simpler policies that don't recurse
-- All authenticated users can view all users
CREATE POLICY "Users can view all users" ON users 
    FOR SELECT 
    USING (auth.uid() IS NOT NULL);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users 
    FOR UPDATE 
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Users can insert their own profile (for signup)
CREATE POLICY "Users can insert own profile" ON users 
    FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- Admins can do everything (using the security definer function)
CREATE POLICY "Admins can manage users" ON users 
    FOR ALL 
    USING (public.get_user_role(auth.uid()) = 'admin');

-- Also fix the other policies that reference users table
-- These also need to use the security definer function

DROP POLICY IF EXISTS "Admins can manage machines" ON machines;
CREATE POLICY "Admins can manage machines" ON machines 
    FOR ALL 
    USING (public.get_user_role(auth.uid()) IN ('admin', 'supervisor'));

DROP POLICY IF EXISTS "Admins can manage competencies" ON user_competencies;
CREATE POLICY "Admins can manage competencies" ON user_competencies 
    FOR ALL 
    USING (public.get_user_role(auth.uid()) = 'admin');

DROP POLICY IF EXISTS "Admins can manage moulds" ON moulds;
CREATE POLICY "Admins can manage moulds" ON moulds 
    FOR ALL 
    USING (public.get_user_role(auth.uid()) IN ('admin', 'supervisor'));

DROP POLICY IF EXISTS "Everyone can view active templates" ON checklist_templates;
CREATE POLICY "Everyone can view active templates" ON checklist_templates 
    FOR SELECT 
    USING (
        status = 'active' OR 
        public.get_user_role(auth.uid()) IN ('admin', 'supervisor')
    );

DROP POLICY IF EXISTS "Admins and supervisors can manage templates" ON checklist_templates;
CREATE POLICY "Admins and supervisors can manage templates" ON checklist_templates 
    FOR ALL 
    USING (public.get_user_role(auth.uid()) IN ('admin', 'supervisor'));

DROP POLICY IF EXISTS "Users can view own runs" ON checklist_runs;
CREATE POLICY "Users can view own runs" ON checklist_runs 
    FOR SELECT 
    USING (
        user_id = auth.uid() OR
        public.get_user_role(auth.uid()) IN ('admin', 'supervisor', 'quality')
    );

DROP POLICY IF EXISTS "Users can update own runs" ON checklist_runs;
CREATE POLICY "Users can update own runs" ON checklist_runs 
    FOR UPDATE 
    USING (
        user_id = auth.uid() OR
        public.get_user_role(auth.uid()) IN ('admin', 'supervisor')
    );

DROP POLICY IF EXISTS "Users can view answers for accessible runs" ON checklist_answers;
CREATE POLICY "Users can view answers for accessible runs" ON checklist_answers 
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM checklist_runs 
            WHERE checklist_runs.id = checklist_answers.run_id 
            AND (
                checklist_runs.user_id = auth.uid() OR
                public.get_user_role(auth.uid()) IN ('admin', 'supervisor', 'quality')
            )
        )
    );

DROP POLICY IF EXISTS "Maintenance and admins can manage tasks" ON maintenance_tasks;
CREATE POLICY "Maintenance and admins can manage tasks" ON maintenance_tasks 
    FOR ALL 
    USING (public.get_user_role(auth.uid()) IN ('admin', 'supervisor', 'maintenance'));

DROP POLICY IF EXISTS "Admins can manage material batches" ON material_batches;
CREATE POLICY "Admins can manage material batches" ON material_batches 
    FOR ALL 
    USING (public.get_user_role(auth.uid()) IN ('admin', 'supervisor', 'quality'));

DROP POLICY IF EXISTS "Admins and assignees can update issues" ON issues;
CREATE POLICY "Admins and assignees can update issues" ON issues 
    FOR UPDATE 
    USING (
        reported_by = auth.uid() OR
        assigned_to = auth.uid() OR
        public.get_user_role(auth.uid()) IN ('admin', 'supervisor', 'maintenance')
    );

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.get_user_role(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role(UUID) TO anon;


