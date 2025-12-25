"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { BRAND } from "@/lib/branding";

// Animated counter component
function AnimatedStat({ 
  value, 
  label, 
  delay = 0 
}: { 
  value: string; 
  label: string; 
  delay?: number;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div style={{ 
        fontSize: '32px', 
        fontWeight: 'bold', 
        color: 'white',
        fontFamily: 'var(--font-display, "DM Sans", sans-serif)',
        letterSpacing: '-0.02em',
      }}>
        {value}
      </div>
      <div style={{ 
        color: 'rgba(255,255,255,0.6)', 
        fontSize: '13px',
        fontWeight: 500,
        marginTop: '4px',
      }}>
        {label}
      </div>
    </div>
  );
}

function LoginContent() {
  const [loginId, setLoginId] = useState(""); // Can be email or username
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/work-centres";
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // If loginId doesn't contain @, treat it as a username and append internal domain
      const email = loginId.includes('@') ? loginId : `${loginId.toLowerCase()}@cc.internal`;
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Make error message more friendly for usernames
        if (error.message === "Invalid login credentials") {
          setError("Invalid username/email or password");
        } else {
          setError(error.message);
        }
      } else {
        router.push(redirectTo);
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left side - Branding */}
      <div 
        style={{ 
          display: 'none',
          width: '50%',
          background: `linear-gradient(135deg, ${BRAND.PRIMARY_BLUE} 0%, ${BRAND.PRIMARY_BLUE_DARK} 50%, ${BRAND.PRIMARY_BLUE_DARKER} 100%)`,
          padding: '48px',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
        }}
        className="lg:flex"
      >
        {/* Background pattern */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          opacity: 0.5,
        }} />
        
        {/* Decorative circles */}
        <div style={{
          position: 'absolute',
          top: '20%',
          right: '-10%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '10%',
          left: '-5%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
        }} />

        <div style={{ 
          position: 'relative', 
          zIndex: 1,
          display: 'flex', 
          alignItems: 'center', 
          gap: '16px',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(-10px)',
          transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '12px',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1)',
          }}>
            <Image
              src={BRAND.logos.ccWhite}
              alt="Creative Composites"
              width={40}
              height={40}
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>
          <div>
            <h1 style={{ 
              color: 'white', 
              fontSize: '20px', 
              fontWeight: 'bold', 
              margin: 0,
              fontFamily: 'var(--font-display, "DM Sans", sans-serif)',
            }}>
              {BRAND.company.name}
            </h1>
            <p style={{ 
              color: 'rgba(255,255,255,0.6)', 
              fontSize: '13px', 
              margin: 0,
              fontWeight: 500,
            }}>
              {BRAND.company.tagline}
            </p>
          </div>
        </div>
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ 
            fontSize: '44px', 
            fontWeight: 'bold', 
            color: 'white', 
            lineHeight: 1.15, 
            margin: '0 0 20px 0',
            fontFamily: 'var(--font-display, "DM Sans", sans-serif)',
            letterSpacing: '-0.02em',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.6s ease-out 0.1s, transform 0.6s ease-out 0.1s',
          }}>
            Machine Checklist<br />System
          </h2>
          <p style={{ 
            color: 'rgba(255,255,255,0.7)', 
            fontSize: '17px', 
            maxWidth: '420px', 
            margin: 0,
            lineHeight: 1.6,
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.6s ease-out 0.2s, transform 0.6s ease-out 0.2s',
          }}>
            Log in to access your daily machine checklists, record maintenance tasks, and keep our CNC operations running smoothly.
          </p>
          
          <div style={{ 
            display: 'flex', 
            gap: '40px', 
            marginTop: '40px',
            paddingTop: '32px',
            borderTop: '1px solid rgba(255, 255, 255, 0.15)',
          }}>
            <AnimatedStat value="Full" label="Traceability" delay={400} />
            <AnimatedStat value="5-Axis" label="CNC Machines" delay={500} />
            <AnimatedStat value="AS9100" label="Standards" delay={600} />
          </div>
        </div>
        
      </div>

      {/* Right side - Login Form */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '32px',
        background: 'white',
      }}>
        <div 
          style={{ 
            width: '100%', 
            maxWidth: '400px',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(10px)',
            transition: 'opacity 0.5s ease-out 0.1s, transform 0.5s ease-out 0.1s',
          }}
        >
          {/* Mobile logo */}
          <div className="lg:hidden" style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ 
              marginBottom: '16px',
              display: 'inline-block',
              background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
              borderRadius: '20px',
              padding: '16px',
              boxShadow: '0 4px 16px rgba(0, 87, 168, 0.1)',
            }}>
              <Image
                src={BRAND.logos.ccBlue}
                alt="Creative Composites"
                width={56}
                height={56}
                style={{ objectFit: 'contain' }}
                priority
              />
            </div>
            <h1 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#111827', 
              margin: '0 0 4px 0',
              fontFamily: 'var(--font-display, "DM Sans", sans-serif)',
            }}>
              {BRAND.company.name}
            </h1>
            <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
              {BRAND.company.tagline}
            </p>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ 
              fontSize: '28px', 
              fontWeight: 'bold', 
              color: '#111827', 
              margin: '0 0 8px 0',
              fontFamily: 'var(--font-display, "DM Sans", sans-serif)',
              letterSpacing: '-0.01em',
            }}>
              Welcome back
            </h2>
            <p style={{ color: '#6b7280', margin: 0, fontSize: '15px' }}>
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div 
                style={{ 
                  padding: '16px', 
                  borderRadius: '12px', 
                  background: '#fef2f2', 
                  border: '1px solid #fecaca',
                  color: '#dc2626',
                  fontSize: '14px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  animation: 'shake 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                <svg style={{ width: '20px', height: '20px', flexShrink: 0, marginTop: '2px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <label 
                htmlFor="loginId" 
                style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#374151', 
                  marginBottom: '8px',
                }}
              >
                Username or Email
              </label>
              <input
                id="loginId"
                type="text"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '15px',
                  color: '#111827',
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  background: '#fafafa',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = BRAND.PRIMARY_BLUE;
                  e.target.style.boxShadow = '0 0 0 4px rgba(0,87,168,0.1)';
                  e.target.style.background = 'white';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                  e.target.style.background = '#fafafa';
                }}
                placeholder="jsmith or you@company.com"
                required
                autoComplete="username"
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label 
                  htmlFor="password" 
                  style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}
                >
                  Password
                </label>
                <Link 
                  href="/forgot-password" 
                  style={{ 
                    fontSize: '13px', 
                    color: BRAND.PRIMARY_BLUE, 
                    textDecoration: 'none', 
                    fontWeight: '600',
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px 48px 14px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '15px',
                    color: '#111827',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    background: '#fafafa',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = BRAND.PRIMARY_BLUE;
                    e.target.style.boxShadow = '0 0 0 4px rgba(0,87,168,0.1)';
                    e.target.style.background = 'white';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                    e.target.style.background = '#fafafa';
                  }}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#6b7280',
                    borderRadius: '6px',
                    transition: 'color 0.15s, background 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#374151';
                    e.currentTarget.style.background = '#f3f4f6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#6b7280';
                    e.currentTarget.style.background = 'transparent';
                  }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '14px 16px',
                background: isLoading ? '#6b7280' : `linear-gradient(135deg, ${BRAND.PRIMARY_BLUE} 0%, ${BRAND.PRIMARY_BLUE_DARK} 100%)`,
                color: 'white',
                fontWeight: '600',
                fontSize: '15px',
                border: 'none',
                borderRadius: '12px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                transition: 'transform 0.15s, box-shadow 0.15s',
                boxShadow: isLoading ? 'none' : '0 4px 14px rgba(0, 87, 168, 0.25)',
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 87, 168, 0.35)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 87, 168, 0.25)';
                }
              }}
              onMouseDown={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'scale(0.98)';
                }
              }}
              onMouseUp={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
            >
              {isLoading ? (
                <svg style={{ animation: 'spin 1s linear infinite', width: '20px', height: '20px' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <>
                  Sign In
                  <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <p style={{ marginTop: '32px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
            Don&apos;t have an account?{" "}
            <Link 
              href="/signup" 
              style={{ 
                color: BRAND.PRIMARY_BLUE, 
                fontWeight: '600', 
                textDecoration: 'none',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              Sign up
            </Link>
          </p>

          <p style={{ 
            marginTop: '48px', 
            paddingTop: '32px', 
            borderTop: '1px solid #e5e7eb', 
            textAlign: 'center', 
            color: '#9ca3af', 
            fontSize: '13px',
          }}>
            &copy; {new Date().getFullYear()} Creative Composites. All rights reserved.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        @media (min-width: 1024px) {
          .lg\\:flex { display: flex !important; }
          .lg\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        background: 'white',
      }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '3px solid #e5e7eb', 
          borderTopColor: BRAND.PRIMARY_BLUE, 
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
