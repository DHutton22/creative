"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { formatDate } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { ClipboardCheck, Clock, FileText, Settings, Play, Eye, Search } from "lucide-react";

interface ChecklistTemplate {
  id: string;
  name: string;
  description: string | null;
  type: string | null;
  status: string;
  machine_id: string | null;
  created_at: string;
}

interface ChecklistRun {
  id: string;
  status: "in_progress" | "completed" | "abandoned";
  started_at: string;
  completed_at: string | null;
  checklist_templates: { name: string } | null;
  machines: { name: string } | null;
  users: { name: string } | null;
}

const BRAND_BLUE = '#0057A8';

const statusColors: Record<string, { bg: string; color: string; label: string }> = {
  in_progress: { bg: '#dbeafe', color: '#1e40af', label: 'In Progress' },
  completed: { bg: '#dcfce7', color: '#166534', label: 'Completed' },
  abandoned: { bg: '#f3f4f6', color: '#6b7280', label: 'Abandoned' },
};

export default function ChecklistsPage() {
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [recentRuns, setRecentRuns] = useState<ChecklistRun[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"templates" | "history">("templates");
  const [searchQuery, setSearchQuery] = useState("");
  const { hasRole, isLoading: authLoading } = useAuth();
  const supabase = createClient();

  const canManageTemplates = hasRole(["admin", "supervisor"]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);

    const { data: templateData } = await supabase
      .from("checklist_templates")
      .select("*")
      .eq("status", "active")
      .order("name");

    const { data: runData } = await supabase
      .from("checklist_runs")
      .select(`
        *,
        checklist_templates (name),
        machines (name),
        users (name)
      `)
      .order("started_at", { ascending: false })
      .limit(20);

    setTemplates(templateData || []);
    setRecentRuns(runData || []);
    setIsLoading(false);
  }, [supabase]);

  useEffect(() => {
    if (!authLoading) {
      fetchData();
    }
  }, [authLoading, fetchData]);

  const filteredTemplates = templates.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredRuns = recentRuns.filter((r) =>
    r.checklist_templates?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.machines?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const completedToday = recentRuns.filter((r) => {
    const today = new Date();
    const runDate = new Date(r.started_at);
    return (
      r.status === "completed" &&
      runDate.toDateString() === today.toDateString()
    );
  }).length;

  const inProgress = recentRuns.filter((r) => r.status === "in_progress").length;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ 
            fontFamily: 'var(--font-display, "DM Sans", sans-serif)',
            fontSize: '28px', 
            fontWeight: 'bold', 
            color: '#111827', 
            margin: 0,
            letterSpacing: '-0.02em',
          }}>
            Checklists
          </h1>
          <p style={{ color: '#6b7280', marginTop: '6px', fontSize: '15px' }}>
            Run pre-start checklists and view history
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {canManageTemplates && (
            <Link href="/admin/templates" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 18px',
              background: 'white',
              border: '2px solid #e2e8f0',
              color: '#374151',
              borderRadius: '12px',
              fontWeight: '600',
              fontSize: '14px',
              textDecoration: 'none',
              transition: 'border-color 0.15s, background 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = BRAND_BLUE;
              e.currentTarget.style.background = '#eff6ff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.background = 'white';
            }}>
              <Settings style={{ width: '18px', height: '18px' }} />
              Manage Templates
            </Link>
          )}
          <Link href="/checklists/new" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 22px',
            background: `linear-gradient(135deg, ${BRAND_BLUE} 0%, #003d75 100%)`,
            color: 'white',
            borderRadius: '12px',
            fontWeight: '600',
            fontSize: '14px',
            textDecoration: 'none',
            boxShadow: '0 4px 14px rgba(0, 87, 168, 0.25)',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 87, 168, 0.35)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 87, 168, 0.25)';
          }}>
            <ClipboardCheck style={{ width: '18px', height: '18px' }} />
            Start Checklist
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {[
          { icon: FileText, label: 'Templates', value: templates.length, color: BRAND_BLUE, bg: '#dbeafe', delay: 0 },
          { icon: ClipboardCheck, label: 'Completed Today', value: completedToday, color: '#16a34a', bg: '#dcfce7', delay: 50 },
          { icon: Clock, label: 'In Progress', value: inProgress, color: '#d97706', bg: '#fef3c7', delay: 100 },
        ].map((stat, index) => (
          <div 
            key={stat.label}
            style={{ 
              background: 'white',
              borderRadius: '16px',
              boxShadow: 'var(--shadow-card, 0 0 0 1px rgba(0, 0, 0, 0.02), 0 2px 8px -2px rgba(0, 0, 0, 0.08), 0 8px 24px -4px rgba(0, 0, 0, 0.06))',
              border: '1px solid #e2e8f0',
              padding: '22px',
              animation: `fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${stat.delay}ms backwards`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ 
                width: '52px', 
                height: '52px', 
                borderRadius: '14px', 
                background: stat.bg, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: `0 4px 12px ${stat.color}20`,
              }}>
                <stat.icon style={{ width: '26px', height: '26px', color: stat.color }} />
              </div>
              <div>
                <p style={{ 
                  fontFamily: 'var(--font-display, "DM Sans", sans-serif)',
                  fontSize: '28px', 
                  fontWeight: 'bold', 
                  color: '#111827', 
                  margin: 0,
                  letterSpacing: '-0.02em',
                }}>
                  {stat.value}
                </p>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: 0, fontWeight: 500 }}>
                  {stat.label}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs & Search */}
      <div style={{ 
        background: 'white',
        borderRadius: '16px',
        boxShadow: 'var(--shadow-card)',
        border: '1px solid #e2e8f0',
        padding: '16px 20px', 
        marginBottom: '24px',
        animation: 'fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.15s backwards',
      }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '6px', background: '#f3f4f6', borderRadius: '10px', padding: '4px' }}>
            <button
              onClick={() => setActiveTab("templates")}
              style={{
                padding: '10px 18px',
                background: activeTab === "templates" ? 'white' : 'transparent',
                color: activeTab === "templates" ? BRAND_BLUE : '#64748b',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                boxShadow: activeTab === "templates" ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              Templates
            </button>
            <button
              onClick={() => setActiveTab("history")}
              style={{
                padding: '10px 18px',
                background: activeTab === "history" ? 'white' : 'transparent',
                color: activeTab === "history" ? BRAND_BLUE : '#64748b',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                boxShadow: activeTab === "history" ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              History
            </button>
          </div>
          <div style={{ position: 'relative', minWidth: '240px' }}>
            <Search style={{ 
              position: 'absolute', 
              left: '14px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              width: '18px', 
              height: '18px', 
              color: '#9ca3af',
            }} />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 12px 12px 44px',
                border: '2px solid #e5e7eb',
                borderRadius: '10px',
                fontSize: '14px',
                outline: 'none',
                background: '#fafafa',
                transition: 'border-color 0.15s, box-shadow 0.15s, background 0.15s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = BRAND_BLUE;
                e.target.style.boxShadow = '0 0 0 4px rgba(0, 87, 168, 0.1)';
                e.target.style.background = 'white';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = 'none';
                e.target.style.background = '#fafafa';
              }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div 
              key={i} 
              style={{ 
                background: 'white',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '24px',
              }}
            >
              <div style={{ 
                height: '20px', 
                background: 'linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s ease-in-out infinite',
                borderRadius: '6px', 
                width: '70%', 
                marginBottom: '12px',
              }} />
              <div style={{ 
                height: '14px', 
                background: 'linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s ease-in-out infinite',
                borderRadius: '6px', 
                width: '50%', 
                marginBottom: '20px',
              }} />
              <div style={{ 
                height: '44px', 
                background: 'linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s ease-in-out infinite',
                borderRadius: '10px',
              }} />
            </div>
          ))}
        </div>
      ) : activeTab === "templates" ? (
        filteredTemplates.length === 0 ? (
          <EmptyState
            icon={<FileText style={{ width: '48px', height: '48px' }} />}
            title={searchQuery ? "No templates found" : "No checklist templates yet"}
            description={searchQuery 
              ? "Try adjusting your search terms" 
              : "Create your first checklist template to get started with machine compliance tracking"}
            tip={!searchQuery ? "Pro tip: Start with a daily pre-start check for your most critical machine." : undefined}
            action={canManageTemplates && !searchQuery ? {
              label: "Create Template",
              href: "/admin/templates/new"
            } : undefined}
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {filteredTemplates.map((template, index) => (
              <div 
                key={template.id} 
                style={{ 
                  background: 'white',
                  borderRadius: '16px',
                  boxShadow: 'var(--shadow-card)',
                  border: '1px solid #e2e8f0',
                  padding: '24px',
                  transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  animation: `fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${index * 50}ms backwards`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                }}
              >
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ 
                    fontFamily: 'var(--font-display, "DM Sans", sans-serif)',
                    fontSize: '18px', 
                    fontWeight: '600', 
                    color: '#111827', 
                    marginBottom: '6px',
                    margin: 0,
                  }}>
                    {template.name}
                  </h3>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: '6px 0 0 0', lineHeight: 1.5 }}>
                    {template.description || 'No description provided'}
                  </p>
                  {template.type && (
                    <span style={{
                      display: 'inline-block',
                      marginTop: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      padding: '5px 12px',
                      borderRadius: '9999px',
                      background: '#f3f4f6',
                      color: '#374151',
                      textTransform: 'capitalize',
                    }}>
                      {template.type.replace('_', ' ')}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <Link
                    href={`/checklists/new?templateId=${template.id}`}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '12px',
                      background: `linear-gradient(135deg, ${BRAND_BLUE} 0%, #003d75 100%)`,
                      color: 'white',
                      borderRadius: '10px',
                      fontWeight: '600',
                      fontSize: '14px',
                      textDecoration: 'none',
                      transition: 'transform 0.15s, box-shadow 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 87, 168, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <Play style={{ width: '16px', height: '16px' }} />
                    Start
                  </Link>
                  <Link
                    href={`/admin/templates/${template.id}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '12px',
                      background: 'white',
                      border: '2px solid #e2e8f0',
                      color: '#374151',
                      borderRadius: '10px',
                      textDecoration: 'none',
                      transition: 'border-color 0.15s, background 0.15s',
                    }}
                    title="View Details"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = BRAND_BLUE;
                      e.currentTarget.style.background = '#eff6ff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.background = 'white';
                    }}
                  >
                    <Eye style={{ width: '18px', height: '18px' }} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        filteredRuns.length === 0 ? (
          <EmptyState
            icon={<Clock style={{ width: '48px', height: '48px' }} />}
            title={searchQuery ? "No matching runs found" : "No checklist runs yet"}
            description={searchQuery 
              ? "Try adjusting your search terms" 
              : "Start your first checklist to see history here"}
            action={!searchQuery ? {
              label: "Start Checklist",
              href: "/checklists/new"
            } : undefined}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredRuns.map((run, index) => (
              <Link
                key={run.id}
                href={`/checklists/${run.id}`}
                style={{ textDecoration: 'none' }}
              >
                <div 
                  style={{ 
                    background: 'white',
                    borderRadius: '16px',
                    boxShadow: 'var(--shadow-card)',
                    border: '1px solid #e2e8f0',
                    padding: '20px',
                    transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                    animation: `fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${index * 50}ms backwards`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: statusColors[run.status].bg,
                      flexShrink: 0,
                    }}>
                      <ClipboardCheck style={{ width: '26px', height: '26px', color: statusColors[run.status].color }} />
                    </div>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                        <h3 style={{ 
                          fontFamily: 'var(--font-display, "DM Sans", sans-serif)',
                          fontWeight: '600', 
                          color: '#111827', 
                          margin: 0,
                          fontSize: '16px',
                        }}>
                          {run.checklist_templates?.name || 'Unknown Template'}
                        </h3>
                        <span style={{
                          fontSize: '12px',
                          fontWeight: '600',
                          padding: '4px 12px',
                          borderRadius: '9999px',
                          background: statusColors[run.status].bg,
                          color: statusColors[run.status].color,
                        }}>
                          {statusColors[run.status].label}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#6b7280', flexWrap: 'wrap' }}>
                        {run.machines && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <svg style={{ width: '14px', height: '14px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                            </svg>
                            {run.machines.name}
                          </span>
                        )}
                        {run.users && (
                          <>
                            <span style={{ color: '#d1d5db' }}>•</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <svg style={{ width: '14px', height: '14px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              {run.users.name}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: 0 }}>
                        {formatDate(run.started_at)}
                      </p>
                      {run.completed_at && (
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}>
                          Completed: {formatDate(run.completed_at)}
                        </p>
                      )}
                    </div>
                    <svg style={{ width: '20px', height: '20px', color: '#9ca3af' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )
      )}
    </div>
  );
}
