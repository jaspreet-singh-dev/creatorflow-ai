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
  CheckCircle2,
  PlayCircle,
  Zap,
  ShieldCheck,
  Film,
  Flame,
  Check,
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
    <div className="min-h-screen bg-[#030508] text-slate-100 flex flex-col selection:bg-mint-400/30 selection:text-black relative overflow-x-hidden">
      {/* Background Kinetic Aurora Grid & Ambient Nebulas */}
      <div className="absolute inset-0 bg-aurora-grid opacity-60 pointer-events-none" />
      <div className="ambient-glow-mint -top-40 left-1/2 -translate-x-1/2 opacity-35" />
      <div className="ambient-glow-cyan top-96 -left-40 opacity-25" />
      <div className="ambient-glow-amber bottom-96 right-0 opacity-20" />

      {/* Navigation Header */}
      <nav className="h-20 border-b border-white/[0.06] backdrop-blur-xl bg-[#030508]/70 sticky top-0 z-50 px-6 lg:px-12 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-mint-400 via-teal-400 to-cyber-400 flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-black stroke-[2.5]" />
          </div>
          <span className="font-black text-xl sm:text-2xl tracking-tight text-white">
            CreatorFlow <span className="aurora-accent-text">AI</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-7 text-xs sm:text-sm text-slate-300 font-bold">
          <a href="#features" className="hover:text-mint-400 transition-colors">Features</a>
          <a href="#workflow" className="hover:text-mint-400 transition-colors">Workflow</a>
          <a href="#simulator" className="hover:text-mint-400 transition-colors">Shorts Simulator</a>
          <Link href="/pricing" className="hover:text-mint-400 transition-colors">Pricing</Link>
          <Link href="/about" className="hover:text-mint-400 transition-colors">About</Link>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {user ? (
            <Link href="/dashboard">
              <Button variant="gradient" size="sm" className="font-extrabold text-xs px-4">
                Open Studio
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          ) : (
            <>
              <Button
                type="button"
                onClick={handleLaunchDemo}
                variant="outline"
                size="sm"
                className="hidden sm:inline-flex text-xs h-9 border-mint-400/30 bg-mint-400/10 text-mint-400 hover:bg-mint-400/20"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-mint-400" />
                Live Demo
              </Button>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-xs font-bold">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="gradient" size="sm" className="font-black text-xs px-4">
                  Get Started Free
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-20 px-6 lg:px-12 flex flex-col items-center text-center">
        <div className="z-10 max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-mint-400/10 border border-mint-400/25 text-xs font-black text-mint-400 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-mint-400 animate-pulse" />
            <span>CreatorFlow Studio 2.0</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300 font-semibold">Hyper-Mint Creator Operating System</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1]">
            Scale Your YouTube Channel with{" "}
            <span className="aurora-accent-text">
              Intelligent Precision.
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
            Formulate high-CTR titles, 3-second retention hooks, structured scripts, and 4K resumable uploads with a real-time YouTube Shorts simulator — all in one unified creator workstation.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <Link href="/signup">
              <Button size="lg" variant="gradient" className="px-8 w-full sm:w-auto">
                Start Creating Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              onClick={handleLaunchDemo}
              className="px-6 w-full sm:w-auto font-bold"
            >
              <PlayCircle className="w-4 h-4 mr-2 text-mint-400" />
              Instant Sandbox Demo
            </Button>
            <Link href="/demo">
              <Button
                size="lg"
                variant="ghost"
                className="text-sm font-bold px-4 text-slate-400 hover:text-white w-full sm:w-auto"
              >
                <Film className="w-4 h-4 mr-2" />
                Tour Video
              </Button>
            </Link>
          </div>

          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-semibold">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-mint-400" />
              <span>Official YouTube Data API v3</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyber-400" />
              <span>Gemini 3.5 AI Engine</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-solar-400" />
              <span>Multi-Channel OAuth 2.0</span>
            </div>
          </div>
        </div>

        {/* Hero Interactive Studio Mockup */}
        <div id="simulator" className="z-10 mt-16 max-w-5xl w-full aurora-card p-3 sm:p-5 shadow-2xl">
          <div className="rounded-xl border border-white/[0.08] overflow-hidden bg-[#04060C]">
            {/* Terminal Window Bar */}
            <div className="h-10 bg-[#070B14] px-4 flex items-center justify-between border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-xs font-mono text-slate-400">creatorflow.ai/dashboard/create</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-mint-400/10 text-mint-400 border border-mint-400/30 font-bold">
                  Channel: @NoVoiceCraft
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-solar-400/10 text-solar-400 border border-solar-400/30 font-bold">
                  Virality: 98/100
                </span>
              </div>
            </div>

            {/* Studio Teaser Grid */}
            <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-5 text-left items-center">
              <div className="md:col-span-7 space-y-3.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black px-2 py-0.5 rounded bg-mint-400/20 text-mint-400 font-mono">
                    ACTIVE SCRIPT DRAFT
                  </span>
                  <span className="text-xs text-slate-400 font-mono">45s Spoken Duration</span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  CAN WATER CAULDRON SAVE ME FROM 1000 BLOCKS?! 💀 #minecraft
                </h3>
                <p className="text-xs text-slate-300 font-mono bg-[#020408] p-3 rounded-xl border border-white/[0.06] line-clamp-3 leading-relaxed">
                  [00:00 - RETENTION HOOK] &quot;Most Minecraft players believe a water bucket is the only clutch... but what happens from 1000 BLOCKS?!&quot;
                </p>
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-mint-400/10 text-mint-400 border border-mint-400/20 font-mono font-bold">
                    #minecraft
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-cyber-400/10 text-cyber-400 border border-cyber-400/20 font-mono font-bold">
                    #minecraftshorts
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-solar-400/10 text-solar-400 border border-solar-400/20 font-mono font-bold">
                    #mlgclutch
                  </span>
                </div>
              </div>

              {/* Right Mini Simulator Card */}
              <div className="md:col-span-5 p-4 rounded-xl bg-[#020408] border border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between text-xs font-black text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-solar-400" />
                    YouTube Shorts Live Sim
                  </span>
                  <span className="text-mint-400 font-mono font-black">14.2K Likes</span>
                </div>
                <div className="aspect-[9/10] bg-gradient-to-b from-slate-900 to-black rounded-lg border border-white/[0.06] p-3 flex flex-col justify-between relative overflow-hidden">
                  <div className="text-[10px] font-black text-white bg-red-600 px-1.5 py-0.2 rounded w-fit">
                    SHORTS
                  </div>
                  <div className="space-y-1.5">
                    <div className="bg-black/75 backdrop-blur-md p-1.5 rounded border border-white/10 text-[10px] text-solar-400 font-extrabold">
                      &quot;1000 BLOCKS vs 1 CAULDRON&quot;
                    </div>
                    <p className="text-[11px] font-bold text-white leading-tight">
                      @novoicecraft • 335 subs
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 lg:px-12 border-y border-white/[0.06] bg-[#050812]/50">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mint-400/10 border border-mint-400/20 text-xs font-bold text-mint-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Full Creator Stack</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Built Specifically for Channel Velocity
            </h2>
            <p className="text-sm sm:text-base text-slate-400 font-medium">
              Stop switching between 5 disconnected tools. CreatorFlow AI unites your creative conception and technical publishing pipeline.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="aurora-card p-6 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-mint-400/20 text-mint-400 flex items-center justify-center border border-mint-400/30">
                <Sparkles className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h3 className="text-lg font-black text-white">AI Content Studio</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Formulate 5 curiosity-gap titles, 3-second retention hooks, structured scripts, and ranked search tags with 1 click.
              </p>
            </div>

            <div className="aurora-card p-6 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-cyber-400/20 text-cyber-400 flex items-center justify-center border border-cyber-400/30">
                <UploadCloud className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h3 className="text-lg font-black text-white">4K Resumable Uploads</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Direct integration with YouTube Data API v3. Upload Videos and Shorts with chunked tracking, scheduled drops, and zero browser freezing.
              </p>
            </div>

            <div className="aurora-card p-6 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-mint-400/20 text-mint-400 flex items-center justify-center border border-mint-400/30">
                <BarChart3 className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h3 className="text-lg font-black text-white">Real-Time Channel Analytics</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Track impressions, CTR, average view duration, subscriber velocity, and retention trends directly from your YouTube channel.
              </p>
            </div>

            <div className="aurora-card p-6 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-solar-400/20 text-solar-400 flex items-center justify-center border border-solar-400/30">
                <Calendar className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h3 className="text-lg font-black text-white">Visual Content Calendar</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Schedule your monthly pipeline. Manage scheduled YouTube drops, local draft projects, and thumbnail readiness.
              </p>
            </div>

            <div className="aurora-card p-6 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30">
                <Youtube className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h3 className="text-lg font-black text-white">Multi-Channel Manager</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Seamlessly toggle between gaming, tech, shorts, and long-form channels. Backend OAuth tokens are isolated and encrypted.
              </p>
            </div>

            <div className="aurora-card p-6 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-cyber-400/20 text-cyber-400 flex items-center justify-center border border-cyber-400/30">
                <Layers className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h3 className="text-lg font-black text-white">Version History Engine</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Never lose an idea. Every save captures a snapshot with full diff previews and instant 1-click restore.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 lg:px-12">
        <div className="max-w-5xl mx-auto space-y-16">
          <div className="text-center space-y-3">
            <Badge variant="default" className="text-xs font-bold">Transparent Plans</Badge>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Simple, Predictable Creator Pricing
            </h2>
            <p className="text-sm text-slate-400 font-medium">
              Start free forever. Upgrade only when your channel publishing scales.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* FREE PLAN */}
            <div className="aurora-card p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <h4 className="text-lg font-black text-white">Free Starter</h4>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">₹0</span>
                  <span className="text-xs text-slate-400">/ forever</span>
                </div>
                <p className="text-xs text-slate-400">Essential tools to launch your first automated channel.</p>
                <div className="space-y-2 text-xs text-slate-300 pt-3 border-t border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-mint-400 shrink-0" />
                    <span>1 Connected YouTube Channel</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-mint-400 shrink-0" />
                    <span>15 AI Metadata Generations / mo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-mint-400 shrink-0" />
                    <span>Direct YouTube Uploads</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-mint-400 shrink-0" />
                    <span>Content Calendar</span>
                  </div>
                </div>
              </div>
              <Link href="/signup">
                <Button variant="outline" className="w-full text-xs font-bold">
                  Get Started Free
                </Button>
              </Link>
            </div>

            {/* CREATOR PLAN (FEATURED) */}
            <div className="aurora-card p-6 relative flex flex-col justify-between space-y-6 border-mint-400/50 shadow-glow-lg">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge variant="default" className="text-[10px] font-black px-3 py-0.5 bg-mint-400 text-black shadow-glow">
                  MOST POPULAR
                </Badge>
              </div>
              <div className="space-y-4">
                <h4 className="text-lg font-black text-white">Creator Pro</h4>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">₹999</span>
                  <span className="text-xs text-slate-400">/ month (incl. GST)</span>
                </div>
                <p className="text-xs text-slate-400">For ambitious creators publishing consistent, optimized drops.</p>
                <div className="space-y-2 text-xs text-slate-300 pt-3 border-t border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-mint-400 shrink-0" />
                    <span>Up to 3 Connected Channels</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-mint-400 shrink-0" />
                    <span>200 AI Metadata Generations / mo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-mint-400 shrink-0" />
                    <span>Advanced YouTube Analytics Dashboard</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-mint-400 shrink-0" />
                    <span>Thumbnail Concept Studio</span>
                  </div>
                </div>
              </div>
              <Link href="/signup">
                <Button variant="gradient" className="w-full text-xs font-black shadow-glow">
                  Get Started Now
                </Button>
              </Link>
            </div>

            {/* STUDIO PLAN */}
            <div className="aurora-card p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <h4 className="text-lg font-black text-white">Agency Studio</h4>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">₹2,499</span>
                  <span className="text-xs text-slate-400">/ month (incl. GST)</span>
                </div>
                <p className="text-xs text-slate-400">Built for video production teams and multi-channel networks.</p>
                <div className="space-y-2 text-xs text-slate-300 pt-3 border-t border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-mint-400 shrink-0" />
                    <span>Unlimited Connected Channels</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-mint-400 shrink-0" />
                    <span>Unlimited AI Generations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-mint-400 shrink-0" />
                    <span>Consolidated Studio Analytics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-mint-400 shrink-0" />
                    <span>Priority YouTube Quota Support</span>
                  </div>
                </div>
              </div>
              <Link href="/signup">
                <Button variant="outline" className="w-full text-xs font-bold">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-12 px-6 lg:px-12 bg-[#020408] text-xs text-slate-400">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-mint-400/20 text-mint-400 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="font-black text-white">CreatorFlow AI</span>
            <span className="hidden sm:inline text-slate-500">— The Autonomous YouTube Creator Studio</span>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 text-xs flex-wrap justify-center font-medium">
            <Link href="/about" className="hover:text-mint-400 transition-colors">About</Link>
            <Link href="/pricing" className="hover:text-mint-400 transition-colors">Pricing</Link>
            <Link href="/contact" className="hover:text-mint-400 transition-colors">Contact</Link>
            <Link href="/terms" className="hover:text-mint-400 transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-mint-400 transition-colors">Privacy</Link>
            <Link href="/refund" className="hover:text-mint-400 transition-colors">Refund</Link>
            <Link href="/security" className="hover:text-mint-400 transition-colors">Security</Link>
          </div>

          <p className="text-slate-500 text-[11px]">© 2026 CreatorFlow AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
