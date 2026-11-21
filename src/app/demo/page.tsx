"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  Sparkles,
  Play,
  PlayCircle,
  Eye,
  Clock,
  TrendingUp,
  BarChart3,
  Users,
  CheckCircle2,
  Calendar,
  UploadCloud,
  FileText,
  Tag,
  ArrowRight,
  ShieldAlert,
  Info,
  Youtube,
  Share2,
} from "lucide-react";

export default function DemoExperiencePage() {
  const [activeTab, setActiveTab] = useState<"project" | "analytics" | "publishing">("project");
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col selection:bg-brand-purple/30">
      {/* Top Banner: Explicit Sample Experience Disclaimer */}
      <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2.5 text-xs text-amber-500 dark:text-amber-300 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0 text-amber-500" />
          <span>
            <strong>DEMO SHOWCASE:</strong> This is an interactive sample walkthrough. All videos, metadata, and analytics below are illustrative demonstration data and will not affect any real YouTube channels.
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/signup">
            <Button size="sm" variant="gradient" className="h-7 text-xs font-semibold px-3 shadow-sm">
              Sign Up Free
            </Button>
          </Link>
          <Link href="/login">
            <Button size="sm" variant="outline" className="h-7 text-xs font-medium px-3 border-amber-500/40 bg-navy-900/40">
              Sign In
            </Button>
          </Link>
        </div>
      </div>

      {/* Demo Header */}
      <header className="h-16 border-b border-navy-800 bg-navy-900/80 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between gap-4 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-purple to-brand-blue flex items-center justify-center shadow-glow">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                CreatorFlow <span className="text-brand-purple">AI</span>
              </span>
              <Badge variant="warning" className="text-[9px] font-bold uppercase tracking-wider">
                Demo Video
              </Badge>
            </div>
          </Link>
        </div>

        {/* View Switcher Tabs */}
        <div className="hidden md:flex items-center bg-navy-950 p-1 rounded-xl border border-navy-800 gap-1 text-xs">
          <button
            onClick={() => setActiveTab("project")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === "project"
                ? "bg-brand-purple text-white shadow-glow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Sample Project
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === "analytics"
                ? "bg-brand-purple text-white shadow-glow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Sample Analytics
          </button>
          <button
            onClick={() => setActiveTab("publishing")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === "publishing"
                ? "bg-brand-purple text-white shadow-glow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Publishing Preview
          </button>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/signup">
            <Button size="sm" variant="gradient" className="text-xs font-semibold">
              Create Account
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* TAB 1: SAMPLE CREATOR PROJECT */}
        {activeTab === "project" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Project Overview Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Video Player & Thumbnail Container */}
              <div className="lg:col-span-2 space-y-4">
                <Card className="border-navy-800 bg-navy-900/90 overflow-hidden shadow-card">
                  <div className="relative aspect-video bg-black flex items-center justify-center group overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1280&auto=format&fit=crop&q=80"
                      alt="Sample Video Thumbnail"
                      className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                    {/* Centered Play Button */}
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="absolute z-10 w-16 h-16 rounded-full bg-brand-purple/90 hover:bg-brand-purple text-white flex items-center justify-center shadow-glow transition-transform hover:scale-110"
                      aria-label="Play sample video preview"
                    >
                      <Play className="w-7 h-7 ml-1 fill-white" />
                    </button>

                    {/* Bottom Video Badge & Watermark */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                      <Badge variant="default" className="text-[10px] bg-black/60 border-white/20">
                        SAMPLE CREATOR VIDEO (14:32)
                      </Badge>
                      <span className="text-[11px] font-mono bg-black/60 px-2 py-0.5 rounded border border-white/20">
                        1080p 60fps
                      </span>
                    </div>
                  </div>

                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="blue" className="text-[10px]">
                        AI Optimized
                      </Badge>
                      <Badge variant="success" className="text-[10px]">
                        SEO Score: 94/100
                      </Badge>
                      <Badge variant="secondary" className="text-[10px]">
                        Private Draft
                      </Badge>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
                      CAN SWEET BERRIES SAVE ME FROM MAXIMUM BUILD LIMIT?! 💀🌿 #minecraft
                    </h2>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Channel: <strong className="text-slate-700 dark:text-slate-200">@novoice_craft (NoVoiceCraft Showcase)</strong> • Real Performance: 55,032 views • 61.8h Watch Time
                    </p>
                  </CardContent>
                </Card>

                {/* Metadata Details Accordion */}
                <Card className="border-navy-800 bg-navy-900/90 shadow-card p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-navy-800 pb-3">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-brand-purple" />
                      Generated Video Description & Timestamps
                    </h3>
                    <Badge variant="outline" className="text-[10px]">
                      Markdown Enabled
                    </Badge>
                  </div>

                  <div className="p-4 rounded-xl bg-navy-950/80 border border-navy-800 text-xs font-mono leading-relaxed text-slate-600 dark:text-slate-300 space-y-2 whitespace-pre-wrap">
                    {`CAN SWEET BERRIES SAVE ME FROM MAXIMUM BUILD LIMIT?! 💀🌿

Dropping from Y=320 all the way down with zero armor and testing if a single sweet berry bush can break lethal fall damage! Watch until the end to see the heart counter test!

📌 TIMESTAMPS:
0:00 - The Impossible Drop
0:05 - Sweet Berries vs Fall Damage
0:11 - Slow Motion Hitbox Test
0:16 - Survives or Dies?

#minecraft #shorts #minecraftmemes #clutch #gaming #minecraftclutch #survival`}
                  </div>

                  {/* Tags Cloud */}
                  <div>
                    <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-brand-blue" />
                      High-Traffic YouTube Search Tags
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {["minecraft", "minecraft clutch", "shorts", "gaming", "minecraft shorts", "fall damage", "sweet berries", "minecraft survival", "impossible clutch"].map((t) => (
                        <span key={t} className="px-2 py-1 rounded-md text-[11px] bg-navy-800 border border-navy-700 text-slate-700 dark:text-slate-300">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>

              {/* Sidebar: AI Content Score & Workflow Highlights */}
              <div className="space-y-4">
                <Card className="border-navy-800 bg-navy-900/90 p-5 shadow-card space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      AI Retention Engine
                    </h3>
                    <Badge variant="default" className="text-[10px]">
                      Gemini 2.5 Flash
                    </Badge>
                  </div>

                  <div className="p-4 rounded-xl bg-brand-purple/10 border border-brand-purple/30 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-brand-purple">Opening Retention Hook</span>
                      <span className="text-[10px] text-emerald-400 font-bold">Top 5% Category</span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-200 italic leading-relaxed">
                      &quot;Most developers fail with AI agents because they treat them like chatbots. Here is the 3-layer architecture Fortune 500 teams use instead...&quot;
                    </p>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Click-Through Likelihood:</span>
                      <span className="font-bold text-emerald-400">High (11.4% Est.)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Audience Alignment:</span>
                      <span className="font-bold text-white">Full-Stack Engineers</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Optimal Publish Window:</span>
                      <span className="font-bold text-brand-blue">Tuesday, 6:00 PM IST</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-navy-800">
                    <Link href="/signup">
                      <Button variant="gradient" className="w-full text-xs font-semibold shadow-glow">
                        Try with Your Channel
                        <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                      </Button>
                    </Link>
                  </div>
                </Card>

                {/* What Real Users Get */}
                <Card className="border-navy-800 bg-navy-900/60 p-5 space-y-3">
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    When you sign up:
                  </h4>
                  <ul className="text-xs text-slate-400 space-y-2">
                    <li>• Connect your real YouTube channels via official Google OAuth.</li>
                    <li>• Real-time channel analytics without hardcoded multipliers.</li>
                    <li>• Resumable direct-to-YouTube video publishing with chunked resume.</li>
                    <li>• Unlimited draft versions and history restoration.</li>
                  </ul>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SAMPLE ANALYTICS PREVIEW */}
        {activeTab === "analytics" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5 text-xs text-amber-500 dark:text-amber-300">
                <Info className="w-4 h-4 shrink-0" />
                <span>
                  <strong>SAMPLE REPORTING:</strong> The figures below represent an illustrative sample channel dashboard. Real accounts receive verified YouTube Data API v3 and YouTube Analytics reports.
                </span>
              </div>
            </div>

            {/* Top 4 KPI Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-navy-800 bg-navy-900/90 p-4">
                <CardDescription className="text-xs uppercase font-semibold text-slate-400">Total Views (Sample)</CardDescription>
                <p className="text-2xl font-extrabold text-white mt-1">184,200</p>
                <span className="text-[11px] text-emerald-400 font-medium">↑ 24% vs prior 28 days</span>
              </Card>

              <Card className="border-navy-800 bg-navy-900/90 p-4">
                <CardDescription className="text-xs uppercase font-semibold text-slate-400">Watch Time (Hours)</CardDescription>
                <p className="text-2xl font-extrabold text-white mt-1">8,420 hrs</p>
                <span className="text-[11px] text-emerald-400 font-medium">Avg Duration: 4m 34s</span>
              </Card>

              <Card className="border-navy-800 bg-navy-900/90 p-4">
                <CardDescription className="text-xs uppercase font-semibold text-slate-400">Impression CTR</CardDescription>
                <p className="text-2xl font-extrabold text-white mt-1">8.6%</p>
                <span className="text-[11px] text-slate-400">1.42M Total Impressions</span>
              </Card>

              <Card className="border-navy-800 bg-navy-900/90 p-4">
                <CardDescription className="text-xs uppercase font-semibold text-slate-400">Subscribers Gained</CardDescription>
                <p className="text-2xl font-extrabold text-white mt-1">+1,850</p>
                <span className="text-[11px] text-purple-400">148.5K Total Subscribers</span>
              </Card>
            </div>

            {/* Retention & Traffic Sources Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-navy-800 bg-navy-900/90 p-5 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Audience Retention Curve (Sample)
                </h3>
                <p className="text-xs text-slate-400">
                  Measures percentage of viewers watching at each point in the video.
                </p>
                <div className="h-32 flex items-end gap-2 pt-4 px-2">
                  {[100, 78, 64, 52, 44, 38, 32].map((val, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                      <span className="text-[10px] text-slate-400 font-mono">{val}%</span>
                      <div
                        style={{ height: `${val}%` }}
                        className="w-full rounded-t-md bg-gradient-to-t from-brand-purple to-brand-blue"
                      />
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="border-navy-800 bg-navy-900/90 p-5 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-brand-blue" />
                  Traffic Sources Breakdown (Sample)
                </h3>
                <div className="space-y-2.5 text-xs">
                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>YouTube Search</span>
                      <span className="font-bold">46%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-navy-950 overflow-hidden">
                      <div className="h-full bg-brand-purple rounded-full" style={{ width: "46%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>Suggested Videos</span>
                      <span className="font-bold">28%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-navy-950 overflow-hidden">
                      <div className="h-full bg-brand-blue rounded-full" style={{ width: "28%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>Browse Features</span>
                      <span className="font-bold">18%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-navy-950 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: "18%" }} />
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 3: PUBLISHING WORKFLOW PREVIEW */}
        {activeTab === "publishing" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <Card className="border-navy-800 bg-navy-900/90 p-6 space-y-6">
              <div className="border-b border-navy-800 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <UploadCloud className="w-5 h-5 text-brand-purple" />
                  YouTube Publishing & Upload Pipeline
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  How CreatorFlow AI publishes multi-gigabyte videos directly to YouTube using Google&apos;s Resumable Protocol.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-navy-950 border border-navy-800 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-brand-purple/20 text-brand-purple font-bold flex items-center justify-center text-xs">
                    1
                  </div>
                  <h4 className="text-xs font-bold text-white">OAuth Initialization</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Server exchanges channel credentials and opens an isolated Google upload session.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-navy-950 border border-navy-800 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-brand-blue/20 text-brand-blue font-bold flex items-center justify-center text-xs">
                    2
                  </div>
                  <h4 className="text-xs font-bold text-white">Resumable Chunking</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Video transfers in 8MB chunks. If network drops, transfer resumes from exact byte offset.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-navy-950 border border-navy-800 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">
                    3
                  </div>
                  <h4 className="text-xs font-bold text-white">Private Verification</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Uploads start in private visibility. You inspect video quality and ID before releasing.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-navy-950 border border-navy-800 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 font-bold flex items-center justify-center text-xs">
                    4
                  </div>
                  <h4 className="text-xs font-bold text-white">Automated Drop</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Publishing calendar flips visibility to public at your exact peak viewer schedule.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Bottom CTA Card */}
        <Card className="border-brand-purple/30 bg-gradient-to-r from-brand-purple/15 via-navy-900 to-brand-blue/15 p-6 sm:p-8 text-center space-y-4 shadow-glow">
          <h3 className="text-xl sm:text-2xl font-extrabold text-white">
            Ready to Automate Your Real YouTube Channel?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Connect your YouTube channel safely with Google Cloud OAuth, generate viral titles and SEO kits with Gemini AI, and publish videos seamlessly.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/signup">
              <Button size="lg" variant="gradient" className="font-semibold text-xs shadow-glow w-full sm:w-auto">
                Create Free Account
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-xs border-navy-700 bg-navy-900/60 w-full sm:w-auto">
                Sign In to Existing Workspace
              </Button>
            </Link>
          </div>
        </Card>
      </main>
    </div>
  );
}
