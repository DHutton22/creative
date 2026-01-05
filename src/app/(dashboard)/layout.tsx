"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { AuthProvider } from "@/contexts/auth-context";
import { TourProvider } from "@/contexts/tour-context";
import { ToastProvider } from "@/contexts/toast-context";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <div 
        className="bg-mesh"
        style={{ 
          display: 'flex', 
          minHeight: '100vh', 
          background: 'var(--surface-secondary, #f8fafc)',
        }}
      >
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              zIndex: 40,
              display: 'block',
              animation: 'fadeIn 0.2s ease-out',
            }}
            className="mobile-overlay"
          />
        )}
        
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main 
            style={{ 
              flex: 1, 
              padding: '20px', 
              overflowY: 'auto',
            }} 
            className="md:p-6"
          >
            <div 
              style={{
                animation: 'fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {children}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <TourProvider>
        <ToastProvider>
          <DashboardContent>{children}</DashboardContent>
        </ToastProvider>
      </TourProvider>
    </AuthProvider>
  );
}
