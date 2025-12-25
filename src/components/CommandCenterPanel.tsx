"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import { X, Clock, CheckCircle2, AlertTriangle, User, Calendar, Send, SkipForward, History, ExternalLink } from "lucide-react";

interface ChecklistDetails {
  id: string;
  name: string;
  machine_name: string;
  machine_id: string;
  template_id: string;
  frequency: string | null;
  status: "on_time" | "due_soon" | "overdue" | "in_progress" | "no_schedule";
  days_overdue: number;
  due_date: string | null;
  last_completed_at: string | null;
  last_completed_by: string | null;
  current_run_id: string | null;
  current_run_user: string | null;
  current_run_started: string | null;
}

interface User {
  id: string;
  name: string;
  role: string;
}

interface Props {
  checklist: ChecklistDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onAction?: () => void; // Callback after an action is performed
}

const BRAND_BLUE = '#0057A8';

const statusConfig: Record<string, { bg: string; color: string; icon: typeof Clock; label: string }> = {
  on_time: { bg: "#dcfce7", color: "#166534", icon: CheckCircle2, label: "On Time" },
  due_soon: { bg: "#fef3c7", color: "#92400e", icon: Clock, label: "Due Soon" },
  overdue: { bg: "#fee2e2", color: "#991b1b", icon: AlertTriangle, label: "Overdue" },
  in_progress: { bg: "#dbeafe", color: "#1e40af", icon: Clock, label: "In Progress" },
  no_schedule: { bg: "#f3f4f6", color: "#6b7280", icon: CheckCircle2, label: "Ad-hoc" },
};

export function CommandCenterPanel({ checklist, isOpen, onClose, onAction }: Props) {
  const [operators, setOperators] = useState<User[]>([]);
  const [selectedOperator, setSelectedOperator] = useState<string>("");
  const [skipReason, setSkipReason] = useState("");
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [showSkipForm, setShowSkipForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recentHistory, setRecentHistory] = useState<any[]>([]);
  const [reminderSent, setReminderSent] = useState(false);
  const supabase = createClient();

  // Fetch operators and history when panel opens
  useEffect(() => {
    if (isOpen && checklist) {
      fetchOperators();
      fetchHistory();
    }
  }, [isOpen, checklist]);

  const fetchOperators = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("id, name, role")
      .order("name");
    
    if (error) {
      console.error("Error fetching operators:", error);
    }
    setOperators(data || []);
  };

  const fetchHistory = async () => {
    if (!checklist) return;
    
    const { data } = await supabase
      .from("checklist_runs")
      .select(`
        id,
        status,
        started_at,
        completed_at,
        users!checklist_runs_user_id_fkey (name)
      `)
      .eq("template_id", checklist.template_id)
      .eq("machine_id", checklist.machine_id)
      .order("started_at", { ascending: false })
      .limit(5);
    
    setRecentHistory(data || []);
  };

  const handleAssign = async () => {
    if (!checklist || !selectedOperator) return;
    setIsLoading(true);

    try {
      // Insert assignment
      await supabase.from("checklist_assignments").insert({
        checklist_template_id: checklist.template_id,
        machine_id: checklist.machine_id,
        assigned_to: selectedOperator,
        due_date: checklist.due_date || new Date().toISOString(),
        priority: checklist.status === "overdue" ? "high" : "normal",
      });

      // Log activity
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        await supabase.from("activity_log").insert({
          user_id: userData.user.id,
          action_type: "assignment_created",
          entity_type: "checklist_assignment",
          entity_id: checklist.template_id,
          machine_id: checklist.machine_id,
          metadata: { assigned_to: selectedOperator },
        });
      }

      setShowAssignForm(false);
      setSelectedOperator("");
      onAction?.();
    } catch (err) {
      console.error("Error assigning:", err);
    }

    setIsLoading(false);
  };

  const handleSkip = async () => {
    if (!checklist || !skipReason.trim()) return;
    setIsLoading(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      
      // Insert skip record
      await supabase.from("checklist_skips").insert({
        checklist_template_id: checklist.template_id,
        machine_id: checklist.machine_id,
        skipped_by: userData.user?.id,
        reason: skipReason,
        skip_date: new Date().toISOString().split('T')[0],
      });

      // Log activity
      if (userData.user) {
        await supabase.from("activity_log").insert({
          user_id: userData.user.id,
          action_type: "cycle_skipped",
          entity_type: "checklist_skip",
          entity_id: checklist.template_id,
          machine_id: checklist.machine_id,
          metadata: { reason: skipReason },
        });
      }

      setShowSkipForm(false);
      setSkipReason("");
      onAction?.();
    } catch (err) {
      console.error("Error skipping:", err);
    }

    setIsLoading(false);
  };

  const handleSendReminder = async () => {
    if (!checklist) return;
    
    // For now, just show confirmation - in future could send email/notification
    setReminderSent(true);
    
    // Log the reminder action
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        await supabase.from("activity_log").insert({
          user_id: userData.user.id,
          action_type: "assignment_created", // reusing this type for reminders
          entity_type: "reminder",
          entity_id: checklist.template_id,
          machine_id: checklist.machine_id,
          metadata: { 
            action: "reminder_sent",
            checklist_name: checklist.name,
          },
        });
      }
    } catch (e) {
      // Activity log might not exist yet
    }

    // Reset after 3 seconds
    setTimeout(() => setReminderSent(false), 3000);
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
  };

  if (!checklist) return null;

  const config = statusConfig[checklist.status] || statusConfig.no_schedule;
  const StatusIcon = config.icon;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.4)",
          opacity: isOpen ? 1 : 0,
          visibility: isOpen ? "visible" : "hidden",
          transition: "opacity 0.3s, visibility 0.3s",
          zIndex: 100,
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(480px, 100vw)",
          background: "white",
          boxShadow: "-4px 0 24px rgba(0,0,0,0.15)",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          zIndex: 101,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "20px 24px",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "flex-start",
          gap: "16px",
        }}>
          <div style={{
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            background: config.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}>
            <StatusIcon style={{ width: "24px", height: "24px", color: config.color }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{
              fontFamily: 'var(--font-display, "DM Sans", sans-serif)',
              fontSize: "18px",
              fontWeight: "600",
              color: "#111827",
              margin: 0,
              lineHeight: 1.3,
            }}>
              {checklist.name}
            </h2>
            <p style={{ fontSize: "14px", color: "#6b7280", margin: "4px 0 0 0" }}>
              {checklist.machine_name}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              border: "none",
              background: "#f1f5f9",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <X style={{ width: "20px", height: "20px", color: "#64748b" }} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: "auto", padding: "24px" }}>
          {/* Status Badge */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 14px",
            borderRadius: "9999px",
            background: config.bg,
            color: config.color,
            fontSize: "14px",
            fontWeight: "600",
            marginBottom: "24px",
          }}>
            <StatusIcon style={{ width: "16px", height: "16px" }} />
            {config.label}
            {checklist.days_overdue > 0 && ` (${checklist.days_overdue} days)`}
          </div>

          {/* Currently Running */}
          {checklist.current_run_id && (
            <div style={{
              padding: "16px",
              background: "#eff6ff",
              borderRadius: "12px",
              border: `2px solid ${BRAND_BLUE}`,
              marginBottom: "20px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <div style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: BRAND_BLUE,
                  animation: "pulse 2s infinite",
                }} />
                <span style={{ fontSize: "13px", fontWeight: "600", color: BRAND_BLUE }}>
                  Currently In Progress
                </span>
              </div>
              <p style={{ fontSize: "14px", color: "#374151", margin: 0 }}>
                <strong>{checklist.current_run_user || "Unknown"}</strong> started this checklist
                {checklist.current_run_started && (
                  <span style={{ color: "#6b7280" }}> • {getTimeAgo(checklist.current_run_started)}</span>
                )}
              </p>
            </div>
          )}

          {/* Info Grid */}
          <div style={{ display: "grid", gap: "16px", marginBottom: "24px" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "14px 16px",
              background: "#f8fafc",
              borderRadius: "10px",
            }}>
              <Calendar style={{ width: "20px", height: "20px", color: "#64748b" }} />
              <div>
                <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>Next Due</p>
                <p style={{ fontSize: "14px", fontWeight: "600", color: "#111827", margin: "2px 0 0 0" }}>
                  {checklist.due_date ? formatDate(checklist.due_date) : "No schedule"}
                </p>
              </div>
            </div>

            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "14px 16px",
              background: "#f8fafc",
              borderRadius: "10px",
            }}>
              <CheckCircle2 style={{ width: "20px", height: "20px", color: "#64748b" }} />
              <div>
                <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>Last Completed</p>
                <p style={{ fontSize: "14px", fontWeight: "600", color: "#111827", margin: "2px 0 0 0" }}>
                  {checklist.last_completed_at 
                    ? `${formatDate(checklist.last_completed_at)} by ${checklist.last_completed_by || "Unknown"}`
                    : "Never completed"
                  }
                </p>
              </div>
            </div>

            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "14px 16px",
              background: "#f8fafc",
              borderRadius: "10px",
            }}>
              <Clock style={{ width: "20px", height: "20px", color: "#64748b" }} />
              <div>
                <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>Frequency</p>
                <p style={{ fontSize: "14px", fontWeight: "600", color: "#111827", margin: "2px 0 0 0", textTransform: "capitalize" }}>
                  {checklist.frequency || "Ad-hoc (No schedule)"}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ marginBottom: "24px" }}>
            <h3 style={{ fontSize: "13px", fontWeight: "600", color: "#6b7280", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Actions
            </h3>
            
            {!showAssignForm && !showSkipForm && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <button
                  onClick={() => setShowAssignForm(true)}
                  style={{
                    padding: "14px 16px",
                    background: `linear-gradient(135deg, ${BRAND_BLUE} 0%, #003d75 100%)`,
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    fontWeight: "600",
                    fontSize: "14px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  <User style={{ width: "18px", height: "18px" }} />
                  Assign
                </button>
                
                <button
                  onClick={() => setShowSkipForm(true)}
                  disabled={checklist.status === "no_schedule"}
                  style={{
                    padding: "14px 16px",
                    background: "white",
                    color: "#64748b",
                    border: "2px solid #e2e8f0",
                    borderRadius: "10px",
                    fontWeight: "600",
                    fontSize: "14px",
                    cursor: checklist.status === "no_schedule" ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    opacity: checklist.status === "no_schedule" ? 0.5 : 1,
                  }}
                >
                  <SkipForward style={{ width: "18px", height: "18px" }} />
                  Skip Cycle
                </button>
                
                <a
                  href={`/checklists/${checklist.current_run_id || checklist.template_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: "14px 16px",
                    background: "white",
                    color: "#64748b",
                    border: "2px solid #e2e8f0",
                    borderRadius: "10px",
                    fontWeight: "600",
                    fontSize: "14px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    textDecoration: "none",
                  }}
                >
                  <ExternalLink style={{ width: "18px", height: "18px" }} />
                  View Checklist
                </a>
                
                <button
                  onClick={handleSendReminder}
                  disabled={reminderSent}
                  style={{
                    padding: "14px 16px",
                    background: reminderSent ? "#dcfce7" : "white",
                    color: reminderSent ? "#166534" : "#64748b",
                    border: reminderSent ? "2px solid #22c55e" : "2px solid #e2e8f0",
                    borderRadius: "10px",
                    fontWeight: "600",
                    fontSize: "14px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  {reminderSent ? (
                    <>
                      <CheckCircle2 style={{ width: "18px", height: "18px" }} />
                      Sent!
                    </>
                  ) : (
                    <>
                      <Send style={{ width: "18px", height: "18px" }} />
                      Remind
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Assign Form */}
            {showAssignForm && (
              <div style={{
                padding: "16px",
                background: "#f8fafc",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
              }}>
                <h4 style={{ fontSize: "14px", fontWeight: "600", color: "#111827", margin: "0 0 12px 0" }}>
                  Assign to Operator
                </h4>
                <select
                  value={selectedOperator}
                  onChange={(e) => setSelectedOperator(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    marginBottom: "12px",
                    background: "white",
                  }}
                >
                  <option value="">Select operator...</option>
                  {operators.map((op) => (
                    <option key={op.id} value={op.id}>
                      {op.name} ({op.role})
                    </option>
                  ))}
                </select>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => setShowAssignForm(false)}
                    style={{
                      flex: 1,
                      padding: "10px",
                      background: "white",
                      border: "2px solid #e2e8f0",
                      borderRadius: "8px",
                      fontWeight: "600",
                      fontSize: "14px",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAssign}
                    disabled={!selectedOperator || isLoading}
                    style={{
                      flex: 1,
                      padding: "10px",
                      background: selectedOperator ? BRAND_BLUE : "#e2e8f0",
                      color: selectedOperator ? "white" : "#9ca3af",
                      border: "none",
                      borderRadius: "8px",
                      fontWeight: "600",
                      fontSize: "14px",
                      cursor: selectedOperator ? "pointer" : "not-allowed",
                    }}
                  >
                    {isLoading ? "Assigning..." : "Assign"}
                  </button>
                </div>
              </div>
            )}

            {/* Skip Form */}
            {showSkipForm && (
              <div style={{
                padding: "16px",
                background: "#fef3c7",
                borderRadius: "12px",
                border: "1px solid #fcd34d",
              }}>
                <h4 style={{ fontSize: "14px", fontWeight: "600", color: "#92400e", margin: "0 0 12px 0" }}>
                  Skip This Cycle
                </h4>
                <textarea
                  value={skipReason}
                  onChange={(e) => setSkipReason(e.target.value)}
                  placeholder="Reason for skipping (required)..."
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #fcd34d",
                    borderRadius: "8px",
                    fontSize: "14px",
                    marginBottom: "12px",
                    minHeight: "80px",
                    resize: "vertical",
                    background: "white",
                  }}
                />
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => setShowSkipForm(false)}
                    style={{
                      flex: 1,
                      padding: "10px",
                      background: "white",
                      border: "2px solid #fcd34d",
                      borderRadius: "8px",
                      fontWeight: "600",
                      fontSize: "14px",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSkip}
                    disabled={!skipReason.trim() || isLoading}
                    style={{
                      flex: 1,
                      padding: "10px",
                      background: skipReason.trim() ? "#f59e0b" : "#fcd34d",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      fontWeight: "600",
                      fontSize: "14px",
                      cursor: skipReason.trim() ? "pointer" : "not-allowed",
                    }}
                  >
                    {isLoading ? "Skipping..." : "Skip Cycle"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Recent History */}
          <div>
            <h3 style={{ 
              fontSize: "13px", 
              fontWeight: "600", 
              color: "#6b7280", 
              marginBottom: "12px", 
              textTransform: "uppercase", 
              letterSpacing: "0.05em",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}>
              <History style={{ width: "14px", height: "14px" }} />
              Recent History
            </h3>
            
            {recentHistory.length === 0 ? (
              <p style={{ fontSize: "14px", color: "#9ca3af", textAlign: "center", padding: "20px 0" }}>
                No history yet
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {recentHistory.map((run) => (
                  <div
                    key={run.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px",
                      background: "#f8fafc",
                      borderRadius: "8px",
                    }}
                  >
                    <div style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: run.status === "completed" ? "#22c55e" : run.status === "in_progress" ? BRAND_BLUE : "#9ca3af",
                      flexShrink: 0,
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "13px", color: "#111827", margin: 0, fontWeight: 500 }}>
                        {run.users?.name || "Unknown"}
                      </p>
                      <p style={{ fontSize: "12px", color: "#6b7280", margin: "2px 0 0 0" }}>
                        {run.status === "completed" ? "Completed" : run.status === "in_progress" ? "In progress" : "Abandoned"}
                        {" • "}
                        {getTimeAgo(run.started_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </>
  );
}

