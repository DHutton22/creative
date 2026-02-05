"use client";

import Link from "next/link";
import { Lightbulb } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  tip?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  variant?: "default" | "compact";
}

const BRAND_BLUE = "#0057A8";

export function EmptyState({
  icon,
  title,
  description,
  tip,
  action,
  secondaryAction,
  variant = "default",
}: EmptyStateProps) {
  const isCompact = variant === "compact";

  const ActionButton = ({ action: a, primary }: { action: NonNullable<EmptyStateProps["action"]>; primary?: boolean }) => {
    const style: React.CSSProperties = primary
      ? {
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "12px 24px",
          background: BRAND_BLUE,
          color: "white",
          borderRadius: "10px",
          fontWeight: 600,
          fontSize: "14px",
          textDecoration: "none",
          border: "none",
          cursor: "pointer",
          transition: "transform 0.15s, box-shadow 0.15s",
        }
      : {
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "12px 24px",
          background: "white",
          color: "#374151",
          border: "2px solid #e2e8f0",
          borderRadius: "10px",
          fontWeight: 500,
          fontSize: "14px",
          textDecoration: "none",
          cursor: "pointer",
          transition: "border-color 0.15s, background 0.15s",
        };

    if (a.href) {
      return (
        <Link
          href={a.href}
          style={style}
          onMouseEnter={(e) => {
            if (primary) {
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 87, 168, 0.3)";
              e.currentTarget.style.transform = "translateY(-1px)";
            } else {
              e.currentTarget.style.borderColor = BRAND_BLUE;
              e.currentTarget.style.background = "#eff6ff";
            }
          }}
          onMouseLeave={(e) => {
            if (primary) {
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.transform = "translateY(0)";
            } else {
              e.currentTarget.style.borderColor = "#e2e8f0";
              e.currentTarget.style.background = "white";
            }
          }}
        >
          {a.label}
        </Link>
      );
    }

    return (
      <button
        onClick={a.onClick}
        style={style}
        onMouseEnter={(e) => {
          if (primary) {
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 87, 168, 0.3)";
            e.currentTarget.style.transform = "translateY(-1px)";
          } else {
            e.currentTarget.style.borderColor = BRAND_BLUE;
            e.currentTarget.style.background = "#eff6ff";
          }
        }}
        onMouseLeave={(e) => {
          if (primary) {
            e.currentTarget.style.boxShadow = "none";
            e.currentTarget.style.transform = "translateY(0)";
          } else {
            e.currentTarget.style.borderColor = "#e2e8f0";
            e.currentTarget.style.background = "white";
          }
        }}
      >
        {a.label}
      </button>
    );
  };

  return (
    <div
      className="empty-state"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: isCompact ? "32px 20px" : "48px 24px",
        animation: "fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {/* Icon with bounce animation */}
      {icon && (
        <div
          style={{
            marginBottom: isCompact ? "16px" : "20px",
            color: "#d1d5db",
            animation: "bounce 1s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s backwards",
          }}
        >
          {icon}
        </div>
      )}

      {/* Default icon if none provided */}
      {!icon && (
        <div
          style={{
            width: isCompact ? "48px" : "64px",
            height: isCompact ? "48px" : "64px",
            marginBottom: isCompact ? "16px" : "20px",
            background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
            borderRadius: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "bounce 1s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s backwards",
          }}
        >
          <svg
            style={{
              width: isCompact ? "24px" : "32px",
              height: isCompact ? "24px" : "32px",
              color: "#9ca3af",
            }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>
        </div>
      )}

      {/* Title */}
      <h3
        style={{
          fontFamily: "var(--font-display, 'DM Sans', sans-serif)",
          fontSize: isCompact ? "16px" : "18px",
          fontWeight: 600,
          color: "#111827",
          marginBottom: "8px",
        }}
      >
        {title}
      </h3>

      {/* Description */}
      <p
        style={{
          fontSize: isCompact ? "13px" : "14px",
          color: "#6b7280",
          maxWidth: "360px",
          marginBottom: tip || action ? "20px" : 0,
          lineHeight: 1.5,
        }}
      >
        {description}
      </p>

      {/* Pro Tip */}
      {tip && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
            padding: "12px 16px",
            background: "#fffbeb",
            border: "1px solid #fef3c7",
            borderRadius: "10px",
            fontSize: "13px",
            color: "#92400e",
            marginBottom: action ? "24px" : 0,
            textAlign: "left",
            maxWidth: "380px",
            animation: "fadeIn 0.3s ease-out 0.2s backwards",
          }}
        >
          <Lightbulb
            style={{
              width: "18px",
              height: "18px",
              flexShrink: 0,
              color: "#d97706",
              marginTop: "1px",
            }}
          />
          <span>{tip}</span>
        </div>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            justifyContent: "center",
            animation: "fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.15s backwards",
          }}
        >
          {action && <ActionButton action={action} primary />}
          {secondaryAction && <ActionButton action={secondaryAction} />}
        </div>
      )}
    </div>
  );
}






