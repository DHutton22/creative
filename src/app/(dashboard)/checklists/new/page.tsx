"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";
import type { ChecklistFrequency } from "@/types/database";

interface Machine {
  id: string;
  name: string;
  manufacturer: string | null;
  model: string | null;
}

interface ChecklistTemplate {
  id: string;
  name: string;
  type: string;
  machine_id: string | null;
  frequency: ChecklistFrequency | null;
}

const cardStyle: React.CSSProperties = {
  background: 'white',
  borderRadius: '16px',
  boxShadow: 'var(--shadow-card, 0 0 0 1px rgba(0, 0, 0, 0.02), 0 2px 8px -2px rgba(0, 0, 0, 0.08), 0 8px 24px -4px rgba(0, 0, 0, 0.06))',
  border: '1px solid #e2e8f0',
};

const BRAND_BLUE = '#0057A8';

// Calculate due date based on frequency
function calculateDueDate(frequency: ChecklistFrequency | null, startDate: Date = new Date()): Date | null {
  if (!frequency || frequency === 'once') return null;
  
  const due = new Date(startDate);
  
  switch (frequency) {
    case 'daily':
      due.setDate(due.getDate() + 1);
      break;
    case 'weekly':
      due.setDate(due.getDate() + 7);
      break;
    case 'monthly':
      due.setMonth(due.getMonth() + 1);
      break;
    case 'quarterly':
      due.setMonth(due.getMonth() + 3);
      break;
    case 'annually':
      due.setFullYear(due.getFullYear() + 1);
      break;
    default:
      return null;
  }
  
  return due;
}

const frequencyLabels: Record<ChecklistFrequency, string> = {
  once: "One-time",
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  annually: "Annually",
};

function NewChecklistContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const supabase = createClient();

  const preselectedMachineId = searchParams.get("machineId");
  const preselectedTemplateId = searchParams.get("templateId");

  const [machines, setMachines] = useState<Machine[]>([]);
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [selectedMachineId, setSelectedMachineId] = useState(preselectedMachineId || "");
  const [selectedTemplateId, setSelectedTemplateId] = useState(preselectedTemplateId || "");
  const [jobNumber, setJobNumber] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    setIsLoading(true);

    const [machinesRes, templatesRes] = await Promise.all([
      supabase.from("machines").select("id, name, manufacturer, model").order("name"),
      supabase.from("checklist_templates").select("id, name, type, machine_id, frequency").eq("status", "active").order("name"),
    ]);

    setMachines(machinesRes.data || []);
    setTemplates(templatesRes.data || []);
    setIsLoading(false);
  };

  // Filter templates based on selected machine (generic + machine-specific)
  const availableTemplates = selectedMachineId
    ? templates.filter(t => !t.machine_id || t.machine_id === selectedMachineId)
    : templates;

  const selectedMachine = machines.find(m => m.id === selectedMachineId);
  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  // Calculate due date preview
  const dueDate = selectedTemplate ? calculateDueDate(selectedTemplate.frequency) : null;

  // Generate job number based on machine, date, and sequence
  const generateJobNumber = (machineName: string) => {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD
    const machineCode = machineName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 6).toUpperCase();
    const timeSeq = today.getHours().toString().padStart(2, '0') + today.getMinutes().toString().padStart(2, '0');
    return `${machineCode}-${dateStr}-${timeSeq}`;
  };

  // Auto-generate job number when machine is selected
  useEffect(() => {
    if (selectedMachine) {
      setJobNumber(generateJobNumber(selectedMachine.name));
    } else {
      setJobNumber("");
    }
  }, [selectedMachine]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMachineId || !selectedTemplateId || !user) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const now = new Date();
      const calculatedDueDate = selectedTemplate ? calculateDueDate(selectedTemplate.frequency, now) : null;

      const { data, error: insertError } = await supabase
        .from("checklist_runs")
        .insert({
          template_id: selectedTemplateId,
          machine_id: selectedMachineId,
          user_id: user.id,
          status: "in_progress",
          started_at: now.toISOString(),
          due_date: calculatedDueDate ? calculatedDueDate.toISOString() : null,
          job_number: jobNumber || null,
        })
        .select("id")
        .single();

      if (insertError) throw insertError;

      // Redirect to run the checklist
      router.push(`/checklists/${data.id}/run`);
    } catch (err: any) {
      console.error("Error creating checklist run:", err);
      setError(err.message || "Failed to start checklist");
      setIsSubmitting(false);
    }
  };

  const canSubmit = selectedMachineId && selectedTemplateId && !isSubmitting;

  if (isLoading) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ 
          height: '32px', 
          background: 'linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s ease-in-out infinite',
          borderRadius: '8px', 
          width: '200px', 
          marginBottom: '24px',
        }} />
        <div style={{ ...cardStyle, height: '400px' }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <Link 
          href="/work-centres" 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '8px 12px', 
            color: '#6b7280', 
            fontSize: '14px', 
            fontWeight: '500', 
            textDecoration: 'none',
            borderRadius: '8px',
            transition: 'background 0.15s, color 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f3f4f6';
            e.currentTarget.style.color = '#374151';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#6b7280';
          }}
        >
          <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>
        <h1 style={{ 
          fontFamily: 'var(--font-display, "DM Sans", sans-serif)',
          fontSize: '24px', 
          fontWeight: 'bold', 
          color: '#111827', 
          margin: 0,
          letterSpacing: '-0.02em',
        }}>
          Start New Checklist
        </h1>
      </div>

      {/* Operator Info */}
      <div style={{ ...cardStyle, padding: '20px', marginBottom: '24px', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            background: `linear-gradient(135deg, ${BRAND_BLUE} 0%, #003d75 100%)`,
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: '700',
            fontSize: '20px',
            boxShadow: '0 4px 12px rgba(0, 87, 168, 0.25)',
          }}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0, fontWeight: 500 }}>Operator</p>
            <p style={{ 
              fontFamily: 'var(--font-display, "DM Sans", sans-serif)',
              fontSize: '18px', 
              fontWeight: '600', 
              color: '#111827', 
              margin: '2px 0 0 0',
            }}>
              {user?.name || 'Unknown'}
            </p>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0 0', textTransform: 'capitalize' }}>
              {user?.role}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Machine Selection */}
        <div style={{ ...cardStyle, padding: '24px', marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '16px' }}>
            <span style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
              Select Machine *
            </span>
            <select
              value={selectedMachineId}
              onChange={(e) => {
                setSelectedMachineId(e.target.value);
                // Reset template if machine changes and template isn't compatible
                if (selectedTemplateId) {
                  const template = templates.find(t => t.id === selectedTemplateId);
                  if (template?.machine_id && template.machine_id !== e.target.value) {
                    setSelectedTemplateId("");
                  }
                }
              }}
              style={{
                width: '100%',
                padding: '14px',
                border: '2px solid #e5e7eb',
                borderRadius: '10px',
                fontSize: '14px',
                background: '#fafafa',
                transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = BRAND_BLUE;
                e.target.style.boxShadow = '0 0 0 4px rgba(0, 87, 168, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="">Choose a machine...</option>
              {machines.map(machine => (
                <option key={machine.id} value={machine.id}>
                  {machine.name} {machine.manufacturer ? `(${machine.manufacturer} ${machine.model || ''})` : ''}
                </option>
              ))}
            </select>
          </label>

          {selectedMachine && (
            <div style={{ 
              padding: '14px', 
              background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', 
              borderRadius: '10px', 
              border: '1px solid #bbf7d0',
              animation: 'fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}>
              <p style={{ fontWeight: '600', color: '#166534', margin: 0 }}>{selectedMachine.name}</p>
              {selectedMachine.manufacturer && (
                <p style={{ fontSize: '12px', color: '#166534', margin: '4px 0 0 0' }}>
                  {selectedMachine.manufacturer} {selectedMachine.model}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Template Selection */}
        <div style={{ ...cardStyle, padding: '24px', marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '16px' }}>
            <span style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
              Select Checklist Template *
            </span>
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              disabled={!selectedMachineId}
              style={{
                width: '100%',
                padding: '14px',
                border: '2px solid #e5e7eb',
                borderRadius: '10px',
                fontSize: '14px',
                background: selectedMachineId ? '#fafafa' : '#f1f5f9',
                cursor: selectedMachineId ? 'pointer' : 'not-allowed',
                opacity: selectedMachineId ? 1 : 0.7,
                transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
              onFocus={(e) => {
                if (selectedMachineId) {
                  e.target.style.borderColor = BRAND_BLUE;
                  e.target.style.boxShadow = '0 0 0 4px rgba(0, 87, 168, 0.1)';
                }
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="">{selectedMachineId ? 'Choose a checklist...' : 'Select a machine first'}</option>
              {availableTemplates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name} ({template.type.replace('_', ' ')})
                  {template.frequency && template.frequency !== 'once' ? ` - ${frequencyLabels[template.frequency]}` : ''}
                </option>
              ))}
            </select>
          </label>

          {selectedTemplate && (
            <div style={{ 
              padding: '14px', 
              background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', 
              borderRadius: '10px', 
              border: '1px solid #bfdbfe',
              animation: 'fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <p style={{ fontWeight: '600', color: '#1e40af', margin: 0 }}>{selectedTemplate.name}</p>
                  <p style={{ fontSize: '12px', color: '#1e40af', margin: '4px 0 0 0', textTransform: 'capitalize' }}>
                    Type: {selectedTemplate.type.replace('_', ' ')}
                  </p>
                </div>
                {selectedTemplate.frequency && (
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '600',
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    background: 'white',
                    color: '#1e40af',
                    border: '1px solid #bfdbfe',
                  }}>
                    {frequencyLabels[selectedTemplate.frequency]}
                  </span>
                )}
              </div>
              
              {/* Due date preview */}
              {dueDate && (
                <div style={{ 
                  marginTop: '12px', 
                  paddingTop: '12px', 
                  borderTop: '1px solid #bfdbfe',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <svg style={{ width: '16px', height: '16px', color: '#1e40af' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span style={{ fontSize: '13px', color: '#1e40af' }}>
                    Due: <strong>{dueDate.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</strong>
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Job Number */}
        {selectedMachineId && (
          <div style={{ ...cardStyle, padding: '24px', marginBottom: '24px', animation: 'fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
              Job Number
            </h3>
            
            <div style={{ 
              padding: '18px', 
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', 
              borderRadius: '10px', 
              border: '2px solid #e2e8f0',
              fontFamily: 'monospace',
              fontSize: '20px',
              fontWeight: '700',
              color: BRAND_BLUE,
              textAlign: 'center',
              letterSpacing: '2px',
            }}>
              {jobNumber}
            </div>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: '10px 0 0 0', textAlign: 'center' }}>
              Auto-generated: Machine Code + Date + Time
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={{ 
            padding: '14px', 
            background: '#fef2f2', 
            borderRadius: '10px', 
            border: '1px solid #fecaca', 
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            animation: 'shake 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          }}>
            <svg style={{ width: '20px', height: '20px', color: '#dc2626', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p style={{ color: '#991b1b', margin: 0, fontSize: '14px' }}>{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!canSubmit}
          style={{
            width: '100%',
            padding: '16px',
            background: canSubmit 
              ? `linear-gradient(135deg, ${BRAND_BLUE} 0%, #003d75 100%)` 
              : '#94a3b8',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            boxShadow: canSubmit ? '0 4px 14px rgba(0, 87, 168, 0.25)' : 'none',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
          onMouseEnter={(e) => {
            if (canSubmit) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 87, 168, 0.35)';
            }
          }}
          onMouseLeave={(e) => {
            if (canSubmit) {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 87, 168, 0.25)';
            }
          }}
        >
          {isSubmitting ? (
            <>
              <svg style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} fill="none" viewBox="0 0 24 24">
                <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Starting...
            </>
          ) : (
            <>
              <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Start Checklist
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default function NewChecklistPage() {
  return (
    <Suspense fallback={
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ 
          height: '32px', 
          background: 'linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s ease-in-out infinite',
          borderRadius: '8px', 
          width: '200px', 
          marginBottom: '24px',
        }} />
        <div style={{ ...cardStyle, height: '400px' }} />
      </div>
    }>
      <NewChecklistContent />
    </Suspense>
  );
}
