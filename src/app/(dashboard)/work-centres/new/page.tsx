"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import type { MachineInsert } from "@/types/database";

const statusOptions = [
  { value: "available", label: "Available" },
  { value: "in_use", label: "In Use" },
  { value: "under_maintenance", label: "Under Maintenance" },
  { value: "locked_out", label: "Locked Out" },
];

const riskOptions = [
  { value: "normal", label: "Normal" },
  { value: "high_risk", label: "High Risk" },
  { value: "aerospace", label: "Aerospace" },
];

const cardStyle: React.CSSProperties = {
  background: 'white',
  borderRadius: '12px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  border: '1px solid #e2e8f0',
};

export default function NewMachinePage() {
  const [form, setForm] = useState<Partial<MachineInsert>>({
    status: "available",
    risk_category: "normal",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!form.name) {
      setError("Machine name is required");
      setIsLoading(false);
      return;
    }

    const { error: insertError } = await supabase
      .from("machines")
      .insert({
        name: form.name,
        manufacturer: form.manufacturer || null,
        model: form.model || null,
        serial_number: form.serial_number || null,
        location: form.location || null,
        status: form.status || "available",
        risk_category: form.risk_category || "normal",
        description: form.description || null,
      });

    if (insertError) {
      console.error("Error creating machine:", insertError);
      setError(insertError.message);
    } else {
      router.push("/machines");
    }
    setIsLoading(false);
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <Link href="/machines" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          color: '#6b7280',
          fontSize: '14px',
          fontWeight: '500',
        }}>
          <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Add New Machine</h1>
          <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>Register a new machine in the system</p>
        </div>
      </div>

      <div style={{ ...cardStyle, padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg style={{ width: '20px', height: '20px', color: '#0057A8' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>Machine Information</h2>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {error && (
            <div style={{ padding: '12px', borderRadius: '8px', background: '#fee2e2', border: '1px solid #fecaca', color: '#991b1b', fontSize: '14px' }}>
              {error}
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Machine Name *</label>
            <input
              type="text"
              placeholder="e.g. MAKA CR 27 - Machine 1"
              value={form.name || ""}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Manufacturer</label>
              <input
                type="text"
                placeholder="e.g. MAKA Systems GmbH"
                value={form.manufacturer || ""}
                onChange={(e) => setForm({ ...form, manufacturer: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Model</label>
              <input
                type="text"
                placeholder="e.g. CR 27"
                value={form.model || ""}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Serial Number</label>
              <input
                type="text"
                placeholder="e.g. SN-2024-001"
                value={form.serial_number || ""}
                onChange={(e) => setForm({ ...form, serial_number: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Location</label>
              <input
                type="text"
                placeholder="e.g. Bay 1, Building A"
                value={form.location || ""}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Initial Status</label>
              <select
                value={form.status || "available"}
                onChange={(e) => setForm({ ...form, status: e.target.value as MachineInsert["status"] })}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', background: 'white' }}
              >
                {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Risk Category</label>
              <select
                value={form.risk_category || "normal"}
                onChange={(e) => setForm({ ...form, risk_category: e.target.value as MachineInsert["risk_category"] })}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', background: 'white' }}
              >
                {riskOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
              <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Aerospace machines require additional checks</p>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Description</label>
            <textarea
              placeholder="Enter a description of the machine, its capabilities, and any special considerations..."
              value={form.description || ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
            <Link href="/machines" style={{ flex: 1 }}>
              <button type="button" style={{ width: '100%', padding: '10px 20px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#374151', fontWeight: '500', fontSize: '14px', cursor: 'pointer' }}>
                Cancel
              </button>
            </Link>
            <button type="submit" disabled={isLoading} style={{
              flex: 1,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 20px',
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
              {isLoading ? 'Creating...' : 'Create Machine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
