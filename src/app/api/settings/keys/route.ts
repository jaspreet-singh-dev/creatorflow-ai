import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const envPath = path.join(process.cwd(), ".env.local");
  let envContent = "";
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf-8");
  }

  const getVal = (key: string) => {
    const match = envContent.match(new RegExp(`^${key}=(.*)$`, "m"));
    return match ? match[1].trim() : (process.env[key] || "");
  };

  const mask = (val: string) => {
    if (!val || val.length < 8) return val ? "••••••••" : "";
    return `${val.substring(0, 4)}••••${val.substring(val.length - 4)}`;
  };

  const supabaseUrl = getVal("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseKey = getVal("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const geminiKey = getVal("GEMINI_API_KEY");
  const googleClientId = getVal("GOOGLE_CLIENT_ID");
  const googleClientSecret = getVal("GOOGLE_CLIENT_SECRET");

  return NextResponse.json({
    supabase: {
      url: supabaseUrl,
      hasKey: Boolean(supabaseKey),
      keyMasked: mask(supabaseKey),
      configured: Boolean(supabaseUrl && supabaseKey && !supabaseUrl.includes("placeholder")),
    },
    gemini: {
      hasKey: Boolean(geminiKey),
      keyMasked: mask(geminiKey),
      configured: Boolean(geminiKey && !geminiKey.includes("placeholder")),
    },
    googleOAuth: {
      clientId: googleClientId,
      hasSecret: Boolean(googleClientSecret),
      secretMasked: mask(googleClientSecret),
      configured: Boolean(googleClientId && googleClientSecret && !googleClientId.includes("your-google-client-id")),
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const envPath = path.join(process.cwd(), ".env.local");

    let currentEnv = "";
    if (fs.existsSync(envPath)) {
      currentEnv = fs.readFileSync(envPath, "utf-8");
    }

    const updates: Record<string, string> = {};

    if (typeof body.supabaseUrl === "string") updates["NEXT_PUBLIC_SUPABASE_URL"] = body.supabaseUrl.trim();
    if (typeof body.supabaseAnonKey === "string" && body.supabaseAnonKey) {
      updates["NEXT_PUBLIC_SUPABASE_ANON_KEY"] = body.supabaseAnonKey.trim();
    }
    if (typeof body.geminiApiKey === "string" && body.geminiApiKey) {
      updates["GEMINI_API_KEY"] = body.geminiApiKey.trim();
    }
    if (typeof body.googleClientId === "string") updates["GOOGLE_CLIENT_ID"] = body.googleClientId.trim();
    if (typeof body.googleClientSecret === "string" && body.googleClientSecret) {
      updates["GOOGLE_CLIENT_SECRET"] = body.googleClientSecret.trim();
    }

    let updatedContent = currentEnv;

    for (const [key, val] of Object.entries(updates)) {
      process.env[key] = val;
      const regex = new RegExp(`^${key}=.*$`, "m");
      if (regex.test(updatedContent)) {
        updatedContent = updatedContent.replace(regex, `${key}=${val}`);
      } else {
        updatedContent += `\n${key}=${val}`;
      }
    }

    fs.writeFileSync(envPath, updatedContent.trim() + "\n", "utf-8");

    return NextResponse.json({
      success: true,
      message: "Credentials saved to .env.local and loaded into runtime.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to update configuration" },
      { status: 500 }
    );
  }
}
