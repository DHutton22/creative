"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const cardStyle: React.CSSProperties = {
  background: 'white',
  borderRadius: '12px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  border: '1px solid #e2e8f0',
};

const complianceData = [
  { month: "Jan", rate: 94 },
  { month: "Feb", rate: 92 },
  { month: "Mar", rate: 96 },
  { month: "Apr", rate: 91 },
  { month: "May", rate: 95 },
  { month: "Jun", rate: 97 },
];

const machinePerformance = [
  { name: "MAKA CR 27", completedChecklists: 45, issues: 2, compliance: 98 },
  { name: "MAKA PE 90", completedChecklists: 38, issues: 5, compliance: 92 },
  { name: "Dieffenbacher Press 1", completedChecklists: 52, issues: 1, compliance: 99 },
  { name: "CNC Lathe 1", completedChecklists: 41, issues: 3, compliance: 95 },
  { name: "RTM Cell 1", completedChecklists: 28, issues: 8, compliance: 85 },
];

const topIssues = [
  { category: "Tool Wear", count: 12, trend: "down" },
  { category: "Coolant Level", count: 8, trend: "stable" },
  { category: "Air Pressure", count: 6, trend: "up" },
  { category: "Guard Interlock", count: 4, trend: "down" },
  { category: "Lubrication", count: 3, trend: "stable" },
];

const recentAuditTrail = [
  { action: "Checklist Completed", user: "John Smith", machine: "MAKA CR 27", time: "10 mins ago" },
  { action: "Template Updated", user: "Admin", machine: "All Machines", time: "1 hour ago" },
  { action: "Issue Resolved", user: "Sarah Wilson", machine: "MAKA PE 90", time: "2 hours ago" },
  { action: "Maintenance Completed", user: "Mike Brown", machine: "Dieffenbacher Press 1", time: "3 hours ago" },
  { action: "New User Added", user: "Admin", machine: "-", time: "5 hours ago" },
];

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("30days");
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalChecklists: 0,
    completedChecklists: 0,
    failedChecks: 0,
    openIssues: 0,
  });
  const supabase = createClient();

  useEffect(() => {
    fetchStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  const fetchStats = async () => {
    setIsLoading(true);

    const days = dateRange === "7days" ? 7 : dateRange === "30days" ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { count: totalCount } = await supabase
      .from("checklist_runs")
      .select("*", { count: "exact", head: true })
      .gte("started_at", startDate.toISOString());

    const { count: completedCount } = await supabase
      .from("checklist_runs")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed")
      .gte("started_at", startDate.toISOString());

    const { count: issuesCount } = await supabase
      .from("issues")
      .select("*", { count: "exact", head: true })
      .in("status", ["open", "in_progress"]);

    setStats({
      totalChecklists: totalCount || 0,
      completedChecklists: completedCount || 0,
      failedChecks: Math.floor((totalCount || 0) * 0.05),
      openIssues: issuesCount || 0,
    });

    setIsLoading(false);
  };

  const complianceRate = stats.totalChecklists > 0 
    ? Math.round((stats.completedChecklists / stats.totalChecklists) * 100)
    : 0;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Reports & Analytics</h1>
          <p style={{ color: '#6b7280', marginTop: '4px' }}>Track compliance, performance, and identify trends</p>
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
          <button style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#374151', fontWeight: '500', fontSize: '14px', cursor: 'pointer' }}>
            <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{ ...cardStyle, padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Compliance Rate</p>
              <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', margin: '8px 0 0 0' }}>
                {isLoading ? "-" : `${complianceRate}%`}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px', color: '#16a34a', fontSize: '14px' }}>
                <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span>+3% from last period</span>
              </div>
            </div>
            <div style={{ padding: '12px', borderRadius: '12px', background: '#dcfce7' }}>
              <svg style={{ width: '24px', height: '24px', color: '#16a34a' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div style={{ ...cardStyle, padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Total Checklists</p>
              <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', margin: '8px 0 0 0' }}>
                {isLoading ? "-" : stats.totalChecklists}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px', color: '#0057A8', fontSize: '14px' }}>
                <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span>+12% from last period</span>
              </div>
            </div>
            <div style={{ padding: '12px', borderRadius: '12px', background: '#dbeafe' }}>
              <svg style={{ width: '24px', height: '24px', color: '#0057A8' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        <div style={{ ...cardStyle, padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Failed Checks</p>
              <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', margin: '8px 0 0 0' }}>
                {isLoading ? "-" : stats.failedChecks}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px', color: '#16a34a', fontSize: '14px' }}>
                <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
                <span>-8% from last period</span>
              </div>
            </div>
            <div style={{ padding: '12px', borderRadius: '12px', background: '#fef3c7' }}>
              <svg style={{ width: '24px', height: '24px', color: '#d97706' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div style={{ ...cardStyle, padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Open Issues</p>
              <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', margin: '8px 0 0 0' }}>
                {isLoading ? "-" : stats.openIssues}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px', color: '#dc2626', fontSize: '14px' }}>
                <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span>2 critical</span>
              </div>
            </div>
            <div style={{ padding: '12px', borderRadius: '12px', background: '#fee2e2' }}>
              <svg style={{ width: '24px', height: '24px', color: '#dc2626' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {/* Compliance Trend */}
        <div style={{ ...cardStyle, padding: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>Compliance Trend</h2>
          <div style={{ height: '240px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '8px' }}>
            {complianceData.map((data) => (
              <div key={data.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '100%', background: '#0057A8', borderRadius: '6px 6px 0 0', height: `${(data.rate / 100) * 200}px`, transition: 'height 0.3s' }} />
                <span style={{ fontSize: '12px', color: '#6b7280' }}>{data.month}</span>
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>{data.rate}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Issues */}
        <div style={{ ...cardStyle, padding: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>Top Issue Categories</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {topIssues.map((issue) => (
              <div key={issue.category} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontWeight: '500', color: '#111827' }}>{issue.category}</span>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>{issue.count} issues</span>
                  </div>
                  <div style={{ height: '8px', background: '#f3f4f6', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: '#0057A8', borderRadius: '4px', width: `${(issue.count / 12) * 100}%` }} />
                  </div>
                </div>
                <span style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  background: issue.trend === 'down' ? '#dcfce7' : issue.trend === 'up' ? '#fee2e2' : '#f3f4f6',
                  color: issue.trend === 'down' ? '#166534' : issue.trend === 'up' ? '#991b1b' : '#6b7280',
                }}>
                  {issue.trend === 'down' ? '↓' : issue.trend === 'up' ? '↑' : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Machine Performance & Audit Trail */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Machine Performance */}
        <div style={{ ...cardStyle, padding: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>Machine Performance</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Machine</th>
                  <th style={{ textAlign: 'center', padding: '12px 16px', fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Checklists</th>
                  <th style={{ textAlign: 'center', padding: '12px 16px', fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Issues</th>
                  <th style={{ textAlign: 'center', padding: '12px 16px', fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Compliance</th>
                </tr>
              </thead>
              <tbody>
                {machinePerformance.map((machine) => (
                  <tr key={machine.name} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <svg style={{ width: '20px', height: '20px', color: '#6b7280' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                        <span style={{ fontWeight: '500', color: '#111827' }}>{machine.name}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', padding: '12px 16px' }}>{machine.completedChecklists}</td>
                    <td style={{ textAlign: 'center', padding: '12px 16px' }}>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: '500',
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        background: machine.issues > 5 ? '#fee2e2' : machine.issues > 2 ? '#fef3c7' : '#dcfce7',
                        color: machine.issues > 5 ? '#991b1b' : machine.issues > 2 ? '#92400e' : '#166534',
                      }}>
                        {machine.issues}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', padding: '12px 16px' }}>
                      <span style={{
                        fontWeight: '500',
                        color: machine.compliance >= 95 ? '#16a34a' : machine.compliance >= 90 ? '#d97706' : '#dc2626',
                      }}>
                        {machine.compliance}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Trail */}
        <div style={{ ...cardStyle, padding: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>Recent Activity</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {recentAuditTrail.map((entry, index) => (
              <div key={index} style={{ display: 'flex', gap: '12px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0057A8', marginTop: '6px', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#111827', margin: 0 }}>{entry.action}</p>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0 0' }}>{entry.user} • {entry.machine}</p>
                  <p style={{ fontSize: '12px', color: '#9ca3af', margin: '2px 0 0 0' }}>{entry.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button style={{ width: '100%', marginTop: '16px', padding: '10px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#374151', fontWeight: '500', fontSize: '14px', cursor: 'pointer' }}>
            View Full Audit Log
          </button>
        </div>
      </div>
    </div>
  );
}
