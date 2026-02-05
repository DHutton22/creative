"use client";

import Link from "next/link";
import { BRAND } from "@/lib/branding";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
        padding: "24px",
      }}
    >
      <div
        style={{
          textAlign: "center",
          maxWidth: "420px",
          animation: "fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Logo */}
        <div
          style={{
            width: "80px",
            height: "80px",
            margin: "0 auto 24px",
            background: `linear-gradient(135deg, ${BRAND.PRIMARY_BLUE} 0%, ${BRAND.PRIMARY_BLUE_DARK} 100%)`,
            borderRadius: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 8px 32px rgba(0, 87, 168, 0.25)",
          }}
        >
          <svg
            style={{ width: "40px", height: "40px", color: "white" }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
            />
          </svg>
        </div>

        {/* 404 Number */}
        <div
          style={{
            fontSize: "72px",
            fontWeight: "bold",
            color: BRAND.PRIMARY_BLUE,
            lineHeight: 1,
            marginBottom: "12px",
            fontFamily: "var(--font-display, 'DM Sans', sans-serif)",
          }}
        >
          404
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            color: "#111827",
            marginBottom: "12px",
            fontFamily: "var(--font-display, 'DM Sans', sans-serif)",
          }}
        >
          Page Not Found
        </h1>

        {/* Description */}
        <p
          style={{
            fontSize: "15px",
            color: "#6b7280",
            marginBottom: "32px",
            lineHeight: 1.6,
          }}
        >
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>

        {/* Actions */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            alignItems: "center",
          }}
        >
          <Link
            href="/work-centres"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "14px 28px",
              background: `linear-gradient(135deg, ${BRAND.PRIMARY_BLUE} 0%, ${BRAND.PRIMARY_BLUE_DARK} 100%)`,
              color: "white",
              borderRadius: "12px",
              textDecoration: "none",
              fontWeight: "600",
              fontSize: "15px",
              boxShadow: "0 4px 14px rgba(0, 87, 168, 0.25)",
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
          >
            <svg
              style={{ width: "20px", height: "20px" }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Go to Work Centres
          </Link>

          <Link
            href="/login"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 24px",
              background: "white",
              color: "#374151",
              border: "2px solid #e2e8f0",
              borderRadius: "12px",
              textDecoration: "none",
              fontWeight: "500",
              fontSize: "14px",
              transition: "border-color 0.15s, background 0.15s",
            }}
          >
            Sign In
          </Link>
        </div>

        {/* Company */}
        <div
          style={{
            marginTop: "48px",
            fontSize: "13px",
            color: "#9ca3af",
          }}
        >
          {BRAND.company.name} • {BRAND.company.tagline}
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}





