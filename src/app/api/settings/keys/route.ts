import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { z } from "zod";
import { verifyApiAuth } from "@/lib/auth/server-auth";

export const dynamic = "force-dynamic";

const keysPayloadSchema = z.object({
  supabaseUrl: z
    .string()
    .max(500)
    .regex(/^[^\r\n]*$/, "Newlines are not permitted in credentials")
    .optional(),
  supabaseAnonKey: z
    .string()
    .max(1000)
    .regex(/^[^\r\n]*$/, "Newlines are not permitted in credentials")
    .optional(),
  geminiApiKey: z
    .string()
    .max(500)
    .regex(/^[^\r\n]*$/, "Newlines are not permitted in credentials")
    .optional(),
  googleClientId: z
    .string()
    .max(500)
    .regex(/^[^\r\n]*$/, "Newlines are not permitted in credentials")
    .optional(),
  googleClientSecret: z
    .string()
    .max(500)
    .regex(/^[^\r\n]*$/, "Newlines are not permitted in credentials")
    .optional(),
});

const ALLOWED_CONFIG_KEYS = new Set([
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "GEMINI_API_KEY",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
]);

export async function GET(req: NextRequest) {
  // 1. Verify authentication
  const auth = await verifyApiAuth(req);
  if (!auth.authenticated) {
    return NextResponse.json(
      { success: false, error: auth.error || "Authentication required." },
      { status: 401 }
    );
  }

  const envPath = path.join(process.cwd(), ".env.local");
  let envContent = "";
  try {
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, "utf-8");
    }
  } catch {
    // If filesystem read is disallowed in serverless, read from process.env
  }

  const getVal = (key: string) => {
    const match = envContent.match(new RegExp(`^${key}=(.*)$`, "m"));
    return match ? match[1].trim() : (process.env[key] || "");
  };

  const safeMask = (val: string) => {
    if (!val) return "";
    return "••••••••";
  };

  const supabaseUrl = getVal("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseKey = getVal("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const geminiKey = getVal("GEMINI_API_KEY");
  const googleClientId = getVal("GOOGLE_CLIENT_ID");
  const googleClientSecret = getVal("GOOGLE_CLIENT_SECRET");

  return NextResponse.json({
    success: true,
    supabase: {
      url: supabaseUrl.includes("placeholder") ? "" : supabaseUrl,
      hasKey: Boolean(supabaseKey && !supabaseKey.includes("placeholder")),
      keyMasked: safeMask(supabaseKey),
      configured: Boolean(supabaseUrl && supabaseKey && !supabaseUrl.includes("placeholder")),
    },
    gemini: {
      hasKey: Boolean(geminiKey && !geminiKey.includes("placeholder") && !geminiKey.includes("YourGeminiApiKeyHere")),
      keyMasked: safeMask(geminiKey),
      configured: Boolean(geminiKey && !geminiKey.includes("placeholder") && !geminiKey.includes("YourGeminiApiKeyHere")),
    },
    googleOAuth: {
      clientId: googleClientId.includes("your-google-client-id") ? "" : googleClientId,
      hasSecret: Boolean(googleClientSecret && !googleClientSecret.includes("your-google-client-secret")),
      secretMasked: safeMask(googleClientSecret),
      configured: Boolean(
        googleClientId &&
        googleClientSecret &&
        !googleClientId.includes("your-google-client-id") &&
        !googleClientSecret.includes("your-google-client-secret")
      ),
    },
  });
}

export async function POST(req: NextRequest) {
  // 1. Verify authentication
  const auth = await verifyApiAuth(req);
  if (!auth.authenticated) {
    return NextResponse.json(
      { success: false, error: auth.error || "Authentication required." },
      { status: 401 }
    );
  }

  try {
    const rawBody = await req.json();
    const parsed = keysPayloadSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed: " + parsed.error.issues.map((i) => i.message).join(", "),
        },
        { status: 400 }
      );
    }

    const body = parsed.data;
    const envPath = path.join(process.cwd(), ".env.local");

    let currentEnv = "";
    let fileWritable = true;
    try {
      if (fs.existsSync(envPath)) {
        currentEnv = fs.readFileSync(envPath, "utf-8");
      }
    } catch {
      fileWritable = false;
    }

    const updates: Record<string, string> = {};

    if (body.supabaseUrl !== undefined) updates["NEXT_PUBLIC_SUPABASE_URL"] = body.supabaseUrl.trim();
    if (body.supabaseAnonKey) updates["NEXT_PUBLIC_SUPABASE_ANON_KEY"] = body.supabaseAnonKey.trim();
    if (body.geminiApiKey) updates["GEMINI_API_KEY"] = body.geminiApiKey.trim();
    if (body.googleClientId !== undefined) updates["GOOGLE_CLIENT_ID"] = body.googleClientId.trim();
    if (body.googleClientSecret) updates["GOOGLE_CLIENT_SECRET"] = body.googleClientSecret.trim();

    let updatedContent = currentEnv;

    for (const [key, val] of Object.entries(updates)) {
      if (!ALLOWED_CONFIG_KEYS.has(key)) continue;

      // Always update runtime memory
      process.env[key] = val;

      if (fileWritable) {
        const regex = new RegExp(`^${key}=.*$`, "m");
        if (regex.test(updatedContent)) {
          updatedContent = updatedContent.replace(regex, `${key}=${val}`);
        } else {
          updatedContent += `\n${key}=${val}`;
        }
      }
    }

    if (fileWritable) {
      try {
        fs.writeFileSync(envPath, updatedContent.trim() + "\n", "utf-8");
      } catch (writeErr) {
        console.warn("Could not write to .env.local (read-only filesystem); updated process.env only.");
      }
    }

    return NextResponse.json({
      success: true,
      message: "Credentials successfully updated and applied to active runtime.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to update configuration" },
      { status: 500 }
    );
  }
}
