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

interface CameraDevice {
  deviceId: string;
  label: string;
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
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const [showCameraSelect, setShowCameraSelect] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const supabase = createClient();

  // Get list of available cameras
  const loadCameras = useCallback(async () => {
    try {
      // Need to request permission first to get device labels
      const tempStream = await navigator.mediaDevices.getUserMedia({ video: true });
      tempStream.getTracks().forEach(track => track.stop());
      
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices
        .filter(d => d.kind === "videoinput")
        .map((d, index) => ({
          deviceId: d.deviceId,
          label: d.label || `Camera ${index + 1}`,
        }));
      
      setCameras(videoDevices);
      
      // Set default camera (prefer back camera on mobile)
      if (videoDevices.length > 0 && !selectedCameraId) {
        const backCamera = videoDevices.find(c => 
          c.label.toLowerCase().includes("back") || 
          c.label.toLowerCase().includes("rear") ||
          c.label.toLowerCase().includes("environment")
        );
        setSelectedCameraId(backCamera?.deviceId || videoDevices[0].deviceId);
      }
    } catch (err) {
      console.error("Error loading cameras:", err);
    }
  }, [selectedCameraId]);

  // Load cameras on mount
  useEffect(() => {
    loadCameras();
  }, [loadCameras]);

  // Start camera stream with selected device
  const startCamera = useCallback(async (deviceId?: string) => {
    setError(null);
    setMode("camera");
    
    try {
      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: deviceId 
          ? { deviceId: { exact: deviceId }, width: { ideal: 1920 }, height: { ideal: 1080 } }
          : { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      // Update selected camera from stream
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const settings = videoTrack.getSettings();
        if (settings.deviceId) {
          setSelectedCameraId(settings.deviceId);
        }
      }
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      // Refresh camera list (labels may now be available)
      loadCameras();
    } catch (err) {
      console.error("Camera error:", err);
      setError("Could not access camera. Please check permissions or use file upload.");
      setMode("idle");
    }
  }, [loadCameras]);

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

  // Switch to a different camera
  const switchCamera = (deviceId: string) => {
    setSelectedCameraId(deviceId);
    setShowCameraSelect(false);
    if (mode === "camera") {
      stopCamera();
      setTimeout(() => startCamera(deviceId), 100);
    }
  };

  // Capture photo
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0);
    
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
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      
      const fileSizeMB = blob.size / (1024 * 1024);
      if (fileSizeMB > maxSizeMB) {
        setError(`Image too large. Max size is ${maxSizeMB}MB`);
        setMode("preview");
        return;
      }

      const fileName = `${path}/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;

      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, blob, {
          contentType: "image/jpeg",
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
    startCamera(selectedCameraId);
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

  // Get current camera name
  const currentCameraName = cameras.find(c => c.deviceId === selectedCameraId)?.label || "Camera";

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

          {/* Camera selector - always show if cameras available */}
          {cameras.length > 1 && (
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#374151", marginBottom: "6px" }}>
                Select Camera
              </label>
              <select
                value={selectedCameraId}
                onChange={(e) => setSelectedCameraId(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "2px solid #e2e8f0",
                  borderRadius: "10px",
                  fontSize: "14px",
                  background: "white",
                  cursor: "pointer",
                }}
              >
                {cameras.map((camera) => (
                  <option key={camera.deviceId} value={camera.deviceId}>
                    {camera.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={() => startCamera(selectedCameraId)}
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
            }}
          />
          
          {/* Current camera indicator */}
          <div style={{
            position: "absolute",
            top: "12px",
            left: "12px",
            padding: "6px 12px",
            background: "rgba(0,0,0,0.6)",
            borderRadius: "8px",
            color: "white",
            fontSize: "12px",
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}>
            <div style={{ width: "8px", height: "8px", background: "#22c55e", borderRadius: "50%" }} />
            {currentCameraName}
          </div>

          {/* Camera selector dropdown (if multiple cameras) */}
          {cameras.length > 1 && (
            <div style={{
              position: "absolute",
              top: "12px",
              right: "12px",
            }}>
              <button
                onClick={() => setShowCameraSelect(!showCameraSelect)}
                style={{
                  padding: "8px 12px",
                  background: "rgba(255,255,255,0.2)",
                  border: "none",
                  borderRadius: "8px",
                  color: "white",
                  fontSize: "12px",
                  fontWeight: "500",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <svg style={{ width: "16px", height: "16px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Switch
              </button>
              
              {showCameraSelect && (
                <div style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  marginTop: "8px",
                  background: "white",
                  borderRadius: "10px",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
                  overflow: "hidden",
                  minWidth: "200px",
                  zIndex: 10,
                }}>
                  {cameras.map((camera) => (
                    <button
                      key={camera.deviceId}
                      onClick={() => switchCamera(camera.deviceId)}
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        border: "none",
                        background: camera.deviceId === selectedCameraId ? "#eff6ff" : "white",
                        color: camera.deviceId === selectedCameraId ? BRAND_BLUE : "#374151",
                        fontWeight: camera.deviceId === selectedCameraId ? "600" : "400",
                        fontSize: "13px",
                        cursor: "pointer",
                        textAlign: "left",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        borderBottom: "1px solid #f1f5f9",
                      }}
                    >
                      {camera.deviceId === selectedCameraId && (
                        <svg style={{ width: "16px", height: "16px", color: "#22c55e" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {camera.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          
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

            {/* Placeholder for symmetry */}
            <div style={{ width: "48px", height: "48px" }} />
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
        <div>
          {/* Image preview */}
          <div style={{ position: "relative", marginBottom: "12px" }}>
            <img
              src={capturedImage}
              alt="Captured"
              style={{
                width: "100%",
                maxHeight: "280px",
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
          </div>
          
          {/* Action buttons */}
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => {
                setCapturedImage(null);
                onCapture("");
                startCamera(selectedCameraId);
              }}
              style={{
                flex: 1,
                padding: "12px 16px",
                background: `linear-gradient(135deg, ${BRAND_BLUE} 0%, #003d75 100%)`,
                border: "none",
                borderRadius: "10px",
                color: "white",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: "0 4px 12px rgba(0, 87, 168, 0.25)",
              }}
            >
              <svg style={{ width: "18px", height: "18px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Change Photo
            </button>
            <button
              onClick={removeImage}
              style={{
                padding: "12px 16px",
                background: "white",
                border: "2px solid #fee2e2",
                borderRadius: "10px",
                color: "#dc2626",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              <svg style={{ width: "18px", height: "18px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Remove
            </button>
          </div>
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
