"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { createClient } from "@/lib/supabase/client";
import { X, LogOut } from "lucide-react";
import { BRAND } from "@/lib/branding";

const navItems = [
  { href: "/work-centres", label: "Work Centres", icon: "grid" },
  { href: "/checklists", label: "My Checklists", icon: "history" },
];

const adminItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "home" },
  { href: "/admin/work-centres", label: "Work Centres", icon: "grid" },
  { href: "/admin/machines", label: "Machines", icon: "machine" },
  { href: "/admin/templates", label: "Checklist Templates", icon: "template" },
  { href: "/admin/users", label: "Users", icon: "users" },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const icons: Record<string, React.ReactNode> = {
  home: (
    <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  grid: (
    <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  clipboard: (
    <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  history: (
    <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  wrench: (
    <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  chart: (
    <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  template: (
    <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
    </svg>
  ),
  machine: (
    <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
    </svg>
  ),
  users: (
    <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  settings: (
    <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
};

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, hasRole, isLoading } = useAuth();
  const supabase = createClient();

  const isAdmin = hasRole(["admin", "supervisor"]);

  const handleSignOut = async () => {
    await supabase.auth.signOut({ scope: 'global' });
    // Hard redirect to clear any cached state
    window.location.href = "/login";
  };

  const isActive = (href: string) => {
    return pathname.startsWith(href);
  };

  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <aside 
      style={{
        width: '260px',
        background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        zIndex: 50,
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: isOpen ? '4px 0 24px rgba(0, 0, 0, 0.08)' : 'none',
      }}
      className="sidebar-nav"
    >
      {/* Logo */}
      <div style={{ 
        padding: '20px', 
        borderBottom: '1px solid #e2e8f0', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        background: 'linear-gradient(135deg, rgba(0, 87, 168, 0.02) 0%, transparent 100%)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
            borderRadius: '12px',
            padding: '8px',
            boxShadow: '0 2px 8px rgba(0, 87, 168, 0.1)',
          }}>
            <Image
              src={BRAND.logos.ccBlue}
              alt="Creative Composites"
              width={32}
              height={32}
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>
          <div>
            <h1 style={{ 
              fontFamily: 'var(--font-display, "DM Sans", sans-serif)',
              fontSize: '15px', 
              fontWeight: '700', 
              color: '#1e293b', 
              margin: 0,
              letterSpacing: '-0.01em',
            }}>
              {BRAND.company.name}
            </h1>
            <p style={{ 
              fontSize: '11px', 
              color: '#64748b', 
              margin: 0,
              fontWeight: 500,
            }}>
              {BRAND.company.tagline}
            </p>
          </div>
        </div>
        
        {/* Close button for mobile */}
        {onClose && (
          <button
            onClick={onClose}
            style={{
              padding: '8px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.15s, color 0.15s',
            }}
            className="close-sidebar-btn"
            aria-label="Close menu"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f1f5f9';
              e.currentTarget.style.color = '#374151';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#64748b';
            }}
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <p style={{ 
            fontFamily: 'var(--font-body, "Plus Jakarta Sans", sans-serif)',
            fontSize: '11px', 
            fontWeight: '600', 
            color: '#94a3b8', 
            textTransform: 'uppercase', 
            letterSpacing: '0.08em', 
            padding: '0 10px', 
            marginBottom: '10px',
          }}>
            Main Menu
          </p>
          {navItems.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleLinkClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '11px 12px',
                borderRadius: '10px',
                marginBottom: '4px',
                textDecoration: 'none',
                color: isActive(item.href) ? BRAND.PRIMARY_BLUE : '#64748b',
                background: isActive(item.href) ? 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' : 'transparent',
                fontWeight: isActive(item.href) ? '600' : '500',
                fontSize: '14px',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: isActive(item.href) ? 'inset 0 0 0 1px rgba(0, 87, 168, 0.1)' : 'none',
                animation: `fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${index * 50}ms backwards`,
              }}
              onMouseEnter={(e) => {
                if (!isActive(item.href)) {
                  e.currentTarget.style.background = '#f1f5f9';
                  e.currentTarget.style.color = '#374151';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(item.href)) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#64748b';
                }
              }}
            >
              <span style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '20px',
                height: '20px',
              }}>
                {icons[item.icon]}
              </span>
              {item.label}
            </Link>
          ))}
        </div>

        {isAdmin && (
          <div>
            <p style={{ 
              fontFamily: 'var(--font-body, "Plus Jakarta Sans", sans-serif)',
              fontSize: '11px', 
              fontWeight: '600', 
              color: '#94a3b8', 
              textTransform: 'uppercase', 
              letterSpacing: '0.08em', 
              padding: '0 10px', 
              marginBottom: '10px',
            }}>
              Admin
            </p>
            {adminItems.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleLinkClick}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '11px 12px',
                  borderRadius: '10px',
                  marginBottom: '4px',
                  textDecoration: 'none',
                  color: isActive(item.href) ? BRAND.PRIMARY_BLUE : '#64748b',
                  background: isActive(item.href) ? 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' : 'transparent',
                  fontWeight: isActive(item.href) ? '600' : '500',
                  fontSize: '14px',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: isActive(item.href) ? 'inset 0 0 0 1px rgba(0, 87, 168, 0.1)' : 'none',
                  animation: `fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${(navItems.length + index) * 50}ms backwards`,
                }}
                onMouseEnter={(e) => {
                  if (!isActive(item.href)) {
                    e.currentTarget.style.background = '#f1f5f9';
                    e.currentTarget.style.color = '#374151';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(item.href)) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#64748b';
                  }
                }}
              >
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '20px',
                  height: '20px',
                }}>
                  {icons[item.icon]}
                </span>
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* User */}
      <div style={{ 
        padding: '16px', 
        borderTop: '1px solid #e2e8f0',
        background: 'linear-gradient(180deg, transparent 0%, rgba(0, 87, 168, 0.02) 100%)',
      }}>
        {isLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              background: 'linear-gradient(90deg, #f1f5f9 0%, #e5e7eb 50%, #f1f5f9 100%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s ease-in-out infinite',
              borderRadius: '50%',
            }} />
            <div style={{ flex: 1 }}>
              <div style={{ 
                height: '14px', 
                background: 'linear-gradient(90deg, #f1f5f9 0%, #e5e7eb 50%, #f1f5f9 100%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s ease-in-out infinite',
                borderRadius: '4px', 
                width: '70%', 
                marginBottom: '6px',
              }} />
              <div style={{ 
                height: '12px', 
                background: 'linear-gradient(90deg, #f1f5f9 0%, #e5e7eb 50%, #f1f5f9 100%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s ease-in-out infinite',
                borderRadius: '4px', 
                width: '50%',
              }} />
            </div>
          </div>
        ) : user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: `linear-gradient(135deg, ${BRAND.PRIMARY_BLUE} 0%, ${BRAND.PRIMARY_BLUE_DARK} 100%)`,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: '700',
              fontSize: '15px',
              fontFamily: 'var(--font-display, "DM Sans", sans-serif)',
              boxShadow: '0 2px 8px rgba(0, 87, 168, 0.25)',
            }}>
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ 
                fontWeight: '600', 
                color: '#1e293b', 
                margin: 0, 
                fontSize: '14px', 
                whiteSpace: 'nowrap', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis',
                fontFamily: 'var(--font-body, "Plus Jakarta Sans", sans-serif)',
              }}>
                {user.name || 'User'}
              </p>
              <p style={{ 
                fontSize: '12px', 
                color: '#64748b', 
                margin: 0, 
                textTransform: 'capitalize',
                fontWeight: 500,
              }}>
                {user.role}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              style={{
                padding: '10px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#64748b',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.15s, color 0.15s',
              }}
              title="Sign out"
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#fef2f2';
                e.currentTarget.style.color = '#dc2626';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#64748b';
              }}
            >
              <LogOut style={{ width: '18px', height: '18px' }} />
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            style={{
              display: 'block',
              padding: '12px',
              textAlign: 'center',
              background: `linear-gradient(135deg, ${BRAND.PRIMARY_BLUE} 0%, ${BRAND.PRIMARY_BLUE_DARK} 100%)`,
              color: 'white',
              borderRadius: '10px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '14px',
              boxShadow: '0 4px 12px rgba(0, 87, 168, 0.25)',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 87, 168, 0.35)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 87, 168, 0.25)';
            }}
          >
            Sign In
          </Link>
        )}
      </div>
    </aside>
  );
}
