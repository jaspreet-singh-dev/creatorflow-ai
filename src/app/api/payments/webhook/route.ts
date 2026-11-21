import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Verify cryptographic signature if secret is configured
    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      if (expectedSignature !== signature) {
        return NextResponse.json(
          { success: false, error: "Invalid webhook signature" },
          { status: 400 }
        );
      }
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    const event = payload.event;
    const payment = payload.payload?.payment?.entity;
    const order = payload.payload?.order?.entity;

    const userId = payment?.notes?.userId || order?.notes?.userId || payload.userId;
    const planTier = payment?.notes?.planTier || order?.notes?.planTier || payload.planTier || "creator";

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Missing userId in payment event metadata" },
        { status: 400 }
      );
    }

    // Only process successful payment events
    const isSuccess =
      event === "payment.captured" ||
      event === "order.paid" ||
      payload.status === "captured" ||
      payload.status === "paid";

    if (!isSuccess) {
      return NextResponse.json({ success: true, message: "Ignored non-success event" });
    }

    const serviceClient = createServiceRoleClient();

    // 1. Update public.profiles plan_tier
    const { error: profileError } = await serviceClient
      .from("profiles")
      .update({ plan_tier: planTier, updated_at: new Date().toISOString() })
      .eq("id", userId);

    if (profileError) {
      console.error("Failed to update profile tier on payment:", profileError);
    }

    // 2. Upsert public.subscriptions
    const currentPeriodStart = new Date().toISOString();
    const currentPeriodEnd = new Date(Date.now() + 30 * 86400000).toISOString();

    await serviceClient.from("subscriptions").upsert(
      {
        user_id: userId,
        plan_tier: planTier,
        status: "active",
        current_period_start: currentPeriodStart,
        current_period_end: currentPeriodEnd,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    // 3. Mark payment order paid if order_id exists
    const orderId = order?.id || payment?.order_id || payload.orderId;
    if (orderId) {
      try {
        await serviceClient
          .from("payment_orders")
          .update({
            status: "paid",
            gateway_payment_id: payment?.id || null,
            gateway_signature: signature || null,
            updated_at: new Date().toISOString(),
          })
          .eq("order_id", orderId);
      } catch {
        // Table not migrated yet
      }
    }

    return NextResponse.json({
      success: true,
      message: `User ${userId} subscription upgraded to ${planTier}`,
    });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Webhook error" },
      { status: 500 }
    );
  }
}
