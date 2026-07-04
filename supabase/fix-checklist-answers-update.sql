-- ─────────────────────────────────────────────────────────────────
-- FIX: checklist_answers could be inserted but never UPDATED or DELETED
-- ─────────────────────────────────────────────────────────────────
--
-- Root cause of several reported bugs (comments not saving, photos not
-- attaching, text answers stuck at one character, answers not editable):
--
-- `checklist_answers` has RLS enabled with only SELECT and INSERT
-- policies. Postgres RLS denies any command that has no matching
-- policy, so every UPDATE (and DELETE) was silently rejected. The app
-- did not surface the error, so it looked successful on screen but
-- nothing was persisted.
--
-- This migration adds the missing UPDATE and DELETE policies, mirroring
-- the existing INSERT/SELECT logic: a user may modify answers that
-- belong to their own run, and admins/supervisors/quality may modify
-- answers on any run.
--
-- Run this in the Supabase SQL Editor.

-- Allow updating answers on your own run (or any run for privileged roles)
DROP POLICY IF EXISTS "Users can update answers for own runs" ON checklist_answers;
CREATE POLICY "Users can update answers for own runs" ON checklist_answers
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM checklist_runs
            WHERE checklist_runs.id = checklist_answers.run_id
            AND (
                checklist_runs.user_id = auth.uid() OR
                EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'supervisor', 'quality'))
            )
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM checklist_runs
            WHERE checklist_runs.id = checklist_answers.run_id
            AND (
                checklist_runs.user_id = auth.uid() OR
                EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'supervisor', 'quality'))
            )
        )
    );

-- Allow deleting answers on your own run (or any run for privileged roles)
DROP POLICY IF EXISTS "Users can delete answers for own runs" ON checklist_answers;
CREATE POLICY "Users can delete answers for own runs" ON checklist_answers
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM checklist_runs
            WHERE checklist_runs.id = checklist_answers.run_id
            AND (
                checklist_runs.user_id = auth.uid() OR
                EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'supervisor', 'quality'))
            )
        )
    );

-- ─────────────────────────────────────────────────────────────────
-- Verification: confirm the four policies now exist (SELECT/INSERT/UPDATE/DELETE)
-- ─────────────────────────────────────────────────────────────────
-- SELECT policyname, cmd FROM pg_policies
-- WHERE schemaname = 'public' AND tablename = 'checklist_answers'
-- ORDER BY cmd;
