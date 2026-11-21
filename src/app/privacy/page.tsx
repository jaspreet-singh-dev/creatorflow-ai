import React from "react";
import Link from "next/link";
import { Sparkles, ArrowLeft, ShieldCheck, Lock, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col">
      {/* Navigation */}
      <header className="border-b border-navy-800 bg-navy-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-purple to-brand-blue flex items-center justify-center text-white shadow-glow">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-base tracking-tight text-white">CreatorFlow AI</span>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-xs text-slate-400 hover:text-white">
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 space-y-10">
        <div className="space-y-3 border-b border-navy-800 pb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            Data Protection & Privacy
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Privacy Policy</h1>
          <p className="text-xs text-slate-400">
            Effective Date: November 21, 2026 • Last updated: November 21, 2026
          </p>
        </div>

        <section className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <h2 className="text-lg font-bold text-white">1. Overview and Commitment</h2>
          <p>
            CreatorFlow AI (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is committed to protecting your privacy and personal data. This Privacy Policy explains how we collect, store, process, and protect your information when you use our website, application, and YouTube creator automation workflows.
          </p>

          <h2 className="text-lg font-bold text-white pt-4">2. Information We Collect</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong>Account Information:</strong> When you register, we collect your email address and display name via Supabase Authentication.
            </li>
            <li>
              <strong>YouTube Channel & Analytics Data:</strong> With your explicit OAuth 2.0 permission, we access your channel ID, channel title, subscriber count, video list, and official YouTube Analytics API reports to display your dashboard metrics and enable video publishing.
            </li>
            <li>
              <strong>Billing Information:</strong> Payments are processed securely via PCI-DSS compliant Indian payment gateways (such as Razorpay). We never store your full credit card or debit card numbers on our servers.
            </li>
          </ul>

          <h2 className="text-lg font-bold text-white pt-4">3. Google API Services User Data Policy Compliance</h2>
          <div className="p-4 rounded-xl border border-navy-800 bg-navy-900/80 space-y-2">
            <p className="font-semibold text-white">Limited Use Disclosure:</p>
            <p>
              CreatorFlow AI&apos;s use and transfer of information received from Google APIs to any other app will adhere to the{" "}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-purple underline hover:text-brand-blue"
              >
                Google API Services User Data Policy
              </a>
              , including the Limited Use requirements.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-300">
              <li>We only use Google OAuth access tokens to query your channel statistics, perform requested video uploads, and display official analytics reports.</li>
              <li>We <strong>NEVER</strong> sell your Google user data or YouTube data to third parties.</li>
              <li>We <strong>NEVER</strong> use or transfer your Google user data for serving advertisements, retargeting, or data broker profiling.</li>
              <li>We <strong>NEVER</strong> use your private channel data to train generalized AI/ML foundation models.</li>
            </ul>
          </div>

          <h2 className="text-lg font-bold text-white pt-4">4. Token Storage and Cryptographic Security</h2>
          <p>
            OAuth refresh tokens and access tokens are stored strictly server-side in our PostgreSQL database protected by Row Level Security (RLS). Tokens are never exposed to the client browser or included in public API payloads. All communication between our server and Google APIs takes place over encrypted TLS 1.3 channels.
          </p>

          <h2 className="text-lg font-bold text-white pt-4">5. User Data Revocation and Deletion</h2>
          <p>
            You have the absolute right to delete your data or revoke access at any time:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong>Revoke Google Access:</strong> You can revoke CreatorFlow AI&apos;s access immediately at any time via{" "}
              <a
                href="https://myaccount.google.com/permissions"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-purple underline hover:text-brand-blue"
              >
                Google Account Permissions
              </a>
              .
            </li>
            <li>
              <strong>Account & Data Deletion:</strong> You may request complete deletion of your account, projects, metadata history, and connected channel records directly from your CreatorFlow Settings page or by contacting{" "}
              <a href="mailto:privacy@creatorflow.ai" className="text-brand-purple underline">
                privacy@creatorflow.ai
              </a>
              . Upon account deletion, all database records are permanently deleted.
            </li>
          </ul>

          <h2 className="text-lg font-bold text-white pt-4">6. Contact Data Protection Officer</h2>
          <p>
            If you have questions or concerns regarding our privacy practices, you may reach our Data Protection team at{" "}
            <a href="mailto:privacy@creatorflow.ai" className="text-brand-purple underline">
              privacy@creatorflow.ai
            </a>
            .
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-navy-800 py-8 px-6 bg-navy-950 text-xs text-slate-500 text-center">
        <p>© 2026 CreatorFlow AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
