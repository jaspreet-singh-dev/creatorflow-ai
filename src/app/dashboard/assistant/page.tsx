"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useData } from "@/context/data-context";
import { useToast } from "@/components/ui/toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import {
  Lightbulb,
  Sparkles,
  Flame,
  FileText,
  Layers,
  Smartphone,
  BookmarkPlus,
  Check,
  ArrowRight,
  TrendingUp,
  Tag,
  Copy,
  Plus,
  Trash2,
  Video,
  ExternalLink,
  BookOpen,
} from "lucide-react";
import { ContentIdea, IdeaFormat, IdeaStatus } from "@/types/database.types";
import Link from "next/link";

export default function ContentAssistantPage() {
  const { ideas, addIdea, updateIdeaStatus, deleteIdea, convertIdeaToVideo, checkQuota } = useData();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"ideas" | "hooks" | "shorts" | "series">("ideas");
  const [niche, setNiche] = useState("AI & Software Engineering");
  const [topic, setTopic] = useState("Building Autonomous Agents");
  const [targetAudience, setTargetAudience] = useState("Developers & Tech Founders");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);
  const [savedSearchQuery, setSavedSearchQuery] = useState("");

  // Dynamic ideas state
  const [generatedIdeas, setGeneratedIdeas] = useState([
    {
      title: "How I Built an Autonomous AI Agent in 24 Hours (Full Architecture)",
      hook: "What if an AI could read your bug reports, write the patch, and submit the pull request while you sleep?",
      format: "long_form" as IdeaFormat,
      outline: [
        "1. Real-world problem: Manual bug fixing takes 40% of dev time",
        "2. Architecture diagram: Tool routing, vector context & LLM orchestrator",
        "3. Live coding: Building the agent loop in TypeScript",
        "4. Stress test: Running the agent against a broken open-source repo",
        "5. Safety guardrails & production deployment checklist",
      ],
      keywords: ["ai agent tutorial", "autonomous coding", "gemini pro", "typescript ai"],
    },
    {
      title: "10 Mind-Blowing AI Developer Tools You Need to Try in 2026",
      hook: "Most developers are using AI for simple autocompletion. Here are 10 tools that actually change your entire workflow.",
      format: "long_form" as IdeaFormat,
      outline: [
        "1. Tool 1-3: Next-gen AI terminals and terminal assistants",
        "2. Tool 4-6: Visual design to full-stack code generators",
        "3. Tool 7-10: Autonomous code review & synthetic test generators",
        "4. Summary and tool comparison matrix",
      ],
      keywords: ["developer tools 2026", "best ai tools", "productivity hacks"],
    },
    {
      title: "Why 90% of AI SaaS Startups Will Fail by the End of 2026",
      hook: "If your startup is just a thin wrapper around an API call, you don't have a moat — you have a temporary feature.",
      format: "long_form" as IdeaFormat,
      outline: [
        "1. The API wrapper trap: Why commodity wrappers get crushed",
        "2. Real moats: Proprietary data loops, workflow lock-in & UX depth",
        "3. Case study: 2 startups with identical tech, opposite outcomes",
        "4. How to build defensible AI software in 2026",
      ],
      keywords: ["ai saas", "startup strategy", "tech business", "building in public"],
    },
  ]);

  const [generatedHooks, setGeneratedHooks] = useState([
    {
      hook: "If you lose 40% of viewers in the first 30 seconds, YouTube will stop recommending your video. Here are 3 visual pattern interrupts that doubled my retention.",
      angle: "Curiosity & Loss Aversion",
      retentionScore: "9.7 / 10",
    },
    {
      hook: "What if you could turn any Figma design into a responsive React component just by dropping a screenshot? Let me show you how in 60 seconds.",
      angle: "Immediate High Value Payoff",
      retentionScore: "9.4 / 10",
    },
    {
      hook: "Everyone tells you to upload 3 times a week to grow on YouTube. In 2026, that advice will actually kill your channel.",
      angle: "Contrarian Myth Buster",
      retentionScore: "9.6 / 10",
    },
  ]);

  const [generatedShorts, setGeneratedShorts] = useState([
    {
      title: "The 3-Second Rule That Fixes Dead Videos",
      hook: "Stop starting your videos with 'Hey guys, welcome back!'",
      concept: "Visual timer graphic + audio cut. Show how cutting intro banter increased viewer retention by 38%.",
      action: "Tell viewers to check pinned comment for the full retention template.",
    },
    {
      title: "This AI Secret Codes 10x Faster",
      hook: "90% of developers use prompt engineering wrong.",
      concept: "Split screen showing prompt with system instructions vs naive prompt. Side-by-side speed comparison.",
      action: "Save this video for your next coding sprint.",
    },
  ]);

  const [generatedSeries, setGeneratedSeries] = useState([
    {
      seriesTitle: "The Full-Stack AI SaaS Masterclass (4-Part Series)",
      episodes: [
        { ep: "Part 1", title: "Architecture & Database: Supabase + Vector Embeddings", focus: "Database Schema & Auth" },
        { ep: "Part 2", title: "The Agent Core: Next.js 15 Server Actions & Gemini API", focus: "LLM Pipeline & Streaming" },
        { ep: "Part 3", title: "Resumable YouTube API v3 Video Uploader", focus: "Google OAuth 2.0 & Cloud Run" },
        { ep: "Part 4", title: "Monetization & Scale: Subscriptions & Production Launch", focus: "Stripe & Rate Limiting" },
      ],
      targetViews: "150,000+ Series Tally",
    },
  ]);

  const handleGenerate = async () => {
    const quota = checkQuota("ai");
    if (!quota.allowed) {
      toast.error(
        "AI Quota Exceeded",
        `You have used your ${quota.max} monthly generations. Upgrade your plan to unlock more.`
      );
      return;
    }

    setIsLoading(true);
    try {
      const mode = activeTab === "hooks" ? "hook" : activeTab === "shorts" ? "shorts" : "ideas";
      const res = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, niche, topic, targetAudience }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        if (mode === "hook") {
          setGeneratedHooks(json.data);
        } else if (mode === "shorts") {
          setGeneratedShorts(json.data);
        } else {
          setGeneratedIdeas(json.data);
        }
        toast.success("Ideas Generated", "Refreshed content concepts for your channel niche.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Generation Issue", "Could not contact ideation engine.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveIdea = (idea: any, formatType: IdeaFormat = "long_form") => {
    addIdea({
      niche,
      title: idea.title || idea.hook,
      hook: idea.hook || idea.title,
      outline: idea.outline || [],
      format: formatType,
      status: "saved",
      suggested_keywords: idea.keywords || [],
    });
  };

  const handleConvertToVideo = (ideaId: string) => {
    convertIdeaToVideo(ideaId);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    toast.success("Copied", "Copied to clipboard.");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const filteredSavedIdeas = ideas.filter((i) => {
    if (!savedSearchQuery.trim()) return true;
    const q = savedSearchQuery.toLowerCase();
    return i.title.toLowerCase().includes(q) || i.hook.toLowerCase().includes(q) || i.niche.toLowerCase().includes(q);
  });

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                AI Content Assistant
              </h1>
              <Badge variant="default" className="text-[10px] font-bold uppercase tracking-wider">
                Ideation Engine
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Brainstorm viral video concepts, retention hooks, script outlines, and YouTube Shorts frameworks.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSavedDrawerOpen(true)}
              className="text-xs border-navy-700 bg-navy-900/60"
            >
              <BookmarkPlus className="w-3.5 h-3.5 mr-1.5 text-brand-purple" />
              Saved Ideas ({ideas.length})
            </Button>
            <Button
              variant="gradient"
              size="sm"
              onClick={handleGenerate}
              isLoading={isLoading}
              className="text-xs font-semibold shadow-glow"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Generate Content Ideas
            </Button>
          </div>
        </div>

        {/* Input Parameters Bar */}
        <Card className="border-navy-800 bg-navy-900/90 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300">Channel Niche</label>
              <Input
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                placeholder="e.g. AI & Tech"
                className="text-xs h-9"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300">Target Angle / Topic</label>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Next.js 15 or Autonomous Agents"
                className="text-xs h-9"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300">Target Audience</label>
              <Input
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="e.g. Developers & Creators"
                className="text-xs h-9"
              />
            </div>
          </div>
        </Card>

        {/* Studio Tabs */}
        <div className="flex items-center gap-2 border-b border-navy-800 pb-3 flex-wrap">
          <button
            onClick={() => setActiveTab("ideas")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === "ideas"
                ? "bg-navy-800 text-white border border-navy-700 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5 text-brand-purple" />
            <span>Long-Form Concepts</span>
          </button>
          <button
            onClick={() => setActiveTab("hooks")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === "hooks"
                ? "bg-navy-800 text-white border border-navy-700 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Retention Hooks</span>
          </button>
          <button
            onClick={() => setActiveTab("shorts")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === "shorts"
                ? "bg-navy-800 text-white border border-navy-700 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-brand-blue" />
            <span>Shorts & Reels</span>
          </button>
          <button
            onClick={() => setActiveTab("series")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === "series"
                ? "bg-navy-800 text-white border border-navy-700 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span>Series & Playlist Architect</span>
          </button>
        </div>

        {/* Tab 1: Video Ideas & Outlines */}
        {activeTab === "ideas" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {generatedIdeas.map((idea, idx) => (
              <Card
                key={idx}
                className="border-navy-800 bg-navy-900/80 flex flex-col justify-between hover:border-brand-purple/40 transition-all shadow-card"
              >
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <Badge variant="blue" className="text-[10px]">
                      High Virality Potential
                    </Badge>
                    <button
                      onClick={() => handleCopy(idea.title, `idea-${idx}`)}
                      className="text-slate-400 hover:text-white"
                      title="Copy title"
                    >
                      {copiedIndex === `idea-${idx}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <CardTitle className="text-sm font-bold text-white leading-snug">
                    {idea.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-5 pt-0 space-y-3.5 text-xs">
                  <div className="p-2.5 rounded-lg bg-navy-950 border border-navy-800/80 text-slate-300">
                    <span className="text-[10px] uppercase font-bold text-brand-purple block mb-1">
                      Opening Hook:
                    </span>
                    &quot;{idea.hook}&quot;
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                      Script Outline:
                    </span>
                    <ul className="space-y-1 text-slate-300">
                      {idea.outline.map((step, i) => (
                        <li key={i} className="truncate">
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {idea.keywords.map((kw, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded bg-navy-950 border border-navy-800 text-slate-400"
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>
                </CardContent>

                <CardFooter className="p-5 pt-3 border-t border-navy-800/80 flex justify-between items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSaveIdea(idea, "long_form")}
                    className="text-xs h-8 border-navy-700 hover:bg-navy-800"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5 mr-1.5 text-brand-purple" />
                    Save Idea
                  </Button>
                  <Link href={`/dashboard/metadata`}>
                    <Button variant="ghost" size="sm" className="text-xs h-8 text-brand-purple hover:text-white">
                      <span>Create Metadata</span>
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Tab 2: Retention Hooks */}
        {activeTab === "hooks" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {generatedHooks.map((h, idx) => (
              <Card key={idx} className="border-navy-800 bg-navy-900/80 p-5 space-y-4 shadow-card flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="warning" className="text-[10px]">
                      {h.angle}
                    </Badge>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      Score: {h.retentionScore}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-white leading-relaxed">&quot;{h.hook}&quot;</p>
                </div>
                <div className="pt-3 border-t border-navy-800/80 flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(h.hook, `hook-${idx}`)}
                    className="text-xs h-7 border-navy-700"
                  >
                    {copiedIndex === `hook-${idx}` ? (
                      <>
                        <Check className="w-3 h-3 mr-1 text-emerald-400" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 mr-1" /> Copy Hook
                      </>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSaveIdea({ title: `Hook: ${h.hook.slice(0, 40)}...`, hook: h.hook }, "short_form")}
                    className="text-xs h-7 text-brand-purple"
                  >
                    <BookmarkPlus className="w-3 h-3 mr-1" /> Save
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Tab 3: Shorts & Reels */}
        {activeTab === "shorts" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {generatedShorts.map((short, idx) => (
              <Card key={idx} className="border-navy-800 bg-navy-900/80 p-5 space-y-3.5 shadow-card">
                <div className="flex items-center justify-between">
                  <Badge variant="blue" className="text-[10px]">
                    YouTube Shorts Framework
                  </Badge>
                  <button
                    onClick={() => handleCopy(short.hook, `short-${idx}`)}
                    className="text-slate-400 hover:text-white"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h4 className="text-sm font-bold text-white">{short.title}</h4>
                <div className="p-3 rounded-lg bg-navy-950 border border-navy-800 text-xs text-amber-300 font-medium">
                  ⚡ Hook: &quot;{short.hook}&quot;
                </div>
                <div className="text-xs text-slate-300 space-y-1">
                  <p>
                    <strong className="text-white">Visual Blueprint:</strong> {short.concept}
                  </p>
                  <p>
                    <strong className="text-white">Call to Action:</strong> {short.action}
                  </p>
                </div>
                <div className="pt-2 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSaveIdea(short, "short_form")}
                    className="text-xs h-7 border-navy-700"
                  >
                    <BookmarkPlus className="w-3 h-3 mr-1 text-brand-purple" /> Save Short
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Tab 4: Series Architect */}
        {activeTab === "series" && (
          <div className="space-y-4">
            {generatedSeries.map((ser, idx) => (
              <Card key={idx} className="border-navy-800 bg-navy-900/80 p-6 space-y-4 shadow-card">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-navy-800 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-white">{ser.seriesTitle}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Bingeable multi-part content cluster</p>
                  </div>
                  <Badge variant="default" className="text-xs">
                    {ser.targetViews}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {ser.episodes.map((ep, i) => (
                    <div key={i} className="p-3.5 rounded-xl border border-navy-800 bg-navy-950/70 space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="blue" className="text-[10px]">
                          {ep.ep}
                        </Badge>
                        <span className="text-[10px] text-slate-500 font-mono">Episode {i + 1}</span>
                      </div>
                      <h4 className="text-xs font-bold text-white leading-snug">{ep.title}</h4>
                      <p className="text-[11px] text-slate-400">Core Focus: {ep.focus}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    variant="gradient"
                    size="sm"
                    onClick={() => handleSaveIdea({ title: ser.seriesTitle, hook: "Multi-part playlist cluster", outline: ser.episodes.map(e => `${e.ep}: ${e.title}`) }, "series")}
                    className="text-xs font-semibold"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5 mr-1" />
                    Save Full Series to Idea Bank
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Saved Ideas Modal / Repository */}
      <Modal
        isOpen={isSavedDrawerOpen}
        onClose={() => setIsSavedDrawerOpen(false)}
        title="Saved Content Ideas Bank"
        description="Review, filter, or convert your saved ideas directly into video production drafts."
        maxWidth="3xl"
      >
        <div className="space-y-4">
          <Input
            value={savedSearchQuery}
            onChange={(e) => setSavedSearchQuery(e.target.value)}
            placeholder="Search saved ideas by keyword or niche..."
            className="text-xs"
          />

          {filteredSavedIdeas.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <BookmarkPlus className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-semibold">No saved ideas found</p>
              <p className="text-xs text-slate-500 mt-1">
                Save ideas from the generator tabs above to build your creator library.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredSavedIdeas.map((idea) => (
                <div
                  key={idea.id}
                  className="p-3.5 rounded-xl border border-navy-800 bg-navy-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-navy-700 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-white truncate">{idea.title}</span>
                      <Badge variant="secondary" className="text-[10px] uppercase">
                        {idea.format}
                      </Badge>
                      <Badge
                        variant={idea.status === "in_progress" ? "default" : "outline"}
                        className="text-[10px] capitalize"
                      >
                        {idea.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">Hook: &quot;{idea.hook}&quot;</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="gradient"
                      size="sm"
                      onClick={() => handleConvertToVideo(idea.id)}
                      className="text-xs h-7 font-semibold"
                    >
                      <Video className="w-3 h-3 mr-1" />
                      Convert to Video
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteIdea(idea.id)}
                      className="h-7 w-7 text-slate-400 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </DashboardLayout>
  );
}
