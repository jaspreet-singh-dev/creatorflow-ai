"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useAuth } from "@/context/auth-context";
import { useData } from "@/context/data-context";
import { useToast } from "@/components/ui/toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "lucide-react";

export default function SettingsPage() {
  const { profile, user, isDemoMode } = useAuth();
  const { resetToDemoDefaults } = useData();
  const { toast } = useToast();

  const [fullName, setFullName] = useState(profile?.full_name || "Alex Rivera");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    toast.success("Profile Updated", `Saved display name "${fullName}".`);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Account & API Settings
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Manage your user profile, verify connected services, and inspect backend integrations.
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
          {/* User Profile Form (6 Cols) */}
          <div className="lg:col-span-6 space-y-5">
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
                      Email is managed via your Supabase authentication record.
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

            {/* Security Best Practices */}
            <Card className="border-navy-800 bg-navy-900/90 shadow-card p-5 space-y-3">
              <div className="flex items-center gap-2 text-white font-semibold text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Security & Row Level Security</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                All video drafts, channel tokens, and metadata records in CreatorFlow AI are isolated by user ID via Supabase PostgreSQL RLS policies (<code className="text-brand-purple">auth.uid() = user_id</code>). Sensitive Google OAuth refresh tokens are encrypted and handled exclusively within server-side API routes.
              </p>
            </Card>
          </div>

          {/* Connected APIs & Integrations (6 Cols) */}
          <div className="lg:col-span-6 space-y-5">
            <Card className="border-navy-800 bg-navy-900/90 shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-brand-blue" />
                  Backend Integrations Status
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Audit external service connections configured in <code className="text-slate-300">.env.local</code>.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3.5">
                {/* Gemini AI Status */}
                <div className="p-3.5 rounded-xl border border-navy-800 bg-navy-950 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-purple/20 text-brand-purple flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Google Gemini 1.5 Flash</p>
                      <p className="text-[11px] text-slate-400">Metadata & Content Engine</p>
                    </div>
                  </div>
                  <Badge variant="success" className="text-[10px]">
                    Active / Fallback Ready
                  </Badge>
                </div>

                {/* YouTube Data API v3 */}
                <div className="p-3.5 rounded-xl border border-navy-800 bg-navy-950 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center">
                      <Youtube className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">YouTube Data & Analytics v3</p>
                      <p className="text-[11px] text-slate-400">Google OAuth 2.0 Client</p>
                    </div>
                  </div>
                  <Badge variant="blue" className="text-[10px]">
                    OAuth Configured
                  </Badge>
                </div>

                {/* Supabase PostgreSQL & Auth */}
                <div className="p-3.5 rounded-xl border border-navy-800 bg-navy-950 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Database className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Supabase PostgreSQL & RLS</p>
                      <p className="text-[11px] text-slate-400">Authentication & Storage</p>
                    </div>
                  </div>
                  <Badge variant="success" className="text-[10px]">
                    Connected
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Quick Setup Instructions */}
            <Card className="border-navy-800 bg-navy-900/90 shadow-card p-5 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Production Keys Setup Guide
              </h4>
              <div className="text-xs text-slate-400 space-y-2">
                <p>To connect live production services, copy <code className="text-white">.env.example</code> to <code className="text-white">.env.local</code> and populate:</p>
                <ul className="list-disc pl-4 space-y-1 text-slate-300">
                  <li><code className="text-brand-purple">GEMINI_API_KEY</code> from Google AI Studio</li>
                  <li><code className="text-brand-purple">GOOGLE_CLIENT_ID</code> & <code className="text-brand-purple">GOOGLE_CLIENT_SECRET</code> from Google Cloud Console</li>
                  <li><code className="text-brand-purple">NEXT_PUBLIC_SUPABASE_URL</code> & <code className="text-brand-purple">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> from Supabase</li>
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
