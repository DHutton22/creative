"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/auth-context";

const BRAND_BLUE = '#0057A8';

const cardStyle: React.CSSProperties = {
  background: 'white',
  borderRadius: '12px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  border: '1px solid #e2e8f0',
};

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    totalMachines: 0,
    availableMachines: 0,
    checklistsToday: 0,
    overdueMainenance: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!authLoading) {
      fetchStats();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading]);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      // Fetch machine stats
      const { count: totalMachines } = await supabase
        .from("machines")
        .select("*", { count: "exact", head: true });

      const { count: availableMachines } = await supabase
        .from("machines")
        .select("*", { count: "exact", head: true })
        .eq("status", "available");

      // Fetch today's checklists
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: checklistsToday } = await supabase
        .from("checklist_runs")
        .select("*", { count: "exact", head: true })
        .gte("started_at", today.toISOString());

      // Fetch overdue maintenance
      const { count: overdueMainenance } = await supabase
        .from("maintenance_tasks")
        .select("*", { count: "exact", head: true })
        .eq("status", "overdue");

      setStats({
        totalMachines: totalMachines || 0,
        availableMachines: availableMachines || 0,
        checklistsToday: checklistsToday || 0,
        overdueMainenance: overdueMainenance || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
    setIsLoading(false);
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>
          {greeting()}, {user?.name?.split(' ')[0] || 'there'}
        </h1>
        <p style={{ color: '#64748b', marginTop: '4px' }}>
          Here&apos;s what&apos;s happening with your machines today.
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{ ...cardStyle, padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Total Machines</p>
              <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#1e293b', margin: '8px 0 0 0' }}>
                {isLoading ? '-' : stats.totalMachines}
              </p>
            </div>
            <div style={{ padding: '12px', borderRadius: '12px', background: '#eff6ff' }}>
              <svg style={{ width: '24px', height: '24px', color: BRAND_BLUE }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
          </div>
          <Link href="/work-centres" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '16px', fontSize: '14px', color: BRAND_BLUE, textDecoration: 'none' }}>
            View all machines
            <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div style={{ ...cardStyle, padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Available Now</p>
              <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#16a34a', margin: '8px 0 0 0' }}>
                {isLoading ? '-' : stats.availableMachines}
              </p>
            </div>
            <div style={{ padding: '12px', borderRadius: '12px', background: '#dcfce7' }}>
              <svg style={{ width: '24px', height: '24px', color: '#16a34a' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p style={{ marginTop: '16px', fontSize: '14px', color: '#64748b' }}>
            Ready for production
          </p>
        </div>

        <div style={{ ...cardStyle, padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Checklists Today</p>
              <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#1e293b', margin: '8px 0 0 0' }}>
                {isLoading ? '-' : stats.checklistsToday}
              </p>
            </div>
            <div style={{ padding: '12px', borderRadius: '12px', background: '#eff6ff' }}>
              <svg style={{ width: '24px', height: '24px', color: BRAND_BLUE }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
          </div>
          <Link href="/checklists" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '16px', fontSize: '14px', color: BRAND_BLUE, textDecoration: 'none' }}>
            View checklists
            <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div style={{ ...cardStyle, padding: '24px', borderColor: stats.overdueMainenance > 0 ? '#fecaca' : '#e2e8f0', background: stats.overdueMainenance > 0 ? '#fef2f2' : 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Overdue Maintenance</p>
              <p style={{ fontSize: '32px', fontWeight: 'bold', color: stats.overdueMainenance > 0 ? '#dc2626' : '#1e293b', margin: '8px 0 0 0' }}>
                {isLoading ? '-' : stats.overdueMainenance}
              </p>
            </div>
            <div style={{ padding: '12px', borderRadius: '12px', background: stats.overdueMainenance > 0 ? '#fee2e2' : '#f3f4f6' }}>
              <svg style={{ width: '24px', height: '24px', color: stats.overdueMainenance > 0 ? '#dc2626' : '#6b7280' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <Link href="/maintenance" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '16px', fontSize: '14px', color: stats.overdueMainenance > 0 ? '#dc2626' : BRAND_BLUE, textDecoration: 'none' }}>
            {stats.overdueMainenance > 0 ? 'Review urgently' : 'View maintenance'}
            <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Quick Actions */}
        <div style={{ ...cardStyle, padding: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '20px' }}>Quick Actions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Link href="/checklists/new" style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              padding: '20px',
              background: '#f8fafc',
              borderRadius: '12px',
              textDecoration: 'none',
              transition: 'all 0.15s',
              border: '1px solid #e2e8f0',
            }}>
              <div style={{ padding: '12px', borderRadius: '12px', background: BRAND_BLUE }}>
                <svg style={{ width: '24px', height: '24px', color: 'white' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <span style={{ fontWeight: '500', color: '#1e293b', fontSize: '14px' }}>Start Checklist</span>
            </Link>

            <Link href="/work-centres" style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              padding: '20px',
              background: '#f8fafc',
              borderRadius: '12px',
              textDecoration: 'none',
              transition: 'all 0.15s',
              border: '1px solid #e2e8f0',
            }}>
              <div style={{ padding: '12px', borderRadius: '12px', background: '#64748b' }}>
                <svg style={{ width: '24px', height: '24px', color: 'white' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </div>
              <span style={{ fontWeight: '500', color: '#1e293b', fontSize: '14px' }}>View Machines</span>
            </Link>

            <Link href="/maintenance/new" style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              padding: '20px',
              background: '#f8fafc',
              borderRadius: '12px',
              textDecoration: 'none',
              transition: 'all 0.15s',
              border: '1px solid #e2e8f0',
            }}>
              <div style={{ padding: '12px', borderRadius: '12px', background: '#d97706' }}>
                <svg style={{ width: '24px', height: '24px', color: 'white' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span style={{ fontWeight: '500', color: '#1e293b', fontSize: '14px' }}>Schedule Maintenance</span>
            </Link>

            <Link href="/reports" style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              padding: '20px',
              background: '#f8fafc',
              borderRadius: '12px',
              textDecoration: 'none',
              transition: 'all 0.15s',
              border: '1px solid #e2e8f0',
            }}>
              <div style={{ padding: '12px', borderRadius: '12px', background: '#059669' }}>
                <svg style={{ width: '24px', height: '24px', color: 'white' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span style={{ fontWeight: '500', color: '#1e293b', fontSize: '14px' }}>View Reports</span>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{ ...cardStyle, padding: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '20px' }}>Recent Activity</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', marginTop: '6px', flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b', margin: 0 }}>Pre-Run Checklist Completed</p>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0 0' }}>MAKA CR 27 - Machine 1</p>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0 0' }}>2 hours ago</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', marginTop: '6px', flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b', margin: 0 }}>Machine Status Updated</p>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0 0' }}>CNC Lathe 1 → In Use</p>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0 0' }}>3 hours ago</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b', marginTop: '6px', flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b', margin: 0 }}>Maintenance Due Soon</p>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0 0' }}>MAKA PE 90 - Lubrication</p>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0 0' }}>Due in 2 days</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', marginTop: '6px', flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b', margin: 0 }}>Maintenance Completed</p>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0 0' }}>Dieffenbacher Press 1</p>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0 0' }}>Yesterday</p>
              </div>
            </div>
          </div>
          <Link href="/reports" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '16px', fontSize: '14px', color: BRAND_BLUE, textDecoration: 'none' }}>
            View full activity log
            <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
