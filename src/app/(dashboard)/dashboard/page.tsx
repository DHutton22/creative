"use client";

import { TrafficLightDashboard } from "@/components/TrafficLightDashboard";
import Link from "next/link";

const BRAND_BLUE = "#0057A8";

export default function DashboardPage() {
  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
      {/* Header */}
      <div 
        style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          marginBottom: "32px", 
          flexWrap: "wrap", 
          gap: "16px",
        }}
      >
        <div>
          <h1 
            style={{ 
              fontFamily: 'var(--font-display, "DM Sans", sans-serif)',
              fontSize: "32px", 
              fontWeight: "bold", 
              color: "#111827", 
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Checklist Compliance Dashboard
          </h1>
          <p 
            style={{ 
              color: "#6b7280", 
              marginTop: "8px", 
              fontSize: "15px",
              fontFamily: 'var(--font-body, "Plus Jakarta Sans", sans-serif)',
            }}
          >
            Traffic light system for quick status overview
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <Link
            href="/checklists/new"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px 24px",
              background: `linear-gradient(135deg, ${BRAND_BLUE} 0%, #003d75 100%)`,
              color: "white",
              borderRadius: "12px",
              textDecoration: "none",
              fontWeight: "600",
              fontSize: "14px",
              boxShadow: "0 4px 14px rgba(0, 87, 168, 0.25)",
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(0, 87, 168, 0.35)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 14px rgba(0, 87, 168, 0.25)";
            }}
          >
            <svg style={{ width: "20px", height: "20px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Start Checklist
          </Link>
          <Link
            href="/reports"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px 24px",
              background: "white",
              border: "2px solid #e2e8f0",
              color: "#374151",
              borderRadius: "12px",
              textDecoration: "none",
              fontWeight: "600",
              fontSize: "14px",
              transition: "border-color 0.15s, background 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = BRAND_BLUE;
              e.currentTarget.style.background = "#eff6ff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#e2e8f0";
              e.currentTarget.style.background = "white";
            }}
          >
            <svg style={{ width: "20px", height: "20px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Full Reports
          </Link>
        </div>
      </div>

      {/* Info Panel */}
      <div 
        style={{ 
          background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)", 
          border: "1px solid #bfdbfe", 
          borderRadius: "16px", 
          padding: "24px", 
          marginBottom: "32px",
          boxShadow: "0 4px 12px rgba(0, 87, 168, 0.05)",
          animation: "fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.1s backwards",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
          <div style={{
            width: "44px",
            height: "44px",
            borderRadius: "12px",
            background: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 8px rgba(0, 87, 168, 0.1)",
            flexShrink: 0,
          }}>
            <svg style={{ width: "24px", height: "24px", color: "#1e40af" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 
              style={{ 
                fontFamily: 'var(--font-display, "DM Sans", sans-serif)',
                fontSize: "17px", 
                fontWeight: "700", 
                color: "#1e40af", 
                margin: 0, 
                marginBottom: "12px",
              }}
            >
              Understanding the Traffic Light System
            </h3>
            <div 
              style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", 
                gap: "16px", 
                fontSize: "14px", 
                color: "#374151",
              }}
            >
              <div style={{ 
                display: "flex", 
                alignItems: "flex-start", 
                gap: "10px",
                padding: "12px",
                background: "rgba(255, 255, 255, 0.7)",
                borderRadius: "10px",
              }}>
                <span style={{ fontSize: "20px", lineHeight: 1 }}>🟢</span>
                <div>
                  <strong style={{ color: "#166534" }}>Green (On Time)</strong>
                  <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#6b7280" }}>
                    Checklist is ahead of schedule or has more than 3 days remaining
                  </p>
                </div>
              </div>
              <div style={{ 
                display: "flex", 
                alignItems: "flex-start", 
                gap: "10px",
                padding: "12px",
                background: "rgba(255, 255, 255, 0.7)",
                borderRadius: "10px",
              }}>
                <span style={{ fontSize: "20px", lineHeight: 1 }}>🟡</span>
                <div>
                  <strong style={{ color: "#92400e" }}>Amber (Due Soon)</strong>
                  <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#6b7280" }}>
                    Checklist is due within the next 3 days - action needed soon
                  </p>
                </div>
              </div>
              <div style={{ 
                display: "flex", 
                alignItems: "flex-start", 
                gap: "10px",
                padding: "12px",
                background: "rgba(255, 255, 255, 0.7)",
                borderRadius: "10px",
              }}>
                <span style={{ fontSize: "20px", lineHeight: 1 }}>🔴</span>
                <div>
                  <strong style={{ color: "#991b1b" }}>Red (Overdue)</strong>
                  <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#6b7280" }}>
                    Checklist has passed its due date - immediate action required
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Traffic Light Dashboard */}
      <TrafficLightDashboard dueSoonThreshold={3} />
    </div>
  );
}

