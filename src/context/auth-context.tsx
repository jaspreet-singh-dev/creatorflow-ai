"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/types/database.types";

export const OWNER_EMAIL = "jaspreetsing3412@gmail.com";

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  isDemoMode: boolean;
  isOwner: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  deleteAccount: () => Promise<{ error: Error | null }>;
  signInDemo: () => void;
  exitDemoMode: () => void;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

export const DEMO_USER: User = {
  id: "demo-user-123456",
  app_metadata: { provider: "email" },
  user_metadata: { full_name: "Alex Rivera (Demo Creator)" },
  aud: "authenticated",
  created_at: new Date().toISOString(),
  email: "creator@creatorflow.ai",
  phone: "",
  role: "authenticated",
  updated_at: new Date().toISOString(),
};

export const DEMO_PROFILE: Profile = {
  id: "demo-user-123456",
  email: "creator@creatorflow.ai",
  full_name: "Alex Rivera",
  avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  plan_tier: "creator",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const supabase = useMemo(() => createClient(), []);
  const hasSupabaseUrl = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")
  );

  const isOwner = Boolean(
    user?.email?.toLowerCase() === OWNER_EMAIL.toLowerCase() ||
    (profile as any)?.role === "owner" ||
    (profile as any)?.is_owner === true
  );

  const fetchProfile = useCallback(
    async (userId: string, email: string) => {
      const isOwnerAccount = email.toLowerCase() === OWNER_EMAIL.toLowerCase();

      if (!hasSupabaseUrl) {
        setProfile({
          id: userId,
          email,
          full_name: email.split("@")[0],
          avatar_url: null,
          plan_tier: isOwnerAccount ? "pro" : "free",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .maybeSingle();

        if (data && !error) {
          const profileData = data as Profile;
          if (isOwnerAccount) {
            profileData.plan_tier = "pro";
            (profileData as any).role = "owner";
            (profileData as any).is_owner = true;
          }
          setProfile(profileData);
        } else {
          // Guaranteed profile self-healing in database if record was missing
          const defaultProfile: Record<string, any> = {
            id: userId,
            email,
            full_name: email.split("@")[0],
            avatar_url: null,
            plan_tier: isOwnerAccount ? "pro" : "free",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          if (isOwnerAccount) {
            defaultProfile.role = "owner";
            defaultProfile.is_owner = true;
          }

          setProfile(defaultProfile as Profile);

          try {
            await supabase.from("profiles").upsert(defaultProfile);
          } catch (e) {
            console.warn("Notice: could not upsert profile fallback:", e);
          }
        }
      } catch (e) {
        console.warn("Could not load profile from Supabase:", e);
      }
    },
    [hasSupabaseUrl, supabase]
  );

  useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      try {
        // Check for explicitly selected demo mode
        const savedDemo = localStorage.getItem("cf_demo_session");
        if (savedDemo === "true") {
          if (isMounted) {
            setUser(DEMO_USER);
            setProfile(DEMO_PROFILE);
            setIsDemoMode(true);
            setIsLoading(false);
          }
          return;
        }

        // Live Supabase session check
        if (hasSupabaseUrl) {
          const {
            data: { session: currentSession },
            error,
          } = await supabase.auth.getSession();

          if (!isMounted) return;

          if (currentSession?.user && !error) {
            setSession(currentSession);
            setUser(currentSession.user);
            setIsDemoMode(false);
            await fetchProfile(currentSession.user.id, currentSession.user.email || "");
          } else {
            // Unauthenticated: NEVER silently auto-login as demo user!
            setSession(null);
            setUser(null);
            setProfile(null);
            setIsDemoMode(false);
          }
        } else {
          // No configured Supabase: unauthenticated state
          setSession(null);
          setUser(null);
          setProfile(null);
          setIsDemoMode(false);
        }
      } catch (err) {
        console.warn("Auth initialization notice:", err);
        if (isMounted) {
          setSession(null);
          setUser(null);
          setProfile(null);
          setIsDemoMode(false);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initializeAuth();

    if (hasSupabaseUrl) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
        if (!isMounted) return;
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) {
          setIsDemoMode(false);
          localStorage.removeItem("cf_demo_session");
          await fetchProfile(newSession.user.id, newSession.user.email || "");
        } else {
          setProfile(null);
          setIsDemoMode(false);
        }
        setIsLoading(false);
      });

      return () => {
        isMounted = false;
        subscription.unsubscribe();
      };
    }
  }, [hasSupabaseUrl, supabase, fetchProfile]);

  const signIn = async (email: string, password: string): Promise<{ error: Error | null }> => {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        return { error };
      }

      localStorage.removeItem("cf_demo_session");
      setIsDemoMode(false);
      setUser(data.user);
      setSession(data.session);

      if (data.user) {
        await fetchProfile(data.user.id, data.user.email || normalizedEmail);
      }

      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string
  ): Promise<{ error: Error | null }> => {
    if (!email || !password || password.length < 6) {
      return { error: new Error("Password must be at least 6 characters.") };
    }

    try {
      const regRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName }),
      });

      const regData = await regRes.json();
      if (!regRes.ok) {
        return { error: new Error(regData.error || "Failed to register account.") };
      }

      // Automatically sign in upon registration
      const { data, error: signInErr } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (signInErr) {
        return { error: signInErr };
      }

      localStorage.removeItem("cf_demo_session");
      setIsDemoMode(false);
      setUser(data.user);
      setSession(data.session);

      if (data.user) {
        await fetchProfile(data.user.id, data.user.email || email);
      }

      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signOut = async () => {
    try {
      if (hasSupabaseUrl) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.warn("Sign out notice:", e);
    } finally {
      setUser(null);
      setProfile(null);
      setSession(null);
      setIsDemoMode(false);
      try {
        localStorage.removeItem("cf_active_user_session");
        localStorage.removeItem("cf_demo_session");
        localStorage.removeItem("cf_active_channel_id");
      } catch {
        // ignore
      }
    }
  };

  const resetPassword = async (email: string): Promise<{ error: Error | null }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return { error };
    } catch (err: any) {
      return { error: err };
    }
  };

  const deleteAccount = async (): Promise<{ error: Error | null }> => {
    if (!user) return { error: new Error("No authenticated user.") };
    try {
      const res = await fetch("/api/auth/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { error: new Error(data.error || "Failed to delete account.") };
      }
      await signOut();
      return { error: null };
    } catch (e: any) {
      return { error: e };
    }
  };

  const signInDemo = () => {
    setUser(DEMO_USER);
    setProfile(DEMO_PROFILE);
    setIsDemoMode(true);
    try {
      localStorage.setItem("cf_demo_session", "true");
    } catch {
      // ignore
    }
  };

  const exitDemoMode = () => {
    setUser(null);
    setProfile(null);
    setSession(null);
    setIsDemoMode(false);
    try {
      localStorage.removeItem("cf_demo_session");
    } catch {
      // ignore
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;

    // Never allow non-owners to self-promote to owner or modify plan_tier directly
    const sanitizedUpdates = { ...updates };
    if (!isOwner) {
      delete (sanitizedUpdates as any).role;
      delete (sanitizedUpdates as any).is_owner;
      delete sanitizedUpdates.plan_tier;
    }

    setProfile((prev) => (prev ? { ...prev, ...sanitizedUpdates } : null));

    if (hasSupabaseUrl && user.id !== "demo-user-123456") {
      try {
        await supabase
          .from("profiles")
          .update({
            ...sanitizedUpdates,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);
      } catch (err) {
        console.warn("Could not save profile updates to database:", err);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        isDemoMode,
        isOwner,
        signIn,
        signUp,
        signOut,
        resetPassword,
        deleteAccount,
        signInDemo,
        exitDemoMode,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
