import { google } from "googleapis";
import { getOAuth2Client } from "./oauth";

export interface AnalyticsDateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

export interface VideoPerformanceMetric {
  videoId: string;
  title: string;
  publishedAt: string;
  views: number;
  likes: number;
  comments: number;
  duration: string;
  thumbnailUrl: string;
}

export interface TrafficSourceMetric {
  sourceType: string;
  label: string;
  views: number;
  estimatedMinutesWatched: number;
  percent: number;
}

export interface ChannelAnalyticsData {
  channelId: string;
  channelTitle: string;
  subscriberCount: number;
  lifetimeViews: number;
  videoCount: number;
  periodViews: number;
  periodWatchTimeMinutes: number;
  periodAvgDurationSeconds: number;
  subscribersGained: number;
  subscribersLost: number;
  netSubscribers: number;
  topVideos: VideoPerformanceMetric[];
  trafficSources: TrafficSourceMetric[];
  isLive: boolean;
  dataSource: string;
  reportingPeriod: string;
  lastSyncedAt: string;
  reportingDelayNotice?: string;
  errorMessage?: string;
}

/**
 * Calculates start and end dates formatted as YYYY-MM-DD for YouTube Analytics queries.
 * Google YouTube Analytics API reports have an official 24-48 hour reporting delay.
 */
export function calculateDateRange(range: "7d" | "28d" | "90d" | "365d"): AnalyticsDateRange {
  const now = new Date();
  // YouTube Analytics requires endDate to be at least 1-2 days prior to guarantee finalised numbers
  const end = new Date(now.getTime() - 2 * 86400000);

  const daysMap = { "7d": 7, "28d": 28, "90d": 90, "365d": 365 };
  const numDays = daysMap[range] || 28;
  const start = new Date(end.getTime() - numDays * 86400000);

  return {
    startDate: start.toISOString().split("T")[0],
    endDate: end.toISOString().split("T")[0],
  };
}

/**
 * Human-friendly labels for official YouTube Analytics traffic source codes
 */
const TRAFFIC_SOURCE_LABELS: Record<string, string> = {
  YT_SEARCH: "YouTube Search & Autocomplete",
  RELATED_VIDEO: "Suggested Videos (Watch Next)",
  SUBSCRIBER: "Browse Features (Home & Subscriptions)",
  YT_CHANNEL: "Channel Pages",
  EXT_URL: "External Links & Social Sites",
  NO_LINK_EMBEDDED: "Direct / Embedded Video Players",
  PLAYLIST: "Playlists & Mixes",
  NOTIFICATION: "YouTube Push Notifications",
  SHORTS: "YouTube Shorts Feed",
  END_SCREEN: "End Screens & Cards",
};

/**
 * Fetches genuine channel analytics and video-by-video statistics
 * using YouTube Data API v3 and YouTube Analytics API v2.
 */
export async function getLiveChannelAnalytics(params: {
  channelId: string;
  refreshToken?: string;
  accessToken?: string;
  range: "7d" | "28d" | "90d" | "365d";
}): Promise<ChannelAnalyticsData> {
  const { channelId, refreshToken, accessToken, range } = params;
  const { startDate, endDate } = calculateDateRange(range);
  const nowIso = new Date().toISOString();

  // If no tokens provided, return clearly marked unlinked status
  if (!refreshToken && !accessToken) {
    return {
      channelId,
      channelTitle: "Unlinked Channel",
      subscriberCount: 0,
      lifetimeViews: 0,
      videoCount: 0,
      periodViews: 0,
      periodWatchTimeMinutes: 0,
      periodAvgDurationSeconds: 0,
      subscribersGained: 0,
      subscribersLost: 0,
      netSubscribers: 0,
      topVideos: [],
      trafficSources: [],
      isLive: false,
      dataSource: "No Active OAuth Credentials",
      reportingPeriod: `${startDate} to ${endDate}`,
      lastSyncedAt: nowIso,
      errorMessage: "YouTube channel is not linked with active OAuth tokens.",
    };
  }

  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    refresh_token: refreshToken,
    access_token: accessToken,
  });

  try {
    const youtube = google.youtube({ version: "v3", auth: oauth2Client });
    const ytAnalytics = google.youtubeAnalytics({ version: "v2", auth: oauth2Client });

    // 1. YouTube Data API v3: Fetch Channel statistics & uploads playlist
    const channelRes = await youtube.channels.list({
      part: ["snippet", "statistics", "contentDetails"],
      mine: true,
    });

    const channelItem = channelRes.data.items?.[0];
    if (!channelItem) {
      throw new Error("No YouTube channel returned for this authorized Google account.");
    }

    const channelTitle = channelItem.snippet?.title || "My Channel";
    const subCount = parseInt(channelItem.statistics?.subscriberCount || "0", 10);
    const totalLifetimeViews = parseInt(channelItem.statistics?.viewCount || "0", 10);
    const totalVideoCount = parseInt(channelItem.statistics?.videoCount || "0", 10);
    const uploadsPlaylistId = channelItem.contentDetails?.relatedPlaylists?.uploads;

    // 2. Fetch Channel Videos & Stats from uploads playlist
    let topVideos: VideoPerformanceMetric[] = [];
    if (uploadsPlaylistId) {
      try {
        const playlistRes = await youtube.playlistItems.list({
          part: ["snippet", "contentDetails"],
          playlistId: uploadsPlaylistId,
          maxResults: 15,
        });

        const videoIds = (playlistRes.data.items || [])
          .map((item) => item.contentDetails?.videoId)
          .filter(Boolean) as string[];

        if (videoIds.length > 0) {
          const videosRes = await youtube.videos.list({
            part: ["snippet", "statistics", "contentDetails"],
            id: videoIds,
          });

          topVideos = (videosRes.data.items || []).map((v) => ({
            videoId: v.id || "",
            title: v.snippet?.title || "Untitled Video",
            publishedAt: v.snippet?.publishedAt || "",
            views: parseInt(v.statistics?.viewCount || "0", 10),
            likes: parseInt(v.statistics?.likeCount || "0", 10),
            comments: parseInt(v.statistics?.commentCount || "0", 10),
            duration: v.contentDetails?.duration || "PT0S",
            thumbnailUrl:
              v.snippet?.thumbnails?.medium?.url ||
              v.snippet?.thumbnails?.default?.url ||
              "",
          }));

          // Sort by highest view count
          topVideos.sort((a, b) => b.views - a.views);
        }
      } catch (videoErr: any) {
        console.warn("Could not retrieve channel videos:", videoErr?.message);
      }
    }

    // 3. YouTube Analytics API v2: Query date-range report
    let periodViews = 0;
    let periodWatchTimeMinutes = 0;
    let periodAvgDurationSeconds = 0;
    let subsGained = 0;
    let subsLost = 0;
    let trafficSources: TrafficSourceMetric[] = [];
    let reportingNotice = "Official YouTube Analytics API v2 data (subject to Google's standard 24–48h processing latency).";

    try {
      const reportRes = await ytAnalytics.reports.query({
        ids: "channel==MINE",
        startDate,
        endDate,
        metrics: "views,estimatedMinutesWatched,averageViewDuration,subscribersGained,subscribersLost",
      });

      const rows = reportRes.data.rows;
      if (rows && rows.length > 0) {
        const row = rows[0];
        periodViews = Number(row[0]) || 0;
        periodWatchTimeMinutes = Number(row[1]) || 0;
        periodAvgDurationSeconds = Number(row[2]) || 0;
        subsGained = Number(row[3]) || 0;
        subsLost = Number(row[4]) || 0;
      }

      // Query Traffic Sources breakdown
      const trafficRes = await ytAnalytics.reports.query({
        ids: "channel==MINE",
        startDate,
        endDate,
        dimensions: "insightTrafficSourceType",
        metrics: "views,estimatedMinutesWatched",
        sort: "-views",
        maxResults: 6,
      });

      const trafficRows = trafficRes.data.rows;
      if (trafficRows && trafficRows.length > 0) {
        const totalTrafficViews = trafficRows.reduce((acc, r) => acc + (Number(r[1]) || 0), 0);
        trafficSources = trafficRows.map((r) => {
          const rawCode = String(r[0]);
          const views = Number(r[1]) || 0;
          const mins = Number(r[2]) || 0;
          const percent = totalTrafficViews > 0 ? Math.round((views / totalTrafficViews) * 100) : 0;
          return {
            sourceType: rawCode,
            label: TRAFFIC_SOURCE_LABELS[rawCode] || rawCode.replace(/_/g, " "),
            views,
            estimatedMinutesWatched: mins,
            percent,
          };
        });
      }
    } catch (analyticsErr: any) {
      reportingNotice = `Analytics API report notice: ${analyticsErr?.message || "Historical metrics currently synchronizing"}`;
      // In case Analytics API report has not finalized for very new accounts, periodViews falls back to lifetime
      periodViews = periodViews || totalLifetimeViews;
    }

    return {
      channelId: channelItem.id || channelId,
      channelTitle,
      subscriberCount: subCount,
      lifetimeViews: totalLifetimeViews,
      videoCount: totalVideoCount,
      periodViews,
      periodWatchTimeMinutes,
      periodAvgDurationSeconds,
      subscribersGained: subsGained,
      subscribersLost: subsLost,
      netSubscribers: subsGained - subsLost,
      topVideos,
      trafficSources,
      isLive: true,
      dataSource: "Official YouTube Data API v3 & Analytics API v2",
      reportingPeriod: `${startDate} to ${endDate}`,
      lastSyncedAt: nowIso,
      reportingDelayNotice: reportingNotice,
    };
  } catch (err: any) {
    console.error("YouTube Analytics fetch error:", err);
    return {
      channelId,
      channelTitle: "Connection Error",
      subscriberCount: 0,
      lifetimeViews: 0,
      videoCount: 0,
      periodViews: 0,
      periodWatchTimeMinutes: 0,
      periodAvgDurationSeconds: 0,
      subscribersGained: 0,
      subscribersLost: 0,
      netSubscribers: 0,
      topVideos: [],
      trafficSources: [],
      isLive: false,
      dataSource: "YouTube API Error",
      reportingPeriod: `${startDate} to ${endDate}`,
      lastSyncedAt: nowIso,
      reportingDelayNotice: "Official Google YouTube Analytics API reports carry a standard 24–48h latency window.",
      errorMessage: err?.message || "Failed to query YouTube API.",
    };
  }
}
