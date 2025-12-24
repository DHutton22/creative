"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const BRAND_BLUE = "#0057A8";
const BRAND_BLUE_DARK = "#003d75";

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      children,
      disabled,
      style,
      onMouseEnter,
      onMouseLeave,
      ...props
    },
    ref
  ) => {
    const baseStyles: React.CSSProperties = {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)",
      fontWeight: 500,
      borderRadius: "10px",
      border: "none",
      cursor: disabled || isLoading ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      transition: "transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.15s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.15s ease",
      width: fullWidth ? "100%" : "auto",
    };

    const variants: Record<string, React.CSSProperties> = {
      primary: {
        background: BRAND_BLUE,
        color: "white",
      },
      secondary: {
        background: "#f3f4f6",
        color: "#374151",
      },
      outline: {
        background: "transparent",
        color: "#374151",
        border: "2px solid #e2e8f0",
      },
      ghost: {
        background: "transparent",
        color: "#6b7280",
      },
      danger: {
        background: "#ef4444",
        color: "white",
      },
      success: {
        background: "#22c55e",
        color: "white",
      },
    };

    const sizes: Record<string, React.CSSProperties> = {
      sm: {
        padding: "8px 14px",
        fontSize: "13px",
        gap: "6px",
      },
      md: {
        padding: "10px 18px",
        fontSize: "14px",
        gap: "8px",
      },
      lg: {
        padding: "14px 24px",
        fontSize: "16px",
        gap: "10px",
      },
    };

    const hoverStyles: Record<string, { background?: string; boxShadow?: string; borderColor?: string }> = {
      primary: {
        background: BRAND_BLUE_DARK,
        boxShadow: "0 4px 12px rgba(0, 87, 168, 0.3)",
      },
      secondary: {
        background: "#e5e7eb",
      },
      outline: {
        borderColor: BRAND_BLUE,
        background: "#eff6ff",
      },
      ghost: {
        background: "#f3f4f6",
      },
      danger: {
        background: "#dc2626",
        boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
      },
      success: {
        background: "#16a34a",
        boxShadow: "0 4px 12px rgba(34, 197, 94, 0.3)",
      },
    };

    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || isLoading) return;
      
      const hover = hoverStyles[variant];
      if (hover.background) e.currentTarget.style.background = hover.background;
      if (hover.boxShadow) e.currentTarget.style.boxShadow = hover.boxShadow;
      if (hover.borderColor) e.currentTarget.style.borderColor = hover.borderColor;
      e.currentTarget.style.transform = "translateY(-1px)";
      
      onMouseEnter?.(e);
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || isLoading) return;
      
      const original = variants[variant];
      e.currentTarget.style.background = original.background || "transparent";
      e.currentTarget.style.boxShadow = "none";
      if (variant === "outline") {
        e.currentTarget.style.borderColor = "#e2e8f0";
      }
      e.currentTarget.style.transform = "translateY(0)";
      
      onMouseLeave?.(e);
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || isLoading) return;
      e.currentTarget.style.transform = "scale(0.98)";
    };

    const handleMouseUp = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || isLoading) return;
      e.currentTarget.style.transform = "translateY(-1px)";
    };

    return (
      <button
        ref={ref}
        className={cn("btn", `btn-${variant}`, `btn-${size}`, className)}
        style={{
          ...baseStyles,
          ...variants[variant],
          ...sizes[size],
          ...style,
        }}
        disabled={disabled || isLoading}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        {...props}
      >
        {isLoading ? (
          <Loader2 
            style={{ 
              width: size === "sm" ? "14px" : size === "lg" ? "20px" : "16px", 
              height: size === "sm" ? "14px" : size === "lg" ? "20px" : "16px",
              animation: "spin 1s linear infinite",
            }} 
          />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
