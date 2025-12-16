"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { MaintenanceTask, MaintenanceTaskStatus } from "@/types/database";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";

const statusConfig: Record<MaintenanceTaskStatus, { bg: string; color: string; label: string }> = {
  upcoming: { bg: "#dbeafe", color: "#1e40af", label: "Upcoming" },
  due: { bg: "#fef3c7", color: "#92400e", label: "Due" },
  overdue: { bg: "#fee2e2", color: "#991b1b", label: "Overdue" },
  completed: { bg: "#dcfce7", color: "#166534", label: "Completed" },
  cancelled: { bg: "#f3f4f6", color: "#6b7280", label: "Cancelled" },
};

interface MaintenanceTaskWithDetails extends MaintenanceTask {
  machines?: { name: string } | null;
  moulds?: { name: string } | null;
  assigned_user?: { name: string } | null;
}

const cardStyle: React.CSSProperties = {
  background: 'white',
  borderRadius: '12px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  border: '1px solid #e2e8f0',
};

export default function MaintenancePage() {
  const [tasks, setTasks] = useState<MaintenanceTaskWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("active");
  const { hasRole } = useAuth();
  const supabase = createClient();

  const canManage = hasRole(["admin", "supervisor", "maintenance"]);

  useEffect(() => {
    fetchTasks();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const fetchTasks = async () => {
    setIsLoading(true);
    let query = supabase
      .from("maintenance_tasks")
      .select(`
        *,
        machines (name),
        moulds (name)
      `)
      .order("due_at", { ascending: true });

    if (statusFilter === "active") {
      query = query.in("status", ["upcoming", "due", "overdue"]);
    } else if (statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    const { data, error } = await query.limit(50);

    if (error) {
      console.error("Error fetching tasks:", error);
    } else {
      setTasks(data || []);
    }
    setIsLoading(false);
  };

  const handleComplete = async (taskId: string) => {
    const { error } = await supabase
      .from("maintenance_tasks")
      .update({
        status: "completed",
        last_completed_at: new Date().toISOString(),
      })
      .eq("id", taskId);

    if (!error) {
      fetchTasks();
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.machines?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.moulds?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const overdueCount = tasks.filter((t) => t.status === "overdue").length;
  const dueCount = tasks.filter((t) => t.status === "due").length;
  const upcomingCount = tasks.filter((t) => t.status === "upcoming").length;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Maintenance</h1>
          <p style={{ color: '#6b7280', marginTop: '4px' }}>Schedule and track preventative maintenance tasks</p>
        </div>
        {canManage && (
          <Link href="/maintenance/new" style={{
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
            <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Schedule Task
          </Link>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ ...cardStyle, padding: '20px', borderColor: overdueCount > 0 ? '#fecaca' : '#e2e8f0', background: overdueCount > 0 ? '#fef2f2' : 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg style={{ width: '24px', height: '24px', color: '#dc2626' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>{overdueCount}</p>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Overdue</p>
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
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>{dueCount}</p>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Due Now</p>
            </div>
          </div>
        </div>
        <div style={{ ...cardStyle, padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg style={{ width: '24px', height: '24px', color: '#2563eb' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>{upcomingCount}</p>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Upcoming</p>
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
              placeholder="Search tasks..."
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
            <option value="active">Active Tasks</option>
            <option value="all">All Tasks</option>
            <option value="overdue">Overdue</option>
            <option value="due">Due Now</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Tasks List */}
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
      ) : filteredTasks.length === 0 ? (
        <div style={{ ...cardStyle, padding: '48px', textAlign: 'center' }}>
          <svg style={{ width: '48px', height: '48px', color: '#9ca3af', margin: '0 auto 16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
          </svg>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>No maintenance tasks found</h3>
          <p style={{ color: '#6b7280', marginBottom: '16px' }}>
            {searchQuery || statusFilter !== "active"
              ? "Try adjusting your filters"
              : "All caught up! No maintenance tasks scheduled."}
          </p>
          {canManage && (
            <Link href="/maintenance/new" style={{
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
              <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Schedule Task
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              style={{
                ...cardStyle,
                padding: '20px',
                borderColor: task.status === "overdue" ? '#fecaca' : task.status === "due" ? '#fde68a' : '#e2e8f0',
                background: task.status === "overdue" ? '#fef2f2' : task.status === "due" ? '#fffbeb' : 'white',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: statusConfig[task.status].bg,
                  flexShrink: 0,
                }}>
                  <svg style={{ width: '24px', height: '24px', color: statusConfig[task.status].color }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                    <h3 style={{ fontWeight: '600', color: '#111827', margin: 0 }}>{task.name}</h3>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: '500',
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      background: statusConfig[task.status].bg,
                      color: statusConfig[task.status].color,
                    }}>
                      {statusConfig[task.status].label}
                    </span>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: '500',
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      background: '#f3f4f6',
                      color: '#374151',
                      textTransform: 'capitalize',
                    }}>
                      {task.type}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#6b7280', flexWrap: 'wrap' }}>
                    {task.machines && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                        {task.machines.name}
                      </span>
                    )}
                    {task.moulds && <span>Mould: {task.moulds.name}</span>}
                    <span>•</span>
                    <span>
                      {task.schedule_type === "time_based"
                        ? `Every ${task.interval_days} days`
                        : task.schedule_type === "usage_based"
                        ? `Every ${task.interval_cycles} cycles`
                        : "Mixed schedule"}
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {task.due_at && (
                    <>
                      <p style={{ fontSize: '14px', fontWeight: '500', color: '#111827', margin: 0 }}>
                        Due: {formatDate(task.due_at)}
                      </p>
                      {task.last_completed_at && (
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0 0' }}>
                          Last: {formatDate(task.last_completed_at)}
                        </p>
                      )}
                    </>
                  )}
                </div>
                {canManage && task.status !== "completed" && (
                  <button
                    onClick={() => handleComplete(task.id)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      background: task.status === "overdue" ? '#dc2626' : 'white',
                      color: task.status === "overdue" ? 'white' : '#374151',
                      border: task.status === "overdue" ? 'none' : '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontWeight: '500',
                      fontSize: '14px',
                      cursor: 'pointer',
                    }}
                  >
                    <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Complete
                  </button>
                )}
              </div>
              {task.description && (
                <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '12px', paddingLeft: '64px' }}>
                  {task.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
