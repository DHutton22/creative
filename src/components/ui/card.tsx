"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "bordered" | "elevated" | "glass" | "interactive";
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  animate?: boolean;
  delay?: number;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", padding = "md", animate = false, delay = 0, style, children, ...props }, ref) => {
    const baseStyles: React.CSSProperties = {
      background: "var(--surface-primary, white)",
      borderRadius: "var(--radius-xl, 16px)",
      transition: "box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
    };

    const variants: Record<string, React.CSSProperties> = {
      default: {
        border: "1px solid var(--border-light, #e2e8f0)",
        boxShadow: "var(--shadow-card, 0 0 0 1px rgba(0, 0, 0, 0.02), 0 2px 8px -2px rgba(0, 0, 0, 0.08), 0 8px 24px -4px rgba(0, 0, 0, 0.06))",
      },
      bordered: {
        border: "2px solid var(--border-light, #e2e8f0)",
        boxShadow: "none",
      },
      elevated: {
        border: "1px solid var(--border-light, #e2e8f0)",
        boxShadow: "var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04))",
      },
      glass: {
        background: "var(--surface-glass, rgba(255, 255, 255, 0.85))",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.3)",
        boxShadow: "var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.07))",
      },
      interactive: {
        border: "1px solid var(--border-light, #e2e8f0)",
        boxShadow: "var(--shadow-card, 0 0 0 1px rgba(0, 0, 0, 0.02), 0 2px 8px -2px rgba(0, 0, 0, 0.08), 0 8px 24px -4px rgba(0, 0, 0, 0.06))",
        cursor: "pointer",
      },
    };

    const paddings: Record<string, React.CSSProperties> = {
      none: {},
      sm: { padding: "12px" },
      md: { padding: "20px" },
      lg: { padding: "28px" },
      xl: { padding: "36px" },
    };

    const animationStyles: React.CSSProperties = animate
      ? {
          animation: `fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms backwards`,
        }
      : {};

    const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
      if (variant === "interactive") {
        e.currentTarget.style.boxShadow = "var(--shadow-card-hover, 0 0 0 1px rgba(0, 0, 0, 0.02), 0 4px 12px -2px rgba(0, 0, 0, 0.12), 0 12px 32px -4px rgba(0, 0, 0, 0.1))";
        e.currentTarget.style.transform = "translateY(-2px)";
      }
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
      if (variant === "interactive") {
        e.currentTarget.style.boxShadow = variants.interactive.boxShadow as string;
        e.currentTarget.style.transform = "translateY(0)";
      }
    };

    return (
      <div
        ref={ref}
        className={cn("card", className)}
        style={{
          ...baseStyles,
          ...variants[variant],
          ...paddings[padding],
          ...animationStyles,
          ...style,
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, style, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("card-header", className)}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        marginBottom: "16px",
        ...style,
      }}
      {...props}
    />
  )
);
CardHeader.displayName = "CardHeader";

const CardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, style, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("card-title", className)}
      style={{
        fontFamily: "var(--font-display, 'DM Sans', sans-serif)",
        fontSize: "18px",
        fontWeight: 600,
        color: "var(--gray-900, #111827)",
        margin: 0,
        lineHeight: 1.3,
        ...style,
      }}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

const CardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, style, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("card-description", className)}
      style={{
        fontSize: "14px",
        color: "var(--gray-500, #6b7280)",
        margin: 0,
        lineHeight: 1.5,
        ...style,
      }}
      {...props}
    />
  )
);
CardDescription.displayName = "CardDescription";

const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("card-content", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, style, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("card-footer", className)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        paddingTop: "16px",
        marginTop: "16px",
        borderTop: "1px solid var(--border-light, #e2e8f0)",
        ...style,
      }}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
