-- Add Work Centres support
-- Run this in Supabase SQL Editor

-- Create work_centres table if it doesn't exist
CREATE TABLE IF NOT EXISTS work_centres (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add work_centre_id to machines if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'machines' AND column_name = 'work_centre_id'
    ) THEN
        ALTER TABLE machines ADD COLUMN work_centre_id UUID REFERENCES work_centres(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_machines_work_centre ON machines(work_centre_id);

-- Enable RLS on work_centres
ALTER TABLE work_centres ENABLE ROW LEVEL SECURITY;

-- RLS policies for work_centres
DROP POLICY IF EXISTS "Everyone can view work centres" ON work_centres;
CREATE POLICY "Everyone can view work centres" ON work_centres FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage work centres" ON work_centres;
CREATE POLICY "Admins can manage work centres" ON work_centres FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'supervisor'))
);

-- Insert default work centres (skip if they exist)
INSERT INTO work_centres (name, description, display_order) VALUES
    ('Press', 'Compression moulding and press operations', 1),
    ('CNC', 'CNC machining and routing', 2),
    ('Bonding', 'Adhesive bonding and assembly', 3),
    ('Paint', 'Surface finishing and painting', 4),
    ('RTM', 'Resin Transfer Moulding', 5)
ON CONFLICT DO NOTHING;

-- Assign existing machines to work centres based on their names
UPDATE machines SET work_centre_id = (SELECT id FROM work_centres WHERE name = 'Press') 
WHERE (name ILIKE '%press%' OR name ILIKE '%dieffenbacher%') AND work_centre_id IS NULL;

UPDATE machines SET work_centre_id = (SELECT id FROM work_centres WHERE name = 'CNC') 
WHERE (name ILIKE '%cnc%' OR name ILIKE '%maka%' OR name ILIKE '%lathe%') AND work_centre_id IS NULL;

UPDATE machines SET work_centre_id = (SELECT id FROM work_centres WHERE name = 'RTM') 
WHERE name ILIKE '%rtm%' AND work_centre_id IS NULL;

-- Show what we created
SELECT 'Work Centres:' as info;
SELECT id, name, display_order FROM work_centres ORDER BY display_order;

SELECT 'Machines with Work Centres:' as info;
SELECT m.name, wc.name as work_centre 
FROM machines m 
LEFT JOIN work_centres wc ON m.work_centre_id = wc.id
ORDER BY wc.display_order, m.name;

