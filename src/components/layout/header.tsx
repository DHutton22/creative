"use client";

import { Bell, Search, Menu, Eye, X, HelpCircle, LogOut, User, Settings, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useTour } from "@/contexts/tour-context";
import { Button, Input } from "@/components/ui";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BRAND } from "@/lib/branding";

interface HeaderProps {
  title?: string;
  showSearch?: boolean;
  onMenuClick?: () => void;
}

export function Header({ title, showSearch = true, onMenuClick }: HeaderProps) {
  const { user, isImpersonating, originalUser, stopImpersonating } = useAuth();
  const [notifications] = useState(3); // Mock notification count

  return (
    <>
      {/* Impersonation Banner */}
      {isImpersonating && originalUser && (
        <div className="bg-amber-500 text-white px-4 py-2 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm font-medium">
              Viewing as <strong>{user?.name}</strong> ({user?.role})
            </span>
          </div>
          <span className="text-xs sm:text-sm opacity-80 hidden md:inline">
            — You are logged in as {originalUser.name}
          </span>
          <button
            onClick={stopImpersonating}
            className="sm:ml-4 flex items-center gap-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded text-sm font-medium transition-colors"
          >
            <X className="w-3 h-3" />
            <span className="hidden sm:inline">Exit View</span>
            <span className="sm:hidden">Exit</span>
          </button>
        </div>
      )}
      <header className="h-16 bg-white border-b border-border px-4 md:px-6 flex items-center justify-between gap-2 md:gap-4">
      {/* Left side */}
      <div className="flex items-center gap-2 md:gap-4 min-w-0">
        <button
          onClick={onMenuClick}
          className="menu-toggle-btn p-2 rounded-lg hover:bg-background-secondary transition-colors flex-shrink-0"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5 text-foreground-muted" />
        </button>
        {title && (
          <h1 className="text-lg md:text-xl font-semibold text-foreground truncate">{title}</h1>
        )}
      </div>

      {/* Search */}
      {showSearch && (
        <div className="flex-1 max-w-md hidden md:block">
          <Input
            placeholder="Search machines, checklists..."
            leftIcon={<Search className="w-5 h-5" />}
            className="bg-background-secondary border-transparent"
          />
        </div>
      )}

      {/* Right side */}
      <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
        {/* Help/Tour Button */}
        <HelpButton />

        {/* Notifications */}
        <Button variant="ghost" className="relative p-2">
          <Bell className="w-5 h-5" />
          {notifications > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 md:w-5 md:h-5 bg-danger text-white text-xs font-medium rounded-full flex items-center justify-center">
              {notifications > 9 ? '9+' : notifications}
            </span>
          )}
        </Button>

        {/* User menu */}
        <UserMenu user={user} />
      </div>
    </header>
    </>
  );
}

// User menu with dropdown
function UserMenu({ user }: { user: { name?: string; role?: string } | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    try {
      console.log("Signing out...");
      await supabase.auth.signOut({ scope: 'global' });
      console.log("Sign out complete, redirecting...");
      // Hard redirect to clear any cached state
      window.location.href = "/login";
    } catch (error) {
      console.error("Sign out error:", error);
      // Force redirect anyway
      window.location.href = "/login";
    }
  };

  return (
    <div style={{ position: "relative" }} className="pl-2 md:pl-3 border-l border-border">
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "6px 8px",
          background: isOpen ? "#f3f4f6" : "transparent",
          border: "none",
          borderRadius: "10px",
          cursor: "pointer",
          transition: "background 0.15s",
        }}
        onMouseEnter={(e) => { if (!isOpen) e.currentTarget.style.background = "#f9fafb"; }}
        onMouseLeave={(e) => { if (!isOpen) e.currentTarget.style.background = "transparent"; }}
      >
        <div 
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${BRAND.PRIMARY_BLUE} 0%, ${BRAND.PRIMARY_BLUE_DARK} 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: "600",
            fontSize: "14px",
          }}
        >
          {user?.name?.charAt(0).toUpperCase() || "U"}
        </div>
        <div className="hidden sm:block" style={{ textAlign: "left" }}>
          <p style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>
            {user?.name || "User"}
          </p>
          <p style={{ margin: 0, fontSize: "12px", color: "#64748b", textTransform: "capitalize" }}>
            {user?.role || "operator"}
          </p>
        </div>
        <ChevronDown 
          className="hidden sm:block"
          style={{ 
            width: "16px", 
            height: "16px", 
            color: "#94a3b8",
            transform: isOpen ? "rotate(180deg)" : "rotate(0)",
            transition: "transform 0.2s",
          }} 
        />
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
              width: "220px",
              background: "white",
              borderRadius: "12px",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.12)",
              border: "1px solid #e2e8f0",
              zIndex: 50,
              overflow: "hidden",
              animation: "fadeInUp 0.2s ease-out",
            }}
          >
            {/* User info header */}
            <div style={{ padding: "16px", borderBottom: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div 
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    background: `linear-gradient(135deg, ${BRAND.PRIMARY_BLUE} 0%, ${BRAND.PRIMARY_BLUE_DARK} 100%)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: "700",
                    fontSize: "16px",
                    boxShadow: "0 2px 8px rgba(0, 87, 168, 0.25)",
                  }}
                >
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: "15px", fontWeight: "600", color: "#1e293b" }}>
                    {user?.name || "User"}
                  </p>
                  <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#64748b", textTransform: "capitalize" }}>
                    {user?.role || "operator"}
                  </p>
                </div>
              </div>
            </div>

            {/* Menu items */}
            <div style={{ padding: "8px" }}>
              <button
                onClick={() => {
                  setIsOpen(false);
                  // Could navigate to profile page
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px 12px",
                  background: "transparent",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#374151",
                  transition: "background 0.15s",
                  textAlign: "left",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#f3f4f6"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <User style={{ width: "18px", height: "18px", color: "#64748b" }} />
                My Profile
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  // Could navigate to settings
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px 12px",
                  background: "transparent",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#374151",
                  transition: "background 0.15s",
                  textAlign: "left",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#f3f4f6"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <Settings style={{ width: "18px", height: "18px", color: "#64748b" }} />
                Settings
              </button>
            </div>

            {/* Divider */}
            <div style={{ borderTop: "1px solid #e2e8f0", margin: "0 8px" }} />

            {/* Sign out */}
            <div style={{ padding: "8px" }}>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("Sign out clicked");
                  handleSignOut();
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px 12px",
                  background: "transparent",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#dc2626",
                  transition: "background 0.15s",
                  textAlign: "left",
                  position: "relative",
                  zIndex: 100,
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#fef2f2"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <LogOut style={{ width: "18px", height: "18px" }} />
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Help button with dropdown menu
function HelpButton() {
  const { openTour, hasSeenTour } = useTour();
  const [isOpen, setIsOpen] = useState(false);

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
          background: hasSeenTour ? "transparent" : `${BRAND.PRIMARY_BLUE}15`,
          border: hasSeenTour ? "none" : `2px solid ${BRAND.PRIMARY_BLUE}`,
          borderRadius: "50%",
          cursor: "pointer",
          color: BRAND.PRIMARY_BLUE,
          transition: "all 0.2s",
          position: "relative",
        }}
        title="Help & Tour Guide"
      >
        <HelpCircle className="w-5 h-5" />
        {!hasSeenTour && (
          <span
            style={{
              position: "absolute",
              top: "-2px",
              right: "-2px",
              width: "12px",
              height: "12px",
              background: "#10b981",
              borderRadius: "50%",
              border: "2px solid white",
            }}
          />
        )}
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
              width: "300px",
              background: "white",
              borderRadius: "16px",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
              border: "1px solid #e2e8f0",
              zIndex: 50,
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "20px",
                background: `linear-gradient(135deg, ${BRAND.PRIMARY_BLUE}, ${BRAND.PRIMARY_BLUE_DARK})`,
                color: "white",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    background: "rgba(255,255,255,0.2)",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600" }}>
                    Help Center
                  </h3>
                  <p style={{ margin: "4px 0 0", fontSize: "13px", opacity: 0.9 }}>
                    Learn how to use the system
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: "16px" }}>
              {/* Start Tour Button */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  openTour();
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "14px 16px",
                  background: "#f8fafc",
                  border: "2px solid #e2e8f0",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#111827",
                  marginBottom: "12px",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = BRAND.PRIMARY_BLUE;
                  e.currentTarget.style.background = `${BRAND.PRIMARY_BLUE}08`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.background = "#f8fafc";
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    background: `linear-gradient(135deg, ${BRAND.PRIMARY_BLUE}, ${BRAND.PRIMARY_BLUE_DARK})`,
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    flexShrink: 0,
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div style={{ textAlign: "left" }}>
                  <div>Start Guided Tour</div>
                  <div style={{ fontSize: "12px", fontWeight: "400", color: "#6b7280" }}>
                    12 steps • ~5 minutes
                  </div>
                </div>
                {!hasSeenTour && (
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: "11px",
                      fontWeight: "600",
                      padding: "4px 8px",
                      background: "#dcfce7",
                      color: "#166534",
                      borderRadius: "9999px",
                    }}
                  >
                    NEW
                  </span>
                )}
              </button>

              {/* Quick links */}
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: "600",
                  color: "#9ca3af",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  padding: "0 4px",
                  marginBottom: "8px",
                }}
              >
                Quick Topics
              </p>

              {[
                { icon: "📊", label: "Dashboard Overview", desc: "Traffic light system" },
                { icon: "📋", label: "Creating Templates", desc: "Build checklists" },
                { icon: "👥", label: "Managing Users", desc: "Roles & permissions" },
                { icon: "📈", label: "Viewing Reports", desc: "Analytics & exports" },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    setIsOpen(false);
                    openTour();
                  }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "10px 12px",
                    background: "transparent",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "14px",
                    color: "#374151",
                    transition: "background 0.15s",
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f3f4f6")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <span style={{ fontSize: "18px" }}>{item.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: "500" }}>{item.label}</div>
                    <div style={{ fontSize: "12px", color: "#9ca3af" }}>{item.desc}</div>
                  </div>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#9ca3af"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
