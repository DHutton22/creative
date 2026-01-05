"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Camera, X, Loader2, Upload } from "lucide-react";

interface ImageUploadProps {
  onUpload: (url: string) => void;
  currentImageUrl?: string | null;
  bucket?: string;
  path?: string;
  maxSizeMB?: number;
  accept?: string;
}

export function ImageUpload({
  onUpload,
  currentImageUrl,
  bucket = "checklist-images",
  path = "uploads",
  maxSizeMB = 5,
  accept = "image/*",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      setError(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    setError(null);
    setUploading(true);

    try {
      // Create a unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${path}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      setPreviewUrl(publicUrl);
      onUpload(publicUrl);
    } catch (err) {
      console.error("Error uploading image:", err);
      setError(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onUpload("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        style={{ display: "none" }}
        capture="environment" // Prefer back camera on mobile
      />

      {previewUrl ? (
        <div style={{ position: "relative", display: "inline-block" }}>
          <img
            src={previewUrl}
            alt="Uploaded preview"
            style={{
              width: "100%",
              maxWidth: "300px",
              height: "auto",
              borderRadius: "8px",
              border: "2px solid #e2e8f0",
            }}
          />
          <button
            onClick={handleRemove}
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              background: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            }}
            title="Remove image"
          >
            <X style={{ width: "16px", height: "16px" }} />
          </button>
        </div>
      ) : (
        <button
          onClick={handleCameraClick}
          disabled={uploading}
          style={{
            width: "100%",
            padding: "16px",
            border: "2px dashed #cbd5e1",
            borderRadius: "8px",
            background: "#f8fafc",
            color: "#64748b",
            cursor: uploading ? "not-allowed" : "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            if (!uploading) {
              e.currentTarget.style.borderColor = "#0057A8";
              e.currentTarget.style.background = "#eff6ff";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#cbd5e1";
            e.currentTarget.style.background = "#f8fafc";
          }}
        >
          {uploading ? (
            <>
              <Loader2 style={{ width: "24px", height: "24px" }} className="animate-spin" />
              <span style={{ fontSize: "14px", fontWeight: "500" }}>Uploading...</span>
            </>
          ) : (
            <>
              <div style={{ display: "flex", gap: "12px" }}>
                <Camera style={{ width: "24px", height: "24px" }} />
                <Upload style={{ width: "24px", height: "24px" }} />
              </div>
              <span style={{ fontSize: "14px", fontWeight: "500" }}>
                Take Photo or Upload Image
              </span>
              <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                Max {maxSizeMB}MB
              </span>
            </>
          )}
        </button>
      )}

      {error && (
        <p style={{ color: "#ef4444", fontSize: "13px", marginTop: "8px" }}>
          {error}
        </p>
      )}
    </div>
  );
}

