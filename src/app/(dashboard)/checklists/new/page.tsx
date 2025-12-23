"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";

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
}

const cardStyle: React.CSSProperties = {
  background: 'white',
  borderRadius: '12px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  border: '1px solid #e2e8f0',
};

const BRAND_BLUE = '#0057A8';

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
      supabase.from("checklist_templates").select("id, name, type, machine_id").eq("status", "active").order("name"),
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
      const { data, error: insertError } = await supabase
        .from("checklist_runs")
        .insert({
          template_id: selectedTemplateId,
          machine_id: selectedMachineId,
          user_id: user.id,
          status: "in_progress",
          started_at: new Date().toISOString(),
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
        <div style={{ height: '32px', background: '#f3f4f6', borderRadius: '8px', width: '200px', marginBottom: '24px' }} />
        <div style={{ ...cardStyle, height: '400px' }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <Link href="/work-centres" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 12px', color: '#6b7280', fontSize: '14px', fontWeight: '500', textDecoration: 'none' }}>
          <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Start New Checklist</h1>
      </div>

      {/* Operator Info */}
      <div style={{ ...cardStyle, padding: '20px', marginBottom: '24px', background: '#f8fafc' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: BRAND_BLUE,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: '600',
            fontSize: '18px',
          }}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Operator</p>
            <p style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '2px 0 0 0' }}>{user?.name || 'Unknown'}</p>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0 0', textTransform: 'capitalize' }}>{user?.role}</p>
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
                padding: '12px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                background: 'white',
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
            <div style={{ padding: '12px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
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
                padding: '12px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                background: selectedMachineId ? 'white' : '#f8fafc',
                cursor: selectedMachineId ? 'pointer' : 'not-allowed',
              }}
            >
              <option value="">{selectedMachineId ? 'Choose a checklist...' : 'Select a machine first'}</option>
              {availableTemplates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name} ({template.type.replace('_', ' ')})
                </option>
              ))}
            </select>
          </label>

          {selectedTemplate && (
            <div style={{ padding: '12px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
              <p style={{ fontWeight: '600', color: '#1e40af', margin: 0 }}>{selectedTemplate.name}</p>
              <p style={{ fontSize: '12px', color: '#1e40af', margin: '4px 0 0 0', textTransform: 'capitalize' }}>
                Type: {selectedTemplate.type.replace('_', ' ')}
              </p>
            </div>
          )}
        </div>

        {/* Job Number */}
        {selectedMachineId && (
          <div style={{ ...cardStyle, padding: '24px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
              Job Number
            </h3>
            
            <div style={{ 
              padding: '16px', 
              background: '#f8fafc', 
              borderRadius: '8px', 
              border: '1px solid #e2e8f0',
              fontFamily: 'monospace',
              fontSize: '18px',
              fontWeight: '600',
              color: BRAND_BLUE,
              textAlign: 'center',
              letterSpacing: '1px',
            }}>
              {jobNumber}
            </div>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: '8px 0 0 0', textAlign: 'center' }}>
              Auto-generated: Machine Code + Date + Time
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={{ padding: '12px', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca', marginBottom: '16px' }}>
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
            background: canSubmit ? BRAND_BLUE : '#94a3b8',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
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

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default function NewChecklistPage() {
  return (
    <Suspense fallback={
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ height: '32px', background: '#f3f4f6', borderRadius: '8px', width: '200px', marginBottom: '24px' }} />
        <div style={{ ...cardStyle, height: '400px' }} />
      </div>
    }>
      <NewChecklistContent />
    </Suspense>
  );
}
