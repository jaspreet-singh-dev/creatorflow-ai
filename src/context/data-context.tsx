"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { Video, ContentIdea, UploadJob, PlanTier, VideoPrivacy, VideoStatus, IdeaStatus, VideoProject, ProjectVersion, ProjectVersionSnapshot } from "@/types/database.types";
import { MOCK_VIDEOS, MOCK_IDEAS, MOCK_UPLOAD_JOBS, MOCK_PROJECTS } from "@/lib/data/mock-data";
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
  // Video Projects (Central Workspace)
  projects: VideoProject[];
  addProject: (project: Partial<VideoProject>) => VideoProject;
  updateProject: (id: string, updates: Partial<VideoProject>) => void;
  deleteProject: (id: string) => void;
  getProject: (id: string) => VideoProject | undefined;
  createProjectFromIdea: (ideaId: string, channelId?: string) => VideoProject | null;
  createProjectFromMetadata: (params: {
    topic: string;
    niche: string;
    metadata: GeneratedMetadataOutput;
    channelId?: string;
    ideaId?: string;
    contentType?: string;
    targetAudience?: string;
    language?: string;
  }) => VideoProject;
  saveProjectVersion: (
    projectId: string,
    name: string,
    snapshot?: Partial<ProjectVersionSnapshot>,
    summary?: string
  ) => ProjectVersion | null;
  restoreProjectVersion: (projectId: string, versionId: string) => VideoProject | null;
  deleteProjectVersion: (projectId: string, versionId: string) => void;
  renameProjectVersion: (projectId: string, versionId: string, newName: string) => void;

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
  const { user, profile, isDemoMode, isOwner } = useAuth();
  const { activeChannel, channels } = useChannel();
  const { toast } = useToast();
  const supabase = useMemo(() => createClient(), []);

  const [projects, setProjects] = useState<VideoProject[]>([]);
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
        const prefix = user?.id ? `cf_user_${user.id}_` : "cf_demo_";

        // Load Video Projects (Central Workspace)
        const savedProjects = localStorage.getItem(`${prefix}projects_v1`) || localStorage.getItem("cf_projects_v1");
        if (savedProjects) {
          try {
            setProjects(JSON.parse(savedProjects));
          } catch {
            setProjects(MOCK_PROJECTS);
          }
        } else {
          setProjects(MOCK_PROJECTS);
          localStorage.setItem(`${prefix}projects_v1`, JSON.stringify(MOCK_PROJECTS));
          localStorage.setItem("cf_projects_v1", JSON.stringify(MOCK_PROJECTS));
        }

        // Load Videos
        const savedVideos = localStorage.getItem(`${prefix}videos_v1`) || localStorage.getItem("cf_videos_v1");
        if (savedVideos) {
          setVideos(JSON.parse(savedVideos));
        } else {
          setVideos(MOCK_VIDEOS);
          localStorage.setItem(`${prefix}videos_v1`, JSON.stringify(MOCK_VIDEOS));
        }

        // Load Content Ideas
        const savedIdeas = localStorage.getItem(`${prefix}ideas_v1`) || localStorage.getItem("cf_ideas_v1");
        if (savedIdeas) {
          setIdeas(JSON.parse(savedIdeas));
        } else {
          setIdeas(MOCK_IDEAS);
          localStorage.setItem(`${prefix}ideas_v1`, JSON.stringify(MOCK_IDEAS));
        }

        // Load Metadata History
        const savedMetadata = localStorage.getItem(`${prefix}metadata_history_v1`) || localStorage.getItem("cf_metadata_history_v1");
        if (savedMetadata) {
          setMetadataRecords(JSON.parse(savedMetadata));
        }

        // Load Upload Jobs
        const savedJobs = localStorage.getItem(`${prefix}upload_jobs_v1`) || localStorage.getItem("cf_upload_jobs_v1");
        if (savedJobs) {
          setUploadJobs(JSON.parse(savedJobs));
        } else {
          setUploadJobs(MOCK_UPLOAD_JOBS);
          localStorage.setItem(`${prefix}upload_jobs_v1`, JSON.stringify(MOCK_UPLOAD_JOBS));
        }

        // Load Usage
        const savedUsage = localStorage.getItem(`${prefix}usage_v1`) || localStorage.getItem("cf_usage_v1");
        if (savedUsage) {
          setUsage(JSON.parse(savedUsage));
        }
      } catch (err) {
        console.warn("Notice: Error parsing local data store, falling back to initial data:", err);
        setProjects(MOCK_PROJECTS);
        setVideos(MOCK_VIDEOS);
        setIdeas(MOCK_IDEAS);
        setUploadJobs(MOCK_UPLOAD_JOBS);
      } finally {
        setIsLoadingData(false);
      }
    }

    loadInitialData();
  }, [user?.id]);

  // Sync to localStorage helpers
  const persistProjects = useCallback((newProjects: VideoProject[]) => {
    setProjects(newProjects);
    try {
      const prefix = user?.id ? `cf_user_${user.id}_` : "cf_demo_";
      localStorage.setItem(`${prefix}projects_v1`, JSON.stringify(newProjects));
      localStorage.setItem("cf_projects_v1", JSON.stringify(newProjects));
    } catch (e) {
      console.warn("Could not save projects to localStorage", e);
    }
  }, [user?.id]);

  const persistVideos = useCallback((newVideos: Video[]) => {
    setVideos(newVideos);
    try {
      const prefix = user?.id ? `cf_user_${user.id}_` : "cf_demo_";
      localStorage.setItem(`${prefix}videos_v1`, JSON.stringify(newVideos));
      localStorage.setItem("cf_videos_v1", JSON.stringify(newVideos));
    } catch (e) {
      console.warn("Could not save videos to localStorage", e);
    }
  }, [user?.id]);

  const persistIdeas = useCallback((newIdeas: ContentIdea[]) => {
    setIdeas(newIdeas);
    try {
      const prefix = user?.id ? `cf_user_${user.id}_` : "cf_demo_";
      localStorage.setItem(`${prefix}ideas_v1`, JSON.stringify(newIdeas));
      localStorage.setItem("cf_ideas_v1", JSON.stringify(newIdeas));
    } catch (e) {
      console.warn("Could not save ideas to localStorage", e);
    }
  }, [user?.id]);

  const persistMetadataRecords = useCallback((records: SavedMetadataRecord[]) => {
    setMetadataRecords(records);
    try {
      const prefix = user?.id ? `cf_user_${user.id}_` : "cf_demo_";
      localStorage.setItem(`${prefix}metadata_history_v1`, JSON.stringify(records));
      localStorage.setItem("cf_metadata_history_v1", JSON.stringify(records));
    } catch (e) {
      console.warn("Could not save metadata to localStorage", e);
    }
  }, [user?.id]);

  const persistUploadJobs = useCallback((jobs: UploadJob[]) => {
    setUploadJobs(jobs);
    try {
      const prefix = user?.id ? `cf_user_${user.id}_` : "cf_demo_";
      localStorage.setItem(`${prefix}upload_jobs_v1`, JSON.stringify(jobs));
      localStorage.setItem("cf_upload_jobs_v1", JSON.stringify(jobs));
    } catch (e) {
      console.warn("Could not save upload jobs to localStorage", e);
    }
  }, [user?.id]);

  const persistUsage = useCallback((newUsage: UsageMeter) => {
    setUsage(newUsage);
    try {
      const prefix = user?.id ? `cf_user_${user.id}_` : "cf_demo_";
      localStorage.setItem(`${prefix}usage_v1`, JSON.stringify(newUsage));
      localStorage.setItem("cf_usage_v1", JSON.stringify(newUsage));
    } catch (e) {
      console.warn("Could not save usage to localStorage", e);
    }
  }, [user?.id]);

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
  // Central Video Project Workspace Operations
  // ---------------------------------------------------------------------------
  const addProject = useCallback(
    (projectData: Partial<VideoProject>): VideoProject => {
      const title = projectData.selectedTitle || projectData.name || "Untitled Video Project";
      const newProject: VideoProject = {
        id: projectData.id || `proj-${Date.now()}`,
        user_id: user?.id || "demo-user-123456",
        channel_id: projectData.channel_id ?? (activeChannel?.id || "chan-demo-1"),
        name: projectData.name || title,
        topic: projectData.topic || title,
        niche: projectData.niche || "Content Creation",
        contentType: projectData.contentType || "tutorial",
        targetAudience: projectData.targetAudience || "General YouTube Audience",
        language: projectData.language || "English",
        idea: projectData.idea || "",
        hook: projectData.hook || (projectData.hookSuggestions?.[0] || ""),
        hookSuggestions: projectData.hookSuggestions || [],
        selectedTitle: title,
        titleSuggestions: projectData.titleSuggestions || [title],
        outline: projectData.outline || [],
        script: projectData.script || "",
        description: projectData.description || "",
        tags: projectData.tags || [],
        hashtags: projectData.hashtags || [],
        thumbnailText: projectData.thumbnailText || "",
        pinnedComment: projectData.pinnedComment || "",
        chapters: projectData.chapters || [],
        qualityScore: projectData.qualityScore || {
          overall: 88,
          clarity: 90,
          relevance: 88,
          readability: 90,
          keywordCoverage: 85,
          critique: ["Solid project foundation ready for production."],
          isHeuristicFallback: false,
        },
        thumbnailUrl:
          projectData.thumbnailUrl ||
          "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
        thumbnailOverlayText: projectData.thumbnailOverlayText || null,
        thumbnailTextColor: projectData.thumbnailTextColor || "#FACC15",
        thumbnailStyle: projectData.thumbnailStyle || "High Contrast Minimalist",
        videoFileRef: projectData.videoFileRef || null,
        privacyStatus: projectData.privacyStatus || "private",
        scheduledAt: projectData.scheduledAt || null,
        publishedAt: projectData.publishedAt || null,
        status: projectData.status || "draft",
        youtubeVideoId: projectData.youtubeVideoId || null,
        youtubeVideoUrl: projectData.youtubeVideoUrl || null,
        notes: projectData.notes || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setProjects((prev) => {
        const updated = [newProject, ...prev];
        persistProjects(updated);
        return updated;
      });

      // Synchronize video mirror record
      addVideo({
        id: newProject.id,
        channel_id: newProject.channel_id,
        title: newProject.selectedTitle,
        description: newProject.description,
        tags: newProject.tags,
        privacy_status: newProject.privacyStatus,
        status: (newProject.status as VideoStatus) || "draft",
        youtube_video_id: newProject.youtubeVideoId,
        scheduled_at: newProject.scheduledAt,
        published_at: newProject.publishedAt,
        thumbnail_url: newProject.thumbnailUrl,
      });

      return newProject;
    },
    [user, activeChannel, persistProjects, addVideo]
  );

  const updateProject = useCallback(
    (id: string, updates: Partial<VideoProject>) => {
      setProjects((prev) => {
        const updated = prev.map((p) => {
          if (p.id === id) {
            const merged = { ...p, ...updates, updatedAt: new Date().toISOString() };
            // Mirror to video library
            updateVideo(id, {
              title: merged.selectedTitle || merged.name,
              description: merged.description,
              tags: merged.tags,
              privacy_status: merged.privacyStatus,
              status: (merged.status as VideoStatus) || "draft",
              scheduled_at: merged.scheduledAt,
              published_at: merged.publishedAt,
              thumbnail_url: merged.thumbnailUrl,
              youtube_video_id: merged.youtubeVideoId,
            });
            return merged;
          }
          return p;
        });
        persistProjects(updated);
        return updated;
      });
    },
    [persistProjects, updateVideo]
  );

  const deleteProject = useCallback(
    (id: string) => {
      setProjects((prev) => {
        const updated = prev.filter((p) => p.id !== id);
        persistProjects(updated);
        return updated;
      });
      deleteVideo(id);
      toast.info("Project Deleted", "Removed project from workspace.");
    },
    [persistProjects, deleteVideo, toast]
  );

  const getProject = useCallback(
    (id: string): VideoProject | undefined => {
      return projects.find((p) => p.id === id);
    },
    [projects]
  );

  const createProjectFromIdea = useCallback(
    (ideaId: string, channelId?: string): VideoProject | null => {
      const idea = ideas.find((i) => i.id === ideaId);
      if (!idea) return null;

      const title = idea.title || "Untitled Viral Concept";
      const newProj = addProject({
        name: title,
        topic: idea.niche ? `${idea.niche}: ${title}` : title,
        niche: idea.niche || "Content Creation",
        contentType: idea.format === "short_form" ? "shorts" : idea.format === "series" ? "series" : "long_form",
        targetAudience: "Target YouTube Audience",
        language: "English",
        idea: idea.hook || idea.title,
        hook: idea.hook || "",
        hookSuggestions: [idea.hook].filter(Boolean),
        selectedTitle: title,
        titleSuggestions: [title],
        outline: idea.outline || [],
        script: `[00:00 - HOOK]\n${idea.hook}\n\n[KEY OUTLINE]\n${Array.isArray(idea.outline) ? idea.outline.map((o: any) => `• ${o}`).join("\n") : ""}`,
        description: `${idea.hook}\n\nOutline Breakdown:\n${Array.isArray(idea.outline) ? idea.outline.map((o: any) => `• ${o}`).join("\n") : ""}\n\n#ContentCreation #YouTubeGrowth`,
        tags: idea.suggested_keywords?.length > 0 ? idea.suggested_keywords : ["youtube", "video"],
        hashtags: ["#ContentCreation", "#YouTubeGrowth"],
        thumbnailText: title.substring(0, 20).toUpperCase(),
        channel_id: channelId || idea.channel_id || activeChannel?.id || "chan-demo-1",
        privacyStatus: "private",
        status: "idea",
        scheduledAt: new Date(Date.now() + 7 * 86400000).toISOString(),
      });

      updateIdeaStatus(ideaId, "in_progress");
      toast.success("Project Created", `Idea converted into Project "${title.substring(0, 30)}...".`);
      return newProj;
    },
    [ideas, activeChannel, addProject, updateIdeaStatus, toast]
  );

  const createProjectFromMetadata = useCallback(
    (params: {
      topic: string;
      niche: string;
      metadata: GeneratedMetadataOutput;
      channelId?: string;
      ideaId?: string;
      contentType?: string;
      targetAudience?: string;
      language?: string;
    }): VideoProject => {
      const { topic, niche, metadata, channelId, ideaId, contentType, targetAudience, language } = params;
      const title = metadata.titles[0] || topic || "Untitled Video";
      const newProj = addProject({
        name: title,
        topic,
        niche,
        contentType: contentType || "tutorial",
        targetAudience: targetAudience || "Target YouTube Audience",
        language: language || "English",
        idea: metadata.titles[1] || topic,
        hook: metadata.thumbnailIdeas?.[0] || "",
        hookSuggestions: metadata.thumbnailIdeas || [],
        selectedTitle: title,
        titleSuggestions: metadata.titles,
        outline: metadata.chapters.map((c) => `${c.time} - ${c.title}`),
        script: `[00:00 - HOOK]\n${metadata.pinnedComment || ""}\n\n[TIMESTAMPS]\n${metadata.chapters.map((c) => `• ${c.time}: ${c.title}`).join("\n")}`,
        description: metadata.description,
        tags: metadata.tags,
        hashtags: metadata.hashtags,
        thumbnailText: metadata.thumbnailIdeas?.[0] || "",
        pinnedComment: metadata.pinnedComment || "",
        chapters: metadata.chapters,
        qualityScore: metadata.qualityScore,
        channel_id: channelId || activeChannel?.id || "chan-demo-1",
        status: "metadata",
      });

      if (ideaId) {
        updateIdeaStatus(ideaId, "in_progress");
      }

      toast.success("Project Saved", `Project "${newProj.name.substring(0, 30)}..." ready in Publish workspace.`);
      return newProj;
    },
    [addProject, activeChannel, updateIdeaStatus, toast]
  );

  const saveProjectVersion = useCallback(
    (
      projectId: string,
      name: string,
      snapshotUpdates?: Partial<ProjectVersionSnapshot>,
      summary?: string
    ): ProjectVersion | null => {
      let createdVer: ProjectVersion | null = null;
      setProjects((prev) => {
        const updated = prev.map((proj) => {
          if (proj.id === projectId) {
            const snapshot: ProjectVersionSnapshot = {
              selectedTitle: snapshotUpdates?.selectedTitle ?? proj.selectedTitle,
              titleSuggestions: snapshotUpdates?.titleSuggestions ?? proj.titleSuggestions,
              hook: snapshotUpdates?.hook ?? proj.hook,
              hookSuggestions: snapshotUpdates?.hookSuggestions ?? proj.hookSuggestions,
              script: snapshotUpdates?.script ?? proj.script,
              outline: snapshotUpdates?.outline ?? proj.outline,
              chapters: snapshotUpdates?.chapters ?? proj.chapters,
              description: snapshotUpdates?.description ?? proj.description,
              tags: snapshotUpdates?.tags ?? proj.tags,
              hashtags: snapshotUpdates?.hashtags ?? proj.hashtags,
              thumbnailText: snapshotUpdates?.thumbnailText ?? proj.thumbnailText,
              pinnedComment: snapshotUpdates?.pinnedComment ?? proj.pinnedComment,
            };

            const version: ProjectVersion = {
              id: `ver-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              name: name.trim() || `Version ${(proj.versions?.length || 0) + 1}`,
              summary: summary || `Snapshot created at ${new Date().toLocaleTimeString()}`,
              createdAt: new Date().toISOString(),
              snapshot,
            };

            createdVer = version;
            const existingVersions = proj.versions || [];
            return {
              ...proj,
              versions: [version, ...existingVersions],
              activeVersionId: version.id,
              updatedAt: new Date().toISOString(),
            };
          }
          return proj;
        });
        persistProjects(updated);
        return updated;
      });

      if (createdVer) {
        toast.success("Version Saved", `Saved "${(createdVer as ProjectVersion).name}" to project history.`);
      }
      return createdVer;
    },
    [persistProjects, toast]
  );

  const restoreProjectVersion = useCallback(
    (projectId: string, versionId: string): VideoProject | null => {
      let restoredProj: VideoProject | null = null;
      setProjects((prev) => {
        const updated = prev.map((proj) => {
          if (proj.id === projectId) {
            const ver = proj.versions?.find((v) => v.id === versionId);
            if (!ver) return proj;

            const snap = ver.snapshot;
            const updatedProject: VideoProject = {
              ...proj,
              selectedTitle: snap.selectedTitle ?? proj.selectedTitle,
              titleSuggestions: snap.titleSuggestions ?? proj.titleSuggestions,
              hook: snap.hook ?? proj.hook,
              hookSuggestions: snap.hookSuggestions ?? proj.hookSuggestions,
              script: snap.script ?? proj.script,
              outline: snap.outline ?? proj.outline,
              chapters: snap.chapters ?? proj.chapters,
              description: snap.description ?? proj.description,
              tags: snap.tags ?? proj.tags,
              hashtags: snap.hashtags ?? proj.hashtags,
              thumbnailText: snap.thumbnailText ?? proj.thumbnailText,
              pinnedComment: snap.pinnedComment ?? proj.pinnedComment,
              activeVersionId: versionId,
              updatedAt: new Date().toISOString(),
            };
            restoredProj = updatedProject;
            return updatedProject;
          }
          return proj;
        });
        persistProjects(updated);
        return updated;
      });

      if (restoredProj) {
        updateVideo(projectId, {
          title: (restoredProj as VideoProject).selectedTitle,
          description: (restoredProj as VideoProject).description,
          tags: (restoredProj as VideoProject).tags,
        });
        toast.info("Version Restored", "Project fields restored from selected snapshot.");
      }
      return restoredProj;
    },
    [persistProjects, updateVideo, toast]
  );

  const deleteProjectVersion = useCallback(
    (projectId: string, versionId: string) => {
      setProjects((prev) => {
        const updated = prev.map((proj) => {
          if (proj.id === projectId && proj.versions) {
            const filtered = proj.versions.filter((v) => v.id !== versionId);
            return {
              ...proj,
              versions: filtered,
              activeVersionId: proj.activeVersionId === versionId ? undefined : proj.activeVersionId,
              updatedAt: new Date().toISOString(),
            };
          }
          return proj;
        });
        persistProjects(updated);
        return updated;
      });
      toast.info("Version Deleted", "Removed version from project history.");
    },
    [persistProjects, toast]
  );

  const renameProjectVersion = useCallback(
    (projectId: string, versionId: string, newName: string) => {
      setProjects((prev) => {
        const updated = prev.map((proj) => {
          if (proj.id === projectId && proj.versions) {
            const renamed = proj.versions.map((v) =>
              v.id === versionId ? { ...v, name: newName.trim() } : v
            );
            return {
              ...proj,
              versions: renamed,
              updatedAt: new Date().toISOString(),
            };
          }
          return proj;
        });
        persistProjects(updated);
        return updated;
      });
      toast.success("Version Renamed", `Updated version name to "${newName}".`);
    },
    [persistProjects, toast]
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
      // Owner account has unlimited access across all quotas
      const isOwnerAccount =
        isOwner ||
        user?.email?.toLowerCase() === "jaspreetsing3412@gmail.com" ||
        (profile as any)?.role === "owner" ||
        (profile as any)?.is_owner === true;

      if (isOwnerAccount) {
        return {
          allowed: true,
          current:
            type === "ai"
              ? usage.metadataGenerations
              : type === "upload"
              ? usage.videoUploads
              : usage.connectedChannels,
          max: Infinity,
        };
      }

      const tier: PlanTier = customTier || profile?.plan_tier || "free";
      const limit = PLAN_LIMITS[tier] || PLAN_LIMITS.free;

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
    [profile, usage, isOwner, user?.email]
  );

  const resetToDemoDefaults = useCallback(() => {
    const prefix = user?.id ? `cf_user_${user.id}_` : "cf_demo_";
    localStorage.removeItem(`${prefix}projects_v1`);
    localStorage.removeItem("cf_projects_v1");
    localStorage.removeItem(`${prefix}videos_v1`);
    localStorage.removeItem("cf_videos_v1");
    localStorage.removeItem(`${prefix}ideas_v1`);
    localStorage.removeItem("cf_ideas_v1");
    localStorage.removeItem(`${prefix}metadata_history_v1`);
    localStorage.removeItem("cf_metadata_history_v1");
    localStorage.removeItem(`${prefix}upload_jobs_v1`);
    localStorage.removeItem("cf_upload_jobs_v1");
    localStorage.removeItem(`${prefix}usage_v1`);
    localStorage.removeItem("cf_usage_v1");
    setProjects(MOCK_PROJECTS);
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
  }, [user?.id, toast]);

  return (
    <DataContext.Provider
      value={{
        projects,
        addProject,
        updateProject,
        deleteProject,
        getProject,
        createProjectFromIdea,
        createProjectFromMetadata,
        saveProjectVersion,
        restoreProjectVersion,
        deleteProjectVersion,
        renameProjectVersion,
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
