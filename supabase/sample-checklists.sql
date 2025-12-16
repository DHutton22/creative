-- Sample Checklist Templates for Creative Composites
-- Run this in Supabase SQL Editor after running schema.sql and fix-rls.sql

-- ============================================================================
-- MAKA CR 27 - 5-Axis CNC Pre-Run Checklist
-- ============================================================================
INSERT INTO checklist_templates (name, type, status, machine_id, json_definition) 
SELECT 
  'MAKA CR 27 - Pre-Run Checklist',
  'pre_run'::template_type,
  'active'::template_status,
  m.id,
  '{
    "version": "1.0",
    "sections": [
      {
        "id": "safety",
        "title": "Safety Checks",
        "order": 1,
        "items": [
          {"id": "safety-1", "question": "Emergency stop buttons tested and functional?", "type": "yes_no", "required": true, "critical": true, "guidance": "Press each E-stop and verify machine halts immediately"},
          {"id": "safety-2", "question": "Safety interlocks on doors operational?", "type": "yes_no", "required": true, "critical": true, "guidance": "Open each door and verify spindle cannot start"},
          {"id": "safety-3", "question": "Light curtains functioning correctly?", "type": "yes_no", "required": true, "critical": true},
          {"id": "safety-4", "question": "PPE available at workstation (safety glasses, ear protection)?", "type": "yes_no", "required": true, "critical": false},
          {"id": "safety-5", "question": "Work area clear of obstructions and trip hazards?", "type": "yes_no", "required": true, "critical": false}
        ]
      },
      {
        "id": "machine-condition",
        "title": "Machine Condition",
        "order": 2,
        "items": [
          {"id": "cond-1", "question": "Spindle running smoothly with no unusual noise?", "type": "yes_no", "required": true, "critical": true, "guidance": "Run spindle at 5000 RPM for 30 seconds and listen for bearing noise"},
          {"id": "cond-2", "question": "All 5 axes moving freely without binding?", "type": "yes_no", "required": true, "critical": true, "guidance": "Jog each axis through full travel at reduced speed"},
          {"id": "cond-3", "question": "Way covers intact and undamaged?", "type": "yes_no", "required": true, "critical": false},
          {"id": "cond-4", "question": "Tool changer carousel operating correctly?", "type": "yes_no", "required": true, "critical": true, "guidance": "Cycle through 3 tool changes and verify positive engagement"},
          {"id": "cond-5", "question": "Vacuum table seal condition acceptable?", "type": "yes_no", "required": true, "critical": false, "guidance": "Check rubber seals for cracks or damage"}
        ]
      },
      {
        "id": "lubrication",
        "title": "Lubrication System",
        "order": 3,
        "items": [
          {"id": "lube-1", "question": "Central lubrication reservoir level (mm from top)", "type": "numeric", "required": true, "critical": false, "min_value": 0, "max_value": 50, "unit": "mm", "guidance": "Should be no more than 30mm from top"},
          {"id": "lube-2", "question": "Lubrication pump cycling correctly?", "type": "yes_no", "required": true, "critical": true, "guidance": "Observe pump LED - should flash every 15 minutes"},
          {"id": "lube-3", "question": "No visible oil leaks around ballscrews or linear guides?", "type": "yes_no", "required": true, "critical": false}
        ]
      },
      {
        "id": "extraction",
        "title": "Dust Extraction",
        "order": 4,
        "items": [
          {"id": "ext-1", "question": "Dust extraction system running?", "type": "yes_no", "required": true, "critical": true, "guidance": "Carbon fibre dust is hazardous - extraction MUST be operational"},
          {"id": "ext-2", "question": "Extraction hoses clear and undamaged?", "type": "yes_no", "required": true, "critical": false},
          {"id": "ext-3", "question": "Filter differential pressure reading (mbar)", "type": "numeric", "required": true, "critical": false, "min_value": 0, "max_value": 100, "unit": "mbar", "guidance": "Replace filters if reading exceeds 80 mbar"}
        ]
      },
      {
        "id": "tooling",
        "title": "Tooling Check",
        "order": 5,
        "items": [
          {"id": "tool-1", "question": "Correct tools loaded as per job sheet?", "type": "yes_no", "required": true, "critical": true},
          {"id": "tool-2", "question": "Tool lengths measured and entered in controller?", "type": "yes_no", "required": true, "critical": true, "guidance": "Use tool setter probe for all tools"},
          {"id": "tool-3", "question": "Cutting tool condition acceptable (no chips or wear)?", "type": "yes_no", "required": true, "critical": true, "guidance": "Inspect diamond-coated tools for delamination"}
        ]
      },
      {
        "id": "program",
        "title": "Program Verification",
        "order": 6,
        "items": [
          {"id": "prog-1", "question": "Correct NC program loaded?", "type": "yes_no", "required": true, "critical": true, "guidance": "Verify program number matches job sheet"},
          {"id": "prog-2", "question": "Work offset (G54) verified against setup sheet?", "type": "yes_no", "required": true, "critical": true},
          {"id": "prog-3", "question": "Dry run completed successfully?", "type": "yes_no", "required": true, "critical": true, "guidance": "Run program with spindle off and rapids at 25%"}
        ]
      },
      {
        "id": "comments",
        "title": "Additional Comments",
        "order": 7,
        "items": [
          {"id": "comment-1", "question": "Any issues or observations to report?", "type": "text", "required": false, "critical": false}
        ]
      }
    ]
  }'::jsonb
FROM machines m WHERE m.name LIKE 'MAKA CR 27%' LIMIT 1;

-- ============================================================================
-- MAKA PE 90 - 5-Axis Router Pre-Run Checklist  
-- ============================================================================
INSERT INTO checklist_templates (name, type, status, machine_id, json_definition) 
SELECT 
  'MAKA PE 90 - Pre-Run Checklist',
  'pre_run'::template_type,
  'active'::template_status,
  m.id,
  '{
    "version": "1.0",
    "sections": [
      {
        "id": "safety",
        "title": "Safety Checks",
        "order": 1,
        "items": [
          {"id": "safety-1", "question": "Emergency stops tested?", "type": "yes_no", "required": true, "critical": true},
          {"id": "safety-2", "question": "Perimeter guarding secure?", "type": "yes_no", "required": true, "critical": true},
          {"id": "safety-3", "question": "Floor markings visible and area clear?", "type": "yes_no", "required": true, "critical": false}
        ]
      },
      {
        "id": "vacuum",
        "title": "Vacuum System",
        "order": 2,
        "items": [
          {"id": "vac-1", "question": "Vacuum pump oil level in green zone?", "type": "yes_no", "required": true, "critical": true},
          {"id": "vac-2", "question": "Vacuum pressure reading (mbar)", "type": "numeric", "required": true, "critical": true, "min_value": -1000, "max_value": 0, "unit": "mbar", "guidance": "Should read below -800 mbar for carbon panels"},
          {"id": "vac-3", "question": "Spoilboard surface condition acceptable?", "type": "yes_no", "required": true, "critical": false, "guidance": "Check for deep cuts that may affect vacuum seal"},
          {"id": "vac-4", "question": "Vacuum zones configured for job?", "type": "yes_no", "required": true, "critical": true}
        ]
      },
      {
        "id": "spindle",
        "title": "Spindle & Tooling",
        "order": 3,
        "items": [
          {"id": "spin-1", "question": "Spindle warm-up cycle completed?", "type": "yes_no", "required": true, "critical": true, "guidance": "Run 5 min at 8000 RPM, 5 min at 15000 RPM, 5 min at max RPM"},
          {"id": "spin-2", "question": "Spindle bearing temperature (°C)", "type": "numeric", "required": true, "critical": false, "min_value": 15, "max_value": 60, "unit": "°C", "guidance": "Should stabilise below 50°C after warm-up"},
          {"id": "spin-3", "question": "Router bits sharp and undamaged?", "type": "yes_no", "required": true, "critical": true},
          {"id": "spin-4", "question": "Collet and tool holder clean?", "type": "yes_no", "required": true, "critical": true, "guidance": "Carbon dust in collet causes runout"}
        ]
      },
      {
        "id": "extraction",
        "title": "Dust Extraction",
        "order": 4,
        "items": [
          {"id": "ext-1", "question": "Main extraction unit running?", "type": "yes_no", "required": true, "critical": true},
          {"id": "ext-2", "question": "Brush skirt around spindle intact?", "type": "yes_no", "required": true, "critical": false},
          {"id": "ext-3", "question": "Dust collection bin emptied?", "type": "yes_no", "required": true, "critical": false, "guidance": "Empty when more than 75% full"}
        ]
      },
      {
        "id": "material",
        "title": "Material Setup",
        "order": 5,
        "items": [
          {"id": "mat-1", "question": "Material batch number recorded", "type": "text", "required": true, "critical": false, "guidance": "Enter batch number from material certificate"},
          {"id": "mat-2", "question": "Material thickness verified (mm)", "type": "numeric", "required": true, "critical": true, "min_value": 0.5, "max_value": 50, "unit": "mm"},
          {"id": "mat-3", "question": "Panel secured to table with adequate vacuum?", "type": "yes_no", "required": true, "critical": true}
        ]
      }
    ]
  }'::jsonb
FROM machines m WHERE m.name LIKE 'MAKA PE 90%' LIMIT 1;

-- ============================================================================
-- Dieffenbacher Press - Pre-Run Checklist
-- ============================================================================
INSERT INTO checklist_templates (name, type, status, machine_id, json_definition) 
SELECT 
  'Dieffenbacher 3000T Press - Pre-Run Checklist',
  'pre_run'::template_type,
  'active'::template_status,
  m.id,
  '{
    "version": "1.0",
    "sections": [
      {
        "id": "safety",
        "title": "Safety Systems",
        "order": 1,
        "items": [
          {"id": "safety-1", "question": "All E-stops tested and reset?", "type": "yes_no", "required": true, "critical": true},
          {"id": "safety-2", "question": "Light curtains operational on all sides?", "type": "yes_no", "required": true, "critical": true, "guidance": "Walk through each light curtain and verify press stops"},
          {"id": "safety-3", "question": "Two-hand control operational?", "type": "yes_no", "required": true, "critical": true, "guidance": "Both buttons must be pressed within 0.5 seconds"},
          {"id": "safety-4", "question": "Ejector guard in place?", "type": "yes_no", "required": true, "critical": true},
          {"id": "safety-5", "question": "Area around press clear of personnel?", "type": "yes_no", "required": true, "critical": true}
        ]
      },
      {
        "id": "hydraulics",
        "title": "Hydraulic System",
        "order": 2,
        "items": [
          {"id": "hyd-1", "question": "Hydraulic oil level in sight glass", "type": "yes_no", "required": true, "critical": true, "guidance": "Level must be between min and max marks"},
          {"id": "hyd-2", "question": "Hydraulic oil temperature (°C)", "type": "numeric", "required": true, "critical": true, "min_value": 20, "max_value": 65, "unit": "°C", "guidance": "Do not operate if above 60°C"},
          {"id": "hyd-3", "question": "No visible hydraulic leaks?", "type": "yes_no", "required": true, "critical": true, "guidance": "Check around cylinders, hoses, and valve blocks"},
          {"id": "hyd-4", "question": "Accumulator pre-charge pressure (bar)", "type": "numeric", "required": true, "critical": false, "min_value": 80, "max_value": 120, "unit": "bar", "guidance": "Should read 90-100 bar at operating temp"}
        ]
      },
      {
        "id": "heating",
        "title": "Platen Heating",
        "order": 3,
        "items": [
          {"id": "heat-1", "question": "Upper platen temperature (°C)", "type": "numeric", "required": true, "critical": true, "min_value": 100, "max_value": 200, "unit": "°C", "guidance": "As per recipe card for material"},
          {"id": "heat-2", "question": "Lower platen temperature (°C)", "type": "numeric", "required": true, "critical": true, "min_value": 100, "max_value": 200, "unit": "°C", "guidance": "Should match upper platen within 3°C"},
          {"id": "heat-3", "question": "All heating zones active (no faults)?", "type": "yes_no", "required": true, "critical": true, "guidance": "Check HMI for zone fault indicators"},
          {"id": "heat-4", "question": "Thermal oil circulating pump running?", "type": "yes_no", "required": true, "critical": true}
        ]
      },
      {
        "id": "tooling",
        "title": "Mould Setup",
        "order": 4,
        "items": [
          {"id": "mould-1", "question": "Correct mould installed as per job card?", "type": "yes_no", "required": true, "critical": true},
          {"id": "mould-2", "question": "Mould release agent applied?", "type": "yes_no", "required": true, "critical": false},
          {"id": "mould-3", "question": "Ejector pins moving freely?", "type": "yes_no", "required": true, "critical": true},
          {"id": "mould-4", "question": "Mould faces clean and undamaged?", "type": "yes_no", "required": true, "critical": true},
          {"id": "mould-5", "question": "Mould shot count recorded", "type": "numeric", "required": true, "critical": false, "min_value": 0, "max_value": 100000, "unit": "shots"}
        ]
      },
      {
        "id": "material",
        "title": "Material Check",
        "order": 5,
        "items": [
          {"id": "mat-1", "question": "SMC material within shelf life?", "type": "yes_no", "required": true, "critical": true, "guidance": "Check date code on material roll"},
          {"id": "mat-2", "question": "Material batch number", "type": "text", "required": true, "critical": false},
          {"id": "mat-3", "question": "Material at room temperature?", "type": "yes_no", "required": true, "critical": true, "guidance": "Cold material will not flow correctly"},
          {"id": "mat-4", "question": "Charge weight verified (kg)", "type": "numeric", "required": true, "critical": true, "min_value": 0.1, "max_value": 50, "unit": "kg"}
        ]
      }
    ]
  }'::jsonb
FROM machines m WHERE m.name LIKE 'Dieffenbacher%' LIMIT 1;

-- ============================================================================
-- CNC Lathe - Pre-Run Checklist
-- ============================================================================
INSERT INTO checklist_templates (name, type, status, machine_id, json_definition) 
SELECT 
  'Mazak QTN-200 CNC Lathe - Pre-Run Checklist',
  'pre_run'::template_type,
  'active'::template_status,
  m.id,
  '{
    "version": "1.0",
    "sections": [
      {
        "id": "safety",
        "title": "Safety Checks",
        "order": 1,
        "items": [
          {"id": "safety-1", "question": "Chuck guard in place and interlocked?", "type": "yes_no", "required": true, "critical": true},
          {"id": "safety-2", "question": "E-stop tested?", "type": "yes_no", "required": true, "critical": true},
          {"id": "safety-3", "question": "Coolant splash guards secure?", "type": "yes_no", "required": true, "critical": false},
          {"id": "safety-4", "question": "Chip conveyor clear?", "type": "yes_no", "required": true, "critical": false}
        ]
      },
      {
        "id": "chuck",
        "title": "Chuck & Workholding",
        "order": 2,
        "items": [
          {"id": "chuck-1", "question": "Chuck jaws correct for job?", "type": "yes_no", "required": true, "critical": true},
          {"id": "chuck-2", "question": "Chuck jaw grip pressure correct (bar)", "type": "numeric", "required": true, "critical": true, "min_value": 10, "max_value": 50, "unit": "bar", "guidance": "As per setup sheet - typically 25-35 bar"},
          {"id": "chuck-3", "question": "Tailstock aligned (if required)?", "type": "yes_no", "required": false, "critical": false},
          {"id": "chuck-4", "question": "Bar feeder loaded (if applicable)?", "type": "yes_no", "required": false, "critical": false}
        ]
      },
      {
        "id": "lubrication",
        "title": "Lubrication & Coolant",
        "order": 3,
        "items": [
          {"id": "lube-1", "question": "Way lube reservoir level OK?", "type": "yes_no", "required": true, "critical": true},
          {"id": "lube-2", "question": "Coolant concentration (%)", "type": "numeric", "required": true, "critical": false, "min_value": 5, "max_value": 15, "unit": "%", "guidance": "Use refractometer - should be 6-10%"},
          {"id": "lube-3", "question": "Coolant level adequate?", "type": "yes_no", "required": true, "critical": false},
          {"id": "lube-4", "question": "Coolant pH in range (7-9)?", "type": "yes_no", "required": true, "critical": false, "guidance": "Low pH indicates bacterial growth"}
        ]
      },
      {
        "id": "tooling",
        "title": "Tooling",
        "order": 4,
        "items": [
          {"id": "tool-1", "question": "Tools loaded as per setup sheet?", "type": "yes_no", "required": true, "critical": true},
          {"id": "tool-2", "question": "Tool offsets verified?", "type": "yes_no", "required": true, "critical": true, "guidance": "Touch off each tool or verify with probe"},
          {"id": "tool-3", "question": "Insert condition checked?", "type": "yes_no", "required": true, "critical": true, "guidance": "Check for chipping, wear, or built-up edge"},
          {"id": "tool-4", "question": "Turret indexing correctly?", "type": "yes_no", "required": true, "critical": true}
        ]
      },
      {
        "id": "program",
        "title": "Program Check",
        "order": 5,
        "items": [
          {"id": "prog-1", "question": "Program number verified against job card?", "type": "yes_no", "required": true, "critical": true},
          {"id": "prog-2", "question": "Work offset (G54) set correctly?", "type": "yes_no", "required": true, "critical": true},
          {"id": "prog-3", "question": "First part to be run at reduced feed?", "type": "yes_no", "required": true, "critical": true, "guidance": "Run first part at 50% feed override"}
        ]
      }
    ]
  }'::jsonb
FROM machines m WHERE m.name LIKE 'CNC Lathe%' LIMIT 1;

-- ============================================================================
-- RTM Cell - Pre-Run Checklist
-- ============================================================================
INSERT INTO checklist_templates (name, type, status, machine_id, json_definition) 
SELECT 
  'RTM Cell 1 - Pre-Run Checklist',
  'pre_run'::template_type,
  'active'::template_status,
  m.id,
  '{
    "version": "1.0",
    "sections": [
      {
        "id": "safety",
        "title": "Safety & PPE",
        "order": 1,
        "items": [
          {"id": "safety-1", "question": "Resin-rated gloves available?", "type": "yes_no", "required": true, "critical": true, "guidance": "Nitrile gloves minimum - check for holes"},
          {"id": "safety-2", "question": "Respirator available and in-date?", "type": "yes_no", "required": true, "critical": true, "guidance": "Check filter cartridge expiry date"},
          {"id": "safety-3", "question": "Safety glasses and coveralls available?", "type": "yes_no", "required": true, "critical": true},
          {"id": "safety-4", "question": "Extraction system running?", "type": "yes_no", "required": true, "critical": true},
          {"id": "safety-5", "question": "Spill kit accessible?", "type": "yes_no", "required": true, "critical": false},
          {"id": "safety-6", "question": "Emergency eyewash station accessible and tested?", "type": "yes_no", "required": true, "critical": true}
        ]
      },
      {
        "id": "mould",
        "title": "Mould Preparation",
        "order": 2,
        "items": [
          {"id": "mould-1", "question": "Mould clean and free of cured resin?", "type": "yes_no", "required": true, "critical": true},
          {"id": "mould-2", "question": "Release agent applied (3 coats minimum)?", "type": "yes_no", "required": true, "critical": true},
          {"id": "mould-3", "question": "Mould seals in good condition?", "type": "yes_no", "required": true, "critical": true, "guidance": "Check O-rings for damage or compression set"},
          {"id": "mould-4", "question": "Injection and vent ports clear?", "type": "yes_no", "required": true, "critical": true},
          {"id": "mould-5", "question": "Mould temperature at setpoint (°C)", "type": "numeric", "required": true, "critical": true, "min_value": 40, "max_value": 120, "unit": "°C"}
        ]
      },
      {
        "id": "preform",
        "title": "Preform Check",
        "order": 3,
        "items": [
          {"id": "pre-1", "question": "Preform matches drawing/specification?", "type": "yes_no", "required": true, "critical": true},
          {"id": "pre-2", "question": "Preform batch number recorded", "type": "text", "required": true, "critical": false},
          {"id": "pre-3", "question": "Preform dry (no moisture contamination)?", "type": "yes_no", "required": true, "critical": true, "guidance": "Store preforms in climate-controlled area"},
          {"id": "pre-4", "question": "Preform positioned correctly in mould?", "type": "yes_no", "required": true, "critical": true}
        ]
      },
      {
        "id": "resin",
        "title": "Resin System",
        "order": 4,
        "items": [
          {"id": "resin-1", "question": "Resin type correct for job?", "type": "yes_no", "required": true, "critical": true},
          {"id": "resin-2", "question": "Resin batch number", "type": "text", "required": true, "critical": false},
          {"id": "resin-3", "question": "Hardener batch number", "type": "text", "required": true, "critical": false},
          {"id": "resin-4", "question": "Resin within shelf life?", "type": "yes_no", "required": true, "critical": true},
          {"id": "resin-5", "question": "Mix ratio verified?", "type": "yes_no", "required": true, "critical": true, "guidance": "Check dosing unit calibration"},
          {"id": "resin-6", "question": "Resin temperature (°C)", "type": "numeric", "required": true, "critical": true, "min_value": 20, "max_value": 50, "unit": "°C", "guidance": "Typically 30-40°C for optimal viscosity"}
        ]
      },
      {
        "id": "injection",
        "title": "Injection Equipment",
        "order": 5,
        "items": [
          {"id": "inj-1", "question": "Injection lines flushed and clean?", "type": "yes_no", "required": true, "critical": true},
          {"id": "inj-2", "question": "Pump pressure set correctly (bar)", "type": "numeric", "required": true, "critical": true, "min_value": 1, "max_value": 20, "unit": "bar"},
          {"id": "inj-3", "question": "Vacuum pump operational?", "type": "yes_no", "required": true, "critical": true},
          {"id": "inj-4", "question": "Vacuum level achievable (mbar)", "type": "numeric", "required": true, "critical": true, "min_value": -1000, "max_value": 0, "unit": "mbar", "guidance": "Should achieve below -950 mbar"}
        ]
      }
    ]
  }'::jsonb
FROM machines m WHERE m.name LIKE 'RTM Cell%' LIMIT 1;

-- ============================================================================
-- First-Off Inspection Template (Generic - available for all machines)
-- ============================================================================
INSERT INTO checklist_templates (name, type, status, machine_id, json_definition) VALUES
(
  'First-Off Part Inspection',
  'first_off',
  'active',
  NULL,
  '{
    "version": "1.0",
    "sections": [
      {
        "id": "visual",
        "title": "Visual Inspection",
        "order": 1,
        "items": [
          {"id": "vis-1", "question": "Part free from defects (cracks, voids, delamination)?", "type": "yes_no", "required": true, "critical": true},
          {"id": "vis-2", "question": "Surface finish acceptable?", "type": "yes_no", "required": true, "critical": true},
          {"id": "vis-3", "question": "Part marking/identification correct?", "type": "yes_no", "required": true, "critical": false}
        ]
      },
      {
        "id": "dimensions",
        "title": "Dimensional Check",
        "order": 2,
        "items": [
          {"id": "dim-1", "question": "Critical dimension 1 (as per drawing)", "type": "numeric", "required": true, "critical": true, "min_value": 0, "max_value": 10000, "unit": "mm"},
          {"id": "dim-2", "question": "Critical dimension 2 (as per drawing)", "type": "numeric", "required": true, "critical": true, "min_value": 0, "max_value": 10000, "unit": "mm"},
          {"id": "dim-3", "question": "Critical dimension 3 (as per drawing)", "type": "numeric", "required": false, "critical": false, "min_value": 0, "max_value": 10000, "unit": "mm"},
          {"id": "dim-4", "question": "All dimensions within tolerance?", "type": "yes_no", "required": true, "critical": true}
        ]
      },
      {
        "id": "approval",
        "title": "Approval",
        "order": 3,
        "items": [
          {"id": "app-1", "question": "First-off approved to continue production?", "type": "yes_no", "required": true, "critical": true},
          {"id": "app-2", "question": "Any notes or deviations", "type": "text", "required": false, "critical": false}
        ]
      }
    ]
  }'::jsonb
);

-- ============================================================================
-- Machine Shutdown Checklist (Generic - available for all machines)
-- ============================================================================
INSERT INTO checklist_templates (name, type, status, machine_id, json_definition) VALUES
(
  'Machine Shutdown Checklist',
  'shutdown',
  'active',
  NULL,
  '{
    "version": "1.0",
    "sections": [
      {
        "id": "production",
        "title": "Production Completion",
        "order": 1,
        "items": [
          {"id": "prod-1", "question": "All parts accounted for and stored correctly?", "type": "yes_no", "required": true, "critical": false},
          {"id": "prod-2", "question": "Scrap parts disposed of correctly?", "type": "yes_no", "required": true, "critical": false},
          {"id": "prod-3", "question": "Production paperwork completed?", "type": "yes_no", "required": true, "critical": false}
        ]
      },
      {
        "id": "cleanup",
        "title": "Cleanup",
        "order": 2,
        "items": [
          {"id": "clean-1", "question": "Machine wiped down and chips removed?", "type": "yes_no", "required": true, "critical": false},
          {"id": "clean-2", "question": "Work area swept and tidy?", "type": "yes_no", "required": true, "critical": false},
          {"id": "clean-3", "question": "Tools returned to storage?", "type": "yes_no", "required": true, "critical": false}
        ]
      },
      {
        "id": "shutdown",
        "title": "Shutdown Procedure",
        "order": 3,
        "items": [
          {"id": "shut-1", "question": "Program saved (if modified)?", "type": "yes_no", "required": false, "critical": false},
          {"id": "shut-2", "question": "Machine returned to home position?", "type": "yes_no", "required": true, "critical": false},
          {"id": "shut-3", "question": "Coolant/extraction systems turned off?", "type": "yes_no", "required": true, "critical": false},
          {"id": "shut-4", "question": "Any issues to report for next shift?", "type": "text", "required": false, "critical": false}
        ]
      }
    ]
  }'::jsonb
);

-- Verify the templates were created
SELECT id, name, type, status, machine_id FROM checklist_templates ORDER BY name;
