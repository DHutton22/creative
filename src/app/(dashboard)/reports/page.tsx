"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const cardStyle: React.CSSProperties = {
  background: 'white',
  borderRadius: '12px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  border: '1px solid #e2e8f0',
};

const BRAND_BLUE = '#0057A8';

interface UserStats {
  id: string;
  name: string;
  email: string;
  role: string;
  completedChecklists: number;
  inProgressChecklists: number;
  failedChecks: number;
  lastActive: string | null;
}

interface MachineStats {
  id: string;
  name: string;
  completedChecklists: number;
  failedChecks: number;
  compliance: number;
}

interface RecentActivity {
  id: string;
  type: 'checklist_completed' | 'checklist_started' | 'checklist_aborted';
  userId: string;
  userName: string;
  machineName: string;
  templateName: string;
  time: string;
  timeAgo: string;
}

interface MonthlyData {
  month: string;
  total: number;
  completed: number;
  rate: number;
}

const roleColors: Record<string, { bg: string; color: string }> = {
  admin: { bg: "#fef3c7", color: "#92400e" },
  supervisor: { bg: "#dbeafe", color: "#1e40af" },
  operator: { bg: "#dcfce7", color: "#166534" },
  maintenance: { bg: "#f3e8ff", color: "#7c3aed" },
  viewer: { bg: "#f3f4f6", color: "#6b7280" },
};

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("30days");
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "machines">("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalChecklists: 0,
    completedChecklists: 0,
    failedChecks: 0,
    inProgress: 0,
    activeUsers: 0,
  });
  const [userStats, setUserStats] = useState<UserStats[]>([]);
  const [machineStats, setMachineStats] = useState<MachineStats[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const days = dateRange === "7days" ? 7 : dateRange === "30days" ? 30 : 90;

    try {
      const response = await fetch(`/api/reports?days=${days}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch reports");
      }

      const data = await response.json();

      setStats(data.stats);
      setUserStats(data.userStats);
      setMachineStats(data.machineStats);
      
      // Add timeAgo to recent activity
      const activityWithTimeAgo = data.recentActivity.map((a: any) => ({
        ...a,
        timeAgo: getTimeAgo(a.time),
      }));
      setRecentActivity(activityWithTimeAgo);
      
      setMonthlyData(data.monthlyData);
    } catch (err: any) {
      console.error("Error fetching reports:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const complianceRate = stats.totalChecklists > 0 
    ? Math.round((stats.completedChecklists / stats.totalChecklists) * 100)
    : 0;

  const getActivityStyle = (type: string) => {
    switch (type) {
      case 'checklist_completed':
        return { bg: '#dcfce7', color: '#16a34a', label: 'Completed' };
      case 'checklist_started':
        return { bg: '#dbeafe', color: '#1e40af', label: 'Started' };
      case 'checklist_aborted':
        return { bg: '#fee2e2', color: '#991b1b', label: 'Aborted' };
      default:
        return { bg: '#f3f4f6', color: '#6b7280', label: 'Activity' };
    }
  };

  if (error) {
    return (
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ ...cardStyle, padding: '40px' }}>
          <svg style={{ width: '48px', height: '48px', color: '#dc2626', margin: '0 auto 16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Unable to Load Reports</h2>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>{error}</p>
          <button 
            onClick={() => fetchStats()}
            style={{ padding: '10px 20px', background: BRAND_BLUE, color: 'white', border: 'none', borderRadius: '8px', fontWeight: '500', cursor: 'pointer' }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Reports & Activity</h1>
          <p style={{ color: '#6b7280', marginTop: '4px' }}>Track user activity, compliance, and performance</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            style={{ padding: '10px 32px 10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', background: 'white', cursor: 'pointer', minWidth: '150px' }}
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
          </select>
          <button 
            onClick={() => fetchStats()}
            disabled={isLoading}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#374151', fontWeight: '500', fontSize: '14px', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.6 : 1 }}
          >
            <svg style={{ width: '16px', height: '16px', animation: isLoading ? 'spin 1s linear infinite' : 'none' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {isLoading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ ...cardStyle, padding: '20px' }}>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>Compliance Rate</p>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: complianceRate >= 90 ? '#16a34a' : complianceRate >= 70 ? '#d97706' : '#dc2626', margin: '4px 0 0 0' }}>
            {isLoading ? "-" : `${complianceRate}%`}
          </p>
        </div>
        <div style={{ ...cardStyle, padding: '20px' }}>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>Total Checklists</p>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', margin: '4px 0 0 0' }}>
            {isLoading ? "-" : stats.totalChecklists}
          </p>
        </div>
        <div style={{ ...cardStyle, padding: '20px' }}>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>Completed</p>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#16a34a', margin: '4px 0 0 0' }}>
            {isLoading ? "-" : stats.completedChecklists}
          </p>
        </div>
        <div style={{ ...cardStyle, padding: '20px' }}>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>Failed Checks</p>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: stats.failedChecks > 0 ? '#dc2626' : '#16a34a', margin: '4px 0 0 0' }}>
            {isLoading ? "-" : stats.failedChecks}
          </p>
        </div>
        <div style={{ ...cardStyle, padding: '20px' }}>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>Active Users</p>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: BRAND_BLUE, margin: '4px 0 0 0' }}>
            {isLoading ? "-" : stats.activeUsers}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ ...cardStyle, marginBottom: '24px' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0' }}>
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'users', label: 'User Activity' },
            { id: 'machines', label: 'Machine Performance' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '14px 24px',
                border: 'none',
                background: 'none',
                color: activeTab === tab.id ? BRAND_BLUE : '#6b7280',
                fontWeight: activeTab === tab.id ? '600' : '400',
                fontSize: '14px',
                cursor: 'pointer',
                borderBottom: activeTab === tab.id ? `2px solid ${BRAND_BLUE}` : '2px solid transparent',
                marginBottom: '-1px',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ padding: '24px' }}>
          {activeTab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
              {/* Monthly Trend */}
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>Monthly Compliance Trend</h3>
                {isLoading ? (
                  <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>Loading...</div>
                ) : monthlyData.some(m => m.total > 0) ? (
                  <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '8px' }}>
                    {monthlyData.map((data) => (
                      <div key={data.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '100%', background: data.total > 0 ? BRAND_BLUE : '#e2e8f0', borderRadius: '4px 4px 0 0', height: `${data.total > 0 ? Math.max((data.rate / 100) * 160, 16) : 16}px` }} />
                        <span style={{ fontSize: '11px', color: '#6b7280' }}>{data.month}</span>
                        <span style={{ fontSize: '12px', fontWeight: '500', color: '#111827' }}>{data.total > 0 ? `${data.rate}%` : '-'}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>No data yet</div>
                )}
              </div>

              {/* Recent Activity */}
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>Recent Activity</h3>
                {isLoading ? (
                  <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>Loading...</div>
                ) : recentActivity.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '280px', overflowY: 'auto' }}>
                    {recentActivity.slice(0, 8).map((entry) => {
                      const style = getActivityStyle(entry.type);
                      return (
                        <Link key={entry.id} href={`/checklists/${entry.id}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', padding: '8px', borderRadius: '8px', background: '#f8fafc' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: style.color, flexShrink: 0 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: '13px', fontWeight: '500', color: '#111827', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {entry.userName} - {entry.templateName}
                            </p>
                            <p style={{ fontSize: '11px', color: '#6b7280', margin: '2px 0 0 0' }}>{entry.machineName} • {entry.timeAgo}</p>
                          </div>
                          <span style={{ fontSize: '10px', fontWeight: '500', padding: '2px 8px', borderRadius: '9999px', background: style.bg, color: style.color, whiteSpace: 'nowrap' }}>
                            {style.label}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>No activity yet</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>User Activity Summary</h3>
              {isLoading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Loading...</div>
              ) : userStats.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                        <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>User</th>
                        <th style={{ textAlign: 'center', padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Role</th>
                        <th style={{ textAlign: 'center', padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Completed</th>
                        <th style={{ textAlign: 'center', padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>In Progress</th>
                        <th style={{ textAlign: 'center', padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Failed Checks</th>
                        <th style={{ textAlign: 'right', padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Last Active</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userStats.map((user) => (
                        <tr key={user.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: BRAND_BLUE, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '14px' }}>
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p style={{ fontWeight: '500', color: '#111827', margin: 0 }}>{user.name}</p>
                                <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0 0' }}>{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td style={{ textAlign: 'center', padding: '14px 16px' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '4px 12px',
                              borderRadius: '9999px',
                              fontSize: '12px',
                              fontWeight: '500',
                              background: roleColors[user.role]?.bg || '#f3f4f6',
                              color: roleColors[user.role]?.color || '#6b7280',
                              textTransform: 'capitalize',
                            }}>
                              {user.role}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center', padding: '14px 16px' }}>
                            <span style={{ fontSize: '16px', fontWeight: '600', color: '#16a34a' }}>{user.completedChecklists}</span>
                          </td>
                          <td style={{ textAlign: 'center', padding: '14px 16px' }}>
                            <span style={{ fontSize: '16px', fontWeight: '600', color: user.inProgressChecklists > 0 ? '#d97706' : '#6b7280' }}>{user.inProgressChecklists}</span>
                          </td>
                          <td style={{ textAlign: 'center', padding: '14px 16px' }}>
                            <span style={{
                              fontSize: '12px',
                              fontWeight: '500',
                              padding: '4px 10px',
                              borderRadius: '9999px',
                              background: user.failedChecks > 5 ? '#fee2e2' : user.failedChecks > 0 ? '#fef3c7' : '#dcfce7',
                              color: user.failedChecks > 5 ? '#991b1b' : user.failedChecks > 0 ? '#92400e' : '#166534',
                            }}>
                              {user.failedChecks}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right', padding: '14px 16px', color: '#6b7280', fontSize: '13px' }}>
                            {user.lastActive ? getTimeAgo(user.lastActive) : 'Never'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                  <p>No user activity in this period</p>
                  <Link href="/checklists/new" style={{ color: BRAND_BLUE, textDecoration: 'underline', marginTop: '8px', display: 'inline-block' }}>
                    Run a checklist to start tracking
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === 'machines' && (
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>Machine Performance</h3>
              {isLoading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Loading...</div>
              ) : machineStats.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                        <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Machine</th>
                        <th style={{ textAlign: 'center', padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Completed Checklists</th>
                        <th style={{ textAlign: 'center', padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Failed Checks</th>
                        <th style={{ textAlign: 'center', padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Compliance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {machineStats.map((machine) => (
                        <tr key={machine.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <svg style={{ width: '24px', height: '24px', color: '#6b7280' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                              </svg>
                              <span style={{ fontWeight: '500', color: '#111827' }}>{machine.name}</span>
                            </div>
                          </td>
                          <td style={{ textAlign: 'center', padding: '14px 16px' }}>
                            <span style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>{machine.completedChecklists}</span>
                          </td>
                          <td style={{ textAlign: 'center', padding: '14px 16px' }}>
                            <span style={{
                              fontSize: '12px',
                              fontWeight: '500',
                              padding: '4px 10px',
                              borderRadius: '9999px',
                              background: machine.failedChecks > 5 ? '#fee2e2' : machine.failedChecks > 0 ? '#fef3c7' : '#dcfce7',
                              color: machine.failedChecks > 5 ? '#991b1b' : machine.failedChecks > 0 ? '#92400e' : '#166534',
                            }}>
                              {machine.failedChecks}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center', padding: '14px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                              <div style={{ width: '100px', height: '8px', background: '#f3f4f6', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', background: machine.compliance >= 90 ? '#16a34a' : machine.compliance >= 70 ? '#d97706' : '#dc2626', width: `${machine.compliance}%` }} />
                              </div>
                              <span style={{ fontWeight: '600', color: machine.compliance >= 90 ? '#16a34a' : machine.compliance >= 70 ? '#d97706' : '#dc2626', minWidth: '45px' }}>
                                {machine.compliance}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                  <p>No machine data in this period</p>
                  <Link href="/checklists/new" style={{ color: BRAND_BLUE, textDecoration: 'underline', marginTop: '8px', display: 'inline-block' }}>
                    Run a checklist to start tracking
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
