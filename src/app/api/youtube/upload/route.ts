import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { initiateYouTubeResumableUpload } from "@/lib/youtube/upload";

const uploadSchema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().default(""),
  tags: z.array(z.string()).default([]),
  privacyStatus: z.enum(["private", "unlisted", "public"]).default("private"),
  publishAt: z.string().nullable().optional(),
  channelId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = uploadSchema.parse(body);

    const result = await initiateYouTubeResumableUpload({
      title: validated.title,
      description: validated.description,
      tags: validated.tags,
      privacyStatus: validated.privacyStatus,
      publishAt: validated.publishAt || undefined,
    });

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        uploadJobId: `job-${Date.now()}`,
        status: validated.publishAt ? "scheduled" : "uploading",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to initiate upload" },
      { status: 500 }
    );
  }
}
