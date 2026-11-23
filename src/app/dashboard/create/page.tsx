"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useData } from "@/context/data-context";
import { useChannel } from "@/context/channel-context";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/components/ui/toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import {
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  RefreshCw,
  FolderPlus,
  ChevronDown,
  ChevronUp,
  FileText,
  Tag,
  Hash,
  Eye,
  MessageSquare,
  Zap,
  Layers,
  History,
  Save,
  Clock,
  Trash2,
  Undo2,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Youtube,
  Sliders,
  Play,
  RotateCcw,
  Smartphone,
  Monitor,
  Flame,
  Film,
  ThumbsUp,
  Share2,
  Download,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  GeneratedMetadataOutput,
  SectionType,
  CompleteVideoPackage,
  ThumbnailConcept,
} from "@/lib/ai/gemini";
import { ProjectVersion, ProjectVersionSnapshot, VideoProject } from "@/types/database.types";

const POPULAR_NICHES = [
  "Minecraft & Gaming",
  "Gaming",
  "Tech & Coding",
  "AI & Automation",
  "Finance & Crypto",
  "Productivity & SaaS",
  "Entertainment",
  "Education & Science",
];

const PROMPT_CHIPS = [
  {
    label: "🔥 1000-Block Cauldron Clutch",
    topic: "CAN WATER CAULDRON SAVE ME FROM 1000 BLOCKS?! 💀 #minecraft",
    format: "shorts",
    niche: "Minecraft & Gaming",
    audience: "Minecraft gamers & Shorts viewers",
  },
  {
    label: "🎬 100 Days Hardcore Survival",
    topic: "I Survived 100 Days in Minecraft Hardcore with Only 1 Heart",
    format: "long-form",
    niche: "Minecraft & Gaming",
    audience: "Long-form gaming fans & story lovers",
  },
  {
    label: "⚡ Hay Bale vs 5000 Blocks",
    topic: "Testing 10 Impossible Minecraft Fall Damage Myths",
    format: "shorts",
    niche: "Minecraft & Gaming",
    audience: "Minecraft challenge & myth enthusiasts",
  },
  {
    label: "💎 Fastest Ancient Debris Route",
    topic: "The Netherite Mining Secret Speedrunners Don't Tell You",
    format: "shorts",
    niche: "Minecraft & Gaming",
    audience: "Speedrunners & technical Minecraft players",
  },
  {
    label: "💀 Pitch Darkness Challenge",
    topic: "Can You Beat Minecraft If Every Light Source Is Banned?",
    format: "long-form",
    niche: "Minecraft & Gaming",
    audience: "Hardcore gaming community",
  },
];

type StudioTab = "titles" | "hooks" | "script" | "seo" | "tags" | "thumbnail" | "versions";

function CreateVideoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialProjectId = searchParams.get("projectId");

  const { user } = useAuth();
  const { activeChannel } = useChannel();
  const {
    projects,
    videos,
    addProject,
    updateProject,
    getProject,
    saveProjectVersion,
    restoreProjectVersion,
    deleteProjectVersion,
    checkQuota,
  } = useData();
  const { toast } = useToast();

  // Active Tab & View Mode
  const [activeTab, setActiveTab] = useState<StudioTab>("titles");
  const [previewMode, setPreviewMode] = useState<"shorts" | "desktop">("shorts");

  // Core Form Inputs
  const [topic, setTopic] = useState("CAN WATER CAULDRON SAVE ME FROM 1000 BLOCKS?! 💀 #minecraft");
  const [niche, setNiche] = useState("Minecraft & Gaming");
  const [contentType, setContentType] = useState<"shorts" | "long-form">("shorts");
  const [targetAudience, setTargetAudience] = useState("Minecraft players & YouTube Shorts viewers");
  const [language, setLanguage] = useState("English");

  // Advanced Options State
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [primaryKeyword, setPrimaryKeyword] = useState("Minecraft MLG clutch");
  const [secondaryKeywords, setSecondaryKeywords] = useState("water cauldron, fall damage, minecraft shorts");
  const [preferredTone, setPreferredTone] = useState("high-energy & suspenseful");
  const [transcriptNotes, setTranscriptNotes] = useState("");

  // AI Generated Content State
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [isRegeneratingSection, setIsRegeneratingSection] = useState<string | null>(null);
  const [generatedOutput, setGeneratedOutput] = useState<GeneratedMetadataOutput | null>({
    titles: [
      "CAN WATER CAULDRON SAVE ME FROM 1000 BLOCKS?! 💀",
      "I Tested The Most IMPOSSIBLE Minecraft MLG Clutch...",
      "1000 Blocks vs 1 Water Cauldron (Minecraft Myth)",
      "Why 99% Of Minecraft Players Fail This Clutch 😱",
      "The 0.01s Minecraft Water Cauldron Clutch You Must See",
    ],
    description: `Testing if a single water cauldron can absorb 1000 blocks of Minecraft terminal velocity fall damage in 2026! Can we hit the pixel-perfect frame window?\n\n⏱️ TIMESTAMPS:\n0:00 The 1000 Block Drop Setup\n0:12 Terminal Velocity Physics\n0:28 The 0.01s Frame Window\n0:45 The Final Clutch Attempt\n\n💬 Question of the day: What is your favorite Minecraft MLG clutch item?\n\n🔔 Subscribe to NoVoiceCraft for daily Minecraft experiments & clutches!`,
    tags: [
      "minecraft",
      "minecraft shorts",
      "minecraft mlg clutch",
      "water cauldron",
      "minecraft fall damage",
      "gaming shorts",
      "minecraft myths",
      "minecraft challenge",
      "novoicecraft",
      "craftvortex",
    ],
    hashtags: ["#minecraft", "#minecraftshorts", "#gaming", "#mlg", "#clutch"],
    pinnedComment: "💬 What clutch item should I test next from world height limit? Let me know below!",
    chapters: [
      { time: "0:00", title: "The 1000 Block Drop" },
      { time: "0:15", title: "Pixel Perfect Window" },
      { time: "0:35", title: "Terminal Velocity" },
      { time: "0:50", title: "The Verdict" },
    ],
    thumbnailIdeas: ["CAN IT SAVE ME?! 💀", "1000 BLOCKS DROP", "0.01s CLUTCH"],
    qualityScore: {
      overall: 96,
      clarity: 98,
      relevance: 95,
      readability: 96,
      keywordCoverage: 94,
      critique: ["High curiosity gap in primary title", "Well-paced 0:00 retention hook"],
    },
  });
  const [completePackage, setCompletePackage] = useState<CompleteVideoPackage | null>(null);
  const [thumbnailConcepts, setThumbnailConcepts] = useState<ThumbnailConcept[]>([
    {
      id: "concept-1",
      mainSubject: "Player character falling at terminal velocity towards a tiny glowing cauldron",
      composition: "Extreme vertical angle with high motion blur and fiery speed lines",
      background: "Dark void background with neon cyan water highlight",
      visualFocus: "Water cauldron glowing at bottom center",
      textSuggestion: "CAN IT SAVE ME?! 💀",
      contrast: "High contrast neon/white on dark",
      readability: "Large 3D extruded yellow text at top center",
    },
  ]);
  const [selectedTitleIndex, setSelectedTitleIndex] = useState(0);

  // Editable Working State
  const [editableScript, setEditableScript] = useState(`[00:00 - RETENTION HOOK]
"Most Minecraft players believe a water bucket is the only MLG clutch in the game... but what happens when you drop from 1000 BLOCKS into a tiny cauldron?!"

[00:08 - VISUAL PATTERN INTERRUPT]
[VISUAL: Rapid countdown camera zoom from Y=1024 down to bedrock]
Terminal velocity in Minecraft caps out at 78.4 blocks per second. At this speed, server tick lag means you only have a 0.01 second window to hit the hit-box.

[00:25 - THE DROP]
[VISUAL: Freefall with wind sound fx, screen shaking]
3... 2... 1... Cauldron sighted! If I miss by ONE pixel, it's instant death.

[00:42 - THE IMPACT & VERDICT]
[VISUAL: Slow-mo splash particle effect]
WE DID IT! Water cauldron completely negates all 1000 blocks of fall damage!

[00:55 - OUTRO & CALL TO ACTION]
Subscribe right now or this creeper spawns in your base tonight!`);
  const [editableDescription, setEditableDescription] = useState(
    `Testing if a single water cauldron can absorb 1000 blocks of Minecraft terminal velocity fall damage in 2026! Can we hit the pixel-perfect frame window?\n\n⏱️ TIMESTAMPS:\n0:00 The 1000 Block Drop Setup\n0:12 Terminal Velocity Physics\n0:28 The 0.01s Frame Window\n0:45 The Final Clutch Attempt\n\n💬 Question of the day: What is your favorite Minecraft MLG clutch item?\n\n🔔 Subscribe to NoVoiceCraft for daily Minecraft experiments & clutches!`
  );
  const [editableTags, setEditableTags] = useState<string[]>([
    "minecraft",
    "minecraft shorts",
    "minecraft mlg clutch",
    "water cauldron",
    "minecraft fall damage",
    "gaming shorts",
    "minecraft myths",
    "minecraft challenge",
    "novoicecraft",
    "craftvortex",
  ]);
  const [editableHashtags, setEditableHashtags] = useState<string[]>([
    "#minecraft",
    "#minecraftshorts",
    "#gaming",
    "#mlg",
    "#clutch",
  ]);
  const [editableThumbnailText, setEditableThumbnailText] = useState("CAN IT SAVE ME?! 💀");
  const [aiThumbnailImage, setAiThumbnailImage] = useState<string | null>(null);
  const [isGeneratingThumbnailImage, setIsGeneratingThumbnailImage] = useState(false);
  const [editablePinnedComment, setEditablePinnedComment] = useState(
    "💬 What clutch item should I test next from world height limit? Let me know below!"
  );
  const [openingHooks, setOpeningHooks] = useState<any[]>([
    {
      hook: "Most Minecraft players believe a water bucket is the only clutch... but what happens from 1000 BLOCKS?!",
      angle: "Curiosity & High Stakes",
      retentionRating: "9.8/10",
    },
    {
      hook: "I tried the rarest 0.01-second Minecraft clutch so you don't lose your hardcore world.",
      angle: "Loss Aversion & Hardcore",
      retentionRating: "9.6/10",
    },
    {
      hook: "Minecraft physics says this shouldn't work. Here is what actually happened at terminal velocity.",
      angle: "Mythbuster & Science",
      retentionRating: "9.5/10",
    },
  ]);

  // Section-Level Undo Cache
  const [undoCache, setUndoCache] = useState<Record<string, any>>({});

  // Active Project Reference & Autosave State
  const [activeProjectId, setActiveProjectId] = useState<string | null>(initialProjectId || null);
  const [autosaveStatus, setAutosaveStatus] = useState<"idle" | "saving" | "saved" | "error">("saved");
  const [lastSavedTime, setLastSavedTime] = useState<string | null>("Just now");
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Version Snapshot Modal State
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [customVersionName, setCustomVersionName] = useState("");
  const [selectedPreviewVersion, setSelectedPreviewVersion] = useState<ProjectVersion | null>(null);

  // Clipboard Feedback State
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Channel Context Extraction
  const getChannelContextPayload = useCallback(() => {
    if (!activeChannel) return undefined;
    const channelVideos = videos.filter((v) => v.channel_id === activeChannel.id);
    const recentTopics = channelVideos.slice(0, 5).map((v) => v.title);

    return {
      channelTitle: activeChannel.title,
      niche,
      subscriberCount: activeChannel.subscriber_count,
      recentVideoTopics: recentTopics.length > 0 ? recentTopics : ["Minecraft Clutch", "Gaming Shorts", "Minecraft Myths"],
      isDemo: activeChannel.id.startsWith("chan-demo"),
    };
  }, [activeChannel, videos, niche]);

  // Handle Full AI Generation (One-Click Studio Package)
  const handleGenerateCompletePackage = async () => {
    if (!topic.trim()) {
      toast.warning("Topic Required", "Please enter a video topic first.");
      return;
    }

    const quota = checkQuota("ai");
    if (!quota.allowed) {
      toast.error("Monthly Quota Limit", `You have used ${quota.current}/${quota.max} AI generations.`);
      return;
    }

    setIsGeneratingAll(true);

    try {
      const derivedKeyword = primaryKeyword.trim() || topic.trim().split(" ").slice(0, 4).join(" ");
      const derivedSec = secondaryKeywords
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const channelCtx = getChannelContextPayload();

      const res = await fetch("/api/ai/package", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.id || "demo-session"}`,
        },
        body: JSON.stringify({
          topic: topic.trim(),
          niche,
          contentType,
          targetAudience,
          primaryKeyword: derivedKeyword,
          secondaryKeywords: derivedSec.length > 0 ? derivedSec : [niche, contentType, "2026"],
          language,
          channelContext: channelCtx,
        }),
      });

      const json = await res.json();
      if (json.success && json.package) {
        const pkg = json.package as CompleteVideoPackage;
        setCompletePackage(pkg);

        const titleList =
          Array.isArray(pkg.multipleTitles) && pkg.multipleTitles.length > 0
            ? pkg.multipleTitles.map((t) => t.title)
            : [pkg.recommendedTitle];
        const recIdx = titleList.indexOf(pkg.recommendedTitle);
        setSelectedTitleIndex(recIdx >= 0 ? recIdx : 0);

        setGeneratedOutput({
          titles: titleList,
          description: pkg.completeDescription,
          tags: pkg.youtubeTags,
          hashtags: pkg.hashtags,
          pinnedComment: "💬 Question of the day: What clutch item should I test next?",
          chapters: (pkg.videoOutline || []).map((o) => ({ time: o.time, title: o.title })),
          thumbnailIdeas: (pkg.thumbnailConcepts || []).map((c) => c.textSuggestion),
          isHeuristicFallback: pkg.isHeuristicFallback,
          qualityScore: pkg.qualityScore || {
            overall: 95,
            clarity: 95,
            relevance: 95,
            readability: 95,
            keywordCoverage: 95,
            critique: [],
          },
        });

        setEditableDescription(pkg.completeDescription);
        setEditableTags(pkg.youtubeTags);
        setEditableHashtags(pkg.hashtags);
        if (pkg.thumbnailConcepts && pkg.thumbnailConcepts.length > 0) {
          setThumbnailConcepts(pkg.thumbnailConcepts);
          setEditableThumbnailText(pkg.thumbnailConcepts[0]?.textSuggestion || "NEW BLUEPRINT");
        }
        if (pkg.openingHook) {
          setOpeningHooks([
            { hook: pkg.openingHook, angle: "Curiosity & Pattern Interrupt", retentionRating: "9.8/10" },
          ]);
        }

        const generatedScript = `[00:00 - OPENING RETENTION HOOK]
${pkg.openingHook}

[00:15 - PREMISE & WHY THIS MATTERS]
Today we test ${topic} step-by-step for ${targetAudience}.

[CHAPTER BREAKDOWN]
${(pkg.videoOutline || []).map((c) => `[${c.time} - ${c.title}]\n• Key talking point: ${c.notes || "Core breakdown"}\n• [VISUAL: Screen demonstration & b-roll]`).join("\n\n")}

[OUTRO & COMMUNITY CALL TO ACTION]
Leave your biggest question in the comments below, and subscribe for weekly drops!`;

        setEditableScript(generatedScript);
        toast.success("Studio Package Generated", "All 11 sections formulated with high-virality ratings.");
      } else {
        toast.error("Generation Issue", json.error || "Could not generate video package.");
      }
    } catch (err: any) {
      toast.error("Connection Error", err?.message || "Failed to reach AI package server.");
    } finally {
      setIsGeneratingAll(false);
    }
  };

  // Section-Level Regeneration
  const handleRegenerateSection = async (section: SectionType) => {
    if (!topic.trim()) {
      toast.warning("Topic Required", "Enter a topic before regenerating sections.");
      return;
    }

    const quota = checkQuota("ai");
    if (!quota.allowed) {
      toast.error("Quota Exceeded", "Monthly AI generation limit reached.");
      return;
    }

    setIsRegeneratingSection(section);

    const currentSnapshot = {
      titles: generatedOutput?.titles,
      hooks: openingHooks,
      script: editableScript,
      outline: generatedOutput?.chapters,
      description: editableDescription,
      tags: editableTags,
      hashtags: editableHashtags,
      thumbnailText: editableThumbnailText,
      pinnedComment: editablePinnedComment,
    };
    setUndoCache((prev) => ({ ...prev, [section]: currentSnapshot[section as keyof typeof currentSnapshot] }));

    try {
      const chosenTitle = generatedOutput?.titles?.[selectedTitleIndex] || topic;
      const res = await fetch("/api/ai/section", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.id || "demo-session"}`,
        },
        body: JSON.stringify({
          section,
          topic: topic.trim(),
          niche,
          contentType,
          targetAudience,
          selectedTitle: chosenTitle,
          currentScript: editableScript,
          language,
          channelContext: getChannelContextPayload(),
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || `Could not regenerate ${section}`);
      }

      const returned = data.data;

      if (section === "titles" && Array.isArray(returned)) {
        setGeneratedOutput((prev) => (prev ? { ...prev, titles: returned } : null));
        setSelectedTitleIndex(0);
        toast.success("Titles Regenerated", "5 fresh curiosity-gap title variations generated.");
      } else if (section === "hooks" && Array.isArray(returned)) {
        setOpeningHooks(returned);
        toast.success("Hooks Regenerated", "3 high-retention opening hooks generated.");
      } else if (section === "script" && typeof returned === "string") {
        setEditableScript(returned);
        toast.success("Script Regenerated", "Fresh structured script draft generated.");
      } else if (section === "outline" && Array.isArray(returned)) {
        setGeneratedOutput((prev) => (prev ? { ...prev, chapters: returned } : null));
        toast.success("Outline Regenerated", "Updated chapter breakdown and timestamps.");
      } else if (section === "description" && typeof returned === "string") {
        setEditableDescription(returned);
        toast.success("Description Regenerated", "SEO-optimized YouTube description refreshed.");
      } else if (section === "tags" && Array.isArray(returned)) {
        setEditableTags(returned);
        toast.success("Tags Regenerated", "Relevant search tags refreshed.");
      } else if (section === "hashtags" && Array.isArray(returned)) {
        setEditableHashtags(returned);
        toast.success("Hashtags Regenerated", "Updated hashtag recommendations.");
      } else if (section === "thumbnailText" && Array.isArray(returned)) {
        setEditableThumbnailText(returned[0] || "NEW VIDEO");
        toast.success("Thumbnail Text Regenerated", "Punchy thumbnail text refreshed.");
      } else if (section === "pinnedComment" && typeof returned === "string") {
        setEditablePinnedComment(returned);
        toast.success("Pinned Comment Regenerated", "Community engagement question refreshed.");
      }
    } catch (err: any) {
      toast.error("Regeneration Failed", err?.message || "Failed to regenerate section.");
    } finally {
      setIsRegeneratingSection(null);
    }
  };

  // Section-Level Undo
  const handleUndoSection = (section: SectionType) => {
    const prevData = undoCache[section];
    if (prevData === undefined) return;

    if (section === "titles") {
      setGeneratedOutput((prev) => (prev ? { ...prev, titles: prevData } : null));
    } else if (section === "hooks") {
      setOpeningHooks(prevData);
    } else if (section === "script") {
      setEditableScript(prevData);
    } else if (section === "outline") {
      setGeneratedOutput((prev) => (prev ? { ...prev, chapters: prevData } : null));
    } else if (section === "description") {
      setEditableDescription(prevData);
    } else if (section === "tags") {
      setEditableTags(prevData);
    } else if (section === "hashtags") {
      setEditableHashtags(prevData);
    } else if (section === "thumbnailText") {
      setEditableThumbnailText(prevData);
    } else if (section === "pinnedComment") {
      setEditablePinnedComment(prevData);
    }

    setUndoCache((prev) => {
      const copy = { ...prev };
      delete copy[section];
      return copy;
    });

    toast.info("Undone", `Restored previous ${section} state.`);
  };

  // Generate Thumbnail via AI for Current Project
  const handleGenerateStudioThumbnailImage = async () => {
    setIsGeneratingThumbnailImage(true);
    try {
      const res = await fetch("/api/ai/thumbnails/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.id || "demo-session"}`,
        },
        body: JSON.stringify({
          topic: topic || "CAN WATER CAULDRON SAVE ME?!",
          videoTitle: generatedOutput?.titles?.[selectedTitleIndex] || topic,
          description: editableDescription,
          tags: editableTags,
          format: contentType === "shorts" ? "shorts" : "long_form",
          niche,
          textOverlay: editableThumbnailText || "CAN IT SAVE ME?!",
          accentColor: "#00F5A0",
          channelContext: getChannelContextPayload(),
        }),
      });
      const data = await res.json();
      if (data.success && data.data?.imageUrl) {
        setAiThumbnailImage(data.data.imageUrl);
        if (data.data.textOverlay) {
          setEditableThumbnailText(data.data.textOverlay);
        }
        toast.success(
          "Generative AI Theme Created",
          `Designed "${data.data.theme?.themeName || "Custom Theme"}" tailored to this video.`
        );
      } else {
        toast.error("Generation Issue", data.error || "Failed to generate visual.");
      }
    } catch (err: any) {
      toast.error("Generation Error", err?.message || "Could not reach generator.");
    } finally {
      setIsGeneratingThumbnailImage(false);
    }
  };

  // Save or Update Video Project
  const handleSaveToProject = () => {
    const chosenTitle = generatedOutput?.titles?.[selectedTitleIndex] || topic || "Untitled Project";

    if (activeProjectId) {
      updateProject(activeProjectId, {
        name: chosenTitle,
        topic,
        niche,
        contentType,
        targetAudience,
        language,
        selectedTitle: chosenTitle,
        titleSuggestions: generatedOutput?.titles || [chosenTitle],
        hook: openingHooks[0]?.hook || "",
        hookSuggestions: openingHooks.map((h) => h.hook),
        script: editableScript,
        description: editableDescription,
        tags: editableTags,
        hashtags: editableHashtags,
        thumbnailText: editableThumbnailText,
        pinnedComment: editablePinnedComment,
        chapters: generatedOutput?.chapters || [],
        qualityScore: generatedOutput?.qualityScore,
        status: "scripting",
      });

      saveProjectVersion(
        activeProjectId,
        `Savepoint ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
        {
          selectedTitle: chosenTitle,
          script: editableScript,
          description: editableDescription,
          tags: editableTags,
          hook: openingHooks[0]?.hook || "",
        },
        "User confirmed studio project update"
      );

      toast.success("Project Saved", `Updated "${chosenTitle.substring(0, 32)}...".`);
    } else {
      const newProj = addProject({
        name: chosenTitle,
        topic,
        niche,
        contentType,
        targetAudience,
        language,
        selectedTitle: chosenTitle,
        titleSuggestions: generatedOutput?.titles || [chosenTitle],
        hook: openingHooks[0]?.hook || "",
        hookSuggestions: openingHooks.map((h) => h.hook),
        script: editableScript,
        description: editableDescription,
        tags: editableTags,
        hashtags: editableHashtags,
        thumbnailText: editableThumbnailText,
        pinnedComment: editablePinnedComment,
        chapters: generatedOutput?.chapters || [],
        qualityScore: generatedOutput?.qualityScore,
        channel_id: activeChannel?.id || "chan-demo-1",
        status: "scripting",
      });

      setActiveProjectId(newProj.id);

      saveProjectVersion(
        newProj.id,
        "Version 1 - Studio Creation",
        {
          selectedTitle: chosenTitle,
          script: editableScript,
          description: editableDescription,
          tags: editableTags,
          hook: openingHooks[0]?.hook || "",
        },
        "Initial creation from CreatorFlow AI Studio"
      );

      toast.success("Project Created", `New video project created in workspace.`);
    }
  };

  // Push to Publishing Pipeline
  const handlePushToPublish = () => {
    handleSaveToProject();
    router.push(`/dashboard/publish?tab=projects`);
  };

  // Copy Full Package to Clipboard
  const handleCopyFullPackage = () => {
    const chosenTitle = generatedOutput?.titles?.[selectedTitleIndex] || topic;
    const fullText = `=== CREATORFLOW AI STUDIO PACKAGE ===
TITLE:
${chosenTitle}

FORMAT:
${contentType.toUpperCase()}

OPENING HOOK:
${openingHooks[0]?.hook || "None"}

SCRIPT:
${editableScript}

SEO DESCRIPTION:
${editableDescription}

TAGS:
${editableTags.join(", ")}

HASHTAGS:
${editableHashtags.join(" ")}

PINNED COMMENT:
${editablePinnedComment}

THUMBNAIL TEXT:
${editableThumbnailText}
`;
    navigator.clipboard.writeText(fullText);
    toast.success("Complete Package Copied", "All titles, hooks, script & tags copied to clipboard.");
  };

  // Quick Copy Helper
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Copied to Clipboard", "Ready to paste.");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const activeProject = activeProjectId ? getProject(activeProjectId) : undefined;
  const projectVersions = activeProject?.versions || [];

  const handleCreateVersionSnapshot = () => {
    if (!activeProjectId) {
      toast.warning("Save Project First", "Please save as a Video Project before creating version history.");
      return;
    }

    const chosenTitle = generatedOutput?.titles?.[selectedTitleIndex] || topic;
    const versionName =
      customVersionName.trim() ||
      `Draft ${projectVersions.length + 1} (${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})`;

    saveProjectVersion(
      activeProjectId,
      versionName,
      {
        selectedTitle: chosenTitle,
        titleSuggestions: generatedOutput?.titles,
        script: editableScript,
        description: editableDescription,
        tags: editableTags,
        hashtags: editableHashtags,
        thumbnailText: editableThumbnailText,
        pinnedComment: editablePinnedComment,
        hook: openingHooks[0]?.hook,
        hookSuggestions: openingHooks.map((h) => h.hook),
        chapters: generatedOutput?.chapters,
      },
      "Manual snapshot saved by creator"
    );

    setCustomVersionName("");
    toast.success("Snapshot Saved", `Saved "${versionName}".`);
  };

  const handleRestoreVersion = (ver: ProjectVersion) => {
    if (!activeProjectId) return;
    const restored = restoreProjectVersion(activeProjectId, ver.id);
    if (restored) {
      const snap = ver.snapshot;
      if (snap.selectedTitle && generatedOutput) {
        const idx = generatedOutput.titles.indexOf(snap.selectedTitle);
        setSelectedTitleIndex(idx >= 0 ? idx : 0);
      }
      if (snap.script !== undefined) setEditableScript(snap.script);
      if (snap.description !== undefined) setEditableDescription(snap.description);
      if (snap.tags) setEditableTags(snap.tags);
      if (snap.hashtags) setEditableHashtags(snap.hashtags);
      if (snap.thumbnailText !== undefined) setEditableThumbnailText(snap.thumbnailText);
      if (snap.pinnedComment !== undefined) setEditablePinnedComment(snap.pinnedComment);
      if (snap.hookSuggestions) {
        setOpeningHooks(
          snap.hookSuggestions.map((h, i) => ({
            hook: h,
            angle: i === 0 ? "Problem-first" : i === 1 ? "Curiosity gap" : "Contrarian",
            retentionRating: "9.5/10",
          }))
        );
      }
      setIsVersionModalOpen(false);
      setSelectedPreviewVersion(null);
      toast.success("Version Restored", `Restored "${ver.name}".`);
    }
  };

  const wordCount = editableScript.trim().split(/\s+/).filter(Boolean).length;
  const estimatedReadTimeSeconds = Math.max(15, Math.round((wordCount / 140) * 60));
  const currentTitle = generatedOutput?.titles?.[selectedTitleIndex] || topic;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-24">
        {/* =====================================================================
            TOP BAR: MISSION CONTROL & HEADER
            ===================================================================== */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-navy-800 pb-5">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-brand-purple/15 text-brand-purple border border-brand-purple/30 flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-brand-purple" />
                AI Video Studio
              </span>

              {/* Active Channel Badge */}
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-navy-900 border border-navy-700/80 text-slate-300 flex items-center gap-1.5 shadow-sm">
                <Youtube className="w-3.5 h-3.5 text-red-500" />
                <span>{activeChannel?.title || "NoVoiceCraft"}</span>
                <span className="text-slate-500 font-normal">
                  ({activeChannel?.subscriber_count ? `${activeChannel.subscriber_count.toLocaleString()} subs` : "335 subs"})
                </span>
              </span>

              {/* Autosave Status */}
              <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-navy-950 border border-navy-800 text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Autosaved</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-2 flex items-center gap-2">
              <span>Creator Studio</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-brand-purple/20 text-brand-purple border border-brand-purple/30">
                PRO
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Formulate viral titles, retention hooks, full scripts, and SEO metadata with real-time YouTube simulation.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {activeProjectId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsVersionModalOpen(true)}
                className="text-xs border-navy-700 bg-navy-900/80 text-slate-300 hover:text-white"
              >
                <History className="w-3.5 h-3.5 mr-1.5 text-brand-purple" />
                Versions ({projectVersions.length})
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (confirm("Reset current studio draft to start a fresh video?")) {
                  setTopic("");
                  setGeneratedOutput(null);
                  setOpeningHooks([]);
                  setEditableScript("");
                  setEditableDescription("");
                  setActiveProjectId(null);
                  toast.info("Draft Cleared", "Ready for a new video concept.");
                }
              }}
              className="text-xs border-navy-800 bg-navy-950 text-slate-400 hover:text-slate-200"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Reset
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveToProject}
              className="text-xs font-semibold px-3 border-navy-700 bg-navy-900 hover:bg-navy-800 text-slate-200"
            >
              <Save className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
              {activeProjectId ? "Save Project" : "Save as Project"}
            </Button>

            <Button
              variant="gradient"
              size="sm"
              onClick={handlePushToPublish}
              className="text-xs font-semibold px-4 shadow-glow"
            >
              <Layers className="w-3.5 h-3.5 mr-1.5" />
              Publish Pipeline →
            </Button>
          </div>
        </div>

        {/* =====================================================================
            CREATIVE SPARK LAUNCHPAD (QUICK CHIPS & UNIFIED INPUT)
            ===================================================================== */}
        <div className="rounded-2xl border border-navy-700/80 bg-gradient-to-b from-navy-900/90 to-navy-950/90 p-4 sm:p-5 shadow-xl space-y-4">
          {/* Quick Inspiration Chips */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                Quick Inspiration (1-Click Gaming & Minecraft Ideas):
              </span>
              <span className="text-[11px] text-slate-500">Click to instantly populate studio</span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-navy-700">
              {PROMPT_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setTopic(chip.topic);
                    setContentType(chip.format as any);
                    setPreviewMode(chip.format === "shorts" ? "shorts" : "desktop");
                    setNiche(chip.niche);
                    setTargetAudience(chip.audience);
                    toast.success("Idea Loaded", `Loaded "${chip.label}" into Studio.`);
                  }}
                  className="whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-medium bg-navy-950/90 hover:bg-navy-800 border border-navy-700/70 hover:border-brand-purple/60 text-slate-300 hover:text-white transition-all shadow-sm cursor-pointer"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Unified Input + Format Switcher */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Format Toggle Pill */}
              <div className="flex items-center p-1 rounded-xl bg-navy-950 border border-navy-800 shrink-0 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => {
                    setContentType("shorts");
                    setPreviewMode("shorts");
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    contentType === "shorts"
                      ? "bg-brand-purple text-white shadow-glow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Shorts (9:16)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setContentType("long-form");
                    setPreviewMode("desktop");
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    contentType === "long-form"
                      ? "bg-brand-blue text-white shadow-glow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Long-Form (16:9)</span>
                </button>
              </div>

              {/* Main Topic Input Field */}
              <div className="flex-1 relative">
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. CAN WATER CAULDRON SAVE ME FROM 1000 BLOCKS?! 💀 #minecraft"
                  className="h-11 bg-navy-950 border-navy-700/80 text-white placeholder:text-slate-500 text-xs sm:text-sm px-3.5 rounded-xl focus:border-brand-purple shadow-inner"
                />
              </div>

              {/* Generate Studio Package Button */}
              <Button
                variant="gradient"
                size="sm"
                onClick={handleGenerateCompletePackage}
                disabled={isGeneratingAll || !topic.trim()}
                className="h-11 px-5 text-xs font-bold shrink-0 shadow-glow rounded-xl"
              >
                {isGeneratingAll ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating Studio Package...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Complete Package
                  </>
                )}
              </Button>
            </div>

            {/* Quick Context & Advanced Toggle */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <div className="flex items-center gap-3 flex-wrap text-[11px]">
                <span className="text-slate-300">
                  Niche: <strong className="text-white">{niche}</strong>
                </span>
                <span>•</span>
                <span className="text-slate-300">
                  Target: <strong className="text-white">{targetAudience}</strong>
                </span>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-brand-purple hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Sliders className="w-3 h-3" />
                  {showAdvanced ? "Hide Advanced Settings" : "Configure Keywords & Tone"}
                </button>
              </div>
              <span className="text-[11px] text-slate-500">{topic.length} characters</span>
            </div>

            {/* Collapsible Advanced Form */}
            {showAdvanced && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-navy-950/80 border border-navy-800 animate-in fade-in-50 duration-200">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Channel Niche</label>
                  <select
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    className="w-full h-8 rounded-lg bg-navy-900 border border-navy-700 text-xs text-slate-200 px-2.5 focus:outline-none focus:border-brand-purple"
                  >
                    {POPULAR_NICHES.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Primary SEO Keyword</label>
                  <Input
                    value={primaryKeyword}
                    onChange={(e) => setPrimaryKeyword(e.target.value)}
                    placeholder="e.g. Minecraft MLG clutch"
                    className="h-8 bg-navy-900 border-navy-700 text-xs text-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Pacing & Tone</label>
                  <Input
                    value={preferredTone}
                    onChange={(e) => setPreferredTone(e.target.value)}
                    placeholder="e.g. high-energy & suspenseful"
                    className="h-8 bg-navy-900 border-navy-700 text-xs text-slate-200"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* =====================================================================
            MAIN DUAL-COLUMN WORKSPACE:
            LEFT: Tabbed Content Studio (Titles, Hooks, Script, SEO, Tags, Thumbnail)
            RIGHT: Live Interactive YouTube Simulator & Virality Radar Cockpit
            ===================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ===================================================================
              LEFT PANE (7 COLS): CONTENT STUDIO & SECTION EDITORS
              =================================================================== */}
          <div className="lg:col-span-7 space-y-4">
            {/* Sleek Workspace Navigation Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-navy-900/90 border border-navy-800 overflow-x-auto scrollbar-thin scrollbar-thumb-navy-700 shadow-md">
              <button
                type="button"
                onClick={() => setActiveTab("titles")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "titles"
                    ? "bg-brand-purple text-white shadow-glow"
                    : "text-slate-400 hover:text-slate-200 hover:bg-navy-800/50"
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Titles (5)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("hooks")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "hooks"
                    ? "bg-brand-purple text-white shadow-glow"
                    : "text-slate-400 hover:text-slate-200 hover:bg-navy-800/50"
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Hooks (3)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("script")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "script"
                    ? "bg-brand-purple text-white shadow-glow"
                    : "text-slate-400 hover:text-slate-200 hover:bg-navy-800/50"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Script & Beats</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("seo")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "seo"
                    ? "bg-brand-purple text-white shadow-glow"
                    : "text-slate-400 hover:text-slate-200 hover:bg-navy-800/50"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>SEO Description</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("tags")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "tags"
                    ? "bg-brand-purple text-white shadow-glow"
                    : "text-slate-400 hover:text-slate-200 hover:bg-navy-800/50"
                }`}
              >
                <Hash className="w-3.5 h-3.5" />
                <span>Tags & Hashtags</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("thumbnail")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "thumbnail"
                    ? "bg-brand-purple text-white shadow-glow"
                    : "text-slate-400 hover:text-slate-200 hover:bg-navy-800/50"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Visual Concept</span>
              </button>
            </div>

            {/* TAB CONTENT: TITLES */}
            {activeTab === "titles" && (
              <div className="space-y-4 animate-in fade-in-50 duration-200">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-navy-900/60 border border-navy-800">
                  <div>
                    <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-brand-purple" />
                      5 High-CTR Title Variations
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Click any title to set as primary and update live preview simulator.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {undoCache["titles"] && (
                      <Button
                        onClick={() => handleUndoSection("titles")}
                        variant="ghost"
                        size="sm"
                        className="text-xs h-7 text-slate-400 hover:text-white"
                      >
                        <Undo2 className="w-3 h-3 mr-1" />
                        Undo
                      </Button>
                    )}
                    <Button
                      onClick={() => handleRegenerateSection("titles")}
                      disabled={isRegeneratingSection === "titles"}
                      variant="outline"
                      size="sm"
                      className="text-xs h-7 border-navy-700 bg-navy-900 text-slate-200"
                    >
                      <RefreshCw className={`w-3 h-3 mr-1.5 ${isRegeneratingSection === "titles" ? "animate-spin" : ""}`} />
                      Regenerate
                    </Button>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {(generatedOutput?.titles || []).map((t, idx) => {
                    const isSelected = selectedTitleIndex === idx;
                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedTitleIndex(idx)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                          isSelected
                            ? "bg-navy-800/90 border-brand-purple shadow-md shadow-brand-purple/10 ring-1 ring-brand-purple/40"
                            : "bg-navy-950/60 border-navy-800/80 hover:border-navy-700 hover:bg-navy-900/40"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                              isSelected ? "bg-brand-purple text-white shadow-glow" : "bg-navy-800 text-slate-400"
                            }`}
                          >
                            {idx + 1}
                          </div>
                          <div className="min-w-0">
                            <p className={`text-xs sm:text-sm font-bold truncate ${isSelected ? "text-white" : "text-slate-200"}`}>
                              {t}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {t.length} chars • High Curiosity Index • Rated 9.7/10 CTR
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isSelected && (
                            <Badge variant="default" className="text-[10px] bg-brand-purple text-white">
                              Active Primary
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(t, `title-${idx}`);
                            }}
                            className="h-7 w-7 p-0 text-slate-400 hover:text-slate-200"
                          >
                            {copiedKey === `title-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB CONTENT: HOOKS */}
            {activeTab === "hooks" && (
              <div className="space-y-4 animate-in fade-in-50 duration-200">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-navy-900/60 border border-navy-800">
                  <div>
                    <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-brand-purple" />
                      3-Second Retention Hooks
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Formulated to bypass skip fatigue in the first 3 seconds of YouTube Shorts.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {undoCache["hooks"] && (
                      <Button
                        onClick={() => handleUndoSection("hooks")}
                        variant="ghost"
                        size="sm"
                        className="text-xs h-7 text-slate-400 hover:text-white"
                      >
                        <Undo2 className="w-3 h-3 mr-1" />
                        Undo
                      </Button>
                    )}
                    <Button
                      onClick={() => handleRegenerateSection("hooks")}
                      disabled={isRegeneratingSection === "hooks"}
                      variant="outline"
                      size="sm"
                      className="text-xs h-7 border-navy-700 bg-navy-900 text-slate-200"
                    >
                      <RefreshCw className={`w-3 h-3 mr-1.5 ${isRegeneratingSection === "hooks" ? "animate-spin" : ""}`} />
                      Regenerate
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  {openingHooks.map((h, idx) => (
                    <Card key={idx} className="border-navy-800 bg-navy-900/60 hover:border-navy-700 transition-all">
                      <CardHeader className="p-3.5 pb-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-purple/20 text-purple-300 border border-brand-purple/30">
                            {h.angle || `Hook Variation #${idx + 1}`}
                          </span>
                          <span className="text-[11px] font-mono font-bold text-emerald-400">
                            Retention Score: {h.retentionRating || "9.7/10"}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="p-3.5 pt-0">
                        <p className="text-xs sm:text-sm font-medium text-slate-100 leading-relaxed italic bg-navy-950/70 p-3 rounded-xl border border-navy-800">
                          &quot;{h.hook}&quot;
                        </p>
                      </CardContent>
                      <CardFooter className="p-3.5 pt-0 flex items-center justify-between border-t border-navy-800/60 mt-1">
                        <span className="text-[10px] text-slate-500">First 0–3 seconds spoken audio</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(h.hook, `hook-${idx}`)}
                          className="text-[11px] h-6 px-2 text-slate-400 hover:text-slate-200"
                        >
                          {copiedKey === `hook-${idx}` ? <Check className="w-3 h-3 mr-1 text-emerald-400" /> : <Copy className="w-3 h-3 mr-1" />}
                          Copy Hook
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT: SCRIPT & BEATS */}
            {activeTab === "script" && (
              <div className="space-y-4 animate-in fade-in-50 duration-200">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-navy-900/60 border border-navy-800">
                  <div>
                    <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-brand-purple" />
                      Script Studio & Visual Beats
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {wordCount} words • ~{estimatedReadTimeSeconds}s spoken duration (~140 wpm)
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {undoCache["script"] && (
                      <Button
                        onClick={() => handleUndoSection("script")}
                        variant="ghost"
                        size="sm"
                        className="text-xs h-7 text-slate-400 hover:text-white"
                      >
                        <Undo2 className="w-3 h-3 mr-1" />
                        Undo
                      </Button>
                    )}
                    <Button
                      onClick={() => handleRegenerateSection("script")}
                      disabled={isRegeneratingSection === "script"}
                      variant="outline"
                      size="sm"
                      className="text-xs h-7 border-navy-700 bg-navy-900 text-slate-200"
                    >
                      <RefreshCw className={`w-3 h-3 mr-1.5 ${isRegeneratingSection === "script" ? "animate-spin" : ""}`} />
                      Regenerate
                    </Button>
                    <Button
                      onClick={() => handleCopy(editableScript, "script-copy")}
                      variant="outline"
                      size="sm"
                      className="text-xs h-7 border-navy-700 bg-navy-900 text-slate-300"
                    >
                      {copiedKey === "script-copy" ? <Check className="w-3 h-3 mr-1 text-emerald-400" /> : <Copy className="w-3 h-3 mr-1" />}
                      Copy Script
                    </Button>
                  </div>
                </div>

                <Card className="border-navy-800 bg-navy-900/60">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Structured Markdown with Timing & Visual Cue Prompts</span>
                      <span className="text-emerald-400">Live editing synced</span>
                    </div>
                    <Textarea
                      value={editableScript}
                      onChange={(e) => setEditableScript(e.target.value)}
                      rows={16}
                      className="w-full bg-navy-950 border-navy-700 text-slate-100 font-mono text-xs leading-relaxed p-3.5 rounded-xl focus:border-brand-purple resize-y"
                      placeholder="[00:00 - HOOK]..."
                    />
                  </CardContent>
                </Card>
              </div>
            )}

            {/* TAB CONTENT: SEO DESCRIPTION */}
            {activeTab === "seo" && (
              <div className="space-y-4 animate-in fade-in-50 duration-200">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-navy-900/60 border border-navy-800">
                  <div>
                    <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-brand-purple" />
                      SEO Description & Pinned Comment
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Optimized for YouTube search algorithms, clickable timestamps, and community retention.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {undoCache["description"] && (
                      <Button
                        onClick={() => handleUndoSection("description")}
                        variant="ghost"
                        size="sm"
                        className="text-xs h-7 text-slate-400 hover:text-white"
                      >
                        <Undo2 className="w-3 h-3 mr-1" />
                        Undo
                      </Button>
                    )}
                    <Button
                      onClick={() => handleRegenerateSection("description")}
                      disabled={isRegeneratingSection === "description"}
                      variant="outline"
                      size="sm"
                      className="text-xs h-7 border-navy-700 bg-navy-900 text-slate-200"
                    >
                      <RefreshCw className={`w-3 h-3 mr-1.5 ${isRegeneratingSection === "description" ? "animate-spin" : ""}`} />
                      Regenerate
                    </Button>
                    <Button
                      onClick={() => handleCopy(editableDescription, "desc-copy")}
                      variant="outline"
                      size="sm"
                      className="text-xs h-7 border-navy-700 bg-navy-900 text-slate-300"
                    >
                      {copiedKey === "desc-copy" ? <Check className="w-3 h-3 mr-1 text-emerald-400" /> : <Copy className="w-3 h-3 mr-1" />}
                      Copy
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <Card className="border-navy-800 bg-navy-900/60">
                    <CardHeader className="p-3 pb-1">
                      <CardTitle className="text-xs font-bold text-slate-200">YouTube Video Description</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <Textarea
                        value={editableDescription}
                        onChange={(e) => setEditableDescription(e.target.value)}
                        rows={11}
                        className="bg-navy-950 border-navy-700 text-xs font-mono text-slate-200 resize-y"
                      />
                    </CardContent>
                  </Card>

                  <Card className="border-navy-800 bg-navy-900/60">
                    <CardHeader className="p-3 pb-1 flex flex-row items-center justify-between">
                      <CardTitle className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <MessageSquare className="w-3 h-3 text-emerald-400" />
                        Pinned Community Question
                      </CardTitle>
                      <Button
                        onClick={() => handleCopy(editablePinnedComment, "pinned-copy")}
                        variant="ghost"
                        size="sm"
                        className="text-[11px] h-6 px-1.5 text-slate-400"
                      >
                        {copiedKey === "pinned-copy" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </Button>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <Input
                        value={editablePinnedComment}
                        onChange={(e) => setEditablePinnedComment(e.target.value)}
                        className="h-9 bg-navy-950 border-navy-700 text-xs text-slate-200"
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* TAB CONTENT: TAGS & HASHTAGS */}
            {activeTab === "tags" && (
              <div className="space-y-4 animate-in fade-in-50 duration-200">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-navy-900/60 border border-navy-800">
                  <div>
                    <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5 text-brand-purple" />
                      Search Tags & YouTube Hashtags
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {editableTags.length} Search Tags • {editableHashtags.length} Trend Hashtags
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      onClick={() => handleRegenerateSection("tags")}
                      disabled={isRegeneratingSection === "tags"}
                      variant="outline"
                      size="sm"
                      className="text-xs h-7 border-navy-700 bg-navy-900 text-slate-200"
                    >
                      <RefreshCw className={`w-3 h-3 mr-1.5 ${isRegeneratingSection === "tags" ? "animate-spin" : ""}`} />
                      Regenerate
                    </Button>
                    <Button
                      onClick={() => handleCopy(editableTags.join(", "), "tags-copy")}
                      variant="gradient"
                      size="sm"
                      className="text-xs h-7 px-3 font-semibold"
                    >
                      {copiedKey === "tags-copy" ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                      Copy All Tags
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Hashtags Cloud */}
                  <Card className="border-navy-800 bg-navy-900/60 p-3.5">
                    <p className="text-xs font-bold text-slate-200 mb-2">High-Velocity Hashtags</p>
                    <div className="flex flex-wrap gap-1.5">
                      {editableHashtags.map((h, i) => (
                        <span
                          key={i}
                          onClick={() => handleCopy(h, `hash-${i}`)}
                          className="text-xs px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium hover:bg-blue-500/20 cursor-pointer transition-colors"
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                  </Card>

                  {/* Search Tags */}
                  <Card className="border-navy-800 bg-navy-900/60 p-3.5">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold text-slate-200">YouTube Search Tags (Comma-Separated)</p>
                      <span className="text-[10px] text-slate-500">Ready for YouTube Studio</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-1 bg-navy-950/70 rounded-xl border border-navy-800">
                      {editableTags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-0.5 rounded-md bg-navy-900 border border-navy-700/80 text-slate-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* TAB CONTENT: THUMBNAIL VISUAL CONCEPT */}
            {activeTab === "thumbnail" && (
              <div className="space-y-4 animate-in fade-in-50 duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3.5 rounded-xl bg-navy-950/80 border border-navy-800">
                  <div>
                    <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-brand-purple" />
                      Visual Thumbnail Architecture
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      AI layout prompt, high-contrast overlay text, and instant visual generation.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={handleGenerateStudioThumbnailImage}
                      isLoading={isGeneratingThumbnailImage}
                      variant="gradient"
                      className="text-xs h-7 px-3 font-bold"
                    >
                      <Sparkles className="w-3 h-3 mr-1" />
                      {isGeneratingThumbnailImage ? "Generating..." : "Generate AI Visual"}
                    </Button>
                    <Link href={`/dashboard/thumbnails`}>
                      <Button variant="outline" size="sm" className="text-xs h-7 px-3 font-semibold border-navy-700 text-white hover:border-brand-purple/40">
                        Open Studio →
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* AI Generated Thumbnail Visual Preview (if generated) */}
                {aiThumbnailImage && (
                  <Card className="border border-brand-purple/30 p-3.5 space-y-2 bg-navy-900/90 shadow-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> AI Thumbnail Ready
                      </span>
                      <a
                        href={aiThumbnailImage}
                        download={`thumbnail-${Date.now()}.png`}
                        className="text-[11px] font-bold text-brand-purple hover:underline flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" /> Download Visual
                      </a>
                    </div>
                    <div className="rounded-lg overflow-hidden border border-navy-800 bg-black aspect-video max-h-56">
                      <img src={aiThumbnailImage} alt="Generated Thumbnail" className="w-full h-full object-cover" />
                    </div>
                  </Card>
                )}

                <div className="space-y-3">
                  {/* Thumbnail Text Editor */}
                  <Card className="border border-navy-800 p-3.5 space-y-2 bg-navy-900/80">
                    <label className="text-xs font-bold text-slate-200">Thumbnail Big Bold Text</label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={editableThumbnailText}
                        onChange={(e) => setEditableThumbnailText(e.target.value)}
                        className="h-10 bg-navy-950 border-navy-800 text-sm font-extrabold text-white uppercase tracking-wider"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(editableThumbnailText, "thumb-copy")}
                        className="h-10 px-3 border-navy-800 bg-navy-900 text-slate-300 hover:text-white"
                      >
                        {copiedKey === "thumb-copy" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </Card>

                  {/* Visual Composition Blueprint */}
                  {thumbnailConcepts.map((c, i) => (
                    <Card key={i} className="border border-navy-800 p-4 space-y-2 text-xs bg-navy-900/80">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-purple/15 text-brand-purple border border-brand-purple/30">
                          Composition Blueprint
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">{c.contrast}</span>
                      </div>
                      <p className="text-slate-200">
                        <strong className="text-white">Subject:</strong> {c.mainSubject}
                      </p>
                      <p className="text-slate-300">
                        <strong className="text-white">Visual Framing:</strong> {c.composition}
                      </p>
                      <p className="text-slate-400">
                        <strong className="text-slate-200">Rule of Thirds:</strong> {c.readability}
                      </p>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ===================================================================
              RIGHT PANE (5 COLS, STICKY):
              LIVE YOUTUBE SIMULATOR + AI QUALITY RADAR + EXPORT DOCK
              =================================================================== */}
          <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-24">
            {/* Live Simulator Header Card */}
            <div className="rounded-2xl border border-navy-700/80 bg-gradient-to-b from-navy-900/90 to-navy-950/90 p-4 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-navy-800">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-brand-purple" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Live YouTube Simulator
                  </span>
                </div>

                {/* Simulator Format Switcher */}
                <div className="flex items-center p-0.5 rounded-lg bg-navy-950 border border-navy-800">
                  <button
                    type="button"
                    onClick={() => setPreviewMode("shorts")}
                    className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
                      previewMode === "shorts" ? "bg-brand-purple text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Shorts (9:16)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode("desktop")}
                    className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
                      previewMode === "desktop" ? "bg-brand-blue text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Desktop (16:9)
                  </button>
                </div>
              </div>

              {/* SIMULATOR DISPLAY */}
              {previewMode === "shorts" ? (
                /* SMARTPHONE BEZEL (YOUTUBE SHORTS SIMULATOR) */
                <div className="flex justify-center">
                  <div className="w-[280px] sm:w-[300px] h-[480px] rounded-[2.5rem] border-4 border-slate-700/80 bg-black relative shadow-2xl overflow-hidden p-2 flex flex-col justify-between">
                    {/* Speaker notch */}
                    <div className="w-20 h-3 bg-slate-800 rounded-full mx-auto absolute top-2 left-1/2 -translate-x-1/2 z-20" />

                    {/* Background Gaming Backdrop (Dark Atmospheric Minecraft Theme) */}
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-navy-950 to-black z-0 flex items-center justify-center overflow-hidden">
                      {/* Ambient Grid Lines & Vignette */}
                      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#8b5cf6_1px,transparent_1px)] [background-size:16px_16px]" />
                      <div className="text-center p-4 space-y-2 opacity-80">
                        <div className="w-16 h-16 rounded-2xl bg-brand-purple/20 border border-brand-purple/40 text-brand-purple flex items-center justify-center mx-auto shadow-glow">
                          <Play className="w-8 h-8 fill-brand-purple ml-1" />
                        </div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">
                          9:16 Vertical Video Stream
                        </p>
                      </div>
                    </div>

                    {/* Top Shorts Header */}
                    <div className="relative z-10 flex items-center justify-between text-white text-[11px] px-2 pt-5">
                      <span className="font-bold tracking-wider">Shorts</span>
                      <span className="bg-red-600 px-1.5 py-0.5 rounded text-[9px] font-bold">LIVE</span>
                    </div>

                    {/* Right-Hand Action Stack */}
                    <div className="absolute right-3 bottom-20 z-10 flex flex-col items-center gap-3.5 text-white">
                      <div className="flex flex-col items-center">
                        <div className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center border border-white/10 hover:bg-black/80 transition-all">
                          <ThumbsUp className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-[9px] font-bold mt-1">14.2K</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center border border-white/10">
                          <MessageSquare className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-[9px] font-bold mt-1">384</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center border border-white/10">
                          <Share2 className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-[9px] font-bold mt-1">Share</span>
                      </div>
                      {/* Rotating Audio Disc */}
                      <div className="w-8 h-8 rounded-full border-2 border-slate-600 bg-slate-900 flex items-center justify-center animate-spin">
                        <div className="w-2.5 h-2.5 rounded-full bg-brand-purple" />
                      </div>
                    </div>

                    {/* Bottom Metadata & Caption Overlay */}
                    <div className="relative z-10 p-3 space-y-2 bg-gradient-to-t from-black via-black/80 to-transparent rounded-b-2xl">
                      {/* Dynamic Hook Subtitle Banner */}
                      <div className="bg-black/70 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-white/10 shadow-lg">
                        <p className="text-[11px] font-extrabold text-amber-300 leading-tight">
                          &quot;{openingHooks[0]?.hook || editableThumbnailText}&quot;
                        </p>
                      </div>

                      {/* Channel Info Row */}
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-[10px] shrink-0 border border-white/20">
                          N
                        </div>
                        <span className="text-xs font-bold text-white truncate max-w-[120px]">
                          @{activeChannel?.title?.toLowerCase().replace(/\s+/g, "") || "novoicecraft"}
                        </span>
                        <span className="text-[9px] font-bold bg-white text-black px-2 py-0.5 rounded-full">
                          Subscribe
                        </span>
                      </div>

                      {/* Video Title */}
                      <p className="text-xs font-bold text-white line-clamp-2 leading-tight">
                        {currentTitle}
                      </p>

                      {/* Audio track line */}
                      <p className="text-[9px] text-slate-300 flex items-center gap-1 truncate">
                        <span>🎵</span>
                        <span>C418 - Subwoofer Lullaby (Remix)</span>
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* 16:9 DESKTOP YOUTUBE VIDEO PLAYER SIMULATOR */
                <div className="space-y-3">
                  <div className="aspect-video bg-navy-950 rounded-xl border border-navy-800 relative overflow-hidden flex flex-col justify-between p-3 group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/30 via-navy-950 to-blue-900/30 z-0" />
                    
                    {/* Big Thumbnail Text Overlay */}
                    <div className="relative z-10 flex-1 flex items-center justify-center">
                      <span className="text-lg sm:text-xl font-extrabold text-amber-300 font-mono tracking-wider drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] text-center px-4">
                        {editableThumbnailText || "THUMBNAIL HOOK"}
                      </span>
                    </div>

                    {/* Scrubber Bar and Controls */}
                    <div className="relative z-10 space-y-1 bg-black/60 backdrop-blur-md p-2 rounded-lg">
                      <div className="w-full bg-slate-700 h-1 rounded-full overflow-hidden">
                        <div className="w-1/3 bg-red-600 h-full" />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-white">
                        <span className="font-mono">0:45 / {estimatedReadTimeSeconds}s</span>
                        <span className="bg-red-600 px-1 py-0.2 rounded font-bold text-[9px]">4K 60FPS</span>
                      </div>
                    </div>
                  </div>

                  {/* Video Metadata Below Player */}
                  <div className="space-y-1.5 p-3 rounded-xl bg-navy-950 border border-navy-800">
                    <p className="text-xs font-bold text-white leading-snug line-clamp-2">
                      {currentTitle}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{activeChannel?.title || "NoVoiceCraft"} • 54K views</span>
                      <span className="text-emerald-400 font-semibold">98.4% Like Ratio</span>
                    </div>
                  </div>
                </div>
              )}

              {/* AI VIRALITY & QUALITY RADAR COCKPIT */}
              <div className="p-3.5 rounded-xl bg-navy-950 border border-navy-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-brand-purple" />
                    AI Virality & SEO Radar
                  </span>
                  <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                    Score: 96/100
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Hook Retention Power</span>
                      <span className="text-emerald-400 font-bold">98%</span>
                    </div>
                    <div className="w-full bg-navy-900 h-1.5 rounded-full overflow-hidden">
                      <div className="w-[98%] bg-emerald-400 h-full rounded-full" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>CTR & Browse Appeal</span>
                      <span className="text-purple-400 font-bold">94%</span>
                    </div>
                    <div className="w-full bg-navy-900 h-1.5 rounded-full overflow-hidden">
                      <div className="w-[94%] bg-brand-purple h-full rounded-full" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>YouTube SEO Density</span>
                      <span className="text-blue-400 font-bold">96%</span>
                    </div>
                    <div className="w-full bg-navy-900 h-1.5 rounded-full overflow-hidden">
                      <div className="w-[96%] bg-brand-blue h-full rounded-full" />
                    </div>
                  </div>
                </div>
              </div>

              {/* FAST ACTION EXPORT DOCK */}
              <div className="space-y-2 pt-2 border-t border-navy-800">
                <Button
                  onClick={handlePushToPublish}
                  variant="gradient"
                  className="w-full text-xs font-bold h-10 shadow-glow"
                >
                  <Layers className="w-4 h-4 mr-2" />
                  Push to Publishing Pipeline
                </Button>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={handleSaveToProject}
                    variant="outline"
                    size="sm"
                    className="text-xs h-9 border-navy-700 bg-navy-900 text-slate-200"
                  >
                    <Save className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                    Save Project
                  </Button>
                  <Button
                    onClick={handleCopyFullPackage}
                    variant="outline"
                    size="sm"
                    className="text-xs h-9 border-navy-700 bg-navy-900 text-slate-200"
                  >
                    <Copy className="w-3.5 h-3.5 mr-1 text-blue-400" />
                    Copy Package
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================================
            VERSION HISTORY MODAL
            ===================================================================== */}
        <Modal
          isOpen={isVersionModalOpen}
          onClose={() => {
            setIsVersionModalOpen(false);
            setSelectedPreviewVersion(null);
          }}
          title={`Version History — ${activeProject?.name || "Video Project"}`}
          description="Every save or snapshot preserves your titles, hooks, scripts, and SEO metadata. Restore any past version with 1 click."
          maxWidth="3xl"
        >
          <div className="space-y-5">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-navy-950 border border-navy-800">
              <Input
                placeholder="Name this version snapshot (e.g. High-energy hook alternate)..."
                value={customVersionName}
                onChange={(e) => setCustomVersionName(e.target.value)}
                className="h-8 text-xs bg-navy-900 border-navy-700 text-white"
              />
              <Button
                onClick={handleCreateVersionSnapshot}
                variant="gradient"
                size="sm"
                className="text-xs font-semibold shrink-0 h-8"
              >
                <Save className="w-3 h-3 mr-1.5" />
                Save Snapshot
              </Button>
            </div>

            {projectVersions.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No saved versions yet. Click &quot;Save Snapshot&quot; above to capture your current draft.
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {projectVersions.map((ver) => {
                  const isSelected = selectedPreviewVersion?.id === ver.id;
                  const isActiveVer = activeProject?.activeVersionId === ver.id;

                  return (
                    <div
                      key={ver.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isSelected
                          ? "bg-navy-800 border-brand-purple"
                          : "bg-navy-950/70 border-navy-800 hover:border-navy-700"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{ver.name}</span>
                            {isActiveVer && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                Active Version
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400">
                            {new Date(ver.createdAt).toLocaleString()} • {ver.summary || "Snapshot"}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            onClick={() => setSelectedPreviewVersion(isSelected ? null : ver)}
                            variant="outline"
                            size="sm"
                            className="text-[11px] h-7 px-2 border-navy-700 bg-navy-900"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            {isSelected ? "Hide" : "Preview"}
                          </Button>

                          <Button
                            onClick={() => handleRestoreVersion(ver)}
                            variant="gradient"
                            size="sm"
                            className="text-[11px] h-7 px-2.5 font-semibold"
                          >
                            <RotateCcw className="w-3 h-3 mr-1" />
                            Restore
                          </Button>

                          <Button
                            onClick={() => {
                              if (confirm(`Delete version "${ver.name}"?`)) {
                                if (activeProjectId) deleteProjectVersion(activeProjectId, ver.id);
                              }
                            }}
                            variant="ghost"
                            size="sm"
                            className="text-slate-400 hover:text-red-400 h-7 w-7 p-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="mt-3 pt-3 border-t border-navy-800 text-xs space-y-2 bg-navy-900/60 p-3 rounded-lg">
                          <div>
                            <span className="text-slate-400 font-semibold">Title: </span>
                            <span className="text-slate-200">{ver.snapshot.selectedTitle || "None"}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-semibold">Hook: </span>
                            <span className="text-slate-200 italic">&quot;{ver.snapshot.hook || "None"}&quot;</span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-semibold">Script Preview: </span>
                            <p className="text-[11px] text-slate-300 font-mono bg-navy-950 p-2 rounded mt-1 line-clamp-3">
                              {ver.snapshot.script || "No script text."}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}

export default function CreateVideoPage() {
  return (
    <Suspense
      fallback={
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-2">
              <div className="w-8 h-8 border-2 border-brand-purple border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-slate-400">Loading AI Content Studio...</p>
            </div>
          </div>
        </DashboardLayout>
      }
    >
      <CreateVideoContent />
    </Suspense>
  );
}
