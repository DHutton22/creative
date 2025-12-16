"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { ChecklistTemplate, ChecklistSection, ChecklistItem, ChecklistItemType, ChecklistDefinition } from "@/types/database";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";

interface MachineOption {
  id: string;
  name: string;
}

const cardStyle: React.CSSProperties = {
  background: 'white',
  borderRadius: '12px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  border: '1px solid #e2e8f0',
};

const typeOptions = [
  { value: "pre_run", label: "Pre-Run Check" },
  { value: "first_off", label: "First-Off Inspection" },
  { value: "shutdown", label: "Shutdown Check" },
  { value: "maintenance", label: "Maintenance" },
  { value: "safety", label: "Safety Inspection" },
  { value: "quality", label: "Quality Check" },
];

const statusOptions = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "deprecated", label: "Deprecated" },
];

const itemTypeOptions = [
  { value: "yes_no", label: "Yes/No" },
  { value: "numeric", label: "Numeric Value" },
  { value: "text", label: "Text Input" },
];

const statusConfig = {
  draft: { bg: "#fef3c7", color: "#92400e" },
  active: { bg: "#dcfce7", color: "#166534" },
  deprecated: { bg: "#f3f4f6", color: "#6b7280" },
};

export default function EditTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [machines, setMachines] = useState<MachineOption[]>([]);
  const [template, setTemplate] = useState<ChecklistTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const [form, setForm] = useState({ name: "", type: "pre_run", machine_id: "", status: "draft" });
  const [sections, setSections] = useState<ChecklistSection[]>([]);

  const supabase = createClient();

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedParams.id]);

  const fetchData = async () => {
    setIsLoading(true);

    const { data: templateData } = await supabase.from("checklist_templates").select("*").eq("id", resolvedParams.id).single();
    const typedTemplateData = templateData as ChecklistTemplate | null;

    if (!typedTemplateData) {
      router.push("/admin/templates");
      return;
    }

    const { data: machinesData } = await supabase.from("machines").select("id, name").order("name");

    setTemplate(typedTemplateData);
    setMachines((machinesData as MachineOption[]) || []);

    setForm({
      name: typedTemplateData.name,
      type: typedTemplateData.type,
      machine_id: typedTemplateData.machine_id || "",
      status: typedTemplateData.status,
    });

    setSections(typedTemplateData.json_definition?.sections || []);

    if (typedTemplateData.json_definition?.sections?.length > 0) {
      setExpandedSections(new Set([typedTemplateData.json_definition.sections[0].id]));
    }

    setIsLoading(false);
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) newExpanded.delete(sectionId);
    else newExpanded.add(sectionId);
    setExpandedSections(newExpanded);
  };

  const addSection = () => {
    const newSection: ChecklistSection = { id: uuidv4(), title: "New Section", description: "", items: [] };
    setSections([...sections, newSection]);
    setExpandedSections(new Set([...expandedSections, newSection.id]));
  };

  const updateSection = (sectionId: string, updates: Partial<ChecklistSection>) => {
    setSections(sections.map(s => s.id === sectionId ? { ...s, ...updates } : s));
  };

  const deleteSection = (sectionId: string) => {
    if (sections.length <= 1) { setError("You must have at least one section"); return; }
    setSections(sections.filter(s => s.id !== sectionId));
  };

  const addItem = (sectionId: string) => {
    const newItem: ChecklistItem = { id: uuidv4(), label: "New check item", type: "yes_no", required: true, critical: false };
    setSections(sections.map(s => s.id === sectionId ? { ...s, items: [...s.items, newItem] } : s));
  };

  const updateItem = (sectionId: string, itemId: string, updates: Partial<ChecklistItem>) => {
    setSections(sections.map(s => s.id === sectionId ? { ...s, items: s.items.map(item => item.id === itemId ? { ...item, ...updates } : item) } : s));
  };

  const deleteItem = (sectionId: string, itemId: string) => {
    setSections(sections.map(s => s.id === sectionId ? { ...s, items: s.items.filter(item => item.id !== itemId) } : s));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSaving(true);

    if (!form.name) { setError("Template name is required"); setIsSaving(false); return; }

    const jsonDefinition: ChecklistDefinition = { sections };

    const { error: updateError } = await supabase.from("checklist_templates").update({
      name: form.name,
      type: form.type as ChecklistTemplate["type"],
      machine_id: form.machine_id || null,
      status: form.status as ChecklistTemplate["status"],
      json_definition: jsonDefinition,
    }).eq("id", resolvedParams.id);

    if (updateError) { console.error("Error updating template:", updateError); setError(updateError.message); }
    else { router.push("/admin/templates"); }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ height: '32px', background: '#f3f4f6', borderRadius: '8px', width: '200px', marginBottom: '24px' }} />
        <div style={{ ...cardStyle, height: '300px' }} />
      </div>
    );
  }

  if (!template) return null;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/admin/templates" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 12px', color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>
            <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            Back
          </Link>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Edit Template</h1>
            <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>{template.name} • v{template.version}</p>
          </div>
        </div>
        <span style={{ fontSize: '14px', fontWeight: '500', padding: '6px 14px', borderRadius: '9999px', background: statusConfig[form.status as keyof typeof statusConfig].bg, color: statusConfig[form.status as keyof typeof statusConfig].color, textTransform: 'capitalize' }}>
          {form.status}
        </span>
      </div>

      <form onSubmit={handleSubmit}>
        {error && <div style={{ padding: '12px', borderRadius: '8px', background: '#fee2e2', border: '1px solid #fecaca', color: '#991b1b', fontSize: '14px', marginBottom: '24px' }}>{error}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px' }}>
          {/* Settings Sidebar */}
          <div style={{ ...cardStyle, padding: '24px', height: 'fit-content', position: 'sticky', top: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>Template Settings</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Template Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Checklist Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', background: 'white' }}>
                  {typeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Assign to Machine</label>
                <select value={form.machine_id} onChange={(e) => setForm({ ...form, machine_id: e.target.value })} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', background: 'white' }}>
                  <option value="">All Machines (Generic)</option>
                  {machines.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', background: 'white' }}>
                  {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div style={{ paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Total Items: {sections.reduce((acc, s) => acc + s.items.length, 0)}</p>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>Critical Items: {sections.reduce((acc, s) => acc + s.items.filter(i => i.critical).length, 0)}</p>
              </div>
              <button type="submit" disabled={isSaving} style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: '#0057A8', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '500', fontSize: '14px', cursor: 'pointer', opacity: isSaving ? 0.7 : 1 }}>
                <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* Builder */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {sections.map((section, sectionIndex) => (
              <div key={section.id} style={cardStyle}>
                <div onClick={() => toggleSection(section.id)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', cursor: 'pointer', borderBottom: expandedSections.has(section.id) ? '1px solid #e2e8f0' : 'none' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '500', color: '#0057A8' }}>Section {sectionIndex + 1}</span>
                      <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '9999px', background: '#f3f4f6', color: '#374151' }}>{section.items.length} items</span>
                    </div>
                    <h3 style={{ fontWeight: '600', color: '#111827', margin: 0 }}>{section.title}</h3>
                  </div>
                  <button type="button" onClick={(e) => { e.stopPropagation(); deleteSection(section.id); }} style={{ padding: '8px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#dc2626' }}>
                    <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                  <svg style={{ width: '20px', height: '20px', color: '#6b7280', transform: expandedSections.has(section.id) ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </div>

                {expandedSections.has(section.id) && (
                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Section Title</label>
                        <input type="text" value={section.title} onChange={(e) => updateSection(section.id, { title: e.target.value })} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Description</label>
                        <input type="text" value={section.description || ""} onChange={(e) => updateSection(section.id, { description: e.target.value })} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }} />
                      </div>
                    </div>

                    <p style={{ fontSize: '14px', fontWeight: '500', color: '#111827', marginBottom: '12px' }}>Check Items</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {section.items.map((item, itemIndex) => (
                        <div key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px', borderRadius: '8px', background: '#f8fafc' }}>
                          <span style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>{itemIndex + 1}.</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
                              <input type="text" placeholder="Check item label" value={item.label} onChange={(e) => updateItem(section.id, item.id, { label: e.target.value })} style={{ flex: 1, padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px' }} />
                              <select value={item.type} onChange={(e) => updateItem(section.id, item.id, { type: e.target.value as ChecklistItemType })} style={{ width: '130px', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px', background: 'white' }}>
                                {itemTypeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                              </select>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', cursor: 'pointer' }}>
                                <input type="checkbox" checked={item.required} onChange={(e) => updateItem(section.id, item.id, { required: e.target.checked })} style={{ width: '16px', height: '16px' }} />
                                Required
                              </label>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', cursor: 'pointer', color: '#d97706' }}>
                                <input type="checkbox" checked={item.critical} onChange={(e) => updateItem(section.id, item.id, { critical: e.target.checked })} style={{ width: '16px', height: '16px' }} />
                                Critical
                              </label>
                              {item.type === "numeric" && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <input type="number" placeholder="Min" value={item.minValue || ""} onChange={(e) => updateItem(section.id, item.id, { minValue: Number(e.target.value) })} style={{ width: '70px', padding: '6px 8px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px' }} />
                                  <span>-</span>
                                  <input type="number" placeholder="Max" value={item.maxValue || ""} onChange={(e) => updateItem(section.id, item.id, { maxValue: Number(e.target.value) })} style={{ width: '70px', padding: '6px 8px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px' }} />
                                  <input type="text" placeholder="Unit" value={item.unit || ""} onChange={(e) => updateItem(section.id, item.id, { unit: e.target.value })} style={{ width: '70px', padding: '6px 8px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px' }} />
                                </div>
                              )}
                            </div>
                          </div>
                          <button type="button" onClick={() => deleteItem(section.id, item.id)} style={{ padding: '8px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                            <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      ))}
                      <button type="button" onClick={() => addItem(section.id)} style={{ width: '100%', padding: '10px', border: '1px dashed #e2e8f0', borderRadius: '8px', background: 'transparent', color: '#6b7280', fontSize: '14px', cursor: 'pointer' }}>+ Add Item</button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            <button type="button" onClick={addSection} style={{ width: '100%', padding: '12px', border: '1px dashed #e2e8f0', borderRadius: '8px', background: 'transparent', color: '#6b7280', fontSize: '14px', cursor: 'pointer' }}>+ Add Section</button>
          </div>
        </div>
      </form>
    </div>
  );
}
