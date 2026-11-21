import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json(
        { error: "Unauthorized: Active session required to delete account." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const targetUserId = body.userId || user.id;

    // Users can only delete their own account unless an owner/admin is calling
    if (targetUserId !== user.id) {
      const isOwner = user.email === "jaspreetsing3412@gmail.com";
      if (!isOwner) {
        return NextResponse.json(
          { error: "Forbidden: You cannot delete another user's account." },
          { status: 403 }
        );
      }
    }

    const serviceRole = createServiceRoleClient();

    // 1. Delete user profile (cascades across all user tables in PostgreSQL)
    const { error: profileDeleteErr } = await serviceRole
      .from("profiles")
      .delete()
      .eq("id", targetUserId);

    if (profileDeleteErr) {
      console.error("Error deleting user profile:", profileDeleteErr);
    }

    // 2. Delete user from auth.users via Supabase Admin API
    const { error: authDeleteErr } = await serviceRole.auth.admin.deleteUser(targetUserId);

    if (authDeleteErr) {
      console.error("Error deleting auth user:", authDeleteErr);
      return NextResponse.json(
        { error: `Database error deleting user: ${authDeleteErr.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Account and all associated creator records successfully deleted.",
    });
  } catch (err: any) {
    console.error("Account deletion error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to process account deletion." },
      { status: 500 }
    );
  }
}
