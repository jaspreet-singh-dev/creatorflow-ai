import React from "react";
import Link from "next/link";
import { Sparkles, ArrowLeft, RefreshCw, CheckCircle, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RefundPolicyPage() {
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-blue/15 text-brand-blue text-xs font-semibold">
            <RefreshCw className="w-3.5 h-3.5" />
            Billing & Cancellations
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Refund & Cancellation Policy</h1>
          <p className="text-xs text-slate-400">
            Effective Date: November 21, 2026 • Last updated: November 21, 2026
          </p>
        </div>

        <section className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <h2 className="text-lg font-bold text-white">1. 7-Day Money-Back Guarantee</h2>
          <p>
            We want you to be completely satisfied with CreatorFlow AI. If you subscribe to a paid plan (Creator Pro or Agency Studio) and find that the platform does not meet your workflow needs, you may request a 100% full refund within <strong>7 days</strong> of your initial payment date.
          </p>

          <h2 className="text-lg font-bold text-white pt-4">2. Subscription Cancellation</h2>
          <p>
            You can cancel your recurring monthly or yearly subscription at any time directly from the <strong>Subscription & Usage Limits</strong> page in your dashboard. Upon cancellation:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>You will retain full access to all features and quotas of your paid plan until the conclusion of your current paid billing period.</li>
            <li>No further charges will be made to your payment method.</li>
            <li>At the end of your billing cycle, your account will smoothly transition to the Free Starter tier with no data loss of your existing projects or channels.</li>
          </ul>

          <h2 className="text-lg font-bold text-white pt-4">3. Refund Request Process</h2>
          <p>
            To request a refund within the eligible 7-day guarantee window:
          </p>
          <ol className="list-decimal pl-5 space-y-1.5">
            <li>
              Send an email to{" "}
              <a href="mailto:support@creatorflow.ai" className="text-brand-purple underline">
                support@creatorflow.ai
              </a>{" "}
              from the email address associated with your CreatorFlow AI account.
            </li>
            <li>Include your account email and invoice or order ID (e.g. INV-2026-XX or order_xxx).</li>
            <li>
              Our billing support team will review and approve eligible requests within 24–48 hours.
            </li>
          </ol>

          <h2 className="text-lg font-bold text-white pt-4">4. Refund Method and Processing Time</h2>
          <p>
            Approved refunds are credited directly back to the original Indian payment source (UPI, Debit Card, Credit Card, Netbanking) via our payment gateway partner. Depending on your issuing bank, refunded funds typically reflect in your account within <strong>5 to 7 business days</strong>.
          </p>

          <h2 className="text-lg font-bold text-white pt-4">5. Contact Support</h2>
          <p>
            If you experience any billing discrepancies or have questions regarding your invoices, please reach out to us at{" "}
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
