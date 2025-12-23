-- Example: Adding a checklist template with reference images
-- This shows how to create a checklist template that includes reference images

INSERT INTO checklist_templates (
  name,
  type,
  machine_id,
  status,
  json_definition,
  created_by
) VALUES (
  'Pre-Run Safety Inspection with Reference Images',
  'pre_run',
  NULL, -- or a specific machine_id
  'active',
  '{
    "sections": [
      {
        "id": "safety-visual-checks",
        "title": "Visual Safety Checks",
        "description": "Compare the actual state with reference images",
        "items": [
          {
            "id": "emergency-stop",
            "label": "Emergency stop button is visible and accessible",
            "type": "yes_no",
            "required": true,
            "critical": true,
            "hint": "The button should be unobstructed and clearly marked",
            "referenceImageUrl": "https://your-project.supabase.co/storage/v1/object/public/checklist-images/reference/emergency-stop-correct.jpg"
          },
          {
            "id": "guard-position",
            "label": "Safety guards are properly positioned",
            "type": "yes_no",
            "required": true,
            "critical": true,
            "hint": "All guards should be in place and secured",
            "referenceImageUrl": "https://your-project.supabase.co/storage/v1/object/public/checklist-images/reference/safety-guard-correct.jpg"
          },
          {
            "id": "work-area-clear",
            "label": "Work area is clear of debris and hazards",
            "type": "yes_no",
            "required": true,
            "hint": "Check for tools, materials, or other obstructions",
            "referenceImageUrl": "https://your-project.supabase.co/storage/v1/object/public/checklist-images/reference/clean-workspace.jpg"
          }
        ]
      },
      {
        "id": "equipment-checks",
        "title": "Equipment Status",
        "items": [
          {
            "id": "pressure-gauge",
            "label": "Air pressure reading",
            "type": "numeric",
            "required": true,
            "minValue": 80,
            "maxValue": 120,
            "unit": "PSI",
            "hint": "Normal operating range is 80-120 PSI",
            "referenceImageUrl": "https://your-project.supabase.co/storage/v1/object/public/checklist-images/reference/pressure-gauge-correct.jpg"
          },
          {
            "id": "coolant-level",
            "label": "Coolant level check",
            "type": "yes_no",
            "required": true,
            "hint": "Level should be between MIN and MAX marks",
            "referenceImageUrl": "https://your-project.supabase.co/storage/v1/object/public/checklist-images/reference/coolant-level-correct.jpg"
          }
        ]
      }
    ]
  }'::jsonb,
  (SELECT id FROM users WHERE role = 'admin' LIMIT 1)
);

-- Note: Before using this example:
-- 1. Upload reference images to your Supabase Storage bucket 'checklist-images'
-- 2. Replace the URLs with your actual Supabase project URL
-- 3. Ensure the paths match where you uploaded the images
-- 4. Test the URLs in a browser to confirm they're accessible
