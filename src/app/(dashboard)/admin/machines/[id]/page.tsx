"use client";

import { useState, useEffect, use } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { 
  ArrowLeft, 
  Wrench, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  SkipForward,
  History,
  AlertCircle,
  User,
  Calendar,
  Settings
} from "lucide-react";

interface Machine {
  id: string;
  name: string;
  manufacturer: string | null;
  model: string | null;
  serial_number: string | null;
  location: string | null;
  description: string | null;
  status: string;
  risk_category: string;
  work_centre_id: string | null;
}

interface ChecklistRun {
  id: string;
  template_id: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  checklist_templates: { name: string } | { name: string }[] | null;
  users: { name: string } | { name: string }[] | null;
}

interface MachineConcern {
  id: string;
  checklist_item_name: string | null;
  severity: string;
  description: string;
  photo_url: string | null;
  status: string;
  created_at: string;
  resolved_at: string | null;
  resolution_notes: string | null;
  raised_by_user: { name: string } | { name: string }[] | null;
  resolved_by_user: { name: string } | { name: string }[] | null;
}

interface ChecklistSkip {
  id: string;
  reason: string;
  skip_date: string;
  created_at: string;
  checklist_templates: { name: string } | { name: string }[] | null;
  users: { name: string } | { name: string }[] | null;
}

const BRAND_BLUE = '#0057A8';

const statusConfig: Record<string, { bg: string; color: string; label: string }> = {
  available: { bg: "#dcfce7", color: "#166534", label: "Available" },
  in_use: { bg: "#dbeafe", color: "#1e40af", label: "In Use" },
  under_maintenance: { bg: "#fef3c7", color: "#92400e", label: "Maintenance" },
  locked_out: { bg: "#fee2e2", color: "#991b1b", label: "Locked Out" },
  decommissioned: { bg: "#f3f4f6", color: "#6b7280", label: "Decommissioned" },
};

const severityConfig: Record<string, { bg: string; color: string; label: string }> = {
  low: { bg: "#dcfce7", color: "#166534", label: "Low" },
  medium: { bg: "#fef3c7", color: "#92400e", label: "Medium" },
  high: { bg: "#ffedd5", color: "#c2410c", label: "High" },
  critical: { bg: "#fee2e2", color: "#991b1b", label: "Critical" },
};

const concernStatusConfig: Record<string, { bg: string; color: string; label: string }> = {
  open: { bg: "#fee2e2", color: "#991b1b", label: "Open" },
  in_review: { bg: "#fef3c7", color: "#92400e", label: "In Review" },
  resolved: { bg: "#dcfce7", color: "#166534", label: "Resolved" },
  escalated: { bg: "#fae8ff", color: "#86198f", label: "Escalated" },
};

export default function MachineProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [machine, setMachine] = useState<Machine | null>(null);
  const [checklistHistory, setChecklistHistory] = useState<ChecklistRun[]>([]);
  const [concerns, setConcerns] = useState<MachineConcern[]>([]);
  const [skips, setSkips] = useState<ChecklistSkip[]>([]);
  const [activeTab, setActiveTab] = useState<"history" | "concerns" | "skips">("history");
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedParams.id]);

  const fetchData = async () => {
    setIsLoading(true);

    // Fetch machine
    const { data: machineData } = await supabase
      .from("machines")
      .select("*")
      .eq("id", resolvedParams.id)
      .single();
    
    setMachine(machineData);

    // Fetch checklist history
    const { data: historyData } = await supabase
      .from("checklist_runs")
      .select(`
        id,
        template_id,
        status,
        started_at,
        completed_at,
        checklist_templates (name),
        users!checklist_runs_user_id_fkey (name)
      `)
      .eq("machine_id", resolvedParams.id)
      .order("started_at", { ascending: false })
      .limit(50);
    
    setChecklistHistory(historyData || []);

    // Fetch concerns (may fail if table doesn't exist)
    try {
      const { data: concernsData } = await supabase
        .from("machine_concerns")
        .select(`
          id,
          checklist_item_name,
          severity,
          description,
          photo_url,
          status,
          created_at,
          resolved_at,
          resolution_notes,
          raised_by_user:users!machine_concerns_raised_by_fkey (name),
          resolved_by_user:users!machine_concerns_resolved_by_fkey (name)
        `)
        .eq("machine_id", resolvedParams.id)
        .order("created_at", { ascending: false });
      
      setConcerns(concernsData || []);
    } catch (e) {
      console.log("Concerns table not available");
    }

    // Fetch skips (may fail if table doesn't exist)
    try {
      const { data: skipsData } = await supabase
        .from("checklist_skips")
        .select(`
          id,
          reason,
          skip_date,
          created_at,
          checklist_templates (name),
          users!checklist_skips_skipped_by_fkey (name)
        `)
        .eq("machine_id", resolvedParams.id)
        .order("skip_date", { ascending: false });
      
      setSkips(skipsData || []);
    } catch (e) {
      console.log("Skips table not available");
    }

    setIsLoading(false);
  };

  const handleResolveConcern = async (concernId: string, notes: string) => {
    const { data: userData } = await supabase.auth.getUser();
    
    await supabase
      .from("machine_concerns")
      .update({
        status: "resolved",
        resolved_by: userData.user?.id,
        resolved_at: new Date().toISOString(),
        resolution_notes: notes,
      })
      .eq("id", concernId);
    
    fetchData();
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

  // Stats
  const completedCount = checklistHistory.filter(r => r.status === "completed").length;
  const openConcerns = concerns.filter(c => c.status === "open" || c.status === "in_review").length;
  const totalSkips = skips.length;

  if (isLoading) {
    return (
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "20px" }}>
        <div style={{ 
          height: "200px", 
          background: "linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.5s ease-in-out infinite",
          borderRadius: "16px",
        }} />
      </div>
    );
  }

  if (!machine) {
    return (
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "20px", textAlign: "center" }}>
        <h2>Machine not found</h2>
        <Link href="/admin/machines" style={{ color: BRAND_BLUE }}>Back to Machines</Link>
      </div>
    );
  }

  const status = statusConfig[machine.status] || statusConfig.available;

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      {/* Back Link */}
      <Link
        href="/admin/machines"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          color: "#64748b",
          textDecoration: "none",
          fontSize: "14px",
          fontWeight: "500",
          marginBottom: "20px",
        }}
      >
        <ArrowLeft style={{ width: "18px", height: "18px" }} />
        Back to Machines
      </Link>

      {/* Machine Header */}
      <div style={{
        background: "white",
        borderRadius: "16px",
        border: "1px solid #e2e8f0",
        padding: "24px",
        marginBottom: "24px",
        animation: "fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "20px", flexWrap: "wrap" }}>
          {/* Icon */}
          <div style={{
            width: "72px",
            height: "72px",
            borderRadius: "16px",
            background: `linear-gradient(135deg, ${BRAND_BLUE} 0%, #003d75 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}>
            <Wrench style={{ width: "36px", height: "36px", color: "white" }} />
          </div>

          {/* Details */}
          <div style={{ flex: 1, minWidth: "200px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px", flexWrap: "wrap" }}>
              <h1 style={{
                fontFamily: 'var(--font-display, "DM Sans", sans-serif)',
                fontSize: "24px",
                fontWeight: "bold",
                color: "#111827",
                margin: 0,
              }}>
                {machine.name}
              </h1>
              <span style={{
                padding: "6px 12px",
                borderRadius: "9999px",
                background: status.bg,
                color: status.color,
                fontSize: "13px",
                fontWeight: "600",
              }}>
                {status.label}
              </span>
            </div>
            
            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", fontSize: "14px", color: "#6b7280" }}>
              {machine.manufacturer && (
                <span>{machine.manufacturer} {machine.model}</span>
              )}
              {machine.serial_number && (
                <span>S/N: {machine.serial_number}</span>
              )}
              {machine.location && (
                <span>📍 {machine.location}</span>
              )}
            </div>
            
            {machine.description && (
              <p style={{ fontSize: "14px", color: "#6b7280", margin: "12px 0 0 0" }}>
                {machine.description}
              </p>
            )}
          </div>

          {/* Edit Button */}
          <Link
            href={`/admin/machines/${machine.id}/edit`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 16px",
              background: "white",
              border: "2px solid #e2e8f0",
              borderRadius: "10px",
              color: "#64748b",
              textDecoration: "none",
              fontWeight: "600",
              fontSize: "14px",
            }}
          >
            <Settings style={{ width: "18px", height: "18px" }} />
            Edit
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(3, 1fr)", 
        gap: "16px", 
        marginBottom: "24px",
      }}>
        <div style={{
          background: "white",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          padding: "20px",
          animation: "fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.1s backwards",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "44px",
              height: "44px",
              borderRadius: "10px",
              background: "#dcfce7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <CheckCircle2 style={{ width: "24px", height: "24px", color: "#166534" }} />
            </div>
            <div>
              <p style={{ fontSize: "24px", fontWeight: "bold", color: "#111827", margin: 0 }}>
                {completedCount}
              </p>
              <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>
                Checklists Completed
              </p>
            </div>
          </div>
        </div>

        <div style={{
          background: "white",
          borderRadius: "12px",
          border: openConcerns > 0 ? "2px solid #f59e0b" : "1px solid #e2e8f0",
          padding: "20px",
          animation: "fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.15s backwards",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "44px",
              height: "44px",
              borderRadius: "10px",
              background: openConcerns > 0 ? "#fef3c7" : "#f3f4f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <AlertTriangle style={{ width: "24px", height: "24px", color: openConcerns > 0 ? "#92400e" : "#6b7280" }} />
            </div>
            <div>
              <p style={{ fontSize: "24px", fontWeight: "bold", color: openConcerns > 0 ? "#92400e" : "#111827", margin: 0 }}>
                {openConcerns}
              </p>
              <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>
                Open Concerns
              </p>
            </div>
          </div>
        </div>

        <div style={{
          background: "white",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          padding: "20px",
          animation: "fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.2s backwards",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "44px",
              height: "44px",
              borderRadius: "10px",
              background: "#f3f4f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <SkipForward style={{ width: "24px", height: "24px", color: "#6b7280" }} />
            </div>
            <div>
              <p style={{ fontSize: "24px", fontWeight: "bold", color: "#111827", margin: 0 }}>
                {totalSkips}
              </p>
              <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>
                Skipped Cycles
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex",
        gap: "4px",
        background: "#f3f4f6",
        borderRadius: "10px",
        padding: "4px",
        marginBottom: "20px",
      }}>
        {[
          { key: "history", label: "Checklist History", icon: History, count: checklistHistory.length },
          { key: "concerns", label: "Concerns", icon: AlertCircle, count: concerns.length, highlight: openConcerns > 0 },
          { key: "skips", label: "Skipped Cycles", icon: SkipForward, count: skips.length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "12px 16px",
              borderRadius: "8px",
              border: "none",
              background: activeTab === tab.key ? "white" : "transparent",
              color: activeTab === tab.key ? BRAND_BLUE : "#64748b",
              fontWeight: "600",
              fontSize: "14px",
              cursor: "pointer",
              boxShadow: activeTab === tab.key ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              transition: "all 0.15s",
            }}
          >
            <tab.icon style={{ width: "18px", height: "18px" }} />
            {tab.label}
            <span style={{
              padding: "2px 8px",
              borderRadius: "9999px",
              background: tab.highlight ? "#fef3c7" : activeTab === tab.key ? "#eff6ff" : "#e5e7eb",
              color: tab.highlight ? "#92400e" : activeTab === tab.key ? BRAND_BLUE : "#6b7280",
              fontSize: "12px",
              fontWeight: "600",
            }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{
        background: "white",
        borderRadius: "16px",
        border: "1px solid #e2e8f0",
        overflow: "hidden",
      }}>
        {/* History Tab */}
        {activeTab === "history" && (
          <div>
            {checklistHistory.length === 0 ? (
              <div style={{ padding: "48px", textAlign: "center" }}>
                <History style={{ width: "48px", height: "48px", color: "#d1d5db", margin: "0 auto 16px" }} />
                <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#374151", margin: "0 0 8px 0" }}>
                  No checklist history yet
                </h3>
                <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>
                  Completed checklists will appear here
                </p>
              </div>
            ) : (
              <div>
                {checklistHistory.map((run, index) => (
                  <Link
                    key={run.id}
                    href={`/checklists/${run.id}`}
                    style={{ textDecoration: "none" }}
                  >
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      padding: "16px 20px",
                      borderBottom: index < checklistHistory.length - 1 ? "1px solid #f1f5f9" : "none",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#f8fafc"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "white"; }}
                    >
                      {/* Status Icon */}
                      <div style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "10px",
                        background: run.status === "completed" ? "#dcfce7" : run.status === "in_progress" ? "#dbeafe" : "#f3f4f6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}>
                        {run.status === "completed" ? (
                          <CheckCircle2 style={{ width: "20px", height: "20px", color: "#166534" }} />
                        ) : run.status === "in_progress" ? (
                          <Clock style={{ width: "20px", height: "20px", color: "#1e40af" }} />
                        ) : (
                          <AlertCircle style={{ width: "20px", height: "20px", color: "#6b7280" }} />
                        )}
                      </div>

                      {/* Details */}
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: "15px", fontWeight: "600", color: "#111827", margin: 0 }}>
                          {Array.isArray(run.checklist_templates) 
                            ? run.checklist_templates[0]?.name 
                            : run.checklist_templates?.name || "Unknown Checklist"}
                        </p>
                        <p style={{ fontSize: "13px", color: "#6b7280", margin: "4px 0 0 0" }}>
                          {Array.isArray(run.users) ? run.users[0]?.name : run.users?.name || "Unknown"} • {getTimeAgo(run.started_at)}
                        </p>
                      </div>

                      {/* Status */}
                      <span style={{
                        padding: "4px 10px",
                        borderRadius: "9999px",
                        background: run.status === "completed" ? "#dcfce7" : run.status === "in_progress" ? "#dbeafe" : "#f3f4f6",
                        color: run.status === "completed" ? "#166534" : run.status === "in_progress" ? "#1e40af" : "#6b7280",
                        fontSize: "12px",
                        fontWeight: "600",
                        textTransform: "capitalize",
                      }}>
                        {run.status.replace("_", " ")}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Concerns Tab */}
        {activeTab === "concerns" && (
          <div>
            {concerns.length === 0 ? (
              <div style={{ padding: "48px", textAlign: "center" }}>
                <AlertTriangle style={{ width: "48px", height: "48px", color: "#d1d5db", margin: "0 auto 16px" }} />
                <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#374151", margin: "0 0 8px 0" }}>
                  No concerns raised
                </h3>
                <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>
                  Issues flagged during checklists will appear here
                </p>
              </div>
            ) : (
              <div>
                {concerns.map((concern, index) => {
                  const severity = severityConfig[concern.severity] || severityConfig.medium;
                  const cStatus = concernStatusConfig[concern.status] || concernStatusConfig.open;
                  
                  return (
                    <div
                      key={concern.id}
                      style={{
                        padding: "20px",
                        borderBottom: index < concerns.length - 1 ? "1px solid #f1f5f9" : "none",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                        {/* Severity Indicator */}
                        <div style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          background: severity.color,
                          marginTop: "8px",
                          flexShrink: 0,
                        }} />

                        <div style={{ flex: 1 }}>
                          {/* Header */}
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
                            <span style={{
                              padding: "3px 8px",
                              borderRadius: "6px",
                              background: severity.bg,
                              color: severity.color,
                              fontSize: "11px",
                              fontWeight: "700",
                              textTransform: "uppercase",
                            }}>
                              {severity.label}
                            </span>
                            <span style={{
                              padding: "3px 8px",
                              borderRadius: "6px",
                              background: cStatus.bg,
                              color: cStatus.color,
                              fontSize: "11px",
                              fontWeight: "600",
                            }}>
                              {cStatus.label}
                            </span>
                            {concern.checklist_item_name && (
                              <span style={{ fontSize: "13px", color: "#6b7280" }}>
                                Re: {concern.checklist_item_name}
                              </span>
                            )}
                          </div>

                          {/* Description */}
                          <p style={{ fontSize: "14px", color: "#111827", margin: "0 0 8px 0" }}>
                            {concern.description}
                          </p>

                          {/* Photo */}
                          {concern.photo_url && (
                            <img
                              src={concern.photo_url}
                              alt="Concern"
                              style={{
                                width: "100%",
                                maxWidth: "200px",
                                height: "auto",
                                borderRadius: "8px",
                                marginBottom: "8px",
                                cursor: "pointer",
                              }}
                              onClick={() => window.open(concern.photo_url!, "_blank")}
                            />
                          )}

                          {/* Meta */}
                          <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "13px", color: "#6b7280" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                              <User style={{ width: "14px", height: "14px" }} />
                              {Array.isArray(concern.raised_by_user) ? concern.raised_by_user[0]?.name : concern.raised_by_user?.name || "Unknown"}
                            </span>
                            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                              <Calendar style={{ width: "14px", height: "14px" }} />
                              {getTimeAgo(concern.created_at)}
                            </span>
                          </div>

                          {/* Resolution */}
                          {concern.status === "resolved" && concern.resolution_notes && (
                            <div style={{
                              marginTop: "12px",
                              padding: "12px",
                              background: "#f0fdf4",
                              borderRadius: "8px",
                              border: "1px solid #bbf7d0",
                            }}>
                              <p style={{ fontSize: "13px", fontWeight: "600", color: "#166534", margin: "0 0 4px 0" }}>
                                ✅ Resolved by {Array.isArray(concern.resolved_by_user) ? concern.resolved_by_user[0]?.name : concern.resolved_by_user?.name || "Unknown"}
                              </p>
                              <p style={{ fontSize: "13px", color: "#166534", margin: 0 }}>
                                {concern.resolution_notes}
                              </p>
                            </div>
                          )}

                          {/* Resolve Button */}
                          {(concern.status === "open" || concern.status === "in_review") && (
                            <button
                              onClick={() => {
                                const notes = prompt("Resolution notes:");
                                if (notes) handleResolveConcern(concern.id, notes);
                              }}
                              style={{
                                marginTop: "12px",
                                padding: "8px 16px",
                                background: "#dcfce7",
                                border: "1px solid #bbf7d0",
                                borderRadius: "8px",
                                color: "#166534",
                                fontWeight: "600",
                                fontSize: "13px",
                                cursor: "pointer",
                              }}
                            >
                              Mark as Resolved
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Skips Tab */}
        {activeTab === "skips" && (
          <div>
            {skips.length === 0 ? (
              <div style={{ padding: "48px", textAlign: "center" }}>
                <SkipForward style={{ width: "48px", height: "48px", color: "#d1d5db", margin: "0 auto 16px" }} />
                <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#374151", margin: "0 0 8px 0" }}>
                  No skipped cycles
                </h3>
                <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>
                  Skipped checklist cycles will be recorded here
                </p>
              </div>
            ) : (
              <div>
                {skips.map((skip, index) => (
                  <div
                    key={skip.id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "16px",
                      padding: "16px 20px",
                      borderBottom: index < skips.length - 1 ? "1px solid #f1f5f9" : "none",
                    }}
                  >
                    <div style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "10px",
                      background: "#fef3c7",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <SkipForward style={{ width: "20px", height: "20px", color: "#92400e" }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "15px", fontWeight: "600", color: "#111827", margin: "0 0 4px 0" }}>
                        {Array.isArray(skip.checklist_templates) ? skip.checklist_templates[0]?.name : skip.checklist_templates?.name || "Unknown Checklist"}
                      </p>
                      <p style={{ fontSize: "14px", color: "#6b7280", margin: "0 0 8px 0" }}>
                        &quot;{skip.reason}&quot;
                      </p>
                      <p style={{ fontSize: "13px", color: "#9ca3af", margin: 0 }}>
                        Skipped by {Array.isArray(skip.users) ? skip.users[0]?.name : skip.users?.name || "Unknown"} • {formatDate(skip.skip_date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

