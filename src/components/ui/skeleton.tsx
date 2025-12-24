"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: "text" | "heading" | "avatar" | "card" | "button" | "default";
  rounded?: "sm" | "md" | "lg" | "xl" | "full";
}

export function Skeleton({
  className,
  width,
  height,
  variant = "default",
  rounded = "md",
}: SkeletonProps) {
  const variantStyles = {
    text: "h-4",
    heading: "h-6",
    avatar: "rounded-full aspect-square",
    card: "rounded-xl",
    button: "h-10",
    default: "",
  };

  const roundedStyles = {
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    full: "rounded-full",
  };

  return (
    <div
      className={cn("skeleton", variantStyles[variant], roundedStyles[rounded], className)}
      style={{
        width: width ?? "100%",
        height: height,
        background: "linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s ease-in-out infinite",
      }}
    />
  );
}

// Skeleton presets for common use cases
export function SkeletonCard() {
  return (
    <div
      className="card"
      style={{
        padding: "24px",
        background: "white",
        borderRadius: "16px",
        border: "1px solid #e2e8f0",
      }}
    >
      <Skeleton height={20} width="70%" className="mb-3" />
      <Skeleton height={14} width="50%" className="mb-4" />
      <Skeleton height={36} rounded="lg" />
    </div>
  );
}

export function SkeletonListItem() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "16px",
        background: "white",
        borderRadius: "12px",
        border: "1px solid #e2e8f0",
      }}
    >
      <Skeleton variant="avatar" width={48} height={48} />
      <div style={{ flex: 1 }}>
        <Skeleton height={16} width="60%" className="mb-2" />
        <Skeleton height={12} width="40%" />
      </div>
      <Skeleton height={28} width={80} rounded="full" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
            {[1, 2, 3, 4].map((i) => (
              <th key={i} style={{ padding: "12px 16px", textAlign: "left" }}>
                <Skeleton height={12} width="60%" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} style={{ borderBottom: "1px solid #e2e8f0" }}>
              {[1, 2, 3, 4].map((j) => (
                <td key={j} style={{ padding: "14px 16px" }}>
                  <Skeleton height={14} width={j === 1 ? "80%" : "60%"} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SkeletonStats({ count = 4 }: { count?: number }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(auto-fit, minmax(180px, 1fr))`,
        gap: "16px",
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="card"
          style={{
            padding: "20px",
            background: "white",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
          }}
        >
          <Skeleton height={12} width="50%" className="mb-2" />
          <Skeleton height={28} width="40%" />
        </div>
      ))}
    </div>
  );
}

