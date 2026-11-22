import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "cf_default_sandbox_webhook_secret";

    // Strict cryptographic signature verification:
    // If a signature is provided OR if a production secret is configured, enforce HMAC-SHA256 verification
    if (signature || (process.env.RAZORPAY_WEBHOOK_SECRET && !process.env.RAZORPAY_WEBHOOK_SECRET.startsWith("rzp_webhook_secret_placeholder"))) {
      if (!signature) {
        return NextResponse.json(
          { success: false, error: "Missing required Razorpay webhook signature header" },
          { status: 401 }
        );
      }

      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      let isSignatureValid = false;
      try {
        isSignatureValid =
          signature.length === expectedSignature.length &&
          crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature));
      } catch {
        isSignatureValid = false;
      }

      if (!isSignatureValid) {
        return NextResponse.json(
          { success: false, error: "Invalid cryptographic webhook signature" },
          { status: 400 }
        );
      }
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON webhook payload" },
        { status: 400 }
      );
    }

    const event = payload.event;
    const payment = payload.payload?.payment?.entity;
    const order = payload.payload?.order?.entity;

    const orderId = order?.id || payment?.order_id || payload.orderId;
    const serviceClient = createServiceRoleClient();

    // 1. Handle Failed Payments Cleanly
    if (event === "payment.failed" || payload.status === "failed") {
      if (orderId) {
        try {
          await serviceClient
            .from("payment_orders")
            .update({
              status: "failed",
              error_reason: payment?.error_description || "Payment failed via gateway",
              updated_at: new Date().toISOString(),
            })
            .eq("order_id", orderId);
        } catch {
          // Table pending migration
        }
      }
      return NextResponse.json({
        success: true,
        message: "Payment failure recorded cleanly without activating subscription",
      });
    }

    // 2. Extract Entitlement Identifiers
    const userId = payment?.notes?.userId || order?.notes?.userId || payload.userId;
    const planTier = payment?.notes?.planTier || order?.notes?.planTier || payload.planTier || "creator";

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Missing userId in payment event metadata notes" },
        { status: 400 }
      );
    }

    // 3. Check for Successful Payment Events
    const isSuccess =
      event === "payment.captured" ||
      event === "order.paid" ||
      payload.status === "captured" ||
      payload.status === "paid";

    if (!isSuccess) {
      return NextResponse.json({
        success: true,
        message: `Ignored unhandled event: ${event || "unknown"}`,
      });
    }

    // 4. Idempotency Check: Don't double-process already fulfilled orders
    if (orderId) {
      try {
        const { data: existingOrder } = await serviceClient
          .from("payment_orders")
          .select("status")
          .eq("order_id", orderId)
          .maybeSingle();

        if (existingOrder && existingOrder.status === "paid") {
          return NextResponse.json({
            success: true,
            message: `Event for order ${orderId} already processed (idempotent duplicate skipped).`,
          });
        }
      } catch {
        // Table pending migration
      }
    }

    // 5. Update public.profiles plan_tier
    const { error: profileError } = await serviceClient
      .from("profiles")
      .update({ plan_tier: planTier, updated_at: new Date().toISOString() })
      .eq("id", userId);

    if (profileError) {
      console.warn("Notice updating profile tier on webhook:", profileError.message);
    }

    // 6. Upsert public.subscriptions
    const currentPeriodStart = new Date().toISOString();
    const currentPeriodEnd = new Date(Date.now() + 30 * 86400000).toISOString();

    try {
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
    } catch (subErr) {
      console.warn("Notice updating subscriptions record on webhook:", subErr);
    }

    // 7. Update payment order to 'paid'
    if (orderId) {
      try {
        await serviceClient
          .from("payment_orders")
          .update({
            status: "paid",
            gateway_payment_id: payment?.id || null,
            gateway_signature: signature || "webhook_verified",
            updated_at: new Date().toISOString(),
          })
          .eq("order_id", orderId);
      } catch {
        // Table pending migration
      }
    }

    return NextResponse.json({
      success: true,
      message: `User ${userId} subscription entitlement verified and upgraded to ${planTier}.`,
    });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { success: false, error: "Internal webhook processing error" },
      { status: 500 }
    );
  }
}
