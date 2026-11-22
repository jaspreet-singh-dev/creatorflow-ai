import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

const OWNER_EMAIL = process.env.ADMIN_OWNER_EMAIL || "jaspreetsing3412@gmail.com";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, fullName } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const admin = createServiceRoleClient();
    const normalizedEmail = email.trim().toLowerCase();
    const resolvedName = (fullName && typeof fullName === "string" ? fullName.trim() : "") || normalizedEmail.split("@")[0];
    const isOwner = normalizedEmail === OWNER_EMAIL.toLowerCase();

    // 1. Create confirmed user via Admin API
    const { data, error } = await admin.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: resolvedName,
      },
    });

    if (error) {
      if (error.message.includes("already registered") || error.message.includes("unique")) {
        return NextResponse.json(
          { error: "An account with this email already exists. Please sign in." },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const userId = data.user.id;

    // 2. Explicitly guarantee profile creation in public.profiles table
    const profilePayload: Record<string, any> = {
      id: userId,
      email: normalizedEmail,
      full_name: resolvedName,
      plan_tier: isOwner ? "pro" : "free",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isOwner) {
      profilePayload.role = "owner";
      profilePayload.is_owner = true;
    }

    const { error: profileErr } = await admin
      .from("profiles")
      .upsert(profilePayload, { onConflict: "id" });

    if (profileErr) {
      console.warn("Notice during profile upsert in register route:", profileErr.message);
    }

    // 3. Guarantee subscription record in public.subscriptions
    const { error: subErr } = await admin
      .from("subscriptions")
      .upsert(
        {
          user_id: userId,
          plan_tier: isOwner ? "pro" : "free",
          status: "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (subErr) {
      console.warn("Notice during subscription upsert in register route:", subErr.message);
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email: data.user.email,
        role: isOwner ? "owner" : "user",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to process registration request." },
      { status: 500 }
    );
  }
}
