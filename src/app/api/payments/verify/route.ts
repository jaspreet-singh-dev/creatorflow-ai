import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json(
        { success: false, error: "Authentication required to verify payment." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { success: false, error: "Invalid payment verification payload." },
        { status: 400 }
      );
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      tier = "creator",
      isTestSimulation = false,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id) {
      return NextResponse.json(
        { success: false, error: "Missing required Razorpay order ID or payment ID." },
        { status: 400 }
      );
    }

    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;
    const isLiveKey = razorpaySecret && !razorpaySecret.startsWith("rzp_test_placeholder");

    // If live/test Razorpay secret is set, verify cryptographic signature
    if (isLiveKey) {
      if (!razorpay_signature) {
        return NextResponse.json(
          { success: false, error: "Missing cryptographic payment signature." },
          { status: 400 }
        );
      }

      const generatedSignature = crypto
        .createHmac("sha256", razorpaySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      const isSignatureValid = crypto.timingSafeEqual(
        Buffer.from(generatedSignature),
        Buffer.from(razorpay_signature)
      );

      if (!isSignatureValid) {
        return NextResponse.json(
          { success: false, error: "Cryptographic payment signature verification failed." },
          { status: 400 }
        );
      }
    } else {
      // In development sandbox mode without production Razorpay secret
      if (!isTestSimulation && !razorpay_signature) {
        return NextResponse.json(
          { success: false, error: "Payment verification token missing." },
          { status: 400 }
        );
      }
    }

    // Server-side upgrade execution via Service Role Client
    const serviceClient = createServiceRoleClient();

    // 1. Update user profile plan_tier
    const { error: profileErr } = await serviceClient
      .from("profiles")
      .update({
        plan_tier: tier,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (profileErr) {
      console.warn("Notice updating profile plan_tier in db:", profileErr.message);
    }

    // 2. Upsert active subscription record
    const periodStart = new Date().toISOString();
    const periodEnd = new Date(Date.now() + 30 * 86400000).toISOString();

    try {
      await serviceClient.from("subscriptions").upsert(
        {
          user_id: user.id,
          plan_tier: tier,
          status: "active",
          current_period_start: periodStart,
          current_period_end: periodEnd,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );
    } catch (subErr) {
      console.warn("Notice updating subscription record:", subErr);
    }

    // 3. Mark payment order paid
    try {
      await serviceClient
        .from("payment_orders")
        .update({
          status: "paid",
          gateway_payment_id: razorpay_payment_id,
          gateway_signature: razorpay_signature || "test_signature",
          updated_at: new Date().toISOString(),
        })
        .eq("order_id", razorpay_order_id);
    } catch {
      // payment_orders table may be pending migration
    }

    return NextResponse.json({
      success: true,
      message: `Payment verified successfully. Workspace upgraded to ${tier.toUpperCase()}.`,
      tier,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
    });
  } catch (error: any) {
    console.error("Payment Verification Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal payment verification error" },
      { status: 500 }
    );
  }
}
