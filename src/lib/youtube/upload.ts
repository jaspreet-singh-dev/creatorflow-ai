import { google } from "googleapis";
import { getOAuth2Client, getValidChannelAccessToken } from "./oauth.ts";
import type { VideoPrivacy } from "@/types/database.types";

/**
 * Official YouTube Data API v3 Quota Allocation Model:
 * 
 * - videos.insert: 1 unit per call in its dedicated upload quota bucket.
 *   Default daily upload limit: 100 calls/day.
 * - videos.list: 1 unit per call (general quota).
 * - channels.list: 1 unit per call (general quota).
 * - thumbnails.set: 50 units per call (general quota).
 * - Resumable chunk streaming (PUT to session URL): 0 units.
 * - General daily project quota bucket: 10,000 units/day (for reads, searches, and thumbnails).
 * 
 * Note: Video uploads (videos.insert) operate against their own dedicated daily call limit (100/day)
 * and do not consume 1,600 units from the general 10,000-unit allocation.
 */
export const YOUTUBE_QUOTA_MODEL = {
  videosInsertCost: 1, // 1 unit in dedicated upload bucket
  videosInsertDailyLimit: 100, // 100 upload calls/day limit
  videosListCost: 1, // 1 unit in general bucket
  channelsListCost: 1, // 1 unit in general bucket
  thumbnailsSetCost: 50, // 50 units in general bucket
  resumableChunkPutCost: 0, // 0 units
  generalDailyQuotaLimit: 10000, // 10,000 units/day general bucket
} as const;

export interface InitiateUploadParams {
  title: string;
  description: string;
  tags: string[];
  privacyStatus: VideoPrivacy;
  selfDeclaredMadeForKids?: boolean;
  publishAt?: string | null; // ISO string for YouTube official scheduling
  fileSize: number;
  fileType?: string;
  categoryId?: string;
  accessToken?: string | null;
  refreshToken?: string | null;
  tokenExpiresAt?: string | null;
  isDemo?: boolean;
}

export interface MetadataValidationResult {
  valid: boolean;
  errors: string[];
  sanitized: {
    title: string;
    description: string;
    tags: string[];
  };
}

/**
 * Validates metadata against official YouTube Data API v3 constraints:
 * - Titles must be <= 100 characters and contain no '<' or '>'
 * - Descriptions must be <= 5000 characters and contain no '<' or '>'
 * - Combined tags length must be <= 500 characters and contain no '<' or '>'
 */
export function validateYouTubeMetadata(params: {
  title: string;
  description?: string;
  tags?: string[];
}): MetadataValidationResult {
  const errors: string[] = [];
  const rawTitle = (params.title || "").trim();
  const rawDescription = (params.description || "").trim();
  const rawTags = (params.tags || []).map((t) => t.trim()).filter(Boolean);

  if (!rawTitle) {
    errors.push("Video title cannot be empty.");
  } else if (rawTitle.length > 100) {
    errors.push(`Video title cannot exceed 100 characters (currently ${rawTitle.length}).`);
  }
  if (/[<>]/.test(rawTitle)) {
    errors.push("YouTube rejects '<' and '>' characters in video titles.");
  }

  if (rawDescription.length > 5000) {
    errors.push(`Video description cannot exceed 5,000 characters (currently ${rawDescription.length}).`);
  }
  if (/[<>]/.test(rawDescription)) {
    errors.push("YouTube rejects '<' and '>' characters in video descriptions.");
  }

  const combinedTags = rawTags.join(",");
  if (combinedTags.length > 500) {
    errors.push(`Combined tags length cannot exceed 500 characters (currently ${combinedTags.length}).`);
  }
  for (const tag of rawTags) {
    if (/[<>]/.test(tag)) {
      errors.push(`Tag "${tag}" contains invalid '<' or '>' characters.`);
      break;
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized: {
      title: rawTitle.replace(/[<>]/g, "").slice(0, 100),
      description: rawDescription.replace(/[<>]/g, "").slice(0, 5000),
      tags: rawTags.map((t) => t.replace(/[<>]/g, "")).filter(Boolean),
    },
  };
}

export interface ResumableSessionResult {
  success: boolean;
  uploadUrl?: string | null;
  accessToken?: string | null; // Short-lived access token for media PUT authorization; refresh token is never exposed
  isDemo: boolean;
  scheduledOnYouTube: boolean;
  videoSnippet: {
    title: string;
    description: string;
    tags: string[];
    categoryId: string;
  };
  videoStatus: {
    privacyStatus: string;
    selfDeclaredMadeForKids: boolean;
    publishAt?: string | null;
  };
  error?: string;
}

/**
 * Initiates an official YouTube Data API v3 Resumable Upload session.
 * Returns the Google-issued unique resumable session URL (Location header)
 * which supports direct chunked PUT uploads.
 */
export async function initiateYouTubeResumableUpload(
  params: InitiateUploadParams
): Promise<ResumableSessionResult> {
  const isDemo = Boolean(params.isDemo) || !params.refreshToken;

  // 1. Validate YouTube Metadata Constraints
  const validation = validateYouTubeMetadata({
    title: params.title,
    description: params.description,
    tags: params.tags,
  });

  const videoSnippet = {
    title: validation.sanitized.title || "Untitled Video",
    description: validation.sanitized.description || "",
    tags: validation.sanitized.tags || [],
    categoryId: params.categoryId || "28", // Science & Technology default
  };

  // 2. Validate Publishing & Audience Declarations
  // YouTube Data API rules:
  // - Scheduled videos require status.privacyStatus = 'private' and publishAt defined in RFC 3339 format
  // - selfDeclaredMadeForKids must reflect explicit creator declaration
  const videoStatus: {
    privacyStatus: string;
    selfDeclaredMadeForKids: boolean;
    publishAt?: string | null;
  } = {
    privacyStatus: params.publishAt ? "private" : params.privacyStatus,
    selfDeclaredMadeForKids: Boolean(params.selfDeclaredMadeForKids),
  };

  if (params.publishAt) {
    const scheduledTime = new Date(params.publishAt).getTime();
    if (isNaN(scheduledTime) || scheduledTime <= Date.now()) {
      return {
        success: false,
        isDemo,
        scheduledOnYouTube: false,
        videoSnippet,
        videoStatus,
        error: "Scheduled release date must be a valid future timestamp.",
      };
    }
    videoStatus.publishAt = params.publishAt;
  }

  if (!validation.valid) {
    return {
      success: false,
      isDemo,
      scheduledOnYouTube: Boolean(params.publishAt),
      videoSnippet,
      videoStatus,
      error: `Metadata validation error: ${validation.errors.join("; ")}`,
    };
  }

  // If in demo mode (no credentials or demo channel), return safe simulated session
  if (isDemo) {
    return {
      success: true,
      uploadUrl: null,
      isDemo: true,
      scheduledOnYouTube: Boolean(params.publishAt),
      videoSnippet,
      videoStatus,
    };
  }

  // Live YouTube Mode: Obtain valid Google OAuth Access Token
  const tokenResult = await getValidChannelAccessToken({
    accessToken: params.accessToken,
    refreshToken: params.refreshToken,
    tokenExpiresAt: params.tokenExpiresAt,
  });

  if (!tokenResult.accessToken) {
    return {
      success: false,
      isDemo: false,
      scheduledOnYouTube: false,
      videoSnippet,
      videoStatus,
      error: tokenResult.error || "Could not authorize upload with YouTube. Please reconnect channel.",
    };
  }

  try {
    // Initiate Resumable Session with Google's official upload endpoint
    const initResponse = await fetch(
      "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenResult.accessToken}`,
          "Content-Type": "application/json; charset=UTF-8",
          "X-Upload-Content-Length": String(params.fileSize || 0),
          "X-Upload-Content-Type": params.fileType || "video/mp4",
        },
        body: JSON.stringify({
          snippet: videoSnippet,
          status: videoStatus,
        }),
      }
    );

    if (initResponse.status === 200 || initResponse.status === 201) {
      const uploadUrl = initResponse.headers.get("location");
      if (!uploadUrl) {
        throw new Error("YouTube API did not return a resumable session URI.");
      }

      return {
        success: true,
        uploadUrl,
        accessToken: tokenResult.accessToken,
        isDemo: false,
        scheduledOnYouTube: Boolean(params.publishAt),
        videoSnippet,
        videoStatus,
      };
    }

    // Handle Google API Errors
    let errorDetail = `HTTP ${initResponse.status} ${initResponse.statusText}`;
    try {
      const errJson = await initResponse.json();
      if (errJson.error?.message) {
        errorDetail = errJson.error.message;
      }
      if (errJson.error?.errors?.[0]?.reason === "quotaExceeded") {
        errorDetail = "YouTube Data API daily quota exceeded for this Google Cloud project.";
      } else if (errJson.error?.errors?.[0]?.reason === "uploadLimitExceeded") {
        errorDetail = "YouTube channel daily upload limit reached. Wait 24 hours before uploading again.";
      }
    } catch {
      // ignore json parse error
    }

    return {
      success: false,
      isDemo: false,
      scheduledOnYouTube: false,
      videoSnippet,
      videoStatus,
      error: `YouTube upload initialization failed: ${errorDetail}`,
    };
  } catch (err: any) {
    return {
      success: false,
      isDemo: false,
      scheduledOnYouTube: false,
      videoSnippet,
      videoStatus,
      error: err?.message || "Network error while connecting to YouTube upload servers.",
    };
  }
}

/**
 * Confirms that a video was successfully received and indexed by YouTube Data API v3.
 * Queries YouTube API to prevent false-positive reporting.
 */
export async function verifyYouTubeVideoUploaded(
  videoId: string,
  accessToken: string
) {
  try {
    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({ access_token: accessToken });
    const youtube = google.youtube({ version: "v3", auth: oauth2Client });

    const response = await youtube.videos.list({
      part: ["snippet", "status", "processingDetails"],
      id: [videoId],
    });

    const video = response.data.items?.[0];
    if (!video) {
      return {
        verified: false,
        error: "Video was not found in your YouTube channel.",
      };
    }

    return {
      verified: true,
      video: {
        id: video.id,
        title: video.snippet?.title,
        privacyStatus: video.status?.privacyStatus,
        uploadStatus: video.status?.uploadStatus, // "uploaded", "processed", etc.
      },
    };
  } catch (err: any) {
    return {
      verified: false,
      error: err?.message || "Failed to verify video status with YouTube.",
    };
  }
}
