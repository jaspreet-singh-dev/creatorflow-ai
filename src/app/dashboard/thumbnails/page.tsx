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
  Wand2,
  RefreshCw,
  Layers,
  Image as ImageIcon,
} from "lucide-react";
import { ThumbnailConceptItem, ThumbnailGenerationOutput } from "@/lib/ai/gemini";
import { generateThumbnailSvg, svgToDataUri } from "@/lib/ai/thumbnail-graphics";

interface SavedThumbnailAsset {
  id: string;
  title: string;
  imageUrl: string;
  textOverlay: string;
  format: "long_form" | "shorts";
  style: string;
  associatedTitle?: string;
  createdAt: string;
}

export default function ThumbnailStudioPage() {
  const { activeChannel } = useChannel();
  const { projects, videos, updateProject, updateVideo } = useData();
  const { user } = useAuth();
  const { toast } = useToast();

  // Content Format: YouTube Shorts (9:16) default or Long-Form (16:9)
  const [contentFormat, setContentFormat] = useState<"long_form" | "shorts">("shorts");
  const [showSafeZone, setShowSafeZone] = useState<boolean>(true);

  // Selected Video / Project association
  const [selectedEntityId, setSelectedEntityId] = useState<string>("");
  const [topic, setTopic] = useState<string>("CAN SWEET BERRIES SAVE ME?! 💀🌿");
  const [videoTitle, setVideoTitle] = useState<string>("CAN SWEET BERRIES SAVE ME?! 💀🌿 #minecraft");
  const [description, setDescription] = useState<string>(
    "Dropping from Y=320 all the way down with zero armor and testing if a single sweet berry bush can break lethal fall damage in Minecraft!"
  );
  const [tags, setTags] = useState<string[]>(["minecraft", "shorts", "clutch", "gaming", "survival"]);
  const [niche, setNiche] = useState<string>("Minecraft & Gaming");

  // Style Preset for AI Visual Generation
  const [stylePreset, setStylePreset] = useState<
    "hyper_mint" | "cyber_gaming" | "urgent_danger" | "split_contrast" | "viral_hook"
  >("cyber_gaming");

  // Thumbnail Canvas State
  const [overlayText, setOverlayText] = useState<string>("CAN IT SAVE ME?!");
  const [textColor, setTextColor] = useState<string>("#00F5A0"); // Electric Mint
  
  // Default generated SVG for instant visual fidelity
  const initialSvg = generateThumbnailSvg({
    format: "shorts",
    textOverlay: "CAN IT SAVE ME?!",
    topic: "CAN SWEET BERRIES SAVE ME?! 💀🌿",
    stylePreset: "cyber_gaming",
    accentColor: "#00F5A0",
  });
  const [selectedImage, setSelectedImage] = useState<string>(svgToDataUri(initialSvg));

  // AI Generation State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isRenderingVisual, setIsRenderingVisual] = useState<boolean>(false);
  const [generationOutput, setGenerationOutput] = useState<ThumbnailGenerationOutput | null>(null);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Default Concepts with pre-rendered SVGs
  const [concepts, setConcepts] = useState<ThumbnailConceptItem[]>([
    {
      id: "concept-1",
      name: "Lethal Fall Clutch",
      category: "Shock & Proof",
      textOverlay: "CAN IT SAVE ME?!",
      accentColor: "#00F5A0",
      visualDescription: "First-person perspective falling towards sweet berry bush from maximum height with hearts flashing red.",
      aiImagePrompt: "Cinematic vertical 9:16 Minecraft scene, player falling at terminal velocity towards a single green sweet berry bush on stone ground, dramatic motion blur, high contrast, vibrant green and red accents.",
      layoutComposition: "Dramatic vertical drop with bold curiosity text in top safe zone",
      estimatedCTR: "Very High",
      stylePreset: "cyber_gaming",
      generatedSvgUrl: svgToDataUri(
        generateThumbnailSvg({
          format: "shorts",
          textOverlay: "CAN IT SAVE ME?!",
          topic: "Minecraft Lethal Fall",
          stylePreset: "cyber_gaming",
          accentColor: "#00F5A0",
        })
      ),
    },
    {
      id: "concept-2",
      name: "Split Survival Test",
      category: "Before & After",
      textOverlay: "BED vs SLIME",
      accentColor: "#00D8F6",
      visualDescription: "50/50 split comparing red bed clutch explosion vs slime block bounce survival.",
      aiImagePrompt: "9:16 vertical split comparison, left side red bed with skull icon, right side glowing green slime block with checkmark, high energy gaming graphic.",
      layoutComposition: "Vertical split comparison layout with bold centered hook",
      estimatedCTR: "Very High",
      stylePreset: "split_contrast",
      generatedSvgUrl: svgToDataUri(
        generateThumbnailSvg({
          format: "shorts",
          textOverlay: "BED vs SLIME",
          topic: "Bed vs Slime Survival",
          stylePreset: "split_contrast",
          accentColor: "#00D8F6",
        })
      ),
    },
    {
      id: "concept-3",
      name: "Shock Height Drop",
      category: "Curiosity Gap",
      textOverlay: "1000 BLOCKS?!",
      accentColor: "#FFB800",
      visualDescription: "Extreme build height drop with giant yellow numbers and danger border.",
      aiImagePrompt: "Vertical 9:16 dramatic Minecraft drop, cloud layers below, huge glowing 1000 BLOCKS font in safe zone, intense cinematic lighting.",
      layoutComposition: "Center-aligned punchline with vignette shadow",
      estimatedCTR: "High",
      stylePreset: "hyper_mint",
      generatedSvgUrl: svgToDataUri(
        generateThumbnailSvg({
          format: "shorts",
          textOverlay: "1000 BLOCKS?!",
          topic: "1000 Blocks Drop",
          stylePreset: "hyper_mint",
          accentColor: "#FFB800",
        })
      ),
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
      stylePreset: "urgent_danger",
      generatedSvgUrl: svgToDataUri(
        generateThumbnailSvg({
          format: "shorts",
          textOverlay: "DO NOT JUMP!",
          topic: "Do Not Jump Warning",
          stylePreset: "urgent_danger",
          accentColor: "#F87171",
        })
      ),
    },
  ]);

  // Saved Assets Gallery
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
    const newSvg = generateThumbnailSvg({
      format: fmt,
      textOverlay: fmt === "shorts" ? "WATCH THIS!" : "I AUTOMATED IT!",
      topic: topic || videoTitle,
      stylePreset,
      accentColor: textColor,
    });
    setSelectedImage(svgToDataUri(newSvg));
    setOverlayText(fmt === "shorts" ? "WATCH THIS!" : "I AUTOMATED IT!");
  };

  // 1. Generate AI Thumbnail Concepts from Metadata
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
        if (out.concepts[0]?.generatedSvgUrl) {
          setSelectedImage(out.concepts[0].generatedSvgUrl);
        } else if (out.concepts[0]?.suggestedBackgroundUrl) {
          setSelectedImage(out.concepts[0].suggestedBackgroundUrl);
        }
        toast.success(
          "AI Thumbnails Formulated",
          `Generated 4 ${contentFormat === "shorts" ? "Shorts (9:16)" : "Long-Form (16:9)"} visual concepts based on video metadata.`
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

  // 2. Direct Instant AI Thumbnail Image Generation
  const handleGenerateAIVisualImage = async () => {
    setIsRenderingVisual(true);
    try {
      const res = await fetch("/api/ai/thumbnails/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.id || "demo-session"}`,
        },
        body: JSON.stringify({
          topic: topic.trim() || videoTitle.trim() || "Viral Strategy",
          videoTitle: videoTitle.trim(),
          format: contentFormat,
          niche,
          textOverlay: overlayText.trim(),
          accentColor: textColor,
          stylePreset,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        const result = data.data;
        setSelectedImage(result.imageUrl);
        setOverlayText(result.textOverlay);
        setTextColor(result.accentColor);
        
        // Add to saved bank
        const newAsset: SavedThumbnailAsset = {
          id: `thumb-${Date.now()}`,
          title: topic || videoTitle,
          imageUrl: result.imageUrl,
          textOverlay: result.textOverlay,
          format: contentFormat,
          style: stylePreset,
          associatedTitle: videoTitle || "AI Generated Thumbnail",
          createdAt: new Date().toLocaleTimeString(),
        };
        setSavedAssets((prev) => [newAsset, ...prev]);

        toast.success(
          "AI Thumbnail Generated!",
          `High-CTR ${contentFormat === "shorts" ? "Shorts Cover (9:16)" : "Thumbnail (16:9)"} rendered successfully.`
        );
      } else {
        toast.error("Generation Issue", data.error || "Could not generate thumbnail visual.");
      }
    } catch (err: any) {
      toast.error("Generation Failed", err?.message || "Failed to reach AI thumbnail renderer.");
    } finally {
      setIsRenderingVisual(false);
    }
  };

  // Apply a Concept to Canvas
  const handleApplyConcept = (concept: ThumbnailConceptItem) => {
    setOverlayText(concept.textOverlay);
    setTextColor(concept.accentColor);
    if (concept.generatedSvgUrl) {
      setSelectedImage(concept.generatedSvgUrl);
    } else if (concept.suggestedBackgroundUrl) {
      setSelectedImage(concept.suggestedBackgroundUrl);
    }
    if (concept.stylePreset) {
      setStylePreset(concept.stylePreset);
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
      style: stylePreset,
      associatedTitle: videoTitle || "Assigned in Studio",
      createdAt: new Date().toLocaleTimeString(),
    };
    setSavedAssets([newAsset, ...savedAssets]);

    if (selectedEntityId) {
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

  // Download High-Res PNG (Offscreen Canvas Compositor)
  const handleDownloadPNG = async () => {
    try {
      const isShorts = contentFormat === "shorts";
      const width = isShorts ? 1080 : 1280;
      const height = isShorts ? 1920 : 720;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);

        // If not already an SVG with baked text, overlay the high-CTR text
        if (!selectedImage.startsWith("data:image/svg") && overlayText.trim()) {
          const text = overlayText.trim().toUpperCase();
          ctx.font = `900 ${isShorts ? "108px" : "88px"} Impact, 'Arial Black', sans-serif`;
          ctx.textAlign = isShorts ? "center" : "left";
          ctx.textBaseline = "middle";

          const x = isShorts ? width / 2 : width * 0.08;
          const y = isShorts ? height * 0.45 : height * 0.65;

          ctx.strokeStyle = "#000000";
          ctx.lineWidth = isShorts ? 24 : 18;
          ctx.lineJoin = "round";
          ctx.strokeText(text, x, y);

          ctx.fillStyle = textColor || "#00F5A0";
          ctx.fillText(text, x, y);
        }

        canvas.toBlob((blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `creatorflow-${contentFormat}-${Date.now()}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          toast.success("Thumbnail Exported", `Saved high-res PNG (${width}x${height}).`);
        }, "image/png");
      };

      img.onerror = () => {
        window.open(selectedImage, "_blank");
      };

      img.src = selectedImage;
    } catch (err) {
      console.warn("Canvas export error:", err);
      window.open(selectedImage, "_blank");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-200 max-w-7xl mx-auto pb-16">
        {/* ===================================================================
            HEADER: TITLE + FORMAT CATEGORY SWITCHER (HYPER-MINT THEME)
            =================================================================== */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                <span className="w-2.5 h-7 rounded-full bg-mint-400 shadow-[0_0_12px_rgba(0,245,160,0.8)] inline-block" />
                Thumbnail & Visual Studio
              </h1>
              <Badge variant="mint" className="text-[10px] font-bold uppercase tracking-wider">
                AI CTR Optimization
              </Badge>
              <Badge
                variant={contentFormat === "shorts" ? "cyber" : "solar"}
                className="text-[10px] font-bold uppercase tracking-wider"
              >
                {contentFormat === "shorts" ? "YouTube Shorts (9:16)" : "Long-Form Video (16:9)"}
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-2xl leading-relaxed">
              Generate click-optimized thumbnails and vertical Shorts covers. Formulate high-CTR text hooks,
              psychological curiosity triggers, and AI image prompts tailored to your video metadata.
            </p>
          </div>

          {/* Format Category Switcher (Long-Form vs Shorts) */}
          <div className="flex items-center gap-1.5 bg-void-950 p-1.5 rounded-xl border border-white/10 shadow-inner">
            <button
              type="button"
              onClick={() => handleFormatChange("long_form")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                contentFormat === "long_form"
                  ? "mint-btn-gradient font-bold"
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
                  ? "bg-gradient-to-r from-cyan-500 to-mint-400 text-void-950 font-bold shadow-[0_0_12px_rgba(0,216,246,0.5)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>YouTube Shorts (9:16)</span>
            </button>
          </div>
        </div>

        {/* ===================================================================
            HERO: AI THUMBNAIL GENERATOR HUB
            =================================================================== */}
        <Card className="aurora-card border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-mint-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyber-400/10 rounded-full blur-3xl pointer-events-none" />

          <CardHeader className="pb-3 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-mint-400 animate-pulse" />
                  AI Thumbnail Generation from Video Metadata
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Select an existing project or enter video metadata below. The AI inspects your title, angle, and tags to formulate tailor-made concepts.
                </CardDescription>
              </div>

              {/* Action Buttons: Formulate Concepts & Instant Visual Generation */}
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateAIThumbnails}
                  isLoading={isGenerating}
                  className="text-xs font-semibold border-white/10 text-slate-200 hover:border-mint-400/40"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-mint-400" />
                  {isGenerating ? "Formulating..." : "Formulate Concepts"}
                </Button>

                <Button
                  size="sm"
                  onClick={handleGenerateAIVisualImage}
                  isLoading={isRenderingVisual}
                  className="mint-btn-gradient text-xs font-bold px-4"
                >
                  <Wand2 className="w-3.5 h-3.5 mr-1.5" />
                  {isRenderingVisual ? "Generating AI Visual..." : "✨ Generate Thumbnail via AI"}
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 pt-1 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Select Project / Video */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Bind to Project / Video</label>
                <select
                  value={selectedEntityId}
                  onChange={(e) => handleSelectEntity(e.target.value)}
                  className="w-full h-8 rounded-lg border border-white/10 bg-void-950 px-2.5 text-xs text-slate-200 focus:outline-none focus:border-mint-400"
                >
                  <option value="">Manual Entry (No Bound Project)</option>
                  <optgroup label="Creator Studio Projects">
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        [Project] {p.name.slice(0, 32)}... ({p.contentType || "long_form"})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Channel Published Videos">
                    {videos.map((v) => (
                      <option key={v.id} value={v.id}>
                        [Video] {v.title.slice(0, 32)}...
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
                  className="h-8 text-xs aurora-input"
                />
              </div>

              {/* Core Topic & Angle */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Core Topic & Niche</label>
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Minecraft Lethal Fall Damage Clutch"
                  className="h-8 text-xs aurora-input"
                />
              </div>

              {/* AI Visual Style Preset */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">AI Visual Aesthetic</label>
                <select
                  value={stylePreset}
                  onChange={(e) => setStylePreset(e.target.value as any)}
                  className="w-full h-8 rounded-lg border border-white/10 bg-void-950 px-2.5 text-xs text-slate-200 focus:outline-none focus:border-mint-400"
                >
                  <option value="cyber_gaming">🎮 Cyber Gaming / Minecraft</option>
                  <option value="hyper_mint">⚡ Aurora Hyper-Mint</option>
                  <option value="urgent_danger">🚨 Urgent Warning / Danger</option>
                  <option value="split_contrast">⚖️ Split Screen / Before & After</option>
                </select>
              </div>
            </div>

            {/* Metadata Tags Pill Row */}
            <div className="flex items-center gap-2 flex-wrap pt-1 text-[11px]">
              <span className="text-slate-400 font-medium">Active Metadata Tags:</span>
              {tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-void-950 border border-white/10 text-mint-300 font-mono text-[10px]"
                >
                  #{tag}
                </span>
              ))}
              <span className="text-slate-500 text-[10px]">
                • Format:{" "}
                <strong className="text-mint-400">
                  {contentFormat === "shorts" ? "Shorts (9:16)" : "Long-Form (16:9)"}
                </strong>
              </span>
              <span className="text-slate-500 text-[10px]">
                • Channel: <strong className="text-white">{activeChannel?.title || "NoVoiceCraft"}</strong>
              </span>
            </div>

            {/* Safe Zone Advice Banner */}
            <div className="p-2.5 rounded-lg border border-white/10 bg-void-950/70 text-xs text-slate-300 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-mint-400 shrink-0 mt-0.5" />
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

        {/* ===================================================================
            WORKSPACE: CONTROLS & CONCEPTS (5 COLS) VS LIVE PREVIEW (7 COLS)
            =================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Controls & AI Concepts (5 Cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Manual Canvas Controls */}
            <Card className="aurora-card border border-white/10 shadow-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-mint-400" />
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
                    className="text-xs font-bold uppercase tracking-wide aurora-input"
                  />
                </div>

                {/* Accent Color */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Text Accent Color</label>
                  <div className="flex items-center gap-2">
                    {[
                      { name: "Electric Mint", hex: "#00F5A0" },
                      { name: "Cyber Cyan", hex: "#00D8F6" },
                      { name: "Solar Amber", hex: "#FFB800" },
                      { name: "Pure White", hex: "#FFFFFF" },
                      { name: "Danger Crimson", hex: "#EF4444" },
                      { name: "Neon Purple", hex: "#A855F7" },
                    ].map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => setTextColor(c.hex)}
                        style={{ backgroundColor: c.hex }}
                        className={`w-7 h-7 rounded-full border-2 transition-transform ${
                          textColor === c.hex ? "border-white scale-110 shadow-[0_0_8px_rgba(255,255,255,0.7)]" : "border-void-800"
                        }`}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Actions: Save & Assign and Export High-Res PNG */}
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    onClick={handleSaveThumbnail}
                    className="mint-btn-gradient flex-1 text-xs font-bold"
                  >
                    {savedSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5 mr-1.5 text-void-950" />
                        Saved & Assigned!
                      </>
                    ) : (
                      "Save & Assign to Video"
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadPNG}
                    className="text-xs border-white/10 text-white hover:border-mint-400/50"
                    title="Export High-Res PNG"
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5 text-mint-400" />
                    Export PNG
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* AI Generated Concepts Cards */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-mint-400" />
                  AI Thumbnail Concepts ({concepts.length})
                </h3>
                {generationOutput?.isHeuristicFallback === false && (
                  <Badge variant="mint" className="text-[10px]">
                    Live Gemini
                  </Badge>
                )}
              </div>

              <div className="space-y-3">
                {concepts.map((con) => (
                  <Card
                    key={con.id}
                    className="aurora-card border border-white/10 hover:border-mint-400/40 transition-all p-3.5 space-y-3 group"
                  >
                    {/* Header: Title + Category + CTR */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{con.name}</span>
                        <Badge variant="secondary" className="text-[10px]">
                          {con.category}
                        </Badge>
                      </div>
                      <span className="text-[10px] text-mint-400 font-semibold font-mono">
                        CTR: {con.estimatedCTR}
                      </span>
                    </div>

                    {/* Visual Preview Thumbnail Box */}
                    {con.generatedSvgUrl && (
                      <div className="relative rounded-lg overflow-hidden border border-white/10 bg-black aspect-video max-h-36">
                        <img
                          src={con.generatedSvgUrl}
                          alt={con.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[9px] font-mono text-mint-300 border border-white/10">
                          {con.stylePreset || "Visual Preset"}
                        </div>
                      </div>
                    )}

                    {/* Text Overlay & Layout */}
                    <div className="flex items-center gap-2">
                      <span
                        style={{ color: con.accentColor }}
                        className="px-2 py-0.5 rounded bg-black/90 font-extrabold text-xs uppercase tracking-wide border border-white/10"
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
                      <div className="p-2 rounded bg-void-950 border border-white/10 text-[10px] text-slate-400 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-300">AI Image Prompt (Midjourney / Flux):</span>
                          <button
                            type="button"
                            onClick={() => handleCopyPrompt(con.aiImagePrompt, con.id)}
                            className="text-mint-400 hover:text-white flex items-center gap-1 font-semibold"
                          >
                            {copiedPromptId === con.id ? (
                              <>
                                <Check className="w-3 h-3 text-mint-300" />
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
                        className="text-[11px] h-7 px-3 bg-void-950 hover:bg-mint-400 hover:text-void-950 border border-white/10 font-semibold"
                      >
                        Apply to Canvas →
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* ===================================================================
              RIGHT: REAL-TIME YOUTUBE SIMULATION (7 COLS)
              =================================================================== */}
          <div className="lg:col-span-7 space-y-5">
            <Card className="aurora-card border border-white/10 shadow-2xl">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base text-white flex items-center gap-2">
                    <Eye className="w-4 h-4 text-cyber-400" />
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
                            ? "border-mint-400/50 bg-mint-400/10 text-mint-300"
                            : "border-white/10 text-slate-400"
                        }`}
                      >
                        {showSafeZone ? "Safe Zone: ON" : "Safe Zone: OFF"}
                      </button>
                    )}
                    <Badge variant={contentFormat === "shorts" ? "cyber" : "solar"} className="text-[10px]">
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
                {/* -------------------------------------------------------------
                    A. LONG-FORM (16:9) PREVIEW CANVAS
                    ------------------------------------------------------------- */}
                {contentFormat === "long_form" && (
                  <div className="space-y-3">
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-white/10 shadow-2xl flex items-center justify-center select-none group">
                      <img
                        src={selectedImage}
                        alt="Thumbnail Preview"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />

                      {/* Subtle Vignette Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                      {/* Text Overlay (if not baked into SVG) */}
                      {!selectedImage.startsWith("data:image/svg") && overlayText && (
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
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-void-950 border border-white/10 shrink-0">
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
                          <span>{activeChannel?.title || "NoVoiceCraft"}</span>
                          <span>•</span>
                          <span>142K views</span>
                          <span>•</span>
                          <span>2 days ago</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* -------------------------------------------------------------
                    B. YOUTUBE SHORTS (9:16) PREVIEW CANVAS
                    ------------------------------------------------------------- */}
                {contentFormat === "shorts" && (
                  <div className="py-2 flex flex-col items-center justify-center">
                    {/* Vertical 9:16 Shorts Container */}
                    <div className="relative w-[280px] h-[497px] rounded-2xl overflow-hidden bg-black border-2 border-white/15 shadow-2xl select-none group">
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
                        <div className="absolute inset-x-3 top-[20%] bottom-[25%] right-14 border border-dashed border-mint-400/60 rounded-xl pointer-events-none flex flex-col justify-between p-2">
                          <span className="text-[9px] font-mono text-mint-300 bg-black/70 px-1 py-0.5 rounded self-start">
                            Safe Zone
                          </span>
                          <span className="text-[8px] font-mono text-mint-300/80 bg-black/70 px-1 py-0.5 rounded self-end">
                            Center Focal Area
                          </span>
                        </div>
                      )}

                      {/* High-CTR Text Overlay (if not baked into SVG) */}
                      {!selectedImage.startsWith("data:image/svg") && overlayText && (
                        <div className="absolute top-[28%] left-4 right-14 pointer-events-none text-center">
                          <span
                            style={{ color: textColor }}
                            className="inline-block px-3 py-1.5 rounded-xl bg-black/85 backdrop-blur-md border border-white/10 text-xl font-extrabold uppercase tracking-tight shadow-2xl drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]"
                          >
                            {overlayText}
                          </span>
                        </div>
                      )}

                      {/* Right Action Icons Column */}
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
                          <Music2 className="w-3.5 h-3.5 text-mint-400" />
                        </div>
                      </div>

                      {/* Bottom Channel Info & Sound Bar */}
                      <div className="absolute left-3 bottom-3 right-14 space-y-1 text-white pointer-events-none">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full overflow-hidden bg-void-950 border border-white/20">
                            {activeChannel?.thumbnail_url ? (
                              <img src={activeChannel.thumbnail_url} alt="Channel" className="w-full h-full object-cover" />
                            ) : (
                              <Youtube className="w-4 h-4 text-red-500 m-1.5" />
                            )}
                          </div>
                          <span className="text-xs font-bold text-white truncate">
                            {activeChannel?.title || "@NoVoiceCraft"}
                          </span>
                        </div>
                        <p className="text-[11px] font-semibold text-slate-200 line-clamp-1">
                          {videoTitle || topic}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Saved Thumbnails Bank */}
            {savedAssets.length > 0 && (
              <Card className="aurora-card border border-white/10 shadow-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-mint-400" />
                    Saved Thumbnails Bank ({savedAssets.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {savedAssets.map((asset) => (
                      <div
                        key={asset.id}
                        className="rounded-lg border border-white/10 overflow-hidden bg-void-950 p-2 space-y-2 group"
                      >
                        <div className="aspect-video rounded bg-black overflow-hidden relative">
                          <img src={asset.imageUrl} alt={asset.title} className="w-full h-full object-cover" />
                          <Badge variant="mint" className="absolute top-1 left-1 text-[8px]">
                            {asset.format}
                          </Badge>
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[11px] font-bold text-white truncate">{asset.title}</p>
                          <p className="text-[9px] text-slate-500">{asset.createdAt}</p>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setSelectedImage(asset.imageUrl);
                            setOverlayText(asset.textOverlay);
                            setContentFormat(asset.format);
                            toast.info("Loaded Asset", `Loaded thumbnail into studio.`);
                          }}
                          className="w-full text-[10px] h-6 bg-void-900 border border-white/10"
                        >
                          Load in Studio
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
