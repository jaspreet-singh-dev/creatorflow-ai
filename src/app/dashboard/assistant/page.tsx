"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useData } from "@/context/data-context";
import { useChannel } from "@/context/channel-context";
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
  const { activeChannel } = useChannel();
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
      title: "CAN SWEET BERRIES SAVE ME?! 💀🌿 #minecraft",
      hook: "You are falling from Y=320 with no armor, no totem, and only a single sweet berry bush. Can this tiny block stop lethal damage?",
      format: "shorts" as IdeaFormat,
      outline: [
        "1. Build height drop from Y=320",
        "2. Zero armor, hardcore mode test",
        "3. Frame-by-frame hitbox calculation",
        "4. Survival results & heart gauge reveal",
      ],
      keywords: ["minecraft", "shorts", "clutch", "survival", "minecraft clutch"],
    },
    {
      title: "BED vs HAY BALE vs SLIME… WHO SAVES ME?! 💀 #minecraft",
      hook: "Three iconic clutch blocks in Minecraft, but only ONE works from maximum build height without killing you.",
      format: "shorts" as IdeaFormat,
      outline: [
        "1. Block 1: Hay Bale (80% damage reduction test)",
        "2. Block 2: Slime Block (Bounce timing & lethal miss risk)",
        "3. Block 3: Nether Bed (Explosion vs bounce mechanics)",
        "4. The Ultimate Champion block crowned",
      ],
      keywords: ["minecraft shorts", "bed clutch", "slime clutch", "hay bale test"],
    },
    {
      title: "Can a Hay Bale Save You From ANY Fall in Minecraft? 🌾😱 #shorts",
      hook: "Everyone thinks hay bales eliminate 100% of fall damage in Minecraft. Here is the exact mathematical limit before you die.",
      format: "shorts" as IdeaFormat,
      outline: [
        "1. The myth: Infinite fall height with hay bales",
        "2. Testing drops from 50, 100, 200, and 380 blocks",
        "3. The exact heart threshold where hay bales fail",
        "4. Pro clutch tips to survive higher drops",
      ],
      keywords: ["minecraft myths", "hay bale clutch", "minecraft science", "shorts"],
    },
  ]);

  const [generatedHooks, setGeneratedHooks] = useState([
    {
      hook: "You have exactly 0.4 seconds before hitting bedrock at terminal velocity. Can chorus fruit teleport you before impact?",
      angle: "Extreme Clutch Survival",
      retentionScore: "9.9 / 10",
    },
    {
      hook: "99% of Minecraft players believe powder snow is identical to water buckets. They are completely wrong.",
      angle: "Myth Busting & Shock",
      retentionScore: "9.7 / 10",
    },
    {
      hook: "What happens when you MLG cobweb from the world height limit? Watch the heart counter.",
      angle: "Instant Visual Stakes",
      retentionScore: "9.8 / 10",
    },
  ]);

  const [generatedShorts, setGeneratedShorts] = useState([
    {
      title: "CAN A PIG SAVE ME?! 🐷💀 #minecraft",
      hook: "Can you dismount a pig at the exact tick you hit the ground?",
      concept: "Fast drop from sky, slow-mo dismount tick test, surviving with half a heart.",
      action: "Subscribe to NoVoiceCraft for more impossible clutch experiments.",
    },
    {
      title: "COBWEB vs BERRY BUSH… THE ULTIMATE CLUTCH!",
      hook: "Which block slows your fall faster without dealing tick damage?",
      concept: "Side-by-side split screen timer comparing fall deceleration.",
      action: "Comment which clutch block we test next!",
    },
  ]);

  const [generatedSeries, setGeneratedSeries] = useState([
    {
      seriesTitle: "Minecraft Impossible Clutches & Survival Tests (4-Part Series)",
      episodes: [
        { ep: "Part 1", title: "The Build Limit Drop: Sweet Berries vs Powder Snow", focus: "Deceleration & Tick Mechanics" },
        { ep: "Part 2", title: "Entity Dismount Mechanics: Pig vs Boat vs Minecart", focus: "Hitbox & Fall Reset" },
        { ep: "Part 3", title: "Tick-Perfect Fall Damage Cancellation: Chorus Fruit & Slime", focus: "Teleport Frame Window" },
        { ep: "Part 4", title: "Ultimate 1,000 Block Drop: Which Block Truly Saves You?", focus: "Survival Limit Benchmark" },
      ],
      targetViews: "500,000+ Series Tally",
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
      const mode = activeTab === "hooks" ? "hook" : activeTab === "shorts" ? "shorts" : activeTab === "series" ? "series" : "ideas";
      const res = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, niche, topic, targetAudience }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        let rawData = json.data;
        if (!Array.isArray(rawData) && typeof rawData === "object" && rawData !== null) {
          rawData =
            rawData.ideas ||
            rawData.content_ideas ||
            rawData.hooks ||
            rawData.shorts ||
            rawData.series ||
            rawData.data ||
            rawData.results ||
            Object.values(rawData).find((v) => Array.isArray(v)) ||
            [];
        }

        if (Array.isArray(rawData)) {
          if (mode === "hook") {
            const normalizedHooks = rawData.map((h: any) => ({
              hook: h.hook || h.title || "Captivating Opening Hook",
              angle: h.angle || "Curiosity Gap",
              retentionScore: h.retentionScore || h.retentionRating || "9.5 / 10",
            }));
            setGeneratedHooks(normalizedHooks);
          } else if (mode === "shorts") {
            const normalizedShorts = rawData.map((s: any) => ({
              title: s.title || "High-Impact YouTube Short",
              hook: s.hook || "Wait until you see this...",
              concept: s.concept || s.description || "Visual dynamic breakdown",
              action: s.action || s.callToAction || s.actionPlan || "Subscribe for daily blueprints",
            }));
            setGeneratedShorts(normalizedShorts);
          } else if (mode === "series") {
            const normalizedSeries = rawData.map((ser: any, idx: number) => ({
              seriesTitle: ser.seriesTitle || ser.title || `Masterclass Series Part ${idx + 1}`,
              targetViews: ser.targetViews || "100k+ Target Views",
              episodes: Array.isArray(ser.episodes)
                ? ser.episodes.map((ep: any, eIdx: number) => ({
                    ep: ep.ep || `Part ${eIdx + 1}`,
                    title: ep.title || `Episode ${eIdx + 1}`,
                    focus: ep.focus || "Core Workflow",
                  }))
                : [
                    { ep: "Part 1", title: "Foundation & Architecture", focus: "Core Setup" },
                    { ep: "Part 2", title: "Deep Dive & Execution", focus: "Workflow" },
                  ],
            }));
            setGeneratedSeries(normalizedSeries);
          } else {
            const normalizedIdeas = rawData.map((item: any) => ({
              title: item.title || "Untitled Video Concept",
              hook: item.hook || item.description || "Compelling introductory hook",
              format: (item.format || "long_form") as IdeaFormat,
              outline: Array.isArray(item.outline)
                ? item.outline
                : typeof item.outline === "string"
                ? [item.outline]
                : ["1. Introduction & Hook", "2. Core Framework Breakdown", "3. Implementation & Results"],
              keywords: Array.isArray(item.keywords)
                ? item.keywords
                : Array.isArray(item.suggested_keywords)
                ? item.suggested_keywords
                : [niche.toLowerCase(), "tutorial", "guide"],
            }));
            setGeneratedIdeas(normalizedIdeas);
          }
          toast.success("Ideas Generated", "Refreshed content concepts for your channel niche.");
        } else {
          toast.error("Format Notice", "Could not parse ideas into list format.");
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Generation Issue", "Could not contact ideation engine.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscoverChannelIdeas = async () => {
    const quota = checkQuota("ai");
    if (!quota.allowed) {
      toast.error("AI Quota Exceeded", "Monthly generation limit reached.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/ai/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          niche: niche || activeChannel?.title || "Minecraft & Gaming",
          channelTitle: activeChannel?.title,
          subscriberCount: activeChannel?.subscriber_count,
          targetAudience,
          preferredFormat: "Shorts & Gaming Experiments",
        }),
      });

      const json = await res.json();
      if (json.success && Array.isArray(json.ideas) && json.ideas.length > 0) {
        const normalized = json.ideas.map((item: any) => ({
          title: item.suggestedTitle || item.title || item.concept,
          hook: item.hook || item.concept,
          format: "long_form" as IdeaFormat,
          outline: Array.isArray(item.contentOutline) ? item.contentOutline : ["1. Intro", "2. Core Framework", "3. Action Plan"],
          keywords: Array.isArray(item.secondaryKeywords) ? item.secondaryKeywords : [niche.toLowerCase(), "tutorial"],
          whyRelevant: item.whyRelevant,
          thumbnailIdea: item.thumbnailConcept?.textSuggestion,
        }));
        setGeneratedIdeas(normalized);
        setActiveTab("ideas");
        toast.success("Channel Ideas Discovered", `Formulated ${normalized.length} channel-aligned ideas.`);
      } else {
        toast.error("Discovery Notice", json.error || "Could not retrieve channel ideas.");
      }
    } catch (e: any) {
      toast.error("Connection Error", e?.message || "Failed to reach AI discovery server.");
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

  const filteredSavedIdeas = Array.isArray(ideas)
    ? ideas.filter((i) => {
        if (!savedSearchQuery.trim()) return true;
        const q = savedSearchQuery.toLowerCase();
        return (
          (i.title || "").toLowerCase().includes(q) ||
          (i.hook || "").toLowerCase().includes(q) ||
          (i.niche || "").toLowerCase().includes(q)
        );
      })
    : [];

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

          <div className="flex items-center gap-2.5 flex-wrap">
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
              variant="outline"
              size="sm"
              onClick={handleDiscoverChannelIdeas}
              disabled={isLoading}
              className="text-xs border-navy-700 bg-navy-900/60 text-slate-200 hover:text-white"
              title="Tailor ideas using connected channel niche and topics"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-brand-purple" />
              Discover Channel Ideas
            </Button>
            <Button
              variant="gradient"
              size="sm"
              onClick={handleGenerate}
              isLoading={isLoading}
              className="text-xs font-semibold shadow-glow"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Generate Concepts
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
                placeholder="e.g. Minecraft & Gaming"
                className="text-xs h-9"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300">Target Angle / Topic</label>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. CAN WATER CAULDRON SAVE ME?! or Survival Clutches"
                className="text-xs h-9"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300">Target Audience</label>
              <Input
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="e.g. Minecraft players & Shorts viewers"
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
            {Array.isArray(generatedIdeas) && generatedIdeas.map((idea, idx) => (
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
                      {Array.isArray(idea.outline) && idea.outline.map((step, i) => (
                        <li key={i} className="truncate">
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {Array.isArray(idea.keywords) && idea.keywords.map((kw, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded bg-navy-950 border border-navy-800 text-slate-400"
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>
                </CardContent>

                <CardFooter className="p-5 pt-3 border-t border-navy-800/80 flex flex-wrap justify-between items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSaveIdea(idea, "long_form")}
                    className="text-xs h-8 border-navy-700 hover:bg-navy-800"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5 mr-1.5 text-brand-purple" />
                    Save Idea
                  </Button>
                  <Link href={`/dashboard/create?topic=${encodeURIComponent(idea.title)}&package=true`}>
                    <Button variant="gradient" size="sm" className="text-xs h-8 font-semibold shadow-glow">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Complete Package
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
            {Array.isArray(generatedHooks) && generatedHooks.map((h, idx) => (
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
            {Array.isArray(generatedShorts) && generatedShorts.map((short, idx) => (
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
            {Array.isArray(generatedSeries) && generatedSeries.map((ser, idx) => (
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
                  {Array.isArray(ser.episodes) && ser.episodes.map((ep, i) => (
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
                    onClick={() => handleSaveIdea({ title: ser.seriesTitle, hook: "Multi-part playlist cluster", outline: Array.isArray(ser.episodes) ? ser.episodes.map(e => `${e.ep}: ${e.title}`) : [] }, "series")}
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
              {Array.isArray(filteredSavedIdeas) && filteredSavedIdeas.map((idea) => (
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
