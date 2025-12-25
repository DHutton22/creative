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
  compliance_status: "on_time" | "due_soon" | "overdue" | "completed" | "in_progress";
  days_overdue: number;
  is_scheduled: boolean;
}

interface TrafficLightDashboardProps {
  dueSoonThreshold?: number;
}

const BRAND_BLUE = "#0057A8";

const frequencyLabels: Record<ChecklistFrequency, string> = {
  once: "No Schedule",
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  annually: "Annually",
};

export function TrafficLightDashboard({ dueSoonThreshold = 3 }: TrafficLightDashboardProps) {
  const [checklists, setChecklists] = useState<ChecklistStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "scheduled" | "no_schedule">("all");

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

  const getStatusDisplay = (checklist: ChecklistStatus) => {
    if (!checklist.is_scheduled) {
      // No schedule - just show as in progress (neutral blue)
      return { bg: "#dbeafe", border: "#3b82f6", text: "#1e40af", light: "🔵", label: "In Progress" };
    }
    
    // Scheduled checklists get traffic light treatment
    switch (checklist.compliance_status) {
      case "on_time":
        return { bg: "#dcfce7", border: "#22c55e", text: "#166534", light: "🟢", label: "On Time" };
      case "due_soon":
        return { bg: "#fef3c7", border: "#f59e0b", text: "#92400e", light: "🟡", label: "Due Soon" };
      case "overdue":
        return { bg: "#fee2e2", border: "#ef4444", text: "#991b1b", light: "🔴", label: "Overdue" };
      case "completed":
        return { bg: "#dcfce7", border: "#22c55e", text: "#166534", light: "✅", label: "Completed" };
      default:
        return { bg: "#f3f4f6", border: "#9ca3af", text: "#374151", light: "⚪", label: "Unknown" };
    }
  };

  const getStatusText = (checklist: ChecklistStatus) => {
    if (!checklist.is_scheduled) {
      return "No schedule";
    }
    
    if (!checklist.due_date) return "No due date";
    
    const now = new Date();
    const dueDate = new Date(checklist.due_date);
    const diff = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diff > 0) {
      return `Due in ${diff} day${diff !== 1 ? "s" : ""}`;
    } else if (diff === 0) {
      return "Due today";
    } else {
      return `${Math.abs(diff)} day${diff !== -1 ? "s" : ""} overdue`;
    }
  };

  // Filter checklists
  const inProgressChecklists = checklists.filter(c => c.status === "in_progress");
  
  const filteredChecklists = inProgressChecklists.filter((c) => {
    if (filter === "all") return true;
    if (filter === "scheduled") return c.is_scheduled;
    if (filter === "no_schedule") return !c.is_scheduled;
    return true;
  });

  // Stats
  const scheduledChecklists = inProgressChecklists.filter(c => c.is_scheduled);
  const noScheduleChecklists = inProgressChecklists.filter(c => !c.is_scheduled);
  
  const stats = {
    // Scheduled traffic lights
    onTime: scheduledChecklists.filter(c => c.compliance_status === "on_time").length,
    dueSoon: scheduledChecklists.filter(c => c.compliance_status === "due_soon").length,
    overdue: scheduledChecklists.filter(c => c.compliance_status === "overdue").length,
    // No schedule
    noSchedule: noScheduleChecklists.length,
  };

  if (isLoading) {
    return (
      <div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "24px" }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ background: "white", borderRadius: "16px", padding: "24px", border: "2px solid #e2e8f0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s ease-in-out infinite" }} />
                <div style={{ width: "48px", height: "40px", borderRadius: "8px", background: "linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s ease-in-out infinite" }} />
              </div>
              <div style={{ width: "60%", height: "14px", borderRadius: "4px", background: "linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s ease-in-out infinite" }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Traffic Light Stats - Only for SCHEDULED checklists */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        {/* On Time */}
        <div
          onClick={() => setFilter(filter === "scheduled" ? "all" : "scheduled")}
          style={{
            background: filter === "scheduled" ? "linear-gradient(135deg, #dcfce720 0%, #22c55e20 100%)" : "white",
            borderRadius: "16px",
            padding: "24px",
            border: "2px solid #22c55e",
            cursor: "pointer",
            transition: "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s",
            animation: "fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0ms backwards",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(34, 197, 94, 0.2)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <span style={{ fontSize: "32px" }}>🟢</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: "36px", fontWeight: "bold", color: "#22c55e" }}>{stats.onTime}</span>
          </div>
          <p style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#166534" }}>On Time</p>
          <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#6b7280" }}>Scheduled & on track</p>
        </div>

        {/* Due Soon */}
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "24px",
            border: "2px solid #f59e0b",
            transition: "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s",
            animation: "fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) 50ms backwards",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(245, 158, 11, 0.2)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <span style={{ fontSize: "32px" }}>🟡</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: "36px", fontWeight: "bold", color: "#f59e0b" }}>{stats.dueSoon}</span>
          </div>
          <p style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#92400e" }}>Due Soon</p>
          <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#6b7280" }}>Within {dueSoonThreshold} days</p>
        </div>

        {/* Overdue */}
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "24px",
            border: "2px solid #ef4444",
            transition: "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s",
            animation: "fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) 100ms backwards",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(239, 68, 68, 0.2)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <span style={{ fontSize: "32px" }}>🔴</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: "36px", fontWeight: "bold", color: "#ef4444" }}>{stats.overdue}</span>
          </div>
          <p style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#991b1b" }}>Overdue</p>
          <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#6b7280" }}>Past due date</p>
        </div>

        {/* No Schedule (Ad-hoc) */}
        <div
          onClick={() => setFilter(filter === "no_schedule" ? "all" : "no_schedule")}
          style={{
            background: filter === "no_schedule" ? "linear-gradient(135deg, #dbeafe20 0%, #3b82f620 100%)" : "white",
            borderRadius: "16px",
            padding: "24px",
            border: "2px solid #3b82f6",
            cursor: "pointer",
            transition: "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s",
            animation: "fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) 150ms backwards",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(59, 130, 246, 0.2)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <span style={{ fontSize: "32px" }}>🔵</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: "36px", fontWeight: "bold", color: "#3b82f6" }}>{stats.noSchedule}</span>
          </div>
          <p style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#1e40af" }}>No Schedule</p>
          <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#6b7280" }}>Ad-hoc checklists</p>
        </div>
      </div>

      {/* Filter Info */}
      {filter !== "all" && (
        <div style={{ marginBottom: "16px", padding: "14px 18px", background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "space-between", animation: "fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)" }}>
          <span style={{ fontSize: "14px", color: "#1e40af", fontWeight: 500 }}>
            Showing <strong>{filter === "scheduled" ? "scheduled" : "no schedule"}</strong> checklists
          </span>
          <button
            onClick={() => setFilter("all")}
            style={{ padding: "8px 16px", background: "white", border: "1px solid #bfdbfe", borderRadius: "8px", fontSize: "13px", cursor: "pointer", color: "#1e40af", fontWeight: 600, transition: "background 0.15s" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#dbeafe"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "white"; }}
          >
            Show All
          </button>
        </div>
      )}

      {/* Checklist List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {filteredChecklists.length === 0 ? (
          <div style={{ padding: "56px 24px", textAlign: "center", background: "white", borderRadius: "16px", border: "2px dashed #e2e8f0", animation: "fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}>
            <div style={{ width: "64px", height: "64px", margin: "0 auto 20px", background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg style={{ width: "32px", height: "32px", color: "#9ca3af" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: "18px", fontWeight: "600", color: "#111827", margin: 0, marginBottom: "8px" }}>
              No in-progress checklists
            </h3>
            <p style={{ fontSize: "14px", color: "#6b7280", margin: "0 0 24px 0" }}>
              Start a new checklist to see it here
            </p>
            <Link
              href="/checklists/new"
              style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "12px 24px", background: `linear-gradient(135deg, ${BRAND_BLUE} 0%, #003d75 100%)`, color: "white", borderRadius: "12px", textDecoration: "none", fontWeight: "600", fontSize: "14px", boxShadow: "0 4px 14px rgba(0, 87, 168, 0.25)", transition: "transform 0.15s, box-shadow 0.15s" }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0, 87, 168, 0.35)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(0, 87, 168, 0.25)"; }}
            >
              Start a Checklist
            </Link>
          </div>
        ) : (
          filteredChecklists.map((checklist, index) => {
            const display = getStatusDisplay(checklist);
            return (
              <Link
                key={checklist.id}
                href={`/checklists/${checklist.id}/run`}
                style={{
                  display: "block",
                  background: "white",
                  borderRadius: "16px",
                  border: `2px solid ${display.border}`,
                  padding: "20px",
                  textDecoration: "none",
                  transition: "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s",
                  animation: `fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${index * 30}ms backwards`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = `0 8px 24px ${display.border}30`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                  {/* Status Light */}
                  <div style={{ fontSize: "48px", flexShrink: 0, lineHeight: 1 }}>{display.light}</div>

                  {/* Checklist Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: "17px", fontWeight: "600", color: "#111827", margin: 0, marginBottom: "6px" }}>
                      {checklist.template_name}
                    </h3>
                    <p style={{ fontSize: "14px", color: "#6b7280", margin: 0, display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <svg style={{ width: "14px", height: "14px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                        </svg>
                        {checklist.machine_name || "No machine"}
                      </span>
                      <span style={{ color: "#d1d5db" }}>•</span>
                      <span style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        padding: "2px 8px",
                        borderRadius: "9999px",
                        background: checklist.is_scheduled ? "#dcfce7" : "#dbeafe",
                        color: checklist.is_scheduled ? "#166534" : "#1e40af",
                      }}>
                        {frequencyLabels[checklist.frequency || "once"]}
                      </span>
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ padding: "8px 18px", borderRadius: "9999px", background: `linear-gradient(135deg, ${display.bg} 0%, ${display.border}20 100%)`, border: `1px solid ${display.border}`, marginBottom: "6px" }}>
                      <span style={{ fontSize: "13px", fontWeight: "700", color: display.text }}>
                        {getStatusText(checklist)}
                      </span>
                    </div>
                    <p style={{ fontSize: "11px", color: "#9ca3af", margin: 0, fontWeight: 500 }}>
                      Started: {new Date(checklist.started_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  {/* Arrow */}
                  <svg style={{ width: "20px", height: "20px", color: "#9ca3af", flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
