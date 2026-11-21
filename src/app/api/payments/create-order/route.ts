import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const INR_PRICES = {
  creator: {
    monthly: 999, // ₹999
    yearly: 9990, // ₹9,990
  },
  pro: {
    monthly: 2499, // ₹2,499
    yearly: 24990, // ₹24,990
  },
};

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Authentication required to initiate subscription order." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const tier = (body.tier || "creator") as "creator" | "pro";
    const cycle = (body.cycle || "monthly") as "monthly" | "yearly";

    if (!INR_PRICES[tier]) {
      return NextResponse.json(
        { success: false, error: `Invalid plan tier: ${tier}` },
        { status: 400 }
      );
    }

    const amountInr = INR_PRICES[tier][cycle];
    const amountInPaise = amountInr * 100;
    const orderId = `order_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;

    const razorpayKey = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;

    let gatewayOrderId = orderId;

    // If live Razorpay API keys are configured, create an official Razorpay order
    if (razorpayKey && razorpaySecret && !razorpayKey.startsWith("rzp_test_placeholder")) {
      try {
        const authHeader = Buffer.from(`${razorpayKey}:${razorpaySecret}`).toString("base64");
        const rzpResponse = await fetch("https://api.razorpay.com/v1/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${authHeader}`,
          },
          body: JSON.stringify({
            amount: amountInPaise,
            currency: "INR",
            receipt: `rcpt_${user.id.substring(0, 8)}_${Date.now()}`,
            notes: {
              userId: user.id,
              userEmail: user.email,
              planTier: tier,
              billingCycle: cycle,
            },
          }),
        });

        if (rzpResponse.ok) {
          const rzpData = await rzpResponse.json();
          gatewayOrderId = rzpData.id;
        }
      } catch (rzpErr) {
        console.warn("Razorpay API order dispatch error:", rzpErr);
      }
    }

    // Record order in database if payment_orders table exists
    const serviceClient = createServiceRoleClient();
    try {
      await serviceClient.from("payment_orders").insert({
        user_id: user.id,
        order_id: gatewayOrderId,
        plan_tier: tier,
        billing_cycle: cycle,
        amount_inr: amountInr,
        currency: "INR",
        status: "created",
        gateway: "razorpay",
      });
    } catch {
      // Table may be awaiting migration, proceed gracefully
    }

    return NextResponse.json({
      success: true,
      order: {
        orderId: gatewayOrderId,
        amount: amountInPaise,
        amountInr,
        currency: "INR",
        planTier: tier,
        billingCycle: cycle,
        razorpayKeyId: razorpayKey || "rzp_test_sandbox",
        notes: {
          platform: "CreatorFlow AI",
          customerEmail: user.email,
        },
      },
    });
  } catch (error: any) {
    console.error("Payment Order Creation Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal payment error" },
      { status: 500 }
    );
  }
}
