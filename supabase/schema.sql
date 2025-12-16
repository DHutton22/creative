-- Creative Composites Machine Checklist System Database Schema
-- Run this in Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('admin', 'supervisor', 'operator', 'maintenance', 'quality');
CREATE TYPE machine_status AS ENUM ('available', 'in_use', 'under_maintenance', 'locked_out', 'decommissioned');
CREATE TYPE risk_category AS ENUM ('normal', 'high_risk', 'aerospace');
CREATE TYPE competency_level AS ENUM ('trainee', 'authorised', 'trainer');
CREATE TYPE mould_status AS ENUM ('active', 'maintenance', 'retired');
CREATE TYPE template_status AS ENUM ('draft', 'active', 'deprecated');
CREATE TYPE template_type AS ENUM ('pre_run', 'first_off', 'shutdown', 'maintenance', 'safety', 'quality');
CREATE TYPE run_status AS ENUM ('in_progress', 'completed', 'aborted');
CREATE TYPE shift_type AS ENUM ('day', 'night');
CREATE TYPE maintenance_type AS ENUM ('preventative', 'corrective');
CREATE TYPE schedule_type AS ENUM ('time_based', 'usage_based', 'mixed');
CREATE TYPE task_status AS ENUM ('upcoming', 'due', 'overdue', 'completed', 'cancelled');
CREATE TYPE issue_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE issue_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'operator',
    department TEXT,
    site TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Machines table
CREATE TABLE machines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    manufacturer TEXT,
    model TEXT,
    serial_number TEXT,
    location TEXT,
    status machine_status NOT NULL DEFAULT 'available',
    risk_category risk_category NOT NULL DEFAULT 'normal',
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User competencies (who can operate which machines)
CREATE TABLE user_competencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    machine_id UUID NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
    level competency_level NOT NULL DEFAULT 'trainee',
    expiry_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, machine_id)
);

-- Moulds table
CREATE TABLE moulds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    drawing_number TEXT,
    customer TEXT,
    machine_compatibility TEXT[] DEFAULT '{}',
    shot_count INTEGER NOT NULL DEFAULT 0,
    target_life INTEGER,
    maintenance_interval INTEGER,
    status mould_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Checklist templates
CREATE TABLE checklist_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type template_type NOT NULL,
    machine_id UUID REFERENCES machines(id) ON DELETE SET NULL,
    version INTEGER NOT NULL DEFAULT 1,
    status template_status NOT NULL DEFAULT 'draft',
    json_definition JSONB NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Checklist runs (completed/in-progress checklists)
CREATE TABLE checklist_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL REFERENCES checklist_templates(id) ON DELETE RESTRICT,
    machine_id UUID NOT NULL REFERENCES machines(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    job_number TEXT,
    part_number TEXT,
    program_name TEXT,
    mould_id UUID REFERENCES moulds(id) ON DELETE SET NULL,
    shift shift_type,
    status run_status NOT NULL DEFAULT 'in_progress',
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    signature TEXT,
    supervisor_override BOOLEAN NOT NULL DEFAULT FALSE,
    supervisor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT
);

-- Checklist answers
CREATE TABLE checklist_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    run_id UUID NOT NULL REFERENCES checklist_runs(id) ON DELETE CASCADE,
    item_id TEXT NOT NULL,
    section_id TEXT NOT NULL,
    value JSONB NOT NULL,
    comment TEXT,
    attachments TEXT[] DEFAULT '{}',
    answered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Maintenance tasks
CREATE TABLE maintenance_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    machine_id UUID REFERENCES machines(id) ON DELETE CASCADE,
    mould_id UUID REFERENCES moulds(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    type maintenance_type NOT NULL DEFAULT 'preventative',
    schedule_type schedule_type NOT NULL DEFAULT 'time_based',
    interval_days INTEGER,
    interval_cycles INTEGER,
    template_id UUID REFERENCES checklist_templates(id) ON DELETE SET NULL,
    due_at TIMESTAMPTZ,
    last_completed_at TIMESTAMPTZ,
    status task_status NOT NULL DEFAULT 'upcoming',
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT machine_or_mould CHECK (machine_id IS NOT NULL OR mould_id IS NOT NULL)
);

-- Maintenance logs
CREATE TABLE maintenance_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES maintenance_tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    checklist_run_id UUID REFERENCES checklist_runs(id) ON DELETE SET NULL,
    notes TEXT,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Material batches
CREATE TABLE material_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL,
    supplier TEXT,
    batch_number TEXT NOT NULL,
    expiry_date DATE,
    storage_location TEXT,
    quantity DECIMAL,
    unit TEXT,
    certificates_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Issues
CREATE TABLE issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    machine_id UUID REFERENCES machines(id) ON DELETE SET NULL,
    mould_id UUID REFERENCES moulds(id) ON DELETE SET NULL,
    checklist_run_id UUID REFERENCES checklist_runs(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    severity issue_severity NOT NULL DEFAULT 'medium',
    status issue_status NOT NULL DEFAULT 'open',
    reported_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    attachments TEXT[] DEFAULT '{}',
    resolution TEXT,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_machines_status ON machines(status);
CREATE INDEX idx_machines_location ON machines(location);
CREATE INDEX idx_checklist_templates_status ON checklist_templates(status);
CREATE INDEX idx_checklist_templates_type ON checklist_templates(type);
CREATE INDEX idx_checklist_templates_machine ON checklist_templates(machine_id);
CREATE INDEX idx_checklist_runs_machine ON checklist_runs(machine_id);
CREATE INDEX idx_checklist_runs_user ON checklist_runs(user_id);
CREATE INDEX idx_checklist_runs_status ON checklist_runs(status);
CREATE INDEX idx_checklist_runs_started ON checklist_runs(started_at);
CREATE INDEX idx_checklist_answers_run ON checklist_answers(run_id);
CREATE INDEX idx_maintenance_tasks_machine ON maintenance_tasks(machine_id);
CREATE INDEX idx_maintenance_tasks_status ON maintenance_tasks(status);
CREATE INDEX idx_maintenance_tasks_due ON maintenance_tasks(due_at);
CREATE INDEX idx_issues_status ON issues(status);
CREATE INDEX idx_issues_severity ON issues(severity);
CREATE INDEX idx_issues_machine ON issues(machine_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_machines_updated_at BEFORE UPDATE ON machines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_competencies_updated_at BEFORE UPDATE ON user_competencies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_moulds_updated_at BEFORE UPDATE ON moulds FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_checklist_templates_updated_at BEFORE UPDATE ON checklist_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_maintenance_tasks_updated_at BEFORE UPDATE ON maintenance_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_material_batches_updated_at BEFORE UPDATE ON material_batches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_issues_updated_at BEFORE UPDATE ON issues FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security Policies

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_competencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE moulds ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can manage users" ON users FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Machines policies (everyone can view, admins can manage)
CREATE POLICY "Everyone can view machines" ON machines FOR SELECT USING (true);
CREATE POLICY "Admins can manage machines" ON machines FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'supervisor'))
);

-- User competencies policies
CREATE POLICY "Everyone can view competencies" ON user_competencies FOR SELECT USING (true);
CREATE POLICY "Admins can manage competencies" ON user_competencies FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Moulds policies
CREATE POLICY "Everyone can view moulds" ON moulds FOR SELECT USING (true);
CREATE POLICY "Admins can manage moulds" ON moulds FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'supervisor'))
);

-- Checklist templates policies
CREATE POLICY "Everyone can view active templates" ON checklist_templates FOR SELECT USING (
    status = 'active' OR 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'supervisor'))
);
CREATE POLICY "Admins and supervisors can manage templates" ON checklist_templates FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'supervisor'))
);

-- Checklist runs policies
CREATE POLICY "Users can view own runs" ON checklist_runs FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'supervisor', 'quality'))
);
CREATE POLICY "Users can create runs" ON checklist_runs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update own runs" ON checklist_runs FOR UPDATE USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'supervisor'))
);

-- Checklist answers policies
CREATE POLICY "Users can view answers for accessible runs" ON checklist_answers FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM checklist_runs 
        WHERE checklist_runs.id = checklist_answers.run_id 
        AND (
            checklist_runs.user_id = auth.uid() OR
            EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'supervisor', 'quality'))
        )
    )
);
CREATE POLICY "Users can create answers for own runs" ON checklist_answers FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM checklist_runs 
        WHERE checklist_runs.id = run_id AND checklist_runs.user_id = auth.uid()
    )
);

-- Maintenance tasks policies
CREATE POLICY "Everyone can view maintenance tasks" ON maintenance_tasks FOR SELECT USING (true);
CREATE POLICY "Maintenance and admins can manage tasks" ON maintenance_tasks FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'supervisor', 'maintenance'))
);

-- Maintenance logs policies
CREATE POLICY "Everyone can view maintenance logs" ON maintenance_logs FOR SELECT USING (true);
CREATE POLICY "Users can create logs" ON maintenance_logs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Material batches policies
CREATE POLICY "Everyone can view material batches" ON material_batches FOR SELECT USING (true);
CREATE POLICY "Admins can manage material batches" ON material_batches FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'supervisor', 'quality'))
);

-- Issues policies
CREATE POLICY "Everyone can view issues" ON issues FOR SELECT USING (true);
CREATE POLICY "Users can create issues" ON issues FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admins and assignees can update issues" ON issues FOR UPDATE USING (
    reported_by = auth.uid() OR
    assigned_to = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'supervisor', 'maintenance'))
);

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        'operator'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert some sample data for development
INSERT INTO machines (name, manufacturer, model, location, status, risk_category, description) VALUES
    ('MAKA CR 27 - Machine 1', 'MAKA Systems GmbH', 'CR 27', 'Bay 1', 'available', 'aerospace', '5-axis high-performance milling centre'),
    ('MAKA PE 90 - Machine 2', 'MAKA Systems GmbH', 'PE 90', 'Bay 2', 'available', 'aerospace', '5-axis router for composite panels'),
    ('Dieffenbacher Press 1', 'Dieffenbacher', '3000T', 'Press Hall', 'available', 'high_risk', '3000-tonne SMC compression press'),
    ('CNC Lathe 1', 'Mazak', 'QTN-200', 'Machining', 'available', 'normal', 'CNC turning centre'),
    ('RTM Cell 1', 'Custom', 'RTM-500', 'Composites', 'under_maintenance', 'aerospace', 'Resin Transfer Moulding cell');


