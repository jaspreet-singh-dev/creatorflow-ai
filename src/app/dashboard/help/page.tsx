"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  Youtube,
  Key,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  MessageCircle,
  Terminal,
  Zap,
} from "lucide-react";
import Link from "next/link";

const FAQS = [
  {
    q: "How do I fix Google OAuth 'Error 403: access_denied'?",
    a: "When your Google Cloud OAuth Consent Screen is in 'Testing' mode with sensitive scopes (like YouTube upload or analytics), Google strictly permits only accounts listed under 'Test users'. Go to Google Cloud Console > APIs & Services > OAuth consent screen > Test users, click '+ ADD USERS', and add your Google account email.",
  },
  {
    q: "Why do YouTube Analytics reports have a 24-48h delay?",
    a: "Official YouTube Analytics API reports carry a standard 24–48 hour processing window from Google's analytics pipeline. Lifetime channel stats (total views, total subscribers) from the YouTube Data API v3 update immediately, while date-ranged analytics reflect Google's verified historical data window.",
  },
  {
    q: "How does the Resumable Video Uploader work?",
    a: "CreatorFlow uses chunked resumable uploads adhering to YouTube API v3 protocols. Files are uploaded in 1MB increments. If network interruption occurs, the uploader checks the exact byte offset with YouTube's servers and resumes seamlessly without restarting.",
  },
  {
    q: "Can I connect multiple YouTube channels to one account?",
    a: "Yes! CreatorFlow supports multi-channel workspaces. Free Starter supports 1 channel, Creator Pro supports up to 3 channels, and Agency Studio supports up to 25 channels. Use the Channel Switcher in the top header to toggle between channels instantly.",
  },
  {
    q: "Are my OAuth tokens or refresh tokens exposed to the browser?",
    a: "No. CreatorFlow stores access and refresh tokens strictly server-side in Supabase with PostgREST Row Level Security (RLS). Frontend queries select only safe public channel fields (title, thumbnail, subscriber count, handle).",
  },
];

export default function HelpAndSupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Help & Knowledge Hub
              </h1>
              <Badge variant="blue" className="text-[10px] font-bold uppercase tracking-wider">
                Support & Guides
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Documentation, Google OAuth configuration guides, API troubleshooting, and support resources.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/dashboard/channels">
              <Button variant="outline" size="sm" className="text-xs border-navy-700 bg-navy-900/60">
                <Youtube className="w-3.5 h-3.5 mr-1.5 text-red-500" />
                Channel Manager
              </Button>
            </Link>
            <Link href="/dashboard/settings">
              <Button variant="gradient" size="sm" className="text-xs font-semibold shadow-glow">
                <Key className="w-3.5 h-3.5 mr-1.5" />
                Settings & API Keys
              </Button>
            </Link>
          </div>
        </div>

        {/* Quickstart 3-Column Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Card className="border-navy-800 bg-navy-900/80 p-5 space-y-3 shadow-card">
            <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20">
              <Youtube className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Google Cloud Console Setup</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Step-by-step instructions to register your OAuth Client ID, set up the callback redirect URI, and configure Test Users.
            </p>
            <a
              href="https://console.cloud.google.com/apis/credentials"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-brand-purple font-semibold hover:underline"
            >
              Open Google Cloud Console <ExternalLink className="w-3 h-3" />
            </a>
          </Card>

          <Card className="border-navy-800 bg-navy-900/80 p-5 space-y-3 shadow-card">
            <div className="w-9 h-9 rounded-xl bg-brand-purple/10 text-brand-purple flex items-center justify-center border border-brand-purple/20">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Gemini AI Studio Keys</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              CreatorFlow includes a high-performance built-in sandbox engine. Add your Google AI Studio API key in Settings for custom generative AI.
            </p>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-brand-purple font-semibold hover:underline"
            >
              Get Gemini API Key <ExternalLink className="w-3 h-3" />
            </a>
          </Card>

          <Card className="border-navy-800 bg-navy-900/80 p-5 space-y-3 shadow-card">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Security & Token Isolation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              OAuth tokens are stored strictly server-side. Multi-tenant Supabase Row Level Security ensures account data isolation.
            </p>
            <Link
              href="/privacy"
              className="inline-flex items-center gap-1 text-xs text-brand-purple font-semibold hover:underline"
            >
              Read Privacy Policy <ExternalLink className="w-3 h-3" />
            </Link>
          </Card>
        </div>

        {/* Step-by-Step Google OAuth Guide */}
        <Card className="border-navy-800 bg-navy-900/90 p-6 space-y-5 shadow-card">
          <div className="border-b border-navy-800 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-brand-purple" />
                Google OAuth 2.0 Step-by-Step Configuration Guide
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Ensure error-free channel connection by configuring your Google Cloud credentials properly.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl border border-navy-800 bg-navy-950/70 space-y-1.5">
                <div className="flex items-center gap-2 text-white font-bold">
                  <span className="w-5 h-5 rounded-full bg-brand-purple/20 text-brand-purple flex items-center justify-center text-[11px]">1</span>
                  Create OAuth Credentials
                </div>
                <p className="text-slate-400 leading-relaxed pl-7">
                  In Google Cloud Console, select your project, go to <strong>APIs & Services &gt; Credentials</strong>, click <strong>Create Credentials &gt; OAuth client ID</strong>, and select <strong>Web application</strong>.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-navy-800 bg-navy-950/70 space-y-1.5">
                <div className="flex items-center gap-2 text-white font-bold">
                  <span className="w-5 h-5 rounded-full bg-brand-purple/20 text-brand-purple flex items-center justify-center text-[11px]">2</span>
                  Add Authorized Redirect URI
                </div>
                <p className="text-slate-400 leading-relaxed pl-7">
                  Add <code className="text-purple-300">http://localhost:3000/api/youtube/callback</code> (for local dev) and your production URL callback under <strong>Authorized redirect URIs</strong>.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl border border-navy-800 bg-navy-950/70 space-y-1.5">
                <div className="flex items-center gap-2 text-white font-bold">
                  <span className="w-5 h-5 rounded-full bg-brand-purple/20 text-brand-purple flex items-center justify-center text-[11px]">3</span>
                  Add Test Users (Crucial for 403 Access Denied)
                </div>
                <p className="text-slate-400 leading-relaxed pl-7">
                  Go to <strong>OAuth consent screen &gt; Test users</strong>, click <strong>+ ADD USERS</strong>, and add your Google email address. In Testing mode, Google blocks any unlisted account with Error 403.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-navy-800 bg-navy-950/70 space-y-1.5">
                <div className="flex items-center gap-2 text-white font-bold">
                  <span className="w-5 h-5 rounded-full bg-brand-purple/20 text-brand-purple flex items-center justify-center text-[11px]">4</span>
                  Enable YouTube APIs
                </div>
                <p className="text-slate-400 leading-relaxed pl-7">
                  In <strong>APIs & Services &gt; Enabled APIs & Services</strong>, click <strong>+ ENABLE APIS AND SERVICES</strong>, search for and enable <strong>YouTube Data API v3</strong> and <strong>YouTube Analytics API</strong>.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Interactive FAQ Accordion */}
        <Card className="border-navy-800 bg-navy-900/90 p-6 space-y-5 shadow-card">
          <div className="border-b border-navy-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Instant answers to common creator questions and setup troubleshooting.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-navy-800 bg-navy-950/60 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-4 text-left text-xs font-semibold text-white hover:bg-navy-900/60 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <span className="text-slate-400 font-mono text-sm ml-2">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="p-4 pt-0 text-xs text-slate-400 leading-relaxed border-t border-navy-800/60 bg-navy-950/90 animate-in fade-in-50 duration-150">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
