"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Machine, MachineStatus } from "@/types/database";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";

interface MachineWithDetails extends Machine {
  work_centres?: { id: string; name: string } | null;
}

interface MaintenanceTask {
  id: string;
  name: string;
  status: string;
  due_at: string;
}

interface ChecklistRun {
  id: string;
  status: string;
  started_at: string;
  checklist_templates: { name: string } | null;
  profiles: { name: string } | null;
}

interface ChecklistTemplate {
  id: string;
  name: string;
  type: string;
  status: string;
}

const cardStyle: React.CSSProperties = {
  background: 'white',
  borderRadius: '12px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  border: '1px solid #e2e8f0',
};

const BRAND_BLUE = '#0057A8';

const statusConfig: Record<MachineStatus, { bg: string; color: string; label: string }> = {
  available: { bg: "#dcfce7", color: "#166534", label: "Available" },
  in_use: { bg: "#dbeafe", color: "#1e40af", label: "In Use" },
  under_maintenance: { bg: "#fef3c7", color: "#92400e", label: "Under Maintenance" },
  locked_out: { bg: "#fee2e2", color: "#991b1b", label: "Locked Out" },
  decommissioned: { bg: "#f3f4f6", color: "#6b7280", label: "Decommissioned" },
};

const typeLabels: Record<string, string> = {
  pre_run: "Pre-Run",
  first_off: "First-Off",
  shutdown: "Shutdown",
  maintenance: "Maintenance",
  safety: "Safety",
  quality: "Quality",
};

export default function MachineDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [machine, setMachine] = useState<MachineWithDetails | null>(null);
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>([]);
  const [recentChecklists, setRecentChecklists] = useState<ChecklistRun[]>([]);
  const [availableTemplates, setAvailableTemplates] = useState<ChecklistTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const { hasRole } = useAuth();
  const supabase = createClient();

  const canManage = hasRole(["admin", "supervisor"]);
  const canRunChecklist = hasRole(["admin", "supervisor", "operator"]);

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedParams.id]);

  const fetchData = async () => {
    setIsLoading(true);

    const { data: machineData } = await supabase
      .from("machines")
      .select(`
        *,
        work_centres (id, name)
      `)
      .eq("id", resolvedParams.id)
      .single();

    if (!machineData) {
      router.push("/work-centres");
      return;
    }

    setMachine(machineData);

    // Fetch available checklist templates (machine-specific OR generic)
    const { data: templatesData } = await supabase
      .from("checklist_templates")
      .select("id, name, type, status, machine_id")
      .eq("status", "active")
      .or(`machine_id.eq.${resolvedParams.id},machine_id.is.null`);

    setAvailableTemplates(templatesData || []);

    // Fetch maintenance tasks for this machine
    const { data: tasksData } = await supabase
      .from("maintenance_tasks")
      .select("id, name, status, due_at")
      .eq("machine_id", resolvedParams.id)
      .in("status", ["upcoming", "due", "overdue"])
      .order("due_at")
      .limit(5);

    setMaintenanceTasks(tasksData || []);

    // Fetch recent checklists
    const { data: checklistsData } = await supabase
      .from("checklist_runs")
      .select(`
        id, status, started_at,
        checklist_templates (name),
        profiles (name)
      `)
      .eq("machine_id", resolvedParams.id)
      .order("started_at", { ascending: false })
      .limit(5);

    setRecentChecklists(checklistsData || []);

    setIsLoading(false);
  };

  const updateStatus = async (newStatus: MachineStatus) => {
    if (!machine) return;
    setIsUpdating(true);

    const { error } = await supabase
      .from("machines")
      .update({ status: newStatus })
      .eq("id", machine.id);

    if (!error) {
      setMachine({ ...machine, status: newStatus });
    }
    setIsUpdating(false);
  };

  if (isLoading) {
    return (
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ height: '32px', background: '#f3f4f6', borderRadius: '8px', width: '200px', marginBottom: '24px' }} />
        <div style={{ ...cardStyle, height: '300px' }} />
      </div>
    );
  }

  if (!machine) return null;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/work-centres" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 12px', color: '#6b7280', fontSize: '14px', fontWeight: '500', textDecoration: 'none' }}>
            <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>{machine.name}</h1>
              <span style={{
                fontSize: '14px',
                fontWeight: '500',
                padding: '6px 14px',
                borderRadius: '9999px',
                background: statusConfig[machine.status].bg,
                color: statusConfig[machine.status].color,
              }}>
                {statusConfig[machine.status].label}
              </span>
            </div>
            {machine.work_centres && (
              <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>
                <Link href="/work-centres" style={{ color: BRAND_BLUE, textDecoration: 'none' }}>
                  {machine.work_centres.name}
                </Link>
              </p>
            )}
          </div>
        </div>
        {canManage && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link href={`/machines/${machine.id}/edit`} style={{
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
              <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </Link>
          </div>
        )}
      </div>

      {/* Available Checklists - Prominent Section */}
      {canRunChecklist && availableTemplates.length > 0 && (
        <div style={{ ...cardStyle, padding: '24px', marginBottom: '24px', background: '#f8fafc', borderColor: BRAND_BLUE }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg style={{ width: '20px', height: '20px', color: BRAND_BLUE }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Available Checklists
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
            {availableTemplates.map((template) => (
              <Link
                key={template.id}
                href={`/checklists/new?templateId=${template.id}&machineId=${machine.id}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '16px',
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: '600',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: '#e0f2fe',
                    color: '#0369a1',
                    textTransform: 'uppercase',
                  }}>
                    {typeLabels[template.type] || template.type}
                  </span>
                </div>
                <p style={{ fontWeight: '600', color: '#111827', margin: 0, fontSize: '14px', flex: 1 }}>
                  {template.name}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px', color: BRAND_BLUE, fontSize: '13px', fontWeight: '500' }}>
                  <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Start Checklist
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Machine Details */}
          <div style={{ ...cardStyle, padding: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>Machine Details</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Manufacturer</p>
                <p style={{ fontWeight: '500', color: '#111827', margin: 0 }}>{machine.manufacturer || '-'}</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Model</p>
                <p style={{ fontWeight: '500', color: '#111827', margin: 0 }}>{machine.model || '-'}</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Serial Number</p>
                <p style={{ fontWeight: '500', color: '#111827', margin: 0 }}>{machine.serial_number || '-'}</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Year</p>
                <p style={{ fontWeight: '500', color: '#111827', margin: 0 }}>{machine.year || '-'}</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Location</p>
                <p style={{ fontWeight: '500', color: '#111827', margin: 0 }}>{machine.location || '-'}</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Added</p>
                <p style={{ fontWeight: '500', color: '#111827', margin: 0 }}>{formatDate(machine.created_at)}</p>
              </div>
            </div>
            {machine.notes && (
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Notes</p>
                <p style={{ color: '#374151', margin: 0 }}>{machine.notes}</p>
              </div>
            )}
          </div>

          {/* Recent Checklists */}
          <div style={{ ...cardStyle, padding: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>Recent Checklist Runs</h2>
            {recentChecklists.length === 0 ? (
              <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px 0' }}>No checklists completed yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recentChecklists.map((run) => (
                  <Link key={run.id} href={`/checklists/${run.id}`} style={{ textDecoration: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: run.status === 'completed' ? '#22c55e' : run.status === 'in_progress' ? '#3b82f6' : '#6b7280',
                      }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: '500', color: '#111827', margin: 0, fontSize: '14px' }}>
                          {run.checklist_templates?.name || 'Unknown Template'}
                        </p>
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0 0' }}>
                          {run.profiles?.name} • {formatDate(run.started_at)}
                        </p>
                      </div>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: '500',
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        background: run.status === 'completed' ? '#dcfce7' : run.status === 'in_progress' ? '#dbeafe' : '#f3f4f6',
                        color: run.status === 'completed' ? '#166534' : run.status === 'in_progress' ? '#1e40af' : '#6b7280',
                        textTransform: 'capitalize',
                      }}>
                        {run.status.replace('_', ' ')}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Quick Actions */}
          {canManage && (
            <div style={{ ...cardStyle, padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>Update Status</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(Object.keys(statusConfig) as MachineStatus[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => updateStatus(status)}
                    disabled={machine.status === status || isUpdating}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      width: '100%',
                      padding: '10px 12px',
                      background: machine.status === status ? statusConfig[status].bg : 'white',
                      border: `1px solid ${machine.status === status ? statusConfig[status].color : '#e2e8f0'}`,
                      borderRadius: '8px',
                      cursor: machine.status === status ? 'default' : 'pointer',
                      opacity: isUpdating ? 0.7 : 1,
                      textAlign: 'left',
                    }}
                  >
                    <div style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: statusConfig[status].color,
                    }} />
                    <span style={{ fontWeight: '500', color: '#374151', fontSize: '14px' }}>
                      {statusConfig[status].label}
                    </span>
                    {machine.status === status && (
                      <svg style={{ marginLeft: 'auto', width: '16px', height: '16px', color: statusConfig[status].color }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Maintenance */}
          <div style={{ ...cardStyle, padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>Maintenance</h3>
              <Link href={`/maintenance/new?machineId=${machine.id}`} style={{ color: BRAND_BLUE, fontSize: '13px', fontWeight: '500', textDecoration: 'none' }}>
                + Add
              </Link>
            </div>
            {maintenanceTasks.length === 0 ? (
              <p style={{ color: '#6b7280', textAlign: 'center', padding: '12px 0', fontSize: '14px' }}>No maintenance scheduled</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {maintenanceTasks.map((task) => (
                  <div key={task.id} style={{
                    padding: '10px',
                    background: task.status === 'overdue' ? '#fef2f2' : task.status === 'due' ? '#fffbeb' : '#f8fafc',
                    borderRadius: '8px',
                    borderLeft: `3px solid ${task.status === 'overdue' ? '#dc2626' : task.status === 'due' ? '#d97706' : '#3b82f6'}`,
                  }}>
                    <p style={{ fontWeight: '500', color: '#111827', margin: 0, fontSize: '14px' }}>{task.name}</p>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}>
                      Due: {formatDate(task.due_at)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
