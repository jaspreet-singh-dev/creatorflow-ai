import React from "react";
import Link from "next/link";
import { Sparkles, ArrowLeft, ShieldCheck, Scale, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsOfServicePage() {
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-purple/15 text-brand-purple text-xs font-semibold">
            <Scale className="w-3.5 h-3.5" />
            Legal Agreement
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Terms of Service</h1>
          <p className="text-xs text-slate-400">
            Effective Date: November 21, 2026 • Last updated: November 21, 2026
          </p>
        </div>

        <section className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <h2 className="text-lg font-bold text-white">1. Agreement to Terms</h2>
          <p>
            By accessing or using CreatorFlow AI (&quot;the Service&quot;), provided by CreatorFlow AI (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you do not have permission to access the Service.
          </p>

          <h2 className="text-lg font-bold text-white pt-4">2. YouTube API Services Compliance</h2>
          <p>
            CreatorFlow AI integrates with YouTube API Services. By connecting your YouTube account to CreatorFlow AI, you agree to be bound by the{" "}
            <a
              href="https://www.youtube.com/t/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-purple underline hover:text-brand-blue"
            >
              YouTube Terms of Service
            </a>
            . You can review Google&apos;s privacy policies at{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-purple underline hover:text-brand-blue"
            >
              Google Privacy Policy
            </a>
            . You may revoke CreatorFlow AI&apos;s access to your Google account at any time via the{" "}
            <a
              href="https://myaccount.google.com/permissions"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-purple underline hover:text-brand-blue"
            >
              Google Security Settings page
            </a>
            .
          </p>

          <h2 className="text-lg font-bold text-white pt-4">3. User Accounts and Security</h2>
          <p>
            When you create an account with us, you must provide accurate and complete information. You are solely responsible for maintaining the confidentiality of your account credentials, including your password and OAuth sessions. You must immediately notify us of any unauthorized use of your account.
          </p>

          <h2 className="text-lg font-bold text-white pt-4">4. Subscriptions, Fees and INR Pricing</h2>
          <p>
            Paid tiers (Creator Pro at ₹999/month and Agency Studio at ₹2,499/month) are billed in Indian Rupees (INR) inclusive of applicable taxes. Subscriptions renew automatically on a recurring monthly or annual basis unless cancelled prior to the renewal date through your dashboard settings.
          </p>

          <h2 className="text-lg font-bold text-white pt-4">5. Content Ownership and Intellectual Property</h2>
          <p>
            You retain 100% full ownership, rights, and copyright to all video files, thumbnails, scripts, and media you upload, draft, or publish through CreatorFlow AI. We claim no intellectual property rights over your videos or creative assets.
          </p>

          <h2 className="text-lg font-bold text-white pt-4">6. AI-Generated Metadata and Strategies</h2>
          <p>
            AI metadata generation (titles, descriptions, tags, hooks) is provided as an optimization tool to enhance search discoverability and viewer relevance. Algorithmic distribution, viewer retention, and monetization outcomes remain subject to YouTube&apos;s independent platform algorithms and policies.
          </p>

          <h2 className="text-lg font-bold text-white pt-4">7. Limitation of Liability</h2>
          <p>
            In no event shall CreatorFlow AI, its directors, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, arising out of your use of the Service.
          </p>

          <h2 className="text-lg font-bold text-white pt-4">8. Contact Information</h2>
          <p>
            For questions regarding these Terms of Service, please contact us at{" "}
            <a href="mailto:support@creatorflow.ai" className="text-brand-purple underline">
              support@creatorflow.ai
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
