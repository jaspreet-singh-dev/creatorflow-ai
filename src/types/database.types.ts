export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type PlanTier = "free" | "creator" | "pro";

export type VideoPrivacy = "private" | "unlisted" | "public";

export type VideoStatus =
  | "draft"
  | "ready"
  | "uploading"
  | "processing"
  | "scheduled"
  | "published"
  | "failed";

export type UploadJobStatus =
  | "pending"
  | "uploading"
  | "processing"
  | "completed"
  | "failed";

export type IdeaFormat = "long_form" | "short_form" | "series";
export type IdeaStatus = "saved" | "in_progress" | "completed" | "archived";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  plan_tier: PlanTier;
  created_at: string;
  updated_at: string;
}

export interface ConnectedChannel {
  id: string;
  user_id: string;
  youtube_channel_id: string;
  title: string;
  custom_url: string | null;
  thumbnail_url: string | null;
  subscriber_count: number;
  video_count: number;
  view_count: number;
  refresh_token?: string; // Server-only, omitted in client responses
  access_token?: string;
  token_expires_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Video {
  id: string;
  user_id: string;
  channel_id: string | null;
  title: string;
  description: string;
  tags: string[];
  privacy_status: VideoPrivacy;
  status: VideoStatus;
  youtube_video_id: string | null;
  scheduled_at: string | null;
  published_at: string | null;
  video_file_url: string | null;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
  // Joined relation for UI convenience
  channel?: ConnectedChannel;
}

export interface VideoMetadata {
  id: string;
  video_id: string | null;
  user_id: string;
  topic: string;
  niche: string;
  target_audience: string;
  primary_keyword: string;
  secondary_keywords: string[];
  preferred_tone: string;
  language: string;
  titles: string[];
  description: string;
  tags: string[];
  hashtags: string[];
  pinned_comment: string;
  chapters: { time: string; title: string }[];
  thumbnail_ideas: string[];
  quality_score: {
    overall: number; // 0 - 100
    clarity: number; // 0 - 100
    relevance: number; // 0 - 100
    readability: number; // 0 - 100
    keywordCoverage: number; // 0 - 100
    critique: string[];
  };
  created_at: string;
  updated_at: string;
}

export interface UploadJob {
  id: string;
  video_id: string;
  user_id: string;
  channel_id: string;
  status: UploadJobStatus;
  progress_percent: number;
  bytes_uploaded: number;
  total_bytes: number;
  youtube_upload_url: string | null;
  error_message: string | null;
  retry_count: number;
  created_at: string;
  updated_at: string;
  // Joined relations
  video?: Video;
  channel?: ConnectedChannel;
}

export interface ThumbnailAsset {
  id: string;
  user_id: string;
  video_id: string | null;
  image_url: string;
  prompt: string | null;
  text_overlay: string | null;
  style: string | null;
  is_active: boolean;
  created_at: string;
}

export interface ContentIdea {
  id: string;
  user_id: string;
  channel_id: string | null;
  niche: string;
  title: string;
  hook: string;
  outline: string[];
  format: IdeaFormat;
  status: IdeaStatus;
  suggested_keywords: string[];
  created_at: string;
}

export interface AnalyticsSnapshot {
  id: string;
  channel_id: string;
  snapshot_date: string;
  views: number;
  watch_time_hours: number;
  avg_view_duration_seconds: number;
  impressions: number | null;
  ctr_percent: number | null;
  subscribers_gained: number;
  metrics_payload?: Json;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_tier: PlanTier;
  status: "active" | "canceled" | "past_due" | "trialing";
  current_period_start: string;
  current_period_end: string;
  created_at: string;
  updated_at: string;
}

export interface UsageRecord {
  id: string;
  user_id: string;
  period_date: string; // YYYY-MM
  metadata_generations_count: number;
  ai_ideas_count: number;
  video_uploads_count: number;
  connected_channels_count: number;
  created_at: string;
  updated_at: string;
}
