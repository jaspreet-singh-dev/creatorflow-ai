"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Video, ContentIdea, UploadJob, PlanTier, VideoPrivacy, VideoStatus, IdeaStatus } from "@/types/database.types";
import { MOCK_VIDEOS, MOCK_IDEAS, MOCK_UPLOAD_JOBS } from "@/lib/data/mock-data";
import { GeneratedMetadataOutput } from "@/lib/ai/gemini";
import { useAuth } from "./auth-context";
import { useChannel } from "./channel-context";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";

export interface SavedMetadataRecord {
  id: string;
  videoId?: string | null;
  videoTitle?: string;
  topic: string;
  niche: string;
  generatedAt: string;
  data: GeneratedMetadataOutput;
}

export interface UsageMeter {
  metadataGenerations: number;
  videoUploads: number;
  connectedChannels: number;
}

export const PLAN_LIMITS: Record<PlanTier, { ai: number; channels: number; uploads: number }> = {
  free: { ai: 15, channels: 1, uploads: 5 },
  creator: { ai: 200, channels: 3, uploads: 30 },
  pro: { ai: 1000, channels: 25, uploads: 200 },
};

interface DataContextType {
  // Videos
  videos: Video[];
  addVideo: (video: Partial<Video>) => Video;
  updateVideo: (id: string, updates: Partial<Video>) => void;
  deleteVideo: (id: string) => void;
  getVideo: (id: string) => Video | undefined;

  // Content Ideas
  ideas: ContentIdea[];
  addIdea: (idea: Partial<ContentIdea>) => ContentIdea;
  updateIdeaStatus: (id: string, status: IdeaStatus) => void;
  deleteIdea: (id: string) => void;
  convertIdeaToVideo: (ideaId: string, channelId?: string) => Video | null;

  // Metadata History & Binding
  metadataRecords: SavedMetadataRecord[];
  saveMetadataRecord: (
    topic: string,
    niche: string,
    data: GeneratedMetadataOutput,
    videoId?: string | null
  ) => SavedMetadataRecord;
  applyMetadataToVideo: (videoId: string, metadata: GeneratedMetadataOutput) => boolean;

  // Upload Jobs
  uploadJobs: UploadJob[];
  addUploadJob: (job: Partial<UploadJob>) => UploadJob;
  updateUploadJob: (id: string, updates: Partial<UploadJob>) => void;
  cancelUploadJob: (id: string) => void;

  // Usage Quotas
  usage: UsageMeter;
  incrementUsage: (type: "ai" | "upload" | "channel") => void;
  checkQuota: (type: "ai" | "upload" | "channel", customTier?: PlanTier) => {
    allowed: boolean;
    current: number;
    max: number;
  };

  // State
  isLoadingData: boolean;
  resetToDemoDefaults: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user, profile, isDemoMode } = useAuth();
  const { activeChannel, channels } = useChannel();
  const { toast } = useToast();
  const supabase = createClient();

  const [videos, setVideos] = useState<Video[]>([]);
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [metadataRecords, setMetadataRecords] = useState<SavedMetadataRecord[]>([]);
  const [uploadJobs, setUploadJobs] = useState<UploadJob[]>([]);
  const [usage, setUsage] = useState<UsageMeter>({
    metadataGenerations: 32,
    videoUploads: 4,
    connectedChannels: 2,
  });
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Initialize data from LocalStorage or Supabase
  useEffect(() => {
    function loadInitialData() {
      try {
        // Load Videos
        const savedVideos = localStorage.getItem("cf_videos_v1");
        if (savedVideos) {
          setVideos(JSON.parse(savedVideos));
        } else {
          setVideos(MOCK_VIDEOS);
          localStorage.setItem("cf_videos_v1", JSON.stringify(MOCK_VIDEOS));
        }

        // Load Content Ideas
        const savedIdeas = localStorage.getItem("cf_ideas_v1");
        if (savedIdeas) {
          setIdeas(JSON.parse(savedIdeas));
        } else {
          setIdeas(MOCK_IDEAS);
          localStorage.setItem("cf_ideas_v1", JSON.stringify(MOCK_IDEAS));
        }

        // Load Metadata History
        const savedMetadata = localStorage.getItem("cf_metadata_history_v1");
        if (savedMetadata) {
          setMetadataRecords(JSON.parse(savedMetadata));
        }

        // Load Upload Jobs
        const savedJobs = localStorage.getItem("cf_upload_jobs_v1");
        if (savedJobs) {
          setUploadJobs(JSON.parse(savedJobs));
        } else {
          setUploadJobs(MOCK_UPLOAD_JOBS);
          localStorage.setItem("cf_upload_jobs_v1", JSON.stringify(MOCK_UPLOAD_JOBS));
        }

        // Load Usage
        const savedUsage = localStorage.getItem("cf_usage_v1");
        if (savedUsage) {
          setUsage(JSON.parse(savedUsage));
        }
      } catch (err) {
        console.warn("Notice: Error parsing local data store, falling back to initial data:", err);
        setVideos(MOCK_VIDEOS);
        setIdeas(MOCK_IDEAS);
        setUploadJobs(MOCK_UPLOAD_JOBS);
      } finally {
        setIsLoadingData(false);
      }
    }

    loadInitialData();
  }, []);

  // Sync to localStorage helpers
  const persistVideos = useCallback((newVideos: Video[]) => {
    setVideos(newVideos);
    try {
      localStorage.setItem("cf_videos_v1", JSON.stringify(newVideos));
    } catch (e) {
      console.warn("Could not save videos to localStorage", e);
    }
  }, []);

  const persistIdeas = useCallback((newIdeas: ContentIdea[]) => {
    setIdeas(newIdeas);
    try {
      localStorage.setItem("cf_ideas_v1", JSON.stringify(newIdeas));
    } catch (e) {
      console.warn("Could not save ideas to localStorage", e);
    }
  }, []);

  const persistMetadataRecords = useCallback((records: SavedMetadataRecord[]) => {
    setMetadataRecords(records);
    try {
      localStorage.setItem("cf_metadata_history_v1", JSON.stringify(records));
    } catch (e) {
      console.warn("Could not save metadata to localStorage", e);
    }
  }, []);

  const persistUploadJobs = useCallback((jobs: UploadJob[]) => {
    setUploadJobs(jobs);
    try {
      localStorage.setItem("cf_upload_jobs_v1", JSON.stringify(jobs));
    } catch (e) {
      console.warn("Could not save upload jobs to localStorage", e);
    }
  }, []);

  const persistUsage = useCallback((newUsage: UsageMeter) => {
    setUsage(newUsage);
    try {
      localStorage.setItem("cf_usage_v1", JSON.stringify(newUsage));
    } catch (e) {
      console.warn("Could not save usage to localStorage", e);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Video Management Operations
  // ---------------------------------------------------------------------------
  const addVideo = useCallback(
    (videoData: Partial<Video>): Video => {
      const newVideo: Video = {
        id: videoData.id || `vid-${Date.now()}`,
        user_id: user?.id || "demo-user-123456",
        channel_id: videoData.channel_id ?? (activeChannel?.id || "chan-demo-1"),
        title: videoData.title || "Untitled Video",
        description: videoData.description || "",
        tags: videoData.tags || [],
        privacy_status: videoData.privacy_status || "private",
        status: videoData.status || "draft",
        youtube_video_id: videoData.youtube_video_id || null,
        scheduled_at: videoData.scheduled_at || null,
        published_at: videoData.published_at || null,
        video_file_url: videoData.video_file_url || null,
        thumbnail_url:
          videoData.thumbnail_url ||
          "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const updated = [newVideo, ...videos];
      persistVideos(updated);

      // Async sync to Supabase if authenticated and not in demo
      if (user && !isDemoMode) {
        supabase
          .from("videos")
          .insert(newVideo)
          .then(({ error }) => {
            if (error) console.warn("Supabase video insert error:", error);
          });
      }

      return newVideo;
    },
    [videos, user, activeChannel, isDemoMode, persistVideos, supabase]
  );

  const updateVideo = useCallback(
    (id: string, updates: Partial<Video>) => {
      const updated = videos.map((v) =>
        v.id === id ? { ...v, ...updates, updated_at: new Date().toISOString() } : v
      );
      persistVideos(updated);

      if (user && !isDemoMode) {
        supabase
          .from("videos")
          .update(updates)
          .eq("id", id)
          .then(({ error }) => {
            if (error) console.warn("Supabase video update error:", error);
          });
      }
    },
    [videos, user, isDemoMode, persistVideos, supabase]
  );

  const deleteVideo = useCallback(
    (id: string) => {
      const updated = videos.filter((v) => v.id !== id);
      persistVideos(updated);

      if (user && !isDemoMode) {
        supabase
          .from("videos")
          .delete()
          .eq("id", id)
          .then(({ error }) => {
            if (error) console.warn("Supabase video delete error:", error);
          });
      }
      toast.info("Video removed", "Project removed from your library.");
    },
    [videos, user, isDemoMode, persistVideos, supabase, toast]
  );

  const getVideo = useCallback(
    (id: string) => {
      return videos.find((v) => v.id === id);
    },
    [videos]
  );

  // ---------------------------------------------------------------------------
  // Content Ideas Operations
  // ---------------------------------------------------------------------------
  const addIdea = useCallback(
    (ideaData: Partial<ContentIdea>): ContentIdea => {
      const newIdea: ContentIdea = {
        id: ideaData.id || `idea-${Date.now()}`,
        user_id: user?.id || "demo-user-123456",
        channel_id: ideaData.channel_id ?? (activeChannel?.id || null),
        niche: ideaData.niche || "Content Creation",
        title: ideaData.title || "Untitled Viral Concept",
        hook: ideaData.hook || "",
        outline: ideaData.outline || [],
        format: ideaData.format || "long_form",
        status: ideaData.status || "saved",
        suggested_keywords: ideaData.suggested_keywords || [],
        created_at: new Date().toISOString(),
      };

      const updated = [newIdea, ...ideas];
      persistIdeas(updated);

      if (user && !isDemoMode) {
        supabase
          .from("content_ideas")
          .insert(newIdea)
          .then(({ error }) => {
            if (error) console.warn("Supabase idea insert error:", error);
          });
      }

      toast.success("Idea Saved", `Saved "${newIdea.title.substring(0, 40)}..." to your idea bank.`);
      return newIdea;
    },
    [ideas, user, activeChannel, isDemoMode, persistIdeas, supabase, toast]
  );

  const updateIdeaStatus = useCallback(
    (id: string, status: IdeaStatus) => {
      const updated = ideas.map((i) => (i.id === id ? { ...i, status } : i));
      persistIdeas(updated);

      if (user && !isDemoMode) {
        supabase
          .from("content_ideas")
          .update({ status })
          .eq("id", id)
          .then(({ error }) => {
            if (error) console.warn("Supabase idea status error:", error);
          });
      }
    },
    [ideas, user, isDemoMode, persistIdeas, supabase]
  );

  const deleteIdea = useCallback(
    (id: string) => {
      const updated = ideas.filter((i) => i.id !== id);
      persistIdeas(updated);

      if (user && !isDemoMode) {
        supabase
          .from("content_ideas")
          .delete()
          .eq("id", id)
          .then(({ error }) => {
            if (error) console.warn("Supabase idea delete error:", error);
          });
      }
      toast.info("Idea deleted", "Removed from your idea bank.");
    },
    [ideas, user, isDemoMode, persistIdeas, supabase, toast]
  );

  const convertIdeaToVideo = useCallback(
    (ideaId: string, channelId?: string): Video | null => {
      const idea = ideas.find((i) => i.id === ideaId);
      if (!idea) return null;

      const newVideo = addVideo({
        title: idea.title,
        description: `${idea.hook}\n\nKey Outline Points:\n${
          Array.isArray(idea.outline)
            ? idea.outline.map((o: any, idx: number) => `• ${o}`).join("\n")
            : ""
        }\n\n#ContentCreator #YouTubeGrowth`,
        tags: idea.suggested_keywords.length > 0 ? idea.suggested_keywords : ["youtube", "video"],
        channel_id: channelId || idea.channel_id || activeChannel?.id || "chan-demo-1",
        privacy_status: "private",
        status: "draft",
        scheduled_at: new Date(Date.now() + 7 * 86400000).toISOString(),
      });

      // Update idea status to in_progress
      updateIdeaStatus(ideaId, "in_progress");

      toast.success(
        "Project Created from Idea",
        `Created video project "${newVideo.title.substring(0, 35)}..." in drafts.`
      );
      return newVideo;
    },
    [ideas, activeChannel, addVideo, updateIdeaStatus, toast]
  );

  // ---------------------------------------------------------------------------
  // Usage & Quotas
  // ---------------------------------------------------------------------------
  const incrementUsage = useCallback(
    (type: "ai" | "upload" | "channel") => {
      setUsage((prev) => {
        const next = { ...prev };
        if (type === "ai") next.metadataGenerations += 1;
        if (type === "upload") next.videoUploads += 1;
        if (type === "channel") next.connectedChannels += 1;
        persistUsage(next);
        return next;
      });
    },
    [persistUsage]
  );

  // ---------------------------------------------------------------------------
  // Metadata History & Binding Operations
  // ---------------------------------------------------------------------------
  const saveMetadataRecord = useCallback(
    (
      topic: string,
      niche: string,
      data: GeneratedMetadataOutput,
      videoId?: string | null
    ): SavedMetadataRecord => {
      const targetVideo = videoId ? videos.find((v) => v.id === videoId) : undefined;
      const record: SavedMetadataRecord = {
        id: `meta-${Date.now()}`,
        videoId: videoId || null,
        videoTitle: targetVideo?.title,
        topic,
        niche,
        generatedAt: new Date().toISOString(),
        data,
      };

      const updated = [record, ...metadataRecords.slice(0, 29)]; // keep 30 records
      persistMetadataRecords(updated);

      // Increment AI quota usage
      incrementUsage("ai");

      return record;
    },
    [metadataRecords, videos, persistMetadataRecords, incrementUsage]
  );

  const applyMetadataToVideo = useCallback(
    (videoId: string, metadata: GeneratedMetadataOutput): boolean => {
      const target = videos.find((v) => v.id === videoId);
      if (!target) return false;

      const chosenTitle = metadata.titles[0] || target.title;
      updateVideo(videoId, {
        title: chosenTitle,
        description: metadata.description,
        tags: metadata.tags,
      });

      toast.success(
        "Metadata Applied to Video",
        `Updated video "${chosenTitle.substring(0, 35)}..." with generated SEO metadata.`
      );
      return true;
    },
    [videos, updateVideo, toast]
  );

  // ---------------------------------------------------------------------------
  // Upload Jobs Operations
  // ---------------------------------------------------------------------------
  const addUploadJob = useCallback(
    (jobData: Partial<UploadJob>): UploadJob => {
      const newJob: UploadJob = {
        id: jobData.id || `job-${Date.now()}`,
        video_id: jobData.video_id || "vid-unknown",
        user_id: user?.id || "demo-user-123456",
        channel_id: jobData.channel_id || (activeChannel?.id || "chan-demo-1"),
        status: jobData.status || "pending",
        progress_percent: jobData.progress_percent || 0,
        bytes_uploaded: jobData.bytes_uploaded || 0,
        total_bytes: jobData.total_bytes || 104857600, // 100MB default
        youtube_upload_url: jobData.youtube_upload_url || null,
        error_message: null,
        retry_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const updated = [newJob, ...uploadJobs];
      persistUploadJobs(updated);

      incrementUsage("upload");
      return newJob;
    },
    [uploadJobs, user, activeChannel, persistUploadJobs, incrementUsage]
  );

  const updateUploadJob = useCallback(
    (id: string, updates: Partial<UploadJob>) => {
      const updated = uploadJobs.map((j) =>
        j.id === id ? { ...j, ...updates, updated_at: new Date().toISOString() } : j
      );
      persistUploadJobs(updated);
    },
    [uploadJobs, persistUploadJobs]
  );

  const cancelUploadJob = useCallback(
    (id: string) => {
      updateUploadJob(id, { status: "failed", error_message: "Upload cancelled by creator." });
      toast.warning("Upload Cancelled", "The upload task was stopped.");
    },
    [updateUploadJob, toast]
  );

  // ---------------------------------------------------------------------------
  // Quotas & Plan Verification
  // ---------------------------------------------------------------------------
  const checkQuota = useCallback(
    (type: "ai" | "upload" | "channel", customTier?: PlanTier) => {
      const tier: PlanTier = customTier || profile?.plan_tier || "creator";
      const limit = PLAN_LIMITS[tier] || PLAN_LIMITS.creator;

      if (type === "ai") {
        return {
          allowed: usage.metadataGenerations < limit.ai,
          current: usage.metadataGenerations,
          max: limit.ai,
        };
      }
      if (type === "upload") {
        return {
          allowed: usage.videoUploads < limit.uploads,
          current: usage.videoUploads,
          max: limit.uploads,
        };
      }
      return {
        allowed: usage.connectedChannels < limit.channels,
        current: usage.connectedChannels,
        max: limit.channels,
      };
    },
    [profile, usage]
  );

  const resetToDemoDefaults = useCallback(() => {
    localStorage.removeItem("cf_videos_v1");
    localStorage.removeItem("cf_ideas_v1");
    localStorage.removeItem("cf_metadata_history_v1");
    localStorage.removeItem("cf_upload_jobs_v1");
    localStorage.removeItem("cf_usage_v1");
    setVideos(MOCK_VIDEOS);
    setIdeas(MOCK_IDEAS);
    setMetadataRecords([]);
    setUploadJobs(MOCK_UPLOAD_JOBS);
    setUsage({
      metadataGenerations: 32,
      videoUploads: 4,
      connectedChannels: 2,
    });
    toast.success("Workspace Reset", "Demo data restored to initial state.");
  }, [toast]);

  return (
    <DataContext.Provider
      value={{
        videos,
        addVideo,
        updateVideo,
        deleteVideo,
        getVideo,
        ideas,
        addIdea,
        updateIdeaStatus,
        deleteIdea,
        convertIdeaToVideo,
        metadataRecords,
        saveMetadataRecord,
        applyMetadataToVideo,
        uploadJobs,
        addUploadJob,
        updateUploadJob,
        cancelUploadJob,
        usage,
        incrementUsage,
        checkQuota,
        isLoadingData,
        resetToDemoDefaults,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
