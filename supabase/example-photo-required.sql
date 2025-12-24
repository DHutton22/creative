-- Example: Adding a checklist template with photo required items
-- This shows how to create templates that enforce photo documentation

INSERT INTO checklist_templates (
  name,
  type,
  machine_id,
  status,
  json_definition,
  created_by
) VALUES (
  'Safety Inspection with Photo Requirements',
  'safety',
  NULL, -- or a specific machine_id
  'active',
  '{
    "sections": [
      {
        "id": "critical-safety-checks",
        "title": "Critical Safety Checks",
        "description": "These items require photo documentation",
        "items": [
          {
            "id": "emergency-stop-test",
            "label": "Emergency stop button is accessible and functional",
            "type": "yes_no",
            "required": true,
            "critical": true,
            "photoRequired": true,
            "hint": "Test the button and photograph it from the front showing the 12-inch clearance",
            "referenceImageUrl": "https://your-project.supabase.co/storage/v1/object/public/checklist-images/reference/estop-correct.jpg"
          },
          {
            "id": "fire-extinguisher",
            "label": "Fire extinguisher present and inspection tag is current",
            "type": "yes_no",
            "required": true,
            "critical": true,
            "photoRequired": true,
            "hint": "Photograph the inspection tag showing the date clearly"
          },
          {
            "id": "first-aid-kit",
            "label": "First aid kit is stocked and accessible",
            "type": "yes_no",
            "required": true,
            "critical": false,
            "photoRequired": true,
            "hint": "Open the kit and photograph the contents"
          },
          {
            "id": "safety-guards",
            "label": "All machine guards are in place and secured",
            "type": "yes_no",
            "required": true,
            "critical": true,
            "photoRequired": true,
            "hint": "Photograph each guard to show proper installation"
          }
        ]
      },
      {
        "id": "optional-photo-items",
        "title": "Standard Safety Checks",
        "description": "Photos optional but recommended",
        "items": [
          {
            "id": "floor-clean",
            "label": "Floor area is clean and free of trip hazards",
            "type": "yes_no",
            "required": true,
            "critical": false,
            "photoRequired": false,
            "hint": "Walk around the entire work area"
          },
          {
            "id": "lighting-adequate",
            "label": "Lighting is adequate for safe operation",
            "type": "yes_no",
            "required": true,
            "critical": false,
            "photoRequired": false,
            "hint": "Check all overhead lights are working"
          },
          {
            "id": "additional-notes",
            "label": "Additional safety observations or concerns",
            "type": "text",
            "required": false,
            "critical": false,
            "photoRequired": false,
            "hint": "Document any issues that need attention"
          }
        ]
      }
    ]
  }'::jsonb,
  (SELECT id FROM users WHERE role = 'admin' LIMIT 1)
);

-- Example: Quality Control Checklist with Photo Requirements
INSERT INTO checklist_templates (
  name,
  type,
  status,
  json_definition,
  created_by
) VALUES (
  'First Article Inspection - Photos Required',
  'first_off',
  'active',
  '{
    "sections": [
      {
        "id": "dimensional-inspection",
        "title": "Dimensional Inspection",
        "items": [
          {
            "id": "overall-dimensions",
            "label": "Overall dimensions within specification",
            "type": "yes_no",
            "required": true,
            "critical": true,
            "photoRequired": true,
            "hint": "Photograph the part with calipers showing the measurement"
          },
          {
            "id": "surface-finish",
            "label": "Surface finish meets requirements",
            "type": "yes_no",
            "required": true,
            "critical": false,
            "photoRequired": true,
            "hint": "Close-up photo of the surface finish"
          }
        ]
      },
      {
        "id": "visual-inspection",
        "title": "Visual Inspection",
        "items": [
          {
            "id": "no-defects",
            "label": "No visual defects or damage present",
            "type": "yes_no",
            "required": true,
            "critical": true,
            "photoRequired": true,
            "hint": "Photograph the entire part from multiple angles"
          },
          {
            "id": "marking-legible",
            "label": "Part marking is clear and legible",
            "type": "yes_no",
            "required": true,
            "critical": false,
            "photoRequired": true,
            "hint": "Close-up of the part marking"
          }
        ]
      }
    ]
  }'::jsonb,
  (SELECT id FROM users WHERE role = 'admin' LIMIT 1)
);

-- Example: Updating an existing template to add photo requirements
UPDATE checklist_templates
SET json_definition = jsonb_set(
  json_definition,
  '{sections,0,items,0,photoRequired}',
  'true'::jsonb
)
WHERE name = 'Your Existing Template Name'
  AND status = 'active';

-- Note: To update specific items in a template:
-- 1. Export the current json_definition
-- 2. Edit the JSON to add "photoRequired": true where needed
-- 3. Update the template with the new JSON
-- 4. Always test with a sample checklist run first

-- Best Practice: Create new version when making significant changes
-- INSERT INTO checklist_templates (name, type, version, json_definition, ...)
-- SELECT name, type, version + 1, updated_json, ...
-- FROM checklist_templates WHERE id = 'template-id';
