"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser, Session } from "@supabase/supabase-js";
import type { User, UserRole } from "@/types/database";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  // Impersonation
  isImpersonating: boolean;
  originalUser: User | null;
  viewAsUser: (targetUser: User) => void;
  stopImpersonating: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Get client once outside component to ensure stability
const supabase = createClient();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Impersonation state
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [originalUser, setOriginalUser] = useState<User | null>(null);
  const [impersonatedUser, setImpersonatedUser] = useState<User | null>(null);

  const fetchUserProfile = useCallback(async (supabaseUser: SupabaseUser) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", supabaseUser.id)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        return null;
      }
      return data as User;
    } catch (err) {
      console.error("Exception fetching user profile:", err);
      return null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // First try to get the session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          // Try to refresh the session
          const { data: refreshData } = await supabase.auth.refreshSession();
          if (refreshData.session && mounted) {
            setSession(refreshData.session);
            if (refreshData.session.user) {
              const profile = await fetchUserProfile(refreshData.session.user);
              if (mounted) setUser(profile);
            }
          }
          if (mounted) setIsLoading(false);
          return;
        }
        
        if (!mounted) return;
        
        setSession(session);

        if (session?.user) {
          const profile = await fetchUserProfile(session.user);
          if (mounted) {
            setUser(profile);
          }
        } else {
          // No session - ensure clean state
          setUser(null);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        // On error, clear state to force re-login
        if (mounted) {
          setUser(null);
          setSession(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log("Auth state changed:", event);
        setSession(session);

        if (event === "SIGNED_OUT") {
          setUser(null);
          setSession(null);
          return;
        }

        if (event === "TOKEN_REFRESHED" || event === "SIGNED_IN") {
          if (session?.user) {
            const profile = await fetchUserProfile(session.user);
            if (mounted) {
              setUser(profile);
            }
          }
        }

        if (session?.user) {
          const profile = await fetchUserProfile(session.user);
          if (mounted) {
            setUser(profile);
          }
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) return { error };

    // Note: User profile is created automatically by database trigger
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  // Get the effective user (impersonated or actual)
  const effectiveUser = isImpersonating && impersonatedUser ? impersonatedUser : user;

  const hasRole = useCallback((roles: UserRole | UserRole[]) => {
    // When impersonating, use the impersonated user's role
    const checkUser = isImpersonating && impersonatedUser ? impersonatedUser : user;
    if (!checkUser) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(checkUser.role);
  }, [user, isImpersonating, impersonatedUser]);

  const isAuthenticated = useMemo(() => !!session && !!user, [session, user]);

  // Impersonation functions
  const viewAsUser = useCallback((targetUser: User) => {
    if (!user || user.role !== "admin") return;
    setOriginalUser(user);
    setImpersonatedUser(targetUser);
    setIsImpersonating(true);
  }, [user]);

  const stopImpersonating = useCallback(() => {
    setIsImpersonating(false);
    setImpersonatedUser(null);
    setOriginalUser(null);
  }, []);

  const contextValue = useMemo(() => ({
    user: effectiveUser,
    session,
    isLoading,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    hasRole,
    // Impersonation
    isImpersonating,
    originalUser,
    viewAsUser,
    stopImpersonating,
  }), [effectiveUser, session, isLoading, isAuthenticated, hasRole, isImpersonating, originalUser, viewAsUser, stopImpersonating]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

