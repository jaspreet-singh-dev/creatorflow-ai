"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useAuth } from "@/context/auth-context";
import { useData } from "@/context/data-context";
import { useTheme, Theme } from "@/context/theme-context";
import { useToast } from "@/components/ui/toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Key,
  ShieldCheck,
  User,
  Mail,
  Youtube,
  Sparkles,
  Database,
  CheckCircle2,
  AlertCircle,
  Save,
  Check,
  RotateCcw,
  Eye,
  EyeOff,
  ExternalLink,
  RefreshCw,
  Sun,
  Moon,
  Monitor,
  Palette,
  Trash2,
  Lock,
  Unlock,
  ShieldAlert,
} from "lucide-react";

export default function SettingsPage() {
  const { profile, user, updateProfile, deleteAccount, isAdminUnlocked, unlockAdmin, lockAdmin } = useAuth();
  const { resetToDemoDefaults } = useData();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [passkeyInput, setPasskeyInput] = useState("");
  const [isVerifyingPasskey, setIsVerifyingPasskey] = useState(false);
  const [passkeyError, setPasskeyError] = useState("");

  const [fullName, setFullName] = useState(profile?.full_name || "Alex Rivera");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Live API Keys form state
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [supabaseAnonKey, setSupabaseAnonKey] = useState("");
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [googleClientId, setGoogleClientId] = useState("");
  const [googleClientSecret, setGoogleClientSecret] = useState("");
  const [isSavingKeys, setIsSavingKeys] = useState(false);
  const [keyStatus, setKeyStatus] = useState<any>(null);
  const [showSecrets, setShowSecrets] = useState(false);

  // Fetch current backend key status
  const fetchKeyStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/settings/keys", {
        headers: {
          Authorization: `Bearer ${user?.id || "demo-session"}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setKeyStatus(data);
        if (data.supabase?.url) setSupabaseUrl(data.supabase.url);
        if (data.googleOAuth?.clientId) setGoogleClientId(data.googleOAuth.clientId);
      }
    } catch (e) {
      console.warn("Could not fetch key status:", e);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchKeyStatus();
  }, [fetchKeyStatus]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      full_name: fullName,
      avatar_url: avatarUrl,
    });
    setSaveSuccess(true);
    toast.success("Profile Updated", `Saved display name "${fullName}".`);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleSaveKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingKeys(true);

    try {
      const res = await fetch("/api/settings/keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.id || "demo-session"}`,
        },
        body: JSON.stringify({
          supabaseUrl,
          supabaseAnonKey,
          geminiApiKey,
          googleClientId,
          googleClientSecret,
        }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Live Credentials Saved", "Keys saved to .env.local and loaded into app runtime.");
        await fetchKeyStatus();
      } else {
        toast.error("Failed to Save Keys", data.error || "Could not write configuration.");
      }
    } catch (err: any) {
      toast.error("Error", err?.message || "Failed to contact settings endpoint.");
    } finally {
      setIsSavingKeys(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Account & Live API Settings
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Configure your user profile, connect live Supabase Auth, Google OAuth 2.0, and Gemini AI credentials.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={resetToDemoDefaults}
            className="text-xs border-navy-700 bg-navy-900/60 text-slate-300 hover:text-white"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
            Reset Demo Workspace Data
          </Button>
        </div>

        {saveSuccess && (
          <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>Profile information updated successfully.</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: User Profile & Security (5 Cols) */}
          <div className="lg:col-span-5 space-y-5">
            <Card className="border-navy-800 bg-navy-900/90 shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-brand-purple" />
                  Creator Profile
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Update your display name and creator avatar.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Email Address</label>
                    <Input
                      type="email"
                      value={user?.email || "creator@creatorflow.ai"}
                      disabled
                      className="text-xs bg-navy-950/40 text-slate-400 cursor-not-allowed"
                    />
                    <p className="text-[10px] text-slate-500">
                      Active user account email.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Creator / Studio Name</label>
                    <Input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Alex Rivera"
                      className="text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Avatar Image URL</label>
                    <Input
                      type="url"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                      className="text-xs"
                    />
                  </div>

                  <Button type="submit" variant="gradient" size="sm" className="text-xs font-semibold">
                    <Save className="w-3.5 h-3.5 mr-1.5" />
                    Save Profile
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Interactive Theme & Appearance Mode */}
            <Card className="border-navy-800 bg-navy-900/90 shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <Palette className="w-4 h-4 text-brand-purple" />
                  Appearance & Interactive Themes
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                  Choose between crisp Light, true AMOLED Black, or automatically match your device theme.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 gap-2.5">
                  {/* Theme Option: Light */}
                  <button
                    type="button"
                    onClick={() => {
                      setTheme("light");
                      toast.success("Theme Applied", "Activated Light workspace.");
                    }}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                      theme === "light"
                        ? "border-amber-500 bg-amber-500/15 shadow-glow"
                        : "border-navy-800 bg-navy-950/60 hover:border-navy-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
                        <Sun className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>Light</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 font-mono">Daylight</span>
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Crisp slate & bright workspace with maximum daytime contrast.
                        </p>
                      </div>
                    </div>
                    {theme === "light" && (
                      <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-white shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>

                  {/* Theme Option: Dark (AMOLED) */}
                  <button
                    type="button"
                    onClick={() => {
                      setTheme("dark");
                      toast.success("Theme Applied", "Activated Dark (AMOLED) mode.");
                    }}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                      theme === "dark"
                        ? "border-brand-purple bg-brand-purple/15 shadow-glow"
                        : "border-navy-800 bg-navy-950/60 hover:border-navy-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-black border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
                        <Moon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>Dark (AMOLED)</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-600 dark:text-purple-300 font-mono">#000000</span>
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Pure pitch-black OLED battery saver with infinite contrast.
                        </p>
                      </div>
                    </div>
                    {theme === "dark" && (
                      <div className="w-5 h-5 rounded-full bg-brand-purple flex items-center justify-center text-white shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>

                  {/* Theme Option: System Device Based */}
                  <button
                    type="button"
                    onClick={() => {
                      setTheme("system");
                      toast.success("Theme Applied", "Matching device operating system theme.");
                    }}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                      theme === "system"
                        ? "border-blue-500 bg-blue-500/15 shadow-glow"
                        : "border-navy-800 bg-navy-950/60 hover:border-navy-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                        <Monitor className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>Device Theme (System)</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-600 dark:text-blue-300 font-mono">Auto</span>
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Automatically synchronizes with your device&apos;s OS light/dark mode.
                        </p>
                      </div>
                    </div>
                    {theme === "system" && (
                      <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Security Architecture */}
            <Card className="border-navy-800 bg-navy-900/90 shadow-card p-5 space-y-3">
              <div className="flex items-center gap-2 text-white font-semibold text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Security & Row Level Security</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                All video drafts, channel tokens, and metadata records are isolated by user ID. When connecting Google OAuth or Supabase, secrets remain securely on the Next.js server side.
              </p>
            </Card>
          </div>

          {/* Right Column: Master Admin Passkey & Live API Credentials (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* MASTER ADMIN ZERO-TRUST SECURITY CARD */}
            <Card className={`border shadow-card ${isAdminUnlocked ? "border-amber-500/50 bg-amber-500/10" : "border-navy-800 bg-navy-900/90"}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base text-white flex items-center gap-2">
                    {isAdminUnlocked ? (
                      <Unlock className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Lock className="w-4 h-4 text-slate-400" />
                    )}
                    Master Admin Passkey Security
                  </CardTitle>
                  <Badge variant={isAdminUnlocked ? "warning" : "secondary"} className="text-[10px] font-bold uppercase">
                    {isAdminUnlocked ? "MASTER ADMIN UNLOCKED" : "LOCKED (STANDARD MODE)"}
                  </Badge>
                </div>
                <CardDescription className="text-xs text-slate-400">
                  Zero-trust security: Even if your email or Google session is compromised, paid tiers, bypass quotas, and master admin controls remain locked without your private passkey.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {isAdminUnlocked ? (
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-emerald-200">Full Owner & Master Admin Privileges Active</p>
                        <p className="text-[11px] text-emerald-300/80 mt-0.5">
                          All subscription tiers (Pro & Enterprise) are unlocked for free, AI generation quotas are unlimited, and administrative overrides are enabled.
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        await lockAdmin();
                        toast.success("Admin Session Locked", "Master admin privileges have been revoked.");
                      }}
                      className="text-xs border-amber-500/40 text-amber-400 hover:bg-amber-500/10"
                    >
                      <Lock className="w-3.5 h-3.5 mr-1.5" />
                      Lock Admin Session
                    </Button>
                  </div>
                ) : (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!passkeyInput.trim()) return;
                      setIsVerifyingPasskey(true);
                      setPasskeyError("");
                      const res = await unlockAdmin(passkeyInput);
                      setIsVerifyingPasskey(false);
                      if (res.success) {
                        toast.success("Admin Unlocked", "Master Admin privileges and lifetime Pro access activated.");
                        setPasskeyInput("");
                      } else {
                        setPasskeyError(res.error || "Invalid passkey. Access denied.");
                        toast.error("Access Denied", res.error || "Incorrect Master Admin Passkey.");
                      }
                    }}
                    className="space-y-3"
                  >
                    <p className="text-xs text-slate-300">
                      Enter your secret Master Admin Passkey to verify identity and unlock free lifetime Pro tier and unlimited quotas:
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        type="password"
                        placeholder="Enter Master Admin Passkey..."
                        value={passkeyInput}
                        onChange={(e) => {
                          setPasskeyInput(e.target.value);
                          if (passkeyError) setPasskeyError("");
                        }}
                        className="text-xs font-mono"
                      />
                      <Button
                        type="submit"
                        size="sm"
                        variant="gradient"
                        isLoading={isVerifyingPasskey}
                        className="text-xs shrink-0 font-semibold"
                      >
                        <Unlock className="w-3.5 h-3.5 mr-1.5" />
                        Unlock Admin
                      </Button>
                    </div>
                    {passkeyError && (
                      <p className="text-xs text-red-400 flex items-center gap-1.5 font-medium">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {passkeyError}
                      </p>
                    )}
                  </form>
                )}
              </CardContent>
            </Card>

            <Card className="border-navy-800 bg-navy-900/90 shadow-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base text-white flex items-center gap-2">
                    <Key className="w-4 h-4 text-brand-blue" />
                    Live Credentials & External APIs
                  </CardTitle>
                  <button
                    type="button"
                    onClick={() => setShowSecrets(!showSecrets)}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    {showSecrets ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showSecrets ? "Hide Secrets" : "Reveal Secrets"}</span>
                  </button>
                </div>
                <CardDescription className="text-xs text-slate-400">
                  Save your production API keys directly to <code className="text-slate-300">.env.local</code>. Changes take effect immediately.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSaveKeys} className="space-y-5">
                  {/* Section 1: Google Cloud OAuth 2.0 (YouTube Data API v3) */}
                  <div className="space-y-3 p-4 rounded-xl border border-navy-800 bg-navy-950/70">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Youtube className="w-4 h-4 text-red-500" />
                        <h4 className="text-xs font-bold text-white">Google Cloud & YouTube OAuth 2.0</h4>
                      </div>
                      <Badge
                        variant={keyStatus?.googleOAuth?.configured ? "success" : "secondary"}
                        className="text-[10px]"
                      >
                        {keyStatus?.googleOAuth?.configured ? "Configured" : "Missing Keys"}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Required for live Google OAuth consent & official video upload and scheduling.
                    </p>

                    <div className="space-y-2">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-300">Google Client ID</label>
                        <Input
                          type="text"
                          value={googleClientId}
                          onChange={(e) => setGoogleClientId(e.target.value)}
                          placeholder="e.g. 123456789-abc.apps.googleusercontent.com"
                          className="text-xs font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-300">Google Client Secret</label>
                        <Input
                          type={showSecrets ? "text" : "password"}
                          value={googleClientSecret}
                          onChange={(e) => setGoogleClientSecret(e.target.value)}
                          placeholder={keyStatus?.googleOAuth?.secretMasked || "GOCSPX-..."}
                          className="text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Supabase PostgreSQL & Auth */}
                  <div className="space-y-3 p-4 rounded-xl border border-navy-800 bg-navy-950/70">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-emerald-400" />
                        <h4 className="text-xs font-bold text-white">Supabase Authentication & Database</h4>
                      </div>
                      <Badge
                        variant={keyStatus?.supabase?.configured ? "success" : "secondary"}
                        className="text-[10px]"
                      >
                        {keyStatus?.supabase?.configured ? "Connected" : "Local Engine Active"}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Connect your Supabase project for multi-user cloud auth and PostgreSQL RLS storage.
                    </p>

                    <div className="space-y-2">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-300">Project URL</label>
                        <Input
                          type="text"
                          value={supabaseUrl}
                          onChange={(e) => setSupabaseUrl(e.target.value)}
                          placeholder="https://your-project.supabase.co"
                          className="text-xs font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-300">Anon Public Key</label>
                        <Input
                          type={showSecrets ? "text" : "password"}
                          value={supabaseAnonKey}
                          onChange={(e) => setSupabaseAnonKey(e.target.value)}
                          placeholder={keyStatus?.supabase?.keyMasked || "eyJhbGciOi..."}
                          className="text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Gemini AI API Key */}
                  <div className="space-y-3 p-4 rounded-xl border border-navy-800 bg-navy-950/70">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-brand-purple" />
                        <h4 className="text-xs font-bold text-white">Google Gemini AI Engine</h4>
                      </div>
                      <Badge
                        variant={keyStatus?.gemini?.configured ? "success" : "secondary"}
                        className="text-[10px]"
                      >
                        {keyStatus?.gemini?.configured ? "Live Gemini Active" : "Heuristic Ready"}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-300">Gemini API Key</label>
                      <Input
                        type={showSecrets ? "text" : "password"}
                        value={geminiApiKey}
                        onChange={(e) => setGeminiApiKey(e.target.value)}
                        placeholder={keyStatus?.gemini?.keyMasked || "AIzaSy..."}
                        className="text-xs font-mono"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="gradient"
                    isLoading={isSavingKeys}
                    className="w-full text-xs font-bold shadow-glow h-10"
                  >
                    <Save className="w-3.5 h-3.5 mr-1.5" />
                    Save & Apply Live Keys
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Account Privacy & Data Erasure (DPDP Act Compliance) */}
            <Card className="border-red-500/30 bg-red-500/5 shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-red-400 flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Account Deletion & Data Erasure
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Permanently delete your account, connected channel credentials, and video projects.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Under the Indian DPDP Act 2023 and Google API Services policy, you have the right to permanent data erasure. Deleting your account will immediately revoke OAuth access tokens and wipe all channel records from our database.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  isLoading={isDeletingAccount}
                  onClick={async () => {
                    const confirmed = window.confirm(
                      "Are you absolutely sure you want to delete your account? This action cannot be undone and permanently deletes all your channels, projects, and metadata."
                    );
                    if (!confirmed) return;
                    setIsDeletingAccount(true);
                    try {
                      const res = await deleteAccount();
                      if (res.error) {
                        toast.error("Deletion Notice", res.error.message);
                      } else {
                        toast.success("Account Deleted", "Your account and data have been permanently wiped.");
                        window.location.href = "/";
                      }
                    } catch {
                      toast.error("Error", "Failed to complete account deletion.");
                    } finally {
                      setIsDeletingAccount(false);
                    }
                  }}
                  className="text-xs border-red-500/40 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  Permanently Delete My Account
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Public Trust Links */}
        <div className="border-t border-navy-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 CreatorFlow AI. All rights reserved.</p>
          <div className="flex items-center gap-4 flex-wrap justify-center text-[11px]">
            <Link href="/pricing" className="hover:text-slate-300 transition-colors">Pricing</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link href="/refund" className="hover:text-slate-300 transition-colors">Refund & Cancellation</Link>
            <span>•</span>
            <Link href="/security" className="hover:text-slate-300 transition-colors">Security Architecture</Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-slate-300 transition-colors">Support & Grievances</Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
