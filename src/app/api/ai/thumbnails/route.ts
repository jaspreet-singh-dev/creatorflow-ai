import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateThumbnailAI } from "@/lib/ai/gemini";
import { verifyApiAuth } from "@/lib/auth/server-auth";

const thumbnailRequestSchema = z.object({
  videoTitle: z.string().optional(),
  topic: z.string().min(2, "Topic must be at least 2 characters"),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  niche: z.string().optional().default("Content Creation"),
  format: z.enum(["long_form", "shorts"]).optional().default("long_form"),
  targetAudience: z.string().optional().default("YouTube Creators & Viewers"),
  channelContext: z
    .object({
      channelTitle: z.string().optional(),
      niche: z.string().optional(),
      subscriberCount: z.number().optional(),
      recentVideoTopics: z.array(z.string()).optional(),
      isDemo: z.boolean().optional(),
    })
    .optional(),
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

  // 2. Validate Body
  try {
    const body = await req.json();
    const validatedData = thumbnailRequestSchema.parse(body);

    const result = await generateThumbnailAI(validatedData);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to generate thumbnail concepts" },
      { status: 500 }
    );
  }
}
