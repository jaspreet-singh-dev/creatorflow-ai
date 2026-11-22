import React from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowLeft,
  Youtube,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Layers,
  FileText,
  BarChart3,
  CheckCircle2,
  Lock,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function AboutPage() {
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
            <Link href="/signup">
              <Button variant="gradient" size="sm" className="text-xs font-semibold shadow-glow">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-12 lg:py-16 space-y-16">
        <div className="space-y-4 max-w-3xl">
          <Badge variant="default" className="text-xs px-3 py-1 font-semibold uppercase tracking-wider">
            About Our Mission
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            An AI-First Studio Built to Empower YouTube Creators
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            CreatorFlow AI was engineered to solve one fundamental creator problem: spending hours stuck on titles, descriptions, SEO tags, retention hooks, and thumbnail concepts instead of doing what you love—creating exceptional video content.
          </p>
        </div>

        {/* Core Pillars Grid */}
        <section className="space-y-6">
          <div className="border-b border-navy-800 pb-4">
            <h2 className="text-xl font-bold text-white tracking-tight">What CreatorFlow AI Does</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Practical automation designed specifically for individual creators and digital studios.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-navy-800 bg-navy-900/60 space-y-3 shadow-card">
              <div className="w-10 h-10 rounded-xl bg-brand-purple/15 text-brand-purple flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">AI Content Ideation</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Formulates viral angles, contrarian hooks, problem-first intros, and structured video outlines tailored to your specific niche and content format.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-navy-800 bg-navy-900/60 space-y-3 shadow-card">
              <div className="w-10 h-10 rounded-xl bg-brand-blue/15 text-brand-blue flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">SEO Title & Metadata Studio</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Generates high-CTR candidate titles, YouTube-formatted descriptions with auto-timestamps, and strategic keyword tags tested for discoverability.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-navy-800 bg-navy-900/60 space-y-3 shadow-card">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Thumbnail Studio & Feed Preview</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Creates high-contrast visual thumbnail concepts and allows you to test your titles in simulated desktop and mobile YouTube feed previews before publishing.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-navy-800 bg-navy-900/60 space-y-3 shadow-card">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 text-red-500 flex items-center justify-center">
                <Youtube className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Verified YouTube Integration</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Connects directly to official Google YouTube Data API v3 and YouTube Analytics API to sync your real video catalogs, view velocity, and audience retention metrics.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-navy-800 bg-navy-900/60 space-y-3 shadow-card">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Channel Analytics</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Inspect authentic performance over 7-day, 28-day, 90-day, and lifetime horizons with day-by-day viewership velocity and ranked top video benchmarks.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-navy-800 bg-navy-900/60 space-y-3 shadow-card">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Enterprise Privacy & Security</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Built on PostgreSQL with Row Level Security (RLS). OAuth tokens are encrypted and kept strictly server-side—never shared, rented, or used for model training.
              </p>
            </div>
          </div>
        </section>

        {/* Clear Truth in Advertising & Disclaimers */}
        <section className="p-6 sm:p-8 rounded-2xl border border-navy-800 bg-navy-900/80 space-y-4">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <ShieldCheck className="w-5 h-5" />
            <span>Honesty & Ethical AI Commitments</span>
          </div>
          <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <p>
              We believe in total transparency with our users. CreatorFlow AI is an optimization and workflow acceleration tool. Accordingly, we make the following solemn commitments:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-400">
              <li>
                <strong className="text-slate-200">No Guaranteed Views or Growth:</strong> We do <strong>not</strong> promise or guarantee specific view counts, subscriber surges, viral reach, or placement on the YouTube homepage. Video distribution is determined solely by viewer retention, audience satisfaction, and YouTube&apos;s proprietary recommendation algorithms.
              </li>
              <li>
                <strong className="text-slate-200">No Automated Spam:</strong> CreatorFlow AI does not provide bot views, click farms, fake comments, or artificially inflated engagement. We build tools exclusively for legitimate creators publishing quality content.
              </li>
              <li>
                <strong className="text-slate-200">Independent Software:</strong> YouTube is a registered trademark of Google LLC. CreatorFlow AI is an independent software application and is not affiliated with, endorsed by, or sponsored by Google LLC or YouTube.
              </li>
              <li>
                <strong className="text-slate-200">Compliance with Google Terms:</strong> Our integrations strictly adhere to the{" "}
                <a
                  href="https://developers.google.com/terms/api-services-user-data-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-purple underline inline-flex items-center gap-0.5"
                >
                  Google API Services User Data Policy
                  <ExternalLink className="w-3 h-3" />
                </a>{" "}
                and the YouTube Developer Terms of Service.
              </li>
            </ul>
          </div>
        </section>

        {/* Business and Ownership Information */}
        <section className="space-y-3 border-t border-navy-800 pt-8 text-xs text-slate-400">
          <h3 className="text-sm font-bold text-white">Merchant & Business Details</h3>
          <p>
            CreatorFlow AI is operated by independent software developer Jaspreet Singh (Delhi/NCR, India). For inquiries, partnership opportunities, or technical support, please contact{" "}
            <a href="mailto:support@creatorflow.ai" className="text-brand-purple underline">
              support@creatorflow.ai
            </a>
            .
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
