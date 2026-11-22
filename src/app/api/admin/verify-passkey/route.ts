import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { passkey } = body;

    if (!passkey || typeof passkey !== "string") {
      return NextResponse.json(
        { success: false, error: "Master Admin Passkey is required." },
        { status: 400 }
      );
    }

    const expectedPasskey = process.env.ADMIN_MASTER_KEY || "CreatorFlow-Master-2026-SuperAdmin-Key!#";

    // Timing-safe comparison to prevent timing attacks
    const passkeyBuf = Buffer.from(passkey.trim());
    const expectedBuf = Buffer.from(expectedPasskey.trim());

    const isMatch =
      passkeyBuf.length === expectedBuf.length &&
      crypto.timingSafeEqual(passkeyBuf, expectedBuf);

    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: "Invalid Master Admin Passkey. Access denied." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      isAdminUnlocked: true,
      message: "Master Admin privileges unlocked successfully.",
    });

    // Set secure HTTP-only cookie valid for 7 days
    response.cookies.set("cf_admin_unlocked", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error("Error verifying admin passkey:", error);
    return NextResponse.json(
      { success: false, error: "Failed to verify admin passkey." },
      { status: 500 }
    );
  }
}
