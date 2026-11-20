"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Youtube,
  UploadCloud,
  BarChart3,
  Calendar,
  Layers,
  ArrowRight,
  CheckCircle,
  PlayCircle,
  Zap,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function HomePage() {
  const { user, signInDemo } = useAuth();
  const router = useRouter();

  const handleLaunchDemo = () => {
    signInDemo();
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col selection:bg-brand-purple/30 selection:text-white">
      {/* Navigation Header */}
      <nav className="h-20 border-b border-navy-800/80 bg-navy-950/80 backdrop-blur-md sticky top-0 z-50 px-6 lg:px-12 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-purple to-brand-blue flex items-center justify-center shadow-glow">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">
            CreatorFlow <span className="text-brand-purple">AI</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm text-slate-300 font-medium">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#workflow" className="hover:text-white transition-colors">Workflow</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {user ? (
            <Link href="/dashboard">
              <Button variant="gradient" size="sm" className="font-semibold text-xs px-4">
                Open Dashboard
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLaunchDemo}
                className="hidden sm:inline-flex text-xs h-9 border-navy-700 bg-navy-900/60"
              >
                <PlayCircle className="w-3.5 h-3.5 mr-1.5 text-brand-purple" />
                Live Demo
              </Button>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-xs">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="gradient" size="sm" className="font-semibold text-xs px-4">
                  Get Started Free
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-6 lg:px-12 flex flex-col items-center text-center overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-brand-purple/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-48 left-1/3 w-[500px] h-[250px] bg-brand-blue/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="z-10 max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-navy-900/90 border border-navy-700/80 text-xs font-medium text-slate-300 shadow-card">
            <span className="flex h-2 w-2 rounded-full bg-brand-purple animate-pulse" />
            <span className="text-brand-purple font-semibold">CreatorFlow 2.0</span>
            <span className="text-slate-500">•</span>
            <span>All-in-One YouTube Automation Suite</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            Scale Your YouTube Channel with{" "}
            <span className="bg-gradient-to-r from-brand-purple via-violet-400 to-brand-blue bg-clip-text text-transparent">
              Intelligent Automation
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Generate high-CTR metadata, automate video uploads via YouTube Data v3 API, plan publishing calendars, and track deep analytics across multiple channels — all from one high-performance dashboard.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <Link href="/signup">
              <Button size="lg" variant="gradient" className="font-semibold text-sm px-8 shadow-glow w-full sm:w-auto">
                Start Creating Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="secondary"
              onClick={handleLaunchDemo}
              className="text-sm font-medium px-6 border-navy-700 w-full sm:w-auto"
            >
              <PlayCircle className="w-4 h-4 mr-2 text-brand-purple" />
              Explore Interactive Sandbox
            </Button>
          </div>

          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Official YouTube Data API v3</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-brand-purple" />
              <span>Gemini Pro & Flash AI</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-brand-blue" />
              <span>Multi-Channel OAuth 2.0</span>
            </div>
          </div>
        </div>

        {/* Hero Dashboard Preview Mockup */}
        <div className="z-10 mt-16 max-w-5xl w-full rounded-2xl border border-navy-800 bg-navy-900/80 p-2 sm:p-4 shadow-2xl backdrop-blur-xl">
          <div className="rounded-xl border border-navy-800/80 overflow-hidden bg-navy-950">
            {/* Window bar */}
            <div className="h-10 bg-navy-900/90 px-4 flex items-center justify-between border-b border-navy-800/80">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-xs font-mono text-slate-400">creatorflow.ai/dashboard</span>
              </div>
              <Badge variant="blue" className="text-[10px]">Connected: @AIHorizons</Badge>
            </div>
            {/* Dashboard Content Teaser */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4 text-left">
              <div className="p-4 rounded-xl bg-navy-900/60 border border-navy-800">
                <span className="text-xs text-slate-400">Total Views Managed</span>
                <p className="text-2xl font-bold text-white mt-1">7.6M</p>
                <span className="text-[11px] text-emerald-400 font-medium">↑ +18.4% this month</span>
              </div>
              <div className="p-4 rounded-xl bg-navy-900/60 border border-navy-800">
                <span className="text-xs text-slate-400">Scheduled Videos</span>
                <p className="text-2xl font-bold text-brand-purple mt-1">6 Active</p>
                <span className="text-[11px] text-slate-400">Next: Tomorrow 18:00 UTC</span>
              </div>
              <div className="p-4 rounded-xl bg-navy-900/60 border border-navy-800">
                <span className="text-xs text-slate-400">AI Metadata Quality</span>
                <p className="text-2xl font-bold text-emerald-400 mt-1">96 / 100</p>
                <span className="text-[11px] text-slate-400">High virality & SEO index</span>
              </div>
              <div className="p-4 rounded-xl bg-navy-900/60 border border-navy-800">
                <span className="text-xs text-slate-400">Connected Channels</span>
                <p className="text-2xl font-bold text-brand-blue mt-1">2 Channels</p>
                <span className="text-[11px] text-slate-400">Synced in real-time</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 lg:px-12 bg-navy-900/40 border-y border-navy-800/60">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <Badge variant="default" className="text-xs font-semibold">Comprehensive Creator Stack</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Engineered for YouTube Growth & Scale
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              Stop juggling 5 different extensions, spreadsheets, and tabs. CreatorFlow AI unites your creative and technical pipeline.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-navy-800 bg-navy-900/60 space-y-4 hover:border-brand-purple/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-brand-purple/20 text-brand-purple flex items-center justify-center border border-brand-purple/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">AI Metadata Studio</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Generate 5 viral title hooks, SEO-optimized descriptions, tags, timestamped chapters, and thumbnail text with instant quality scoring.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-navy-800 bg-navy-900/60 space-y-4 hover:border-brand-blue/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-brand-blue/20 text-brand-blue flex items-center justify-center border border-brand-blue/30">
                <UploadCloud className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Resumable Video Uploads</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Direct integration with YouTube Data API v3. Manage privacy, scheduled release dates, playlists, and chunked upload tracking safely.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-navy-800 bg-navy-900/60 space-y-4 hover:border-emerald-500/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">YouTube Analytics Studio</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                View real-time impressions, CTR, average view duration, watch time, and retention curves for authorized channels.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-navy-800 bg-navy-900/60 space-y-4 hover:border-brand-purple/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-brand-purple/20 text-brand-purple flex items-center justify-center border border-brand-purple/30">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Visual Content Calendar</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Organize monthly and weekly publishing pipelines. Distinguish between local drafts and confirmed YouTube scheduled drops.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-navy-800 bg-navy-900/60 space-y-4 hover:border-brand-blue/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-brand-blue/20 text-brand-blue flex items-center justify-center border border-brand-blue/30">
                <Youtube className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Multi-Channel Hub</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Switch seamlessly between multiple YouTube channels. Securely manage OAuth 2.0 refresh tokens on isolated backend services.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-navy-800 bg-navy-900/60 space-y-4 hover:border-violet-500/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 text-violet-300 flex items-center justify-center border border-violet-500/30">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">AI Content Assistant</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Formulate high-retention video hooks, episodic series structures, script outlines, and short-form adaptation concepts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 lg:px-12">
        <div className="max-w-5xl mx-auto space-y-16">
          <div className="text-center space-y-3">
            <Badge variant="blue" className="text-xs font-semibold">Transparent Plans</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Built for Solo Creators and Scaling Studios
            </h2>
            <p className="text-sm text-slate-400">
              Transparent usage tiers. Upgrade or switch anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* FREE PLAN */}
            <div className="p-6 rounded-2xl border border-navy-800 bg-navy-900/60 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-white">Free Starter</h4>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-white">$0</span>
                  <span className="text-xs text-slate-400">/ forever</span>
                </div>
                <p className="text-xs text-slate-400">Essential tools to launch your first automated channel.</p>
                <div className="space-y-2.5 text-xs text-slate-300 pt-2 border-t border-navy-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-brand-purple shrink-0" />
                    <span>1 Connected YouTube Channel</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-brand-purple shrink-0" />
                    <span>15 AI Metadata Generations / mo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-brand-purple shrink-0" />
                    <span>Direct YouTube Uploads</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-brand-purple shrink-0" />
                    <span>Content Calendar</span>
                  </div>
                </div>
              </div>
              <Link href="/signup">
                <Button variant="outline" className="w-full text-xs font-semibold border-navy-700">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* CREATOR PLAN (POPULAR) */}
            <div className="p-6 rounded-2xl border-2 border-brand-purple bg-navy-900/90 relative flex flex-col justify-between space-y-6 shadow-glow">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge variant="default" className="text-[10px] font-bold px-3 py-0.5">MOST POPULAR</Badge>
              </div>
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-white">Creator Pro</h4>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-white">$29</span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>
                <p className="text-xs text-slate-400">For ambitious creators publishing consistent, optimized content.</p>
                <div className="space-y-2.5 text-xs text-slate-300 pt-2 border-t border-navy-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-brand-purple shrink-0" />
                    <span>Up to 3 Connected Channels</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-brand-purple shrink-0" />
                    <span>200 AI Metadata Generations / mo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-brand-purple shrink-0" />
                    <span>Advanced YouTube Analytics Dashboard</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-brand-purple shrink-0" />
                    <span>Thumbnail Concept Studio</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-brand-purple shrink-0" />
                    <span>AI Content Ideation Assistant</span>
                  </div>
                </div>
              </div>
              <Link href="/signup">
                <Button variant="gradient" className="w-full text-xs font-semibold shadow-glow">
                  Start 14-Day Free Trial
                </Button>
              </Link>
            </div>

            {/* PRO / AGENCY PLAN */}
            <div className="p-6 rounded-2xl border border-navy-800 bg-navy-900/60 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-white">Agency Studio</h4>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-white">$79</span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>
                <p className="text-xs text-slate-400">Built for video production teams and channel management agencies.</p>
                <div className="space-y-2.5 text-xs text-slate-300 pt-2 border-t border-navy-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-brand-purple shrink-0" />
                    <span>Unlimited Connected Channels</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-brand-purple shrink-0" />
                    <span>Unlimited AI Generations & Ideation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-brand-purple shrink-0" />
                    <span>Multi-channel Consolidated Analytics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-brand-purple shrink-0" />
                    <span>Priority YouTube API Quota Handling</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-brand-purple shrink-0" />
                    <span>Dedicated Support</span>
                  </div>
                </div>
              </div>
              <Link href="/signup">
                <Button variant="outline" className="w-full text-xs font-semibold border-navy-700">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-navy-800 py-12 px-6 lg:px-12 bg-navy-950 text-xs text-slate-400">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-brand-purple/20 text-brand-purple flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-200">CreatorFlow AI</span>
            <span>— The YouTube Creator Automation Platform</span>
          </div>
          <p>© 2026 CreatorFlow AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
