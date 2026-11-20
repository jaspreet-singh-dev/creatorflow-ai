"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
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
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

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

interface LocalRegisteredUser {
  id: string;
  email: string;
  password: string;
  full_name: string;
  avatar_url: string | null;
  plan_tier: "free" | "creator" | "pro";
  created_at: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const supabase = createClient();
  const hasSupabaseUrl = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")
  );

  const fetchProfile = useCallback(async (userId: string, email: string) => {
    if (!hasSupabaseUrl) {
      const savedActive = localStorage.getItem("cf_active_user_session");
      if (savedActive) {
        try {
          const parsed = JSON.parse(savedActive);
          setProfile(parsed);
          return;
        } catch {
          // ignore
        }
      }
      setProfile({
        id: userId,
        email,
        full_name: email.split("@")[0],
        avatar_url: null,
        plan_tier: "free",
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
        .single();

      if (data && !error) {
        setProfile(data as Profile);
      } else {
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
  }, [hasSupabaseUrl, supabase]);

  useEffect(() => {
    // 1. Check for active registered user session in local engine
    const savedActiveUser = localStorage.getItem("cf_active_user_session");
    if (savedActiveUser) {
      try {
        const parsedProfile: Profile = JSON.parse(savedActiveUser);
        const registeredUser: User = {
          id: parsedProfile.id,
          app_metadata: { provider: "email" },
          user_metadata: { full_name: parsedProfile.full_name },
          aud: "authenticated",
          created_at: parsedProfile.created_at,
          email: parsedProfile.email,
          phone: "",
          role: "authenticated",
          updated_at: parsedProfile.updated_at,
        };
        setUser(registeredUser);
        setProfile(parsedProfile);
        setIsDemoMode(false);
        setIsLoading(false);
        return;
      } catch (e) {
        console.warn("Could not load local session:", e);
      }
    }

    // 2. Check if demo session is persisted
    const savedDemo = localStorage.getItem("cf_demo_session");
    if (savedDemo === "true") {
      setUser(DEMO_USER);
      setProfile(DEMO_PROFILE);
      setIsDemoMode(true);
      setIsLoading(false);
      return;
    }

    // 3. Check Supabase session if configured
    async function initializeAuth() {
      try {
        if (hasSupabaseUrl) {
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          setSession(currentSession);
          setUser(currentSession?.user ?? null);

          if (currentSession?.user) {
            await fetchProfile(currentSession.user.id, currentSession.user.email || "");
          } else {
            // Default to demo if no session
            setUser(DEMO_USER);
            setProfile(DEMO_PROFILE);
            setIsDemoMode(true);
          }
        } else {
          // Default to demo fallback
          setUser(DEMO_USER);
          setProfile(DEMO_PROFILE);
          setIsDemoMode(true);
        }
      } catch (err) {
        console.warn("Supabase auth init notice:", err);
        setUser(DEMO_USER);
        setProfile(DEMO_PROFILE);
        setIsDemoMode(true);
      } finally {
        setIsLoading(false);
      }
    }

    initializeAuth();

    if (hasSupabaseUrl) {
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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasSupabaseUrl]);

  const signIn = async (email: string, password: string): Promise<{ error: Error | null }> => {
    // If Supabase is connected, use real Supabase Auth
    if (hasSupabaseUrl) {
      try {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { error };
        localStorage.removeItem("cf_demo_session");
        localStorage.removeItem("cf_active_user_session");
        setIsDemoMode(false);
        return { error: null };
      } catch (err: any) {
        return { error: err };
      }
    }

    // Otherwise use Local Account Database
    try {
      const rawUsers = localStorage.getItem("cf_registered_users_v1");
      const users: LocalRegisteredUser[] = rawUsers ? JSON.parse(rawUsers) : [];
      const normalizedEmail = email.trim().toLowerCase();

      const matched = users.find((u) => u.email.toLowerCase() === normalizedEmail);

      if (!matched) {
        // If it's the demo account
        if (normalizedEmail === "creator@creatorflow.ai" && password === "demo1234") {
          signInDemo();
          return { error: null };
        }
        return {
          error: new Error("No account found with this email. Please click Sign Up to register."),
        };
      }

      if (matched.password !== password) {
        return {
          error: new Error("Incorrect password. Please verify your credentials."),
        };
      }

      const activeProfile: Profile = {
        id: matched.id,
        email: matched.email,
        full_name: matched.full_name,
        avatar_url: matched.avatar_url,
        plan_tier: matched.plan_tier,
        created_at: matched.created_at,
        updated_at: new Date().toISOString(),
      };

      const activeUser: User = {
        id: matched.id,
        app_metadata: { provider: "email" },
        user_metadata: { full_name: matched.full_name },
        aud: "authenticated",
        created_at: matched.created_at,
        email: matched.email,
        phone: "",
        role: "authenticated",
        updated_at: new Date().toISOString(),
      };

      localStorage.setItem("cf_active_user_session", JSON.stringify(activeProfile));
      localStorage.removeItem("cf_demo_session");

      setUser(activeUser);
      setProfile(activeProfile);
      setIsDemoMode(false);

      return { error: null };
    } catch (e: any) {
      return { error: new Error(e?.message || "Authentication error.") };
    }
  };

  const signUp = async (email: string, password: string, fullName: string): Promise<{ error: Error | null }> => {
    if (!email || !password || password.length < 6) {
      return { error: new Error("Password must be at least 6 characters.") };
    }

    if (hasSupabaseUrl) {
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
    }

    // Local Account Database Registration
    try {
      const rawUsers = localStorage.getItem("cf_registered_users_v1");
      const users: LocalRegisteredUser[] = rawUsers ? JSON.parse(rawUsers) : [];
      const normalizedEmail = email.trim().toLowerCase();

      if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
        return { error: new Error("An account with this email already exists. Please sign in.") };
      }

      const newUser: LocalRegisteredUser = {
        id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        email: normalizedEmail,
        password,
        full_name: fullName.trim() || normalizedEmail.split("@")[0],
        avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName || email)}`,
        plan_tier: "free",
        created_at: new Date().toISOString(),
      };

      users.push(newUser);
      localStorage.setItem("cf_registered_users_v1", JSON.stringify(users));

      // Automatically sign them in
      const activeProfile: Profile = {
        id: newUser.id,
        email: newUser.email,
        full_name: newUser.full_name,
        avatar_url: newUser.avatar_url,
        plan_tier: newUser.plan_tier,
        created_at: newUser.created_at,
        updated_at: new Date().toISOString(),
      };

      const activeUser: User = {
        id: newUser.id,
        app_metadata: { provider: "email" },
        user_metadata: { full_name: newUser.full_name },
        aud: "authenticated",
        created_at: newUser.created_at,
        email: newUser.email,
        phone: "",
        role: "authenticated",
        updated_at: new Date().toISOString(),
      };

      localStorage.setItem("cf_active_user_session", JSON.stringify(activeProfile));
      localStorage.removeItem("cf_demo_session");

      setUser(activeUser);
      setProfile(activeProfile);
      setIsDemoMode(false);

      return { error: null };
    } catch (e: any) {
      return { error: new Error(e?.message || "Failed to create account.") };
    }
  };

  const signOut = async () => {
    localStorage.removeItem("cf_demo_session");
    localStorage.removeItem("cf_active_user_session");
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
    if (hasSupabaseUrl) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        return { error };
      } catch (err: any) {
        return { error: err };
      }
    }

    return { error: null };
  };

  const signInDemo = () => {
    localStorage.setItem("cf_demo_session", "true");
    localStorage.removeItem("cf_active_user_session");
    setUser(DEMO_USER);
    setProfile(DEMO_PROFILE);
    setIsDemoMode(true);
    setIsLoading(false);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (profile) {
      const updatedProfile = { ...profile, ...updates, updated_at: new Date().toISOString() };
      setProfile(updatedProfile);

      const savedActive = localStorage.getItem("cf_active_user_session");
      if (savedActive) {
        localStorage.setItem("cf_active_user_session", JSON.stringify(updatedProfile));
      }

      if (hasSupabaseUrl && user) {
        await supabase.from("profiles").update(updates).eq("id", user.id);
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
        signIn,
        signUp,
        signOut,
        resetPassword,
        signInDemo,
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
