-- Cleanup and properly set up checklist templates
-- Run this in Supabase SQL Editor

-- Step 1: Clear everything and start fresh
DELETE FROM checklist_answers;
DELETE FROM checklist_runs;
DELETE FROM checklist_templates;

-- Step 2: Insert machine-specific templates with proper machine links
-- MAKA CR 27
INSERT INTO checklist_templates (name, type, status, machine_id, json_definition) 
SELECT 
  'MAKA CR 27 - Pre-Run Checklist',
  'pre_run'::template_type,
  'active'::template_status,
  m.id,
  '{"version":"1.0","sections":[{"id":"safety","title":"Safety Checks","order":1,"items":[{"id":"safety-1","question":"Emergency stop buttons tested and functional?","type":"yes_no","required":true,"critical":true,"guidance":"Press each E-stop and verify machine halts immediately"},{"id":"safety-2","question":"Safety interlocks on doors operational?","type":"yes_no","required":true,"critical":true},{"id":"safety-3","question":"Light curtains functioning correctly?","type":"yes_no","required":true,"critical":true},{"id":"safety-4","question":"PPE available (safety glasses, ear protection)?","type":"yes_no","required":true,"critical":false},{"id":"safety-5","question":"Work area clear of obstructions?","type":"yes_no","required":true,"critical":false}]},{"id":"machine","title":"Machine Condition","order":2,"items":[{"id":"mach-1","question":"Spindle running smoothly with no unusual noise?","type":"yes_no","required":true,"critical":true,"guidance":"Run spindle at 5000 RPM for 30 seconds"},{"id":"mach-2","question":"All 5 axes moving freely?","type":"yes_no","required":true,"critical":true},{"id":"mach-3","question":"Tool changer operating correctly?","type":"yes_no","required":true,"critical":true},{"id":"mach-4","question":"Vacuum table seal condition acceptable?","type":"yes_no","required":true,"critical":false}]},{"id":"lube","title":"Lubrication","order":3,"items":[{"id":"lube-1","question":"Central lubrication reservoir level (mm from top)","type":"numeric","required":true,"critical":false,"min_value":0,"max_value":50,"unit":"mm"},{"id":"lube-2","question":"Lubrication pump cycling correctly?","type":"yes_no","required":true,"critical":true},{"id":"lube-3","question":"No visible oil leaks?","type":"yes_no","required":true,"critical":false}]},{"id":"extraction","title":"Dust Extraction","order":4,"items":[{"id":"ext-1","question":"Dust extraction system running?","type":"yes_no","required":true,"critical":true,"guidance":"Carbon fibre dust is hazardous"},{"id":"ext-2","question":"Extraction hoses clear?","type":"yes_no","required":true,"critical":false}]},{"id":"program","title":"Program Verification","order":5,"items":[{"id":"prog-1","question":"Correct NC program loaded?","type":"yes_no","required":true,"critical":true},{"id":"prog-2","question":"Work offset verified?","type":"yes_no","required":true,"critical":true},{"id":"prog-3","question":"Dry run completed?","type":"yes_no","required":true,"critical":true}]}]}'::jsonb
FROM machines m WHERE m.name LIKE 'MAKA CR 27%';

-- MAKA PE 90
INSERT INTO checklist_templates (name, type, status, machine_id, json_definition) 
SELECT 
  'MAKA PE 90 - Pre-Run Checklist',
  'pre_run'::template_type,
  'active'::template_status,
  m.id,
  '{"version":"1.0","sections":[{"id":"safety","title":"Safety Checks","order":1,"items":[{"id":"safety-1","question":"Emergency stops tested?","type":"yes_no","required":true,"critical":true},{"id":"safety-2","question":"Perimeter guarding secure?","type":"yes_no","required":true,"critical":true},{"id":"safety-3","question":"Floor markings visible?","type":"yes_no","required":true,"critical":false}]},{"id":"vacuum","title":"Vacuum System","order":2,"items":[{"id":"vac-1","question":"Vacuum pump oil level OK?","type":"yes_no","required":true,"critical":true},{"id":"vac-2","question":"Vacuum pressure reading (mbar)","type":"numeric","required":true,"critical":true,"min_value":-1000,"max_value":0,"unit":"mbar","guidance":"Should read below -800 mbar"},{"id":"vac-3","question":"Spoilboard condition acceptable?","type":"yes_no","required":true,"critical":false},{"id":"vac-4","question":"Vacuum zones configured?","type":"yes_no","required":true,"critical":true}]},{"id":"spindle","title":"Spindle & Tooling","order":3,"items":[{"id":"spin-1","question":"Spindle warm-up completed?","type":"yes_no","required":true,"critical":true},{"id":"spin-2","question":"Spindle bearing temperature (°C)","type":"numeric","required":true,"critical":false,"min_value":15,"max_value":60,"unit":"°C"},{"id":"spin-3","question":"Router bits sharp?","type":"yes_no","required":true,"critical":true},{"id":"spin-4","question":"Collet and holder clean?","type":"yes_no","required":true,"critical":true}]},{"id":"material","title":"Material Setup","order":4,"items":[{"id":"mat-1","question":"Material batch number","type":"text","required":true,"critical":false},{"id":"mat-2","question":"Material thickness (mm)","type":"numeric","required":true,"critical":true,"min_value":0.5,"max_value":50,"unit":"mm"},{"id":"mat-3","question":"Panel secured with vacuum?","type":"yes_no","required":true,"critical":true}]}]}'::jsonb
FROM machines m WHERE m.name LIKE 'MAKA PE 90%';

-- Dieffenbacher Press
INSERT INTO checklist_templates (name, type, status, machine_id, json_definition) 
SELECT 
  'Dieffenbacher Press - Pre-Run Checklist',
  'pre_run'::template_type,
  'active'::template_status,
  m.id,
  '{"version":"1.0","sections":[{"id":"safety","title":"Safety Systems","order":1,"items":[{"id":"safety-1","question":"All E-stops tested?","type":"yes_no","required":true,"critical":true},{"id":"safety-2","question":"Light curtains operational?","type":"yes_no","required":true,"critical":true},{"id":"safety-3","question":"Two-hand control working?","type":"yes_no","required":true,"critical":true},{"id":"safety-4","question":"Area clear of personnel?","type":"yes_no","required":true,"critical":true}]},{"id":"hydraulics","title":"Hydraulic System","order":2,"items":[{"id":"hyd-1","question":"Hydraulic oil level OK?","type":"yes_no","required":true,"critical":true},{"id":"hyd-2","question":"Hydraulic oil temperature (°C)","type":"numeric","required":true,"critical":true,"min_value":20,"max_value":65,"unit":"°C"},{"id":"hyd-3","question":"No visible leaks?","type":"yes_no","required":true,"critical":true}]},{"id":"heating","title":"Platen Heating","order":3,"items":[{"id":"heat-1","question":"Upper platen temperature (°C)","type":"numeric","required":true,"critical":true,"min_value":100,"max_value":200,"unit":"°C"},{"id":"heat-2","question":"Lower platen temperature (°C)","type":"numeric","required":true,"critical":true,"min_value":100,"max_value":200,"unit":"°C"},{"id":"heat-3","question":"All heating zones active?","type":"yes_no","required":true,"critical":true}]},{"id":"mould","title":"Mould Setup","order":4,"items":[{"id":"mould-1","question":"Correct mould installed?","type":"yes_no","required":true,"critical":true},{"id":"mould-2","question":"Release agent applied?","type":"yes_no","required":true,"critical":false},{"id":"mould-3","question":"Ejector pins free?","type":"yes_no","required":true,"critical":true}]},{"id":"material","title":"Material Check","order":5,"items":[{"id":"mat-1","question":"SMC within shelf life?","type":"yes_no","required":true,"critical":true},{"id":"mat-2","question":"Material batch number","type":"text","required":true,"critical":false},{"id":"mat-3","question":"Charge weight (kg)","type":"numeric","required":true,"critical":true,"min_value":0.1,"max_value":50,"unit":"kg"}]}]}'::jsonb
FROM machines m WHERE m.name LIKE 'Dieffenbacher%';

-- CNC Lathe
INSERT INTO checklist_templates (name, type, status, machine_id, json_definition) 
SELECT 
  'CNC Lathe - Pre-Run Checklist',
  'pre_run'::template_type,
  'active'::template_status,
  m.id,
  '{"version":"1.0","sections":[{"id":"safety","title":"Safety Checks","order":1,"items":[{"id":"safety-1","question":"Chuck guard in place?","type":"yes_no","required":true,"critical":true},{"id":"safety-2","question":"E-stop tested?","type":"yes_no","required":true,"critical":true},{"id":"safety-3","question":"Coolant guards secure?","type":"yes_no","required":true,"critical":false},{"id":"safety-4","question":"Chip conveyor clear?","type":"yes_no","required":true,"critical":false}]},{"id":"chuck","title":"Chuck & Workholding","order":2,"items":[{"id":"chuck-1","question":"Chuck jaws correct for job?","type":"yes_no","required":true,"critical":true},{"id":"chuck-2","question":"Chuck grip pressure (bar)","type":"numeric","required":true,"critical":true,"min_value":10,"max_value":50,"unit":"bar"},{"id":"chuck-3","question":"Tailstock aligned (if needed)?","type":"yes_no","required":false,"critical":false}]},{"id":"coolant","title":"Lubrication & Coolant","order":3,"items":[{"id":"cool-1","question":"Way lube reservoir OK?","type":"yes_no","required":true,"critical":true},{"id":"cool-2","question":"Coolant concentration (%)","type":"numeric","required":true,"critical":false,"min_value":5,"max_value":15,"unit":"%"},{"id":"cool-3","question":"Coolant level adequate?","type":"yes_no","required":true,"critical":false}]},{"id":"tooling","title":"Tooling","order":4,"items":[{"id":"tool-1","question":"Tools loaded per setup sheet?","type":"yes_no","required":true,"critical":true},{"id":"tool-2","question":"Tool offsets verified?","type":"yes_no","required":true,"critical":true},{"id":"tool-3","question":"Insert condition checked?","type":"yes_no","required":true,"critical":true},{"id":"tool-4","question":"Turret indexing correctly?","type":"yes_no","required":true,"critical":true}]},{"id":"program","title":"Program Check","order":5,"items":[{"id":"prog-1","question":"Program number correct?","type":"yes_no","required":true,"critical":true},{"id":"prog-2","question":"Work offset set?","type":"yes_no","required":true,"critical":true},{"id":"prog-3","question":"First part at reduced feed?","type":"yes_no","required":true,"critical":true}]}]}'::jsonb
FROM machines m WHERE m.name LIKE 'CNC Lathe%';

-- RTM Cell
INSERT INTO checklist_templates (name, type, status, machine_id, json_definition) 
SELECT 
  'RTM Cell - Pre-Run Checklist',
  'pre_run'::template_type,
  'active'::template_status,
  m.id,
  '{"version":"1.0","sections":[{"id":"safety","title":"Safety & PPE","order":1,"items":[{"id":"safety-1","question":"Resin-rated gloves available?","type":"yes_no","required":true,"critical":true},{"id":"safety-2","question":"Respirator available and in-date?","type":"yes_no","required":true,"critical":true},{"id":"safety-3","question":"Safety glasses and coveralls?","type":"yes_no","required":true,"critical":true},{"id":"safety-4","question":"Extraction running?","type":"yes_no","required":true,"critical":true},{"id":"safety-5","question":"Eyewash station accessible?","type":"yes_no","required":true,"critical":true}]},{"id":"mould","title":"Mould Preparation","order":2,"items":[{"id":"mould-1","question":"Mould clean?","type":"yes_no","required":true,"critical":true},{"id":"mould-2","question":"Release agent applied (3 coats)?","type":"yes_no","required":true,"critical":true},{"id":"mould-3","question":"Mould seals OK?","type":"yes_no","required":true,"critical":true},{"id":"mould-4","question":"Ports clear?","type":"yes_no","required":true,"critical":true},{"id":"mould-5","question":"Mould temperature (°C)","type":"numeric","required":true,"critical":true,"min_value":40,"max_value":120,"unit":"°C"}]},{"id":"preform","title":"Preform Check","order":3,"items":[{"id":"pre-1","question":"Preform matches spec?","type":"yes_no","required":true,"critical":true},{"id":"pre-2","question":"Preform batch number","type":"text","required":true,"critical":false},{"id":"pre-3","question":"Preform dry?","type":"yes_no","required":true,"critical":true},{"id":"pre-4","question":"Positioned correctly?","type":"yes_no","required":true,"critical":true}]},{"id":"resin","title":"Resin System","order":4,"items":[{"id":"resin-1","question":"Resin type correct?","type":"yes_no","required":true,"critical":true},{"id":"resin-2","question":"Resin batch number","type":"text","required":true,"critical":false},{"id":"resin-3","question":"Within shelf life?","type":"yes_no","required":true,"critical":true},{"id":"resin-4","question":"Resin temperature (°C)","type":"numeric","required":true,"critical":true,"min_value":20,"max_value":50,"unit":"°C"}]},{"id":"injection","title":"Injection Equipment","order":5,"items":[{"id":"inj-1","question":"Lines flushed?","type":"yes_no","required":true,"critical":true},{"id":"inj-2","question":"Pump pressure (bar)","type":"numeric","required":true,"critical":true,"min_value":1,"max_value":20,"unit":"bar"},{"id":"inj-3","question":"Vacuum pump OK?","type":"yes_no","required":true,"critical":true},{"id":"inj-4","question":"Vacuum level (mbar)","type":"numeric","required":true,"critical":true,"min_value":-1000,"max_value":0,"unit":"mbar"}]}]}'::jsonb
FROM machines m WHERE m.name LIKE 'RTM Cell%';

-- Step 3: Insert GENERIC templates (available for ALL machines - machine_id is NULL)
INSERT INTO checklist_templates (name, type, status, machine_id, json_definition) VALUES
(
  'First-Off Part Inspection',
  'first_off',
  'active',
  NULL,
  '{"version":"1.0","sections":[{"id":"visual","title":"Visual Inspection","order":1,"items":[{"id":"vis-1","question":"Part free from defects?","type":"yes_no","required":true,"critical":true},{"id":"vis-2","question":"Surface finish acceptable?","type":"yes_no","required":true,"critical":true},{"id":"vis-3","question":"Part marking correct?","type":"yes_no","required":true,"critical":false}]},{"id":"dimensions","title":"Dimensional Check","order":2,"items":[{"id":"dim-1","question":"Critical dimension 1 (mm)","type":"numeric","required":true,"critical":true,"min_value":0,"max_value":10000,"unit":"mm"},{"id":"dim-2","question":"Critical dimension 2 (mm)","type":"numeric","required":true,"critical":true,"min_value":0,"max_value":10000,"unit":"mm"},{"id":"dim-3","question":"All dimensions within tolerance?","type":"yes_no","required":true,"critical":true}]},{"id":"approval","title":"Approval","order":3,"items":[{"id":"app-1","question":"First-off approved?","type":"yes_no","required":true,"critical":true},{"id":"app-2","question":"Notes or deviations","type":"text","required":false,"critical":false}]}]}'::jsonb
),
(
  'Machine Shutdown Checklist',
  'shutdown',
  'active',
  NULL,
  '{"version":"1.0","sections":[{"id":"production","title":"Production Completion","order":1,"items":[{"id":"prod-1","question":"All parts accounted for?","type":"yes_no","required":true,"critical":false},{"id":"prod-2","question":"Scrap disposed correctly?","type":"yes_no","required":true,"critical":false},{"id":"prod-3","question":"Paperwork completed?","type":"yes_no","required":true,"critical":false}]},{"id":"cleanup","title":"Cleanup","order":2,"items":[{"id":"clean-1","question":"Machine wiped down?","type":"yes_no","required":true,"critical":false},{"id":"clean-2","question":"Work area tidy?","type":"yes_no","required":true,"critical":false},{"id":"clean-3","question":"Tools returned?","type":"yes_no","required":true,"critical":false}]},{"id":"shutdown","title":"Shutdown","order":3,"items":[{"id":"shut-1","question":"Program saved (if modified)?","type":"yes_no","required":false,"critical":false},{"id":"shut-2","question":"Machine at home position?","type":"yes_no","required":true,"critical":false},{"id":"shut-3","question":"Systems turned off?","type":"yes_no","required":true,"critical":false},{"id":"shut-4","question":"Issues to report?","type":"text","required":false,"critical":false}]}]}'::jsonb
);

-- Verify - should show each machine-specific template with a machine_id, and 2 generic templates with NULL
SELECT 
  ct.name as template_name, 
  ct.type, 
  m.name as machine_name,
  ct.machine_id
FROM checklist_templates ct
LEFT JOIN machines m ON ct.machine_id = m.id
ORDER BY ct.name;

