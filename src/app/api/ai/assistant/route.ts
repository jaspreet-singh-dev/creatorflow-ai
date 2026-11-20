import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateContentAssistant } from "@/lib/ai/gemini";

const assistantSchema = z.object({
  mode: z.enum(["ideas", "hook", "outline", "series", "shorts", "calendar", "keywords"]).default("ideas"),
  niche: z.string().min(2, "Niche is required"),
  topic: z.string().optional(),
  targetAudience: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = assistantSchema.parse(body);

    const result = await generateContentAssistant(validatedData);

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
      { success: false, error: error?.message || "Failed to generate ideas" },
      { status: 500 }
    );
  }
}
