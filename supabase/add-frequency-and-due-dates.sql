-- Add frequency and due date fields to checklist system
-- This enables traffic light status tracking for compliance

-- Add frequency field to checklist_templates
ALTER TABLE checklist_templates 
ADD COLUMN IF NOT EXISTS frequency TEXT DEFAULT 'once' 
CHECK (frequency IN ('once', 'daily', 'weekly', 'monthly', 'quarterly', 'annually'));

-- Add due_date field to checklist_runs
ALTER TABLE checklist_runs 
ADD COLUMN IF NOT EXISTS due_date TIMESTAMPTZ;

-- Add comments
COMMENT ON COLUMN checklist_templates.frequency IS 'How often this checklist should be completed';
COMMENT ON COLUMN checklist_runs.due_date IS 'When this checklist run is due for completion';

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_checklist_runs_due_date ON checklist_runs(due_date) WHERE status = 'in_progress';
CREATE INDEX IF NOT EXISTS idx_checklist_templates_frequency ON checklist_templates(frequency);

-- Create a function to calculate due date based on frequency
CREATE OR REPLACE FUNCTION calculate_next_due_date(
  start_date TIMESTAMPTZ,
  freq TEXT
) RETURNS TIMESTAMPTZ AS $$
BEGIN
  CASE freq
    WHEN 'daily' THEN RETURN start_date + INTERVAL '1 day';
    WHEN 'weekly' THEN RETURN start_date + INTERVAL '7 days';
    WHEN 'monthly' THEN RETURN start_date + INTERVAL '1 month';
    WHEN 'quarterly' THEN RETURN start_date + INTERVAL '3 months';
    WHEN 'annually' THEN RETURN start_date + INTERVAL '1 year';
    ELSE RETURN NULL; -- 'once' has no next due date
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create a view for traffic light status
CREATE OR REPLACE VIEW checklist_compliance_status AS
SELECT 
  cr.id,
  cr.template_id,
  cr.machine_id,
  cr.user_id,
  cr.status,
  cr.started_at,
  cr.completed_at,
  cr.due_date,
  ct.name as template_name,
  ct.frequency,
  m.name as machine_name,
  u.name as user_name,
  CASE 
    WHEN cr.status = 'completed' THEN 'completed'
    WHEN cr.due_date IS NULL THEN 'no_due_date'
    WHEN cr.due_date > NOW() + INTERVAL '3 days' THEN 'on_time'
    WHEN cr.due_date > NOW() THEN 'due_soon'
    ELSE 'overdue'
  END as compliance_status,
  CASE 
    WHEN cr.status = 'completed' THEN 0
    WHEN cr.due_date IS NULL THEN 0
    ELSE EXTRACT(DAY FROM NOW() - cr.due_date)::INTEGER
  END as days_overdue
FROM checklist_runs cr
LEFT JOIN checklist_templates ct ON cr.template_id = ct.id
LEFT JOIN machines m ON cr.machine_id = m.id
LEFT JOIN users u ON cr.user_id = u.id
WHERE cr.status IN ('in_progress', 'completed')
ORDER BY cr.due_date ASC NULLS LAST;

-- Grant access to the view
GRANT SELECT ON checklist_compliance_status TO authenticated;

-- Example: Update existing templates with frequency
-- UPDATE checklist_templates SET frequency = 'daily' WHERE type = 'pre_run';
-- UPDATE checklist_templates SET frequency = 'weekly' WHERE type = 'safety';
-- UPDATE checklist_templates SET frequency = 'monthly' WHERE type = 'maintenance';

-- Example: Set due dates for in-progress checklists
-- UPDATE checklist_runs 
-- SET due_date = started_at + INTERVAL '1 day'
-- WHERE status = 'in_progress' AND due_date IS NULL;
