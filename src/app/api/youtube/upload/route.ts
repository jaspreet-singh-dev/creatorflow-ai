import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { initiateYouTubeResumableUpload, verifyYouTubeVideoUploaded } from "@/lib/youtube/upload";
import { verifyApiAuth } from "@/lib/auth/server-auth";
import { createClient } from "@/lib/supabase/server";

const uploadSchema = z.object({
  action: z.enum(["initiate", "verify"]).default("initiate"),
  title: z.string().min(2, "Title is required").optional().default("Untitled Video"),
  description: z.string().default(""),
  tags: z.array(z.string()).default([]),
  privacyStatus: z.enum(["private", "unlisted", "public"]).default("private"),
  selfDeclaredMadeForKids: z.boolean().default(false),
  categoryId: z.string().default("28"),
  publishAt: z.string().nullable().optional(),
  channelId: z.string().optional(),
  fileSize: z.number().optional().default(1000000),
  fileType: z.string().optional().default("video/mp4"),
  videoId: z.string().optional(),
  projectId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  // 1. Authenticate Request
  const auth = await verifyApiAuth(req);
  if (!auth.authenticated) {
    return NextResponse.json(
      { success: false, error: auth.error || "Authentication required to upload videos." },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const validated = uploadSchema.parse(body);

    const isDemo =
      !validated.channelId ||
      validated.channelId.startsWith("chan-demo") ||
      auth.userId?.startsWith("demo-") ||
      !process.env.GOOGLE_CLIENT_ID ||
      process.env.GOOGLE_CLIENT_ID.startsWith("YourGoogleClientId");

    // -------------------------------------------------------------------------
    // ACTION 1: VERIFY EXISTING UPLOAD
    // -------------------------------------------------------------------------
    if (validated.action === "verify") {
      if (!validated.videoId) {
        return NextResponse.json(
          { success: false, error: "videoId is required for verification." },
          { status: 400 }
        );
      }

      if (isDemo || validated.videoId.startsWith("demo_") || validated.videoId.startsWith("yt_demo")) {
        return NextResponse.json({
          success: true,
          verified: true,
          isDemo: true,
          notice: "Verified in demo sandbox mode. Simulated video record accepted.",
        });
      }

      // Live verification via YouTube API
      const supabase = createClient();
      let channelQuery = supabase
        .from("connected_channels")
        .select("access_token")
        .eq("id", validated.channelId);

      // Enforce multi-tenant channel ownership verification
      if (auth.userId && !auth.userId.startsWith("demo-")) {
        channelQuery = channelQuery.eq("user_id", auth.userId);
      }

      const { data: channel, error: channelErr } = await channelQuery.single();

      if (!channel?.access_token || channelErr) {
        return NextResponse.json(
          {
            success: false,
            verified: false,
            error: "Channel access token not found or channel unauthorized for this user account.",
          },
          { status: 403 }
        );
      }

      const verifyRes = await verifyYouTubeVideoUploaded(validated.videoId, channel.access_token);
      return NextResponse.json({
        success: verifyRes.verified,
        ...verifyRes,
      });
    }

    // -------------------------------------------------------------------------
    // ACTION 2: INITIATE RESUMABLE UPLOAD SESSION
    // -------------------------------------------------------------------------
    let accessToken: string | null = null;
    let refreshToken: string | null = null;
    let tokenExpiresAt: string | null = null;

    if (!isDemo && validated.channelId) {
      const supabase = createClient();
      let channelQuery = supabase
        .from("connected_channels")
        .select("access_token, refresh_token, token_expires_at")
        .eq("id", validated.channelId);

      // Strictly verify that the channel belongs to the authenticated user
      if (auth.userId && !auth.userId.startsWith("demo-")) {
        channelQuery = channelQuery.eq("user_id", auth.userId);
      }

      const { data: channel, error: channelErr } = await channelQuery.single();

      if (!channel || channelErr) {
        return NextResponse.json(
          {
            success: false,
            error: "Channel not found or does not belong to your user account.",
          },
          { status: 403 }
        );
      }

      accessToken = channel.access_token;
      refreshToken = channel.refresh_token;
      tokenExpiresAt = channel.token_expires_at;
    }

    const session = await initiateYouTubeResumableUpload({
      title: validated.title,
      description: validated.description,
      tags: validated.tags,
      privacyStatus: validated.privacyStatus,
      selfDeclaredMadeForKids: validated.selfDeclaredMadeForKids,
      categoryId: validated.categoryId,
      publishAt: validated.publishAt || null,
      fileSize: validated.fileSize,
      fileType: validated.fileType,
      accessToken,
      refreshToken,
      tokenExpiresAt,
      isDemo,
    });

    if (!session.success) {
      return NextResponse.json(
        { success: false, error: session.error || "Failed to initiate YouTube upload session." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        uploadUrl: session.uploadUrl,
        accessToken: session.accessToken || undefined,
        isDemo: session.isDemo,
        scheduledOnYouTube: session.scheduledOnYouTube,
        uploadJobId: `job-${Date.now()}`,
        status: validated.publishAt ? "scheduled" : "uploading",
        videoSnippet: session.videoSnippet,
        videoStatus: session.videoStatus,
      },
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: err.errors[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to initiate upload" },
      { status: 500 }
    );
  }
}
