import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateCompleteVideoPackage } from "@/lib/ai/gemini";
import { verifyApiAuth } from "@/lib/auth/server-auth";

const packageSchema = z.object({
  topic: z.string().min(2, "Topic must be at least 2 characters"),
  niche: z.string().optional().default("Content Creation"),
  contentType: z.string().optional().default("tutorial"),
  targetAudience: z.string().optional().default("General Viewers"),
  primaryKeyword: z.string().optional(),
  secondaryKeywords: z.array(z.string()).optional(),
  language: z.string().optional().default("English"),
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

  // 2. Validate and Execute
  try {
    const body = await req.json();
    const validatedData = packageSchema.parse(body);

    const packageResult = await generateCompleteVideoPackage(validatedData);

    return NextResponse.json({
      success: true,
      data: packageResult,
      package: packageResult,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to generate complete video package" },
      { status: 500 }
    );
  }
}
