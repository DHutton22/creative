"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { MaintenanceTaskInsert } from "@/types/database";
import Link from "next/link";

interface SelectOption {
  id: string;
  name: string;
}

const cardStyle: React.CSSProperties = {
  background: 'white',
  borderRadius: '12px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  border: '1px solid #e2e8f0',
};

const typeOptions = [
  { value: "preventative", label: "Preventative" },
  { value: "corrective", label: "Corrective" },
];

const scheduleOptions = [
  { value: "time_based", label: "Time-Based (days)" },
  { value: "usage_based", label: "Usage-Based (cycles)" },
  { value: "mixed", label: "Mixed (days or cycles)" },
];

export default function NewMaintenanceTaskPage() {
  const router = useRouter();
  const [machines, setMachines] = useState<SelectOption[]>([]);
  const [moulds, setMoulds] = useState<SelectOption[]>([]);
  const [templates, setTemplates] = useState<SelectOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<Partial<MaintenanceTaskInsert>>({
    type: "preventative",
    schedule_type: "time_based",
    status: "upcoming",
  });

  const supabase = createClient();

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    const { data: machinesData } = await supabase.from("machines").select("id, name").order("name");
    const { data: mouldsData } = await supabase.from("moulds").select("id, name").order("name");
    const { data: templatesData } = await supabase.from("checklist_templates").select("id, name").eq("type", "maintenance").eq("status", "active");

    setMachines((machinesData as SelectOption[]) || []);
    setMoulds((mouldsData as SelectOption[]) || []);
    setTemplates((templatesData as SelectOption[]) || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!form.name) {
      setError("Task name is required");
      setIsLoading(false);
      return;
    }

    if (!form.machine_id && !form.mould_id) {
      setError("Please select a machine or mould");
      setIsLoading(false);
      return;
    }

    let dueAt: string | null = null;
    if (form.interval_days) {
      const due = new Date();
      due.setDate(due.getDate() + form.interval_days);
      dueAt = due.toISOString();
    }

    const { error: insertError } = await supabase.from("maintenance_tasks").insert({
      name: form.name,
      description: form.description || null,
      type: form.type || "preventative",
      schedule_type: form.schedule_type || "time_based",
      machine_id: form.machine_id || null,
      mould_id: form.mould_id || null,
      interval_days: form.interval_days || null,
      interval_cycles: form.interval_cycles || null,
      template_id: form.template_id || null,
      due_at: dueAt,
      status: "upcoming",
    });

    if (insertError) {
      console.error("Error creating task:", insertError);
      setError(insertError.message);
    } else {
      router.push("/maintenance");
    }
    setIsLoading(false);
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <Link href="/maintenance" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 12px', color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>
          <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Schedule Maintenance Task</h1>
          <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>Create a new maintenance task</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {error && (
          <div style={{ padding: '12px', borderRadius: '8px', background: '#fee2e2', border: '1px solid #fecaca', color: '#991b1b', fontSize: '14px' }}>
            {error}
          </div>
        )}

        {/* Task Details */}
        <div style={{ ...cardStyle, padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg style={{ width: '20px', height: '20px', color: '#0057A8' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>Task Details</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Task Name *</label>
              <input type="text" placeholder="e.g. Lubrication Check" value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} required style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Description</label>
              <textarea placeholder="Describe the maintenance task..." value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', resize: 'vertical' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Task Type</label>
                <select value={form.type || "preventative"} onChange={(e) => setForm({ ...form, type: e.target.value as MaintenanceTaskInsert["type"] })} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', background: 'white' }}>
                  {typeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Schedule Type</label>
                <select value={form.schedule_type || "time_based"} onChange={(e) => setForm({ ...form, schedule_type: e.target.value as MaintenanceTaskInsert["schedule_type"] })} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', background: 'white' }}>
                  {scheduleOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Assignment */}
        <div style={{ ...cardStyle, padding: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>Assignment</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Machine</label>
              <select value={form.machine_id || ""} onChange={(e) => setForm({ ...form, machine_id: e.target.value || undefined })} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', background: 'white' }}>
                <option value="">Select a machine...</option>
                {machines.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Mould (optional)</label>
              <select value={form.mould_id || ""} onChange={(e) => setForm({ ...form, mould_id: e.target.value || undefined })} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', background: 'white' }}>
                <option value="">Select a mould...</option>
                {moulds.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            {templates.length > 0 && (
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Maintenance Checklist (optional)</label>
                <select value={form.template_id || ""} onChange={(e) => setForm({ ...form, template_id: e.target.value || undefined })} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', background: 'white' }}>
                  <option value="">No checklist</option>
                  {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Link a checklist template for guided maintenance</p>
              </div>
            )}
          </div>
        </div>

        {/* Schedule */}
        <div style={{ ...cardStyle, padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg style={{ width: '20px', height: '20px', color: '#0057A8' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>Schedule</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {(form.schedule_type === "time_based" || form.schedule_type === "mixed") && (
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Interval (days)</label>
                <input type="number" placeholder="e.g. 30" value={form.interval_days || ""} onChange={(e) => setForm({ ...form, interval_days: Number(e.target.value) || undefined })} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }} />
                <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>How often this task should be performed (in days)</p>
              </div>
            )}
            {(form.schedule_type === "usage_based" || form.schedule_type === "mixed") && (
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Interval (cycles/shots)</label>
                <input type="number" placeholder="e.g. 5000" value={form.interval_cycles || ""} onChange={(e) => setForm({ ...form, interval_cycles: Number(e.target.value) || undefined })} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }} />
                <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>How often based on machine cycles or mould shots</p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/maintenance" style={{ flex: 1 }}>
            <button type="button" style={{ width: '100%', padding: '12px 20px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#374151', fontWeight: '500', fontSize: '14px', cursor: 'pointer' }}>
              Cancel
            </button>
          </Link>
          <button type="submit" disabled={isLoading} style={{
            flex: 1,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px 20px',
            background: '#0057A8',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            fontSize: '14px',
            cursor: 'pointer',
            opacity: isLoading ? 0.7 : 1,
          }}>
            <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            {isLoading ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </form>
    </div>
  );
}
