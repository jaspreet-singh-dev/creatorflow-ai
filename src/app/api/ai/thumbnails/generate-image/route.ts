import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyApiAuth } from "@/lib/auth/server-auth";
import { generateThumbnailSvg, svgToDataUri } from "@/lib/ai/thumbnail-graphics";

const generateImageRequestSchema = z.object({
  topic: z.string().min(2, "Topic must be at least 2 characters"),
  videoTitle: z.string().optional(),
  format: z.enum(["long_form", "shorts"]).optional().default("long_form"),
  niche: z.string().optional().default("Content Creation"),
  textOverlay: z.string().optional(),
  accentColor: z.string().optional(),
  stylePreset: z
    .enum(["cyber_gaming", "viral_hook", "urgent_danger", "hyper_mint", "split_contrast"])
    .optional()
    .default("hyper_mint"),
  badgeText: z.string().optional(),
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
    const derivedText =
      validatedData.textOverlay?.trim() ||
      (isShorts ? "WATCH THIS!" : "I AUTOMATED IT!");

    // Generate High-CTR SVG visual composition
    const svg = generateThumbnailSvg({
      format: validatedData.format,
      textOverlay: derivedText,
      topic: validatedData.topic,
      videoTitle: validatedData.videoTitle,
      niche: validatedData.niche,
      stylePreset: validatedData.stylePreset,
      accentColor: validatedData.accentColor,
      badgeText: validatedData.badgeText,
    });

    const dataUri = svgToDataUri(svg);

    // AI Prompt formulated for third-party tools if user wants to render 3D renders
    const aiPrompt = isShorts
      ? `Cinematic 9:16 vertical YouTube Shorts cover for ${validatedData.topic}, dynamic ${validatedData.stylePreset} aesthetic, vibrant neon lighting with ${validatedData.accentColor || "#00F5A0"}, high contrast focal subject, dramatic bokeh background, 8k render.`
      : `High-CTR 16:9 YouTube thumbnail background for ${validatedData.topic}, ${validatedData.stylePreset} style, dramatic rim lighting with ${validatedData.accentColor || "#00F5A0"}, sharp foreground subject on rule-of-thirds grid, clean dark obsidian background, 8k resolution.`;

    return NextResponse.json({
      success: true,
      data: {
        imageUrl: dataUri,
        textOverlay: derivedText,
        format: validatedData.format,
        dimensions: isShorts ? { width: 1080, height: 1920 } : { width: 1280, height: 720 },
        stylePreset: validatedData.stylePreset,
        accentColor: validatedData.accentColor || "#00F5A0",
        aiImagePrompt: aiPrompt,
        attribution: "Generated with CreatorFlow AI Visual Engine (Aurora Edition)",
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
