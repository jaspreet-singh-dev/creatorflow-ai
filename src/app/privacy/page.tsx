import React from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  Lock,
  Database,
  Key,
  Eye,
  Server,
  FileText,
  Mail,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function PrivacyPolicyPage() {
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
          <Badge variant="success" className="text-xs px-3 py-1 font-semibold uppercase tracking-wider">
            DPDP Act & Google API Compliant
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Privacy Policy & Data Lifecycle
          </h1>
          <p className="text-xs text-slate-400">
            Effective Date: November 22, 2026 • Last updated: November 22, 2026
          </p>
        </div>

        <section className="space-y-8 text-xs sm:text-sm text-slate-300 leading-relaxed">
          {/* Section 1 */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              1. Overview & Commitment to Transparency
            </h2>
            <p>
              CreatorFlow AI (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;, operated by Jaspreet Singh, Delhi/NCR, India) provides an AI-assisted YouTube creator studio. We take personal data privacy and regulatory compliance seriously.
            </p>
            <p>
              This Privacy Policy documents our genuine data lifecycle: what data we collect, why we collect it, how it is processed and stored, who processes it, and how you can exercise full control or deletion of your information under applicable Indian law, including the <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong> and the <strong>Google API Services User Data Policy</strong>.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-3 border-t border-navy-800 pt-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-brand-purple" />
              2. Data We Collect & Processing Purposes
            </h2>
            <p>We collect and process the following categories of data strictly to deliver platform services:</p>

            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-xl border border-navy-800 bg-navy-900/60 space-y-1.5">
                <h3 className="font-bold text-white text-xs sm:text-sm">A. Authentication & Account Information</h3>
                <p className="text-slate-400 text-xs">
                  <strong>Data:</strong> Email address, user unique identifier (<code className="bg-navy-950 px-1 rounded text-slate-300">user.id</code>), profile name, and encrypted session cookies.
                </p>
                <p className="text-slate-400 text-xs">
                  <strong>Purpose:</strong> Authenticating user sessions via Supabase Auth, preventing unauthorized access, and managing account preferences.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-navy-800 bg-navy-900/60 space-y-1.5">
                <h3 className="font-bold text-white text-xs sm:text-sm">B. Connected YouTube Channel & OAuth Information</h3>
                <p className="text-slate-400 text-xs">
                  <strong>Data:</strong> Public YouTube Channel ID, channel title, custom handle, channel thumbnail URL, subscriber count, and server-side OAuth 2.0 refresh and access tokens.
                </p>
                <p className="text-slate-400 text-xs">
                  <strong>Purpose:</strong> Querying your channel&apos;s real video catalog, fetching authorized performance analytics, and executing video uploads you explicitly request.
                </p>
                <p className="text-emerald-400 text-xs font-semibold">
                  * Protection: OAuth tokens are stored exclusively in our server database with Row Level Security (RLS) and are NEVER exposed to client browser code or included in public API responses.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-navy-800 bg-navy-900/60 space-y-1.5">
                <h3 className="font-bold text-white text-xs sm:text-sm">C. Video Studio Projects & AI Prompts</h3>
                <p className="text-slate-400 text-xs">
                  <strong>Data:</strong> Working video topics, generated titles, description drafts, chapter timestamps, tag suggestions, and hook outlines.
                </p>
                <p className="text-slate-400 text-xs">
                  <strong>Purpose:</strong> Persisting your creative workspace drafts across sessions and generating customized metadata via the Google Gemini API.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-navy-800 bg-navy-900/60 space-y-1.5">
                <h3 className="font-bold text-white text-xs sm:text-sm">D. Billing & Payment Information</h3>
                <p className="text-slate-400 text-xs">
                  <strong>Data:</strong> Razorpay Order IDs, Payment IDs, cryptographic signature hashes, plan tier (<code className="bg-navy-950 px-1 rounded text-slate-300">free</code>, <code className="bg-navy-950 px-1 rounded text-slate-300">creator</code>, <code className="bg-navy-950 px-1 rounded text-slate-300">pro</code>), billing cycle, and payment status.
                </p>
                <p className="text-slate-400 text-xs">
                  <strong>Purpose:</strong> Provisioning subscription entitlements, managing billing cycles, and issuing tax invoices.
                </p>
                <p className="text-amber-300 text-xs font-semibold">
                  * Financial Security: We NEVER store credit card numbers, debit card numbers, CVVs, expiry dates, or UPI PINs on our servers. All sensitive financial transactions occur within Razorpay&apos;s PCI-DSS Level 1 certified environment.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-navy-800 bg-navy-900/60 space-y-1.5">
                <h3 className="font-bold text-white text-xs sm:text-sm">E. Contact & Customer Support Submissions</h3>
                <p className="text-slate-400 text-xs">
                  <strong>Data:</strong> Name, email address, inquiry category, subject, message body, and IP address.
                </p>
                <p className="text-slate-400 text-xs">
                  <strong>Purpose:</strong> Resolving technical inquiries, billing questions, and fraud/spam prevention.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Google API Services Compliance */}
          <div className="space-y-3 border-t border-navy-800 pt-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-brand-blue" />
              3. Google API Services User Data Policy Compliance
            </h2>
            <div className="p-5 rounded-2xl border border-navy-800 bg-navy-900/80 space-y-3">
              <p className="font-bold text-white">Limited Use Disclosure:</p>
              <p>
                CreatorFlow AI&apos;s use and transfer of information received from Google APIs to any other app will adhere to the{" "}
                <a
                  href="https://developers.google.com/terms/api-services-user-data-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-purple underline inline-flex items-center gap-0.5"
                >
                  Google API Services User Data Policy
                  <ExternalLink className="w-3 h-3" />
                </a>
                , including the Limited Use requirements.
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
                <li>We <strong>NEVER</strong> sell your Google user data or YouTube data to third parties, data brokers, or advertisers.</li>
                <li>We <strong>NEVER</strong> use your Google user data for personalized advertising, retargeting, or credit assessment.</li>
                <li>We <strong>NEVER</strong> use your private channel data to train generalized AI foundation models.</li>
                <li>Only authorized server workers execute queries necessary to display your channel metrics or perform video uploads you trigger.</li>
              </ul>
            </div>
          </div>

          {/* Section 4: Third-Party Subprocessors */}
          <div className="space-y-3 border-t border-navy-800 pt-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-amber-400" />
              4. Third-Party Service Providers (Subprocessors)
            </h2>
            <p>
              We partner with trusted enterprise cloud infrastructure providers to operate the service under strict confidentiality and data protection agreements:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-navy-800 bg-navy-900/60 space-y-1 text-xs">
                <p className="font-bold text-white">Supabase Inc. / AWS</p>
                <p className="text-slate-400">Database hosting, auth & PostgreSQL storage (AWS ap-south-1 Mumbai region).</p>
              </div>
              <div className="p-4 rounded-xl border border-navy-800 bg-navy-900/60 space-y-1 text-xs">
                <p className="font-bold text-white">Google Cloud</p>
                <p className="text-slate-400">Official YouTube Data API v3, YouTube Analytics API & Gemini AI metadata models.</p>
              </div>
              <div className="p-4 rounded-xl border border-navy-800 bg-navy-900/60 space-y-1 text-xs">
                <p className="font-bold text-white">Razorpay Software Pvt Ltd</p>
                <p className="text-slate-400">PCI-DSS Level 1 payment gateway processing UPI, cards, and netbanking in INR.</p>
              </div>
            </div>
          </div>

          {/* Section 5: Data Retention & User Rights */}
          <div className="space-y-3 border-t border-navy-800 pt-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" />
              5. Data Retention, User Rights & Account Deletion
            </h2>
            <p>
              Under the Indian DPDP Act 2023 and international privacy frameworks, you have comprehensive rights regarding your personal data:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-400">
              <li>
                <strong className="text-slate-200">Right to Access and Correction:</strong> You can review and update your profile details and connected channels directly in your account settings.
              </li>
              <li>
                <strong className="text-slate-200">Right to Disconnect YouTube:</strong> You can disconnect your YouTube channel at any time from <strong className="text-slate-200">Dashboard → Connected Channels</strong>, which immediately purges all stored OAuth tokens from our database.
              </li>
              <li>
                <strong className="text-slate-200">Right to Permanent Erasure:</strong> You can initiate complete account deletion from <strong className="text-slate-200">Settings → Account</strong> or by emailing <a href="mailto:privacy@creatorflow.ai" className="text-brand-purple underline font-mono">privacy@creatorflow.ai</a>. Account deletion triggers a database-level cascading deletion that permanently wipes your profile, projects, metadata history, channel connections, and auth records.
              </li>
              <li>
                <strong className="text-slate-200">Data Retention Limits:</strong> We retain active user data only as long as you maintain an active account. Inactive account records are permanently purged after 12 months of inactivity.
              </li>
            </ul>
          </div>

          {/* Section 6: Grievance Officer */}
          <div className="space-y-3 border-t border-navy-800 pt-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-400" />
              6. Grievance Redressal Officer (DPDP Act Compliance)
            </h2>
            <p>
              In accordance with the Digital Personal Data Protection Act, 2023 and the Information Technology Rules, the name and contact details of our designated Grievance Officer are published below:
            </p>
            <div className="p-5 rounded-2xl border border-navy-800 bg-navy-900/80 space-y-2 text-xs">
              <p><strong className="text-white text-sm">Jaspreet Singh</strong></p>
              <p className="text-slate-400">Data Protection & Grievance Redressal Officer</p>
              <p className="text-slate-400">CreatorFlow AI (Operating Entity: Jaspreet Singh)</p>
              <p className="text-slate-400">Location: Delhi/NCR, India</p>
              <p className="text-slate-400">
                Email:{" "}
                <a href="mailto:grievance@creatorflow.ai" className="text-brand-purple underline font-mono">
                  grievance@creatorflow.ai
                </a>{" "}
                /{" "}
                <a href="mailto:privacy@creatorflow.ai" className="text-brand-purple underline font-mono">
                  privacy@creatorflow.ai
                </a>
              </p>
              <p className="text-slate-500 pt-1">
                Grievances are acknowledged within 24 business hours and resolved within the statutory timeline (maximum 30 days).
              </p>
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
