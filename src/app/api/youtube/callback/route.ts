import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens } from "@/lib/youtube/oauth";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  const baseUrl = req.nextUrl.origin || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (error || !code) {
    return NextResponse.redirect(`${baseUrl}/dashboard/channels?error=${encodeURIComponent(error || "Authorization cancelled")}`);
  }

  try {
    const redirectUri = `${baseUrl}/api/youtube/callback`;
    const { tokens, channelData } = await exchangeCodeForTokens(code, redirectUri);

    // Save or update channel in Supabase
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      await supabase.from("connected_channels").upsert({
        user_id: user.id,
        youtube_channel_id: channelData.youtube_channel_id,
        title: channelData.title,
        custom_url: channelData.custom_url,
        thumbnail_url: channelData.thumbnail_url,
        subscriber_count: channelData.subscriber_count,
        video_count: channelData.video_count,
        view_count: channelData.view_count,
        refresh_token: tokens.refresh_token,
        access_token: tokens.access_token,
        token_expires_at: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
        is_active: true,
      }, { onConflict: "user_id, youtube_channel_id" });
    }

    return NextResponse.redirect(`${baseUrl}/dashboard/channels?success=true&channel=${encodeURIComponent(channelData.title)}`);
  } catch (err: any) {
    console.error("OAuth callback error:", err);
    return NextResponse.redirect(`${baseUrl}/dashboard/channels?error=${encodeURIComponent(err.message || "Failed to link channel")}`);
  }
}
