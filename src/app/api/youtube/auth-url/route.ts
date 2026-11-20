import { NextRequest, NextResponse } from "next/server";
import { generateAuthUrl } from "@/lib/youtube/oauth";

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
    const state = searchParams.get("state") || undefined;

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
