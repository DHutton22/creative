"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ChecklistFrequency } from "@/types/database";

interface ChecklistStatus {
  id: string;
  template_id: string;
  template_name: string;
  machine_name: string | null;
  frequency: ChecklistFrequency | null;
  status: "in_progress" | "completed" | "aborted";
  due_date: string | null;
  started_at: string;
  completed_at: string | null;
  compliance_status: "on_time" | "due_soon" | "overdue" | "completed";
  days_overdue: number;
}

interface TrafficLightDashboardProps {
  dueSoonThreshold?: number;
}

const BRAND_BLUE = "#0057A8";

const frequencyLabels: Record<ChecklistFrequency, string> = {
  once: "Once",
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  annually: "Annually",
};

export function TrafficLightDashboard({ dueSoonThreshold = 3 }: TrafficLightDashboardProps) {
  const [checklists, setChecklists] = useState<ChecklistStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "on_time" | "due_soon" | "overdue">("all");

  useEffect(() => {
    fetchChecklists();
  }, []);

  const fetchChecklists = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/checklist-status");
      const data = await response.json();
      if (data.checklists) {
        setChecklists(data.checklists);
      }
    } catch (error) {
      console.error("Error fetching checklist status:", error);
    }
    setIsLoading(false);
  };

  const getStatusColor = (compliance: string) => {
    switch (compliance) {
      case "on_time":
      case "completed":
        return { bg: "#dcfce7", border: "#22c55e", text: "#166534", light: "🟢" };
      case "due_soon":
        return { bg: "#fef3c7", border: "#f59e0b", text: "#92400e", light: "🟡" };
      case "overdue":
        return { bg: "#fee2e2", border: "#ef4444", text: "#991b1b", light: "🔴" };
      default:
        return { bg: "#f3f4f6", border: "#9ca3af", text: "#374151", light: "⚪" };
    }
  };

  const getDaysText = (days: number, due_date: string | null) => {
    if (!due_date) return "No due date";
    
    const now = new Date();
    const dueDate = new Date(due_date);
    const diff = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diff > 0) {
      return `Due in ${diff} day${diff !== 1 ? "s" : ""}`;
    } else if (diff === 0) {
      return "Due today";
    } else {
      return `${Math.abs(diff)} day${diff !== -1 ? "s" : ""} overdue`;
    }
  };

  const filteredChecklists = checklists.filter((c) => {
    if (filter === "all") return c.status === "in_progress";
    return c.compliance_status === filter && c.status === "in_progress";
  });

  const stats = {
    onTime: checklists.filter((c) => c.compliance_status === "on_time" && c.status === "in_progress").length,
    dueSoon: checklists.filter((c) => c.compliance_status === "due_soon" && c.status === "in_progress").length,
    overdue: checklists.filter((c) => c.compliance_status === "overdue" && c.status === "in_progress").length,
  };

  if (isLoading) {
    return (
      <div>
        {/* Stats Skeleton */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
          gap: "16px", 
          marginBottom: "24px",
        }}>
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              style={{ 
                background: "white", 
                borderRadius: "16px", 
                padding: "24px", 
                border: "2px solid #e2e8f0",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                <div style={{ 
                  width: "40px", 
                  height: "40px", 
                  borderRadius: "50%",
                  background: "linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.5s ease-in-out infinite",
                }} />
                <div style={{ 
                  width: "48px", 
                  height: "40px", 
                  borderRadius: "8px",
                  background: "linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.5s ease-in-out infinite",
                }} />
              </div>
              <div style={{ 
                width: "60%", 
                height: "14px", 
                borderRadius: "4px",
                background: "linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.5s ease-in-out infinite",
                marginBottom: "8px",
              }} />
              <div style={{ 
                width: "40%", 
                height: "12px", 
                borderRadius: "4px",
                background: "linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.5s ease-in-out infinite",
              }} />
            </div>
          ))}
        </div>
        
        {/* List Skeleton */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[1, 2, 3].map((i) => (
            <div 
              key={i}
              style={{
                background: "white",
                borderRadius: "16px",
                padding: "20px",
                border: "2px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <div style={{ 
                width: "56px", 
                height: "56px", 
                borderRadius: "50%",
                background: "linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.5s ease-in-out infinite",
                flexShrink: 0,
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ 
                  width: "60%", 
                  height: "16px", 
                  borderRadius: "4px",
                  background: "linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.5s ease-in-out infinite",
                  marginBottom: "8px",
                }} />
                <div style={{ 
                  width: "40%", 
                  height: "12px", 
                  borderRadius: "4px",
                  background: "linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.5s ease-in-out infinite",
                }} />
              </div>
              <div style={{ 
                width: "100px", 
                height: "32px", 
                borderRadius: "9999px",
                background: "linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.5s ease-in-out infinite",
              }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Traffic Light Stats */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
        gap: "16px", 
        marginBottom: "24px",
      }}>
        {[
          { key: "on_time", emoji: "🟢", count: stats.onTime, label: "On Time", sublabel: "Ahead of schedule", borderColor: "#22c55e", textColor: "#166534" },
          { key: "due_soon", emoji: "🟡", count: stats.dueSoon, label: "Due Soon", sublabel: `Within ${dueSoonThreshold} days`, borderColor: "#f59e0b", textColor: "#92400e" },
          { key: "overdue", emoji: "🔴", count: stats.overdue, label: "Overdue", sublabel: "Past due date", borderColor: "#ef4444", textColor: "#991b1b" },
        ].map((stat, index) => (
          <div
            key={stat.key}
            onClick={() => setFilter(filter === stat.key as any ? "all" : stat.key as any)}
            className="traffic-card"
            style={{
              background: filter === stat.key ? `linear-gradient(135deg, ${stat.borderColor}10 0%, ${stat.borderColor}20 100%)` : "white",
              borderRadius: "16px",
              padding: "24px",
              border: `2px solid ${stat.borderColor}`,
              cursor: "pointer",
              transition: "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
              animation: `fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${index * 50}ms backwards`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.boxShadow = `0 8px 24px ${stat.borderColor}30`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <span 
                className="traffic-light"
                style={{ 
                  fontSize: "36px", 
                  lineHeight: 1,
                  transition: "transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                {stat.emoji}
              </span>
              <span 
                style={{ 
                  fontFamily: 'var(--font-display, "DM Sans", sans-serif)',
                  fontSize: "36px", 
                  fontWeight: "bold", 
                  color: stat.borderColor,
                  letterSpacing: "-0.02em",
                }}
              >
                {stat.count}
              </span>
            </div>
            <p style={{ 
              margin: 0, 
              fontSize: "15px", 
              fontWeight: "700", 
              color: stat.textColor,
              fontFamily: 'var(--font-body, "Plus Jakarta Sans", sans-serif)',
            }}>
              {stat.label}
            </p>
            <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#6b7280", fontWeight: 500 }}>
              {stat.sublabel}
            </p>
          </div>
        ))}
      </div>

      {/* Filter Info */}
      {filter !== "all" && (
        <div 
          style={{ 
            marginBottom: "16px", 
            padding: "14px 18px", 
            background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)", 
            borderRadius: "12px", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between",
            animation: "fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <span style={{ fontSize: "14px", color: "#1e40af", fontWeight: 500 }}>
            Showing <strong>{filter.replace("_", " ")}</strong> checklists only
          </span>
          <button
            onClick={() => setFilter("all")}
            style={{ 
              padding: "8px 16px", 
              background: "white", 
              border: "1px solid #bfdbfe", 
              borderRadius: "8px", 
              fontSize: "13px", 
              cursor: "pointer", 
              color: "#1e40af",
              fontWeight: 600,
              transition: "background 0.15s, border-color 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#dbeafe";
              e.currentTarget.style.borderColor = "#93c5fd";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "white";
              e.currentTarget.style.borderColor = "#bfdbfe";
            }}
          >
            Show All
          </button>
        </div>
      )}

      {/* Checklist List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {filteredChecklists.length === 0 ? (
          <div 
            className="empty-state"
            style={{ 
              padding: "56px 24px", 
              textAlign: "center", 
              background: "white", 
              borderRadius: "16px", 
              border: "2px dashed #e2e8f0",
              animation: "fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <div style={{
              width: "64px",
              height: "64px",
              margin: "0 auto 20px",
              background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: "bounce 1s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s backwards",
            }}>
              <svg style={{ width: "32px", height: "32px", color: "#9ca3af" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 style={{ 
              fontFamily: 'var(--font-display, "DM Sans", sans-serif)',
              fontSize: "18px", 
              fontWeight: "600", 
              color: "#111827", 
              margin: 0,
              marginBottom: "8px",
            }}>
              {filter === "all" 
                ? "No in-progress checklists"
                : `No ${filter.replace("_", " ")} checklists`}
            </h3>
            <p style={{ fontSize: "14px", color: "#6b7280", margin: "0 0 24px 0" }}>
              {filter === "all" 
                ? "Start a new checklist to track your machine compliance"
                : "All clear in this category!"}
            </p>
            <Link
              href="/checklists/new"
              style={{ 
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 24px", 
                background: `linear-gradient(135deg, ${BRAND_BLUE} 0%, #003d75 100%)`, 
                color: "white", 
                borderRadius: "12px", 
                textDecoration: "none", 
                fontWeight: "600",
                fontSize: "14px",
                boxShadow: "0 4px 14px rgba(0, 87, 168, 0.25)",
                transition: "transform 0.15s, box-shadow 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(0, 87, 168, 0.35)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 14px rgba(0, 87, 168, 0.25)";
              }}
            >
              <svg style={{ width: "18px", height: "18px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Start a Checklist
            </Link>
          </div>
        ) : (
          filteredChecklists.map((checklist, index) => {
            const colors = getStatusColor(checklist.compliance_status);
            return (
              <Link
                key={checklist.id}
                href={`/checklists/${checklist.id}/run`}
                style={{
                  display: "block",
                  background: "white",
                  borderRadius: "16px",
                  border: `2px solid ${colors.border}`,
                  padding: "20px",
                  textDecoration: "none",
                  transition: "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                  animation: `fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${(index + 3) * 50}ms backwards`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = `0 8px 24px ${colors.border}30`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                  {/* Traffic Light */}
                  <div 
                    className="traffic-light"
                    style={{ 
                      fontSize: "52px", 
                      flexShrink: 0, 
                      lineHeight: 1,
                      transition: "transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                  >
                    {colors.light}
                  </div>

                  {/* Checklist Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ 
                      fontFamily: 'var(--font-display, "DM Sans", sans-serif)',
                      fontSize: "17px", 
                      fontWeight: "600", 
                      color: "#111827", 
                      margin: 0, 
                      marginBottom: "6px",
                    }}>
                      {checklist.template_name}
                    </h3>
                    <p style={{ fontSize: "14px", color: "#6b7280", margin: 0, display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <svg style={{ width: "14px", height: "14px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                        </svg>
                        {checklist.machine_name || "No machine"}
                      </span>
                      {checklist.frequency && (
                        <>
                          <span style={{ color: "#d1d5db" }}>•</span>
                          <span>{frequencyLabels[checklist.frequency]}</span>
                        </>
                      )}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div
                      style={{
                        padding: "8px 18px",
                        borderRadius: "9999px",
                        background: `linear-gradient(135deg, ${colors.bg} 0%, ${colors.border}20 100%)`,
                        border: `1px solid ${colors.border}`,
                        marginBottom: "8px",
                      }}
                    >
                      <span style={{ fontSize: "13px", fontWeight: "700", color: colors.text }}>
                        {getDaysText(checklist.days_overdue, checklist.due_date)}
                      </span>
                    </div>
                    {checklist.due_date && (
                      <p style={{ fontSize: "11px", color: "#9ca3af", margin: 0, fontWeight: 500 }}>
                        Due: {new Date(checklist.due_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {/* Arrow */}
                  <svg 
                    style={{ 
                      width: "20px", 
                      height: "20px", 
                      color: "#9ca3af",
                      flexShrink: 0,
                      transition: "transform 0.15s, color 0.15s",
                    }} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor" 
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}

