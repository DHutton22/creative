-- Fix for checklist_answers upsert - Add unique constraint
-- Run this in Supabase SQL Editor

-- Add unique constraint on (run_id, item_id) for checklist_answers
-- This is required for the upsert operation to work
ALTER TABLE checklist_answers 
ADD CONSTRAINT checklist_answers_run_item_unique 
UNIQUE (run_id, item_id);

-- Verify constraint was added
SELECT constraint_name, table_name 
FROM information_schema.table_constraints 
WHERE table_name = 'checklist_answers' AND constraint_type = 'UNIQUE';


