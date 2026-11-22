import React from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  Lock,
  Key,
  Database,
  CheckCircle2,
  Server,
  FileCheck,
  AlertTriangle,
  Mail,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col selection:bg-brand-purple/30 selection:text-white">
      {/* Header */}
      <header className="border-b border-navy-800 bg-navy-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-purple to-brand-blue flex items-center justify-center text-white shadow-glow">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-base tracking-tight text-white">
              CreatorFlow <span className="text-brand-purple">AI</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-xs text-slate-400 hover:text-white">
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                Home
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="sm" className="text-xs border-navy-700 hidden sm:inline-flex">
                Pricing
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-12 lg:py-16 space-y-16 w-full">
        <div className="space-y-4 max-w-3xl">
          <Badge variant="default" className="text-xs px-3 py-1 font-semibold uppercase tracking-wider">
            Verified Security Architecture
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Security, Data Isolation & Privacy Controls
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            At CreatorFlow AI, security is not an afterthought or marketing claim. We design our systems so that each creator&apos;s data is strictly isolated, sensitive credentials remain server-side, and payments are cryptographically authenticated.
          </p>
        </div>

        {/* Security Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pillar 1: Database Isolation */}
          <div className="p-6 rounded-2xl border border-navy-800 bg-navy-900/60 space-y-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-purple/15 text-brand-purple flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-white">PostgreSQL Row Level Security (RLS)</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Every database table storing creator assets—including <code className="text-slate-300 bg-navy-950 px-1 rounded">connected_channels</code>, <code className="text-slate-300 bg-navy-950 px-1 rounded">video_projects</code>, <code className="text-slate-300 bg-navy-950 px-1 rounded">video_metadata</code>, and <code className="text-slate-300 bg-navy-950 px-1 rounded">subscriptions</code>—is protected by PostgreSQL Row Level Security.
            </p>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-5">
              <li>Users can only query, read, or modify records tied to their authenticated <code className="bg-navy-950 px-1 rounded">auth.uid()</code>.</li>
              <li>Cross-account data leakage is blocked at the database engine level.</li>
              <li>Privileged fields (<code className="bg-navy-950 px-1 rounded">role</code>, <code className="bg-navy-950 px-1 rounded">is_owner</code>, <code className="bg-navy-950 px-1 rounded">plan_tier</code>) are protected against client escalation by database triggers.</li>
            </ul>
          </div>

          {/* Pillar 2: OAuth Token Storage */}
          <div className="p-6 rounded-2xl border border-navy-800 bg-navy-900/60 space-y-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-blue/15 text-brand-blue flex items-center justify-center">
                <Key className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-white">Google OAuth Token Protection</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              When you link your YouTube channel, your Google OAuth refresh and access tokens are handled with strict server-side encapsulation.
            </p>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-5">
              <li>Tokens are never exposed in frontend browser responses or JavaScript bundles.</li>
              <li>OAuth state tokens are signed with HMAC-SHA256, short-lived (10 minutes), and single-use to prevent CSRF hijacking.</li>
              <li>API requests to Google YouTube endpoints are dispatched exclusively by server-side workers over TLS 1.3.</li>
              <li>You can revoke access instantly from Google Security Settings at any time.</li>
            </ul>
          </div>

          {/* Pillar 3: Payment Gateway Security */}
          <div className="p-6 rounded-2xl border border-navy-800 bg-navy-900/60 space-y-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-white">Cryptographic Payment Verification</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              CreatorFlow AI processes all payments through PCI-DSS Level 1 compliant infrastructure operated by Razorpay.
            </p>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-5">
              <li>Plan prices and orders are calculated strictly on the server—clients cannot alter amounts or self-grant subscriptions.</li>
              <li>Checkout completions and incoming webhook notifications require HMAC-SHA256 signature verification using <code className="bg-navy-950 px-1 rounded">crypto.timingSafeEqual</code>.</li>
              <li>Webhook handlers enforce idempotency to prevent duplicate charges or duplicate entitlements.</li>
              <li>CreatorFlow servers <strong>never</strong> touch or store raw credit card numbers, CVVs, or UPI PINs.</li>
            </ul>
          </div>

          {/* Pillar 4: Session Security & Deletion */}
          <div className="p-6 rounded-2xl border border-navy-800 bg-navy-900/60 space-y-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <Server className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-white">Account Deletion & Data Purging</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              We respect your right to be forgotten. In compliance with data protection principles and the Indian DPDP Act:
            </p>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-5">
              <li>You can request permanent account deletion directly from your settings or via support.</li>
              <li>Deletion cascades through PostgreSQL, permanently wiping your profile, connected channels, video drafts, metadata records, and stored OAuth credentials.</li>
              <li>We do not retain dark copies of your creative metadata after account closure.</li>
            </ul>
          </div>
        </div>

        {/* Responsible Disclosure Section */}
        <section className="p-6 sm:p-8 rounded-2xl border border-navy-800 bg-navy-900/80 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Responsible Vulnerability Disclosure Program</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            If you believe you have discovered a security vulnerability in CreatorFlow AI, we welcome your responsible disclosure. Please notify our engineering team immediately at{" "}
            <a href="mailto:security@creatorflow.ai" className="text-brand-purple underline font-mono">
              security@creatorflow.ai
            </a>
            .
          </p>
          <div className="text-xs text-slate-400 space-y-1.5 pl-4 border-l-2 border-brand-purple">
            <p>• Please provide detailed steps to reproduce the vulnerability.</p>
            <p>• Do not access or alter any user data other than your own test account.</p>
            <p>• We pledge to acknowledge your submission within 24 hours and keep you informed of remediation progress.</p>
          </div>
        </section>

        {/* Honest Disclosures */}
        <section className="text-xs text-slate-500 space-y-2 border-t border-navy-800 pt-6">
          <p className="font-semibold text-slate-400">Security Standards Statement:</p>
          <p>
            CreatorFlow AI relies on industry-standard cryptographic primitives, Supabase/AWS infrastructure, and Razorpay PCI-DSS certified payment rails. We do not claim third-party certifications (e.g. SOC 2 Type II or ISO 27001) that have not been formally audited by an accredited independent assessor.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-navy-800 py-10 px-6 bg-navy-950 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 CreatorFlow AI. All rights reserved.</p>
          <div className="flex items-center gap-4 flex-wrap">
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/refund" className="hover:text-white transition-colors">Refund & Cancellation</Link>
            <Link href="/security" className="hover:text-white transition-colors">Security</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
