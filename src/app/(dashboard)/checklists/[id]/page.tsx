"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { ChecklistRun, ChecklistTemplate, Machine, ChecklistAnswer } from "@/types/database";
import Link from "next/link";
import { formatDateTime } from "@/lib/utils";

const cardStyle: React.CSSProperties = {
  background: 'white',
  borderRadius: '12px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  border: '1px solid #e2e8f0',
};

const statusConfig = {
  in_progress: { bg: "#fef3c7", color: "#92400e", label: "In Progress" },
  completed: { bg: "#dcfce7", color: "#166534", label: "Completed" },
  aborted: { bg: "#fee2e2", color: "#991b1b", label: "Aborted" },
};

export default function ChecklistDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [run, setRun] = useState<ChecklistRun | null>(null);
  const [template, setTemplate] = useState<ChecklistTemplate | null>(null);
  const [machine, setMachine] = useState<Machine | null>(null);
  const [answers, setAnswers] = useState<ChecklistAnswer[]>([]);
  const [operator, setOperator] = useState<{ name: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedParams.id]);

  const fetchData = async () => {
    setIsLoading(true);

    const { data: runData } = await supabase
      .from("checklist_runs")
      .select("*")
      .eq("id", resolvedParams.id)
      .single();

    if (!runData) {
      router.push("/checklists");
      return;
    }
    setRun(runData);

    const [templateRes, machineRes, answersRes, userRes] = await Promise.all([
      supabase.from("checklist_templates").select("*").eq("id", runData.template_id).single(),
      supabase.from("machines").select("*").eq("id", runData.machine_id).single(),
      supabase.from("checklist_answers").select("*").eq("run_id", resolvedParams.id),
      supabase.from("users").select("name").eq("id", runData.user_id).single(),
    ]);

    setTemplate(templateRes.data);
    setMachine(machineRes.data);
    setAnswers(answersRes.data || []);
    setOperator(userRes.data);

    setIsLoading(false);
  };

  const getAnswerForItem = (itemId: string) => {
    return answers.find((a) => a.item_id === itemId);
  };

  if (isLoading) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ height: '32px', background: '#f3f4f6', borderRadius: '8px', width: '200px', marginBottom: '24px' }} />
        <div style={{ ...cardStyle, height: '300px' }} />
      </div>
    );
  }

  if (!run || !template) {
    return null;
  }

  const sections = template.json_definition?.sections || [];
  const totalItems = sections.reduce((acc, s) => acc + s.items.length, 0);
  const answeredItems = answers.length;
  const failedItems = answers.filter((a) => a.value === false || a.value === "no").length;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/checklists" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 12px', color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>
            <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: 0 }}>{template.name}</h1>
            <p style={{ color: '#6b7280', margin: '2px 0 0 0' }}>{machine?.name}</p>
          </div>
        </div>
        <span style={{ fontSize: '14px', fontWeight: '500', padding: '6px 14px', borderRadius: '9999px', background: statusConfig[run.status].bg, color: statusConfig[run.status].color }}>
          {statusConfig[run.status].label}
        </span>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ ...cardStyle, padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <svg style={{ width: '20px', height: '20px', color: '#6b7280' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <div>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Operator</p>
              <p style={{ fontWeight: '500', color: '#111827', margin: 0 }}>{operator?.name || "Unknown"}</p>
            </div>
          </div>
        </div>
        <div style={{ ...cardStyle, padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <svg style={{ width: '20px', height: '20px', color: '#6b7280' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Started</p>
              <p style={{ fontWeight: '500', color: '#111827', margin: 0 }}>{formatDateTime(run.started_at)}</p>
            </div>
          </div>
        </div>
        <div style={{ ...cardStyle, padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <svg style={{ width: '20px', height: '20px', color: '#22c55e' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Completed</p>
              <p style={{ fontWeight: '500', color: '#111827', margin: 0 }}>{answeredItems} / {totalItems}</p>
            </div>
          </div>
        </div>
        <div style={{ ...cardStyle, padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <svg style={{ width: '20px', height: '20px', color: '#ef4444' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Failed</p>
              <p style={{ fontWeight: '500', color: '#111827', margin: 0 }}>{failedItems} items</p>
            </div>
          </div>
        </div>
      </div>

      {/* Job Number */}
      {run.job_number && (
        <div style={{ ...cardStyle, padding: '16px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <svg style={{ width: '20px', height: '20px', color: '#6b7280' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Job Number</p>
              <p style={{ fontWeight: '600', margin: '2px 0 0 0', fontFamily: 'monospace', letterSpacing: '0.5px' }}>{run.job_number}</p>
            </div>
          </div>
        </div>
      )}

      {/* Checklist Sections */}
      {sections.map((section) => (
        <div key={section.id} style={{ ...cardStyle, marginBottom: '16px' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>{section.title}</h2>
            {section.description && <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>{section.description}</p>}
          </div>
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {section.items.map((item, index) => {
              const answer = getAnswerForItem(item.id);
              const isPassed = answer?.value === true || answer?.value === "yes";
              const isFailed = answer?.value === false || answer?.value === "no";

              return (
                <div key={item.id} style={{
                  padding: '16px',
                  borderRadius: '8px',
                  border: `1px solid ${isFailed ? '#fecaca' : isPassed ? '#bbf7d0' : '#e2e8f0'}`,
                  background: isFailed ? '#fef2f2' : isPassed ? '#f0fdf4' : '#f8fafc',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', marginTop: '2px' }}>{index + 1}.</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                        <p style={{ fontWeight: '500', color: '#111827', margin: 0 }}>
                          {item.label || item.question}
                          {item.critical && (
                            <span style={{ marginLeft: '8px', fontSize: '12px', padding: '2px 8px', borderRadius: '9999px', background: '#fef3c7', color: '#92400e' }}>Critical</span>
                          )}
                        </p>
                        {answer && (
                          <span style={{
                            fontSize: '12px',
                            fontWeight: '500',
                            padding: '4px 10px',
                            borderRadius: '9999px',
                            background: isPassed ? '#dcfce7' : isFailed ? '#fee2e2' : '#f3f4f6',
                            color: isPassed ? '#166534' : isFailed ? '#991b1b' : '#374151',
                          }}>
                            {isPassed ? 'Pass' : isFailed ? 'Fail' : String(answer.value)}
                          </span>
                        )}
                        {!answer && (
                          <span style={{ fontSize: '12px', fontWeight: '500', padding: '4px 10px', borderRadius: '9999px', background: '#f3f4f6', color: '#6b7280' }}>Not answered</span>
                        )}
                      </div>
                      {answer?.comment && (
                        <div style={{ marginTop: '8px', padding: '8px', borderRadius: '6px', background: 'white' }}>
                          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>{answer.comment}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Notes */}
      {run.notes && (
        <div style={{ ...cardStyle, padding: '16px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <svg style={{ width: '20px', height: '20px', color: '#6b7280' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 style={{ fontWeight: '600', color: '#111827', margin: 0 }}>Notes</h3>
          </div>
          <p style={{ color: '#6b7280', margin: 0 }}>{run.notes}</p>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <button style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', background: 'white', color: '#374151', fontWeight: '500', cursor: 'pointer' }}>
          <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export PDF
        </button>
        {run.status === "in_progress" && (
          <Link href={`/checklists/${run.id}/run`} style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '12px', background: '#0057A8', color: 'white', borderRadius: '8px', fontWeight: '500' }}>
            Continue Checklist
          </Link>
        )}
      </div>
    </div>
  );
}
