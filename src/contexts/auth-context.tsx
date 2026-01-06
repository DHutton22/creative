"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from "react";
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
  refreshProfile: () => Promise<void>;
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
  
  // Track the current user ID to prevent race conditions
  const currentUserIdRef = useRef<string | null>(null);
  
  // Impersonation state
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [originalUser, setOriginalUser] = useState<User | null>(null);
  const [impersonatedUser, setImpersonatedUser] = useState<User | null>(null);

  const fetchUserProfile = useCallback(async (supabaseUser: SupabaseUser): Promise<User | null> => {
    try {
      console.log("[Auth] Fetching profile for user:", supabaseUser.id, supabaseUser.email);
      
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", supabaseUser.id)
        .single();

      if (error) {
        console.error("[Auth] Error fetching user profile:", error);
        return null;
      }
      
      console.log("[Auth] Profile fetched:", data?.name, data?.role);
      return data as User;
    } catch (err) {
      console.error("[Auth] Exception fetching user profile:", err);
      return null;
    }
  }, []);

  // Function to refresh the current user's profile
  const refreshProfile = useCallback(async () => {
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    if (currentSession?.user) {
      const profile = await fetchUserProfile(currentSession.user);
      if (profile) {
        setUser(profile);
        currentUserIdRef.current = profile.id;
      }
    }
  }, [fetchUserProfile]);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log("[Auth] Initializing...");
        
        // First try to get the session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("[Auth] Session error:", sessionError);
          // Try to refresh the session
          const { data: refreshData } = await supabase.auth.refreshSession();
          if (refreshData.session && mounted) {
            setSession(refreshData.session);
            if (refreshData.session.user) {
              const profile = await fetchUserProfile(refreshData.session.user);
              if (mounted && profile) {
                setUser(profile);
                currentUserIdRef.current = profile.id;
              }
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
            if (profile) {
              setUser(profile);
              currentUserIdRef.current = profile.id;
            }
          }
        } else {
          // No session - ensure clean state
          setUser(null);
          currentUserIdRef.current = null;
        }
      } catch (error) {
        console.error("[Auth] Error initializing auth:", error);
        // On error, don't clear state - keep existing user if we have one
        // This prevents losing auth state on transient errors
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;
        
        console.log("[Auth] Auth state changed:", event, newSession?.user?.email);
        
        if (event === "SIGNED_OUT") {
          console.log("[Auth] User signed out, clearing state");
          setUser(null);
          setSession(null);
          currentUserIdRef.current = null;
          return;
        }

        // Update session
        setSession(newSession);

        // Only fetch profile if we have a session with a user
        if (newSession?.user) {
          // Check if this is actually a different user
          const newUserId = newSession.user.id;
          
          // Always fetch on SIGNED_IN, otherwise only if user changed or TOKEN_REFRESHED
          if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || currentUserIdRef.current !== newUserId) {
            console.log("[Auth] Fetching profile for event:", event);
            const profile = await fetchUserProfile(newSession.user);
            
            if (mounted && profile) {
              // Double-check we're still dealing with the same user
              const { data: { session: currentSession } } = await supabase.auth.getSession();
              if (currentSession?.user?.id === profile.id) {
                console.log("[Auth] Setting user profile:", profile.name, profile.role);
                setUser(profile);
                currentUserIdRef.current = profile.id;
              } else {
                console.log("[Auth] Session changed during profile fetch, skipping update");
              }
            }
          }
        } else if (event !== "TOKEN_REFRESHED") {
          // Only clear user if this isn't just a token refresh event
          // Token refresh can sometimes fire with null session temporarily
          console.log("[Auth] No user in session for event:", event);
          setUser(null);
          currentUserIdRef.current = null;
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
    refreshProfile,
    // Impersonation
    isImpersonating,
    originalUser,
    viewAsUser,
    stopImpersonating,
  }), [effectiveUser, session, isLoading, isAuthenticated, hasRole, refreshProfile, isImpersonating, originalUser, viewAsUser, stopImpersonating]);

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

