"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useChannel } from "@/context/channel-context";
import { useData } from "@/context/data-context";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/components/ui/toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Image as ImageIcon,
  Sparkles,
  Download,
  Eye,
  Check,
  Sliders,
  Type,
  Youtube,
  AlertCircle,
  Copy,
  Smartphone,
  Tv,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Share2,
  Repeat,
  Music2,
  ShieldCheck,
  CheckCircle2,
  Palette,
  ExternalLink,
} from "lucide-react";
import { ThumbnailConceptItem, ThumbnailGenerationOutput } from "@/lib/ai/gemini";

interface SavedThumbnailAsset {
  id: string;
  title: string;
  imageUrl: string;
  textOverlay: string;
  format: "long_form" | "shorts";
  style: string;
  associatedTitle?: string;
}

export default function ThumbnailStudioPage() {
  const { activeChannel } = useChannel();
  const { projects, videos, updateProject, updateVideo } = useData();
  const { user } = useAuth();
  const { toast } = useToast();

  // Content Format: YouTube Shorts (9:16) default for NoVoiceCraft or Long-Form (16:9)
  const [contentFormat, setContentFormat] = useState<"long_form" | "shorts">("shorts");
  const [showSafeZone, setShowSafeZone] = useState<boolean>(true);

  // Selected Video / Project association
  const [selectedEntityId, setSelectedEntityId] = useState<string>("");
  const [topic, setTopic] = useState<string>("CAN SWEET BERRIES SAVE ME?! 💀🌿");
  const [videoTitle, setVideoTitle] = useState<string>("CAN SWEET BERRIES SAVE ME?! 💀🌿 #minecraft");
  const [description, setDescription] = useState<string>("Dropping from Y=320 all the way down with zero armor and testing if a single sweet berry bush can break lethal fall damage in Minecraft!");
  const [tags, setTags] = useState<string[]>(["minecraft", "shorts", "clutch", "gaming", "survival"]);
  const [niche, setNiche] = useState<string>("Minecraft & Gaming");

  // Thumbnail Canvas State
  const [overlayText, setOverlayText] = useState<string>("CAN IT SAVE ME?!");
  const [textColor, setTextColor] = useState<string>("#4ADE80"); // Minecraft green
  const [selectedImage, setSelectedImage] = useState<string>(
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1080&h=1920&auto=format&fit=crop&q=80"
  );

  // AI Generation State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationOutput, setGenerationOutput] = useState<ThumbnailGenerationOutput | null>(null);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Default Concepts
  const [concepts, setConcepts] = useState<ThumbnailConceptItem[]>([
    {
      id: "concept-1",
      name: "Lethal Fall Clutch",
      category: "Shock & Proof",
      textOverlay: "CAN IT SAVE ME?!",
      accentColor: "#4ADE80",
      visualDescription: "First-person perspective falling towards sweet berry bush from maximum height with hearts flashing red.",
      aiImagePrompt: "Cinematic vertical 9:16 Minecraft scene, player falling at terminal velocity towards a single green sweet berry bush on stone ground, dramatic motion blur, high contrast, vibrant green and red accents.",
      layoutComposition: "Dramatic vertical drop with bold curiosity text in top safe zone",
      estimatedCTR: "Very High",
      suggestedBackgroundUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1080&h=1920&auto=format&fit=crop&q=80",
    },
    {
      id: "concept-2",
      name: "Split Survival Test",
      category: "Before & After",
      textOverlay: "BED vs SLIME",
      accentColor: "#38BDF8",
      visualDescription: "50/50 split comparing red bed clutch explosion vs slime block bounce survival.",
      aiImagePrompt: "9:16 vertical split comparison, left side red bed with skull icon, right side glowing green slime block with checkmark, high energy gaming graphic.",
      layoutComposition: "Vertical split comparison layout with bold centered hook",
      estimatedCTR: "Very High",
      suggestedBackgroundUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1080&h=1920&auto=format&fit=crop&q=80",
    },
    {
      id: "concept-3",
      name: "Shock Height Drop",
      category: "Curiosity Gap",
      textOverlay: "1000 BLOCKS?!",
      accentColor: "#FACC15",
      visualDescription: "Extreme build height drop with giant yellow numbers and danger border.",
      aiImagePrompt: "Vertical 9:16 dramatic Minecraft drop, cloud layers below, huge glowing 1000 BLOCKS font in safe zone, intense cinematic lighting.",
      layoutComposition: "Center-aligned punchline with vignette shadow",
      estimatedCTR: "High",
      suggestedBackgroundUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1080&h=1920&auto=format&fit=crop&q=80",
    },
    {
      id: "concept-4",
      name: "Urgent Warning",
      category: "Extreme Contrast",
      textOverlay: "DO NOT JUMP!",
      accentColor: "#F87171",
      visualDescription: "Glowing red danger sign with player at the edge of the void.",
      aiImagePrompt: "High-contrast Minecraft cliff edge with warning signs and glowing red hazard icons, intense cinematic atmosphere.",
      layoutComposition: "Top-aligned text with focal subject below",
      estimatedCTR: "High Momentum",
      suggestedBackgroundUrl: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=1080&h=1920&auto=format&fit=crop&q=80",
    },
  ]);

  // Saved Assets Gallery - Cleared of old tech assets
  const [savedAssets, setSavedAssets] = useState<SavedThumbnailAsset[]>([]);

  // When a video/project is picked from dropdown, sync metadata
  const handleSelectEntity = (id: string) => {
    setSelectedEntityId(id);
    if (!id) return;

    // Check in projects first
    const proj = projects.find((p) => p.id === id);
    if (proj) {
      setTopic(proj.topic || proj.name);
      setVideoTitle(proj.selectedTitle || proj.name);
      setDescription(proj.description || "");
      setTags(proj.tags || []);
      setNiche(proj.niche || "Minecraft & Gaming");
      if (proj.contentType === "shorts") {
        setContentFormat("shorts");
        setSelectedImage("https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1080&h=1920&auto=format&fit=crop&q=80");
        setOverlayText("WATCH THIS!");
      } else {
        setContentFormat("long_form");
      }
      if (proj.thumbnailOverlayText) setOverlayText(proj.thumbnailOverlayText);
      if (proj.thumbnailTextColor) setTextColor(proj.thumbnailTextColor);
      if (proj.thumbnailUrl) setSelectedImage(proj.thumbnailUrl);
      toast.info("Metadata Loaded", `Loaded metadata from project "${proj.name}".`);
      return;
    }

    // Check in videos
    const vid = videos.find((v) => v.id === id);
    if (vid) {
      setTopic(vid.title);
      setVideoTitle(vid.title);
      setDescription(vid.description || "");
      setTags(vid.tags || []);
      if (vid.thumbnail_url) setSelectedImage(vid.thumbnail_url);
      toast.info("Metadata Loaded", `Loaded metadata from video "${vid.title.slice(0, 30)}...".`);
    }
  };

  // Format Switcher Trigger
  const handleFormatChange = (fmt: "long_form" | "shorts") => {
    setContentFormat(fmt);
    if (fmt === "shorts") {
      setSelectedImage("https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1080&h=1920&auto=format&fit=crop&q=80");
      setOverlayText("DON'T DO THIS!");
      setTextColor("#FACC15");
    } else {
      setSelectedImage("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1280&auto=format&fit=crop&q=80");
      setOverlayText("I AUTOMATED IT!");
      setTextColor("#FACC15");
    }
  };

  // Generate AI Thumbnails from Metadata
  const handleGenerateAIThumbnails = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai/thumbnails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.id || "demo-session"}`,
        },
        body: JSON.stringify({
          topic: topic.trim() || videoTitle.trim(),
          videoTitle: videoTitle.trim(),
          description: description.trim(),
          tags: tags,
          niche: niche,
          format: contentFormat,
          targetAudience: "YouTube Viewers & Subscribers",
          channelContext: activeChannel
            ? {
                channelTitle: activeChannel.title,
                subscriberCount: activeChannel.subscriber_count,
                niche: niche,
              }
            : undefined,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        const out: ThumbnailGenerationOutput = data.data;
        setGenerationOutput(out);
        setConcepts(out.concepts);
        if (out.recommendedText) setOverlayText(out.recommendedText);
        if (out.recommendedColor) setTextColor(out.recommendedColor);
        if (out.concepts[0]?.suggestedBackgroundUrl) {
          setSelectedImage(out.concepts[0].suggestedBackgroundUrl);
        }
        toast.success(
          "AI Thumbnails Generated",
          `Generated 4 ${contentFormat === "shorts" ? "Shorts (9:16)" : "Long-Form (16:9)"} concepts based on video metadata.`
        );
      } else {
        toast.error("Generation Issue", data.error || "Failed to generate thumbnail concepts.");
      }
    } catch (err: any) {
      console.warn("Error calling /api/ai/thumbnails:", err);
      toast.error("Network Error", "Could not connect to AI thumbnail generator.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Apply a Concept to Canvas
  const handleApplyConcept = (concept: ThumbnailConceptItem) => {
    setOverlayText(concept.textOverlay);
    setTextColor(concept.accentColor);
    if (concept.suggestedBackgroundUrl) {
      setSelectedImage(concept.suggestedBackgroundUrl);
    }
    toast.info("Concept Applied", `Applied "${concept.name}" to canvas.`);
  };

  // Copy AI Prompt
  const handleCopyPrompt = (prompt: string, id: string) => {
    navigator.clipboard.writeText(prompt);
    setCopiedPromptId(id);
    toast.success("AI Prompt Copied", "Paste into Midjourney, DALL-E 3, Imagen, or Flux.");
    setTimeout(() => setCopiedPromptId(null), 2500);
  };

  // Save Thumbnail & Assign to Video
  const handleSaveThumbnail = () => {
    const newAsset: SavedThumbnailAsset = {
      id: `thumb-${Date.now()}`,
      title: topic || videoTitle,
      imageUrl: selectedImage,
      textOverlay: overlayText,
      format: contentFormat,
      style: "Custom Text Overlay",
      associatedTitle: videoTitle || "Assigned in Studio",
    };
    setSavedAssets([newAsset, ...savedAssets]);

    if (selectedEntityId) {
      // Check project
      const proj = projects.find((p) => p.id === selectedEntityId);
      if (proj) {
        updateProject(proj.id, {
          thumbnailUrl: selectedImage,
          thumbnailOverlayText: overlayText,
          thumbnailTextColor: textColor,
          contentType: contentFormat === "shorts" ? "shorts" : proj.contentType || "tutorial",
        });
        toast.success("Thumbnail Saved & Assigned", `Bound to project "${proj.name}".`);
      } else {
        updateVideo(selectedEntityId, { thumbnail_url: selectedImage });
        toast.success("Thumbnail Assigned", "Saved and updated video thumbnail.");
      }
    } else {
      toast.success("Thumbnail Saved", "Added to your thumbnail assets bank.");
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleDownload = (imageUrl: string) => {
    window.open(imageUrl, "_blank");
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-200 max-w-7xl mx-auto pb-16">
        {/* Header with Title and Format Category Toggle */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-navy-800 pb-5">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Thumbnail & Visual Studio
              </h1>
              <Badge variant="blue" className="text-[10px] font-bold uppercase tracking-wider">
                AI CTR Optimization
              </Badge>
              <Badge
                variant={contentFormat === "shorts" ? "default" : "secondary"}
                className="text-[10px] font-bold uppercase tracking-wider"
              >
                {contentFormat === "shorts" ? "YouTube Shorts (9:16)" : "Long-Form Video (16:9)"}
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Generate click-optimized thumbnails and vertical Shorts covers. Formulate high-CTR text hooks, 
              psychological curiosity triggers, and AI image prompts tailored to your video metadata.
            </p>
          </div>

          {/* Format Category Switcher (Long-Form vs Shorts) */}
          <div className="flex items-center gap-2 bg-navy-900/90 p-1 rounded-xl border border-navy-800 shadow-inner">
            <button
              type="button"
              onClick={() => handleFormatChange("long_form")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                contentFormat === "long_form"
                  ? "bg-brand-purple text-white shadow-glow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>Long-Form (16:9)</span>
            </button>
            <button
              type="button"
              onClick={() => handleFormatChange("shorts")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                contentFormat === "shorts"
                  ? "bg-gradient-to-r from-red-600 to-brand-purple text-white shadow-glow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>YouTube Shorts (9:16)</span>
            </button>
          </div>
        </div>

        {/* Video Metadata Inspector & Generator Hub */}
        <Card className="border-navy-800 bg-gradient-to-b from-navy-900/90 to-navy-950/90 shadow-xl border-t-2 border-t-brand-purple/50">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-purple" />
                  AI Thumbnail Generation from Video Metadata
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Select an existing project or enter video metadata below. The AI inspects your title, angle, and tags to formulate tailor-made concepts.
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="gradient"
                  size="sm"
                  onClick={handleGenerateAIThumbnails}
                  isLoading={isGenerating}
                  className="text-xs font-semibold shadow-glow px-4"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  {isGenerating ? "Analyzing Metadata..." : "Generate AI Thumbnails"}
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 pt-1">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Select Project / Video */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Bind to Project / Video</label>
                <select
                  value={selectedEntityId}
                  onChange={(e) => handleSelectEntity(e.target.value)}
                  className="w-full h-8 rounded-lg border border-navy-800 bg-navy-950 px-2.5 text-xs text-slate-200 focus:outline-none focus:border-brand-purple"
                >
                  <option value="">Manual Entry (No Bound Project)</option>
                  <optgroup label="Creator Studio Projects">
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        [Project] {p.name.slice(0, 36)}... ({p.contentType || "long_form"})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Channel Published Videos">
                    {videos.map((v) => (
                      <option key={v.id} value={v.id}>
                        [Video] {v.title.slice(0, 36)}...
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Video Title */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Video Title</label>
                <Input
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  placeholder="e.g. CAN SWEET BERRIES SAVE ME?! 💀🌿 #minecraft"
                  className="h-8 text-xs"
                />
              </div>

              {/* Core Topic & Angle */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Core Topic & Niche</label>
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Minecraft Lethal Fall Damage Clutch"
                  className="h-8 text-xs"
                />
              </div>
            </div>

            {/* Metadata Tags Pill Row */}
            <div className="flex items-center gap-2 flex-wrap pt-1 text-[11px]">
              <span className="text-slate-400 font-medium">Active Metadata Tags:</span>
              {tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-navy-800 border border-navy-700 text-slate-300 font-mono text-[10px]"
                >
                  #{tag}
                </span>
              ))}
              <span className="text-slate-500 text-[10px]">
                • Format: <strong className="text-brand-purple">{contentFormat === "shorts" ? "Shorts (9:16)" : "Long-Form (16:9)"}</strong>
              </span>
              <span className="text-slate-500 text-[10px]">
                • Channel: <strong className="text-white">{activeChannel?.title || "CreatorFlow"}</strong>
              </span>
            </div>

            {/* Safe Zone Advice Banner */}
            <div className="p-2.5 rounded-lg border border-navy-800 bg-navy-950/70 text-xs text-slate-300 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <strong className="text-white">
                  {contentFormat === "shorts" ? "Shorts Safe-Zone Rules (9:16):" : "Long-Form Safe-Zone Rules (16:9):"}
                </strong>{" "}
                {contentFormat === "shorts"
                  ? "Center critical text between 20% and 70% height. The right 15% is covered by Like/Comment/Share buttons, and the bottom 25% is obscured by sound title and channel avatar."
                  : "Follow rule of thirds. Avoid putting critical punchlines in the bottom-right corner where the YouTube duration time stamp (e.g. 18:45) is overlaid."}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Workspace: Left Parameters (5 Cols) vs Right Live Feed Simulation (7 Cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Controls & AI Concepts (5 Cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Manual Canvas Controls */}
            <Card className="border-navy-800 bg-navy-900/90 shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-brand-purple" />
                  Canvas Customizer
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Tune text hook, accent color, and background image asset.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3.5">
                {/* Text Overlay */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">
                      High-CTR Text Overlay ({contentFormat === "shorts" ? "Max 3 words for Shorts" : "Max 4 words"})
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {overlayText.length} chars
                    </span>
                  </div>
                  <Input
                    value={overlayText}
                    onChange={(e) => setOverlayText(e.target.value.toUpperCase())}
                    placeholder={contentFormat === "shorts" ? "e.g. DON'T DO THIS!" : "e.g. I AUTOMATED IT!"}
                    className="text-xs font-bold uppercase tracking-wide"
                  />
                </div>

                {/* Accent Color */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Text Accent Color</label>
                  <div className="flex items-center gap-2">
                    {[
                      { name: "Yellow", hex: "#FACC15" },
                      { name: "White", hex: "#FFFFFF" },
                      { name: "Cyan", hex: "#38BDF8" },
                      { name: "Emerald", hex: "#4ADE80" },
                      { name: "Red", hex: "#F87171" },
                      { name: "Purple", hex: "#A855F7" },
                    ].map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => setTextColor(c.hex)}
                        style={{ backgroundColor: c.hex }}
                        className={`w-7 h-7 rounded-full border-2 transition-transform ${
                          textColor === c.hex ? "border-white scale-110 shadow-glow" : "border-navy-700"
                        }`}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Background Image URL */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Background Image URL</label>
                  <Input
                    value={selectedImage}
                    onChange={(e) => setSelectedImage(e.target.value)}
                    placeholder="Paste image URL..."
                    className="text-xs"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant="gradient"
                    size="sm"
                    onClick={handleSaveThumbnail}
                    className="flex-1 text-xs font-semibold shadow-glow"
                  >
                    {savedSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-300" />
                        Saved & Assigned!
                      </>
                    ) : (
                      "Save & Assign to Video"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(selectedImage)}
                    className="text-xs border-navy-700"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* AI Generated Concepts Cards */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-purple" />
                  AI Thumbnail Concepts ({concepts.length})
                </h3>
                {generationOutput?.isHeuristicFallback === false && (
                  <Badge variant="blue" className="text-[10px]">
                    Live Gemini
                  </Badge>
                )}
              </div>

              <div className="space-y-3">
                {concepts.map((con) => (
                  <Card
                    key={con.id}
                    className="border-navy-800 bg-navy-900/80 hover:border-brand-purple/40 transition-all p-3.5 space-y-2 group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{con.name}</span>
                        <Badge variant="secondary" className="text-[10px]">
                          {con.category}
                        </Badge>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-semibold font-mono">
                        CTR: {con.estimatedCTR}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        style={{ color: con.accentColor }}
                        className="px-2 py-0.5 rounded bg-black/80 font-extrabold text-xs uppercase tracking-wide border border-white/10"
                      >
                        {con.textOverlay}
                      </span>
                      <span className="text-[11px] text-slate-400 truncate">
                        {con.layoutComposition}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-snug">
                      {con.visualDescription}
                    </p>

                    {/* AI Prompt Section */}
                    {con.aiImagePrompt && (
                      <div className="p-2 rounded bg-navy-950 border border-navy-800 text-[10px] text-slate-400 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-300">AI Image Prompt (Midjourney / Flux):</span>
                          <button
                            type="button"
                            onClick={() => handleCopyPrompt(con.aiImagePrompt, con.id)}
                            className="text-brand-purple hover:text-white flex items-center gap-1 font-semibold"
                          >
                            {copiedPromptId === con.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy Prompt</span>
                              </>
                            )}
                          </button>
                        </div>
                        <p className="line-clamp-2 font-mono text-[9.5px] text-slate-400">
                          {con.aiImagePrompt}
                        </p>
                      </div>
                    )}

                    <div className="pt-1 flex items-center justify-end">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleApplyConcept(con)}
                        className="text-[11px] h-7 px-3 bg-navy-800 hover:bg-brand-purple hover:text-white"
                      >
                        Apply to Canvas →
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Real-time YouTube Feed Simulation Column (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            <Card className="border-navy-800 bg-navy-900/90 shadow-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base text-white flex items-center gap-2">
                    <Eye className="w-4 h-4 text-brand-blue" />
                    {contentFormat === "shorts"
                      ? "YouTube Shorts Player Simulation (9:16)"
                      : "Live YouTube Feed Simulation (16:9)"}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {contentFormat === "shorts" && (
                      <button
                        type="button"
                        onClick={() => setShowSafeZone(!showSafeZone)}
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded border transition-colors ${
                          showSafeZone
                            ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                            : "border-navy-700 text-slate-400"
                        }`}
                      >
                        {showSafeZone ? "Safe Zone: ON" : "Safe Zone: OFF"}
                      </button>
                    )}
                    <Badge variant="blue" className="text-[10px]">
                      {contentFormat === "shorts" ? "9:16 Vertical" : "16:9 Landscape"}
                    </Badge>
                  </div>
                </div>
                <CardDescription className="text-xs text-slate-400">
                  {contentFormat === "shorts"
                    ? "See how your Shorts thumbnail looks inside the mobile vertical player, checking safe zones against action buttons and sound bar."
                    : "Inspect how your thumbnail and title stand out in the crowded YouTube recommendation browse feed."}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* ==============================================================
                    A. LONG-FORM (16:9) PREVIEW CANVAS
                    ============================================================== */}
                {contentFormat === "long_form" && (
                  <div className="space-y-3">
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-navy-700 shadow-2xl flex items-center justify-center select-none group">
                      <img
                        src={selectedImage}
                        alt="Thumbnail Preview"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />

                      {/* Subtle Vignette Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                      {/* Text Overlay */}
                      {overlayText && (
                        <div className="absolute bottom-6 left-6 max-w-[85%] pointer-events-none">
                          <span
                            style={{ color: textColor }}
                            className="inline-block px-3.5 py-1.5 rounded-lg bg-black/85 backdrop-blur-md border border-white/10 text-2xl sm:text-4xl font-extrabold uppercase tracking-tight shadow-2xl drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]"
                          >
                            {overlayText}
                          </span>
                        </div>
                      )}

                      {/* Duration Badge */}
                      <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-black/90 text-white font-mono text-[11px] font-semibold border border-white/10">
                        18:45
                      </div>
                    </div>

                    {/* Simulated YouTube Video Row */}
                    <div className="flex items-start gap-3 pt-2">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-navy-800 border border-navy-700 shrink-0">
                        {activeChannel?.thumbnail_url ? (
                          <img src={activeChannel.thumbnail_url} alt="Channel" className="w-full h-full object-cover" />
                        ) : (
                          <Youtube className="w-5 h-5 text-red-500 m-2.5" />
                        )}
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <p className="text-sm font-bold text-white line-clamp-2 leading-snug">
                          {videoTitle || topic || "Untitled Masterclass"}
                        </p>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <span>{activeChannel?.title || "CreatorFlow Channel"}</span>
                          <span>•</span>
                          <span>142K views</span>
                          <span>•</span>
                          <span>2 days ago</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ==============================================================
                    B. YOUTUBE SHORTS (9:16) PREVIEW CANVAS
                    ============================================================== */}
                {contentFormat === "shorts" && (
                  <div className="py-2 flex flex-col items-center justify-center">
                    {/* Vertical 9:16 Shorts Container */}
                    <div className="relative w-[280px] h-[497px] rounded-2xl overflow-hidden bg-black border-2 border-navy-700 shadow-2xl select-none group">
                      {/* Background Visual */}
                      <img
                        src={selectedImage}
                        alt="Shorts Preview"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />

                      {/* Shorts Vignette */}
                      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 pointer-events-none" />

                      {/* Safe Zone Visual Guide Overlay */}
                      {showSafeZone && (
                        <div className="absolute inset-x-3 top-[20%] bottom-[25%] right-14 border border-dashed border-emerald-400/60 rounded-xl pointer-events-none flex flex-col justify-between p-2">
                          <span className="text-[9px] font-mono text-emerald-300 bg-black/60 px-1 py-0.5 rounded self-start">
                            Safe Zone
                          </span>
                          <span className="text-[8px] font-mono text-emerald-300/80 bg-black/60 px-1 py-0.5 rounded self-end">
                            Center Focal Area
                          </span>
                        </div>
                      )}

                      {/* High-CTR Text Overlay (Centered in Upper Third) */}
                      {overlayText && (
                        <div className="absolute top-[28%] left-4 right-14 pointer-events-none text-center">
                          <span
                            style={{ color: textColor }}
                            className="inline-block px-3 py-1.5 rounded-xl bg-black/85 backdrop-blur-md border border-white/10 text-xl font-extrabold uppercase tracking-tight shadow-2xl drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]"
                          >
                            {overlayText}
                          </span>
                        </div>
                      )}

                      {/* Right Action Icons Column (Like on Real YouTube Shorts) */}
                      <div className="absolute right-2 bottom-12 flex flex-col items-center gap-4 text-white pointer-events-none">
                        <div className="flex flex-col items-center">
                          <div className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center">
                            <ThumbsUp className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-bold mt-0.5">48K</span>
                        </div>

                        <div className="flex flex-col items-center">
                          <div className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center">
                            <ThumbsDown className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-bold mt-0.5">Dislike</span>
                        </div>

                        <div className="flex flex-col items-center">
                          <div className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center">
                            <MessageSquare className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-bold mt-0.5">1.2K</span>
                        </div>

                        <div className="flex flex-col items-center">
                          <div className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center">
                            <Share2 className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-bold mt-0.5">Share</span>
                        </div>

                        <div className="flex flex-col items-center">
                          <div className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center">
                            <Repeat className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-bold mt-0.5">Remix</span>
                        </div>

                        {/* Spinning Sound Disc */}
                        <div className="w-8 h-8 rounded-full border border-white/20 bg-black/60 flex items-center justify-center animate-spin">
                          <Music2 className="w-3.5 h-3.5 text-brand-purple" />
                        </div>
                      </div>

                      {/* Bottom Channel Info & Sound Bar */}
                      <div className="absolute left-3 bottom-3 right-14 space-y-1 text-white pointer-events-none">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full overflow-hidden bg-navy-800 border border-white/20">
                            {activeChannel?.thumbnail_url ? (
                              <img src={activeChannel.thumbnail_url} alt="Channel" className="w-full h-full object-cover" />
                            ) : (
                              <Youtube className="w-4 h-4 text-red-500 m-1.5" />
                            )}
                          </div>
                          <span className="text-xs font-bold truncate">@{activeChannel?.title || "CreatorFlow"}</span>
                          <span className="px-2 py-0.5 rounded-full bg-red-600 text-[9px] font-bold">
                            Subscribe
                          </span>
                        </div>

                        <p className="text-[11px] font-medium text-slate-200 line-clamp-1">
                          {videoTitle || topic} #shorts #trending
                        </p>

                        <div className="flex items-center gap-1.5 text-[9px] text-slate-300">
                          <Music2 className="w-3 h-3 text-brand-purple" />
                          <span className="truncate">Original Audio - @{activeChannel?.title || "CreatorFlow"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter className="pt-2 flex justify-between border-t border-navy-800/80">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(selectedImage)}
                  className="text-xs border-navy-700"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  Download Asset
                </Button>
                <Button
                  variant="gradient"
                  size="sm"
                  onClick={handleSaveThumbnail}
                  className="text-xs font-semibold shadow-glow"
                >
                  Save & Assign to Video
                </Button>
              </CardFooter>
            </Card>

            {/* Saved Thumbnails Gallery */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-bold text-white">Saved Thumbnail Assets ({savedAssets.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {savedAssets.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => {
                      setSelectedImage(t.imageUrl);
                      setOverlayText(t.textOverlay);
                      setContentFormat(t.format || "long_form");
                    }}
                    className="rounded-lg border border-navy-800 bg-navy-950 p-2 cursor-pointer hover:border-brand-purple/40 transition-colors space-y-2 group"
                  >
                    <div className={`w-full ${t.format === "shorts" ? "aspect-[9/16] max-h-48" : "aspect-video"} rounded overflow-hidden relative`}>
                      <img src={t.imageUrl} alt={t.title} className="w-full h-full object-cover" />
                      <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-extrabold text-amber-300">
                        {t.textOverlay}
                      </div>
                      <div className="absolute top-1 right-1 px-1 py-0.5 rounded bg-black/70 text-[8px] font-bold text-slate-300 uppercase">
                        {t.format === "shorts" ? "Shorts" : "16:9"}
                      </div>
                    </div>
                    <div className="text-[11px] truncate">
                      <p className="font-semibold text-white truncate">{t.title}</p>
                      <p className="text-[10px] text-slate-400 truncate">{t.associatedTitle || t.style}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
