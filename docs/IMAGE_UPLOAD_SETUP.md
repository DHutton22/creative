# Checklist Image Upload Setup Guide

This guide explains how to set up the Supabase storage bucket for checklist image uploads.

## Features Added

1. **Reference Images**: Checklist items can now include a reference image showing "what it should look like"
2. **User Photo Uploads**: Users can upload photos when completing checklist items to show the current state
3. **Mobile-Friendly**: The upload component works with both camera capture and file uploads

## Database Setup

### 1. Run the SQL Migration

Execute the following SQL in your Supabase SQL Editor:

```sql
-- Add photo_url column to checklist_answers
ALTER TABLE checklist_answers 
ADD COLUMN IF NOT EXISTS photo_url TEXT;

COMMENT ON COLUMN checklist_answers.photo_url IS 'URL of the photo uploaded by the user when completing this checklist item';
```

### 2. Create Storage Bucket

1. Go to **Storage** in your Supabase Dashboard
2. Click **New bucket**
3. Bucket name: `checklist-images`
4. Make it **Public** (or set up RLS policies as shown below)
5. Click **Create bucket**

### 3. Set Up Storage Policies

If you want more control over who can upload/view images, set up these RLS policies:

#### Allow Authenticated Users to Upload

```sql
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'checklist-images');
```

#### Allow Authenticated Users to Update Their Images

```sql
CREATE POLICY "Users can update their own images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'checklist-images');
```

#### Allow Everyone to View Images

```sql
CREATE POLICY "Anyone can view images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'checklist-images');
```

#### Allow Authenticated Users to Delete Images

```sql
CREATE POLICY "Authenticated users can delete images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'checklist-images');
```

## How to Use

### Adding Reference Images to Checklist Templates

When creating or editing a checklist template, add the `referenceImageUrl` field to any checklist item:

```json
{
  "sections": [
    {
      "id": "section-1",
      "title": "Safety Checks",
      "items": [
        {
          "id": "item-1",
          "label": "Emergency stop button is accessible",
          "type": "yes_no",
          "referenceImageUrl": "https://your-supabase-url.supabase.co/storage/v1/object/public/checklist-images/reference/emergency-stop.jpg",
          "hint": "Check that the button is not obstructed",
          "critical": true,
          "required": true
        }
      ]
    }
  ]
}
```

### User Photo Uploads

When completing a checklist:

1. Answer the checklist item (Yes/No, numeric value, or text)
2. Click the **camera icon** button to upload a photo
3. Choose to either:
   - Take a photo with your device camera (on mobile)
   - Upload an existing image file
4. The photo is automatically uploaded to Supabase Storage
5. The photo appears below the answer input

## Image Storage Structure

Images are organized in the storage bucket as follows:

```
checklist-images/
├── reference/          # Reference images for templates
│   └── emergency-stop.jpg
├── runs/              # User-uploaded photos during checklist runs
│   ├── {run-id}/      # Organized by run ID
│   │   ├── 1234567890-abc123.jpg
│   │   └── 1234567891-def456.jpg
```

## Security Considerations

1. **File Size Limits**: The upload component limits files to 5MB by default
2. **File Type Validation**: Only image files are accepted
3. **Unique Filenames**: Files are automatically renamed with timestamps to prevent conflicts
4. **Storage Policies**: Use RLS policies to control who can upload/view/delete images

## Testing

1. Create a new checklist run
2. Answer a checklist item
3. Click the camera icon
4. Upload or take a photo
5. Verify the photo appears in the UI
6. Check Supabase Storage to confirm the upload

## Troubleshooting

### Images Not Uploading

- Check that the `checklist-images` bucket exists in Supabase Storage
- Verify the storage policies are configured correctly
- Check browser console for error messages
- Ensure the user is authenticated

### Images Not Displaying

- Verify the bucket is set to **Public** or has proper RLS policies
- Check that the URL format is correct
- Ensure CORS is configured in Supabase (usually automatic)

### Large File Sizes

- Consider implementing image compression before upload
- Adjust the `maxSizeMB` prop on the `ImageUpload` component
- Set up storage quotas in Supabase if needed

## Future Enhancements

- [ ] Image compression before upload
- [ ] Multiple images per checklist item
- [ ] Image annotations (arrows, circles, text)
- [ ] Image comparison (reference vs. uploaded)
- [ ] Automatic image cleanup for old checklists
- [ ] PDF export with embedded images

