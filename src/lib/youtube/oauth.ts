import { google } from "googleapis";
import crypto from "crypto";

export const YOUTUBE_SCOPES = [
  "https://www.googleapis.com/auth/youtube.upload",
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/yt-analytics.readonly",
];

// In-memory set of used nonces to guarantee single-use OAuth states
const usedOAuthNonces = new Set<string>();

/**
 * Generates a cryptographically secure, short-lived, single-use signed OAuth state.
 * Format: userId:timestamp:nonce:hmac
 */
export function signOAuthState(userId: string): string {
  const secret = process.env.GOOGLE_CLIENT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "cf-oauth-secret-salt";
  const timestamp = Date.now().toString();
  const nonce = crypto.randomBytes(12).toString("hex");
  const payload = `${userId}:${timestamp}:${nonce}`;
  const hmac = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}:${hmac}`;
}

export interface VerifiedOAuthState {
  userId: string;
  timestamp: number;
}

/**
 * Verifies that the OAuth state is authentic, has not expired (10 min TTL),
 * and has not been used previously (single-use replay protection).
 */
export function verifyOAuthState(state?: string | null): VerifiedOAuthState | null {
  if (!state) return null;
  const parts = state.split(":");
  if (parts.length < 2) return null;

  const secret = process.env.GOOGLE_CLIENT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "cf-oauth-secret-salt";

  // Modern 4-part state: userId:timestamp:nonce:hmac
  if (parts.length === 4) {
    const [userId, timestampStr, nonce, hmac] = parts;
    const timestamp = parseInt(timestampStr, 10);

    // 1. Validate timestamp and 10-minute maximum lifespan
    const now = Date.now();
    if (isNaN(timestamp) || now - timestamp > 10 * 60 * 1000 || timestamp > now + 60 * 1000) {
      console.warn("OAuth security warning: State has expired or has future timestamp");
      return null;
    }

    // 2. Single-use enforcement: check if nonce was already consumed
    if (usedOAuthNonces.has(nonce)) {
      console.warn("OAuth security warning: Replay attack prevented (nonce already used)");
      return null;
    }

    // 3. Cryptographic HMAC verification
    const payload = `${userId}:${timestampStr}:${nonce}`;
    const expectedHmac = crypto.createHmac("sha256", secret).update(payload).digest("hex");

    try {
      if (crypto.timingSafeEqual(Buffer.from(hmac, "hex"), Buffer.from(expectedHmac, "hex"))) {
        // Mark nonce consumed
        usedOAuthNonces.add(nonce);
        // Automatically prune nonce after 15 minutes
        setTimeout(() => usedOAuthNonces.delete(nonce), 15 * 60 * 1000);
        return { userId, timestamp };
      }
    } catch {
      return null;
    }
    return null;
  }

  // Backwards compatibility for legacy 2-part format userId:hmac
  if (parts.length === 2) {
    const [userId, hmac] = parts;
    const expectedHmac = crypto.createHmac("sha256", secret).update(userId).digest("hex");
    try {
      if (crypto.timingSafeEqual(Buffer.from(hmac, "hex"), Buffer.from(expectedHmac, "hex"))) {
        return { userId, timestamp: Date.now() };
      }
    } catch {
      return null;
    }
  }

  return null;
}

export function getOAuth2Client(customRedirectUri?: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const redirectUri = customRedirectUri || process.env.YOUTUBE_REDIRECT_URI || `${baseUrl}/api/youtube/callback`;

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export function generateAuthUrl(state?: string, customRedirectUri?: string): string {
  const oauth2Client = getOAuth2Client(customRedirectUri);

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: YOUTUBE_SCOPES,
    include_granted_scopes: true,
    prompt: "consent", // Ensures refresh token is returned
    state,
  });
}

export async function exchangeCodeForTokens(code: string, customRedirectUri?: string) {
  const oauth2Client = getOAuth2Client(customRedirectUri);
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

export interface TokenRefreshResult {
  accessToken: string;
  refreshToken?: string;
  expiryDate?: number;
  refreshed: boolean;
  error?: string;
}

// In-flight mutex to protect against simultaneous refresh requests
const inflightRefreshes = new Map<string, Promise<TokenRefreshResult>>();

/**
 * Refreshes an expired YouTube OAuth access token using the stored refresh token.
 * Safe under simultaneous parallel requests and retains existing refresh token
 * if Google does not issue a replacement.
 */
export async function refreshChannelAccessToken(
  refreshToken: string,
  customRedirectUri?: string
): Promise<TokenRefreshResult> {
  const cacheKey = `${refreshToken}_${customRedirectUri || "default"}`;
  const existingInflight = inflightRefreshes.get(cacheKey);
  if (existingInflight) {
    return existingInflight;
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret || clientId === "YourGoogleClientIdHere" || clientSecret.startsWith("YourGoogleClientSecret")) {
    return {
      accessToken: "",
      refreshToken,
      refreshed: false,
      error: "Google OAuth Client ID and Secret must be configured in Settings to refresh live tokens.",
    };
  }

  const refreshPromise = (async (): Promise<TokenRefreshResult> => {
    try {
      const oauth2Client = getOAuth2Client(customRedirectUri);
      oauth2Client.setCredentials({ refresh_token: refreshToken });

      const { credentials } = await oauth2Client.refreshAccessToken();
      if (!credentials.access_token) {
        throw new Error("No access token returned by Google OAuth server.");
      }

      return {
        accessToken: credentials.access_token,
        // Retain existing refresh token if Google did not return a replacement
        refreshToken: credentials.refresh_token || refreshToken,
        expiryDate: credentials.expiry_date ?? undefined,
        refreshed: true,
      };
    } catch (err: any) {
      const errorMsg = err?.response?.data?.error_description || err?.message || "Failed to refresh token.";
      return {
        accessToken: "",
        refreshToken,
        refreshed: false,
        error: errorMsg.includes("invalid_grant")
          ? "YouTube channel authorization expired or revoked. Please reconnect the channel in Settings."
          : `OAuth refresh error: ${errorMsg}`,
      };
    }
  })();

  inflightRefreshes.set(cacheKey, refreshPromise);
  try {
    return await refreshPromise;
  } finally {
    inflightRefreshes.delete(cacheKey);
  }
}

/**
 * Validates whether an access token is expired (or expires within 5 minutes) and refreshes it if needed.
 */
export async function getValidChannelAccessToken(params: {
  accessToken?: string | null;
  refreshToken?: string | null;
  tokenExpiresAt?: string | null;
}): Promise<TokenRefreshResult> {
  const { accessToken, refreshToken, tokenExpiresAt } = params;

  // Check if token exists and is valid for at least 5 more minutes
  if (accessToken && tokenExpiresAt) {
    const expiresMs = new Date(tokenExpiresAt).getTime();
    const nowMs = Date.now();
    const fiveMinutesMs = 5 * 60 * 1000;

    if (expiresMs - nowMs > fiveMinutesMs) {
      return {
        accessToken,
        refreshToken: refreshToken || undefined,
        expiryDate: expiresMs,
        refreshed: false,
      };
    }
  }

  // If expired or missing, refresh using refresh_token
  if (refreshToken) {
    return refreshChannelAccessToken(refreshToken);
  }

  return {
    accessToken: "",
    refreshed: false,
    error: "No refresh token available. Reconnect your YouTube channel to authorize uploads.",
  };
}
