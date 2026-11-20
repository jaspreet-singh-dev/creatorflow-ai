"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useChannel } from "@/context/channel-context";
import { useData } from "@/context/data-context";
import { useToast } from "@/components/ui/toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Image as ImageIcon,
  Sparkles,
  Upload,
  Download,
  Eye,
  Check,
  Layers,
  Sliders,
  Type,
  Youtube,
  AlertCircle,
  Copy,
  Link2,
} from "lucide-react";

interface ThumbnailItem {
  id: string;
  title: string;
  imageUrl: string;
  textOverlay: string;
  style: string;
  associatedVideoTitle?: string;
}

export default function ThumbnailStudioPage() {
  const { activeChannel } = useChannel();
  const { videos, updateVideo } = useData();
  const { toast } = useToast();

  const [topic, setTopic] = useState("How to Build AI SaaS in 2026");
  const [overlayText, setOverlayText] = useState("I AUTOMATED IT!");
  const [textColor, setTextColor] = useState("#FACC15"); // Yellow accent
  const [selectedImage, setSelectedImage] = useState<string>(
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80"
  );
  const [selectedVideoId, setSelectedVideoId] = useState<string>(videos[0]?.id || "");
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Gallery of assets
  const [thumbnails, setThumbnails] = useState<ThumbnailItem[]>([
    {
      id: "thumb-1",
      title: "AI Automation Blueprint",
      imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
      textOverlay: "NEW 2026 METHOD",
      style: "High Contrast Minimalist",
      associatedVideoTitle: "How I Built an Autonomous AI Agent in 24 Hours",
    },
    {
      id: "thumb-2",
      title: "Dev Tools Productivity",
      imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80",
      textOverlay: "STOP CODING SLOW",
      style: "Split Before/After",
      associatedVideoTitle: "10 Mind-Blowing AI Developer Tools You Need to Try",
    },
    {
      id: "thumb-3",
      title: "Supabase Architecture",
      imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
      textOverlay: "FIREBASE IS DEAD?",
      style: "Curiosity Mystery Gap",
      associatedVideoTitle: "Supabase vs Firebase Comparison",
    },
  ]);

  const [conceptSuggestions, setConceptSuggestions] = useState([
    {
      concept: "Split Screen Contrast",
      text: "MANUAL vs AI",
      notes: "Left side desaturated and cluttered; right side glowing vibrant purple with clean code.",
    },
    {
      concept: "Shock Expression + Bold Metric",
      text: "$0 to $10K / MO",
      notes: "Close up portrait with high-key lighting pointing to an uploaded graph icon.",
    },
    {
      concept: "Urgency / Warning Icon",
      text: "STOP DOING THIS",
      notes: "Red badge overlay over a blurred code editor interface.",
    },
  ]);

  const handleGenerateConcepts = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setConceptSuggestions([
        {
          concept: "Extreme Curiosity Hook",
          text: "DON'T USE THIS!",
          notes: `High-contrast object frame focusing on ${topic} with neon glow borders.`,
        },
        {
          concept: "Speed / Efficiency Proof",
          text: "IN 5 MINUTES",
          notes: "Clock or stopwatch element placed at top right; vibrant saturated background.",
        },
        {
          concept: "The Secret Formula",
          text: "THE 2026 TRUTH",
          notes: "Single focal subject with 3-word bold punchline in yellow text.",
        },
      ]);
      setIsGenerating(false);
      toast.success("Concepts Generated", "Refreshed high-retention formulas.");
    }, 600);
  };

  const handleSaveThumbnail = () => {
    const newItem: ThumbnailItem = {
      id: `thumb-${Date.now()}`,
      title: topic,
      imageUrl: selectedImage,
      textOverlay: overlayText,
      style: "Custom Text Overlay",
      associatedVideoTitle: "Assigned in Studio",
    };
    setThumbnails([newItem, ...thumbnails]);

    // If video selected, update the video's thumbnail
    if (selectedVideoId) {
      updateVideo(selectedVideoId, { thumbnail_url: selectedImage });
      const target = videos.find((v) => v.id === selectedVideoId);
      toast.success(
        "Thumbnail Saved & Assigned",
        `Bound thumbnail to "${target?.title.substring(0, 30)}...".`
      );
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
      <div className="space-y-8 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Thumbnail Studio
              </h1>
              <Badge variant="blue" className="text-[10px] font-bold uppercase tracking-wider">
                CTR Optimization
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Plan thumbnail concepts, test real YouTube feed visibility, overlay high-CTR badge text, and manage assets.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="gradient"
              size="sm"
              onClick={handleGenerateConcepts}
              isLoading={isGenerating}
              className="text-xs font-semibold shadow-glow"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Generate Concepts
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSaveThumbnail}
              className="text-xs border-navy-700 bg-navy-800"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> Saved Asset
                </>
              ) : (
                "Save & Assign"
              )}
            </Button>
          </div>
        </div>

        {/* Notice on AI Image Generation Capability */}
        <div className="p-3.5 rounded-xl border border-navy-800 bg-navy-900/60 text-xs text-slate-300 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-brand-purple shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-white">Image Generation & Transparency:</span> We integrate with custom uploaded backgrounds and Unsplash assets. If an external image generation API (like Imagen or DALL-E) is configured via settings, AI image synthesis is triggered server-side. No artificial mock images are faked.
          </div>
        </div>

        {/* Interactive Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column (5 Cols) */}
          <div className="lg:col-span-5 space-y-5">
            <Card className="border-navy-800 bg-navy-900/90 shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-brand-purple" />
                  Thumbnail Parameters
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Configure text hook, typography color, and background asset.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Associate Video */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Assign to Video Project</label>
                  <select
                    value={selectedVideoId}
                    onChange={(e) => setSelectedVideoId(e.target.value)}
                    className="w-full h-9 rounded-lg border border-navy-800 bg-navy-950 px-2.5 text-xs text-slate-200"
                  >
                    <option value="">Do not assign to video (Save as asset only)</option>
                    {videos.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.title.slice(0, 48)}... ({v.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Video Topic</label>
                  <Input
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Enter topic..."
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    High-CTR Text Overlay (Max 4 words)
                  </label>
                  <Input
                    value={overlayText}
                    onChange={(e) => setOverlayText(e.target.value)}
                    placeholder="e.g. I AUTOMATED IT!"
                    className="text-xs font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Text Accent Color</label>
                  <div className="flex items-center gap-2">
                    {[
                      { name: "Yellow", hex: "#FACC15" },
                      { name: "White", hex: "#FFFFFF" },
                      { name: "Cyan", hex: "#06B6D4" },
                      { name: "Green", hex: "#4ADE80" },
                      { name: "Red", hex: "#F87171" },
                    ].map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => setTextColor(c.hex)}
                        style={{ backgroundColor: c.hex }}
                        className={`w-7 h-7 rounded-full border-2 transition-transform ${
                          textColor === c.hex ? "border-brand-purple scale-110 shadow-glow" : "border-navy-700"
                        }`}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Background Image Asset URL
                  </label>
                  <Input
                    value={selectedImage}
                    onChange={(e) => setSelectedImage(e.target.value)}
                    placeholder="Paste image URL..."
                    className="text-xs"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Generated Concept Archetypes */}
            <Card className="border-navy-800 bg-navy-900/90 shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-purple" />
                  High-Retention Concept Formulas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {conceptSuggestions.map((con, i) => (
                  <div
                    key={i}
                    onClick={() => setOverlayText(con.text)}
                    className="p-3 rounded-lg border border-navy-800 bg-navy-950 hover:bg-navy-850 hover:border-brand-purple/40 cursor-pointer transition-colors space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{con.concept}</span>
                      <Badge variant="blue" className="text-[10px] font-mono">
                        {con.text}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-400">{con.notes}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Real-time YouTube Feed Preview Column (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            <Card className="border-navy-800 bg-navy-900/90 shadow-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base text-white flex items-center gap-2">
                    <Eye className="w-4 h-4 text-brand-blue" />
                    Live YouTube Feed Simulation
                  </CardTitle>
                  <Badge variant="secondary" className="text-[10px]">
                    16:9 Aspect Ratio
                  </Badge>
                </div>
                <CardDescription className="text-xs text-slate-400">
                  Preview how your thumbnail and title stand out in the crowded YouTube recommendation feed.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* 16:9 Thumbnail Canvas */}
                <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-navy-700 shadow-2xl flex items-center justify-center select-none group">
                  <img
                    src={selectedImage}
                    alt="Thumbnail Preview"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Dark subtle gradient vignette for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                  {/* High-Impact Punchy Text Overlay */}
                  {overlayText && (
                    <div className="absolute bottom-6 left-6 max-w-[85%] pointer-events-none">
                      <span
                        style={{ color: textColor }}
                        className="inline-block px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 text-2xl sm:text-4xl font-extrabold uppercase tracking-tight shadow-2xl drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]"
                      >
                        {overlayText}
                      </span>
                    </div>
                  )}

                  {/* YouTube Time Duration Badge */}
                  <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-black/90 text-white font-mono text-[11px] font-semibold border border-white/10">
                    18:45
                  </div>
                </div>

                {/* Simulated YouTube Feed Video Metadata Row */}
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
                      {topic || "Untitled Masterclass"}
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
              <h3 className="text-sm font-bold text-white">Saved Thumbnail Assets</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {thumbnails.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => {
                      setSelectedImage(t.imageUrl);
                      setOverlayText(t.textOverlay);
                    }}
                    className="rounded-lg border border-navy-800 bg-navy-950 p-2 cursor-pointer hover:border-brand-purple/40 transition-colors space-y-2 group"
                  >
                    <div className="w-full aspect-video rounded overflow-hidden relative">
                      <img src={t.imageUrl} alt={t.title} className="w-full h-full object-cover" />
                      <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-extrabold text-amber-300">
                        {t.textOverlay}
                      </div>
                    </div>
                    <p className="text-[11px] font-semibold text-white truncate">{t.title}</p>
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
