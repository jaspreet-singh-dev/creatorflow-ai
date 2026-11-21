import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateChannelIdeas } from "@/lib/ai/gemini";
import { verifyApiAuth } from "@/lib/auth/server-auth";

const ideasSchema = z.object({
  niche: z.string().min(2, "Channel niche is required"),
  channelTitle: z.string().optional(),
  recentVideoTopics: z.array(z.string()).optional(),
  subscriberCount: z.number().optional(),
  targetAudience: z.string().optional(),
  preferredFormat: z.string().optional(),
});

export async function POST(req: NextRequest) {
  // 1. Authenticate Request
  const auth = await verifyApiAuth(req);
  if (!auth.authenticated) {
    return NextResponse.json(
      { success: false, error: auth.error || "Authentication required." },
      { status: 401 }
    );
  }

  // 2. Validate and Execute
  try {
    const body = await req.json();
    const validatedData = ideasSchema.parse(body);

    const result = await generateChannelIdeas(validatedData);

    return NextResponse.json({
      success: true,
      ideas: result.ideas,
      data: result.ideas,
      isHeuristicFallback: result.isHeuristicFallback,
      attributionNotice: result.attributionNotice,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to generate channel ideas" },
      { status: 500 }
    );
  }
}
