import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { getOAuth2Client } from "@/lib/youtube/oauth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const channelId = searchParams.get("channelId");
    const pageToken = searchParams.get("pageToken") || undefined;
    const maxResults = Math.min(50, Math.max(1, parseInt(searchParams.get("maxResults") || "20", 10)));

    const supabase = createClient();
    let user = null;
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const { data } = await supabase.auth.getUser(token);
      user = data?.user || null;
    }
    if (!user) {
      const { data } = await supabase.auth.getUser();
      user = data?.user || null;
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required to fetch channel videos." },
        { status: 401 }
      );
    }

    if (!channelId) {
      return NextResponse.json(
        { success: false, error: "channelId is required." },
        { status: 400 }
      );
    }

    // Look up channel in connected_channels table for this authenticated user
    const serviceClient = createServiceRoleClient();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(channelId);

    let query = serviceClient
      .from("connected_channels")
      .select("id, youtube_channel_id, refresh_token, access_token, title")
      .eq("user_id", user.id);

    if (isUuid) {
      query = query.or(`id.eq.${channelId},youtube_channel_id.eq.${channelId}`);
    } else {
      query = query.eq("youtube_channel_id", channelId);
    }

    const { data: channelRow, error: dbError } = await query.maybeSingle();

    if (dbError || !channelRow) {
      return NextResponse.json(
        { success: false, error: "Connected channel not found for this user account." },
        { status: 404 }
      );
    }

    if (!channelRow.refresh_token && !channelRow.access_token) {
      return NextResponse.json({
        success: true,
        videos: [],
        isLive: false,
        message: "No active OAuth tokens associated with this channel.",
      });
    }

    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({
      refresh_token: channelRow.refresh_token,
      access_token: channelRow.access_token,
    });

    const youtube = google.youtube({ version: "v3", auth: oauth2Client });

    // 1. Fetch channel's uploads playlist
    const channelRes = await youtube.channels.list({
      part: ["contentDetails", "snippet"],
      id: channelRow.youtube_channel_id ? [channelRow.youtube_channel_id] : undefined,
      mine: channelRow.youtube_channel_id ? undefined : true,
    });

    const channelItem = channelRes.data.items?.[0];
    const uploadsPlaylistId = channelItem?.contentDetails?.relatedPlaylists?.uploads;

    if (!uploadsPlaylistId) {
      return NextResponse.json({
        success: true,
        videos: [],
        isLive: true,
        message: "No uploads playlist found for this channel.",
      });
    }

    // 2. Fetch playlist items (videos)
    const playlistRes = await youtube.playlistItems.list({
      part: ["snippet", "contentDetails"],
      playlistId: uploadsPlaylistId,
      maxResults,
      pageToken,
    });

    const items = playlistRes.data.items || [];
    const videoIds = items
      .map((item) => item.contentDetails?.videoId)
      .filter(Boolean) as string[];

    if (videoIds.length === 0) {
      return NextResponse.json({
        success: true,
        videos: [],
        nextPageToken: playlistRes.data.nextPageToken || null,
        prevPageToken: playlistRes.data.prevPageToken || null,
        totalResults: playlistRes.data.pageInfo?.totalResults || 0,
        isLive: true,
      });
    }

    // 3. Fetch full statistics and status for each video
    const videosRes = await youtube.videos.list({
      part: ["snippet", "statistics", "contentDetails", "status"],
      id: videoIds,
    });

    const realVideos = (videosRes.data.items || []).map((v) => ({
      id: v.id || "",
      youtube_video_id: v.id || "",
      title: v.snippet?.title || "Untitled Video",
      description: v.snippet?.description || "",
      published_at: v.snippet?.publishedAt || null,
      thumbnail_url:
        v.snippet?.thumbnails?.high?.url ||
        v.snippet?.thumbnails?.medium?.url ||
        v.snippet?.thumbnails?.default?.url ||
        "",
      tags: v.snippet?.tags || [],
      privacy_status: v.status?.privacyStatus || "public",
      status: "published",
      duration: v.contentDetails?.duration || "PT0S",
      views: parseInt(v.statistics?.viewCount || "0", 10),
      likes: parseInt(v.statistics?.likeCount || "0", 10),
      comments: parseInt(v.statistics?.commentCount || "0", 10),
      is_live_youtube_data: true,
    }));

    return NextResponse.json({
      success: true,
      videos: realVideos,
      nextPageToken: playlistRes.data.nextPageToken || null,
      prevPageToken: playlistRes.data.prevPageToken || null,
      totalResults: playlistRes.data.pageInfo?.totalResults || realVideos.length,
      isLive: true,
      dataSource: "Official YouTube Data API v3",
    });
  } catch (error: any) {
    console.error("Fetch Real YouTube Videos Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to fetch real channel videos from YouTube Data API.",
      },
      { status: 500 }
    );
  }
}
