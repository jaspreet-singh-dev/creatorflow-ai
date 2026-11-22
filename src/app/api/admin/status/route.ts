import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const adminCookie = req.cookies.get("cf_admin_unlocked")?.value;
    const isAdminUnlocked = adminCookie === "true";

    return NextResponse.json({
      success: true,
      isAdminUnlocked,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, isAdminUnlocked: false },
      { status: 500 }
    );
  }
}
