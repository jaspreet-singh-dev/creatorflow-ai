import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const response = NextResponse.json({
      success: true,
      isAdminUnlocked: false,
      message: "Master Admin session locked.",
    });

    response.cookies.set("cf_admin_unlocked", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to lock admin session." },
      { status: 500 }
    );
  }
}
