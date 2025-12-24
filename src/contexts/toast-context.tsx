"use client";

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
  isExiting?: boolean;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, "id">) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const toastColors = {
  success: {
    icon: "#16a34a",
    bg: "#f0fdf4",
    border: "#22c55e",
  },
  error: {
    icon: "#dc2626",
    bg: "#fef2f2",
    border: "#ef4444",
  },
  warning: {
    icon: "#d97706",
    bg: "#fffbeb",
    border: "#f59e0b",
  },
  info: {
    icon: "#0057A8",
    bg: "#eff6ff",
    border: "#0057A8",
  },
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const Icon = toastIcons[toast.type];
  const colors = toastColors[toast.type];

  return (
    <div
      className={toast.isExiting ? "toast-exiting" : ""}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        padding: "16px",
        background: "white",
        borderRadius: "12px",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.03)",
        border: "1px solid #e2e8f0",
        borderLeft: `4px solid ${colors.border}`,
        pointerEvents: "all",
        animation: toast.isExiting 
          ? "toastSlideOut 0.25s ease-in-out forwards" 
          : "toastSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        minWidth: "320px",
        maxWidth: "100%",
      }}
    >
      <div
        style={{
          width: "24px",
          height: "24px",
          borderRadius: "50%",
          background: colors.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon style={{ width: "14px", height: "14px", color: colors.icon }} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: "14px",
            color: "#111827",
            margin: 0,
            marginBottom: toast.description ? "4px" : 0,
          }}
        >
          {toast.title}
        </p>
        {toast.description && (
          <p
            style={{
              fontSize: "13px",
              color: "#6b7280",
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            {toast.description}
          </p>
        )}
      </div>

      <button
        onClick={onDismiss}
        style={{
          padding: "4px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: "#9ca3af",
          borderRadius: "4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "color 0.15s, background 0.15s",
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#f3f4f6";
          e.currentTarget.style.color = "#374151";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "#9ca3af";
        }}
        aria-label="Dismiss"
      >
        <X style={{ width: "16px", height: "16px" }} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const dismissToast = useCallback((id: string) => {
    // First mark as exiting for animation
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isExiting: true } : t))
    );

    // Then remove after animation
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 250);

    // Clear any existing timer
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const showToast = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const duration = toast.duration ?? 5000;

      setToasts((prev) => [...prev, { ...toast, id }]);

      if (duration > 0) {
        const timer = setTimeout(() => {
          dismissToast(id);
        }, duration);
        timersRef.current.set(id, timer);
      }
    },
    [dismissToast]
  );

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}

      {/* Toast Container */}
      <div
        className="toast-container"
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          maxWidth: "400px",
          pointerEvents: "none",
        }}
      >
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onDismiss={() => dismissToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

