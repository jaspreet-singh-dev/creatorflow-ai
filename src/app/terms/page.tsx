import React from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowLeft,
  Scale,
  ShieldCheck,
  Youtube,
  CreditCard,
  FileText,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col selection:bg-brand-purple/30 selection:text-white">
      {/* Navigation Header */}
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
      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 lg:py-16 space-y-12">
        <div className="space-y-3 border-b border-navy-800 pb-8">
          <Badge variant="default" className="text-xs px-3 py-1 font-semibold uppercase tracking-wider">
            Legal Agreement
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Terms of Service
          </h1>
          <p className="text-xs text-slate-400">
            Effective Date: November 22, 2026 • Last updated: November 22, 2026
          </p>
        </div>

        <section className="space-y-8 text-xs sm:text-sm text-slate-300 leading-relaxed">
          {/* Section 1 */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-brand-purple" />
              1. Acceptance of Terms
            </h2>
            <p>
              These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement between you (&quot;User&quot;, &quot;Creator&quot;, or &quot;you&quot;) and CreatorFlow AI (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;, operated by Jaspreet Singh, Delhi/NCR, India).
            </p>
            <p>
              By signing up for an account, linking a YouTube channel, accessing our website, or using our AI studio workflows, you confirm that you are at least 18 years old (or the legal age of majority in your jurisdiction) and agree to be bound by these Terms and our{" "}
              <Link href="/privacy" className="text-brand-purple underline hover:text-brand-blue">
                Privacy Policy
              </Link>
              . If you do not agree to these Terms, you must immediately cease all access and use of the Service.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-3 border-t border-navy-800 pt-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Youtube className="w-4 h-4 text-red-500" />
              2. YouTube API Services Terms of Service
            </h2>
            <p>
              CreatorFlow AI utilizes official YouTube API Services to access channel information, publish videos, and display analytics reports. By connecting your YouTube account to CreatorFlow AI:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li>
                You agree to be bound by the{" "}
                <a
                  href="https://www.youtube.com/t/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-purple underline inline-flex items-center gap-0.5"
                >
                  YouTube Terms of Service
                  <ExternalLink className="w-3 h-3" />
                </a>
                .
              </li>
              <li>
                You acknowledge that your data is processed in accordance with the{" "}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-purple underline inline-flex items-center gap-0.5"
                >
                  Google Privacy Policy
                  <ExternalLink className="w-3 h-3" />
                </a>
                .
              </li>
              <li>
                You can revoke CreatorFlow AI&apos;s access to your Google/YouTube account data at any time via the{" "}
                <a
                  href="https://myaccount.google.com/permissions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-purple underline inline-flex items-center gap-0.5"
                >
                  Google Security Settings permissions page
                  <ExternalLink className="w-3 h-3" />
                </a>
                .
              </li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="space-y-3 border-t border-navy-800 pt-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              3. User Accounts, Authentication & Security
            </h2>
            <p>
              To access the Service, you must create a verified account using Supabase Authentication. You agree to provide accurate, current, and complete registration information. You are solely responsible for:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li>Maintaining the confidentiality of your login credentials and session tokens.</li>
              <li>All activities occurring under your account, whether authorized by you or not.</li>
              <li>Promptly notifying us at <a href="mailto:security@creatorflow.ai" className="text-brand-purple underline font-mono">security@creatorflow.ai</a> upon discovering any unauthorized access or breach of security.</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="space-y-3 border-t border-navy-800 pt-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-brand-blue" />
              4. Subscriptions, Billing, Upgrades & Cancellations
            </h2>
            <p>
              CreatorFlow AI offers a Free Starter tier and paid subscription tiers (Creator Pro at ₹999/month and Agency Studio at ₹2,499/month, or discounted annual options).
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-400">
              <li>
                <strong className="text-slate-200">Currency & Taxes:</strong> All subscription fees are billed in Indian Rupees (INR - ₹) inclusive of applicable taxes via our payment gateway partner (Razorpay).
              </li>
              <li>
                <strong className="text-slate-200">Automatic Renewal:</strong> Paid subscriptions automatically renew on a recurring monthly or annual basis unless cancelled prior to the renewal date.
              </li>
              <li>
                <strong className="text-slate-200">Upgrades & Downgrades:</strong> Upgrading your plan takes effect immediately and refreshes your quota limits. Downgrades take effect at the conclusion of your current billing period.
              </li>
              <li>
                <strong className="text-slate-200">Cancellation:</strong> You may cancel your subscription at any time from your dashboard under <strong className="text-slate-200">Subscription & Usage Limits</strong>. Upon cancellation, your paid access remains active through the end of the paid billing cycle without additional charges.
              </li>
              <li>
                <strong className="text-slate-200">Refunds:</strong> Refund requests are governed by our{" "}
                <Link href="/refund" className="text-brand-purple underline">
                  Refund & Cancellation Policy
                </Link>
                . Digital quota allocations are delivered immediately upon successful payment.
              </li>
            </ul>
          </div>

          {/* Section 5 */}
          <div className="space-y-3 border-t border-navy-800 pt-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              5. AI-Generated Content & Platform Limitations
            </h2>
            <p>
              CreatorFlow AI provides automated title suggestions, metadata outlines, description text, hooks, and thumbnail concepts using artificial intelligence models.
            </p>
            <div className="p-4 rounded-xl border border-navy-800 bg-navy-900/60 space-y-2 text-slate-400">
              <p className="font-semibold text-slate-200">Creator Responsibility:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>You are solely responsible for reviewing, editing, and verifying all AI-generated content before publishing to YouTube.</li>
                <li>You must ensure your content adheres to the YouTube Community Guidelines, copyright laws, and intellectual property statutes.</li>
                <li>CreatorFlow AI makes <strong className="text-slate-200">no warranty or guarantee</strong> regarding algorithmic reach, views, search ranking, or monetization eligibility on third-party platforms.</li>
              </ul>
            </div>
          </div>

          {/* Section 6 */}
          <div className="space-y-3 border-t border-navy-800 pt-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              6. Intellectual Property & User Ownership
            </h2>
            <p>
              <strong className="text-white">Your Content:</strong> You retain 100% full and unencumbered ownership of all video assets, audio files, custom thumbnails, scripts, and creative works uploaded or created through CreatorFlow AI. We claim zero proprietary rights or copyright over your creative output.
            </p>
            <p>
              <strong className="text-white">Our Platform:</strong> The CreatorFlow AI platform, trademarks, software code, user interface, brand assets, and proprietary algorithms are the exclusive intellectual property of CreatorFlow AI and its licensors.
            </p>
          </div>

          {/* Section 7 */}
          <div className="space-y-3 border-t border-navy-800 pt-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              7. Acceptable Use & Account Suspension
            </h2>
            <p>You agree not to use the Service to:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li>Violate any local, national, or international law, regulation, or YouTube developer policy.</li>
              <li>Upload malicious code, viruses, or engage in automated scraping, denial-of-service, or API quota abuse.</li>
              <li>Distribute defamatory, fraudulent, infringing, or illegal materials.</li>
              <li>Resell, sublicense, or share your account credentials with unauthorized third parties.</li>
            </ul>
            <p>
              We reserve the right to suspend or terminate accounts that engage in willful abuse, security tampering, or violation of these Terms.
            </p>
          </div>

          {/* Section 8 */}
          <div className="space-y-3 border-t border-navy-800 pt-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-brand-purple" />
              8. Limitation of Liability & Governing Law
            </h2>
            <p>
              To the maximum extent permitted by applicable law, CreatorFlow AI and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, YouTube platform strikes, or channel suspensions arising from your use of the Service.
            </p>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the Republic of India. Any disputes arising out of or relating to these Terms shall be subject to the exclusive jurisdiction of the competent courts in New Delhi, India.
            </p>
          </div>

          {/* Section 9 */}
          <div className="space-y-3 border-t border-navy-800 pt-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" />
              9. Contact & Legal Notices
            </h2>
            <p>
              For legal notices, questions, or dispute resolution regarding these Terms, please contact:
            </p>
            <div className="p-4 rounded-xl border border-navy-800 bg-navy-900/80 text-xs space-y-1">
              <p><strong className="text-white">CreatorFlow AI Legal Support</strong></p>
              <p><span className="text-slate-400">Email:</span> <a href="mailto:support@creatorflow.ai" className="text-brand-purple underline font-mono">support@creatorflow.ai</a></p>
              <p><span className="text-slate-400">Operating Entity:</span> Jaspreet Singh (Sole Proprietorship / CreatorFlow AI), Delhi/NCR, India</p>
            </div>
          </div>
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
