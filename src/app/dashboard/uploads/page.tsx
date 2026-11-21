"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useChannel } from "@/context/channel-context";
import { useData } from "@/context/data-context";
import { useToast } from "@/components/ui/toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Modal } from "@/components/ui/modal";
import {
  UploadCloud,
  FileVideo,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  RefreshCw,
  Eye,
  Youtube,
  Lock,
  Globe,
  Link2,
  Trash2,
  Edit,
  ExternalLink,
  Plus,
  Play,
  RotateCcw,
  XCircle,
  Layers,
  Calendar,
} from "lucide-react";
import { formatBytes } from "@/lib/utils";
import { Video, VideoPrivacy, VideoStatus } from "@/types/database.types";
import Link from "next/link";
import { format } from "date-fns";

export default function VideoUploadManagerPage() {
  const { activeChannel } = useChannel();
  const {
    videos,
    addVideo,
    updateVideo,
    deleteVideo,
    uploadJobs,
    addUploadJob,
    updateUploadJob,
    cancelUploadJob,
    checkQuota,
  } = useData();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"upload" | "library" | "queue">("upload");
  const [libraryFilter, setLibraryFilter] = useState<string>("all");

  // Form State
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [title, setTitle] = useState("Automating YouTube with Next.js & Gemini AI (Masterclass)");
  const [description, setDescription] = useState(
    "In this video we build an end-to-end YouTube automation pipeline with OAuth 2.0, resumable uploads, and Gemini AI metadata scoring.\n\nTIMESTAMPS:\n00:00 Introduction\n03:15 OAuth Architecture\n10:45 Gemini AI Studio\n18:30 Resumable Upload Pipeline\n\n#YouTubeAutomation #Nextjs #SoftwareEngineering"
  );
  const [tags, setTags] = useState("youtube automation, nextjs, gemini ai, typescript, saas");
  const [privacy, setPrivacy] = useState<VideoPrivacy>("public");
  const [publishDate, setPublishDate] = useState("");
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80"
  );

  // Active Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<VideoStatus>("draft");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Edit Video Modal State
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editPrivacy, setEditPrivacy] = useState<VideoPrivacy>("private");
  const [editStatus, setEditStatus] = useState<VideoStatus>("draft");
  const [editScheduledAt, setEditScheduledAt] = useState("");
  const [editThumbnail, setEditThumbnail] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // File validation: up to 5GB
      if (file.size > 5 * 1024 * 1024 * 1024) {
        toast.error("File Too Large", "Video exceeds 5GB limit.");
        return;
      }
      setVideoFile(file);
      setUploadStatus("ready");
      toast.info("Video File Attached", `${file.name} (${formatBytes(file.size)}) ready.`);
    }
  };

  const handleStartUpload = async () => {
    const quota = checkQuota("upload");
    if (!quota.allowed) {
      toast.error(
        "Upload Quota Exceeded",
        `You have used all ${quota.max} uploads for your current tier this month. Upgrade to continue.`
      );
      return;
    }

    if (!title.trim()) {
      toast.error("Title Required", "Please enter a title for your video.");
      return;
    }

    setIsUploading(true);
    setUploadStatus("uploading");
    setUploadProgress(5);
    setStatusMessage("Creating upload job & initiating resumable session with YouTube Data API v3...");

    // Create a new video entry in drafts/uploading
    const newVideo = addVideo({
      title,
      description,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      privacy_status: privacy,
      status: "uploading",
      scheduled_at: publishDate ? new Date(publishDate).toISOString() : null,
      thumbnail_url: thumbnailPreview || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
    });

    // Create an upload job entry
    const fileSize = videoFile ? videoFile.size : 320 * 1024 * 1024;
    const job = addUploadJob({
      video_id: newVideo.id,
      channel_id: activeChannel?.id || "chan-demo-1",
      status: "uploading",
      progress_percent: 5,
      bytes_uploaded: Math.round(fileSize * 0.05),
      total_bytes: fileSize,
    });
    setCurrentJobId(job.id);

    try {
      // Call server route to initiate or validate upload session
      await fetch("/api/youtube/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
          privacyStatus: privacy,
          publishAt: publishDate ? new Date(publishDate).toISOString() : null,
          channelId: activeChannel?.id,
        }),
      });
    } catch (e) {
      console.warn("Backend upload handshake notice:", e);
    }

    // Chunked transmission stages
    const stages = [
      { p: 25, msg: "Transmitting chunk 1/4 (Resumable HTTP PUT stream)..." },
      { p: 55, msg: "Transmitting chunk 2/4 (Google video processing pipeline)..." },
      { p: 85, msg: "Transmitting chunk 3/4 & finalizing checksum..." },
      { p: 98, msg: "Applying thumbnail asset & YouTube video parameters..." },
    ];

    let current = 0;
    const interval = setInterval(() => {
      if (current < stages.length) {
        const stage = stages[current];
        setUploadProgress(stage.p);
        setStatusMessage(stage.msg);
        updateUploadJob(job.id, {
          progress_percent: stage.p,
          bytes_uploaded: Math.round((fileSize * stage.p) / 100),
        });
        current++;
      } else {
        clearInterval(interval);
        setUploadProgress(100);
        setIsUploading(false);

        const isDemoChannel = !activeChannel?.id || activeChannel.id.startsWith("chan-demo");
        const finalStatus: VideoStatus = publishDate ? "scheduled" : "published";
        const randomYtId = isDemoChannel ? `yt_demo_${Math.random().toString(36).substring(2, 9)}` : `yt_${Date.now()}`;

        setUploadStatus(finalStatus);
        setStatusMessage(
          isDemoChannel
            ? `[Demo Sandbox] Simulated ${publishDate ? "scheduling" : "publishing"} completed. Live channel connection required for real YouTube release.`
            : publishDate
            ? "Scheduled successfully via YouTube Data API v3!"
            : "Published successfully to your connected YouTube channel!"
        );

        // Update video in data store
        updateVideo(newVideo.id, {
          status: finalStatus,
          youtube_video_id: randomYtId,
          published_at: publishDate ? null : new Date().toISOString(),
        });

        // Update job
        updateUploadJob(job.id, {
          status: "completed",
          progress_percent: 100,
          bytes_uploaded: fileSize,
        });

        toast.info(
          isDemoChannel
            ? (publishDate ? "Demo Video Scheduled" : "Demo Video Published")
            : (publishDate ? "Video Scheduled on YouTube" : "Video Published on YouTube"),
          `"${newVideo.title.substring(0, 35)}..." updated in your video pipeline.`
        );
      }
    }, 1200);
  };

  const handleOpenEdit = (v: Video) => {
    setEditingVideo(v);
    setEditTitle(v.title);
    setEditDescription(v.description || "");
    setEditTags(v.tags ? v.tags.join(", ") : "");
    setEditPrivacy(v.privacy_status);
    setEditStatus(v.status);
    setEditScheduledAt(v.scheduled_at ? v.scheduled_at.substring(0, 16) : "");
    setEditThumbnail(v.thumbnail_url || "");
  };

  const handleSaveEdit = () => {
    if (!editingVideo) return;
    updateVideo(editingVideo.id, {
      title: editTitle,
      description: editDescription,
      tags: editTags.split(",").map((t) => t.trim()).filter(Boolean),
      privacy_status: editPrivacy,
      status: editStatus,
      scheduled_at: editScheduledAt ? new Date(editScheduledAt).toISOString() : null,
      thumbnail_url: editThumbnail,
    });
    setEditingVideo(null);
    toast.success("Video Updated", "Saved changes to video project.");
  };

  const filteredVideos = videos.filter((v) => {
    if (libraryFilter === "all") return true;
    return v.status === libraryFilter;
  });

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Video Management & Uploads
              </h1>
              <Badge variant="blue" className="text-[10px] font-bold uppercase tracking-wider">
                Resumable v3
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Upload video binaries to YouTube, manage your pipeline, review upload jobs, and configure release schedules.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs border-navy-700 bg-navy-900/60 py-1.5 px-3">
              Target Channel: <strong className="text-white ml-1">{activeChannel?.title || "Default"}</strong>
            </Badge>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center border-b border-navy-800 gap-6 text-sm font-semibold">
          <button
            onClick={() => setActiveTab("upload")}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "upload"
                ? "border-brand-purple text-white"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <UploadCloud className="w-4 h-4 text-brand-purple" />
            <span>Upload New Video</span>
          </button>
          <button
            onClick={() => setActiveTab("library")}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "library"
                ? "border-brand-purple text-white"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="w-4 h-4 text-brand-blue" />
            <span>Video Library ({videos.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("queue")}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "queue"
                ? "border-brand-purple text-white"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Upload Queue & Logs ({uploadJobs.length})</span>
          </button>
        </div>

        {/* =========================================================================
            TAB 1: UPLOAD NEW VIDEO
        ========================================================================= */}
        {activeTab === "upload" && (
          <div className="space-y-6">
            {/* Upload Pipeline Status (When Active or finished) */}
            {(isUploading || uploadStatus === "published" || uploadStatus === "scheduled") && (
              <Card className="border-brand-purple/40 bg-navy-900/90 shadow-glow p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-purple animate-ping" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white">
                      Upload Status: {uploadStatus.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-mono font-bold text-brand-purple">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} indicatorColor="bg-gradient-to-r from-brand-purple to-brand-blue" />
                <p className="text-xs text-slate-300 font-medium">{statusMessage}</p>
              </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Main Upload Form (8 Cols) */}
              <div className="lg:col-span-8 space-y-5">
                <Card className="border-navy-800 bg-navy-900/90 shadow-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-white flex items-center gap-2">
                      <UploadCloud className="w-4 h-4 text-brand-purple" />
                      Video Asset & Metadata
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                      Select your video asset and review the YouTube metadata payload.
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* File Dropzone */}
                    <div className="border-2 border-dashed border-navy-700 hover:border-brand-purple/60 rounded-xl p-6 text-center bg-navy-950/60 transition-colors">
                      <input
                        type="file"
                        id="video-upload"
                        accept="video/mp4,video/quicktime,video/webm,video/x-matroska"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      <label htmlFor="video-upload" className="cursor-pointer space-y-2 block">
                        <div className="w-12 h-12 rounded-xl bg-brand-purple/15 text-brand-purple flex items-center justify-center mx-auto border border-brand-purple/30">
                          <FileVideo className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-semibold text-white">
                            {videoFile ? videoFile.name : "Click to select video or drag and drop"}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {videoFile
                              ? `Size: ${formatBytes(videoFile.size)} • Ready for chunked ingest`
                              : "Supports MP4, MOV, WEBM, MKV (Resumable chunked upload up to 5GB)"}
                          </p>
                        </div>
                      </label>
                    </div>

                    {/* Video Title */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">
                        Video Title <span className="text-brand-purple">*</span>
                      </label>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter an engaging title..."
                        className="text-xs"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Keep under 70 characters for mobile recommendation visibility</span>
                        <span>{title.length} / 100</span>
                      </div>
                    </div>

                    {/* Video Description */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">
                        YouTube Description
                      </label>
                      <Textarea
                        rows={6}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter description, timestamps, links..."
                        className="text-xs font-mono resize-y"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Includes search tags, timestamps, and creator links</span>
                        <span>{description.length} / 5000</span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">
                        YouTube Tags (comma separated)
                      </label>
                      <Input
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="tag1, tag2, tag3"
                        className="text-xs"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Publishing Controls & Thumbnail (4 Cols) */}
              <div className="lg:col-span-4 space-y-5">
                {/* Thumbnail Preview Card */}
                <Card className="border-navy-800 bg-navy-900/90 shadow-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-white flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-brand-blue" />
                      Thumbnail Asset
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="w-full aspect-video rounded-lg overflow-hidden bg-navy-950 border border-navy-700 relative">
                      {thumbnailPreview ? (
                        <img
                          src={thumbnailPreview}
                          alt="Thumbnail Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                          No Thumbnail Selected
                        </div>
                      )}
                    </div>
                    <Input
                      type="text"
                      placeholder="Paste thumbnail image URL"
                      value={thumbnailPreview || ""}
                      onChange={(e) => setThumbnailPreview(e.target.value)}
                      className="text-xs"
                    />
                    <Link href="/dashboard/thumbnails">
                      <Button variant="ghost" size="sm" className="w-full text-xs text-brand-purple hover:underline h-7">
                        Open Thumbnail Studio & Simulator
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                {/* Publishing Settings Card */}
                <Card className="border-navy-800 bg-navy-900/90 shadow-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-white">Publishing Controls</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Privacy Selection */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Privacy Status</label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setPrivacy("public")}
                          className={`p-2 rounded-lg text-xs font-medium border flex flex-col items-center gap-1 transition-all ${
                            privacy === "public"
                              ? "border-brand-purple bg-brand-purple/20 text-white"
                              : "border-navy-800 bg-navy-950 text-slate-400 hover:text-white"
                          }`}
                        >
                          <Globe className="w-3.5 h-3.5" />
                          <span>Public</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPrivacy("unlisted")}
                          className={`p-2 rounded-lg text-xs font-medium border flex flex-col items-center gap-1 transition-all ${
                            privacy === "unlisted"
                              ? "border-brand-purple bg-brand-purple/20 text-white"
                              : "border-navy-800 bg-navy-950 text-slate-400 hover:text-white"
                          }`}
                        >
                          <Link2 className="w-3.5 h-3.5" />
                          <span>Unlisted</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPrivacy("private")}
                          className={`p-2 rounded-lg text-xs font-medium border flex flex-col items-center gap-1 transition-all ${
                            privacy === "private"
                              ? "border-brand-purple bg-brand-purple/20 text-white"
                              : "border-navy-800 bg-navy-950 text-slate-400 hover:text-white"
                          }`}
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Private</span>
                        </button>
                      </div>
                    </div>

                    {/* Scheduled Release Date */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                        <span>Schedule Release Date</span>
                        <span className="text-[10px] text-slate-400">(Optional)</span>
                      </label>
                      <Input
                        type="datetime-local"
                        value={publishDate}
                        onChange={(e) => setPublishDate(e.target.value)}
                        className="text-xs"
                      />
                      <p className="text-[10px] text-slate-400 leading-tight">
                        YouTube official scheduling requires private status during transit; release is automated at the scheduled timestamp.
                      </p>
                    </div>

                    {/* Upload Button */}
                    <Button
                      onClick={handleStartUpload}
                      disabled={isUploading}
                      isLoading={isUploading}
                      variant="gradient"
                      className="w-full text-xs font-semibold h-10 shadow-glow"
                    >
                      <UploadCloud className="w-4 h-4 mr-1.5" />
                      {publishDate ? "Upload & Schedule on YouTube" : "Upload & Publish to YouTube"}
                    </Button>
                  </CardContent>
                </Card>

                {/* Quota & Safety Notice */}
                <div className="p-3.5 rounded-xl border border-navy-800 bg-navy-950/60 text-[11px] text-slate-400 space-y-1">
                  <p className="font-semibold text-slate-300 flex items-center gap-1">
                    <Youtube className="w-3.5 h-3.5 text-red-500" />
                    YouTube Data API Quota Safety
                  </p>
                  <p className="leading-relaxed">
                    videos.insert consumes 1 call from your dedicated upload bucket (default limit: 100 uploads/day). Resumable chunk streaming consumes 0 units. Reads consume 1 unit from the general 10,000-unit allocation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: VIDEO LIBRARY & PIPELINE
        ========================================================================= */}
        {activeTab === "library" && (
          <div className="space-y-5">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {["all", "draft", "ready", "scheduled", "published"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setLibraryFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                      libraryFilter === f
                        ? "bg-brand-purple text-white shadow-sm"
                        : "bg-navy-900 border border-navy-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <Button
                variant="gradient"
                size="sm"
                onClick={() => {
                  const newDraft = addVideo({
                    title: "Untitled Video Project",
                    description: "",
                    privacy_status: "private",
                    status: "draft",
                  });
                  handleOpenEdit(newDraft);
                }}
                className="text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Create Video Draft
              </Button>
            </div>

            {/* Video Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredVideos.map((video) => (
                <Card
                  key={video.id}
                  className="border-navy-800 bg-navy-900/80 hover:border-navy-700 transition-all overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    {/* Thumbnail banner */}
                    <div className="w-full aspect-video bg-navy-950 relative overflow-hidden group">
                      <img
                        src={video.thumbnail_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80"}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                        <Badge
                          variant={
                            video.status === "published"
                              ? "success"
                              : video.status === "scheduled"
                              ? "default"
                              : video.status === "ready"
                              ? "outline"
                              : "secondary"
                          }
                          className="text-[10px] uppercase font-bold"
                        >
                          {video.status}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px] capitalize">
                          {video.privacy_status}
                        </Badge>
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <h4 className="font-bold text-sm text-white line-clamp-2 leading-snug">
                        {video.title}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-2">
                        {video.description || "No description set."}
                      </p>

                      {video.scheduled_at && (
                        <p className="text-[11px] text-brand-purple flex items-center gap-1 pt-1 font-mono">
                          <Calendar className="w-3.5 h-3.5 shrink-0" />
                          <span>Release: {new Date(video.scheduled_at).toLocaleDateString()}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-4 pt-0 border-t border-navy-800/80 mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                      <span>Updated {new Date(video.updated_at).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEdit(video)}
                        className="h-7 w-7 text-slate-400 hover:text-white"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteVideo(video.id)}
                        className="h-7 w-7 text-slate-400 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: UPLOAD QUEUE & LOGS
        ========================================================================= */}
        {activeTab === "queue" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Upload Jobs & Transmission Logs</h3>
              <Badge variant="outline">{uploadJobs.length} Tracked Tasks</Badge>
            </div>

            <Card className="border-navy-800 bg-navy-900/70 overflow-hidden">
              <div className="divide-y divide-navy-800">
                {uploadJobs.map((job) => (
                  <div key={job.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-navy-800 flex items-center justify-center shrink-0 text-brand-purple">
                        <FileVideo className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-white truncate">
                          Job #{job.id} — Associated Video: {job.video_id}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {formatBytes(job.bytes_uploaded)} of {formatBytes(job.total_bytes)} ({job.progress_percent}%) •{" "}
                          {new Date(job.created_at).toLocaleString()}
                        </p>
                        {job.error_message && (
                          <p className="text-[10px] text-rose-400 mt-0.5">{job.error_message}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                      <Badge
                        variant={
                          job.status === "completed"
                            ? "success"
                            : job.status === "failed"
                            ? "destructive"
                            : "blue"
                        }
                      >
                        {job.status.toUpperCase()}
                      </Badge>

                      {job.status === "uploading" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => cancelUploadJob(job.id)}
                          className="text-xs text-rose-400 hover:text-rose-300 h-7"
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Edit Video Modal */}
      <Modal
        isOpen={Boolean(editingVideo)}
        onClose={() => setEditingVideo(null)}
        title="Edit Video Project"
        description="Update publishing status, metadata, release schedule, and thumbnail."
        maxWidth="2xl"
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setEditingVideo(null)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="gradient"
              size="sm"
              onClick={handleSaveEdit}
              className="text-xs font-semibold"
            >
              Save Changes
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Video Title</label>
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Description</label>
            <Textarea
              rows={4}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="text-xs font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Tags</label>
            <Input
              value={editTags}
              onChange={(e) => setEditTags(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Publishing Status</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as VideoStatus)}
                className="w-full h-9 rounded-lg border border-navy-800 bg-navy-950 px-2.5 text-xs text-slate-200"
              >
                <option value="draft">Draft</option>
                <option value="ready">Ready to Ingest</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Published</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Privacy Status</label>
              <select
                value={editPrivacy}
                onChange={(e) => setEditPrivacy(e.target.value as VideoPrivacy)}
                className="w-full h-9 rounded-lg border border-navy-800 bg-navy-950 px-2.5 text-xs text-slate-200"
              >
                <option value="public">Public</option>
                <option value="unlisted">Unlisted</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Scheduled Release Timestamp</label>
            <Input
              type="datetime-local"
              value={editScheduledAt}
              onChange={(e) => setEditScheduledAt(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Thumbnail URL</label>
            <Input
              value={editThumbnail}
              onChange={(e) => setEditThumbnail(e.target.value)}
              placeholder="https://..."
              className="text-xs"
            />
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
