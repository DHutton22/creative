"use client";

import { useState, useEffect, useCallback } from "react";
import type { Machine, MachineStatus } from "@/types/database";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";

interface WorkCentre {
  id: string;
  name: string;
  description: string | null;
  display_order: number;
}

interface MachineWithWorkCentre extends Machine {
  work_centre_id: string | null;
}

const statusConfig: Record<MachineStatus, { bg: string; color: string; dot: string; label: string }> = {
  available: { bg: "#dcfce7", color: "#166534", dot: "#22c55e", label: "Available" },
  in_use: { bg: "#dbeafe", color: "#1e40af", dot: "#3b82f6", label: "In Use" },
  under_maintenance: { bg: "#fef3c7", color: "#92400e", dot: "#f59e0b", label: "Maintenance" },
  locked_out: { bg: "#fee2e2", color: "#991b1b", dot: "#ef4444", label: "Locked Out" },
  decommissioned: { bg: "#f3f4f6", color: "#6b7280", dot: "#6b7280", label: "Decommissioned" },
};

const BRAND_BLUE = '#0057A8';

// Work centre icons based on common manufacturing areas
const workCentreIcons: Record<string, string> = {
  rtm: "🔧",
  injection: "💉",
  moulding: "🏭",
  press: "⚙️",
  assembly: "🔩",
  finishing: "✨",
  paint: "🎨",
  cnc: "🔄",
  default: "🏗️",
};

function getWorkCentreIcon(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, icon] of Object.entries(workCentreIcons)) {
    if (lower.includes(key)) return icon;
  }
  return workCentreIcons.default;
}

export default function WorkCentresPage() {
  const [workCentres, setWorkCentres] = useState<WorkCentre[]>([]);
  const [machines, setMachines] = useState<MachineWithWorkCentre[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWorkCentre, setSelectedWorkCentre] = useState<string | null>(null);
  const { user, hasRole, isLoading: authLoading } = useAuth();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/work-centres");
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch data");
      }

      const data = await response.json();
      setWorkCentres(data.workCentres || []);
      setMachines(data.machines || []);
    } catch (err: any) {
      console.error("Exception fetching data:", err);
      setError(err.message || "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      fetchData();
    }
  }, [authLoading, fetchData]);

  const getMachinesForWorkCentre = (workCentreId: string) => {
    return machines.filter(m => m.work_centre_id === workCentreId);
  };

  const selectedWC = workCentres.find(wc => wc.id === selectedWorkCentre);
  const selectedMachines = selectedWorkCentre ? getMachinesForWorkCentre(selectedWorkCentre) : [];
  
  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const canManage = hasRole(["admin", "supervisor"]);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Welcome Header */}
      <div 
        style={{ 
          textAlign: 'center', 
          marginBottom: '40px',
          animation: 'fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <p style={{ 
          fontSize: '16px', 
          color: '#64748b', 
          margin: '0 0 8px 0',
          fontFamily: 'var(--font-body, "Plus Jakarta Sans", sans-serif)',
        }}>
          {getGreeting()}, {user?.name?.split(' ')[0] || 'Operator'}
        </p>
        <h1 style={{ 
          fontFamily: 'var(--font-display, "DM Sans", sans-serif)',
          fontSize: '32px', 
          fontWeight: 'bold', 
          color: '#111827', 
          margin: 0,
          letterSpacing: '-0.02em',
        }}>
          Where are you working today?
        </h1>
        <p style={{ 
          fontSize: '15px', 
          color: '#6b7280', 
          margin: '12px 0 0 0',
        }}>
          Select your work centre to see available machines and checklists
        </p>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div 
              key={i} 
              style={{ 
                background: 'white', 
                borderRadius: '16px', 
                border: '2px solid #e2e8f0',
                padding: '32px 24px',
                textAlign: 'center',
              }}
            >
              <div style={{ 
                width: '64px', 
                height: '64px', 
                margin: '0 auto 16px', 
                borderRadius: '16px',
                background: 'linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s ease-in-out infinite',
              }} />
              <div style={{ 
                height: '20px', 
                borderRadius: '6px', 
                width: '70%', 
                margin: '0 auto',
                background: 'linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s ease-in-out infinite',
              }} />
            </div>
          ))}
        </div>
      ) : error ? (
        <div style={{ 
          background: 'white', 
          borderRadius: '16px', 
          padding: '48px', 
          textAlign: 'center', 
          border: '2px solid #fee2e2',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#991b1b', marginBottom: '8px' }}>Something went wrong</h3>
          <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>{error}</p>
          <button
            onClick={() => fetchData()}
            style={{
              padding: '12px 24px',
              background: BRAND_BLUE,
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>
        </div>
      ) : !selectedWorkCentre ? (
        /* Work Centre Selection */
        <>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
            gap: '16px',
          }}>
            {workCentres.map((workCentre, index) => {
              const wcMachines = getMachinesForWorkCentre(workCentre.id);
              const availableCount = wcMachines.filter(m => m.status === 'available').length;
              
              return (
                <button
                  key={workCentre.id}
                  onClick={() => setSelectedWorkCentre(workCentre.id)}
                  style={{
                    background: 'white',
                    border: '2px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '32px 24px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                    animation: `fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${index * 50}ms backwards`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = BRAND_BLUE;
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 87, 168, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    width: '64px',
                    height: '64px',
                    margin: '0 auto 16px',
                    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '32px',
                  }}>
                    {getWorkCentreIcon(workCentre.name)}
                  </div>
                  <h3 style={{ 
                    fontFamily: 'var(--font-display, "DM Sans", sans-serif)',
                    fontSize: '18px', 
                    fontWeight: '600', 
                    color: '#111827', 
                    margin: '0 0 8px 0',
                  }}>
                    {workCentre.name}
                  </h3>
                  <p style={{ 
                    fontSize: '14px', 
                    color: '#6b7280', 
                    margin: 0,
                  }}>
                    {wcMachines.length} machine{wcMachines.length !== 1 ? 's' : ''}
                    {availableCount > 0 && (
                      <span style={{ color: '#16a34a', fontWeight: 600 }}>
                        {' '}• {availableCount} available
                      </span>
                    )}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Admin Link */}
          {canManage && (
            <div style={{ 
              marginTop: '32px', 
              textAlign: 'center',
              animation: 'fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.3s backwards',
            }}>
              <Link
                href="/admin/work-centres"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  color: '#64748b',
                  fontSize: '14px',
                  fontWeight: '500',
                  textDecoration: 'none',
                  borderRadius: '10px',
                  transition: 'background 0.15s, color 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f1f5f9';
                  e.currentTarget.style.color = '#374151';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#64748b';
                }}
              >
                <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Manage Work Centres
              </Link>
            </div>
          )}
        </>
      ) : (
        /* Machine Selection for Selected Work Centre */
        <div style={{ animation: 'fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          {/* Back Button & Title */}
          <div style={{ marginBottom: '24px' }}>
            <button
              onClick={() => setSelectedWorkCentre(null)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                background: 'white',
                border: '2px solid #e2e8f0',
                borderRadius: '10px',
                color: '#64748b',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                marginBottom: '20px',
                transition: 'border-color 0.15s, color 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#cbd5e1';
                e.currentTarget.style.color = '#374151';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.color = '#64748b';
              }}
            >
              <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Change Work Centre
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: `linear-gradient(135deg, ${BRAND_BLUE} 0%, #003d75 100%)`,
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                boxShadow: '0 4px 12px rgba(0, 87, 168, 0.25)',
              }}>
                {getWorkCentreIcon(selectedWC?.name || '')}
              </div>
              <div>
                <h2 style={{ 
                  fontFamily: 'var(--font-display, "DM Sans", sans-serif)',
                  fontSize: '24px', 
                  fontWeight: 'bold', 
                  color: '#111827', 
                  margin: 0,
                }}>
                  {selectedWC?.name}
                </h2>
                <p style={{ fontSize: '15px', color: '#6b7280', margin: '4px 0 0 0' }}>
                  Select a machine to start your checklist
                </p>
              </div>
            </div>
          </div>

          {/* Machine List */}
          {selectedMachines.length === 0 ? (
            <div style={{ 
              background: 'white', 
              borderRadius: '16px', 
              padding: '48px', 
              textAlign: 'center', 
              border: '2px dashed #e2e8f0',
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔧</div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                No machines in this work centre
              </h3>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>
                Ask your supervisor to add machines to this area
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {selectedMachines.map((machine, index) => {
                const status = statusConfig[machine.status];
                const isAvailable = machine.status === 'available';
                
                return (
                  <div
                    key={machine.id}
                    style={{
                      background: 'white',
                      borderRadius: '16px',
                      border: '2px solid #e2e8f0',
                      padding: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '20px',
                      transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                      animation: `fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${index * 50}ms backwards`,
                      opacity: isAvailable ? 1 : 0.7,
                    }}
                  >
                    {/* Status Indicator */}
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '14px',
                      background: status.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        background: status.dot,
                        boxShadow: `0 0 12px ${status.dot}60`,
                      }} />
                    </div>

                    {/* Machine Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ 
                        fontFamily: 'var(--font-display, "DM Sans", sans-serif)',
                        fontSize: '17px', 
                        fontWeight: '600', 
                        color: '#111827', 
                        margin: '0 0 4px 0',
                      }}>
                        {machine.name}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        {machine.manufacturer && (
                          <span style={{ fontSize: '14px', color: '#6b7280' }}>
                            {machine.manufacturer} {machine.model}
                          </span>
                        )}
                        <span style={{
                          fontSize: '12px',
                          fontWeight: '600',
                          padding: '4px 10px',
                          borderRadius: '9999px',
                          background: status.bg,
                          color: status.color,
                        }}>
                          {status.label}
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    {isAvailable ? (
                      <Link
                        href={`/checklists/new?machineId=${machine.id}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '14px 24px',
                          background: `linear-gradient(135deg, ${BRAND_BLUE} 0%, #003d75 100%)`,
                          color: 'white',
                          borderRadius: '12px',
                          textDecoration: 'none',
                          fontWeight: '600',
                          fontSize: '14px',
                          boxShadow: '0 4px 14px rgba(0, 87, 168, 0.25)',
                          transition: 'transform 0.15s, box-shadow 0.15s',
                          flexShrink: 0,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 87, 168, 0.35)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 87, 168, 0.25)';
                        }}
                      >
                        <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                        Start Checklist
                      </Link>
                    ) : (
                      <div style={{
                        padding: '14px 24px',
                        background: '#f1f5f9',
                        color: '#64748b',
                        borderRadius: '12px',
                        fontWeight: '500',
                        fontSize: '14px',
                        flexShrink: 0,
                      }}>
                        Not Available
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
