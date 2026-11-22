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
  ArrowLeft,
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
  ShieldAlert,
  Zap,
  Info,
  Layers,
  History,
  Save,
  Clock,
  Trash2,
  Edit3,
  Undo2,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Youtube,
  Sliders,
  Play,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  GeneratedMetadataOutput,
  SectionType,
  CompleteVideoPackage,
  CategorizedTitle,
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

const CONTENT_FORMATS = [
  { id: "tutorial", label: "Step-by-Step Tutorial", desc: "Actionable how-to guides and technical walkthroughs" },
  { id: "review", label: "Product Review / Benchmark", desc: "Honest comparisons, pros/cons, and real numbers" },
  { id: "listicle", label: "Curated Top 5 / Top 10", desc: "Fast-paced listicles with high curiosity retention" },
  { id: "documentary", label: "Deep Dive / Story", desc: "Narrative storytelling, investigative breakdowns" },
  { id: "shorts", label: "YouTube Shorts (60s)", desc: "Quick punchy hooks with visual pattern interrupts" },
];

const STEPS = [
  { step: 1, title: "Topic", desc: "Core premise" },
  { step: 2, title: "Format", desc: "Content style" },
  { step: 3, title: "Hooks & Ideas", desc: "AI generation" },
  { step: 4, title: "Select Title", desc: "Browse test" },
  { step: 5, title: "Script Studio", desc: "Write & refine" },
  { step: 6, title: "Metadata", desc: "SEO & tags" },
  { step: 7, title: "Save Project", desc: "Publish pipeline" },
];

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
    renameProjectVersion,
    checkQuota,
  } = useData();
  const { toast } = useToast();

  // Progress Stepper State (Steps 1 to 7)
  const [currentStep, setCurrentStep] = useState(1);

  // Core Form Inputs
  const [topic, setTopic] = useState("");
  const [niche, setNiche] = useState("Minecraft & Gaming");
  const [contentType, setContentType] = useState("shorts");
  const [targetAudience, setTargetAudience] = useState("Minecraft players & YouTube Shorts viewers");
  const [language, setLanguage] = useState("English");

  // Advanced Options State
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [primaryKeyword, setPrimaryKeyword] = useState("");
  const [secondaryKeywords, setSecondaryKeywords] = useState("");
  const [preferredTone, setPreferredTone] = useState("engaging");
  const [transcriptNotes, setTranscriptNotes] = useState("");

  // AI Generated Content State
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [isRegeneratingSection, setIsRegeneratingSection] = useState<string | null>(null);
  const [generatedOutput, setGeneratedOutput] = useState<GeneratedMetadataOutput | null>(null);
  const [completePackage, setCompletePackage] = useState<CompleteVideoPackage | null>(null);
  const [thumbnailConcepts, setThumbnailConcepts] = useState<ThumbnailConcept[]>([]);
  const [selectedTitleIndex, setSelectedTitleIndex] = useState(0);

  // Editable Working State
  const [editableScript, setEditableScript] = useState("");
  const [editableDescription, setEditableDescription] = useState("");
  const [editableTags, setEditableTags] = useState<string[]>([]);
  const [editableHashtags, setEditableHashtags] = useState<string[]>([]);
  const [editableThumbnailText, setEditableThumbnailText] = useState("");
  const [editablePinnedComment, setEditablePinnedComment] = useState("");
  const [openingHooks, setOpeningHooks] = useState<any[]>([]);

  // Section-Level Undo Cache (stores previous version before regeneration)
  const [undoCache, setUndoCache] = useState<Record<string, any>>({});

  // Active Project Reference & Autosave State
  const [activeProjectId, setActiveProjectId] = useState<string | null>(initialProjectId || null);
  const [autosaveStatus, setAutosaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Version History Modal State
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [customVersionName, setCustomVersionName] = useState("");
  const [selectedPreviewVersion, setSelectedPreviewVersion] = useState<ProjectVersion | null>(null);

  // Copy Feedback State
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // 1. Initial Load: Project or Local Draft Restoration
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const paramTopic = searchParams.get("topic");
    if (paramTopic && !initialProjectId) {
      setTopic(paramTopic);
    }

    if (initialProjectId) {
      const proj = getProject(initialProjectId);
      if (proj) {
        setActiveProjectId(proj.id);
        setTopic(proj.topic || proj.name);
        setNiche(proj.niche || "Minecraft & Gaming");
        setContentType(proj.contentType || "shorts");
        setTargetAudience(proj.targetAudience || "General YouTube Viewers");
        setLanguage(proj.language || "English");
        setEditableScript(proj.script || "");
        setEditableDescription(proj.description || "");
        setEditableTags(proj.tags || []);
        setEditableHashtags(proj.hashtags || []);
        setEditableThumbnailText(proj.thumbnailText || "");
        setEditablePinnedComment(proj.pinnedComment || "");

        if (proj.titleSuggestions && proj.titleSuggestions.length > 0) {
          const idx = proj.titleSuggestions.indexOf(proj.selectedTitle);
          setSelectedTitleIndex(idx >= 0 ? idx : 0);
        }

        setGeneratedOutput({
          titles: proj.titleSuggestions || [proj.selectedTitle],
          description: proj.description,
          tags: proj.tags,
          hashtags: proj.hashtags,
          pinnedComment: proj.pinnedComment,
          chapters: proj.chapters || [],
          thumbnailIdeas: [proj.thumbnailText].filter(Boolean),
          isHeuristicFallback: proj.qualityScore?.isHeuristicFallback,
          qualityScore: proj.qualityScore || {
            overall: 90,
            clarity: 92,
            relevance: 90,
            readability: 92,
            keywordCoverage: 88,
            critique: ["Loaded from saved project."],
          },
        });

        if (proj.hookSuggestions && proj.hookSuggestions.length > 0) {
          setOpeningHooks(
            proj.hookSuggestions.map((h, i) => ({
              hook: h,
              angle: i === 0 ? "Problem-first" : i === 1 ? "Curiosity gap" : "Contrarian",
              retentionRating: "9.5/10",
            }))
          );
        }

        setCurrentStep(3); // Jump straight to content
        return;
      }
    }

    // Otherwise check for saved user draft in localStorage
    const storageKey = `cf_user_${user?.id || "demo"}_create_draft`;
    try {
      const savedDraft = localStorage.getItem(storageKey);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed.topic && !parsed.topic.includes("autonomous AI agent") && !parsed.topic.includes("Next.js")) {
          setTopic(parsed.topic);
        } else {
          setTopic("");
        }
        if (parsed.niche && parsed.niche !== "Tech & Coding") {
          setNiche(parsed.niche);
        } else {
          setNiche("Minecraft & Gaming");
        }
        if (parsed.contentType) setContentType(parsed.contentType);
        if (parsed.targetAudience && !parsed.targetAudience.includes("Software developers") && !parsed.targetAudience.includes("tech creators")) {
          setTargetAudience(parsed.targetAudience);
        } else {
          setTargetAudience("Minecraft players, clutch fans & YouTube Shorts viewers");
        }
        if (parsed.language) setLanguage(parsed.language);
        if (parsed.editableScript) setEditableScript(parsed.editableScript);
        if (parsed.editableDescription) setEditableDescription(parsed.editableDescription);
        if (parsed.editableTags) setEditableTags(parsed.editableTags);
        if (parsed.editableHashtags) setEditableHashtags(parsed.editableHashtags);
        if (parsed.editableThumbnailText) setEditableThumbnailText(parsed.editableThumbnailText);
        if (parsed.editablePinnedComment) setEditablePinnedComment(parsed.editablePinnedComment);
        if (parsed.generatedOutput) setGeneratedOutput(parsed.generatedOutput);
        if (parsed.openingHooks) setOpeningHooks(parsed.openingHooks);
        if (parsed.selectedTitleIndex !== undefined) setSelectedTitleIndex(parsed.selectedTitleIndex);
        if (parsed.activeProjectId) setActiveProjectId(parsed.activeProjectId);
        if (parsed.currentStep) setCurrentStep(parsed.currentStep);
      }
    } catch (e) {
      console.warn("Could not restore draft:", e);
    }
  }, [initialProjectId, getProject, user?.id, searchParams]);

  // ---------------------------------------------------------------------------
  // 2. Debounced Autosave (Local Storage + Active Project Sync)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!topic.trim()) return;

    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    setAutosaveStatus("saving");

    autosaveTimerRef.current = setTimeout(() => {
      try {
        const storageKey = `cf_user_${user?.id || "demo"}_create_draft`;
        const draftState = {
          topic,
          niche,
          contentType,
          targetAudience,
          language,
          editableScript,
          editableDescription,
          editableTags,
          editableHashtags,
          editableThumbnailText,
          editablePinnedComment,
          generatedOutput,
          openingHooks,
          selectedTitleIndex,
          activeProjectId,
          currentStep,
          timestamp: new Date().toISOString(),
        };
        localStorage.setItem(storageKey, JSON.stringify(draftState));

        // If an active project exists, auto-sync fields to prevent data loss
        if (activeProjectId) {
          const chosenTitle = generatedOutput?.titles?.[selectedTitleIndex] || topic;
          updateProject(activeProjectId, {
            topic,
            niche,
            contentType,
            targetAudience,
            language,
            selectedTitle: chosenTitle,
            titleSuggestions: generatedOutput?.titles || [chosenTitle],
            script: editableScript,
            description: editableDescription,
            tags: editableTags,
            hashtags: editableHashtags,
            thumbnailText: editableThumbnailText,
            pinnedComment: editablePinnedComment,
            hook: openingHooks[0]?.hook || "",
            hookSuggestions: openingHooks.map((h) => h.hook),
            chapters: generatedOutput?.chapters || [],
            qualityScore: generatedOutput?.qualityScore,
          });
        }

        setAutosaveStatus("saved");
        setLastSavedTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      } catch (err) {
        console.warn("Autosave error:", err);
        setAutosaveStatus("error");
      }
    }, 1500);

    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, [
    topic,
    niche,
    contentType,
    targetAudience,
    language,
    editableScript,
    editableDescription,
    editableTags,
    editableHashtags,
    editableThumbnailText,
    editablePinnedComment,
    generatedOutput,
    openingHooks,
    selectedTitleIndex,
    activeProjectId,
    currentStep,
    user?.id,
    updateProject,
  ]);

  // ---------------------------------------------------------------------------
  // 3. Helper: Channel Context Extraction
  // ---------------------------------------------------------------------------
  const getChannelContextPayload = useCallback(() => {
    if (!activeChannel) return undefined;
    const channelVideos = videos.filter((v) => v.channel_id === activeChannel.id);
    const recentTopics = channelVideos.slice(0, 5).map((v) => v.title);

    return {
      channelTitle: activeChannel.title,
      niche,
      subscriberCount: activeChannel.subscriber_count,
      recentVideoTopics: recentTopics.length > 0 ? recentTopics : ["Modern Tech", "Software Tools", "Automation"],
      isDemo: activeChannel.id.startsWith("chan-demo"),
    };
  }, [activeChannel, videos, niche]);

  // ---------------------------------------------------------------------------
  // 4. Full AI Generation (Step 3 Trigger)
  // ---------------------------------------------------------------------------
  const handleGenerateAll = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) {
      toast.warning("Topic Required", "Please enter what video you want to create.");
      return;
    }

    const quota = checkQuota("ai");
    if (!quota.allowed) {
      toast.error("Monthly Quota Limit", `You have used ${quota.current}/${quota.max} AI generations for this period.`);
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

      const res = await fetch("/api/ai/metadata", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.id || "demo-session"}`,
        },
        body: JSON.stringify({
          topic: topic.trim(),
          descriptionOrTranscript: transcriptNotes.trim() || `Format: ${contentType}. Target Audience: ${targetAudience}`,
          niche,
          targetAudience,
          primaryKeyword: derivedKeyword,
          secondaryKeywords: derivedSec.length > 0 ? derivedSec : [niche, contentType, "2026"],
          preferredTone,
          language,
          channelContext: channelCtx,
        }),
      });

      const data = await res.json();
      const meta = (data.data || data.metadata) as GeneratedMetadataOutput;

      if (data.success && meta) {
        setGeneratedOutput(meta);
        setSelectedTitleIndex(0);
        setEditableDescription(meta.description);
        setEditableTags(meta.tags);
        setEditableHashtags(meta.hashtags);
        setEditableThumbnailText(meta.thumbnailIdeas?.[0] || "NEW BLUEPRINT");
        setEditablePinnedComment(meta.pinnedComment || "What question do you have about this topic?");

        // Generate preliminary structured script
        const initialScript = `[00:00 - HOOK]
${meta.thumbnailIdeas?.[0] ? `"${meta.thumbnailIdeas[0]}" — ` : ""}${meta.pinnedComment || "Welcome back to the channel."}

[00:45 - PREMISE & WHY THIS MATTERS]
[VISUAL: Overview graphic of ${topic}]
Today we are breaking down ${topic} step-by-step for ${targetAudience}.

[CHAPTER BREAKDOWN]
${meta.chapters.map((c) => `[${c.time} - ${c.title}]\n• Key talking point for this segment\n• [VISUAL: Screen demonstration or b-roll]\n• Retention pattern interrupt`).join("\n\n")}

[VALUE CLIMAX & NEXT STEPS]
The key differentiator isn't working harder—it's executing with the right architecture.

[OUTRO & CALL TO ACTION]
Drop a comment below with your thoughts, and subscribe for the next video!`;

        setEditableScript(initialScript);

        // Fetch dedicated opening hooks
        try {
          const hooksRes = await fetch("/api/ai/section", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user?.id || "demo-session"}`,
            },
            body: JSON.stringify({
              section: "hooks",
              topic: topic.trim(),
              niche,
              contentType,
              targetAudience,
              selectedTitle: meta.titles[0],
              language,
              channelContext: channelCtx,
            }),
          });
          const hooksData = await hooksRes.json();
          if (hooksData.success && Array.isArray(hooksData.data)) {
            setOpeningHooks(hooksData.data);
          }
        } catch {
          // Hooks fallback
          setOpeningHooks([
            { hook: `If you are approaching ${topic} the old way in 2026, you are wasting 80% of your time.`, angle: "Pain point", retentionRating: "9.5/10" },
            { hook: `I tested ${topic} for 30 days so you don't have to make the same mistakes.`, angle: "Curiosity gap", retentionRating: "9.3/10" },
            { hook: `Most creators believe ${topic} is saturated. Here is what the data actually says.`, angle: "Contrarian", retentionRating: "9.4/10" },
          ]);
        }

        setCurrentStep(3);
        toast.success("AI Content Generated", `Formulated 5 viral titles, 3 retention hooks, and structured script.`);
      } else {
        toast.error("Generation Failed", data.error || "Could not generate content.");
      }
    } catch (err: any) {
      toast.error("Error", err?.message || "Failed to reach AI generation endpoint.");
    } finally {
      setIsGeneratingAll(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 4b. Complete AI Video Package (All 11 Sections Unified)
  // ---------------------------------------------------------------------------
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

        const titleList = Array.isArray(pkg.multipleTitles) && pkg.multipleTitles.length > 0
          ? pkg.multipleTitles.map((t) => t.title)
          : [pkg.recommendedTitle];
        const recIdx = titleList.indexOf(pkg.recommendedTitle);
        setSelectedTitleIndex(recIdx >= 0 ? recIdx : 0);

        setGeneratedOutput({
          titles: titleList,
          description: pkg.completeDescription,
          tags: pkg.youtubeTags,
          hashtags: pkg.hashtags,
          pinnedComment: "💬 Question of the day: What is your biggest challenge with this topic?",
          chapters: (pkg.videoOutline || []).map((o) => ({ time: o.time, title: o.title })),
          thumbnailIdeas: (pkg.thumbnailConcepts || []).map((c) => c.textSuggestion),
          isHeuristicFallback: pkg.isHeuristicFallback,
          qualityScore: pkg.qualityScore,
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

        // Script generation from outline
        const generatedScript = `[00:00 - OPENING RETENTION HOOK]
${pkg.openingHook}

[00:45 - PREMISE & WHY THIS MATTERS]
Today we break down ${topic} step-by-step for ${targetAudience}.

[CHAPTER BREAKDOWN]
${(pkg.videoOutline || []).map((c) => `[${c.time} - ${c.title}]\n• Key talking point: ${c.notes || "Core breakdown"}\n• [VISUAL: Screen demonstration & b-roll]`).join("\n\n")}

[OUTRO & COMMUNITY CALL TO ACTION]
Leave your biggest question in the comments below, and subscribe for weekly blueprints!`;

        setEditableScript(generatedScript);
        setCurrentStep(3);
        toast.success("Complete Video Package Generated", "All 11 sections formulated and ready for review.");
      } else {
        toast.error("Generation Issue", json.error || "Could not generate video package.");
      }
    } catch (err: any) {
      toast.error("Connection Error", err?.message || "Failed to reach AI package server.");
    } finally {
      setIsGeneratingAll(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 5. Independent Section-Level Regeneration
  // ---------------------------------------------------------------------------
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

    // Save previous state to undoCache
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

      // Apply update strictly to the chosen section without touching others
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

  // ---------------------------------------------------------------------------
  // 6. Section-Level Undo
  // ---------------------------------------------------------------------------
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

  // ---------------------------------------------------------------------------
  // 7. Save or Update Video Project
  // ---------------------------------------------------------------------------
  const handleSaveToProject = () => {
    const chosenTitle = generatedOutput?.titles?.[selectedTitleIndex] || topic || "Untitled Project";

    if (activeProjectId) {
      // Update existing project to avoid duplicates
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

      // Automatically create a version snapshot upon save
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
        "User confirmed project update"
      );

      toast.success("Project Updated", `Changes saved to "${chosenTitle.substring(0, 32)}...".`);
    } else {
      // Create new project
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

      // Save Initial Version
      saveProjectVersion(
        newProj.id,
        "Version 1 - Initial Generation",
        {
          selectedTitle: chosenTitle,
          script: editableScript,
          description: editableDescription,
          tags: editableTags,
          hook: openingHooks[0]?.hook || "",
        },
        "Initial creation from AI Studio"
      );

      toast.success("Project Created", `New project "${chosenTitle.substring(0, 32)}..." created!`);
    }

    setCurrentStep(7);
  };

  // ---------------------------------------------------------------------------
  // 8. Version Management Handlers
  // ---------------------------------------------------------------------------
  const activeProject = activeProjectId ? getProject(activeProjectId) : undefined;
  const projectVersions = activeProject?.versions || [];

  const handleCreateVersionSnapshot = () => {
    if (!activeProjectId) {
      toast.warning("Save Project First", "Please save as a Video Project before creating version history.");
      return;
    }

    const chosenTitle = generatedOutput?.titles?.[selectedTitleIndex] || topic;
    const versionName = customVersionName.trim() || `Draft ${projectVersions.length + 1} (${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})`;

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
  };

  const handleRestoreVersion = (ver: ProjectVersion) => {
    if (!activeProjectId) return;
    const restored = restoreProjectVersion(activeProjectId, ver.id);
    if (restored) {
      const snap = ver.snapshot;
      if (snap.selectedTitle) {
        if (generatedOutput) {
          const idx = generatedOutput.titles.indexOf(snap.selectedTitle);
          setSelectedTitleIndex(idx >= 0 ? idx : 0);
        }
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
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Copied to Clipboard", "Ready to paste.");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const wordCount = editableScript.trim().split(/\s+/).filter(Boolean).length;
  const estimatedReadTimeMinutes = Math.max(1, Math.ceil(wordCount / 140)); // ~140 wpm for spoken YouTube video

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl mx-auto pb-20">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-navy-800 pb-5">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-purple/10 text-brand-purple border border-brand-purple/20">
                AI Content Studio
              </span>

              {/* Channel Context Pill */}
              {activeChannel && (
                <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-navy-800 border border-navy-700 text-slate-300 flex items-center gap-1.5">
                  <Youtube className="w-3 h-3 text-red-500" />
                  <span>Channel: {activeChannel.title}</span>
                  <span className="text-[10px] text-slate-500">
                    ({activeChannel.subscriber_count ? `${(activeChannel.subscriber_count / 1000).toFixed(1)}K subs` : "Demo Mode"})
                  </span>
                </span>
              )}

              {/* Autosave Pill */}
              <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-navy-900 border border-navy-800 text-slate-400 flex items-center gap-1.5">
                {autosaveStatus === "saving" && <RefreshCw className="w-3 h-3 animate-spin text-brand-purple" />}
                {autosaveStatus === "saved" && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                {autosaveStatus === "error" && <AlertCircle className="w-3 h-3 text-amber-400" />}
                <span>
                  {autosaveStatus === "saving"
                    ? "Saving draft..."
                    : autosaveStatus === "saved"
                    ? `Autosaved at ${lastSavedTime || "just now"}`
                    : "Draft active"}
                </span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-2">
              Create Video Content
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Follow the guided workflow from initial video topic to viral hooks, full script, and YouTube metadata.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {activeProjectId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsVersionModalOpen(true)}
                className="text-xs border-navy-700 bg-navy-900 text-slate-300 hover:text-white"
              >
                <History className="w-3.5 h-3.5 mr-1.5 text-brand-purple" />
                Versions ({projectVersions.length})
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (confirm("Reset current draft to start a new video?")) {
                  localStorage.removeItem(`cf_user_${user?.id || "demo"}_create_draft`);
                  setTopic("");
                  setGeneratedOutput(null);
                  setOpeningHooks([]);
                  setEditableScript("");
                  setEditableDescription("");
                  setActiveProjectId(null);
                  setCurrentStep(1);
                  toast.info("Draft Cleared", "Ready for a new video concept.");
                }
              }}
              className="text-xs border-navy-800 bg-navy-950 text-slate-400 hover:text-slate-200"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              New Video
            </Button>

            <Button
              variant="gradient"
              size="sm"
              onClick={handleGenerateCompletePackage}
              disabled={isGeneratingAll || !topic.trim()}
              className="text-xs font-semibold px-3 shadow-glow"
              title="Generate complete 11-section package in one click"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              {isGeneratingAll ? "Generating Package..." : "Complete Video Package"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveToProject}
              className="text-xs font-semibold px-3 border-navy-700 bg-navy-900"
            >
              <Save className="w-3.5 h-3.5 mr-1.5" />
              {activeProjectId ? "Save Changes" : "Save Project"}
            </Button>
          </div>
        </div>

        {/* 7-Step Guided Workflow Stepper Bar */}
        <div className="bg-navy-900/80 border border-navy-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
          {/* Stepper Header with Progress & Navigation Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-navy-800/80">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-brand-purple/20 text-brand-purple border border-brand-purple/30 font-mono">
                Step {currentStep} of 7
              </span>
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <span>{STEPS[currentStep - 1]?.title}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-xs text-slate-400 font-medium">{STEPS[currentStep - 1]?.desc}</span>
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2 justify-between sm:justify-end">
              <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {Math.round((currentStep / 7) * 100)}% Complete
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                  disabled={currentStep === 1}
                  className="h-7 px-2.5 text-xs border-navy-700 bg-navy-950 text-slate-300 hover:text-white"
                >
                  <ArrowLeft className="w-3 h-3 mr-1" />
                  Prev
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentStep((prev) => Math.min(7, prev + 1))}
                  disabled={currentStep === 7}
                  className="h-7 px-2.5 text-xs border-navy-700 bg-navy-950 text-slate-300 hover:text-white"
                >
                  Next
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>
          </div>

          {/* Progress Bar Line */}
          <div className="w-full bg-navy-950 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-brand-purple to-brand-blue h-full transition-all duration-300"
              style={{ width: `${(currentStep / 7) * 100}%` }}
            />
          </div>

          {/* Stepper Buttons (Full Width Responsive Grid with Overflow Protection) */}
          <div className="overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-navy-700">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 min-w-[620px] sm:min-w-0">
            {STEPS.map((s) => {
              const isActive = currentStep === s.step;
              const isPast = currentStep > s.step;
              return (
                <button
                  type="button"
                  key={s.step}
                  onClick={() => setCurrentStep(s.step)}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl transition-all text-left cursor-pointer ${
                    isActive
                      ? "bg-navy-800 border-2 border-brand-purple shadow-lg shadow-brand-purple/20 text-white"
                      : isPast
                      ? "bg-navy-950/80 hover:bg-navy-800/60 border border-emerald-500/30 text-slate-300"
                      : "bg-navy-950/40 hover:bg-navy-900/60 border border-navy-800/80 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                      isActive
                        ? "bg-brand-purple text-white shadow-glow"
                        : isPast
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        : "bg-navy-800 text-slate-400 border border-navy-700"
                    }`}
                  >
                    {isPast ? <Check className="w-3.5 h-3.5" /> : s.step}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-bold truncate ${isActive ? "text-white" : "text-slate-300"}`}>
                      {s.title}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">{s.desc}</p>
                  </div>
                </button>
              );
            })}
            </div>
          </div>
        </div>

        {/* =====================================================================
            STEP 1: VIDEO TOPIC & AUDIENCE
            ===================================================================== */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            <Card className="border-navy-800 bg-navy-900/60 shadow-xl">
              <CardHeader>
                <div className="flex items-center gap-2 text-brand-purple text-xs font-semibold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Step 1 of 7 — Central Concept</span>
                </div>
                <CardTitle className="text-xl text-white font-extrabold">
                  What video do you want to create today?
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Enter your core video idea. CreatorFlow AI will formulate title hooks, chapters, SEO tags, and an outline.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">
                    Video Topic or Working Title <span className="text-red-400">*</span>
                  </label>
                  <Textarea
                    placeholder="e.g. CAN WATER CAULDRON SAVE ME FROM 1000 BLOCKS?! 💀 #minecraft"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    rows={3}
                    className="bg-navy-950 border-navy-700 text-slate-100 placeholder:text-slate-500 text-sm focus:border-brand-purple resize-none"
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>Keep it concise (1–2 sentences).</span>
                    <span>{topic.length} characters</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-400">Channel Niche</label>
                    <select
                      value={niche}
                      onChange={(e) => setNiche(e.target.value)}
                      className="w-full h-9 rounded-lg bg-navy-950 border border-navy-700 text-xs text-slate-200 px-3 focus:outline-none focus:border-brand-purple"
                    >
                      {POPULAR_NICHES.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-400">Target Audience</label>
                    <Input
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      placeholder="e.g. Minecraft players, clutch fans & YouTube Shorts viewers"
                      className="h-9 bg-navy-950 border-navy-700 text-xs text-slate-200"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-400">Language</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full h-9 rounded-lg bg-navy-950 border border-navy-700 text-xs text-slate-200 px-3 focus:outline-none focus:border-brand-purple"
                    >
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="Hindi">Hindi</option>
                      <option value="German">German</option>
                      <option value="French">French</option>
                      <option value="Portuguese">Portuguese</option>
                    </select>
                  </div>
                </div>

                {/* Optional Advanced Accordion */}
                <div className="border border-navy-800 rounded-xl bg-navy-950/40 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Advanced SEO Keywords & Context Notes (Optional)</span>
                    </div>
                    {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {showAdvanced && (
                    <div className="p-4 border-t border-navy-800 space-y-4 animate-in fade-in-50 duration-150">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs text-slate-400">Primary Keyword (Optional)</label>
                          <Input
                            placeholder="e.g. minecraft clutch"
                            value={primaryKeyword}
                            onChange={(e) => setPrimaryKeyword(e.target.value)}
                            className="h-9 bg-navy-900 border-navy-700 text-xs"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs text-slate-400">Secondary Keywords (Comma separated)</label>
                          <Input
                            placeholder="e.g. minecraft, shorts, clutch, gaming, survival"
                            value={secondaryKeywords}
                            onChange={(e) => setSecondaryKeywords(e.target.value)}
                            className="h-9 bg-navy-900 border-navy-700 text-xs"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs text-slate-400">Rough Outline or Transcript Notes</label>
                        <Textarea
                          placeholder="Paste any bullet points, reference docs, or rough thoughts..."
                          value={transcriptNotes}
                          onChange={(e) => setTranscriptNotes(e.target.value)}
                          rows={3}
                          className="bg-navy-900 border-navy-700 text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-navy-800 pt-4">
                <span className="text-xs text-slate-400">Step 1 of 7 — Premise & Context</span>
                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                  <Button
                    type="button"
                    onClick={handleGenerateCompletePackage}
                    disabled={isGeneratingAll || !topic.trim()}
                    variant="gradient"
                    size="sm"
                    className="text-xs font-semibold px-4 shadow-glow"
                  >
                    {isGeneratingAll ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                        Generating Package...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                        Generate Complete Video Package
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      if (!topic.trim()) {
                        toast.warning("Topic Required", "Please enter a topic to continue.");
                        return;
                      }
                      setCurrentStep(2);
                    }}
                    variant="outline"
                    size="sm"
                    className="text-xs font-semibold px-4 border-navy-700 bg-navy-900"
                  >
                    <span>Next: Select Format</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        )}

        {/* =====================================================================
            STEP 2: CONTENT FORMAT SELECTION
            ===================================================================== */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            <Card className="border-navy-800 bg-navy-900/60 shadow-xl">
              <CardHeader>
                <div className="flex items-center gap-2 text-brand-purple text-xs font-semibold uppercase tracking-wider">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Step 2 of 7 — Content Style</span>
                </div>
                <CardTitle className="text-xl text-white font-extrabold">
                  Select Video Format
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  CreatorFlow AI tailors the hooks, pacing, and chapter structure specifically to your selected format.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {CONTENT_FORMATS.map((f) => (
                    <div
                      key={f.id}
                      onClick={() => setContentType(f.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        contentType === f.id
                          ? "bg-navy-800 border-brand-purple shadow-md shadow-brand-purple/10"
                          : "bg-navy-950/60 border-navy-800 hover:border-navy-700 hover:bg-navy-900/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-white">{f.label}</span>
                        {contentType === f.id && (
                          <span className="w-4 h-4 rounded-full bg-brand-purple flex items-center justify-center text-white">
                            <Check className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{f.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between border-t border-navy-800 pt-4">
                <Button
                  onClick={() => setCurrentStep(1)}
                  variant="outline"
                  size="sm"
                  className="text-xs border-navy-700 bg-navy-900"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                  Back
                </Button>
                <Button
                  onClick={handleGenerateAll}
                  disabled={isGeneratingAll}
                  variant="gradient"
                  size="sm"
                  className="text-xs font-semibold px-5"
                >
                  {isGeneratingAll ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      Generating AI Content...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                      Generate Content (Step 3)
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}

        {/* =====================================================================
            STEP 3: HOOKS & VIRAL IDEAS (With Section Regeneration & Undo)
            ===================================================================== */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-2xl bg-navy-900/60 border border-navy-800">
              <div>
                <p className="text-xs font-semibold text-brand-purple">Step 3 of 7 — Opening Hooks & Variations</p>
                <p className="text-sm font-bold text-white mt-0.5">Topic: {topic}</p>
              </div>

              <div className="flex items-center gap-2">
                {undoCache["hooks"] && (
                  <Button
                    onClick={() => handleUndoSection("hooks")}
                    variant="outline"
                    size="sm"
                    className="text-xs border-navy-700 bg-navy-900 text-slate-300"
                  >
                    <Undo2 className="w-3 h-3 mr-1" />
                    Undo Hooks
                  </Button>
                )}
                <Button
                  onClick={() => handleRegenerateSection("hooks")}
                  disabled={isRegeneratingSection === "hooks"}
                  variant="outline"
                  size="sm"
                  className="text-xs border-navy-700 bg-navy-900 text-slate-200 hover:text-white"
                >
                  <RefreshCw className={`w-3 h-3 mr-1.5 ${isRegeneratingSection === "hooks" ? "animate-spin" : ""}`} />
                  Regenerate 3 Hooks Only
                </Button>
              </div>
            </div>

            {/* Opening Hooks Cards */}
            {openingHooks.length === 0 ? (
              <div className="p-8 rounded-2xl border border-dashed border-navy-800 bg-navy-900/40 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-purple/10 text-brand-purple flex items-center justify-center mx-auto border border-brand-purple/20">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white">No Opening Hooks Formulated Yet</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    {topic ? `Generate high-retention opening hooks for "${topic}".` : "Enter a core topic in Step 1 or trigger AI package generation below."}
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <Button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    variant="outline"
                    size="sm"
                    className="text-xs border-navy-700 bg-navy-900"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                    Go to Step 1
                  </Button>
                  <Button
                    type="button"
                    onClick={handleGenerateAll}
                    disabled={isGeneratingAll}
                    variant="gradient"
                    size="sm"
                    className="text-xs font-semibold px-4"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                    Generate AI Hooks Now
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {openingHooks.map((h, idx) => (
                <Card key={idx} className="border-navy-800 bg-navy-900/60 hover:border-navy-700 transition-all flex flex-col justify-between">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-purple/10 text-brand-purple border border-brand-purple/20">
                        {h.angle || `Hook #${idx + 1}`}
                      </span>
                      <span className="text-[11px] font-mono text-emerald-400">
                        {h.retentionRating || "9.5/10"}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 flex-1">
                    <p className="text-xs font-medium text-slate-200 leading-relaxed italic">
                      &quot;{h.hook}&quot;
                    </p>
                  </CardContent>
                  <CardFooter className="border-t border-navy-800/80 pt-3 flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(h.hook, `hook-${idx}`)}
                      className="text-[11px] text-slate-400 hover:text-slate-200 h-7 px-2"
                    >
                      {copiedKey === `hook-${idx}` ? <Check className="w-3 h-3 mr-1 text-emerald-400" /> : <Copy className="w-3 h-3 mr-1" />}
                      Copy Hook
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-navy-800">
              <Button
                onClick={() => setCurrentStep(2)}
                variant="outline"
                size="sm"
                className="text-xs border-navy-700 bg-navy-900"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                Back to Format
              </Button>
              <Button
                onClick={() => setCurrentStep(4)}
                variant="gradient"
                size="sm"
                className="text-xs font-semibold px-4"
              >
                Next: Select Title (Step 4)
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          </div>
        )}

        {/* =====================================================================
            STEP 4: TITLE SELECTION & BROWSE SIMULATOR
            ===================================================================== */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-2xl bg-navy-900/60 border border-navy-800">
              <div>
                <p className="text-xs font-semibold text-brand-purple">Step 4 of 7 — Select Primary Title</p>
                <p className="text-sm font-bold text-white mt-0.5">Click any title variation below to set as your primary release title.</p>
              </div>

              <div className="flex items-center gap-2">
                {undoCache["titles"] && (
                  <Button
                    onClick={() => handleUndoSection("titles")}
                    variant="outline"
                    size="sm"
                    className="text-xs border-navy-700 bg-navy-900 text-slate-300"
                  >
                    <Undo2 className="w-3 h-3 mr-1" />
                    Undo Titles
                  </Button>
                )}
                <Button
                  onClick={() => handleRegenerateSection("titles")}
                  disabled={isRegeneratingSection === "titles"}
                  variant="outline"
                  size="sm"
                  className="text-xs border-navy-700 bg-navy-900 text-slate-200 hover:text-white"
                >
                  <RefreshCw className={`w-3 h-3 mr-1.5 ${isRegeneratingSection === "titles" ? "animate-spin" : ""}`} />
                  Regenerate 5 Titles Only
                </Button>
              </div>
            </div>

            {/* 5 Title Options */}
            {(!generatedOutput?.titles || generatedOutput.titles.length === 0) ? (
              <div className="p-8 rounded-2xl border border-dashed border-navy-800 bg-navy-900/40 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-purple/10 text-brand-purple flex items-center justify-center mx-auto border border-brand-purple/20">
                  <Tag className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white">No Title Variations Generated Yet</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    {topic ? `Formulate high-CTR, curious title options for "${topic}".` : "Enter your video topic in Step 1 or generate title variations below."}
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <Button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    variant="outline"
                    size="sm"
                    className="text-xs border-navy-700 bg-navy-900"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                    Go to Step 1
                  </Button>
                  <Button
                    type="button"
                    onClick={handleGenerateAll}
                    disabled={isGeneratingAll}
                    variant="gradient"
                    size="sm"
                    className="text-xs font-semibold px-4"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                    Generate 5 AI Titles
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {generatedOutput.titles.map((t, idx) => {
                const isSelected = selectedTitleIndex === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedTitleIndex(idx)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-4 ${
                      isSelected
                        ? "bg-navy-800 border-brand-purple shadow-sm shadow-brand-purple/10 ring-1 ring-brand-purple/30"
                        : "bg-navy-950/60 border-navy-800 hover:border-navy-700 hover:bg-navy-900/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          isSelected ? "bg-brand-purple text-white" : "bg-navy-700 text-slate-400"
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${isSelected ? "text-white" : "text-slate-200"}`}>{t}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{t.length} characters • Curiosity gap hook</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isSelected ? (
                        <Badge variant="default" className="text-[10px] bg-brand-purple text-white">
                          Selected Primary
                        </Badge>
                      ) : (
                        <span className="text-xs text-slate-500 hover:text-slate-300">Click to Select</span>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(t, `title-${idx}`);
                        }}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200"
                      >
                        {copiedKey === `title-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
            )}

            {/* Live YouTube Browse Simulator */}
            <Card className="border-navy-800 bg-navy-950/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5 text-brand-purple" />
                  YouTube Browse Feed Simulator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-w-md bg-navy-900 border border-navy-800 rounded-xl overflow-hidden shadow-lg p-3 space-y-2">
                  <div className="aspect-video bg-navy-950 rounded-lg flex items-center justify-center border border-navy-800 relative">
                    <span className="text-sm font-extrabold text-amber-300 font-mono tracking-wider">
                      {editableThumbnailText || "THUMBNAIL PREVIEW"}
                    </span>
                    <span className="absolute bottom-2 right-2 text-[10px] bg-black/80 px-1.5 py-0.5 rounded text-white font-mono">
                      {estimatedReadTimeMinutes}:45
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white line-clamp-2">
                      {generatedOutput?.titles?.[selectedTitleIndex] || topic}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                      <span>{activeChannel?.title || "Creator Channel"}</span>
                      <span>•</span>
                      <span>54K views</span>
                      <span>•</span>
                      <span>2 days ago</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between pt-4 border-t border-navy-800">
              <Button
                onClick={() => setCurrentStep(3)}
                variant="outline"
                size="sm"
                className="text-xs border-navy-700 bg-navy-900"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                Back to Hooks
              </Button>
              <Button
                onClick={() => setCurrentStep(5)}
                variant="gradient"
                size="sm"
                className="text-xs font-semibold px-4"
              >
                Next: Script Studio (Step 5)
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          </div>
        )}

        {/* =====================================================================
            STEP 5: SCRIPT STUDIO (Interactive Editor, Section Regeneration & Undo)
            ===================================================================== */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-2xl bg-navy-900/60 border border-navy-800">
              <div>
                <p className="text-xs font-semibold text-brand-purple">Step 5 of 7 — Video Script Draft</p>
                <p className="text-sm font-bold text-white mt-0.5">
                  Selected Title: &quot;{generatedOutput?.titles?.[selectedTitleIndex] || topic}&quot;
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {wordCount} words • ~{estimatedReadTimeMinutes} min spoken duration (~140 wpm)
                </p>
              </div>

              <div className="flex items-center gap-2">
                {undoCache["script"] && (
                  <Button
                    onClick={() => handleUndoSection("script")}
                    variant="outline"
                    size="sm"
                    className="text-xs border-navy-700 bg-navy-900 text-slate-300"
                  >
                    <Undo2 className="w-3 h-3 mr-1" />
                    Undo Script
                  </Button>
                )}
                <Button
                  onClick={() => handleRegenerateSection("script")}
                  disabled={isRegeneratingSection === "script"}
                  variant="outline"
                  size="sm"
                  className="text-xs border-navy-700 bg-navy-900 text-slate-200 hover:text-white"
                >
                  <RefreshCw className={`w-3 h-3 mr-1.5 ${isRegeneratingSection === "script" ? "animate-spin" : ""}`} />
                  Regenerate Script Only
                </Button>
                <Button
                  onClick={() => handleCopy(editableScript, "script-copy")}
                  variant="outline"
                  size="sm"
                  className="text-xs border-navy-700 bg-navy-900 text-slate-300"
                >
                  {copiedKey === "script-copy" ? <Check className="w-3 h-3 mr-1 text-emerald-400" /> : <Copy className="w-3 h-3 mr-1" />}
                  Copy Script
                </Button>
              </div>
            </div>

            {/* Script Editor Card */}
            <Card className="border-navy-800 bg-navy-900/60">
              <CardContent className="p-4 sm:p-6 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Script Body (Includes Visual Cue Prompts)</span>
                  <span className="text-[11px] text-brand-purple">Auto-saving edits continuously</span>
                </div>
                <Textarea
                  value={editableScript}
                  onChange={(e) => setEditableScript(e.target.value)}
                  rows={18}
                  className="w-full bg-navy-950 border-navy-700 text-slate-100 font-mono text-xs leading-relaxed p-4 rounded-xl focus:border-brand-purple resize-y"
                  placeholder="[00:00 - HOOK]..."
                />
              </CardContent>
            </Card>

            <div className="flex items-center justify-between pt-4 border-t border-navy-800">
              <Button
                onClick={() => setCurrentStep(4)}
                variant="outline"
                size="sm"
                className="text-xs border-navy-700 bg-navy-900"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                Back to Title Selection
              </Button>
              <Button
                onClick={() => setCurrentStep(6)}
                variant="gradient"
                size="sm"
                className="text-xs font-semibold px-4"
              >
                Next: Metadata & SEO (Step 6)
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          </div>
        )}

        {/* =====================================================================
            STEP 6: DESCRIPTION & METADATA (Independent Regeneration per Item)
            ===================================================================== */}
        {currentStep === 6 && (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-2xl bg-navy-900/60 border border-navy-800">
              <div>
                <p className="text-xs font-semibold text-brand-purple">Step 6 of 7 — SEO Metadata & Publishing Assets</p>
                <p className="text-sm font-bold text-white mt-0.5">
                  Regenerate or edit individual sections independently without overwriting other fields.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={handleSaveToProject}
                  variant="gradient"
                  size="sm"
                  className="text-xs font-semibold px-4"
                >
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  Save as Video Project
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Description Section */}
              <Card className="border-navy-800 bg-navy-900/60 space-y-3">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold text-white">SEO Description</CardTitle>
                    <CardDescription className="text-[11px] text-slate-400">Timestamps & keyword summary</CardDescription>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {undoCache["description"] && (
                      <Button
                        onClick={() => handleUndoSection("description")}
                        variant="ghost"
                        size="sm"
                        className="text-[11px] h-7 px-2 text-slate-400 hover:text-white"
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
                      className="text-[11px] h-7 px-2.5 border-navy-700 bg-navy-950 text-slate-300 hover:text-white"
                    >
                      <RefreshCw className={`w-3 h-3 mr-1 ${isRegeneratingSection === "description" ? "animate-spin" : ""}`} />
                      Regenerate
                    </Button>
                    <Button
                      onClick={() => handleCopy(editableDescription, "desc-copy")}
                      variant="ghost"
                      size="sm"
                      className="text-[11px] h-7 px-2 text-slate-400 hover:text-white"
                    >
                      {copiedKey === "desc-copy" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={editableDescription}
                    onChange={(e) => setEditableDescription(e.target.value)}
                    rows={12}
                    className="bg-navy-950 border-navy-700 text-xs font-mono text-slate-200 resize-y"
                  />
                </CardContent>
              </Card>

              {/* Tags, Hashtags, Thumbnail Text, Pinned Comment */}
              <div className="space-y-4">
                {/* Tags */}
                <Card className="border-navy-800 bg-navy-900/60">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-brand-purple" />
                        Search Tags ({editableTags.length})
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {undoCache["tags"] && (
                        <Button
                          onClick={() => handleUndoSection("tags")}
                          variant="ghost"
                          size="sm"
                          className="text-[11px] h-6 px-1.5 text-slate-400"
                        >
                          <Undo2 className="w-3 h-3" />
                        </Button>
                      )}
                      <Button
                        onClick={() => handleRegenerateSection("tags")}
                        disabled={isRegeneratingSection === "tags"}
                        variant="outline"
                        size="sm"
                        className="text-[11px] h-6 px-2 border-navy-700 bg-navy-950 text-slate-300"
                      >
                        <RefreshCw className={`w-2.5 h-2.5 mr-1 ${isRegeneratingSection === "tags" ? "animate-spin" : ""}`} />
                        Regenerate
                      </Button>
                      <Button
                        onClick={() => handleCopy(editableTags.join(", "), "tags-copy")}
                        variant="ghost"
                        size="sm"
                        className="text-[11px] h-6 px-1.5 text-slate-400"
                      >
                        {copiedKey === "tags-copy" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
                      {editableTags.map((tag, idx) => (
                        <span key={idx} className="text-[11px] px-2 py-0.5 rounded-md bg-navy-950 border border-navy-800 text-slate-300">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Hashtags & Thumbnail Text */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Hashtags */}
                  <Card className="border-navy-800 bg-navy-900/60">
                    <CardHeader className="pb-1.5 flex flex-row items-center justify-between">
                      <CardTitle className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Hash className="w-3.5 h-3.5 text-blue-400" />
                        Hashtags
                      </CardTitle>
                      <Button
                        onClick={() => handleRegenerateSection("hashtags")}
                        disabled={isRegeneratingSection === "hashtags"}
                        variant="ghost"
                        size="sm"
                        className="text-[10px] h-6 px-1.5 text-slate-400"
                      >
                        <RefreshCw className={`w-2.5 h-2.5 ${isRegeneratingSection === "hashtags" ? "animate-spin" : ""}`} />
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-1">
                        {editableHashtags.map((h, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            {h}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Thumbnail Text */}
                  <Card className="border-navy-800 bg-navy-900/60">
                    <CardHeader className="pb-1.5 flex flex-row items-center justify-between">
                      <CardTitle className="text-xs font-bold text-white flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-amber-400" />
                        Thumbnail Text
                      </CardTitle>
                      <Button
                        onClick={() => handleRegenerateSection("thumbnailText")}
                        disabled={isRegeneratingSection === "thumbnailText"}
                        variant="ghost"
                        size="sm"
                        className="text-[10px] h-6 px-1.5 text-slate-400"
                      >
                        <RefreshCw className={`w-2.5 h-2.5 ${isRegeneratingSection === "thumbnailText" ? "animate-spin" : ""}`} />
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <Input
                        value={editableThumbnailText}
                        onChange={(e) => setEditableThumbnailText(e.target.value)}
                        className="h-8 bg-navy-950 border-navy-700 text-xs font-bold text-amber-300 uppercase"
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Pinned Comment */}
                <Card className="border-navy-800 bg-navy-900/60">
                  <CardHeader className="pb-1.5 flex flex-row items-center justify-between">
                    <CardTitle className="text-xs font-bold text-white flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                      Pinned Community Comment
                    </CardTitle>
                    <Button
                      onClick={() => handleRegenerateSection("pinnedComment")}
                      disabled={isRegeneratingSection === "pinnedComment"}
                      variant="ghost"
                      size="sm"
                      className="text-[10px] h-6 px-1.5 text-slate-400"
                    >
                      <RefreshCw className={`w-2.5 h-2.5 ${isRegeneratingSection === "pinnedComment" ? "animate-spin" : ""}`} />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <Input
                      value={editablePinnedComment}
                      onChange={(e) => setEditablePinnedComment(e.target.value)}
                      className="h-8 bg-navy-950 border-navy-700 text-xs text-slate-200"
                    />
                  </CardContent>
                </Card>

                {/* AI Thumbnail Concepts (Phase 2.5) */}
                {thumbnailConcepts.length > 0 && (
                  <Card className="border-navy-800 bg-navy-900/60 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-brand-purple" />
                        AI Thumbnail Concepts (1280 × 720)
                      </CardTitle>
                      <Link href={`/dashboard/thumbnails?text=${encodeURIComponent(editableThumbnailText)}`}>
                        <Button variant="ghost" size="sm" className="text-[11px] h-6 text-brand-purple hover:text-white">
                          Open Canvas Editor →
                        </Button>
                      </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {thumbnailConcepts.map((concept, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-navy-950 border border-navy-800 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-amber-300 font-mono uppercase">
                              &quot;{concept.textSuggestion}&quot;
                            </span>
                            <Badge variant="outline" className="text-[9px]">
                              {concept.contrast}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-slate-300">
                            <strong className="text-white">Subject:</strong> {concept.mainSubject}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            <strong className="text-slate-300">Composition:</strong> {concept.composition}
                          </p>
                          <div className="pt-1 flex items-center justify-between">
                            <span className="text-[10px] text-slate-500">{concept.readability}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditableThumbnailText(concept.textSuggestion);
                                toast.success("Thumbnail Text Applied", `Set text to "${concept.textSuggestion}".`);
                              }}
                              className="text-[10px] h-6 px-2 border-navy-700"
                            >
                              Apply
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-navy-800">
              <Button
                onClick={() => setCurrentStep(5)}
                variant="outline"
                size="sm"
                className="text-xs border-navy-700 bg-navy-900"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                Back to Script
              </Button>
              <Button
                onClick={handleSaveToProject}
                variant="gradient"
                size="sm"
                className="text-xs font-semibold px-4"
              >
                Proceed to Review & Save (Step 7)
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          </div>
        )}

        {/* =====================================================================
            STEP 7: REVIEW & SAVE PROJECT (Workspace Integration)
            ===================================================================== */}
        {currentStep === 7 && (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            <Card className="border-emerald-500/30 bg-emerald-950/10 shadow-xl">
              <CardContent className="p-6 sm:p-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white">Video Project Ready!</h2>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto mt-1">
                    Your titles, retention hooks, working script draft, and YouTube SEO metadata have been compiled into a persistent Video Project.
                  </p>
                </div>

                <div className="max-w-md mx-auto p-4 rounded-xl bg-navy-900/80 border border-navy-800 text-left space-y-2">
                  <p className="text-xs text-slate-400">Primary Title:</p>
                  <p className="text-sm font-bold text-white">{generatedOutput?.titles?.[selectedTitleIndex] || topic}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
                    <span>Format: {contentType}</span>
                    <span>•</span>
                    <span>{wordCount} words</span>
                    <span>•</span>
                    <span>{editableTags.length} tags</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 pt-4 flex-wrap">
                  <Link href={`/dashboard/publish?tab=projects`}>
                    <Button variant="gradient" size="sm" className="text-xs font-semibold px-5">
                      <Layers className="w-3.5 h-3.5 mr-1.5" />
                      Open in Video Projects Hub
                    </Button>
                  </Link>

                  <Link href={`/dashboard/publish?tab=thumbnails`}>
                    <Button variant="outline" size="sm" className="text-xs border-navy-700 bg-navy-900 text-slate-200">
                      Create 16:9 Thumbnail
                    </Button>
                  </Link>

                  <Button
                    onClick={() => setCurrentStep(1)}
                    variant="outline"
                    size="sm"
                    className="text-xs border-navy-800 bg-navy-950 text-slate-400"
                  >
                    Edit Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* =====================================================================
            VERSION HISTORY MODAL (Compare, Restore, Rename, Delete)
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
            {/* Create Snapshot Input */}
            <div className="flex items-center gap-2 p-3 rounded-xl bg-navy-950 border border-navy-800">
              <Input
                placeholder="Name this version snapshot (e.g. Fast-paced hook alternate)..."
                value={customVersionName}
                onChange={(e) => setCustomVersionName(e.target.value)}
                className="h-8 text-xs bg-navy-900 border-navy-700"
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

            {/* Versions List */}
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
                            {isSelected ? "Hide Preview" : "Preview"}
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

                      {/* Snapshot Diff / Preview */}
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
