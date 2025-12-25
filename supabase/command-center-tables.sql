-- Command Center Tables
-- Run this in your Supabase SQL Editor

-- ============================================
-- 1. CHECKLIST ASSIGNMENTS
-- Track when admins assign checklists to operators
-- ============================================
CREATE TABLE IF NOT EXISTS checklist_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_template_id UUID REFERENCES checklist_templates(id) ON DELETE CASCADE,
  machine_id UUID REFERENCES machines(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES users(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
  due_date TIMESTAMPTZ,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  completed_run_id UUID REFERENCES checklist_runs(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE checklist_assignments IS 'Tracks checklist assignments from admins to operators';

CREATE INDEX IF NOT EXISTS idx_assignments_assigned_to ON checklist_assignments(assigned_to);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON checklist_assignments(status);
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON checklist_assignments(due_date);

-- ============================================
-- 2. CHECKLIST SKIPS
-- Audit trail when admins skip a checklist cycle
-- ============================================
CREATE TABLE IF NOT EXISTS checklist_skips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_template_id UUID REFERENCES checklist_templates(id) ON DELETE CASCADE,
  machine_id UUID REFERENCES machines(id) ON DELETE CASCADE,
  skipped_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  skip_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE checklist_skips IS 'Audit trail for skipped checklist cycles';

CREATE INDEX IF NOT EXISTS idx_skips_machine ON checklist_skips(machine_id);
CREATE INDEX IF NOT EXISTS idx_skips_template ON checklist_skips(checklist_template_id);
CREATE INDEX IF NOT EXISTS idx_skips_date ON checklist_skips(skip_date);

-- ============================================
-- 3. MACHINE CONCERNS
-- Issues raised by operators during checklists
-- ============================================
CREATE TABLE IF NOT EXISTS machine_concerns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  machine_id UUID REFERENCES machines(id) ON DELETE CASCADE,
  checklist_run_id UUID REFERENCES checklist_runs(id) ON DELETE SET NULL,
  checklist_item_id TEXT, -- Store the item ID from the checklist definition
  checklist_item_name TEXT, -- Store the item name for display
  raised_by UUID REFERENCES users(id) ON DELETE SET NULL,
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  photo_url TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_review', 'resolved', 'escalated')),
  resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE machine_concerns IS 'Issues and concerns raised about machines during checklists';

CREATE INDEX IF NOT EXISTS idx_concerns_machine ON machine_concerns(machine_id);
CREATE INDEX IF NOT EXISTS idx_concerns_status ON machine_concerns(status);
CREATE INDEX IF NOT EXISTS idx_concerns_severity ON machine_concerns(severity);
CREATE INDEX IF NOT EXISTS idx_concerns_raised_by ON machine_concerns(raised_by);

-- ============================================
-- 4. ACTIVITY LOG
-- Track all significant events for the live feed
-- ============================================
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL CHECK (action_type IN (
    'checklist_started',
    'checklist_completed',
    'checklist_abandoned',
    'concern_raised',
    'concern_resolved',
    'assignment_created',
    'assignment_completed',
    'cycle_skipped',
    'machine_status_changed'
  )),
  entity_type TEXT NOT NULL, -- 'checklist_run', 'machine', 'concern', etc.
  entity_id UUID,
  machine_id UUID REFERENCES machines(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}', -- Additional context
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE activity_log IS 'Activity feed for command center';

CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_type ON activity_log(action_type);
CREATE INDEX IF NOT EXISTS idx_activity_machine ON activity_log(machine_id);

-- ============================================
-- 5. RLS POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE checklist_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_skips ENABLE ROW LEVEL SECURITY;
ALTER TABLE machine_concerns ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Assignments: Admins can do everything, operators can see their own
CREATE POLICY "Admins can manage assignments" ON checklist_assignments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'supervisor'))
  );

CREATE POLICY "Operators can view their assignments" ON checklist_assignments
  FOR SELECT USING (assigned_to = auth.uid());

-- Skips: Only admins can create/view
CREATE POLICY "Admins can manage skips" ON checklist_skips
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'supervisor'))
  );

-- Concerns: Anyone can create, admins can manage
CREATE POLICY "Anyone can create concerns" ON machine_concerns
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can view concerns" ON machine_concerns
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can update concerns" ON machine_concerns
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'supervisor'))
  );

-- Activity log: Everyone can view, system inserts
CREATE POLICY "Anyone can view activity" ON activity_log
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can insert activity" ON activity_log
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- 6. HELPER FUNCTION: Log Activity
-- ============================================
CREATE OR REPLACE FUNCTION log_activity(
  p_user_id UUID,
  p_action_type TEXT,
  p_entity_type TEXT,
  p_entity_id UUID,
  p_machine_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO activity_log (user_id, action_type, entity_type, entity_id, machine_id, metadata)
  VALUES (p_user_id, p_action_type, p_entity_type, p_entity_id, p_machine_id, p_metadata)
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. TRIGGER: Auto-log checklist events
-- ============================================
CREATE OR REPLACE FUNCTION trigger_log_checklist_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Log checklist started
    PERFORM log_activity(
      NEW.user_id,
      'checklist_started',
      'checklist_run',
      NEW.id,
      NEW.machine_id,
      jsonb_build_object('template_id', NEW.template_id)
    );
  ELSIF TG_OP = 'UPDATE' THEN
    -- Log completion or abandonment
    IF OLD.status = 'in_progress' AND NEW.status = 'completed' THEN
      PERFORM log_activity(
        NEW.user_id,
        'checklist_completed',
        'checklist_run',
        NEW.id,
        NEW.machine_id,
        jsonb_build_object('template_id', NEW.template_id, 'duration_minutes', 
          EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at)) / 60)
      );
    ELSIF OLD.status = 'in_progress' AND NEW.status = 'abandoned' THEN
      PERFORM log_activity(
        NEW.user_id,
        'checklist_abandoned',
        'checklist_run',
        NEW.id,
        NEW.machine_id,
        jsonb_build_object('template_id', NEW.template_id)
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger (drop first if exists)
DROP TRIGGER IF EXISTS checklist_activity_trigger ON checklist_runs;
CREATE TRIGGER checklist_activity_trigger
  AFTER INSERT OR UPDATE ON checklist_runs
  FOR EACH ROW
  EXECUTE FUNCTION trigger_log_checklist_activity();

-- ============================================
-- Done! Tables created for Command Center
-- ============================================
SELECT 'Command Center tables created successfully!' as status;

