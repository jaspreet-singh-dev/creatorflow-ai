import { google } from "googleapis";

export const YOUTUBE_SCOPES = [
  "https://www.googleapis.com/auth/youtube.upload",
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/yt-analytics.readonly",
];

export function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.YOUTUBE_REDIRECT_URI || "http://localhost:3000/api/youtube/callback";

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export function generateAuthUrl(state?: string): string {
  const oauth2Client = getOAuth2Client();

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: YOUTUBE_SCOPES,
    include_granted_scopes: true,
    prompt: "consent", // Ensures refresh token is returned
    state,
  });
}

export async function exchangeCodeForTokens(code: string) {
  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  // Fetch YouTube Channel Details
  const youtube = google.youtube({ version: "v3", auth: oauth2Client });
  const response = await youtube.channels.list({
    part: ["snippet", "statistics"],
    mine: true,
  });

  const channel = response.data.items?.[0];
  if (!channel) {
    throw new Error("No YouTube channel found associated with this Google account.");
  }

  return {
    tokens,
    channelData: {
      youtube_channel_id: channel.id || "",
      title: channel.snippet?.title || "Untitled Channel",
      custom_url: channel.snippet?.customUrl || null,
      thumbnail_url: channel.snippet?.thumbnails?.default?.url || null,
      subscriber_count: parseInt(channel.statistics?.subscriberCount || "0", 10),
      video_count: parseInt(channel.statistics?.videoCount || "0", 10),
      view_count: parseInt(channel.statistics?.viewCount || "0", 10),
    },
  };
}
