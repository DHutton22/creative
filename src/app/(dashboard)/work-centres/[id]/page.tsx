"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Machine, MachineStatus, ChecklistTemplate } from "@/types/database";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { formatDate } from "@/lib/utils";

const statusOptions = [
  { value: "available", label: "Available" },
  { value: "in_use", label: "In Use" },
  { value: "under_maintenance", label: "Under Maintenance" },
  { value: "locked_out", label: "Locked Out" },
  { value: "decommissioned", label: "Decommissioned" },
];

const riskOptions = [
  { value: "normal", label: "Normal" },
  { value: "high_risk", label: "High Risk" },
  { value: "aerospace", label: "Aerospace" },
];

const cardStyle: React.CSSProperties = {
  background: 'white',
  borderRadius: '12px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  border: '1px solid #e2e8f0',
};

const statusConfig: Record<MachineStatus, { bg: string; color: string }> = {
  available: { bg: "#dcfce7", color: "#166534" },
  in_use: { bg: "#dbeafe", color: "#1e40af" },
  under_maintenance: { bg: "#fef3c7", color: "#92400e" },
  locked_out: { bg: "#fee2e2", color: "#991b1b" },
  decommissioned: { bg: "#f3f4f6", color: "#6b7280" },
};

const riskConfig: Record<string, { bg: string; color: string }> = {
  normal: { bg: "#f3f4f6", color: "#374151" },
  high_risk: { bg: "#fef3c7", color: "#92400e" },
  aerospace: { bg: "#dbeafe", color: "#1e40af" },
};

export default function MachineDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [machine, setMachine] = useState<Machine | null>(null);
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Machine>>({});
  const router = useRouter();
  const { hasRole } = useAuth();
  const supabase = createClient();

  const canManage = hasRole(["admin", "supervisor"]);

  useEffect(() => {
    fetchMachine();
    fetchTemplates();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedParams.id]);

  const fetchMachine = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("machines")
      .select("*")
      .eq("id", resolvedParams.id)
      .single();

    if (error) {
      console.error("Error fetching machine:", error);
      router.push("/machines");
    } else {
      setMachine(data);
      setEditForm(data);
    }
    setIsLoading(false);
  };

  const fetchTemplates = async () => {
    // Fetch templates that are either:
    // 1. Assigned to this specific machine
    // 2. Generic templates (no machine assigned - available for all machines)
    const { data } = await supabase
      .from("checklist_templates")
      .select("*")
      .eq("status", "active")
      .or(`machine_id.eq.${resolvedParams.id},machine_id.is.null`)
      .order("name");

    setTemplates(data || []);
  };

  const handleSave = async () => {
    if (!machine) return;
    setIsSaving(true);

    const { error } = await supabase
      .from("machines")
      .update({
        name: editForm.name,
        manufacturer: editForm.manufacturer,
        model: editForm.model,
        serial_number: editForm.serial_number,
        location: editForm.location,
        status: editForm.status,
        risk_category: editForm.risk_category,
        description: editForm.description,
      })
      .eq("id", machine.id);

    if (error) {
      console.error("Error updating machine:", error);
    } else {
      setMachine({ ...machine, ...editForm } as Machine);
      setIsEditing(false);
    }
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!machine || !confirm("Are you sure you want to delete this machine?")) return;

    const { error } = await supabase
      .from("machines")
      .delete()
      .eq("id", machine.id);

    if (error) {
      console.error("Error deleting machine:", error);
    } else {
      router.push("/machines");
    }
  };

  if (isLoading) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ height: '32px', background: '#f3f4f6', borderRadius: '8px', width: '200px', marginBottom: '24px' }} />
        <div style={{ ...cardStyle, height: '300px' }} />
      </div>
    );
  }

  if (!machine) {
    return (
      <div style={{ textAlign: 'center', padding: '48px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>Machine not found</h2>
        <Link href="/machines" style={{
          display: 'inline-block',
          padding: '10px 20px',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          color: '#374151',
          fontWeight: '500',
        }}>
          Back to Machines
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/machines" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            color: '#6b7280',
            fontSize: '14px',
            fontWeight: '500',
          }}>
            <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>{machine.name}</h1>
            <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>{machine.manufacturer} {machine.model}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link href={`/checklists/new?machineId=${machine.id}`} style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            background: '#0057A8',
            color: 'white',
            borderRadius: '8px',
            fontWeight: '500',
            fontSize: '14px',
          }}>
            <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Start Checklist
          </Link>
          {canManage && !isEditing && (
            <>
              <button onClick={() => setIsEditing(true)} style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                color: '#374151',
                fontWeight: '500',
                fontSize: '14px',
                cursor: 'pointer',
              }}>
                <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
              <button onClick={handleDelete} style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '10px 16px',
                background: '#dc2626',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer',
              }}>
                <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </>
          )}
          {isEditing && (
            <>
              <button onClick={() => setIsEditing(false)} style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                color: '#374151',
                fontWeight: '500',
                fontSize: '14px',
                cursor: 'pointer',
              }}>
                Cancel
              </button>
              <button onClick={handleSave} disabled={isSaving} style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                background: '#0057A8',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontWeight: '500',
                fontSize: '14px',
                cursor: 'pointer',
                opacity: isSaving ? 0.7 : 1,
              }}>
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
        {/* Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Machine Details */}
          <div style={{ ...cardStyle, padding: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>Machine Details</h2>
            {isEditing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Machine Name</label>
                  <input type="text" value={editForm.name || ""} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Manufacturer</label>
                    <input type="text" value={editForm.manufacturer || ""} onChange={(e) => setEditForm({ ...editForm, manufacturer: e.target.value })} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Model</label>
                    <input type="text" value={editForm.model || ""} onChange={(e) => setEditForm({ ...editForm, model: e.target.value })} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Serial Number</label>
                    <input type="text" value={editForm.serial_number || ""} onChange={(e) => setEditForm({ ...editForm, serial_number: e.target.value })} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Location</label>
                    <input type="text" value={editForm.location || ""} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Status</label>
                    <select value={editForm.status || "available"} onChange={(e) => setEditForm({ ...editForm, status: e.target.value as MachineStatus })} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', background: 'white' }}>
                      {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Risk Category</label>
                    <select value={editForm.risk_category || "normal"} onChange={(e) => setEditForm({ ...editForm, risk_category: e.target.value as "normal" | "high_risk" | "aerospace" })} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', background: 'white' }}>
                      {riskOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Description</label>
                  <textarea value={editForm.description || ""} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={3} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', resize: 'vertical' }} />
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div>
                  <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Manufacturer</p>
                  <p style={{ fontWeight: '500', color: '#111827' }}>{machine.manufacturer || "-"}</p>
                </div>
                <div>
                  <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Model</p>
                  <p style={{ fontWeight: '500', color: '#111827' }}>{machine.model || "-"}</p>
                </div>
                <div>
                  <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Serial Number</p>
                  <p style={{ fontWeight: '500', color: '#111827' }}>{machine.serial_number || "-"}</p>
                </div>
                <div>
                  <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Location</p>
                  <p style={{ fontWeight: '500', color: '#111827', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg style={{ width: '16px', height: '16px', color: '#9ca3af' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {machine.location || "-"}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Status</p>
                  <span style={{ display: 'inline-block', fontSize: '12px', fontWeight: '500', padding: '4px 10px', borderRadius: '9999px', background: statusConfig[machine.status].bg, color: statusConfig[machine.status].color, textTransform: 'capitalize' }}>
                    {machine.status.replace("_", " ")}
                  </span>
                </div>
                <div>
                  <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Risk Category</p>
                  <span style={{ display: 'inline-block', fontSize: '12px', fontWeight: '500', padding: '4px 10px', borderRadius: '9999px', background: riskConfig[machine.risk_category].bg, color: riskConfig[machine.risk_category].color, textTransform: 'capitalize' }}>
                    {machine.risk_category.replace("_", " ")}
                  </span>
                </div>
                {machine.description && (
                  <div style={{ gridColumn: 'span 2' }}>
                    <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Description</p>
                    <p style={{ fontWeight: '500', color: '#111827' }}>{machine.description}</p>
                  </div>
                )}
                <div>
                  <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Created</p>
                  <p style={{ fontWeight: '500', color: '#111827' }}>{formatDate(machine.created_at)}</p>
                </div>
                <div>
                  <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Last Updated</p>
                  <p style={{ fontWeight: '500', color: '#111827' }}>{formatDate(machine.updated_at)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Available Checklists */}
          <div style={{ ...cardStyle, padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>Available Checklists</h2>
              {canManage && (
                <Link href={`/admin/templates/new?machineId=${machine.id}`} style={{
                  padding: '8px 16px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#374151',
                  fontWeight: '500',
                }}>
                  Create Template
                </Link>
              )}
            </div>
            {templates.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px' }}>
                <svg style={{ width: '40px', height: '40px', color: '#9ca3af', margin: '0 auto 12px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <p style={{ color: '#6b7280' }}>No checklists configured for this machine</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {templates.map((template) => (
                  <div key={template.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '8px', background: '#f8fafc' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <svg style={{ width: '20px', height: '20px', color: '#0057A8' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                      <div>
                        <p style={{ fontWeight: '500', color: '#111827' }}>{template.name}</p>
                        <p style={{ fontSize: '13px', color: '#6b7280', textTransform: 'capitalize' }}>{template.type.replace("_", " ")} • v{template.version}</p>
                      </div>
                    </div>
                    <Link href={`/checklists/new?machineId=${machine.id}&templateId=${template.id}`} style={{
                      padding: '8px 16px',
                      background: '#0057A8',
                      color: 'white',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                    }}>
                      Start
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Quick Actions */}
          <div style={{ ...cardStyle, padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', color: '#374151', cursor: 'pointer', textAlign: 'left' }}>
                <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Schedule Maintenance
              </button>
              <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', color: '#374151', cursor: 'pointer', textAlign: 'left' }}>
                <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Report Issue
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div style={{ ...cardStyle, padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>Recent Activity</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', marginTop: '6px' }} />
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>Pre-Run Checklist Completed</p>
                  <p style={{ fontSize: '12px', color: '#6b7280' }}>John Smith • 2 hours ago</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', marginTop: '6px' }} />
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>Machine status changed to In Use</p>
                  <p style={{ fontSize: '12px', color: '#6b7280' }}>System • 2 hours ago</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b', marginTop: '6px' }} />
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>Maintenance Task Due</p>
                  <p style={{ fontSize: '12px', color: '#6b7280' }}>Lubrication check • Tomorrow</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
