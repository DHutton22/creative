-- Quick Setup SQL for Traffic Light Dashboard
-- Copy and paste these into Supabase SQL Editor

-- ============================================
-- STEP 1: Update existing templates with frequencies
-- ============================================

-- Set daily frequency for pre-run checks
UPDATE checklist_templates 
SET frequency = 'daily' 
WHERE type = 'pre_run' 
  AND status = 'active'
  AND frequency IS NULL;

-- Set weekly frequency for first-off inspections
UPDATE checklist_templates 
SET frequency = 'weekly' 
WHERE type = 'first_off' 
  AND status = 'active'
  AND frequency IS NULL;

-- Set daily frequency for safety checks
UPDATE checklist_templates 
SET frequency = 'daily' 
WHERE type = 'safety' 
  AND status = 'active'
  AND frequency IS NULL;

-- Set monthly frequency for maintenance
UPDATE checklist_templates 
SET frequency = 'monthly' 
WHERE type = 'maintenance' 
  AND status = 'active'
  AND frequency IS NULL;

-- Set monthly frequency for quality checks
UPDATE checklist_templates 
SET frequency = 'monthly' 
WHERE type = 'quality' 
  AND status = 'active'
  AND frequency IS NULL;

-- ============================================
-- STEP 2: Set due dates for in-progress checklists
-- ============================================

-- Daily checklists - due in 1 day
UPDATE checklist_runs cr
SET due_date = cr.started_at + INTERVAL '1 day'
FROM checklist_templates ct
WHERE cr.template_id = ct.id
  AND cr.status = 'in_progress'
  AND cr.due_date IS NULL
  AND ct.frequency = 'daily';

-- Weekly checklists - due in 7 days
UPDATE checklist_runs cr
SET due_date = cr.started_at + INTERVAL '7 days'
FROM checklist_templates ct
WHERE cr.template_id = ct.id
  AND cr.status = 'in_progress'
  AND cr.due_date IS NULL
  AND ct.frequency = 'weekly';

-- Monthly checklists - due in 30 days
UPDATE checklist_runs cr
SET due_date = cr.started_at + INTERVAL '30 days'
FROM checklist_templates ct
WHERE cr.template_id = ct.id
  AND cr.status = 'in_progress'
  AND cr.due_date IS NULL
  AND ct.frequency = 'monthly';

-- Quarterly checklists - due in 90 days
UPDATE checklist_runs cr
SET due_date = cr.started_at + INTERVAL '90 days'
FROM checklist_templates ct
WHERE cr.template_id = ct.id
  AND cr.status = 'in_progress'
  AND cr.due_date IS NULL
  AND ct.frequency = 'quarterly';

-- Annual checklists - due in 365 days
UPDATE checklist_runs cr
SET due_date = cr.started_at + INTERVAL '365 days'
FROM checklist_templates ct
WHERE cr.template_id = ct.id
  AND cr.status = 'in_progress'
  AND cr.due_date IS NULL
  AND ct.frequency = 'annually';

-- ============================================
-- STEP 3: Verify the changes
-- ============================================

-- Check template frequencies
SELECT 
  id,
  name,
  type,
  frequency,
  status
FROM checklist_templates
WHERE status = 'active'
ORDER BY type, frequency;

-- Check checklist run due dates
SELECT 
  cr.id,
  ct.name as template_name,
  ct.frequency,
  cr.status,
  cr.started_at,
  cr.due_date,
  CASE 
    WHEN cr.due_date > NOW() THEN EXTRACT(DAY FROM cr.due_date - NOW())::INTEGER
    ELSE -EXTRACT(DAY FROM NOW() - cr.due_date)::INTEGER
  END as days_until_due
FROM checklist_runs cr
LEFT JOIN checklist_templates ct ON cr.template_id = ct.id
WHERE cr.status = 'in_progress'
ORDER BY cr.due_date ASC NULLS LAST;

-- Check compliance status
SELECT 
  CASE 
    WHEN due_date IS NULL THEN 'no_due_date'
    WHEN due_date > NOW() + INTERVAL '3 days' THEN 'on_time'
    WHEN due_date > NOW() THEN 'due_soon'
    ELSE 'overdue'
  END as status,
  COUNT(*) as count
FROM checklist_runs
WHERE status = 'in_progress'
GROUP BY 
  CASE 
    WHEN due_date IS NULL THEN 'no_due_date'
    WHEN due_date > NOW() + INTERVAL '3 days' THEN 'on_time'
    WHEN due_date > NOW() THEN 'due_soon'
    ELSE 'overdue'
  END;

-- ============================================
-- OPTIONAL: Set specific due dates manually
-- ============================================

-- Example: Set a specific due date for a checklist
-- UPDATE checklist_runs 
-- SET due_date = '2025-01-01 17:00:00'::TIMESTAMPTZ
-- WHERE id = 'your-checklist-id';

-- Example: Extend a due date by 1 day
-- UPDATE checklist_runs 
-- SET due_date = due_date + INTERVAL '1 day'
-- WHERE id = 'your-checklist-id';

-- ============================================
-- DONE! Now go to /dashboard to see your traffic light system
-- ============================================

