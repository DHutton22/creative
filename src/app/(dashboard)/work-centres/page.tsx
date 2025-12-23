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

export default function WorkCentresPage() {
  const [workCentres, setWorkCentres] = useState<WorkCentre[]>([]);
  const [machines, setMachines] = useState<MachineWithWorkCentre[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { hasRole, isLoading: authLoading } = useAuth();

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

  const getUnassignedMachines = () => {
    return machines.filter(m => !m.work_centre_id);
  };

  const filteredWorkCentres = workCentres.filter(wc => {
    if (!searchQuery) return true;
    const wcMachines = getMachinesForWorkCentre(wc.id);
    const matchesWcName = wc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMachine = wcMachines.some(m => 
      m.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return matchesWcName || matchesMachine;
  });

  const canManageMachines = hasRole(["admin", "supervisor"]);

  const totalMachines = machines.length;
  const availableMachines = machines.filter(m => m.status === 'available').length;
  const inUseMachines = machines.filter(m => m.status === 'in_use').length;
  const maintenanceMachines = machines.filter(m => m.status === 'under_maintenance').length;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#1e293b', margin: 0 }}>
                Work Centres
              </h1>
              <p style={{ color: '#64748b', marginTop: '4px', fontSize: '14px' }}>
                Machines organized by production area
              </p>
            </div>
            {canManageMachines && (
              <Link href="/admin/work-centres" title="Add Work Centre" style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                background: BRAND_BLUE,
                color: 'white',
                borderRadius: '6px',
                textDecoration: 'none',
              }}>
                <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </Link>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => fetchData()}
              disabled={isLoading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                background: 'white',
                border: '1px solid #e2e8f0',
                color: '#64748b',
                borderRadius: '6px',
                fontWeight: '500',
                fontSize: '13px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1,
              }}
              title="Refresh data"
            >
              <svg style={{ width: '16px', height: '16px', animation: isLoading ? 'spin 1s linear infinite' : 'none' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            {canManageMachines && (
              <Link href="/machines/new" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                background: 'white',
                border: '1px solid #e2e8f0',
                color: '#1e293b',
                borderRadius: '6px',
                fontWeight: '500',
                fontSize: '13px',
                textDecoration: 'none',
              }}>
                <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add Machine
              </Link>
            )}
          </div>
        </div>

        {/* Stats Bar */}
        <div style={{ 
          display: 'flex', 
          gap: '1px', 
          background: '#e2e8f0', 
          borderRadius: '6px', 
          overflow: 'hidden',
          marginBottom: '16px',
        }}>
          <div style={{ flex: 1, background: 'white', padding: '12px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: '600', color: BRAND_BLUE }}>{workCentres.length}</div>
            <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '500' }}>Work Centres</div>
          </div>
          <div style={{ flex: 1, background: 'white', padding: '12px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: '600', color: '#16a34a' }}>{availableMachines}</div>
            <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '500' }}>Available</div>
          </div>
          <div style={{ flex: 1, background: 'white', padding: '12px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: '600', color: '#2563eb' }}>{inUseMachines}</div>
            <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '500' }}>In Use</div>
          </div>
          <div style={{ flex: 1, background: 'white', padding: '12px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: '600', color: '#d97706' }}>{maintenanceMachines}</div>
            <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '500' }}>Maintenance</div>
          </div>
          <div style={{ flex: 1, background: 'white', padding: '12px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: '600', color: '#1e293b' }}>{totalMachines}</div>
            <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '500' }}>Total</div>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', maxWidth: '320px' }}>
          <svg style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#94a3b8' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 10px 8px 34px',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              fontSize: '13px',
              outline: 'none',
              background: 'white',
            }}
          />
        </div>
      </div>

      {/* Loading */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} style={{ background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div style={{ height: '48px', background: '#f1f5f9' }} />
              <div style={{ padding: '12px' }}>
                <div style={{ height: '14px', background: '#f1f5f9', borderRadius: '4px', width: '70%', marginBottom: '8px' }} />
                <div style={{ height: '14px', background: '#f1f5f9', borderRadius: '4px', width: '50%' }} />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div style={{ background: 'white', borderRadius: '8px', padding: '40px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
          <p style={{ color: '#ef4444', fontSize: '14px' }}>{error}</p>
        </div>
      ) : filteredWorkCentres.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '8px', padding: '40px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>No work centres found</h3>
          <p style={{ color: '#64748b', fontSize: '13px' }}>
            {searchQuery ? "Try adjusting your search" : "Set up work centres in Admin settings"}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {filteredWorkCentres.map((workCentre) => {
            const wcMachines = getMachinesForWorkCentre(workCentre.id);
            
            return (
              <div 
                key={workCentre.id} 
                style={{ 
                  background: 'white',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: '1px solid #e2e8f0',
                }}
              >
                {/* Header */}
                <div style={{ 
                  background: BRAND_BLUE,
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'white', margin: 0 }}>
                      {workCentre.name}
                    </h2>
                    {workCentre.description && (
                      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', margin: '2px 0 0 0' }}>
                        {workCentre.description}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {canManageMachines && (
                      <Link 
                        href={`/machines/new?workCentreId=${workCentre.id}`} 
                        title="Add machine to this work centre"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '28px',
                          height: '28px',
                          background: 'rgba(255,255,255,0.2)',
                          borderRadius: '4px',
                          color: 'white',
                          textDecoration: 'none',
                        }}
                      >
                        <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                      </Link>
                    )}
                    <div style={{
                      background: 'rgba(255,255,255,0.2)',
                      borderRadius: '4px',
                      padding: '4px 10px',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: 'white',
                    }}>
                      {wcMachines.length}
                    </div>
                  </div>
                </div>

                {/* Machines List */}
                <div style={{ 
                  maxHeight: wcMachines.length > 4 ? '200px' : 'auto', 
                  overflowY: wcMachines.length > 4 ? 'auto' : 'visible',
                }}>
                  {wcMachines.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                      No machines assigned
                    </div>
                  ) : (
                    wcMachines.map((machine, idx) => (
                      <Link 
                        key={machine.id} 
                        href={`/machines/${machine.id}`}
                        style={{ textDecoration: 'none', display: 'block' }}
                      >
                        <div style={{
                          padding: '10px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          borderTop: idx > 0 ? '1px solid #f1f5f9' : 'none',
                          background: 'white',
                          cursor: 'pointer',
                        }}>
                          <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: statusConfig[machine.status].dot,
                            flexShrink: 0,
                          }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: '500', color: '#1e293b', fontSize: '13px' }}>
                              {machine.name}
                            </div>
                            {machine.manufacturer && (
                              <div style={{ fontSize: '11px', color: '#64748b' }}>
                                {machine.manufacturer} {machine.model}
                              </div>
                            )}
                          </div>
                          <span style={{
                            fontSize: '10px',
                            fontWeight: '500',
                            padding: '2px 6px',
                            borderRadius: '3px',
                            background: statusConfig[machine.status].bg,
                            color: statusConfig[machine.status].color,
                          }}>
                            {statusConfig[machine.status].label}
                          </span>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
                {wcMachines.length > 4 && (
                  <div style={{ padding: '6px 14px', borderTop: '1px solid #f1f5f9', textAlign: 'center', fontSize: '11px', color: '#64748b' }}>
                    Scroll for more ({wcMachines.length} total)
                  </div>
                )}
              </div>
            );
          })}

          {/* Unassigned */}
          {getUnassignedMachines().length > 0 && (
            <div style={{ 
              background: 'white',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1px solid #e2e8f0',
            }}>
              <div style={{ 
                background: '#64748b',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div>
                  <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'white', margin: 0 }}>
                    Unassigned
                  </h2>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', margin: '2px 0 0 0' }}>
                    Not assigned to a work centre
                  </p>
                </div>
                <div style={{
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '4px',
                  padding: '4px 10px',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: 'white',
                }}>
                  {getUnassignedMachines().length}
                </div>
              </div>
              <div>
                {getUnassignedMachines().map((machine, idx) => (
                  <Link key={machine.id} href={`/machines/${machine.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                    <div style={{
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      borderTop: idx > 0 ? '1px solid #f1f5f9' : 'none',
                    }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: statusConfig[machine.status].dot,
                      }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '500', color: '#1e293b', fontSize: '13px' }}>{machine.name}</div>
                        {machine.manufacturer && (
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{machine.manufacturer}</div>
                        )}
                      </div>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: '500',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        background: statusConfig[machine.status].bg,
                        color: statusConfig[machine.status].color,
                      }}>
                        {statusConfig[machine.status].label}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
