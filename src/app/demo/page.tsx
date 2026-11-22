"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  Sparkles,
  Play,
  Pause,
  RotateCcw,
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
  Sliders,
  Layers,
  Film,
  Smartphone,
  ChevronRight,
  Zap,
} from "lucide-react";

interface Chapter {
  id: number;
  title: string;
  badge: string;
  duration: string;
  desc: string;
  highlight: string;
}

const WALKTHROUGH_CHAPTERS: Chapter[] = [
  {
    id: 1,
    title: "1. AI Concept & Viral Hook Discovery",
    badge: "Ideation",
    duration: "0:00 - 0:15",
    desc: "AI identifies high-retention gaming concepts and ranks titles out of 10",
    highlight: "Gemini 2.5 Flash analyzes YouTube Shorts trends and scores psychological CTR appeal",
  },
  {
    id: 2,
    title: "2. Fast-Paced Shorts Script Studio",
    badge: "Scriptwriting",
    duration: "0:15 - 0:30",
    desc: "3-second pattern interrupts, retention beats, and sound design cues",
    highlight: "Generates teleprompter timing [SFX: Slow-mo heartbeat] to maximize average watch time",
  },
  {
    id: 3,
    title: "3. Thumbnail Studio & YouTube Feed Simulator",
    badge: "High-CTR Visuals",
    duration: "0:30 - 0:45",
    desc: "A/B test thumbnail concepts against real competing YouTube videos",
    highlight: "Visual feed simulator previews your video title and thumbnail inside the live Shorts shelf",
  },
  {
    id: 4,
    title: "4. 1-Click Publishing & Resumable Direct Upload",
    badge: "Publishing",
    duration: "0:45 - 1:00",
    desc: "Official YouTube Data API v3 binary transfer with complete SEO tags",
    highlight: "Resumable chunked upload sends video, auto-generated description, tags, and timestamps",
  },
];

export default function DemoExperiencePage() {
  const [activeTab, setActiveTab] = useState<"project" | "analytics" | "publishing">("project");
  
  // Interactive Video Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [playbackSeconds, setPlaybackSeconds] = useState(0);

  // Playback timer (60 seconds total, 15 seconds per chapter)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setPlaybackSeconds((prev) => {
          if (prev >= 60) {
            setIsPlaying(false);
            return 60;
          }
          const next = prev + 1;
          const chapterIdx = Math.min(Math.floor(next / 15), 3);
          setCurrentChapterIndex(chapterIdx);
          return next;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);

  const handleSeekChapter = (idx: number) => {
    setCurrentChapterIndex(idx);
    setPlaybackSeconds(idx * 15);
  };

  const handleRestart = () => {
    setPlaybackSeconds(0);
    setCurrentChapterIndex(0);
    setIsPlaying(true);
  };

  const activeChapter = WALKTHROUGH_CHAPTERS[currentChapterIndex];

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col selection:bg-brand-purple/30">
      {/* Top Banner: Explicit Sample Experience Disclaimer */}
      <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2.5 text-xs text-amber-500 dark:text-amber-300 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0 text-amber-500" />
          <span>
            <strong>DEMO SHOWCASE:</strong> This is an interactive sample walkthrough with dummy channel <strong>CraftVortex Gaming (@craftvortex)</strong>. All data below is illustrative demonstration data.
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
                Product Tour
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
            Video Walkthrough
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
            Publishing Pipeline
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
        {/* TAB 1: INTERACTIVE PRODUCT WALKTHROUGH VIDEO */}
        {activeTab === "project" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* CHAPTER NAVIGATION BAR */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              {WALKTHROUGH_CHAPTERS.map((chap, idx) => {
                const isCurrent = currentChapterIndex === idx;
                const isPassed = playbackSeconds >= (idx + 1) * 15;
                return (
                  <button
                    key={chap.id}
                    onClick={() => handleSeekChapter(idx)}
                    className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden ${
                      isCurrent
                        ? "border-brand-purple bg-brand-purple/15 shadow-glow"
                        : "border-navy-800 bg-navy-900/90 hover:border-navy-700"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className={`font-mono ${isCurrent ? "text-purple-300 font-bold" : "text-slate-400"}`}>
                        {chap.duration}
                      </span>
                      <Badge
                        variant={isCurrent ? "default" : "outline"}
                        className="text-[9px] px-1.5 py-0"
                      >
                        {chap.badge}
                      </Badge>
                    </div>
                    <p className="text-xs font-bold text-white truncate">{chap.title}</p>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{chap.desc}</p>
                    {isCurrent && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-purple">
                        <div
                          className="h-full bg-white transition-all duration-300"
                          style={{
                            width: `${Math.min(100, Math.max(0, ((playbackSeconds - idx * 15) / 15) * 100))}%`,
                          }}
                        />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Video Player & Walkthrough Showcase */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Interactive Player Screen (2 Cols) */}
              <div className="lg:col-span-2 space-y-4">
                <Card className="border-navy-800 bg-navy-900/90 overflow-hidden shadow-card">
                  {/* The Simulated Video Screen */}
                  <div className="relative aspect-video bg-black flex flex-col justify-between overflow-hidden border-b border-navy-800">
                    {/* Top Player HUD Overlay */}
                    <div className="p-3 bg-gradient-to-b from-black/90 to-transparent flex items-center justify-between text-xs z-20">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="font-bold text-white tracking-wide uppercase text-[11px]">
                          HOW CREATORFLOW AI WORKS
                        </span>
                        <span className="text-slate-400 text-[10px] hidden sm:inline">
                          • {activeChapter.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="default" className="text-[10px] bg-brand-purple/40 border-purple-500/50">
                          Interactive Tour
                        </Badge>
                        <span className="text-[11px] font-mono text-purple-300 bg-black/60 px-2 py-0.5 rounded border border-white/10">
                          {Math.floor(playbackSeconds / 60)}:{String(playbackSeconds % 60).padStart(2, "0")} / 1:00
                        </span>
                      </div>
                    </div>

                    {/* DYNAMIC SCENE DISPLAY ACCORDING TO CHAPTER */}
                    <div className="flex-1 flex items-center justify-center p-4 relative z-10">
                      {/* Chapter 1: AI Ideation Scene */}
                      {currentChapterIndex === 0 && (
                        <div className="w-full max-w-lg space-y-3 p-4 rounded-xl bg-navy-950/90 border border-brand-purple/40 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
                          <div className="flex items-center justify-between text-xs border-b border-navy-800 pb-2">
                            <span className="font-bold text-purple-300 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5" />
                              AI Concept & Idea Discovery
                            </span>
                            <Badge variant="success" className="text-[10px]">Gaming & Minecraft Niche</Badge>
                          </div>
                          <div className="space-y-2">
                            <div className="p-2.5 rounded-lg bg-navy-900 border border-navy-800 text-xs flex items-center justify-between">
                              <span className="font-semibold text-white">CAN WATER CAULDRON SAVE ME FROM 1000 BLOCKS?! 💀</span>
                              <Badge variant="success" className="text-[10px] font-bold">Score: 9.8 / 10</Badge>
                            </div>
                            <div className="p-2.5 rounded-lg bg-navy-900/60 border border-navy-800 text-xs flex items-center justify-between text-slate-300">
                              <span>I TESTED EVERY CLUTCH BLOCK AT Y=320… THIS HAPPENED 😱</span>
                              <Badge variant="secondary" className="text-[10px]">Score: 9.6 / 10</Badge>
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-400 italic">
                            💡 Retention Engine: &quot;Tick-frame impact creates an immediate 3s curiosity loop.&quot;
                          </p>
                        </div>
                      )}

                      {/* Chapter 2: Script Studio Scene */}
                      {currentChapterIndex === 1 && (
                        <div className="w-full max-w-lg space-y-3 p-4 rounded-xl bg-navy-950/90 border border-blue-500/40 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
                          <div className="flex items-center justify-between text-xs border-b border-navy-800 pb-2">
                            <span className="font-bold text-blue-300 flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5" />
                              Fast-Paced Shorts Script Studio
                            </span>
                            <Badge variant="blue" className="text-[10px]">Retention Hook</Badge>
                          </div>
                          <div className="space-y-1.5 text-xs font-mono text-slate-300">
                            <p className="p-2 rounded bg-purple-950/40 border border-purple-800/40 text-purple-200">
                              <strong className="text-amber-400">[00:00 - 00:03 HOOK]</strong> Dropping from world limit with NO armor. If I miss this cauldron, my hardcore world is gone!
                            </p>
                            <p className="p-2 rounded bg-navy-900 border border-navy-800 text-slate-300">
                              <strong className="text-blue-400">[00:04 - 00:10 BODY]</strong> [SFX: Whoosh] Hitbox test: in Bedrock, you only survive if you land on water, not the rim!
                            </p>
                            <p className="p-2 rounded bg-emerald-950/40 border border-emerald-800/40 text-emerald-200">
                              <strong className="text-emerald-400">[00:11 - 00:15 CLIMAX]</strong> Impact in 3, 2, 1... [SFX: Splash] SURVIVED WITH HALF A HEART!
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Chapter 3: Thumbnail Studio Scene */}
                      {currentChapterIndex === 2 && (
                        <div className="w-full max-w-lg p-4 rounded-xl bg-navy-950/90 border border-amber-500/40 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
                          <div className="flex items-center justify-between text-xs border-b border-navy-800 pb-2 mb-3">
                            <span className="font-bold text-amber-300 flex items-center gap-1.5">
                              <Smartphone className="w-3.5 h-3.5" />
                              Live YouTube Feed Simulator
                            </span>
                            <Badge variant="warning" className="text-[10px]">CTR: 14.8% Est.</Badge>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="w-28 aspect-[9/16] rounded-lg bg-black border-2 border-brand-purple overflow-hidden relative shadow-glow shrink-0 flex flex-col justify-between p-2">
                              <div className="w-full h-full absolute inset-0 bg-gradient-to-t from-black via-transparent to-red-950/40 pointer-events-none" />
                              <Badge variant="destructive" className="text-[8px] z-10 self-start">9:16 SHORTS</Badge>
                              <div className="z-10 text-center">
                                <p className="font-black text-amber-300 text-xs tracking-tighter drop-shadow-md">IMPOSSIBLE CLUTCH?!</p>
                                <p className="text-[8px] text-white">💀 1000 BLOCKS</p>
                              </div>
                            </div>
                            <div className="space-y-2 text-xs">
                              <p className="font-semibold text-white">Algorithm Feed Benchmark:</p>
                              <ul className="text-[11px] text-slate-300 space-y-1">
                                <li>✓ High-contrast yellow headline text</li>
                                <li>✓ Half-heart HUD emergency visual</li>
                                <li>✓ Predicted in Top 5% gaming shelf CTR</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Chapter 4: 1-Click Publishing Scene */}
                      {currentChapterIndex === 3 && (
                        <div className="w-full max-w-lg p-4 rounded-xl bg-navy-950/90 border border-emerald-500/40 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200 space-y-3">
                          <div className="flex items-center justify-between text-xs border-b border-navy-800 pb-2">
                            <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                              <UploadCloud className="w-3.5 h-3.5" />
                              Resumable YouTube Upload
                            </span>
                            <Badge variant="success" className="text-[10px]">100% Uploaded</Badge>
                          </div>
                          <div className="space-y-1.5 text-xs">
                            <div className="flex justify-between text-slate-300">
                              <span>Target: <strong>CraftVortex Gaming (@craftvortex)</strong></span>
                              <span className="text-emerald-400 font-mono">Status: Ready</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-navy-900 overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-brand-purple to-emerald-400 rounded-full w-full" />
                            </div>
                            <p className="text-[11px] text-slate-400">
                              Generated SEO: Complete title, description, timestamps & 10 high-ranking tags applied.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Video Controls Scrubber */}
                    <div className="p-3 bg-gradient-to-t from-black/95 to-transparent flex flex-col gap-2 z-20">
                      {/* Timeline Scrubber */}
                      <div className="relative w-full h-1.5 bg-navy-800 rounded-full cursor-pointer group">
                        <div
                          className="h-full bg-gradient-to-r from-brand-purple to-brand-blue rounded-full relative"
                          style={{ width: `${(playbackSeconds / 60) * 100}%` }}
                        >
                          <div className="w-3 h-3 rounded-full bg-white shadow-glow absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>

                      {/* Control Buttons */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="p-1.5 rounded-lg bg-brand-purple hover:bg-brand-purple/80 text-white transition-all shadow-glow"
                            aria-label={isPlaying ? "Pause tour" : "Play tour"}
                          >
                            {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 ml-0.5 fill-white" />}
                          </button>
                          <button
                            onClick={handleRestart}
                            className="p-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-300 hover:text-white transition-colors"
                            aria-label="Restart tour"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                          <span className="text-xs font-mono text-slate-300 ml-1">
                            {Math.floor(playbackSeconds / 60)}:{String(playbackSeconds % 60).padStart(2, "0")} / 1:00
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link href="/dashboard">
                            <Button size="sm" variant="gradient" className="h-7 text-xs font-semibold px-3 shadow-glow">
                              Try Sandbox Live
                              <ChevronRight className="w-3.5 h-3.5 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Active Chapter Details */}
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="blue" className="text-[10px]">
                        AI Studio
                      </Badge>
                      <Badge variant="success" className="text-[10px]">
                        {activeChapter.badge}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px]">
                        Demo Showcase
                      </Badge>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
                      CAN SWEET BERRIES SAVE ME FROM MAXIMUM BUILD LIMIT?! 💀🌿 #minecraft
                    </h2>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Channel: <strong className="text-slate-700 dark:text-slate-200">@craftvortex (CraftVortex Gaming Showcase)</strong> • Sample Performance: 55,032 views • 61.8h Watch Time
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

🎮 Channel: @craftvortex
🔔 Subscribe for daily insane Minecraft clutch challenges!

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
                      &quot;Can a water cauldron break a 1000-block fall in Minecraft Bedrock? Let&apos;s test the tick hitboxes before my world is gone...&quot;
                    </p>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Click-Through Likelihood:</span>
                      <span className="font-bold text-emerald-400">High (14.8% Est.)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Audience Alignment:</span>
                      <span className="font-bold text-white">Minecraft & Gaming Viewers</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Optimal Publish Window:</span>
                      <span className="font-bold text-brand-blue">Friday, 5:30 PM IST</span>
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
                    When you connect your channel:
                  </h4>
                  <ul className="text-xs text-slate-400 space-y-2">
                    <li>• Official Google Cloud OAuth 2.0 with zero token sharing.</li>
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
                  <strong>SAMPLE REPORTING:</strong> The figures below represent an illustrative sample channel dashboard for <strong>CraftVortex Gaming</strong>. Real accounts receive live YouTube Data API v3 and YouTube Analytics reports.
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
                <span className="text-[11px] text-purple-400">24.8K Total Subscribers</span>
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
