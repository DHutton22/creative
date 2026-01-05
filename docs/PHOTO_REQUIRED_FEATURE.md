# Photo Required Feature

## Overview
The "Photo Required" feature allows administrators to enforce photo documentation for specific checklist items. When an item is marked as requiring a photo, users must upload an image before they can complete the checklist.

## Features

### 1. Mark Items as Photo Required
When creating or editing checklist templates, add the `photoRequired` field to any checklist item:

```json
{
  "id": "item-1",
  "label": "Safety guard is properly installed",
  "type": "yes_no",
  "required": true,
  "critical": true,
  "photoRequired": true,
  "hint": "Check that all bolts are tight"
}
```

### 2. Visual Indicators
Items marked as photo required display:
- **📷 PHOTO REQUIRED** badge next to the question
- Blue badge color (#1e40af background)
- Warning message if photo is missing

### 3. Validation
The checklist cannot be completed if:
- Any required photos are missing
- Progress counter shows: "📷 X required photos missing"

### 4. User Experience

#### When Photo Is Required:
1. User sees "📷 PHOTO REQUIRED" badge on the item
2. User answers the question (Yes/No, numeric, or text)
3. Photo upload button appears
4. If user tries to complete without photo, they see:
   - Red warning box: "Photo required - Please upload a photo to continue"
   - Yellow warning at bottom: "X photos required"
   - Complete button is disabled

#### When Photo Is Uploaded:
- Green success box displays: "Your Photo"
- Image thumbnail is shown
- Click thumbnail to view full size
- Warning disappears
- Progress counter updates

### 5. Progress Tracking

The checklist tracks:
- Total items answered
- Failed items (wrong answers)
- **Missing required photos** (new!)

Example progress display:
```
Progress: 8/10
⚠️ 1 item failed
📷 2 required photos missing
```

### 6. Section Navigation

The "Remaining Items" warning shows:
```
Safety Checks (1 unanswered, 2 photos)
```

This helps users quickly identify which sections need photos.

## Example Template with Photo Required

```json
{
  "sections": [
    {
      "id": "safety-inspection",
      "title": "Safety Inspection",
      "items": [
        {
          "id": "emergency-stop",
          "label": "Emergency stop button is accessible",
          "type": "yes_no",
          "required": true,
          "critical": true,
          "photoRequired": true,
          "referenceImageUrl": "https://example.com/reference-emergency-stop.jpg",
          "hint": "Button must be unobstructed and clearly visible"
        },
        {
          "id": "fire-extinguisher",
          "label": "Fire extinguisher is present and not expired",
          "type": "yes_no",
          "required": true,
          "critical": true,
          "photoRequired": true,
          "hint": "Check expiration date on tag"
        },
        {
          "id": "safety-notes",
          "label": "Additional safety observations",
          "type": "text",
          "required": false,
          "photoRequired": false,
          "hint": "Document any concerns or issues"
        }
      ]
    }
  ]
}
```

## Use Cases

### 1. Quality Control
- **Before/After Photos**: Require photos of parts before and after processing
- **Defect Documentation**: Photos of any defects or issues found
- **Measurement Verification**: Photos of measurement tools showing readings

### 2. Safety Compliance
- **PPE Verification**: Photos showing proper personal protective equipment
- **Safety Equipment**: Photos of fire extinguishers, first aid kits, etc.
- **Hazard Documentation**: Photos of any safety hazards identified

### 3. Maintenance
- **Equipment Condition**: Photos of equipment state before maintenance
- **Completed Work**: Photos showing maintenance work completed
- **Parts Replacement**: Photos of new parts installed

### 4. Training Documentation
- **Setup Verification**: Photos showing correct equipment setup
- **Process Steps**: Photos documenting each step of a process
- **Final Result**: Photos of completed work for quality review

## Benefits

1. **Accountability**: Visual proof that checks were performed
2. **Quality Assurance**: Evidence of proper procedures
3. **Training Tool**: Photos serve as examples for future training
4. **Audit Trail**: Complete documentation for compliance
5. **Remote Review**: Supervisors can review without being on-site
6. **Issue Resolution**: Photos help diagnose problems

## Technical Implementation

### Database
No database schema changes needed - the `photoRequired` field is part of the JSONB definition in checklist templates.

### Validation Logic
```typescript
// Count items with missing required photos
const missingPhotos = sections.reduce((acc, section) => {
  return acc + section.items.filter(item => {
    if (!item.photoRequired) return false;
    const answer = answers.get(item.id);
    return !answer || !answer.photo_url;
  }).length;
}, 0);

// Prevent completion if photos are missing
const allItemsAnswered = answeredCount >= totalItems && missingPhotos === 0;
```

### Storage
- Photos are stored in Supabase Storage bucket: `checklist-images`
- Path format: `runs/{run-id}/{timestamp}-{random}.{ext}`
- URLs stored in `checklist_answers.photo_url` column

## Best Practices

### When to Require Photos

**✅ DO require photos for:**
- Critical safety checks
- Quality verification points
- High-value equipment inspections
- Compliance requirements
- Training verification
- First-time setup

**❌ DON'T require photos for:**
- Simple yes/no checks with no visual component
- Frequently repeated routine checks
- Items where photos add no value
- When it significantly slows down the process

### Photo Guidelines

Include in the `hint` field:
- What angle to photograph from
- What should be visible in the photo
- Lighting requirements
- Distance from subject
- What to focus on

Example:
```json
{
  "hint": "Take a clear photo from the front showing the entire emergency stop button and surrounding 12-inch clearance area"
}
```

## Mobile Considerations

- Camera integration uses `capture="environment"` for back camera
- Photos auto-upload after capture
- Thumbnail preview shown immediately
- Full-size viewing in new tab
- Works offline (queues uploads)

## Troubleshooting

### Photos Not Uploading
1. Check Supabase Storage bucket exists
2. Verify storage policies allow uploads
3. Check user authentication
4. Verify network connection
5. Check browser permissions

### Photos Required but Button Not Showing
1. Ensure answer is submitted first
2. Check that `photoRequired: true` in template
3. Verify ImageUpload component is imported
4. Check console for errors

### Checklist Won't Complete
1. Check "Remaining Items" warning
2. Verify all required photos are uploaded
3. Look for red warning messages
4. Check photo_url is saved in database

## Future Enhancements

- [ ] Multiple photos per item
- [ ] Photo annotations (arrows, circles, text)
- [ ] Photo comparison (reference vs actual)
- [ ] Automatic quality checks (blur detection, lighting)
- [ ] Photo templates/overlays
- [ ] GPS tagging
- [ ] Timestamp overlays
- [ ] Photo compression options

