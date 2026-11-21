import { NextRequest, NextResponse } from "next/server";
import { generateAuthUrl, signOAuthState } from "@/lib/youtube/oauth";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;

    // Check if Google Client ID is configured
    if (!clientId || clientId.startsWith("your-google-client-id")) {
      return NextResponse.json({
        configured: false,
        message: "Google OAuth credentials are not set in .env.local.",
        authUrl: null,
      });
    }

    const { searchParams } = new URL(req.url);
    const stateParam = searchParams.get("state") || undefined;

    // Resolve authenticated user from session cookie; never use demo user
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let targetUserId: string | null = null;
    if (user?.id && !user.id.startsWith("demo-")) {
      targetUserId = user.id;
    } else if (stateParam && !stateParam.startsWith("demo-")) {
      targetUserId = stateParam.includes(":") ? stateParam.split(":")[0] : stateParam;
    }

    if (!targetUserId) {
      return NextResponse.json(
        { error: "Authentication required to generate YouTube authorization URL." },
        { status: 401 }
      );
    }

    // Generate cryptographically secure, short-lived, single-use signed state
    const state = signOAuthState(targetUserId);

    const origin = req.nextUrl.origin || process.env.NEXT_PUBLIC_APP_URL;
    const redirectUri = origin ? `${origin}/api/youtube/callback` : undefined;
    const authUrl = generateAuthUrl(state, redirectUri);

    return NextResponse.json({
      configured: true,
      authUrl,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to generate OAuth URL" },
      { status: 500 }
    );
  }
}
