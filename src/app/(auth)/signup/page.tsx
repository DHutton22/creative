"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { BRAND } from "@/lib/branding";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '16px',
    color: '#111827',
    outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s'
  };

  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)', padding: '16px' }}>
        <div style={{ width: '100%', maxWidth: '400px', background: 'white', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', padding: '32px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg style={{ width: '32px', height: '32px', color: '#16a34a' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: '0 0 8px' }}>Check your email</h2>
            <p style={{ color: '#6b7280', margin: '0 0 24px' }}>
              We&apos;ve sent a confirmation link to <strong style={{ color: '#374151' }}>{email}</strong>.
            </p>
            <button
              onClick={() => router.push("/login")}
              style={{ width: '100%', padding: '12px', background: BRAND.PRIMARY_BLUE, color: 'white', fontWeight: '600', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          justifyContent: 'space-between'
        }}
        className="lg:flex"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Image
            src={BRAND.logos.ccWhite}
            alt="Creative Composites"
            width={48}
            height={48}
            style={{ objectFit: 'contain' }}
            priority
          />
          <div>
            <h1 style={{ color: 'white', fontSize: '20px', fontWeight: 'bold', margin: 0 }}>{BRAND.company.name}</h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', margin: 0 }}>{BRAND.company.tagline}</p>
          </div>
        </div>
        
        <div>
          <h2 style={{ fontSize: '40px', fontWeight: 'bold', color: 'white', lineHeight: 1.2, margin: '0 0 16px' }}>
            Join the Future of<br />Manufacturing<br />Quality Control
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '18px', maxWidth: '400px', margin: 0 }}>
            Digital checklists, automated maintenance tracking, and complete audit trails.
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '32px' }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '16px' }}>
              <svg style={{ width: '32px', height: '32px', color: 'white', marginBottom: '8px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div style={{ color: 'white', fontWeight: '600' }}>Digital Checklists</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>Replace paper with smart forms</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '16px' }}>
              <svg style={{ width: '32px', height: '32px', color: 'white', marginBottom: '8px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div style={{ color: 'white', fontWeight: '600' }}>Maintenance</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>Never miss a service</div>
            </div>
          </div>
        </div>
        
      </div>

      {/* Right side - Signup Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px', background: 'white' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          {/* Mobile logo */}
          <div className="lg:hidden" style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ marginBottom: '16px' }}>
              <Image
                src={BRAND.logos.ccBlue}
                alt="Creative Composites"
                width={64}
                height={64}
                style={{ objectFit: 'contain', margin: '0 auto' }}
                priority
              />
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: '0 0 4px' }}>{BRAND.company.name}</h1>
            <p style={{ color: '#6b7280', margin: 0 }}>{BRAND.company.tagline}</p>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: '0 0 4px' }}>Create your account</h2>
            <p style={{ color: '#6b7280', margin: 0 }}>Start managing your machine checklists today</p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{ padding: '16px', borderRadius: '8px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '14px', marginBottom: '20px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <svg style={{ width: '20px', height: '20px', flexShrink: 0, marginTop: '2px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="name" style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Full name</label>
              <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} placeholder="John Smith" required autoComplete="name"
                onFocus={(e) => { e.target.style.borderColor = BRAND.PRIMARY_BLUE; e.target.style.boxShadow = '0 0 0 3px rgba(0,87,168,0.1)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#d1d5db'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="email" style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Email address</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} placeholder="you@company.com" required autoComplete="email"
                onFocus={(e) => { e.target.style.borderColor = BRAND.PRIMARY_BLUE; e.target.style.boxShadow = '0 0 0 3px rgba(0,87,168,0.1)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#d1d5db'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="password" style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Password</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} placeholder="Create a strong password" required autoComplete="new-password"
                onFocus={(e) => { e.target.style.borderColor = BRAND.PRIMARY_BLUE; e.target.style.boxShadow = '0 0 0 3px rgba(0,87,168,0.1)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#d1d5db'; e.target.style.boxShadow = 'none'; }}
              />
              <p style={{ marginTop: '6px', fontSize: '14px', color: '#6b7280' }}>Must be at least 8 characters</p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label htmlFor="confirmPassword" style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Confirm password</label>
              <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={inputStyle} placeholder="Confirm your password" required autoComplete="new-password"
                onFocus={(e) => { e.target.style.borderColor = BRAND.PRIMARY_BLUE; e.target.style.boxShadow = '0 0 0 3px rgba(0,87,168,0.1)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#d1d5db'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{ width: '100%', padding: '12px 16px', background: isLoading ? '#6b7280' : BRAND.PRIMARY_BLUE, color: 'white', fontWeight: '600', fontSize: '16px', border: 'none', borderRadius: '8px', cursor: isLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              {isLoading ? (
                <svg style={{ animation: 'spin 1s linear infinite', width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24">
                  <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <>
                  Create Account
                  <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <p style={{ marginTop: '32px', textAlign: 'center', color: '#6b7280' }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: BRAND.PRIMARY_BLUE, fontWeight: '600', textDecoration: 'none' }}>Sign in</Link>
          </p>

          <p style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid #e5e7eb', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
            &copy; {new Date().getFullYear()} Creative Composites. All rights reserved.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (min-width: 1024px) { .lg\\:flex { display: flex !important; } .lg\\:hidden { display: none !important; } }
      `}</style>
    </div>
  );
}
