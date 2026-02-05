"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { BRAND } from "@/lib/branding";

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  targetSelector?: string;
  position?: "top" | "bottom" | "left" | "right" | "center";
  category: "getting-started" | "admin" | "checklists" | "reports";
}

const tourSteps: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to Creative Composites! 👋",
    description: "This guided tour will walk you through all the key features of your Machine Checklist System. Let's get you up to speed!",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: '100%', height: '100%' }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    position: "center",
    category: "getting-started",
  },
  {
    id: "dashboard",
    title: "Traffic Light Dashboard",
    description: "Your command center! See all checklists at a glance with intuitive color coding:\n\n🟢 Green = On track (>3 days remaining)\n🟡 Amber = Due soon (within 3 days)\n🔴 Red = Overdue (needs immediate attention)\n\nClick any card to dive into details.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: '100%', height: '100%' }}>
        <circle cx="12" cy="6" r="3" />
        <circle cx="12" cy="12" r="3" />
        <circle cx="12" cy="18" r="3" />
        <rect x="6" y="3" width="12" height="18" rx="2" strokeDasharray="3 3" opacity="0.5" />
      </svg>
    ),
    position: "center",
    category: "getting-started",
  },
  {
    id: "work-centres",
    title: "Work Centres",
    description: "Work Centres are the physical locations or areas where machines operate. They help organize your factory floor and group related machines together.\n\nExample: 'Assembly Line A', 'Painting Bay', 'CNC Workshop'",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: '100%', height: '100%' }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    position: "center",
    category: "admin",
  },
  {
    id: "machines",
    title: "Machines",
    description: "Register all your equipment here. Each machine belongs to a Work Centre and can have multiple checklist templates assigned.\n\nInclude details like:\n• Machine name & code\n• Model & serial number\n• Associated work centre\n• Operating status",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: '100%', height: '100%' }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
      </svg>
    ),
    position: "center",
    category: "admin",
  },
  {
    id: "templates",
    title: "Checklist Templates",
    description: "Templates are the blueprints for your checklists. Create once, use many times!\n\nTypes include:\n• Pre-Run Checks – Before starting\n• First-Off Inspection – Quality verification\n• Shutdown Checks – End of shift\n• Maintenance – Scheduled service\n\n💡 Pro tip: Use the AI generator to create templates automatically!",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: '100%', height: '100%' }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    position: "center",
    category: "admin",
  },
  {
    id: "checklist-items",
    title: "Template Item Types",
    description: "Build powerful checklists with different item types:\n\n☑️ Checkbox – Simple pass/fail checks\n📝 Text Input – Notes & observations\n🔢 Number – Measurements & readings\n📸 Photo Required – Visual evidence\n📋 Select – Multiple choice options\n\nMix and match to create comprehensive inspections!",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: '100%', height: '100%' }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    position: "center",
    category: "checklists",
  },
  {
    id: "frequency",
    title: "Scheduling & Frequency",
    description: "Set how often each checklist should be completed:\n\n📅 Daily – Every working day\n📅 Weekly – Once per week\n📅 Monthly – Once per month\n📅 Quarterly – Every 3 months\n📅 One-time – Special inspections\n\nThe system tracks due dates and alerts you when checklists are coming up or overdue.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: '100%', height: '100%' }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    position: "center",
    category: "checklists",
  },
  {
    id: "running-checklists",
    title: "Running Checklists",
    description: "When operators start a checklist:\n\n1. Select the machine and template\n2. Work through each item\n3. Add notes and photos as needed\n4. Submit for completion\n\nIncomplete items are flagged, and supervisors can review submissions anytime.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: '100%', height: '100%' }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    position: "center",
    category: "checklists",
  },
  {
    id: "users",
    title: "User Management",
    description: "Control who can do what with role-based access:\n\n👤 Operator – Run checklists, view their history\n👷 Supervisor – All operator abilities + manage templates\n👨‍💼 Admin – Full system access, user management\n\nAdd users and send them secure login credentials via email.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: '100%', height: '100%' }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    position: "center",
    category: "admin",
  },
  {
    id: "reports",
    title: "Reports & Analytics",
    description: "Track performance and compliance:\n\n📊 Completion rates by machine/area\n📈 Trend analysis over time\n📋 Failed item tracking\n🕐 Response time metrics\n\nExport data for audits and continuous improvement reviews.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: '100%', height: '100%' }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    position: "center",
    category: "reports",
  },
  {
    id: "quick-tips",
    title: "Quick Tips for Success ✨",
    description: "• Start by setting up Work Centres, then add Machines\n• Create a few essential templates before going live\n• Train operators on the mobile-friendly interface\n• Review the dashboard daily for compliance\n• Use photos for critical safety checks\n• Regularly export reports for audits",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: '100%', height: '100%' }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    position: "center",
    category: "getting-started",
  },
  {
    id: "finish",
    title: "You're All Set! 🎉",
    description: "You now know the essentials of the Machine Checklist System.\n\nClick the help button (?) in the header anytime to revisit this guide.\n\nNeed more help? Contact your system administrator or check the documentation.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: '100%', height: '100%' }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
    position: "center",
    category: "getting-started",
  },
];

const categoryColors = {
  "getting-started": { bg: "#dbeafe", color: "#1e40af", label: "Getting Started" },
  "admin": { bg: "#fef3c7", color: "#92400e", label: "Administration" },
  "checklists": { bg: "#dcfce7", color: "#166534", label: "Checklists" },
  "reports": { bg: "#fae8ff", color: "#86198f", label: "Reports" },
};

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export function OnboardingTour({ isOpen, onClose, onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, 200);
    } else {
      onComplete?.();
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsAnimating(false);
      }, 200);
    }
  };

  const handleStepClick = (index: number) => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(index);
      setIsAnimating(false);
    }, 200);
  };

  if (!mounted || !isOpen) return null;

  const step = tourSteps[currentStep];
  const category = categoryColors[step.category];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      {/* Backdrop with animated gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(135deg, 
            rgba(0, 87, 168, 0.95) 0%, 
            rgba(0, 61, 117, 0.97) 50%, 
            rgba(0, 40, 81, 0.98) 100%)`,
          backdropFilter: "blur(8px)",
        }}
        onClick={onClose}
      />

      {/* Floating particles effect */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "50%",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 10 + 10}s infinite ease-in-out`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Main modal */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "700px",
          background: "white",
          borderRadius: "24px",
          overflow: "hidden",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          transform: isAnimating ? "scale(0.98)" : "scale(1)",
          opacity: isAnimating ? 0.8 : 1,
          transition: "transform 0.2s ease, opacity 0.2s ease",
        }}
      >
        {/* Progress bar */}
        <div style={{ height: "4px", background: "#e2e8f0" }}>
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${BRAND.PRIMARY_BLUE}, #10b981)`,
              transition: "width 0.3s ease",
            }}
          />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            width: "36px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#f3f4f6",
            border: "none",
            borderRadius: "50%",
            cursor: "pointer",
            color: "#6b7280",
            zIndex: 10,
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#e5e7eb";
            e.currentTarget.style.color = "#374151";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#f3f4f6";
            e.currentTarget.style.color = "#6b7280";
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header with icon */}
        <div
          style={{
            padding: "40px 32px 24px",
            textAlign: "center",
          }}
        >
          {/* Icon container */}
          <div
            style={{
              width: "80px",
              height: "80px",
              margin: "0 auto 24px",
              background: `linear-gradient(135deg, ${BRAND.PRIMARY_BLUE}, ${BRAND.PRIMARY_BLUE_DARK})`,
              borderRadius: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              padding: "20px",
              boxShadow: `0 10px 30px -5px ${BRAND.PRIMARY_BLUE}50`,
            }}
          >
            {step.icon}
          </div>

          {/* Category badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 14px",
              background: category.bg,
              color: category.color,
              borderRadius: "9999px",
              fontSize: "12px",
              fontWeight: "600",
              marginBottom: "16px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {category.label}
          </div>

          {/* Title */}
          <h2
            style={{
              fontSize: "26px",
              fontWeight: "700",
              color: "#111827",
              margin: "0 0 8px",
              lineHeight: "1.3",
            }}
          >
            {step.title}
          </h2>

          {/* Step indicator */}
          <p style={{ fontSize: "14px", color: "#9ca3af", margin: 0 }}>
            Step {currentStep + 1} of {tourSteps.length}
          </p>
        </div>

        {/* Description */}
        <div
          style={{
            padding: "0 32px 32px",
          }}
        >
          <div
            style={{
              background: "#f8fafc",
              borderRadius: "16px",
              padding: "24px",
              fontSize: "15px",
              lineHeight: "1.7",
              color: "#374151",
              whiteSpace: "pre-line",
            }}
          >
            {step.description}
          </div>
        </div>

        {/* Step dots navigation */}
        <div
          style={{
            padding: "0 32px",
            display: "flex",
            justifyContent: "center",
            gap: "8px",
            marginBottom: "24px",
            flexWrap: "wrap",
          }}
        >
          {tourSteps.map((s, i) => (
            <button
              key={s.id}
              onClick={() => handleStepClick(i)}
              style={{
                width: i === currentStep ? "24px" : "10px",
                height: "10px",
                borderRadius: "9999px",
                border: "none",
                background: i === currentStep 
                  ? BRAND.PRIMARY_BLUE 
                  : i < currentStep 
                    ? "#10b981"
                    : "#e2e8f0",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              title={s.title}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div
          style={{
            padding: "16px 32px 32px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 20px",
              background: "white",
              border: "2px solid #e2e8f0",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: "600",
              color: currentStep === 0 ? "#d1d5db" : "#374151",
              cursor: currentStep === 0 ? "not-allowed" : "pointer",
              transition: "all 0.2s",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>

          <button
            onClick={handleNext}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 28px",
              background: currentStep === tourSteps.length - 1 
                ? "linear-gradient(135deg, #10b981, #059669)"
                : `linear-gradient(135deg, ${BRAND.PRIMARY_BLUE}, ${BRAND.PRIMARY_BLUE_DARK})`,
              border: "none",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: "600",
              color: "white",
              cursor: "pointer",
              boxShadow: currentStep === tourSteps.length - 1
                ? "0 4px 14px rgba(16, 185, 129, 0.4)"
                : `0 4px 14px ${BRAND.PRIMARY_BLUE}40`,
              transition: "all 0.2s",
            }}
          >
            {currentStep === tourSteps.length - 1 ? "Get Started" : "Next"}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Skip link */}
        <div style={{ textAlign: "center", paddingBottom: "20px" }}>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "13px",
              color: "#9ca3af",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Skip tour
          </button>
        </div>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 0.6; }
        }
      `}</style>
    </div>,
    document.body
  );
}

// Quick access menu component
export function TourQuickMenu({ onStartTour }: { onStartTour: () => void }) {
  const [isOpen, setIsOpen] = useState(false);

  const sections = [
    { id: "getting-started", label: "Getting Started", steps: [0, 1, 10, 11] },
    { id: "admin", label: "Administration", steps: [2, 3, 4, 8] },
    { id: "checklists", label: "Checklists", steps: [5, 6, 7] },
    { id: "reports", label: "Reports", steps: [9] },
  ];

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "40px",
          height: "40px",
          background: "white",
          border: "2px solid #e2e8f0",
          borderRadius: "50%",
          cursor: "pointer",
          color: BRAND.PRIMARY_BLUE,
          transition: "all 0.2s",
          boxShadow: isOpen ? "0 4px 12px rgba(0, 0, 0, 0.1)" : "none",
        }}
        title="Help & Tour Guide"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
          <circle cx="12" cy="17" r="0.5" fill="currentColor" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 40 }}
            onClick={() => setIsOpen(false)}
          />
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              width: "280px",
              background: "white",
              borderRadius: "16px",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
              border: "1px solid #e2e8f0",
              zIndex: 50,
              overflow: "hidden",
            }}
          >
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#111827" }}>
                Help & Guide
              </h3>
              <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#6b7280" }}>
                Learn how to use the system
              </p>
            </div>

            <div style={{ padding: "12px" }}>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onStartTour();
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  background: `linear-gradient(135deg, ${BRAND.PRIMARY_BLUE}, ${BRAND.PRIMARY_BLUE_DARK})`,
                  border: "none",
                  borderRadius: "12px",
                  cursor: "pointer",
                  color: "white",
                  fontWeight: "600",
                  fontSize: "14px",
                  marginBottom: "12px",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Start Full Tour
              </button>

              <p style={{ fontSize: "11px", fontWeight: "600", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", padding: "0 4px", marginBottom: "8px" }}>
                Quick Links
              </p>

              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => {
                    setIsOpen(false);
                    // Could add functionality to jump to specific section
                    onStartTour();
                  }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 12px",
                    background: "transparent",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "14px",
                    color: "#374151",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#f3f4f6"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <span>{section.label}</span>
                  <span style={{ fontSize: "12px", color: "#9ca3af" }}>
                    {section.steps.length} steps
                  </span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}






