import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyApiAuth } from "@/lib/auth/server-auth";
import { generateThumbnailThemeAI } from "@/lib/ai/gemini";

const generateImageRequestSchema = z.object({
  topic: z.string().min(2, "Topic must be at least 2 characters"),
  videoTitle: z.string().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  format: z.enum(["long_form", "shorts"]).optional().default("long_form"),
  niche: z.string().optional().default("Content Creation"),
  textOverlay: z.string().optional(),
  accentColor: z.string().optional(),
  channelContext: z
    .object({
      channelTitle: z.string().optional(),
      subscriberCount: z.number().optional(),
      niche: z.string().optional(),
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
    const validatedData = generateImageRequestSchema.parse(body);

    const isShorts = validatedData.format === "shorts";

    // 3. Generative AI analyzes content and metadata to design custom theme (like YouTube Studio)
    const themeResult = await generateThumbnailThemeAI({
      topic: validatedData.topic,
      videoTitle: validatedData.videoTitle,
      description: validatedData.description,
      tags: validatedData.tags,
      niche: validatedData.niche,
      format: validatedData.format,
      userPreferredText: validatedData.textOverlay,
      userPreferredColor: validatedData.accentColor,
      channelContext: validatedData.channelContext,
    });

    return NextResponse.json({
      success: true,
      data: {
        imageUrl: themeResult.svgDataUri,
        theme: themeResult.theme,
        textOverlay: themeResult.theme.hookText,
        accentColor: themeResult.theme.colorPalette.primaryAccent,
        badgeText: themeResult.theme.badgeText,
        format: validatedData.format,
        dimensions: isShorts ? { width: 1080, height: 1920 } : { width: 1280, height: 720 },
        isHeuristicFallback: themeResult.isHeuristicFallback,
        attribution: themeResult.attributionNotice,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to generate thumbnail visual" },
      { status: 500 }
    );
  }
}
