import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateMetadata } from "@/lib/ai/gemini";

const metadataSchema = z.object({
  topic: z.string().min(2, "Topic must be at least 2 characters"),
  descriptionOrTranscript: z.string().optional(),
  niche: z.string().default("General Tech"),
  targetAudience: z.string().default("Content Creators"),
  primaryKeyword: z.string().default(""),
  secondaryKeywords: z.array(z.string()).default([]),
  preferredTone: z.string().default("Engaging"),
  language: z.string().default("English"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = metadataSchema.parse(body);

    const generated = await generateMetadata(validatedData);

    return NextResponse.json({
      success: true,
      data: generated,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to generate metadata" },
      { status: 500 }
    );
  }
}
