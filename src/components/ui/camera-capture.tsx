"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface CameraCaptureProps {
  onCapture: (url: string) => void;
  currentImageUrl?: string | null;
  bucket?: string;
  path?: string;
  maxSizeMB?: number;
}

const BRAND_BLUE = "#0057A8";

export function CameraCapture({
  onCapture,
  currentImageUrl,
  bucket = "checklist-images",
  path = "uploads",
  maxSizeMB = 5,
}: CameraCaptureProps) {
  const [mode, setMode] = useState<"idle" | "camera" | "preview" | "uploading">("idle");
  const [capturedImage, setCapturedImage] = useState<string | null>(currentImageUrl || null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const supabase = createClient();

  // Check if device has multiple cameras
  useEffect(() => {
    navigator.mediaDevices?.enumerateDevices().then(devices => {
      const videoDevices = devices.filter(d => d.kind === "videoinput");
      setHasMultipleCameras(videoDevices.length > 1);
    }).catch(() => {});
  }, []);

  // Start camera stream
  const startCamera = useCallback(async () => {
    setError(null);
    setMode("camera");
    
    try {
      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("Camera error:", err);
      setError("Could not access camera. Please check permissions or use file upload.");
      setMode("idle");
    }
  }, [facingMode]);

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Switch camera
  const switchCamera = () => {
    const newFacing = facingMode === "environment" ? "user" : "environment";
    setFacingMode(newFacing);
    if (mode === "camera") {
      stopCamera();
      setTimeout(() => startCamera(), 100);
    }
  };

  // Capture photo
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Flip horizontally if using front camera
    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    
    ctx.drawImage(video, 0, 0);
    
    // Get image data
    const imageData = canvas.toDataURL("image/jpeg", 0.85);
    setCapturedImage(imageData);
    setMode("preview");
    stopCamera();
  };

  // Upload captured image
  const uploadImage = async () => {
    if (!capturedImage) return;
    
    setMode("uploading");
    setError(null);

    try {
      // Convert base64 to blob
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      
      // Check file size
      const fileSizeMB = blob.size / (1024 * 1024);
      if (fileSizeMB > maxSizeMB) {
        setError(`Image too large. Max size is ${maxSizeMB}MB`);
        setMode("preview");
        return;
      }

      // Create unique filename
      const fileName = `${path}/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, blob, {
          contentType: "image/jpeg",
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      setCapturedImage(publicUrl);
      onCapture(publicUrl);
      setMode("idle");
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Failed to upload image");
      setMode("preview");
    }
  };

  // Handle file upload fallback
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      setError(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    setError(null);
    setMode("uploading");

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${path}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      setCapturedImage(publicUrl);
      onCapture(publicUrl);
      setMode("idle");
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Failed to upload image");
      setMode("idle");
    }
  };

  // Retake photo
  const retake = () => {
    setCapturedImage(null);
    startCamera();
  };

  // Remove image
  const removeImage = () => {
    setCapturedImage(null);
    onCapture("");
    setMode("idle");
  };

  // Cancel camera
  const cancelCamera = () => {
    stopCamera();
    setMode("idle");
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />
      
      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* Idle State - Show options */}
      {mode === "idle" && !capturedImage && (
        <div style={{
          border: "2px dashed #cbd5e1",
          borderRadius: "16px",
          padding: "24px",
          background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
        }}>
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <div style={{
              width: "64px",
              height: "64px",
              margin: "0 auto 12px",
              background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
            }}>
              📷
            </div>
            <p style={{ fontSize: "15px", fontWeight: "600", color: "#374151", margin: 0 }}>
              Take a Photo
            </p>
            <p style={{ fontSize: "13px", color: "#6b7280", margin: "4px 0 0 0" }}>
              Capture the current state of the machine
            </p>
          </div>
          
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={startCamera}
              style={{
                flex: 1,
                padding: "14px 20px",
                background: `linear-gradient(135deg, ${BRAND_BLUE} 0%, #003d75 100%)`,
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontWeight: "600",
                fontSize: "14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: "0 4px 12px rgba(0, 87, 168, 0.25)",
                transition: "transform 0.15s, box-shadow 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 16px rgba(0, 87, 168, 0.35)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 87, 168, 0.25)";
              }}
            >
              <svg style={{ width: "20px", height: "20px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Open Camera
            </button>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: "14px 20px",
                background: "white",
                color: "#374151",
                border: "2px solid #e2e8f0",
                borderRadius: "12px",
                fontWeight: "500",
                fontSize: "14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "border-color 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#cbd5e1"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; }}
            >
              <svg style={{ width: "20px", height: "20px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Upload
            </button>
          </div>
        </div>
      )}

      {/* Camera View */}
      {mode === "camera" && (
        <div style={{
          position: "relative",
          borderRadius: "16px",
          overflow: "hidden",
          background: "#000",
        }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: "100%",
              maxHeight: "400px",
              objectFit: "cover",
              transform: facingMode === "user" ? "scaleX(-1)" : "none",
            }}
          />
          
          {/* Camera controls overlay */}
          <div style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "20px",
            background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
          }}>
            {/* Cancel button */}
            <button
              onClick={cancelCamera}
              style={{
                width: "48px",
                height: "48px",
                background: "rgba(255,255,255,0.2)",
                border: "none",
                borderRadius: "50%",
                color: "white",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg style={{ width: "24px", height: "24px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Capture button */}
            <button
              onClick={capturePhoto}
              style={{
                width: "72px",
                height: "72px",
                background: "white",
                border: "4px solid rgba(255,255,255,0.5)",
                borderRadius: "50%",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "transform 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.1)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
            >
              <div style={{
                width: "56px",
                height: "56px",
                background: `linear-gradient(135deg, ${BRAND_BLUE} 0%, #003d75 100%)`,
                borderRadius: "50%",
              }} />
            </button>

            {/* Switch camera button */}
            {hasMultipleCameras && (
              <button
                onClick={switchCamera}
                style={{
                  width: "48px",
                  height: "48px",
                  background: "rgba(255,255,255,0.2)",
                  border: "none",
                  borderRadius: "50%",
                  color: "white",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg style={{ width: "24px", height: "24px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Preview captured image */}
      {mode === "preview" && capturedImage && (
        <div style={{
          borderRadius: "16px",
          overflow: "hidden",
          background: "#000",
        }}>
          <img
            src={capturedImage}
            alt="Captured"
            style={{
              width: "100%",
              maxHeight: "400px",
              objectFit: "contain",
            }}
          />
          
          {/* Preview controls */}
          <div style={{
            padding: "16px",
            background: "#111",
            display: "flex",
            gap: "12px",
          }}>
            <button
              onClick={retake}
              style={{
                flex: 1,
                padding: "14px",
                background: "rgba(255,255,255,0.1)",
                border: "none",
                borderRadius: "10px",
                color: "white",
                fontWeight: "500",
                fontSize: "14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <svg style={{ width: "18px", height: "18px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Retake
            </button>
            <button
              onClick={uploadImage}
              style={{
                flex: 2,
                padding: "14px",
                background: "#22c55e",
                border: "none",
                borderRadius: "10px",
                color: "white",
                fontWeight: "600",
                fontSize: "14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <svg style={{ width: "18px", height: "18px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Use This Photo
            </button>
          </div>
        </div>
      )}

      {/* Uploading state */}
      {mode === "uploading" && (
        <div style={{
          padding: "48px 24px",
          textAlign: "center",
          background: "white",
          borderRadius: "16px",
          border: "2px solid #e2e8f0",
        }}>
          <div style={{
            width: "56px",
            height: "56px",
            margin: "0 auto 16px",
            border: "4px solid #e2e8f0",
            borderTopColor: BRAND_BLUE,
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }} />
          <p style={{ fontSize: "15px", fontWeight: "600", color: "#374151", margin: 0 }}>
            Uploading photo...
          </p>
        </div>
      )}

      {/* Show captured/uploaded image */}
      {mode === "idle" && capturedImage && (
        <div style={{ position: "relative" }}>
          <img
            src={capturedImage}
            alt="Captured"
            style={{
              width: "100%",
              maxHeight: "300px",
              objectFit: "cover",
              borderRadius: "16px",
              border: "2px solid #22c55e",
            }}
          />
          <div style={{
            position: "absolute",
            top: "12px",
            left: "12px",
            padding: "6px 12px",
            background: "#22c55e",
            color: "white",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}>
            <svg style={{ width: "14px", height: "14px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Photo Added
          </div>
          <button
            onClick={removeImage}
            style={{
              position: "absolute",
              top: "12px",
              right: "12px",
              width: "36px",
              height: "36px",
              background: "#ef4444",
              border: "none",
              borderRadius: "50%",
              color: "white",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(239, 68, 68, 0.4)",
            }}
          >
            <svg style={{ width: "18px", height: "18px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {/* Retake option */}
          <button
            onClick={startCamera}
            style={{
              position: "absolute",
              bottom: "12px",
              right: "12px",
              padding: "8px 16px",
              background: "rgba(0,0,0,0.6)",
              border: "none",
              borderRadius: "8px",
              color: "white",
              fontSize: "13px",
              fontWeight: "500",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <svg style={{ width: "14px", height: "14px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            </svg>
            Retake
          </button>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div style={{
          marginTop: "12px",
          padding: "12px 16px",
          background: "#fef2f2",
          border: "1px solid #fecaca",
          borderRadius: "10px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}>
          <svg style={{ width: "18px", height: "18px", color: "#dc2626", flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p style={{ color: "#991b1b", margin: 0, fontSize: "13px" }}>{error}</p>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

