"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Modal } from "@/components/ui/modal";
import {
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Save,
  Tag,
  Hash,
  MessageSquare,
  ListOrdered,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  Info,
  Layers,
  Download,
  FileText,
  FileCode,
  History,
  PlusCircle,
  Radio,
  ExternalLink,
} from "lucide-react";
import { GeneratedMetadataOutput } from "@/lib/ai/gemini";
import { useData, SavedMetadataRecord } from "@/context/data-context";
import { useToast } from "@/components/ui/toast";
import Link from "next/link";

export default function MetadataStudioPage() {
  const {
    videos,
    addVideo,
    applyMetadataToVideo,
    saveMetadataRecord,
    metadataRecords,
    checkQuota,
  } = useData();
  const { toast } = useToast();

  // Input Form States
  const [topic, setTopic] = useState("How to Automate YouTube Uploads using AI & Next.js");
  const [transcript, setTranscript] = useState(
    "In this video we will discuss how to connect to YouTube Data API v3, how to authenticate with Google OAuth 2.0, generate metadata using Gemini AI, and schedule videos directly to YouTube from a Next.js app."
  );
  const [niche, setNiche] = useState("Tech & Web Development");
  const [targetAudience, setTargetAudience] = useState("Full Stack Developers and Content Creators");
  const [primaryKeyword, setPrimaryKeyword] = useState("YouTube Automation Next.js");
  const [secondaryKeywords, setSecondaryKeywords] = useState("gemini ai, youtube api, nextjs 15, oauth 2.0");
  const [preferredTone, setPreferredTone] = useState("Engaging & Authoritative");
  const [language, setLanguage] = useState("English");

  // Associated Video
  const [selectedVideoId, setSelectedVideoId] = useState<string>("create_new");
  const [selectedTitleIndex, setSelectedTitleIndex] = useState<number>(0);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Generated Output state
  const [metadata, setMetadata] = useState<GeneratedMetadataOutput>({
    titles: [
      "I Automated My YouTube Channel with Next.js & AI (Full Code)",
      "How to Build a YouTube Automation App with Gemini AI in 2026",
      "Stop Uploading Manually: YouTube Data API + Next.js Tutorial",
      "The Ultimate Guide to YouTube API v3 Automation in Next.js",
      "How I Publish Videos Automatically Using Next.js and Google OAuth",
    ],
    description:
      "Learn how to build a production YouTube automation workspace from scratch using Next.js, Supabase, Google OAuth 2.0, and Gemini AI.\n\nIn this complete video tutorial, we cover:\n• Setting up Google Cloud Console credentials for YouTube Data API v3\n• Generating SEO-rich titles, descriptions, and tags with Gemini AI\n• Handling resumable chunked video uploads with OAuth 2.0\n• Scheduling releases and tracking real-time YouTube Analytics\n\nTIMESTAMPS:\n00:00 - Architecture Overview\n02:30 - Google OAuth 2.0 & Token Refresh\n07:15 - YouTube Data API v3 Endpoints\n14:40 - Gemini AI Metadata Engine\n21:10 - Testing Live Upload & Deployment\n\nRESOURCES:\n👉 Code Repository & Live App: https://creatorflow.ai\n👉 Official YouTube Data API Documentation: https://developers.google.com/youtube/v3\n\nDISCLAIMER: Content optimization improves audience relevance and search discoverability but does not guarantee algorithm distribution or subscriber growth.",
    tags: [
      "youtube automation",
      "nextjs 15",
      "youtube data api v3",
      "gemini ai tutorial",
      "google oauth 2.0",
      "ai metadata generator",
      "nextjs tutorial",
      "software architecture",
      "creatorflow ai",
    ],
    hashtags: ["#YouTubeAutomation", "#Nextjs", "#GeminiAI", "#WebDevelopment"],
    pinnedComment:
      "💬 Are you currently uploading your videos manually or looking to build automated pipelines? Leave your stack below and I'll review your architecture!",
    chapters: [
      { time: "00:00", title: "Architecture Overview" },
      { time: "02:30", title: "Google OAuth 2.0 & Token Refresh" },
      { time: "07:15", title: "YouTube Data API v3 Endpoints" },
      { time: "14:40", title: "Gemini AI Metadata Engine" },
      { time: "21:10", title: "Testing Live Upload & Deployment" },
    ],
    thumbnailIdeas: ["I AUTOMATED IT!", "ZERO MANUAL WORK", "NEXT.JS + AI BOT", "NEW YOUTUBE API"],
    qualityScore: {
      overall: 95,
      clarity: 96,
      relevance: 94,
      readability: 97,
      keywordCoverage: 93,
      critique: [
        "Primary keyword 'YouTube Automation' placed within the initial title hooks.",
        "Formatted timestamps are ready for direct YouTube description paste.",
        "Clear engagement prompt included for pinned comment.",
        "Realistic disclaimer present to comply with transparency standards.",
      ],
    },
  });

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success("Copied to Clipboard", `${fieldName} copied.`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleGenerate = async () => {
    const quota = checkQuota("ai");
    if (!quota.allowed) {
      toast.error(
        "AI Quota Exceeded",
        `You have reached your limit of ${quota.max} generations this month. Upgrade your plan to continue.`
      );
      return;
    }

    setIsGenerating(true);

    try {
      const res = await fetch("/api/ai/metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          descriptionOrTranscript: transcript,
          niche,
          targetAudience,
          primaryKeyword,
          secondaryKeywords: secondaryKeywords
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          preferredTone,
          language,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setMetadata(json.data);
        setSelectedTitleIndex(0);
        // Save to persistent history
        saveMetadataRecord(
          topic,
          niche,
          json.data,
          selectedVideoId === "create_new" ? null : selectedVideoId
        );
        toast.success("Metadata Generated", "New SEO metadata generated and saved to history.");
      } else {
        toast.error("Generation Issue", json.error || "Could not generate metadata.");
      }
    } catch (e: any) {
      console.error("Metadata generation error:", e);
      toast.error("Error", e?.message || "Failed to contact metadata engine.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToVideo = () => {
    const chosenTitle = metadata.titles[selectedTitleIndex] || metadata.titles[0] || topic;

    if (selectedVideoId === "create_new") {
      // Create a brand new draft video
      const newVideo = addVideo({
        title: chosenTitle,
        description: metadata.description,
        tags: metadata.tags,
        privacy_status: "private",
        status: "draft",
        scheduled_at: new Date(Date.now() + 7 * 86400000).toISOString(),
      });
      setSelectedVideoId(newVideo.id);
      saveMetadataRecord(topic, niche, metadata, newVideo.id);
      toast.success(
        "New Video Draft Created",
        `Created "${newVideo.title.substring(0, 35)}..." with all generated metadata.`
      );
    } else {
      // Apply to existing video
      applyMetadataToVideo(selectedVideoId, {
        ...metadata,
        titles: [chosenTitle, ...metadata.titles.filter((t) => t !== chosenTitle)],
      });
      saveMetadataRecord(topic, niche, metadata, selectedVideoId);
    }
  };

  const handleExportMarkdown = () => {
    const md = `# ${metadata.titles[selectedTitleIndex] || metadata.titles[0]}

## Title Variations:
${metadata.titles.map((t, i) => `${i + 1}. ${t}`).join("\n")}

## YouTube Description:
${metadata.description}

## Tags:
${metadata.tags.join(", ")}

## Hashtags:
${metadata.hashtags.join(" ")}

## Suggested Pinned Comment:
${metadata.pinnedComment}

## Chapters:
${metadata.chapters.map((c) => `${c.time} ${c.title}`).join("\n")}

## Thumbnail Text Concepts:
${metadata.thumbnailIdeas.map((t) => `- ${t}`).join("\n")}
`;

    navigator.clipboard.writeText(md);
    toast.success("Exported to Clipboard", "Complete metadata copied as formatted markdown.");
  };

  const handleDownloadTxt = () => {
    const chosenTitle = metadata.titles[selectedTitleIndex] || metadata.titles[0];
    const textContent = `TITLE: ${chosenTitle}

ALTERNATIVE TITLES:
${metadata.titles.map((t, i) => `${i + 1}. ${t}`).join("\n")}

DESCRIPTION:
${metadata.description}

TAGS:
${metadata.tags.join(", ")}

HASHTAGS:
${metadata.hashtags.join(" ")}

PINNED COMMENT:
${metadata.pinnedComment}

CHAPTERS:
${metadata.chapters.map((c) => `${c.time} ${c.title}`).join("\n")}

THUMBNAIL IDEAS:
${metadata.thumbnailIdeas.join("\n")}
`;

    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `youtube-metadata-${topic.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 30)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded", "Metadata saved to .txt file.");
  };

  const handleRestoreFromHistory = (record: SavedMetadataRecord) => {
    setMetadata(record.data);
    setTopic(record.topic);
    setNiche(record.niche);
    setSelectedTitleIndex(0);
    setIsHistoryOpen(false);
    toast.info("Restored Metadata", `Loaded generation from ${new Date(record.generatedAt).toLocaleTimeString()}.`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                AI Metadata Studio
              </h1>
              <Badge variant="default" className="text-[10px] font-bold uppercase tracking-wider">
                Gemini AI
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Generate high-CTR titles, SEO descriptions, chapters, tags, and pinned comments with explainable quality scoring.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsHistoryOpen(true)}
              className="text-xs border-navy-700 bg-navy-900/60"
            >
              <History className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
              History ({metadataRecords.length})
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportMarkdown}
              className="text-xs border-navy-700 bg-navy-800"
            >
              <Copy className="w-3.5 h-3.5 mr-1.5 text-slate-300" />
              Copy Full Kit
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDownloadTxt}
              className="text-xs border-navy-700 bg-navy-800"
            >
              <Download className="w-3.5 h-3.5 mr-1.5 text-slate-300" />
              Export .TXT
            </Button>
            <Button
              variant="gradient"
              size="sm"
              onClick={handleSaveToVideo}
              className="text-xs font-semibold shadow-glow"
            >
              <Save className="w-3.5 h-3.5 mr-1.5" />
              {selectedVideoId === "create_new" ? "Create Video Draft" : "Apply to Video"}
            </Button>
          </div>
        </div>

        {/* Studio Grid: Form (Left) vs Output & Score (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form Settings Column (5 Cols) */}
          <div className="lg:col-span-5 space-y-5">
            <Card className="border-navy-800 bg-navy-900/90 shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-purple" />
                  Video Parameters
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Provide context about your video topic and target audience.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Associate Video */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">
                      Associate with Video Project
                    </label>
                    {selectedVideoId !== "create_new" && (
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                        <CheckCircle2 className="w-3 h-3" /> Linked
                      </span>
                    )}
                  </div>
                  <select
                    value={selectedVideoId}
                    onChange={(e) => setSelectedVideoId(e.target.value)}
                    className="w-full h-10 rounded-lg border border-navy-800 bg-navy-950 px-3 text-xs text-slate-200 focus:border-brand-purple"
                  >
                    <option value="create_new">+ Create New Video Project from this</option>
                    {videos.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.title.slice(0, 48)}... ({v.status})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Video Topic */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Video Topic / Working Title <span className="text-brand-purple">*</span>
                  </label>
                  <Input
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. 10 AI Tools that will replace junior developers"
                    className="text-xs"
                  />
                </div>

                {/* Primary Keyword */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Primary Target Keyword
                  </label>
                  <Input
                    value={primaryKeyword}
                    onChange={(e) => setPrimaryKeyword(e.target.value)}
                    placeholder="e.g. AI Tools for Developers"
                    className="text-xs"
                  />
                </div>

                {/* Secondary Keywords */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Secondary Keywords (comma separated)
                  </label>
                  <Input
                    value={secondaryKeywords}
                    onChange={(e) => setSecondaryKeywords(e.target.value)}
                    placeholder="e.g. coding tools, nextjs, llm, productivity"
                    className="text-xs"
                  />
                </div>

                {/* Transcript / Summary Context */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Video Description, Outline or Transcript
                  </label>
                  <Textarea
                    rows={4}
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder="Paste rough notes, outline, or audio transcript to generate accurate chapters..."
                    className="text-xs resize-none"
                  />
                </div>

                {/* Grid: Niche & Target Audience */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Channel Niche</label>
                    <Input
                      value={niche}
                      onChange={(e) => setNiche(e.target.value)}
                      placeholder="e.g. Tech, Finance, Gaming"
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Target Audience</label>
                    <Input
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      placeholder="e.g. Beginners, Software Pros"
                      className="text-xs"
                    />
                  </div>
                </div>

                {/* Grid: Tone & Language */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Preferred Tone</label>
                    <select
                      value={preferredTone}
                      onChange={(e) => setPreferredTone(e.target.value)}
                      className="w-full h-10 rounded-lg border border-navy-800 bg-navy-950 px-3 text-xs text-slate-200 focus:border-brand-purple"
                    >
                      <option>Engaging & Authoritative</option>
                      <option>Curiosity Gap / Contrarian</option>
                      <option>Casual & Relatable</option>
                      <option>Fast-Paced / High Energy</option>
                      <option>Educational / Tutorial</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Language</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full h-10 rounded-lg border border-navy-800 bg-navy-950 px-3 text-xs text-slate-200 focus:border-brand-purple"
                    >
                      <option>English</option>
                      <option>Spanish</option>
                      <option>German</option>
                      <option>French</option>
                      <option>Hindi</option>
                      <option>Portuguese</option>
                    </select>
                  </div>
                </div>

                <Button
                  onClick={handleGenerate}
                  variant="gradient"
                  className="w-full text-xs font-semibold mt-2 shadow-glow"
                  isLoading={isGenerating}
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                  Generate All Metadata
                </Button>
              </CardContent>
            </Card>

            {/* Quality Score Analysis Card */}
            <Card className="border-navy-800 bg-navy-900/90 shadow-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base text-white">Metadata Quality Index</CardTitle>
                  <span className="text-xl font-extrabold text-emerald-400">
                    {metadata.qualityScore.overall} / 100
                  </span>
                </div>
                <CardDescription className="text-xs text-slate-400">
                  Explainable scoring based on algorithmic relevancy, clarity, and readability.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3.5">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Clarity & Hook Potency</span>
                    <span className="text-white font-medium">{metadata.qualityScore.clarity}%</span>
                  </div>
                  <Progress value={metadata.qualityScore.clarity} indicatorColor="bg-brand-purple" />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Search Relevance</span>
                    <span className="text-white font-medium">{metadata.qualityScore.relevance}%</span>
                  </div>
                  <Progress value={metadata.qualityScore.relevance} indicatorColor="bg-brand-blue" />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Readability & Spacing</span>
                    <span className="text-white font-medium">{metadata.qualityScore.readability}%</span>
                  </div>
                  <Progress value={metadata.qualityScore.readability} indicatorColor="bg-emerald-400" />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Keyword Coverage</span>
                    <span className="text-white font-medium">{metadata.qualityScore.keywordCoverage}%</span>
                  </div>
                  <Progress value={metadata.qualityScore.keywordCoverage} indicatorColor="bg-violet-400" />
                </div>

                <div className="pt-2 border-t border-navy-800 space-y-1.5">
                  <p className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                    Auditing Critique:
                  </p>
                  <ul className="space-y-1 text-xs text-slate-400">
                    {metadata.qualityScore.critique.map((c, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-2.5 rounded-lg bg-navy-950/60 border border-navy-800 text-[11px] text-slate-400 flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>
                    Quality scoring is algorithmic optimization and does not promise guaranteed search rankings or algorithmic distribution.
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Generated Results Column (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* 1. Title Suggestions */}
            <Card className="border-navy-800 bg-navy-900/90 shadow-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-brand-purple" />
                      5 High-CTR Video Titles
                    </CardTitle>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Select radio to pick your active title for video binding
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-400">Click to copy</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {metadata.titles.map((title, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedTitleIndex(idx)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                      selectedTitleIndex === idx
                        ? "border-brand-purple bg-brand-purple/10 text-white shadow-sm"
                        : "border-navy-800 bg-navy-950/60 hover:bg-navy-850 hover:border-navy-700 text-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-5 h-5 rounded-full font-mono text-xs flex items-center justify-center shrink-0 transition-colors ${
                          selectedTitleIndex === idx
                            ? "bg-brand-purple text-white font-bold"
                            : "bg-navy-800 text-slate-400"
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <p className="text-xs sm:text-sm font-medium truncate">{title}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {selectedTitleIndex === idx && (
                        <Badge variant="default" className="text-[10px] py-0 px-1.5 h-5">
                          Selected
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(title, `title-${idx}`);
                        }}
                        className="h-7 w-7 text-slate-400 hover:text-white"
                      >
                        {copiedField === `title-${idx}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* 2. SEO-Friendly Description */}
            <Card className="border-navy-800 bg-navy-900/90 shadow-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base text-white">SEO Video Description</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(metadata.description, "description")}
                    className="text-xs h-7 border-navy-700"
                  >
                    {copiedField === "description" ? (
                      <>
                        <Check className="w-3 h-3 mr-1 text-emerald-400" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 mr-1" /> Copy Description
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <Textarea
                  rows={8}
                  value={metadata.description}
                  onChange={(e) =>
                    setMetadata({ ...metadata, description: e.target.value })
                  }
                  className="font-mono text-xs text-slate-300 bg-navy-950/80 resize-y"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Characters: {metadata.description.length} / 5000</span>
                  <span>Formatted for YouTube algorithm & human readability</span>
                </div>
              </CardContent>
            </Card>

            {/* 3. Thumbnail Text Ideas & Chapters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Thumbnail Text Concepts */}
              <Card className="border-navy-800 bg-navy-900/90 shadow-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-white flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-brand-blue" />
                    Thumbnail Text Ideas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {metadata.thumbnailIdeas.map((idea, i) => (
                    <div
                      key={i}
                      onClick={() => handleCopy(idea, `thumb-${i}`)}
                      className="p-2.5 rounded-lg border border-navy-800 bg-navy-950 flex items-center justify-between text-xs font-bold text-white tracking-wide cursor-pointer hover:border-brand-purple/40 transition-colors"
                    >
                      <span>{idea}</span>
                      {copiedField === `thumb-${i}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Video Chapters */}
              <Card className="border-navy-800 bg-navy-900/90 shadow-card">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm text-white flex items-center gap-1.5">
                      <ListOrdered className="w-4 h-4 text-emerald-400" />
                      Video Chapters
                    </CardTitle>
                    <button
                      onClick={() =>
                        handleCopy(
                          metadata.chapters.map((c) => `${c.time} ${c.title}`).join("\n"),
                          "chapters"
                        )
                      }
                      className="text-[11px] text-brand-purple hover:underline"
                    >
                      {copiedField === "chapters" ? "Copied" : "Copy All"}
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-1.5 max-h-48 overflow-y-auto">
                  {metadata.chapters.map((chap, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 p-1.5 rounded bg-navy-950 text-xs border border-navy-800/60"
                    >
                      <span className="font-mono text-emerald-400 font-semibold">{chap.time}</span>
                      <span className="text-slate-300 truncate">{chap.title}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* 4. Tags & Hashtags */}
            <Card className="border-navy-800 bg-navy-900/90 shadow-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base text-white flex items-center gap-2">
                    <Tag className="w-4 h-4 text-brand-purple" />
                    Tags & Hashtags
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(metadata.tags.join(", "), "tags")}
                    className="text-xs h-7 border-navy-700"
                  >
                    {copiedField === "tags" ? (
                      <>
                        <Check className="w-3 h-3 mr-1 text-emerald-400" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 mr-1" /> Copy All Tags
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-2">
                    YouTube Tags ({metadata.tags.length} generated)
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {metadata.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-md bg-navy-950 border border-navy-800 text-xs text-slate-300 flex items-center gap-1.5"
                      >
                        <span>{tag}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-navy-800">
                  <label className="text-xs text-slate-400 block mb-2">Suggested Hashtags</label>
                  <div className="flex flex-wrap gap-2">
                    {metadata.hashtags.map((ht, i) => (
                      <span
                        key={i}
                        onClick={() => handleCopy(ht, `ht-${i}`)}
                        className="px-2.5 py-1 rounded-md bg-brand-purple/15 text-purple-300 border border-brand-purple/30 text-xs font-medium cursor-pointer hover:bg-brand-purple/25 transition-colors flex items-center gap-1"
                      >
                        <Hash className="w-3 h-3" />
                        <span>{ht.replace("#", "")}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 5. Suggested Pinned Comment */}
            <Card className="border-navy-800 bg-navy-900/90 shadow-card">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-white flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-amber-400" />
                    Pinned Community Comment
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(metadata.pinnedComment, "pinned")}
                    className="text-xs h-7 border-navy-700"
                  >
                    {copiedField === "pinned" ? (
                      <>
                        <Check className="w-3 h-3 mr-1 text-emerald-400" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 mr-1" /> Copy Comment
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="p-3 rounded-lg bg-navy-950 border border-navy-800 text-xs text-slate-300 leading-relaxed">
                  {metadata.pinnedComment}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* History Modal */}
      <Modal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        title="Saved Metadata History"
        description="Inspect or restore previously generated metadata packages."
        maxWidth="2xl"
      >
        {metadataRecords.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <History className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-semibold">No saved metadata runs yet</p>
            <p className="text-xs text-slate-500 mt-1">
              Every time you generate metadata, it is automatically archived here for quick restoration.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {metadataRecords.map((rec) => (
              <div
                key={rec.id}
                className="p-3.5 rounded-xl border border-navy-800 bg-navy-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-navy-700 transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-white truncate">{rec.topic}</span>
                    <Badge variant="secondary" className="text-[10px] shrink-0">
                      {rec.niche}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 truncate">
                    Title: {rec.data.titles[0]}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Generated {new Date(rec.generatedAt).toLocaleString()} • Score: {rec.data.qualityScore.overall}/100
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRestoreFromHistory(rec)}
                  className="text-xs shrink-0 border-navy-700"
                >
                  <RefreshCw className="w-3 h-3 mr-1 text-brand-purple" />
                  Restore
                </Button>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
