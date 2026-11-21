import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens, verifyOAuthState } from "@/lib/youtube/oauth";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const state = searchParams.get("state");

  const baseUrl = req.nextUrl.origin || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (error || !code) {
    return NextResponse.redirect(
      `${baseUrl}/dashboard/channels?error=${encodeURIComponent(error || "Authorization cancelled by user")}`
    );
  }

  try {
    const redirectUri = `${baseUrl}/api/youtube/callback`;
    const { tokens, channelData } = await exchangeCodeForTokens(code, redirectUri);

    // 1. Resolve and authenticate user with strict session-to-state binding
    let sessionUserId: string | null = null;
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        sessionUserId = user.id;
      }
    } catch {
      // Continue to state check
    }

    const verifiedState = verifyOAuthState(state);
    const stateUserId = verifiedState?.userId || null;

    // Strict cross-tenant protection: if session user and state user are both present, they MUST match!
    if (sessionUserId && stateUserId && sessionUserId !== stateUserId) {
      console.error(`Cross-tenant OAuth mismatch: session user ${sessionUserId} !== state user ${stateUserId}`);
      return NextResponse.redirect(
        `${baseUrl}/dashboard/channels?error=${encodeURIComponent("Security Violation: OAuth session state mismatch. Channel connection aborted.")}`
      );
    }

    const effectiveUserId = sessionUserId || stateUserId;

    if (!effectiveUserId || effectiveUserId.startsWith("demo-")) {
      console.warn("OAuth callback rejected: no valid authenticated user or demo user attempted connection.");
      return NextResponse.redirect(
        `${baseUrl}/dashboard/channels?error=${encodeURIComponent("Please sign in to your verified CreatorFlow account first so your YouTube channel can be safely linked.")}`
      );
    }

    // 2. Save or update channel in Supabase using the service role client on this server route
    const serviceClient = createServiceRoleClient();

    // Verify or auto-upsert user profile in public.profiles
    let { data: userProfile } = await serviceClient
      .from("profiles")
      .select("id, email")
      .eq("id", effectiveUserId)
      .maybeSingle();

    if (!userProfile) {
      // Fetch user from auth.users and ensure profile exists
      const { data: authUser } = await serviceClient.auth.admin.getUserById(effectiveUserId);
      if (authUser?.user) {
        const { data: newProfile } = await serviceClient
          .from("profiles")
          .upsert({
            id: effectiveUserId,
            email: authUser.user.email || "creator@creatorflow.ai",
            full_name: authUser.user.user_metadata?.full_name || "Creator",
            plan_tier: "creator",
          })
          .select("id, email")
          .maybeSingle();
        userProfile = newProfile;
      }
    }

    if (!userProfile) {
      return NextResponse.redirect(
        `${baseUrl}/dashboard/channels?error=${encodeURIComponent("User account not found in database. Please register or sign in.")}`
      );
    }

    // Retain existing refresh token if Google does not return a new one on re-authorization
    let refreshTokenToStore = tokens.refresh_token;

    if (!refreshTokenToStore) {
      const { data: existingChannel } = await serviceClient
        .from("connected_channels")
        .select("refresh_token")
        .eq("user_id", effectiveUserId)
        .eq("youtube_channel_id", channelData.youtube_channel_id)
        .maybeSingle();

      if (existingChannel?.refresh_token) {
        refreshTokenToStore = existingChannel.refresh_token;
      }
    }

    const channelRecord: Record<string, any> = {
      user_id: effectiveUserId,
      youtube_channel_id: channelData.youtube_channel_id,
      title: channelData.title,
      custom_url: channelData.custom_url,
      thumbnail_url: channelData.thumbnail_url,
      subscriber_count: channelData.subscriber_count,
      video_count: channelData.video_count,
      view_count: channelData.view_count,
      access_token: tokens.access_token,
      token_expires_at: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
      is_active: true,
      updated_at: new Date().toISOString(),
    };

    if (refreshTokenToStore) {
      channelRecord.refresh_token = refreshTokenToStore;
    }

    const { error: upsertError } = await serviceClient
      .from("connected_channels")
      .upsert(channelRecord, {
        onConflict: "user_id, youtube_channel_id",
      });

    if (upsertError) {
      console.error("Database error saving connected channel:", upsertError);
      throw new Error(`Database error saving channel: ${upsertError.message}`);
    }

    return NextResponse.redirect(
      `${baseUrl}/dashboard/channels?success=true&channel=${encodeURIComponent(channelData.title)}`
    );
  } catch (err: any) {
    console.error("OAuth callback error:", err);
    return NextResponse.redirect(
      `${baseUrl}/dashboard/channels?error=${encodeURIComponent(err.message || "Failed to link channel")}`
    );
  }
}
