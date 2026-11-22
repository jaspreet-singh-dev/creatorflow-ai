import React from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  CreditCard,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function RefundPolicyPage() {
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
          <Badge variant="blue" className="text-xs px-3 py-1 font-semibold uppercase tracking-wider">
            Billing & Merchant Compliance
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Refund & Cancellation Policy
          </h1>
          <p className="text-xs text-slate-400">
            Effective Date: November 22, 2026 • Last updated: November 22, 2026
          </p>
        </div>

        <section className="space-y-8 text-xs sm:text-sm text-slate-300 leading-relaxed">
          {/* Section 1 */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-brand-purple" />
              1. Subscription Cancellation Procedure
            </h2>
            <p>
              You have the right to cancel your recurring monthly or annual CreatorFlow AI subscription at any time without fees, penalties, or complex hurdles.
            </p>
            <div className="p-4 rounded-xl border border-navy-800 bg-navy-900/60 space-y-2 text-slate-400">
              <p className="font-semibold text-slate-200">How to cancel your subscription:</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Log in to your CreatorFlow AI account.</li>
                <li>Navigate to <strong className="text-slate-200">Dashboard → Subscription & Usage Limits</strong>.</li>
                <li>Select the Free Starter tier or click <strong className="text-slate-200">&quot;Switch to Free&quot;</strong>.</li>
              </ol>
            </div>
            <p>
              <strong className="text-white">Retention of Paid Access:</strong> When you cancel your subscription, recurring billing ceases immediately. You will continue to have uninterrupted access to all paid features and monthly quotas (including connected channel slots and AI generations) until the conclusion of your current prepaid billing cycle. At the end of the period, your account transitions smoothly to the Free Starter tier with zero loss of your existing projects or metadata.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-3 border-t border-navy-800 pt-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-blue" />
              2. Nature of Digital SaaS Services & Immediate Delivery
            </h2>
            <p>
              CreatorFlow AI is a cloud-based software-as-a-service (SaaS) application providing immediate computational access to AI metadata generators, YouTube API integrations, and video studio tools.
            </p>
            <p>
              Upon successful payment via our gateway, monthly AI generation quotas, upload jobs, and channel connection allowances are allocated to your account instantly. Consequently, payments for consumed subscription cycles are non-refundable once digital services have been provisioned and utilized.
            </p>
          </div>

          {/* Section 3 */}
          <div className="space-y-3 border-t border-navy-800 pt-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              3. Refund Eligibility Criteria
            </h2>
            <p>
              We are committed to fair customer treatment. A full or partial refund will be approved under the following specific circumstances:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-400">
              <li>
                <strong className="text-slate-200">Duplicate or Accidental Double Charges:</strong> If a technical glitch, network timeout, or gateway retry results in your payment method being charged multiple times for a single billing period, all duplicate transactions will be refunded in full immediately.
              </li>
              <li>
                <strong className="text-slate-200">Verified Technical Service Outage:</strong> If persistent server-side downtime on CreatorFlow AI completely prevents you from accessing the platform or utilizing your purchased quotas for more than 48 continuous hours following a new charge, and you report the issue within 72 hours of payment, an unconditional full refund for that billing period will be issued.
              </li>
              <li>
                <strong className="text-slate-200">Unauthorized Transactions:</strong> If your payment method was fraudulently used without your consent, please contact your issuing bank and our support team immediately. Upon verification, the fraudulent charge will be cancelled and refunded.
              </li>
            </ul>
            <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-300 text-xs">
              <strong>Non-Refundable Scenarios:</strong> Refunds will not be granted for voluntary change of mind after significant consumption of AI generation quotas, or due to changes in YouTube&apos;s external recommendation algorithms, view fluctuations, or copyright strikes resulting from user-uploaded video files.
            </div>
          </div>

          {/* Section 4 */}
          <div className="space-y-3 border-t border-navy-800 pt-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-purple-400" />
              4. Refund Request Procedure & Timeline
            </h2>
            <p>
              To initiate an eligible refund claim:
            </p>
            <ol className="list-decimal pl-5 space-y-1.5 text-slate-400">
              <li>
                Send an email from your registered CreatorFlow account email address to{" "}
                <a href="mailto:support@creatorflow.ai" className="text-brand-purple underline font-mono">
                  support@creatorflow.ai
                </a>
                .
              </li>
              <li>Include your Razorpay Order ID or Payment ID (e.g., <code className="bg-navy-950 px-1 rounded">order_xxx</code> or invoice reference).</li>
              <li>Provide a concise explanation of the duplicate charge or technical outage experienced.</li>
              <li>Our support team will review and respond to your request within <strong className="text-slate-200">24 to 48 business hours</strong>.</li>
            </ol>
            <p className="pt-2">
              <strong className="text-white">Refund Processing & Banking Rails:</strong> Approved refunds are credited directly back to the original payment instrument (UPI ID, Debit Card, Credit Card, or Netbanking account) through our payment gateway partner (Razorpay). Depending on your issuing Indian bank&apos;s settlement schedule, refunded funds typically appear in your bank account statement within <strong className="text-white">5 to 7 banking business days</strong>.
            </p>
          </div>

          {/* Section 5 */}
          <div className="space-y-3 border-t border-navy-800 pt-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-brand-purple" />
              5. Dispute Contact & Billing Support
            </h2>
            <p>
              If you notice any unexpected charge or invoice discrepancy on your bank statement, please contact us first before initiating a bank chargeback. We resolve legitimate billing inquiries swiftly and transparently:
            </p>
            <div className="p-4 rounded-xl border border-navy-800 bg-navy-900/80 space-y-1 text-xs">
              <p><span className="text-slate-400">Billing Support Email:</span> <a href="mailto:support@creatorflow.ai" className="text-brand-purple underline font-mono">support@creatorflow.ai</a></p>
              <p><span className="text-slate-400">Support Hours:</span> Monday to Friday, 9:00 AM – 6:00 PM IST</p>
              <p><span className="text-slate-400">Operating Entity:</span> Jaspreet Singh (CreatorFlow AI), Delhi/NCR, India</p>
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
