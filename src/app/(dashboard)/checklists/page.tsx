"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { formatDate } from "@/lib/utils";

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
  profiles: { name: string } | null;
}

const cardStyle: React.CSSProperties = {
  background: 'white',
  borderRadius: '12px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  border: '1px solid #e2e8f0',
};

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

    // Fetch templates
    const { data: templateData } = await supabase
      .from("checklist_templates")
      .select("*")
      .eq("status", "active")
      .order("name");

    // Fetch recent runs
    const { data: runData } = await supabase
      .from("checklist_runs")
      .select(`
        *,
        checklist_templates (name),
        machines (name),
        profiles (name)
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Checklists</h1>
          <p style={{ color: '#6b7280', marginTop: '4px' }}>Run pre-start checklists and view history</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {canManageTemplates && (
            <Link href="/admin/templates" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              background: 'white',
              border: '1px solid #e2e8f0',
              color: '#374151',
              borderRadius: '8px',
              fontWeight: '500',
              fontSize: '14px',
              textDecoration: 'none',
            }}>
              <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Manage Templates
            </Link>
          )}
          <Link href="/checklists/new" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            background: BRAND_BLUE,
            color: 'white',
            borderRadius: '8px',
            fontWeight: '500',
            fontSize: '14px',
            textDecoration: 'none',
          }}>
            <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Start Checklist
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ ...cardStyle, padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg style={{ width: '24px', height: '24px', color: BRAND_BLUE }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>{templates.length}</p>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Templates</p>
            </div>
          </div>
        </div>
        <div style={{ ...cardStyle, padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg style={{ width: '24px', height: '24px', color: '#16a34a' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>{completedToday}</p>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Completed Today</p>
            </div>
          </div>
        </div>
        <div style={{ ...cardStyle, padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg style={{ width: '24px', height: '24px', color: '#d97706' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>{inProgress}</p>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>In Progress</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs & Search */}
      <div style={{ ...cardStyle, padding: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setActiveTab("templates")}
              style={{
                padding: '8px 16px',
                background: activeTab === "templates" ? BRAND_BLUE : 'transparent',
                color: activeTab === "templates" ? 'white' : '#64748b',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '500',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Templates
            </button>
            <button
              onClick={() => setActiveTab("history")}
              style={{
                padding: '8px 16px',
                background: activeTab === "history" ? BRAND_BLUE : 'transparent',
                color: activeTab === "history" ? 'white' : '#64748b',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '500',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              History
            </button>
          </div>
          <div style={{ position: 'relative', minWidth: '200px' }}>
            <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: '#9ca3af' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 10px 10px 40px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} style={{ ...cardStyle, padding: '24px' }}>
              <div style={{ height: '20px', background: '#f3f4f6', borderRadius: '4px', width: '70%', marginBottom: '12px' }} />
              <div style={{ height: '14px', background: '#f3f4f6', borderRadius: '4px', width: '50%', marginBottom: '16px' }} />
              <div style={{ height: '36px', background: '#f3f4f6', borderRadius: '8px' }} />
            </div>
          ))}
        </div>
      ) : activeTab === "templates" ? (
        filteredTemplates.length === 0 ? (
          <div style={{ ...cardStyle, padding: '48px', textAlign: 'center' }}>
            <svg style={{ width: '48px', height: '48px', color: '#9ca3af', margin: '0 auto 16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>No templates found</h3>
            <p style={{ color: '#6b7280', marginBottom: '16px' }}>
              {searchQuery ? "Try adjusting your search" : "Create your first checklist template to get started"}
            </p>
            {canManageTemplates && !searchQuery && (
              <Link href="/admin/templates/new" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                background: BRAND_BLUE,
                color: 'white',
                borderRadius: '8px',
                fontWeight: '500',
                fontSize: '14px',
                textDecoration: 'none',
              }}>
                Create Template
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {filteredTemplates.map((template) => (
              <div key={template.id} style={{ ...cardStyle, padding: '24px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>{template.name}</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                    {template.description || 'No description provided'}
                  </p>
                  {template.type && (
                    <span style={{
                      display: 'inline-block',
                      marginTop: '8px',
                      fontSize: '12px',
                      fontWeight: '500',
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      background: '#f3f4f6',
                      color: '#374151',
                      textTransform: 'capitalize',
                    }}>
                      {template.type.replace('_', ' ')}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Link
                    href={`/checklists/new?templateId=${template.id}`}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '10px',
                      background: BRAND_BLUE,
                      color: 'white',
                      borderRadius: '8px',
                      fontWeight: '500',
                      fontSize: '14px',
                      textDecoration: 'none',
                    }}
                  >
                    <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Start
                  </Link>
                  <Link
                    href={`/admin/templates/${template.id}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '10px',
                      background: 'white',
                      border: '1px solid #e2e8f0',
                      color: '#374151',
                      borderRadius: '8px',
                      textDecoration: 'none',
                    }}
                    title="View Details"
                  >
                    <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        filteredRuns.length === 0 ? (
          <div style={{ ...cardStyle, padding: '48px', textAlign: 'center' }}>
            <svg style={{ width: '48px', height: '48px', color: '#9ca3af', margin: '0 auto 16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>No checklist runs yet</h3>
            <p style={{ color: '#6b7280', marginBottom: '16px' }}>
              {searchQuery ? "Try adjusting your search" : "Start your first checklist to see history here"}
            </p>
            {!searchQuery && (
              <Link href="/checklists/new" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                background: BRAND_BLUE,
                color: 'white',
                borderRadius: '8px',
                fontWeight: '500',
                fontSize: '14px',
                textDecoration: 'none',
              }}>
                Start Checklist
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredRuns.map((run) => (
              <Link
                key={run.id}
                href={`/checklists/${run.id}`}
                style={{ textDecoration: 'none' }}
              >
                <div style={{ ...cardStyle, padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: statusColors[run.status].bg,
                      flexShrink: 0,
                    }}>
                      <svg style={{ width: '24px', height: '24px', color: statusColors[run.status].color }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                        <h3 style={{ fontWeight: '600', color: '#111827', margin: 0 }}>
                          {run.checklist_templates?.name || 'Unknown Template'}
                        </h3>
                        <span style={{
                          fontSize: '12px',
                          fontWeight: '500',
                          padding: '4px 10px',
                          borderRadius: '9999px',
                          background: statusColors[run.status].bg,
                          color: statusColors[run.status].color,
                        }}>
                          {statusColors[run.status].label}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#6b7280', flexWrap: 'wrap' }}>
                        {run.machines && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                            {run.machines.name}
                          </span>
                        )}
                        {run.profiles && (
                          <>
                            <span>•</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              {run.profiles.name}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '14px', fontWeight: '500', color: '#111827', margin: 0 }}>
                        {formatDate(run.started_at)}
                      </p>
                      {run.completed_at && (
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0 0' }}>
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
