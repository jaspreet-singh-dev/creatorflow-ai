import { google } from "googleapis";
import { getOAuth2Client } from "./oauth";

export interface AnalyticsQueryOptions {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  metrics: string[];
  dimensions?: string[];
  channelId?: string;
  refreshToken?: string;
  accessToken?: string;
}

export async function fetchYouTubeAnalytics(options: AnalyticsQueryOptions) {
  const oauth2Client = getOAuth2Client();

  if (options.refreshToken) {
    oauth2Client.setCredentials({
      refresh_token: options.refreshToken,
      access_token: options.accessToken,
    });
  }

  const analytics = google.youtubeAnalytics({ version: "v2", auth: oauth2Client });

  try {
    const response = await analytics.reports.query({
      ids: "channel==MINE",
      startDate: options.startDate,
      endDate: options.endDate,
      metrics: options.metrics.join(","),
      dimensions: options.dimensions?.join(","),
    });

    return {
      isLive: true,
      data: response.data,
    };
  } catch (err: any) {
    return {
      isLive: false,
      error: err.message,
    };
  }
}
