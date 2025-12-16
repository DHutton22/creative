"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";

interface ChecklistTemplate {
  id: string;
  name: string;
  type: string;
  status: "draft" | "active" | "deprecated";
  machine_id: string | null;
  version: number;
  created_at: string;
  updated_at: string;
  json_definition?: {
    sections?: { items: unknown[] }[];
  };
  machines?: { name: string } | null;
}

const cardStyle: React.CSSProperties = {
  background: 'white',
  borderRadius: '12px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  border: '1px solid #e2e8f0',
};

const BRAND_BLUE = '#0057A8';

const statusConfig = {
  draft: { bg: "#fef3c7", color: "#92400e", label: "Draft" },
  active: { bg: "#dcfce7", color: "#166534", label: "Active" },
  deprecated: { bg: "#f3f4f6", color: "#6b7280", label: "Deprecated" },
};

const typeLabels: Record<string, string> = {
  pre_run: "Pre-Run Check",
  first_off: "First-Off Inspection",
  shutdown: "Shutdown Check",
  maintenance: "Maintenance",
  safety: "Safety Inspection",
  quality: "Quality Check",
};

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { isLoading: authLoading } = useAuth();
  const supabase = createClient();

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);

    let query = supabase
      .from("checklist_templates")
      .select(`
        *,
        machines (name)
      `)
      .order("updated_at", { ascending: false });

    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching templates:", error);
    } else {
      setTemplates(data || []);
    }
    setIsLoading(false);
  }, [supabase, statusFilter]);

  useEffect(() => {
    if (!authLoading) {
      fetchTemplates();
    }
  }, [authLoading, fetchTemplates]);

  const filteredTemplates = templates.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.machines?.name && t.machines.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleDuplicate = async (template: ChecklistTemplate) => {
    const { error } = await supabase.from("checklist_templates").insert({
      name: `${template.name} (Copy)`,
      type: template.type,
      status: "draft",
      machine_id: template.machine_id,
      json_definition: template.json_definition,
      version: 1,
    });

    if (!error) {
      fetchTemplates();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    
    const { error } = await supabase.from("checklist_templates").delete().eq("id", id);
    
    if (!error) {
      fetchTemplates();
    }
  };

  const activeCount = templates.filter((t) => t.status === "active").length;
  const draftCount = templates.filter((t) => t.status === "draft").length;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Checklist Templates</h1>
          <p style={{ color: '#6b7280', marginTop: '4px' }}>Create and manage checklist templates</p>
        </div>
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
          <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Template
        </Link>
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
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Total Templates</p>
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
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>{activeCount}</p>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Active</p>
            </div>
          </div>
        </div>
        <div style={{ ...cardStyle, padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg style={{ width: '24px', height: '24px', color: '#d97706' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>{draftCount}</p>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Drafts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ ...cardStyle, padding: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '200px', position: 'relative' }}>
            <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#9ca3af' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 10px 10px 42px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '10px 32px 10px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              background: 'white',
              cursor: 'pointer',
              minWidth: '140px',
            }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="deprecated">Deprecated</option>
          </select>
        </div>
      </div>

      {/* Templates List */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ ...cardStyle, padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', background: '#f3f4f6', borderRadius: '12px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ height: '16px', background: '#f3f4f6', borderRadius: '4px', width: '33%', marginBottom: '8px' }} />
                  <div style={{ height: '12px', background: '#f3f4f6', borderRadius: '4px', width: '50%' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div style={{ ...cardStyle, padding: '48px', textAlign: 'center' }}>
          <svg style={{ width: '48px', height: '48px', color: '#9ca3af', margin: '0 auto 16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>No templates found</h3>
          <p style={{ color: '#6b7280', marginBottom: '16px' }}>
            {searchQuery || statusFilter !== "all" ? "Try adjusting your filters" : "Create your first checklist template to get started"}
          </p>
          {!searchQuery && statusFilter === "all" && (
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredTemplates.map((template) => {
            const itemCount = template.json_definition?.sections?.reduce(
              (acc, s) => acc + (s.items?.length || 0), 0
            ) || 0;

            return (
              <div key={template.id} style={{ ...cardStyle, padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: statusConfig[template.status].bg,
                    flexShrink: 0,
                  }}>
                    <svg style={{ width: '24px', height: '24px', color: statusConfig[template.status].color }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                      <h3 style={{ fontWeight: '600', color: '#111827', margin: 0 }}>{template.name}</h3>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: '500',
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        background: statusConfig[template.status].bg,
                        color: statusConfig[template.status].color,
                      }}>
                        {statusConfig[template.status].label}
                      </span>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: '500',
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        background: '#f3f4f6',
                        color: '#374151',
                      }}>
                        v{template.version}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#6b7280', flexWrap: 'wrap' }}>
                      <span>{typeLabels[template.type] || template.type}</span>
                      <span>•</span>
                      <span>{itemCount} items</span>
                      {template.machines && (
                        <>
                          <span>•</span>
                          <span>{template.machines.name}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Updated</p>
                    <p style={{ fontSize: '14px', fontWeight: '500', color: '#111827', margin: '2px 0 0 0' }}>
                      {formatDate(template.updated_at)}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Link
                      href={`/admin/templates/${template.id}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '36px',
                        height: '36px',
                        background: BRAND_BLUE,
                        color: 'white',
                        borderRadius: '8px',
                        textDecoration: 'none',
                      }}
                      title="Edit"
                    >
                      <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>
                    <button
                      onClick={() => handleDuplicate(template)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '36px',
                        height: '36px',
                        background: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        color: '#374151',
                      }}
                      title="Duplicate"
                    >
                      <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(template.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '36px',
                        height: '36px',
                        background: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        color: '#dc2626',
                      }}
                      title="Delete"
                    >
                      <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
