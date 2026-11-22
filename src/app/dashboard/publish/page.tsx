"use client";

import React, { useState, useRef, useEffect, useCallback, Suspense } from "react";
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
import { Progress } from "@/components/ui/progress";
import { VideoProject, VideoPrivacy, VideoStatus } from "@/types/database.types";
import {
  Layers,
  UploadCloud,
  Calendar as CalendarIcon,
  Image as ImageIcon,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  ExternalLink,
  Edit3,
  Trash2,
  Download,
  AlertTriangle,
  Play,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Youtube,
  ChevronLeft,
  ChevronRight,
  FileVideo,
  X,
  Check,
  Undo2,
  Redo2,
  Sliders,
  RotateCcw,
  RefreshCw,
  Tag,
  Hash,
  AlertCircle,
  CalendarDays,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { uploadVideoInChunks, cancelYouTubeUploadSession } from "@/lib/youtube/chunk-uploader";

// Preset Styles for Thumbnail Studio
const THUMBNAIL_PRESETS = [
  {
    id: "viral-bold",
    name: "Bold Viral Hook",
    textColor: "#FACC15",
    strokeWidth: 16,
    shadowBlur: 20,
    hasPill: false,
    pillColor: "rgba(0,0,0,0.85)",
    badge: "NEW",
  },
  {
    id: "neon-cyber",
    name: "Neon Cyber Glow",
    textColor: "#38BDF8",
    strokeWidth: 10,
    shadowBlur: 35,
    hasPill: false,
    pillColor: "rgba(0,0,0,0.85)",
    badge: "2026",
  },
  {
    id: "urgent-alert",
    name: "Urgent Warning",
    textColor: "#FFFFFF",
    strokeWidth: 8,
    shadowBlur: 25,
    hasPill: true,
    pillColor: "#DC2626",
    badge: "STOP",
  },
  {
    id: "clean-minimal",
    name: "Clean Minimalist",
    textColor: "#FFFFFF",
    strokeWidth: 10,
    shadowBlur: 15,
    hasPill: false,
    pillColor: "rgba(0,0,0,0.85)",
    badge: "10x",
  },
  {
    id: "growth-matrix",
    name: "Growth Masterclass",
    textColor: "#10B981",
    strokeWidth: 12,
    shadowBlur: 25,
    hasPill: false,
    pillColor: "rgba(0,0,0,0.85)",
    badge: "PRO",
  },
];

const CORNER_BADGES = ["NONE", "NEW", "2026", "10x", "STOP", "PRO", "FREE", "VIRAL"];

interface ThumbnailStateSnapshot {
  imageSrc: string;
  text: string;
  fontSize: number;
  textColor: string;
  position: "top" | "center" | "bottom";
  strokeWidth: number;
  shadowBlur: number;
  hasPill: boolean;
  pillColor: string;
  badge: string;
}

function PublishWorkspaceContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as any) || "projects";

  const { user } = useAuth();
  const { activeChannel } = useChannel();
  const {
    projects,
    addProject,
    updateProject,
    deleteProject,
    uploadJobs,
    addUploadJob,
    updateUploadJob,
    checkQuota,
  } = useData();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"uploads" | "projects" | "thumbnails" | "calendar">(
    ["uploads", "projects", "thumbnails", "calendar"].includes(initialTab) ? (initialTab as any) : "uploads"
  );

  // ---------------------------------------------------------------------------
  // 1. PROJECTS HUB STATE
  // ---------------------------------------------------------------------------
  const [projectSearch, setProjectSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedProject, setSelectedProject] = useState<VideoProject | null>(null);
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [editForm, setEditForm] = useState<Partial<VideoProject>>({});
  const [autoSaveStatus, setAutoSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
      p.selectedTitle.toLowerCase().includes(projectSearch.toLowerCase()) ||
      p.topic.toLowerCase().includes(projectSearch.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenProject = (project: VideoProject) => {
    setSelectedProject(project);
    setEditForm({ ...project });
    setIsEditingProject(true);
    setAutoSaveStatus("saved");
  };

  const handleUpdateField = (field: keyof VideoProject, value: any) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
    setAutoSaveStatus("unsaved");
  };

  const handleSaveProjectEdits = () => {
    if (!selectedProject || !editForm) return;
    setAutoSaveStatus("saving");
    updateProject(selectedProject.id, editForm);
    setSelectedProject((prev) => (prev ? { ...prev, ...editForm } : null));
    setTimeout(() => {
      setAutoSaveStatus("saved");
      toast.success("Project Saved", `Updated "${editForm.name || selectedProject.name}".`);
    }, 400);
  };

  // ---------------------------------------------------------------------------
  // 2. THUMBNAIL STUDIO STATE (HTML5 CANVAS 16:9 + PRESETS + UNDO/REDO)
  // ---------------------------------------------------------------------------
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [thumbTargetProjectId, setThumbTargetProjectId] = useState<string>(projects[0]?.id || "");
  const [thumbImageSrc, setThumbImageSrc] = useState<string>(
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1280&auto=format&fit=crop&q=80"
  );
  const [thumbText, setThumbText] = useState("I AUTOMATED IT!");
  const [thumbFontSize, setThumbFontSize] = useState(64);
  const [thumbTextColor, setThumbTextColor] = useState("#FACC15");
  const [thumbPosition, setThumbPosition] = useState<"center" | "top" | "bottom">("center");
  const [thumbStrokeWidth, setThumbStrokeWidth] = useState(16);
  const [thumbShadowBlur, setThumbShadowBlur] = useState(20);
  const [thumbHasPill, setThumbHasPill] = useState(false);
  const [thumbPillColor, setThumbPillColor] = useState("#DC2626");
  const [thumbBadge, setThumbBadge] = useState("NEW");

  // Undo / Redo History Stack
  const [historyStack, setHistoryStack] = useState<ThumbnailStateSnapshot[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isUndoRedoAction = useRef(false);

  // Sync canvas state when target project changes (Project Isolation)
  const handleSelectTargetProject = (projectId: string) => {
    setThumbTargetProjectId(projectId);
    const targetProj = projects.find((p) => p.id === projectId);
    if (targetProj) {
      if (targetProj.thumbnailUrl && targetProj.thumbnailUrl.startsWith("http")) {
        setThumbImageSrc(targetProj.thumbnailUrl);
      }
      if (targetProj.thumbnailOverlayText) {
        setThumbText(targetProj.thumbnailOverlayText);
      } else if (targetProj.thumbnailText) {
        setThumbText(targetProj.thumbnailText);
      }
      if (targetProj.thumbnailTextColor) {
        setThumbTextColor(targetProj.thumbnailTextColor);
      }
    }
  };

  // Record undo state snapshot
  const pushHistorySnapshot = useCallback(
    (snapshot: ThumbnailStateSnapshot) => {
      if (isUndoRedoAction.current) {
        isUndoRedoAction.current = false;
        return;
      }
      setHistoryStack((prev) => {
        const sliced = prev.slice(0, historyIndex + 1);
        return [...sliced, snapshot].slice(-25); // cap at 25 states
      });
      setHistoryIndex((prev) => Math.min(prev + 1, 24));
    },
    [historyIndex]
  );

  // Draw 16:9 Canvas (1280 × 720)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = thumbImageSrc;

    img.onload = () => {
      canvas.width = 1280;
      canvas.height = 720;

      // Draw cover background image
      ctx.drawImage(img, 0, 0, 1280, 720);

      // Gradient overlay for contrast
      const gradient = ctx.createLinearGradient(0, 0, 0, 720);
      gradient.addColorStop(0, "rgba(0,0,0,0.25)");
      gradient.addColorStop(0.5, "rgba(0,0,0,0.45)");
      gradient.addColorStop(1, "rgba(0,0,0,0.85)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1280, 720);

      // Render Corner Badge / Sticker if active
      if (thumbBadge && thumbBadge !== "NONE") {
        ctx.save();
        ctx.translate(140, 75);
        ctx.rotate(-0.08); // Slight organic tilt

        // Badge Shadow & Pill
        ctx.shadowColor = "rgba(0,0,0,0.7)";
        ctx.shadowBlur = 12;
        ctx.fillStyle = "#EF4444";
        ctx.beginPath();
        ctx.roundRect(-75, -28, 150, 56, 12);
        ctx.fill();

        ctx.lineWidth = 4;
        ctx.strokeStyle = "#FFFFFF";
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.font = "900 28px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText(thumbBadge.toUpperCase(), 0, 2);
        ctx.restore();
      }

      // Render Main Text Hook
      if (thumbText.trim()) {
        ctx.font = `900 ${thumbFontSize}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        let yPos = 360;
        if (thumbPosition === "top") yPos = 190;
        if (thumbPosition === "bottom") yPos = 530;

        const uppercaseText = thumbText.toUpperCase();
        const textMetrics = ctx.measureText(uppercaseText);

        // Optional Background Pill behind text
        if (thumbHasPill) {
          ctx.save();
          const padX = 40;
          const padY = 20;
          const boxW = textMetrics.width + padX * 2;
          const boxH = thumbFontSize + padY * 2;
          ctx.fillStyle = thumbPillColor;
          ctx.shadowColor = "rgba(0,0,0,0.8)";
          ctx.shadowBlur = 20;
          ctx.beginPath();
          ctx.roundRect(640 - boxW / 2, yPos - boxH / 2, boxW, boxH, 16);
          ctx.fill();
          ctx.restore();
        }

        // Heavy Stroke / Outline
        if (thumbStrokeWidth > 0) {
          ctx.lineWidth = thumbStrokeWidth;
          ctx.strokeStyle = "#000000";
          ctx.shadowColor = "rgba(0,0,0,0.9)";
          ctx.shadowBlur = thumbShadowBlur;
          ctx.strokeText(uppercaseText, 640, yPos);
        }

        // Fill Colored Text
        ctx.shadowBlur = 0;
        ctx.fillStyle = thumbTextColor;
        ctx.fillText(uppercaseText, 640, yPos);
      }
    };
  }, [
    thumbImageSrc,
    thumbText,
    thumbFontSize,
    thumbTextColor,
    thumbPosition,
    thumbStrokeWidth,
    thumbShadowBlur,
    thumbHasPill,
    thumbPillColor,
    thumbBadge,
    activeTab,
  ]);

  // Apply a style preset
  const handleApplyPreset = (preset: (typeof THUMBNAIL_PRESETS)[0]) => {
    pushHistorySnapshot({
      imageSrc: thumbImageSrc,
      text: thumbText,
      fontSize: thumbFontSize,
      textColor: thumbTextColor,
      position: thumbPosition,
      strokeWidth: thumbStrokeWidth,
      shadowBlur: thumbShadowBlur,
      hasPill: thumbHasPill,
      pillColor: thumbPillColor,
      badge: thumbBadge,
    });
    setThumbTextColor(preset.textColor);
    setThumbStrokeWidth(preset.strokeWidth);
    setThumbShadowBlur(preset.shadowBlur);
    setThumbHasPill(preset.hasPill);
    if (preset.pillColor) setThumbPillColor(preset.pillColor);
    if (preset.badge) setThumbBadge(preset.badge);
    toast.info("Preset Applied", `Loaded "${preset.name}".`);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      isUndoRedoAction.current = true;
      const targetState = historyStack[historyIndex - 1];
      setThumbImageSrc(targetState.imageSrc);
      setThumbText(targetState.text);
      setThumbFontSize(targetState.fontSize);
      setThumbTextColor(targetState.textColor);
      setThumbPosition(targetState.position);
      setThumbStrokeWidth(targetState.strokeWidth);
      setThumbShadowBlur(targetState.shadowBlur);
      setThumbHasPill(targetState.hasPill);
      setThumbPillColor(targetState.pillColor);
      setThumbBadge(targetState.badge);
      setHistoryIndex((prev) => prev - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < historyStack.length - 1) {
      isUndoRedoAction.current = true;
      const targetState = historyStack[historyIndex + 1];
      setThumbImageSrc(targetState.imageSrc);
      setThumbText(targetState.text);
      setThumbFontSize(targetState.fontSize);
      setThumbTextColor(targetState.textColor);
      setThumbPosition(targetState.position);
      setThumbStrokeWidth(targetState.strokeWidth);
      setThumbShadowBlur(targetState.shadowBlur);
      setThumbHasPill(targetState.hasPill);
      setThumbPillColor(targetState.pillColor);
      setThumbBadge(targetState.badge);
      setHistoryIndex((prev) => prev + 1);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          pushHistorySnapshot({
            imageSrc: thumbImageSrc,
            text: thumbText,
            fontSize: thumbFontSize,
            textColor: thumbTextColor,
            position: thumbPosition,
            strokeWidth: thumbStrokeWidth,
            shadowBlur: thumbShadowBlur,
            hasPill: thumbHasPill,
            pillColor: thumbPillColor,
            badge: thumbBadge,
          });
          setThumbImageSrc(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownloadThumbnail = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `creatorflow-thumbnail-1280x720.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    toast.success("Thumbnail Exported", "Downloaded 1280x720 PNG (16:9) image.");
  };

  const handleAssignThumbnailToProject = () => {
    const canvas = canvasRef.current;
    if (!canvas || !thumbTargetProjectId) return;
    const dataUrl = canvas.toDataURL("image/png");
    updateProject(thumbTargetProjectId, {
      thumbnailUrl: dataUrl,
      thumbnailOverlayText: thumbText,
      thumbnailTextColor: thumbTextColor,
    });
    toast.success("Thumbnail Assigned", "Applied thumbnail to chosen video project.");
  };

  // ---------------------------------------------------------------------------
  // 3. UPLOAD MANAGER & AI PUBLISHING STUDIO STATE
  // ---------------------------------------------------------------------------
  const [uploadSelectedProjectId, setUploadSelectedProjectId] = useState<string>(projects[0]?.id || "");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPrivacy, setUploadPrivacy] = useState<VideoPrivacy>("public");
  const [uploadMadeForKids, setUploadMadeForKids] = useState<boolean>(false);
  const [uploadPublishDate, setUploadPublishDate] = useState<string>("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatusMsg, setUploadStatusMsg] = useState("");
  const [uploadPublishedId, setUploadPublishedId] = useState<string | null>(null);
  const [isLiveUploaded, setIsLiveUploaded] = useState(false);
  const uploadAbortControllerRef = useRef<AbortController | null>(null);
  const currentUploadSessionUrlRef = useRef<string | null>(null);
  const currentUploadAccessTokenRef = useRef<string | null>(null);

  // AI Publishing Studio State
  const [publishContentType, setPublishContentType] = useState<"video" | "shorts" | "post">("shorts");
  const [publishTopic, setPublishTopic] = useState("");
  const [publishTitle, setPublishTitle] = useState("");
  const [publishDescription, setPublishDescription] = useState("");
  const [publishTags, setPublishTags] = useState<string[]>([]);
  const [publishHashtags, setPublishHashtags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState("");
  const [customThumbPreview, setCustomThumbPreview] = useState<string | null>(null);

  // Creative Angle & Style Selector for Regeneration
  const [publishStyleAngle, setPublishStyleAngle] = useState<
    "viral_shorts" | "curiosity_gap" | "seo_search" | "contrarian_shock" | "story_challenge"
  >("viral_shorts");
  const [isOptimizingAi, setIsOptimizingAi] = useState(false);
  const [aiOptimizerData, setAiOptimizerData] = useState<any | null>(null);
  const [selectedTitleIdx, setSelectedTitleIdx] = useState<number | null>(null);

  const activeUploadProject = projects.find((p) => p.id === uploadSelectedProjectId);

  // Synchronize inputs when a project is selected
  useEffect(() => {
    if (activeUploadProject) {
      if (activeUploadProject.selectedTitle || activeUploadProject.name) {
        setPublishTitle(activeUploadProject.selectedTitle || activeUploadProject.name);
      }
      if (activeUploadProject.topic) {
        setPublishTopic(activeUploadProject.topic);
      }
      if (activeUploadProject.description) {
        setPublishDescription(activeUploadProject.description);
      }
      if (activeUploadProject.tags && activeUploadProject.tags.length > 0) {
        setPublishTags(activeUploadProject.tags);
      }
      if (activeUploadProject.hashtags && activeUploadProject.hashtags.length > 0) {
        setPublishHashtags(activeUploadProject.hashtags);
      }
      if (activeUploadProject.contentType) {
        setPublishContentType(activeUploadProject.contentType === "shorts" ? "shorts" : "video");
      }
      if (activeUploadProject.thumbnailUrl) {
        setCustomThumbPreview(activeUploadProject.thumbnailUrl);
      }
    }
  }, [activeUploadProject]);

  const handleOptimizeWithAi = async (overrideAngle?: string) => {
    const topicToUse =
      publishTopic.trim() ||
      publishTitle.trim() ||
      activeUploadProject?.name ||
      "Minecraft & Gaming viral video";
    const angleToUse = overrideAngle || publishStyleAngle;

    setIsOptimizingAi(true);
    try {
      const res = await fetch("/api/ai/publish-optimizer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topicToUse,
          niche: (activeChannel as any)?.niche || "Minecraft & Gaming",
          contentType: publishContentType,
          styleAngle: angleToUse,
          channelName: activeChannel?.title,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setAiOptimizerData(data.data);
        if (data.data.titles?.[0]) {
          setPublishTitle(data.data.titles[0].title);
          setSelectedTitleIdx(0);
        }
        if (data.data.description?.text && !publishDescription.trim()) {
          setPublishDescription(data.data.description.text);
        }
        if (data.data.tags?.length && publishTags.length === 0) {
          setPublishTags(data.data.tags.map((t: any) => t.tag));
        }
        if (data.data.hashtags?.length && publishHashtags.length === 0) {
          setPublishHashtags(data.data.hashtags.map((h: any) => h.tag));
        }
        toast.success("AI Suggestions Formulated", `Ranked titles, SEO description, and high-ranking tags ready.`);
      } else {
        toast.error("Generation Failed", data.error || "Could not generate optimization package.");
      }
    } catch (e: any) {
      toast.error("Error", e?.message || "Failed to reach AI optimizer.");
    } finally {
      setIsOptimizingAi(false);
    }
  };

  const handleApplyTitle = (item: any, idx: number) => {
    setPublishTitle(item.title);
    setSelectedTitleIdx(idx);
    toast.success("Title Selected", `Set primary title: "${item.title}" (${item.score}/10)`);
  };

  const handleApplyDescription = () => {
    if (!aiOptimizerData?.description?.text) return;
    setPublishDescription(aiOptimizerData.description.text);
    toast.success("Description Applied", `SEO score ${aiOptimizerData.description.score}/10 applied.`);
  };

  const handleApplyAllHashtags = () => {
    if (!aiOptimizerData?.hashtags) return;
    const tagsToAdd = aiOptimizerData.hashtags.map((h: any) => h.tag);
    setPublishHashtags(Array.from(new Set([...publishHashtags, ...tagsToAdd])));
    toast.success("Hashtags Added", `Added ${tagsToAdd.length} high-ranking hashtags.`);
  };

  const handleToggleHashtag = (tag: string) => {
    if (publishHashtags.includes(tag)) {
      setPublishHashtags(publishHashtags.filter((h) => h !== tag));
    } else {
      setPublishHashtags([...publishHashtags, tag]);
    }
  };

  const handleApplyAllTags = () => {
    if (!aiOptimizerData?.tags) return;
    const tagsToAdd = aiOptimizerData.tags.map((t: any) => t.tag);
    setPublishTags(Array.from(new Set([...publishTags, ...tagsToAdd])));
    toast.success("Tags Added", `Added ${tagsToAdd.length} high-ranking video tags.`);
  };

  const handleAddCustomTag = () => {
    if (!newTagInput.trim()) return;
    if (!publishTags.includes(newTagInput.trim())) {
      setPublishTags([...publishTags, newTagInput.trim()]);
    }
    setNewTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setPublishTags(publishTags.filter((t) => t !== tagToRemove));
  };

  const handleCustomThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCustomThumbPreview(event.target.result as string);
          toast.success("Thumbnail Attached", "Custom thumbnail set for release preview.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStartUploadProcess = () => {
    if (!publishTitle.trim()) {
      toast.warning("Title Required", "Please enter or select a video title.");
      return;
    }

    if (uploadSelectedProjectId) {
      const proj = projects.find((p) => p.id === uploadSelectedProjectId);
      if (proj?.status === "uploading") {
        toast.error("Upload in Progress", "This video project is already currently uploading.");
        return;
      }
    }

    setShowConfirmModal(true);
  };

  const handleCancelUpload = async () => {
    // 1. Abort active browser request
    if (uploadAbortControllerRef.current) {
      uploadAbortControllerRef.current.abort();
      uploadAbortControllerRef.current = null;
    }
    setIsUploading(false);
    setUploadProgress(0);

    const sessionUrl = currentUploadSessionUrlRef.current;
    const token = currentUploadAccessTokenRef.current;
    let terminationConfirmed = false;

    // 2. Send DELETE request to Google resumable session if live session URL exists
    if (sessionUrl && isLiveUploaded) {
      setUploadStatusMsg("Sending cancellation request to YouTube servers...");
      try {
        const cancelResult = await cancelYouTubeUploadSession(sessionUrl, token || undefined);
        terminationConfirmed = cancelResult.sessionTerminated;
      } catch {
        terminationConfirmed = false;
      }
    }

    // 3. Accurately report session status per Google specification
    if (terminationConfirmed) {
      setUploadStatusMsg("Upload cancelled and session confirmed terminated on YouTube servers (HTTP 499).");
      toast.info("Upload Cancelled", "YouTube upload session was confirmed terminated (HTTP 499).");
    } else {
      setUploadStatusMsg("Upload cancelled locally; remote session status could not be verified.");
      toast.warning("Upload Cancelled", "Upload cancelled locally; remote session status could not be verified.");
    }

    // 4. Update status to 'cancelled' (distinguished from 'failed')
    if (uploadSelectedProjectId) {
      updateProject(uploadSelectedProjectId, { status: "cancelled" });
    }
    currentUploadSessionUrlRef.current = null;
    currentUploadAccessTokenRef.current = null;
  };

  const handleConfirmAndUpload = async () => {
    setShowConfirmModal(false);
    setIsUploading(true);
    setUploadProgress(5);
    setUploadStatusMsg("Validating video project and initiating YouTube upload session...");

    const quota = checkQuota("upload");
    if (!quota.allowed) {
      toast.error("Upload Quota Reached", `Monthly upload limit reached (${quota.current}/${quota.max}).`);
      setIsUploading(false);
      return;
    }

    try {
      let activeProj = projects.find((p) => p.id === uploadSelectedProjectId);
      let targetProjectId = uploadSelectedProjectId;

      if (!activeProj) {
        targetProjectId = `proj-${Date.now()}`;
        const newProject: VideoProject = {
          id: targetProjectId,
          user_id: user?.id || "demo-session",
          channel_id: activeChannel?.id || null,
          name: publishTitle || "New Video Release",
          topic: publishTopic || publishTitle || "New Video",
          contentType: publishContentType,
          selectedTitle: publishTitle,
          description: publishDescription,
          tags: publishTags,
          hashtags: publishHashtags,
          status: "uploading",
          niche: (activeChannel as any)?.niche || "Minecraft & Gaming",
          targetAudience: "YouTube Viewers",
          language: "English",
          idea: publishTopic || publishTitle,
          hook: "High retention opening hook",
          hookSuggestions: [],
          titleSuggestions: aiOptimizerData?.titles?.map((t: any) => t.title) || [],
          outline: [],
          script: "",
          thumbnailText: "",
          pinnedComment: aiOptimizerData?.pinnedComment || "",
          chapters: [],
          qualityScore: {
            overall: 95,
            clarity: 95,
            relevance: 95,
            readability: 95,
            keywordCoverage: 95,
            critique: ["Generated via CreatorFlow AI Studio"],
          },
          thumbnailUrl: customThumbPreview || null,
          thumbnailOverlayText: null,
          privacyStatus: uploadPrivacy,
          selfDeclaredMadeForKids: uploadMadeForKids,
          scheduledAt: uploadPublishDate || null,
          publishedAt: null,
          youtubeVideoId: null,
          youtubeVideoUrl: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        addProject(newProject);
        activeProj = newProject;
        setUploadSelectedProjectId(targetProjectId);
      } else {
        updateProject(targetProjectId, {
          selectedTitle: publishTitle || activeProj.selectedTitle,
          description: publishDescription || activeProj.description,
          tags: publishTags.length > 0 ? publishTags : activeProj.tags,
          hashtags: publishHashtags.length > 0 ? publishHashtags : activeProj.hashtags,
          status: "uploading",
        });
      }

      // 1. Call server API to initiate session
      const initRes = await fetch("/api/youtube/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.id || "demo-session"}`,
        },
        body: JSON.stringify({
          action: "initiate",
          title: publishTitle || activeProj.selectedTitle || activeProj.name,
          description: publishDescription || activeProj.description || "",
          tags: publishTags.length > 0 ? publishTags : (activeProj.tags || []),
          privacyStatus: uploadPrivacy,
          selfDeclaredMadeForKids: uploadMadeForKids,
          publishAt: uploadPublishDate || null,
          channelId: activeChannel?.id,
          fileSize: uploadFile ? uploadFile.size : 150000000,
          fileType: uploadFile ? uploadFile.type : "video/mp4",
          projectId: targetProjectId,
        }),
      });

      const initData = await initRes.json();
      if (!initData.success) {
        throw new Error(initData.error || "Failed to initiate YouTube upload session.");
      }

      currentUploadSessionUrlRef.current = initData.data?.uploadUrl || null;
      currentUploadAccessTokenRef.current = initData.data?.accessToken || null;

      // Check if real Google resumable upload URL is returned
      if (initData.data?.uploadUrl && uploadFile) {
        // 2A. REAL GOOGLE RESUMABLE UPLOAD VIA MULTI-CHUNK PROTOCOL (Option B)
        setIsLiveUploaded(true);
        setUploadStatusMsg("Beginning chunked transmission (256 KiB aligned) to YouTube Data API v3...");

        const uploadUrl = initData.data.uploadUrl;
        const abortController = new AbortController();
        uploadAbortControllerRef.current = abortController;

        const uploadResult = await uploadVideoInChunks({
          uploadUrl,
          accessToken: initData.data?.accessToken,
          file: uploadFile,
          chunkSize: 2 * 1024 * 1024, // 2MB chunks (multiple of 256 KiB)
          signal: abortController.signal,
          onProgress: (percent, bytesUploaded, totalBytes) => {
            setUploadProgress(percent);
            setUploadStatusMsg(
              `Transmitting video chunks to YouTube: ${percent}% (${(bytesUploaded / 1024 / 1024).toFixed(1)} / ${(totalBytes / 1024 / 1024).toFixed(1)} MB)...`
            );
          },
          onChunkComplete: (chunkIndex, totalChunks, bytesUploaded) => {
            setUploadStatusMsg(
              `Chunk ${chunkIndex} of ${totalChunks} acknowledged by YouTube (${(bytesUploaded / 1024 / 1024).toFixed(1)} MB)...`
            );
          },
          onRetry: (attempt, delayMs, reason) => {
            setUploadStatusMsg(
              `Network drop detected. Retrying with exponential backoff (Attempt ${attempt}, delay ${Math.round(delayMs / 1000)}s)...`
            );
            toast.warning("Network Interruption", `Recovering upload stream (Retry ${attempt})...`);
          },
        });

        uploadAbortControllerRef.current = null;
        currentUploadSessionUrlRef.current = null;

        if (uploadResult.aborted) {
          setUploadStatusMsg("Upload cancelled by creator.");
          updateProject(uploadSelectedProjectId, { status: "cancelled" });
          return;
        }

        if (!uploadResult.success) {
          throw new Error(uploadResult.error || "Chunked video upload failed.");
        }

        const confirmedYtId = uploadResult.videoId || `yt_confirmed_${Date.now()}`;
        setUploadPublishedId(confirmedYtId);

        // Optional post-upload live verification check via API
        setUploadProgress(100);
        setUploadStatusMsg("Verifying video processing with YouTube Data API v3...");

        try {
          await fetch("/api/youtube/upload", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user?.id || "demo-session"}`,
            },
            body: JSON.stringify({
              action: "verify",
              videoId: confirmedYtId,
              channelId: activeChannel?.id,
            }),
          });
        } catch {
          // Verification check is best-effort confirmation
        }

        updateProject(uploadSelectedProjectId, {
          status: uploadPublishDate ? "scheduled" : "published",
          privacyStatus: uploadPrivacy,
          selfDeclaredMadeForKids: uploadMadeForKids,
          scheduledAt: uploadPublishDate || null,
          publishedAt: uploadPublishDate ? null : new Date().toISOString(),
          youtubeVideoId: confirmedYtId,
          youtubeVideoUrl: `https://youtube.com/watch?v=${confirmedYtId}`,
          isSimulatedPublish: false,
          videoFileRef: {
            name: uploadFile.name,
            size: uploadFile.size,
            type: uploadFile.type,
          },
        });

        addUploadJob({
          video_id: uploadSelectedProjectId,
          channel_id: activeChannel?.id || "chan-live",
          status: "completed",
          progress_percent: 100,
          bytes_uploaded: uploadFile.size,
          total_bytes: uploadFile.size,
        });

        toast.success(
          uploadPublishDate ? "YouTube Video Scheduled" : "YouTube Video Published",
          `Confirmed on YouTube pipeline: "${activeProj.selectedTitle.substring(0, 32)}...". Video ID: ${confirmedYtId}`
        );
      } else {
        // 2B. DEMO SANDBOX PUBLISHING WITH HONEST ATTRIBUTION
        setIsLiveUploaded(false);
        setUploadStatusMsg("Simulating YouTube upload state machine in sandbox mode...");

        setTimeout(() => {
          setUploadProgress(40);
          setUploadStatusMsg("Packaging metadata and SEO tags...");
        }, 800);

        setTimeout(() => {
          setUploadProgress(80);
          setUploadStatusMsg("Applying YouTube privacy and release flags...");
        }, 1800);

        setTimeout(() => {
          const generatedYtId = `yt_demo_${Math.random().toString(36).substring(2, 9)}`;
          setUploadProgress(100);
          setUploadStatusMsg("Sandbox upload simulated successfully!");
          setUploadPublishedId(generatedYtId);

          updateProject(uploadSelectedProjectId, {
            status: uploadPublishDate ? "scheduled" : "published",
            privacyStatus: uploadPrivacy,
            selfDeclaredMadeForKids: uploadMadeForKids,
            scheduledAt: uploadPublishDate || null,
            publishedAt: uploadPublishDate ? null : new Date().toISOString(),
            youtubeVideoId: generatedYtId,
            youtubeVideoUrl: `https://youtube.com/watch?v=${generatedYtId}`,
            isSimulatedPublish: true,
            videoFileRef: uploadFile
              ? { name: uploadFile.name, size: uploadFile.size, type: uploadFile.type }
              : undefined,
          });

          addUploadJob({
            video_id: uploadSelectedProjectId,
            channel_id: activeChannel?.id || "chan-demo-1",
            status: "completed",
            progress_percent: 100,
            bytes_uploaded: uploadFile ? uploadFile.size : 150000000,
            total_bytes: uploadFile ? uploadFile.size : 150000000,
          });

          toast.info(
            uploadPublishDate ? "Sandbox Release Scheduled" : "Sandbox Release Published",
            `[Demo Mode] Simulated publish for "${activeProj.selectedTitle.substring(0, 30)}...".`
          );
        }, 2800);
      }
    } catch (err: any) {
      const isAbort =
        err?.name === "AbortError" ||
        err?.message?.includes("cancelled") ||
        uploadAbortControllerRef.current?.signal.aborted;

      if (isAbort) {
        setUploadStatusMsg("Upload cancelled by creator.");
        toast.info("Upload Aborted", "Transmission stopped.");
        if (uploadSelectedProjectId) {
          updateProject(uploadSelectedProjectId, { status: "cancelled" });
        }
      } else {
        toast.error("Upload Failed", err?.message || "Failed to complete YouTube upload.");
        setUploadStatusMsg(`Error: ${err?.message || "Upload failed."}`);
        if (uploadSelectedProjectId) {
          updateProject(uploadSelectedProjectId, { status: "failed" });
        }
      }
    } finally {
      currentUploadSessionUrlRef.current = null;
      setTimeout(() => setIsUploading(false), 3000);
    }
  };

  // ---------------------------------------------------------------------------
  // 4. PUBLISHING CALENDAR STATE & RESCHEDULING MODAL
  // ---------------------------------------------------------------------------
  const [rescheduleProject, setRescheduleProject] = useState<VideoProject | null>(null);
  const [newScheduleDate, setNewScheduleDate] = useState("");
  const [calendarFilter, setCalendarFilter] = useState<string>("all");

  const handleOpenReschedule = (p: VideoProject) => {
    setRescheduleProject(p);
    const existing = p.scheduledAt
      ? new Date(p.scheduledAt).toISOString().slice(0, 16)
      : new Date(Date.now() + 86400000).toISOString().slice(0, 16);
    setNewScheduleDate(existing);
  };

  const handleSaveReschedule = () => {
    if (!rescheduleProject || !newScheduleDate) return;
    const isoDate = new Date(newScheduleDate).toISOString();

    updateProject(rescheduleProject.id, {
      scheduledAt: isoDate,
      status: "scheduled",
    });

    toast.success("Release Rescheduled", `Updated publishing date for "${rescheduleProject.selectedTitle.substring(0, 30)}...".`);
    setRescheduleProject(null);
  };

  const handleQuickReschedule = (daysFromNow: number) => {
    const targetDate = new Date(Date.now() + daysFromNow * 86400000);
    targetDate.setHours(17, 0, 0, 0); // 5:00 PM drop time
    setNewScheduleDate(targetDate.toISOString().slice(0, 16));
  };

  const calendarItems = projects.filter((p) => {
    if (calendarFilter === "scheduled") return p.status === "scheduled" || Boolean(p.scheduledAt);
    if (calendarFilter === "published") return p.status === "published";
    if (calendarFilter === "draft") return p.status === "draft" || p.status === "idea";
    return p.scheduledAt || p.status === "scheduled" || p.status === "published";
  });

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-6xl mx-auto pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-blue/10 text-brand-blue border border-brand-blue/20">
                Publishing Pipeline
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Publish & Release Workspace
              </h1>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Central video projects, 16:9 thumbnail studio, YouTube Data API resumable uploads, and release calendar.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/dashboard/create">
              <Button variant="gradient" size="sm" className="text-xs font-semibold px-4 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                New AI Video Idea
              </Button>
            </Link>
          </div>
        </div>

        {/* 4 Consolidated Sub-Navigation Tabs */}
        <div className="flex border-b border-navy-800 gap-2 overflow-x-auto pb-1">
          {[
            { id: "uploads", label: "Upload & AI Publish", icon: UploadCloud },
            { id: "projects", label: `Video Projects (${projects.length})`, icon: Layers },
            { id: "thumbnails", label: "Thumbnail Studio", icon: ImageIcon },
            { id: "calendar", label: "Publishing Calendar", icon: CalendarIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-navy-800 text-white border border-navy-700 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-navy-900/40"
                }`}
              >
                <Icon className={`w-4 h-4 ${activeTab === tab.id ? "text-brand-purple" : "text-slate-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* =====================================================================
            TAB 1: CENTRAL VIDEO PROJECTS WORKSPACE
            ===================================================================== */}
        {activeTab === "projects" && (
          <div className="space-y-6">
            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-navy-900/60 border border-navy-800">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Search video projects..."
                  value={projectSearch}
                  onChange={(e) => setProjectSearch(e.target.value)}
                  className="pl-9 h-9 bg-navy-950 border-navy-700 text-xs text-slate-200"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-9 rounded-lg bg-navy-950 border border-navy-700 text-xs text-slate-200 px-3 focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="draft">Drafts</option>
                  <option value="ready">Ready to Upload</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="published">Published</option>
                </select>

                <Button
                  onClick={() => {
                    const newProj = addProject({
                      name: "Untitled Project",
                      topic: "New Video Topic",
                      selectedTitle: "New Video Title",
                    });
                    handleOpenProject(newProj);
                  }}
                  variant="outline"
                  size="sm"
                  className="text-xs border-navy-700 bg-navy-900/60 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Blank Project
                </Button>
              </div>
            </div>

            {/* Projects Grid */}
            {filteredProjects.length === 0 ? (
              <div className="p-12 text-center rounded-2xl border border-navy-800 bg-navy-900/30 space-y-3">
                <Layers className="w-10 h-10 text-slate-500 mx-auto" />
                <h3 className="text-base font-bold text-white">No video projects found</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Create a new project from your AI ideas or start a blank project to organize your scripts and release dates.
                </p>
                <Link href="/dashboard/create">
                  <Button variant="gradient" size="sm" className="text-xs">
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                    Generate with AI Studio
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredProjects.map((p) => {
                  const hasVideoFile = Boolean(p.videoFileRef?.name);
                  const isScheduled = Boolean(p.scheduledAt) || p.status === "scheduled";
                  const isPublished = p.status === "published";

                  return (
                    <Card
                      key={p.id}
                      className="border-navy-800 bg-navy-900/60 hover:border-navy-700 transition-all flex flex-col justify-between overflow-hidden group shadow-md"
                    >
                      {/* Thumbnail Preview Area */}
                      <div className="relative aspect-video bg-navy-950 overflow-hidden border-b border-navy-800/80">
                        {p.thumbnailUrl ? (
                          <img
                            src={p.thumbnailUrl}
                            alt={p.selectedTitle}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-1.5">
                            <ImageIcon className="w-8 h-8 opacity-40" />
                            <span className="text-[10px]">No Thumbnail Assigned</span>
                          </div>
                        )}

                        {p.thumbnailOverlayText && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-2 text-center pointer-events-none">
                            <span
                              style={{ color: p.thumbnailTextColor || "#FACC15" }}
                              className="text-xs font-black tracking-wider uppercase font-mono drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
                            >
                              {p.thumbnailOverlayText}
                            </span>
                          </div>
                        )}

                        {/* Status Badges */}
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                              isPublished
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : isScheduled
                                ? "bg-brand-purple/20 text-brand-purple border border-brand-purple/30"
                                : p.status === "ready"
                                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                : "bg-slate-800 text-slate-300 border border-slate-700"
                            }`}
                          >
                            {p.status}
                          </span>

                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-black/60 text-slate-300">
                            {p.privacyStatus}
                          </span>
                        </div>

                        {p.youtubeVideoId && (
                          <a
                            href={p.youtubeVideoUrl || `https://youtube.com/watch?v=${p.youtubeVideoId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute top-2.5 right-2.5 bg-red-600/90 text-white p-1 rounded-md hover:bg-red-500 transition-colors"
                            title="View on YouTube"
                          >
                            <Youtube className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>

                      {/* Content Area */}
                      <CardContent className="p-4 space-y-3 flex-1">
                        <div>
                          <h4 className="text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-brand-purple transition-colors">
                            {p.selectedTitle || p.name}
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                            Topic: {p.topic}
                          </p>
                        </div>

                        {/* Release Metadata Indicator */}
                        <div className="space-y-1 text-[11px] text-slate-400 pt-1 border-t border-navy-800/60">
                          {isScheduled && (
                            <div className="flex items-center gap-1.5 text-brand-purple">
                              <Clock className="w-3 h-3" />
                              <span>Drop: {p.scheduledAt ? new Date(p.scheduledAt).toLocaleDateString() : "Pending"}</span>
                            </div>
                          )}

                          {hasVideoFile ? (
                            <div className="flex items-center gap-1.5 text-slate-300">
                              <FileVideo className="w-3 h-3 text-emerald-400" />
                              <span className="truncate max-w-[180px]">{p.videoFileRef?.name}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-slate-500">
                              <FileVideo className="w-3 h-3" />
                              <span>No video file attached</span>
                            </div>
                          )}
                        </div>
                      </CardContent>

                      {/* Actions Footer */}
                      <CardFooter className="p-3 border-t border-navy-800/80 bg-navy-950/40 flex items-center justify-between">
                        <Button
                          onClick={() => handleOpenProject(p)}
                          variant="ghost"
                          size="sm"
                          className="text-xs h-7 px-2 text-slate-300 hover:text-white"
                        >
                          <Edit3 className="w-3 h-3 mr-1" />
                          Edit Details
                        </Button>

                        <div className="flex items-center gap-1.5">
                          <Button
                            onClick={() => {
                              setUploadSelectedProjectId(p.id);
                              setActiveTab("uploads");
                            }}
                            variant="outline"
                            size="sm"
                            className="text-xs h-7 px-2.5 border-navy-700 bg-navy-900"
                          >
                            <UploadCloud className="w-3 h-3 mr-1 text-brand-blue" />
                            Upload
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Project Edit Modal */}
            <Modal
              isOpen={isEditingProject}
              onClose={() => setIsEditingProject(false)}
              title={editForm.selectedTitle || editForm.name || "Edit Video Project"}
              description="Update project metadata, attached assets, script, and status."
              maxWidth="4xl"
              footer={
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        autoSaveStatus === "saved"
                          ? "bg-emerald-400"
                          : autoSaveStatus === "saving"
                          ? "bg-amber-400 animate-pulse"
                          : "bg-slate-400"
                      }`}
                    />
                    <span>
                      {autoSaveStatus === "saved"
                        ? "Saved"
                        : autoSaveStatus === "saving"
                        ? "Saving..."
                        : "Unsaved changes"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedProject && (
                      <Link href={`/dashboard/create?projectId=${selectedProject.id}`}>
                        <Button variant="outline" size="sm" className="text-xs border-navy-700 bg-navy-900 text-slate-200 hover:text-white">
                          <Sparkles className="w-3.5 h-3.5 mr-1 text-brand-purple" />
                          AI Studio & Versions
                        </Button>
                      </Link>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (selectedProject) {
                          deleteProject(selectedProject.id);
                          setIsEditingProject(false);
                        }
                      }}
                      className="text-xs px-3"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      Delete
                    </Button>
                    <Button variant="gradient" size="sm" onClick={handleSaveProjectEdits} className="text-xs px-5">
                      Save Project
                    </Button>
                  </div>
                </div>
              }
            >
              {selectedProject && (
                <div className="space-y-6 max-h-[70vh] overflow-y-auto px-1 pr-2">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-xs font-semibold text-slate-200">Selected YouTube Title</label>
                      <Input
                        value={editForm.selectedTitle || ""}
                        onChange={(e) => handleUpdateField("selectedTitle", e.target.value)}
                        className="bg-navy-900 border-navy-700 text-xs text-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-200">Project Status</label>
                      <select
                        value={editForm.status || "draft"}
                        onChange={(e) => handleUpdateField("status", e.target.value)}
                        className="w-full h-9 rounded-lg bg-navy-900 border border-navy-700 text-xs text-slate-200 px-3"
                      >
                        <option value="draft">Draft</option>
                        <option value="ready">Ready to Upload</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="published">Published</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-200">0–3s Opening Hook</label>
                    <Input
                      value={editForm.hook || ""}
                      onChange={(e) => handleUpdateField("hook", e.target.value)}
                      placeholder="High-curiosity opening sentence"
                      className="bg-navy-900 border-navy-700 text-xs text-slate-200"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-200">Video Script & Outline</label>
                    <Textarea
                      value={editForm.script || ""}
                      onChange={(e) => handleUpdateField("script", e.target.value)}
                      rows={6}
                      className="font-mono text-xs bg-navy-900 border-navy-700 text-slate-200 leading-relaxed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-200">YouTube Description</label>
                    <Textarea
                      value={editForm.description || ""}
                      onChange={(e) => handleUpdateField("description", e.target.value)}
                      rows={4}
                      className="text-xs bg-navy-900 border-navy-700 text-slate-200"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-200">Tags (comma separated)</label>
                      <Input
                        value={Array.isArray(editForm.tags) ? editForm.tags.join(", ") : ""}
                        onChange={(e) =>
                          handleUpdateField(
                            "tags",
                            e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                          )
                        }
                        className="bg-navy-900 border-navy-700 text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-200">Privacy Status</label>
                      <select
                        value={editForm.privacyStatus || "private"}
                        onChange={(e) => handleUpdateField("privacyStatus", e.target.value)}
                        className="w-full h-9 rounded-lg bg-navy-900 border border-navy-700 text-xs text-slate-200 px-3"
                      >
                        <option value="public">Public</option>
                        <option value="unlisted">Unlisted</option>
                        <option value="private">Private</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </Modal>
          </div>
        )}

        {/* =====================================================================
            TAB 2: THUMBNAIL STUDIO (HTML5 CANVAS 16:9 + PRESETS + UNDO/REDO)
            ===================================================================== */}
        {activeTab === "thumbnails" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Col: Controls */}
            <div className="space-y-5">
              <Card className="border-navy-800 bg-navy-900/60">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base text-white font-bold flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-brand-purple" />
                      Thumbnail Studio
                    </CardTitle>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleUndo}
                        disabled={historyIndex <= 0}
                        className="h-7 w-7 p-0 text-slate-400 hover:text-white disabled:opacity-30"
                        title="Undo"
                      >
                        <Undo2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRedo}
                        disabled={historyIndex >= historyStack.length - 1}
                        className="h-7 w-7 p-0 text-slate-400 hover:text-white disabled:opacity-30"
                        title="Redo"
                      >
                        <Redo2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription className="text-xs text-slate-400">
                    Create standard 16:9 thumbnails (1280 × 720) with text presets, badges, and PNG export.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 text-xs">
                  {/* Style Presets */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-300">Style Presets</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {THUMBNAIL_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() => handleApplyPreset(preset)}
                          className="px-2 py-1.5 rounded-lg border border-navy-800 bg-navy-950/70 hover:border-brand-purple/40 text-left text-[11px] text-slate-300 hover:text-white transition-colors truncate"
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Upload Image */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-300">Background Image</label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full text-xs border-navy-700 h-9"
                    >
                      <UploadCloud className="w-3.5 h-3.5 mr-1.5 text-brand-purple" />
                      Upload Local Image
                    </Button>
                  </div>

                  {/* Text Hook */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-300">Overlay Text (2–4 words)</label>
                    <Input
                      value={thumbText}
                      onChange={(e) => setThumbText(e.target.value)}
                      className="bg-navy-950 border-navy-700 text-xs uppercase font-bold text-amber-300"
                    />
                  </div>

                  {/* Corner Badge / Sticker */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-300">Corner Badge / Sticker</label>
                    <div className="flex flex-wrap gap-1">
                      {CORNER_BADGES.map((b) => (
                        <button
                          key={b}
                          onClick={() => setThumbBadge(b)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                            thumbBadge === b
                              ? "bg-red-500 text-white shadow-sm"
                              : "bg-navy-950 border border-navy-800 text-slate-400 hover:text-white"
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Font Size & Stroke */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-slate-300">
                        <span>Font Size</span>
                        <span className="font-mono">{thumbFontSize}px</span>
                      </div>
                      <input
                        type="range"
                        min="36"
                        max="110"
                        value={thumbFontSize}
                        onChange={(e) => setThumbFontSize(parseInt(e.target.value, 10))}
                        className="w-full accent-brand-purple"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-slate-300">
                        <span>Outline Stroke</span>
                        <span className="font-mono">{thumbStrokeWidth}px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="24"
                        value={thumbStrokeWidth}
                        onChange={(e) => setThumbStrokeWidth(parseInt(e.target.value, 10))}
                        className="w-full accent-brand-purple"
                      />
                    </div>
                  </div>

                  {/* Text Color Swatches */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-300">Text Color</label>
                    <div className="flex items-center gap-2">
                      {["#FACC15", "#FFFFFF", "#38BDF8", "#F43F5E", "#10B981"].map((c) => (
                        <button
                          key={c}
                          onClick={() => setThumbTextColor(c)}
                          style={{ backgroundColor: c }}
                          className={`w-7 h-7 rounded-full border-2 transition-all ${
                            thumbTextColor === c ? "border-white scale-110 shadow-glow" : "border-navy-800"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Background Pill Toggle */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-navy-950 border border-navy-800">
                    <label className="text-slate-300 font-semibold cursor-pointer">Background Pill Box</label>
                    <input
                      type="checkbox"
                      checked={thumbHasPill}
                      onChange={(e) => setThumbHasPill(e.target.checked)}
                      className="accent-brand-purple h-4 w-4 rounded"
                    />
                  </div>

                  {/* Target Video Project Binding */}
                  <div className="space-y-1.5 pt-2 border-t border-navy-800">
                    <label className="font-semibold text-slate-300">Bind to Video Project</label>
                    <select
                      value={thumbTargetProjectId}
                      onChange={(e) => handleSelectTargetProject(e.target.value)}
                      className="w-full h-9 rounded-lg bg-navy-950 border border-navy-700 text-xs text-slate-200 px-3"
                    >
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.selectedTitle || p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-2 pt-2 border-t border-navy-800">
                  <Button onClick={handleDownloadThumbnail} variant="gradient" size="sm" className="w-full text-xs shadow-sm">
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                    Download 1280x720 PNG
                  </Button>
                  <Button onClick={handleAssignThumbnailToProject} variant="outline" size="sm" className="w-full text-xs border-navy-700">
                    <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                    Apply to Selected Project
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Right 2 Cols: 16:9 Canvas Preview */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="border-navy-800 bg-navy-900/60 overflow-hidden">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-sm text-white font-bold">16:9 Standard Canvas (1280 × 720)</CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                      Standard YouTube thumbnail resolution. Output rendered directly on HTML5 Canvas.
                    </CardDescription>
                  </div>
                  <Badge variant="blue" className="text-[10px]">16:9 Ratio</Badge>
                </CardHeader>
                <CardContent className="p-4 flex justify-center bg-navy-950/60">
                  <div className="w-full rounded-xl overflow-hidden border border-navy-800 shadow-2xl bg-black">
                    <canvas ref={canvasRef} className="w-full h-auto block" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 3: AI VIDEO PUBLISHING WIZARD & OPTIMIZATION STUDIO
            ===================================================================== */}
        {activeTab === "uploads" && (
          <div className="space-y-6">
            {/* Top Workspace Header & Channel Scope */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl bg-navy-900/80 border border-navy-800 shadow-xl">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-purple">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Video Publishing & Upload Studio</span>
                  <span>•</span>
                  <span className="text-slate-400">{activeChannel?.title || "Demo Studio"}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-1">
                  Publish to YouTube with AI Title & SEO
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  Select your content type, optimize title & metadata with AI scored out of 10, and publish directly to YouTube.
                </p>
              </div>

              {/* Content Format Switcher */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-navy-950 border border-navy-800 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setPublishContentType("video")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    publishContentType === "video"
                      ? "bg-brand-purple text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <FileVideo className="w-3.5 h-3.5" />
                  <span>Long-form Video</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPublishContentType("shorts")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    publishContentType === "shorts"
                      ? "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>YouTube Shorts</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPublishContentType("post")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    publishContentType === "post"
                      ? "bg-brand-blue text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Community Post</span>
                </button>
              </div>
            </div>

            {/* Main 2-Column Responsive Publishing Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* LEFT COLUMN: Media Files, Project Linking, Release Settings (5 Cols) */}
              <div className="lg:col-span-5 space-y-5">
                {/* 1. Video Binary Uploader */}
                <Card className="border-navy-800 bg-navy-900/60 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold text-white flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <FileVideo className="w-4 h-4 text-brand-purple" />
                        1. Video Binary (.mp4, .mov, .webm)
                      </span>
                      {uploadFile && (
                        <Badge variant="success" className="text-[10px]">
                          Attached
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                      Direct resumable chunk transmission to YouTube Data API v3.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border-2 border-dashed border-navy-700 rounded-xl p-4 text-center bg-navy-950/70 hover:bg-navy-900/50 transition-colors cursor-pointer">
                      <input
                        type="file"
                        id="wizard-video-file"
                        accept="video/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setUploadFile(file);
                          if (file && !publishTitle) {
                            const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
                            setPublishTitle(cleanName);
                            setPublishTopic(cleanName);
                          }
                        }}
                        className="hidden"
                      />
                      <label htmlFor="wizard-video-file" className="cursor-pointer block space-y-2">
                        <FileVideo className="w-8 h-8 text-brand-purple mx-auto opacity-80" />
                        <div className="text-xs text-slate-300">
                          {uploadFile ? (
                            <span className="font-bold text-emerald-400 block truncate">
                              {uploadFile.name} ({(uploadFile.size / 1024 / 1024).toFixed(1)} MB)
                            </span>
                          ) : (
                            <span className="font-medium text-slate-300">Click to choose or drop video file</span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500">Supports standard MP4, WebM, MOV up to 256GB</p>
                      </label>
                    </div>
                  </CardContent>
                </Card>

                {/* 2. Custom Thumbnail Card */}
                <Card className="border-navy-800 bg-navy-900/60 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold text-white flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-brand-blue" />
                        2. Thumbnail Image (Optional)
                      </span>
                      {customThumbPreview && (
                        <Badge variant="blue" className="text-[10px]">
                          Custom Set
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                      Upload custom 16:9 thumbnail or use project thumbnail.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="border border-navy-800 rounded-xl overflow-hidden bg-navy-950 p-2 flex items-center gap-3">
                      <div className="w-24 h-14 bg-navy-900 rounded-lg overflow-hidden border border-navy-800 shrink-0 flex items-center justify-center">
                        {customThumbPreview ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={customThumbPreview}
                            alt="Custom Thumbnail"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-slate-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <input
                          type="file"
                          id="wizard-thumb-file"
                          accept="image/*"
                          onChange={handleCustomThumbnailUpload}
                          className="hidden"
                        />
                        <label
                          htmlFor="wizard-thumb-file"
                          className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-xs text-slate-200 font-semibold border border-navy-700 transition-colors"
                        >
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>Choose Thumbnail</span>
                        </label>
                        <p className="text-[10px] text-slate-500 mt-1">Recommended: 1280x720 (16:9), under 2MB</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 3. Release Settings & COPPA */}
                <Card className="border-navy-800 bg-navy-900/60 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-emerald-400" />
                      3. Privacy & Scheduling
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Project Association Dropdown */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Link to Workspace Project</label>
                      <select
                        value={uploadSelectedProjectId}
                        onChange={(e) => setUploadSelectedProjectId(e.target.value)}
                        className="w-full h-9 rounded-lg bg-navy-950 border border-navy-700 text-xs text-slate-200 px-3 font-medium"
                      >
                        <option value="">Direct Release (Create Project on Publish)</option>
                        {projects.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.selectedTitle || p.name} ({p.status})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Privacy & Schedule */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-300">Privacy Status</label>
                        <select
                          value={uploadPrivacy}
                          onChange={(e) => setUploadPrivacy(e.target.value as VideoPrivacy)}
                          className="w-full h-9 rounded-lg bg-navy-950 border border-navy-700 text-xs text-slate-200 px-3 font-medium"
                        >
                          <option value="public">Public</option>
                          <option value="unlisted">Unlisted</option>
                          <option value="private">Private</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-300">Schedule Date (Optional)</label>
                        <Input
                          type="datetime-local"
                          value={uploadPublishDate}
                          onChange={(e) => setUploadPublishDate(e.target.value)}
                          className="h-9 bg-navy-950 border-navy-700 text-xs text-slate-200"
                        />
                      </div>
                    </div>

                    {/* COPPA Declaration Toggle */}
                    <div className="space-y-2 p-3 rounded-xl bg-navy-950/80 border border-navy-800">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-300">Audience Declaration (COPPA)</span>
                        <Badge variant={uploadMadeForKids ? "default" : "outline"} className="text-[10px]">
                          {uploadMadeForKids ? "Made for Kids" : "Standard"}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setUploadMadeForKids(false)}
                          className={`p-2 rounded-lg border text-left transition-all ${
                            !uploadMadeForKids
                              ? "bg-brand-purple/10 border-brand-purple/50 ring-1 ring-brand-purple/40 text-white font-bold"
                              : "bg-navy-900 border-navy-800 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs">No, not for kids</span>
                            {!uploadMadeForKids && <Check className="w-3 h-3 text-brand-purple" />}
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setUploadMadeForKids(true)}
                          className={`p-2 rounded-lg border text-left transition-all ${
                            uploadMadeForKids
                              ? "bg-brand-purple/10 border-brand-purple/50 ring-1 ring-brand-purple/40 text-white font-bold"
                              : "bg-navy-900 border-navy-800 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs">Yes, made for kids</span>
                            {uploadMadeForKids && <Check className="w-3 h-3 text-brand-purple" />}
                          </div>
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 4. Live YouTube Feed Card Preview */}
                <Card className="border-navy-800 bg-navy-900/60 shadow-lg">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <Play className="w-3.5 h-3.5 text-red-500" />
                      Live YouTube Feed Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-navy-950 border border-navy-800 rounded-xl overflow-hidden shadow-md">
                      <div className="aspect-video bg-navy-900 relative flex items-center justify-center">
                        {customThumbPreview ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={customThumbPreview}
                            alt="Thumbnail"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-1.5 text-slate-600">
                            <Youtube className="w-10 h-10 text-red-500/40" />
                            <span className="text-[10px] font-mono">16:9 Thumbnail</span>
                          </div>
                        )}
                        <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white">
                          {publishContentType === "shorts" ? "0:45" : "11:24"}
                        </span>
                      </div>
                      <div className="p-3 space-y-1">
                        <p className="text-xs font-bold text-white line-clamp-2">
                          {publishTitle || "Your Engaging AI Video Title Will Appear Here"}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <span>{activeChannel?.title || "CreatorFlow"}</span>
                          <span>•</span>
                          <span>Verified Channel</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* RIGHT COLUMN: AI Title & SEO Optimization Studio (7 Cols) */}
              <div className="lg:col-span-7 space-y-5">
                <Card className="border-brand-purple/30 bg-navy-900/80 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-purple via-brand-blue to-emerald-400" />
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-brand-purple animate-pulse" />
                          <CardTitle className="text-base font-extrabold text-white flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-brand-purple" />
                            AI Title, SEO & Tag Studio
                          </CardTitle>
                        </div>
                        <CardDescription className="text-xs text-slate-400 mt-0.5">
                          Formulate short, curious, high-CTR titles and top-ranking tags with numerical ratings (/10).
                        </CardDescription>
                      </div>

                      <Badge variant="blue" className="text-[10px] shrink-0 self-start sm:self-auto">
                        Niche: {(activeChannel as any)?.niche || "Minecraft & Gaming"}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Topic Input & AI Action Bar */}
                    <div className="space-y-3 p-4 rounded-xl bg-navy-950/80 border border-navy-800">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-white flex items-center justify-between">
                          <span>Video Premise or Working Topic</span>
                          <span className="text-[11px] text-slate-400 font-normal">
                            Core idea for AI suggestions
                          </span>
                        </label>
                        <div className="flex gap-2">
                          <Input
                            value={publishTopic}
                            onChange={(e) => setPublishTopic(e.target.value)}
                            placeholder="e.g. Can you survive water cauldrons from 1,000 blocks in Minecraft hardcore?"
                            className="bg-navy-900 border-navy-700 text-xs text-white"
                          />
                        </div>
                      </div>

                      {/* Immersive Creative Angle / Style Selector */}
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                          Creative Generation Angle
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {[
                            { id: "viral_shorts", label: "🚀 Viral Shorts Hook", desc: "Punchy, under 45 chars, extreme curiosity" },
                            { id: "curiosity_gap", label: "🤯 Curiosity Mystery", desc: "Open loops and high CTR cliffhangers" },
                            { id: "seo_search", label: "🔍 Search & SEO Intent", desc: "Target high-volume search queries" },
                            { id: "contrarian_shock", label: "⚡ Contrarian & Shock", desc: "Defies consensus, 'Stop doing X'" },
                            { id: "story_challenge", label: "🏆 Epic Challenge", desc: "High stakes, 100 days, extreme test" },
                          ].map((style) => (
                            <button
                              type="button"
                              key={style.id}
                              onClick={() => {
                                setPublishStyleAngle(style.id as any);
                                if (aiOptimizerData) {
                                  handleOptimizeWithAi(style.id);
                                }
                              }}
                              className={`p-2 rounded-lg border text-left transition-all ${
                                publishStyleAngle === style.id
                                  ? "bg-brand-purple/20 border-brand-purple text-white shadow-sm ring-1 ring-brand-purple/40"
                                  : "bg-navy-900/60 border-navy-800 text-slate-400 hover:text-slate-200 hover:border-navy-700"
                              }`}
                            >
                              <p className="text-xs font-bold truncate">{style.label}</p>
                              <p className="text-[10px] text-slate-500 line-clamp-1">{style.desc}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Generate / Regenerate Controls */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                        <Button
                          type="button"
                          onClick={() => handleOptimizeWithAi()}
                          disabled={isOptimizingAi}
                          variant="gradient"
                          size="sm"
                          className="w-full sm:w-auto font-semibold text-xs shadow-glow px-5"
                        >
                          {isOptimizingAi ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin" />
                              Formulating AI Package...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5 mr-2" />
                              {aiOptimizerData ? "Regenerate Suggestions" : "Generate AI Package"}
                            </>
                          )}
                        </Button>

                        {aiOptimizerData && (
                          <span className="text-[11px] text-slate-400">
                            Switched angles automatically trigger fresh scored suggestions.
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Ranked Title Suggestions Scored Out of 10 */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                          <Tag className="w-3.5 h-3.5 text-brand-purple" />
                          Ranked Title Suggestions (Scored out of 10)
                        </label>
                        <span className="text-[11px] text-slate-400">
                          Click any suggestion to set as release title
                        </span>
                      </div>

                      {aiOptimizerData?.titles ? (
                        <div className="space-y-2.5">
                          {aiOptimizerData.titles.map((item: any, idx: number) => {
                            const isSelected = publishTitle === item.title || selectedTitleIdx === idx;
                            return (
                              <div
                                key={idx}
                                onClick={() => handleApplyTitle(item, idx)}
                                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                                  isSelected
                                    ? "bg-navy-800/90 border-brand-purple ring-1 ring-brand-purple/40 shadow-sm"
                                    : "bg-navy-950/60 border-navy-800 hover:border-navy-700 hover:bg-navy-900/50"
                                }`}
                              >
                                <div className="space-y-1 min-w-0 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                      Score: {item.score} / 10
                                    </span>
                                    <Badge variant="outline" className="text-[10px] text-brand-purple border-brand-purple/30">
                                      {item.category || "Viral Hook"}
                                    </Badge>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      {item.charCount || item.title.length} chars
                                    </span>
                                  </div>
                                  <p className="text-xs sm:text-sm font-bold text-white leading-snug">
                                    {item.title}
                                  </p>
                                  {item.reasoning && (
                                    <p className="text-[11px] text-slate-400 italic">
                                      💡 {item.reasoning}
                                    </p>
                                  )}
                                </div>

                                <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
                                  {isSelected ? (
                                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                                      <Check className="w-3.5 h-3.5" />
                                      Active
                                    </span>
                                  ) : (
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      className="h-7 text-xs border-navy-700 bg-navy-900 text-slate-300 hover:text-white"
                                    >
                                      Use Title
                                    </Button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl border border-dashed border-navy-800 bg-navy-950/40 text-center text-xs text-slate-400">
                          Click &quot;Generate AI Package&quot; above to formulate titles ranked by predicted CTR and curiosity.
                        </div>
                      )}

                      {/* Active Editable Title Input */}
                      <div className="space-y-1.5 pt-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-white">Active Video Release Title *</label>
                          <span
                            className={`text-[11px] font-mono ${
                              publishTitle.length > 70 ? "text-amber-400" : "text-emerald-400"
                            }`}
                          >
                            {publishTitle.length} / 100 characters {publishTitle.length <= 60 && "(Optimal for Mobile Feed)"}
                          </span>
                        </div>
                        <Input
                          value={publishTitle}
                          onChange={(e) => setPublishTitle(e.target.value)}
                          placeholder="Your release title..."
                          className="bg-navy-950 border-navy-700 text-sm font-bold text-white"
                        />
                      </div>
                    </div>

                    {/* High-Level SEO Description */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-200">
                            SEO Video Description
                          </label>
                          {aiOptimizerData?.description?.score && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                              Score: {aiOptimizerData.description.score} / 10
                            </span>
                          )}
                        </div>
                        {aiOptimizerData?.description?.text && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleApplyDescription}
                            className="text-xs text-brand-purple hover:text-brand-purple/80 h-6 px-2"
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Apply AI Description
                          </Button>
                        )}
                      </div>
                      <Textarea
                        rows={6}
                        value={publishDescription}
                        onChange={(e) => setPublishDescription(e.target.value)}
                        placeholder="Video description with hook, chapters, keywords, and links..."
                        className="bg-navy-950 border-navy-700 text-xs font-mono text-slate-300 leading-relaxed"
                      />
                    </div>

                    {/* High-Ranking Hashtags (Relevant to Title) */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                          <Hash className="w-3.5 h-3.5 text-brand-purple" />
                          High-Ranking Hashtags
                        </label>
                        {aiOptimizerData?.hashtags && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleApplyAllHashtags}
                            className="text-xs text-brand-purple hover:text-brand-purple/80 h-6 px-2"
                          >
                            Add All Hashtags
                          </Button>
                        )}
                      </div>

                      {aiOptimizerData?.hashtags ? (
                        <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-navy-950/80 border border-navy-800">
                          {aiOptimizerData.hashtags.map((h: any, idx: number) => {
                            const isAdded = publishHashtags.includes(h.tag);
                            return (
                              <button
                                type="button"
                                key={idx}
                                onClick={() => handleToggleHashtag(h.tag)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                                  isAdded
                                    ? "bg-brand-purple text-white shadow-sm"
                                    : "bg-navy-900 border border-navy-700 text-slate-300 hover:text-white"
                                }`}
                              >
                                <span>{h.tag}</span>
                                <span className="text-[10px] opacity-80 font-mono">({h.score}/10)</span>
                              </button>
                            );
                          })}
                        </div>
                      ) : null}

                      {publishHashtags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {publishHashtags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] font-mono px-2 py-0.5 rounded bg-brand-purple/10 text-brand-purple border border-brand-purple/20 flex items-center gap-1"
                            >
                              <span>{tag}</span>
                              <button
                                type="button"
                                onClick={() => setPublishHashtags(publishHashtags.filter((h) => h !== tag))}
                                className="hover:text-red-400"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* High-Ranking Video Tags (Relevant to Title) */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-brand-blue" />
                          High-Ranking Video Tags ({publishTags.length} tags)
                        </label>
                        {aiOptimizerData?.tags && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleApplyAllTags}
                            className="text-xs text-brand-blue hover:text-brand-blue/80 h-6 px-2"
                          >
                            Add All Video Tags
                          </Button>
                        )}
                      </div>

                      {aiOptimizerData?.tags ? (
                        <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-navy-950/80 border border-navy-800">
                          {aiOptimizerData.tags.map((t: any, idx: number) => {
                            const isAdded = publishTags.includes(t.tag);
                            return (
                              <button
                                type="button"
                                key={idx}
                                onClick={() => {
                                  if (isAdded) {
                                    handleRemoveTag(t.tag);
                                  } else {
                                    setPublishTags([...publishTags, t.tag]);
                                  }
                                }}
                                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all flex items-center gap-1 ${
                                  isAdded
                                    ? "bg-brand-blue text-white shadow-sm"
                                    : "bg-navy-900 border border-navy-800 text-slate-400 hover:text-white"
                                }`}
                              >
                                <span>{t.tag}</span>
                                <span className="text-[9px] opacity-75 font-mono">({t.score}/10)</span>
                              </button>
                            );
                          })}
                        </div>
                      ) : null}

                      {/* Custom Tag Input & Tag Badges */}
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Input
                            value={newTagInput}
                            onChange={(e) => setNewTagInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddCustomTag();
                              }
                            }}
                            placeholder="Add custom search tag (e.g. minecraft survival 2026)..."
                            className="h-8 bg-navy-950 border-navy-700 text-xs text-slate-200"
                          />
                          <Button
                            type="button"
                            onClick={handleAddCustomTag}
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs border-navy-700 bg-navy-900"
                          >
                            <Plus className="w-3.5 h-3.5 mr-1" />
                            Add Tag
                          </Button>
                        </div>

                        {publishTags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 p-2.5 rounded-lg bg-navy-950 border border-navy-800 max-h-36 overflow-y-auto">
                            {publishTags.map((tag, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="text-[11px] bg-navy-900 border-navy-700 text-slate-300 flex items-center gap-1.5 py-1"
                              >
                                <span>{tag}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTag(tag)}
                                  className="text-slate-400 hover:text-red-400"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Final Review & Launch Bar */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-navy-900 via-navy-900 to-brand-purple/20 border border-brand-purple/30 shadow-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Ready to Release: {activeChannel?.title || "Demo Channel"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1">
                      {publishTitle || "No title specified yet"}
                    </p>
                  </div>

                  <Button
                    type="button"
                    onClick={handleStartUploadProcess}
                    disabled={isUploading}
                    variant="gradient"
                    size="lg"
                    className="font-bold text-sm shadow-glow px-8 shrink-0"
                  >
                    <UploadCloud className="w-4 h-4 mr-2" />
                    Review & Publish Video
                  </Button>
                </div>

                {/* Upload Progress Indicator */}
                {isUploading && (
                  <div className="space-y-2.5 p-4 rounded-xl bg-navy-950 border border-navy-800 animate-in fade-in-50">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                        <UploadCloud className="w-4 h-4 text-brand-purple animate-pulse" />
                        {uploadStatusMsg}
                      </span>
                      <span className="font-mono text-emerald-400 font-bold">{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2 bg-navy-900" />
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-400">
                        {isLiveUploaded ? "Google Resumable Upload Session" : "Sandbox Simulation Mode"}
                      </span>
                      <Button
                        type="button"
                        onClick={handleCancelUpload}
                        variant="ghost"
                        size="sm"
                        className="text-[10px] h-6 px-2 text-red-400 hover:text-red-300"
                      >
                        Cancel Transmission
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Explicit Confirmation Modal */}
            <Modal
              isOpen={showConfirmModal}
              onClose={() => setShowConfirmModal(false)}
              title="Confirm Video Release"
              description="Please review publishing parameters before confirming transmission to YouTube."
              maxWidth="md"
              footer={
                <div className="flex items-center justify-end gap-2 w-full">
                  <Button variant="ghost" size="sm" onClick={() => setShowConfirmModal(false)} className="text-xs">
                    Cancel
                  </Button>
                  <Button variant="gradient" size="sm" onClick={handleConfirmAndUpload} className="text-xs font-semibold">
                    Confirm & Publish Now
                  </Button>
                </div>
              }
            >
              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3 rounded-lg bg-navy-950 border border-navy-800 space-y-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Video Title</span>
                  <p className="font-bold text-white text-sm">{publishTitle}</p>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-lg bg-navy-950 border border-navy-800">
                    <span className="text-slate-400 block">Format</span>
                    <strong className="text-white uppercase">{publishContentType}</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-navy-950 border border-navy-800">
                    <span className="text-slate-400 block">Privacy</span>
                    <strong className="text-white uppercase">{uploadPrivacy}</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-navy-950 border border-navy-800">
                    <span className="text-slate-400 block">Release</span>
                    <strong className="text-white">{uploadPublishDate ? "Scheduled" : "Instant"}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px]">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>Verified Safe: No public release occurs without your explicit approval.</span>
                </div>
              </div>
            </Modal>
          </div>
        )}

        {/* =====================================================================
            TAB 4: PUBLISHING CALENDAR & RESCHEDULING
            ===================================================================== */}
        {activeTab === "calendar" && (
          <div className="space-y-6">
            <Card className="border-navy-800 bg-navy-900/60">
              <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle className="text-base text-white font-bold flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-brand-purple" />
                    Video Release Calendar & Schedule
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    Manage release dates, reschedule drops, and distinguish local plans from confirmed YouTube releases.
                  </CardDescription>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={calendarFilter}
                    onChange={(e) => setCalendarFilter(e.target.value)}
                    className="h-8 rounded-lg bg-navy-950 border border-navy-700 text-xs text-slate-200 px-2.5"
                  >
                    <option value="all">All Releases</option>
                    <option value="scheduled">Scheduled Only</option>
                    <option value="published">Published Only</option>
                    <option value="draft">Drafts</option>
                  </select>

                  <Link href="/dashboard/calendar">
                    <Button variant="outline" size="sm" className="text-xs border-navy-700 h-8">
                      Full Month View
                    </Button>
                  </Link>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {calendarItems.map((p) => {
                  const isYtConfirmed = Boolean(p.youtubeVideoId) && !p.isSimulatedPublish;
                  const isScheduled = Boolean(p.scheduledAt) || p.status === "scheduled";
                  const isPublished = p.status === "published";

                  return (
                    <div
                      key={p.id}
                      className="p-3.5 rounded-xl bg-navy-950 border border-navy-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-navy-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-purple/20 text-brand-purple flex items-center justify-center shrink-0 border border-brand-purple/30">
                          <CalendarIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-xs font-bold text-white">{p.selectedTitle || p.name}</p>
                            {isYtConfirmed ? (
                              <span className="text-[10px] font-semibold px-2 py-0.2 rounded bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
                                <Youtube className="w-2.5 h-2.5" />
                                Confirmed YouTube Release
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold px-2 py-0.2 rounded bg-navy-800 text-slate-400 border border-navy-700">
                                Planned Local Drop
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            Release: {p.scheduledAt ? new Date(p.scheduledAt).toLocaleString() : p.publishedAt ? `Published ${new Date(p.publishedAt).toLocaleDateString()}` : "No date set"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <Badge
                          variant={isPublished ? "success" : isScheduled ? "default" : "outline"}
                          className="text-[10px] capitalize"
                        >
                          {p.status}
                        </Badge>

                        <Button
                          onClick={() => handleOpenReschedule(p)}
                          variant="outline"
                          size="sm"
                          className="text-[11px] h-7 px-2.5 border-navy-700 bg-navy-900 text-slate-200"
                        >
                          <Clock className="w-3 h-3 mr-1 text-brand-purple" />
                          Reschedule
                        </Button>
                      </div>
                    </div>
                  );
                })}

                {calendarItems.length === 0 && (
                  <div className="text-center p-8 text-xs text-slate-400">
                    No videos found matching the selected filter. Plan releases from Video Projects.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reschedule Modal */}
            <Modal
              isOpen={Boolean(rescheduleProject)}
              onClose={() => setRescheduleProject(null)}
              title="Reschedule Video Release"
              description="Update the scheduled date and time for this video drop."
              maxWidth="md"
              footer={
                <div className="flex items-center justify-end gap-2 w-full">
                  <Button variant="ghost" size="sm" onClick={() => setRescheduleProject(null)} className="text-xs">
                    Cancel
                  </Button>
                  <Button variant="gradient" size="sm" onClick={handleSaveReschedule} className="text-xs font-semibold">
                    Save New Date
                  </Button>
                </div>
              }
            >
              <div className="space-y-4 text-xs text-slate-300">
                <div className="p-3 rounded-xl bg-navy-950 border border-navy-800">
                  <span className="text-[10px] text-slate-400">Video Project:</span>
                  <p className="font-bold text-white text-xs mt-0.5">{rescheduleProject?.selectedTitle}</p>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-200">Scheduled Date & Time</label>
                  <Input
                    type="datetime-local"
                    value={newScheduleDate}
                    onChange={(e) => setNewScheduleDate(e.target.value)}
                    className="h-9 bg-navy-950 border-navy-700 text-xs text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] text-slate-400">Quick Shortcuts:</span>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickReschedule(1)}
                      className="text-[11px] h-7 border-navy-700 bg-navy-950"
                    >
                      Tomorrow 5PM
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickReschedule(3)}
                      className="text-[11px] h-7 border-navy-700 bg-navy-950"
                    >
                      +3 Days
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickReschedule(7)}
                      className="text-[11px] h-7 border-navy-700 bg-navy-950"
                    >
                      Next Week
                    </Button>
                  </div>
                </div>
              </div>
            </Modal>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function PublishWorkspacePage() {
  return (
    <Suspense
      fallback={
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-2">
              <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-slate-400">Loading Publish Workspace...</p>
            </div>
          </div>
        </DashboardLayout>
      }
    >
      <PublishWorkspaceContent />
    </Suspense>
  );
}
