"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/types/database.types";

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  isDemoMode: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  signInDemo: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER: User = {
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

const DEMO_PROFILE: Profile = {
  id: "demo-user-123456",
  email: "creator@creatorflow.ai",
  full_name: "Alex Rivera",
  avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  plan_tier: "creator",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    // Check if demo session is persisted in localStorage
    const savedDemo = localStorage.getItem("cf_demo_session");
    if (savedDemo === "true") {
      setUser(DEMO_USER);
      setProfile(DEMO_PROFILE);
      setIsDemoMode(true);
      setIsLoading(false);
      return;
    }

    // Otherwise check Supabase session
    async function initializeAuth() {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          await fetchProfile(currentSession.user.id, currentSession.user.email || "");
        } else {
          // If no Supabase session and demo fallback is enabled or empty DB, provide demo option
          const enableDemo = process.env.NEXT_PUBLIC_ENABLE_DEMO_FALLBACK !== "false";
          if (enableDemo && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
            // Default to demo if supabase url not configured
            setUser(DEMO_USER);
            setProfile(DEMO_PROFILE);
            setIsDemoMode(true);
          }
        }
      } catch (err) {
        console.warn("Supabase auth init notice:", err);
      } finally {
        setIsLoading(false);
      }
    }

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        setIsDemoMode(false);
        localStorage.removeItem("cf_demo_session");
        await fetchProfile(newSession.user.id, newSession.user.email || "");
      } else if (!isDemoMode) {
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchProfile(userId: string, email: string) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (data && !error) {
        setProfile(data as Profile);
      } else {
        // Fallback default profile
        setProfile({
          id: userId,
          email,
          full_name: email.split("@")[0],
          avatar_url: null,
          plan_tier: "free",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    } catch {
      setProfile({
        id: userId,
        email,
        full_name: email.split("@")[0],
        avatar_url: null,
        plan_tier: "free",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error };
      localStorage.removeItem("cf_demo_session");
      setIsDemoMode(false);
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });
      if (error) return { error };
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signOut = async () => {
    localStorage.removeItem("cf_demo_session");
    setIsDemoMode(false);
    setUser(null);
    setProfile(null);
    setSession(null);
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Sign out completed locally:", e);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return { error };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signInDemo = () => {
    localStorage.setItem("cf_demo_session", "true");
    setUser(DEMO_USER);
    setProfile(DEMO_PROFILE);
    setIsDemoMode(true);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        isDemoMode,
        signIn,
        signUp,
        signOut,
        resetPassword,
        signInDemo,
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
