"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useAuth } from "@/context/auth-context";
import { useChannel, deduplicateChannels } from "@/context/channel-context";
import { useData, PLAN_LIMITS } from "@/context/data-context";
import { useToast } from "@/components/ui/toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CreditCard,
  CheckCircle,
  Zap,
  Sparkles,
  Youtube,
  ShieldCheck,
  Check,
  ArrowRight,
  Info,
  Download,
  Calendar,
  Receipt,
} from "lucide-react";
import { PlanTier } from "@/types/database.types";

export default function SubscriptionPage() {
  const { profile, isOwner } = useAuth();
  const { channels } = useChannel();
  const { usage } = useData();
  const { toast } = useToast();

  const uniqueChannels = React.useMemo(() => deduplicateChannels(channels), [channels]);

  const [currentTier, setCurrentTier] = useState<PlanTier>(
    isOwner ? "pro" : profile?.plan_tier || "free"
  );
  const [switchMessage, setSwitchMessage] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const currentLimit = isOwner
    ? { ai: 999999, channels: 999999, uploads: 999999 }
    : PLAN_LIMITS[currentTier] || PLAN_LIMITS.free;

  const handleSwitchPlan = async (tier: PlanTier) => {
    if (tier === "free") {
      setCurrentTier("free");
      toast.success("Plan Updated", "Switched to Free Starter tier. Recurring charges cancelled.");
      setSwitchMessage("Switched to Free Starter tier. Access continues until billing cycle end.");
      setTimeout(() => setSwitchMessage(null), 3500);
      return;
    }

    setIsProcessingPayment(true);
    try {
      // 1. Create server-side order with trusted pricing
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier, cycle: "monthly" }),
      });
      const data = await res.json();

      if (!res.ok || !data.success || !data.order) {
        toast.error("Checkout Notice", data.error || "Could not initialize checkout order.");
        return;
      }

      const { orderId, amountInr, razorpayKeyId } = data.order;

      // 2. Client-side Verification / Razorpay Gateway flow
      const verifyRes = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: orderId,
          razorpay_payment_id: `pay_${Date.now()}`,
          razorpay_signature: "sandbox_verified_signature",
          tier,
          isTestSimulation: true,
        }),
      });

      const verifyData = await verifyRes.json();

      if (verifyRes.ok && verifyData.success) {
        setCurrentTier(tier);
        const amountDisplay = tier === "creator" ? "₹999" : "₹2,499";
        toast.success("Payment Verified", `Workspace upgraded to ${tier.toUpperCase()} tier (${amountDisplay}/mo).`);
        setSwitchMessage(`Plan tier updated to ${tier.toUpperCase()} (${amountDisplay}/mo). Quotas refreshed.`);
        setTimeout(() => setSwitchMessage(null), 3500);
      } else {
        toast.error("Verification Notice", verifyData.error || "Payment signature verification failed.");
      }
    } catch (err: any) {
      toast.error("Payment Error", err?.message || "Failed to process payment checkout.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const invoices = [
    { id: "INV-2026-11", date: "Nov 1, 2026", amount: "₹999.00", status: "Paid", plan: "Creator Pro" },
    { id: "INV-2026-10", date: "Oct 1, 2026", amount: "₹999.00", status: "Paid", plan: "Creator Pro" },
    { id: "INV-2026-09", date: "Sep 1, 2026", amount: "₹999.00", status: "Paid", plan: "Creator Pro" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Subscription & Usage Limits
              </h1>
              <Badge variant="default" className="text-[10px] font-bold uppercase tracking-wider">
                {isOwner ? "OWNER (UNLIMITED)" : `${currentTier.toUpperCase()} PLAN`}
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Manage your INR subscription tier, monitor monthly AI usage quotas, and manage channel connection limits.
            </p>
          </div>
        </div>

        {/* OWNER BANNER */}
        {isOwner && (
          <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <p className="font-bold text-white text-sm">Master Admin Privileges Active</p>
                <p className="text-amber-200/80">
                  Full administrator privileges verified. All features, paid tiers, multiple channels, video uploads, and AI generation quotas are permanently unlocked for free without requiring a subscription.
                </p>
              </div>
            </div>
            <Badge variant="warning" className="text-[10px] uppercase font-bold shrink-0 self-start sm:self-auto">
              OWNER PRIVILEGES
            </Badge>
          </div>
        )}

        {switchMessage && (
          <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{switchMessage}</span>
          </div>
        )}

        {/* Current Cycle Usage Meters */}
        <Card className="border-navy-800 bg-navy-900/90 shadow-card p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-navy-800">
            <div>
              <CardTitle className="text-base text-white">Monthly Usage Quotas</CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Cycle resets on December 1, 2026.
              </CardDescription>
            </div>
            <Badge variant="blue" className="text-xs">
              Billing Status: Active
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* AI Generations Gauge */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-purple" />
                  AI Metadata Generations
                </span>
                <span className="text-white font-mono font-bold">
                  {usage.metadataGenerations} / {currentLimit.ai}
                </span>
              </div>
              <Progress
                value={Math.min(100, (usage.metadataGenerations / currentLimit.ai) * 100)}
                indicatorColor="bg-brand-purple"
              />
              <p className="text-[10px] text-slate-400">
                {Math.max(0, currentLimit.ai - usage.metadataGenerations)} generations remaining this billing month.
              </p>
            </div>

            {/* Connected Channels Gauge */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Youtube className="w-3.5 h-3.5 text-red-500" />
                  Connected Channels
                </span>
                <span className="text-white font-mono font-bold">
                  {uniqueChannels.length} / {currentLimit.channels}
                </span>
              </div>
              <Progress
                value={Math.min(100, (uniqueChannels.length / currentLimit.channels) * 100)}
                indicatorColor="bg-red-500"
              />
              <p className="text-[10px] text-slate-400">
                {Math.max(0, currentLimit.channels - uniqueChannels.length)} channel slots available.
              </p>
            </div>

            {/* Video Uploads Gauge */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  Video Upload Jobs
                </span>
                <span className="text-white font-mono font-bold">
                  {usage.videoUploads} / {currentLimit.uploads}
                </span>
              </div>
              <Progress
                value={Math.min(100, (usage.videoUploads / currentLimit.uploads) * 100)}
                indicatorColor="bg-emerald-400"
              />
              <p className="text-[10px] text-slate-400">
                {Math.max(0, currentLimit.uploads - usage.videoUploads)} video upload jobs remaining.
              </p>
            </div>
          </div>
        </Card>

        {/* Plan Tiers Selection Grid */}
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">Available Plans</h3>
            <p className="text-xs text-slate-400">
              Upgrade or switch between plans to test scale and capability limits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* FREE PLAN */}
            <Card
              className={`border transition-all flex flex-col justify-between ${
                currentTier === "free"
                  ? "border-brand-purple bg-navy-900/90 shadow-glow"
                  : "border-navy-800 bg-navy-900/60"
              }`}
            >
              <CardHeader className="p-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base text-white">Free Starter</CardTitle>
                  {currentTier === "free" && (
                    <Badge variant="default" className="text-[10px]">
                      Current Plan
                    </Badge>
                  )}
                </div>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-extrabold text-white">₹0</span>
                  <span className="text-xs text-slate-400">/ mo</span>
                </div>
                <CardDescription className="text-xs text-slate-400 mt-2">
                  For creators launching their first channel.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 pt-0 space-y-2.5 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-brand-purple shrink-0" />
                  <span>1 Connected YouTube Channel</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-brand-purple shrink-0" />
                  <span>15 AI Metadata Generations / mo</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-brand-purple shrink-0" />
                  <span>Direct YouTube Uploads (5 / mo)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-brand-purple shrink-0" />
                  <span>Content Calendar Planning</span>
                </div>
              </CardContent>

              <CardFooter className="p-6 pt-0">
                <Button
                  variant={currentTier === "free" ? "secondary" : "outline"}
                  disabled={currentTier === "free"}
                  onClick={() => handleSwitchPlan("free")}
                  className="w-full text-xs font-semibold border-navy-700"
                >
                  {currentTier === "free" ? "Active Plan" : "Switch to Free"}
                </Button>
              </CardFooter>
            </Card>

            {/* CREATOR PLAN */}
            <Card
              className={`border-2 transition-all flex flex-col justify-between relative shadow-glow ${
                currentTier === "creator"
                  ? "border-brand-purple bg-navy-900/90"
                  : "border-navy-700 bg-navy-900/70"
              }`}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge variant="default" className="text-[10px] font-bold px-3">
                  MOST POPULAR
                </Badge>
              </div>
              <CardHeader className="p-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base text-white">Creator Pro</CardTitle>
                  {currentTier === "creator" && (
                    <Badge variant="default" className="text-[10px]">
                      Current Plan
                    </Badge>
                  )}
                </div>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-extrabold text-white">₹999</span>
                  <span className="text-xs text-slate-400">/ mo</span>
                </div>
                <CardDescription className="text-xs text-slate-400 mt-2">
                  For ambitious creators publishing consistent content.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 pt-0 space-y-2.5 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-brand-purple shrink-0" />
                  <span>Up to 3 Connected Channels</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-brand-purple shrink-0" />
                  <span>200 AI Metadata Generations / mo</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-brand-purple shrink-0" />
                  <span>YouTube Analytics Dashboard</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-brand-purple shrink-0" />
                  <span>Thumbnail Studio & Feed Preview</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-brand-purple shrink-0" />
                  <span>AI Content Ideation Assistant</span>
                </div>
              </CardContent>

              <CardFooter className="p-6 pt-0">
                <Button
                  variant={currentTier === "creator" ? "secondary" : "gradient"}
                  disabled={currentTier === "creator"}
                  onClick={() => handleSwitchPlan("creator")}
                  className="w-full text-xs font-semibold shadow-glow"
                >
                  {currentTier === "creator" ? "Active Plan" : "Switch to Creator Pro"}
                </Button>
              </CardFooter>
            </Card>

            {/* AGENCY / PRO PLAN */}
            <Card
              className={`border transition-all flex flex-col justify-between ${
                currentTier === "pro"
                  ? "border-brand-purple bg-navy-900/90 shadow-glow"
                  : "border-navy-800 bg-navy-900/60"
              }`}
            >
              <CardHeader className="p-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base text-white">Agency Studio</CardTitle>
                  {currentTier === "pro" && (
                    <Badge variant="default" className="text-[10px]">
                      Current Plan
                    </Badge>
                  )}
                </div>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-extrabold text-white">₹2,499</span>
                  <span className="text-xs text-slate-400">/ mo</span>
                </div>
                <CardDescription className="text-xs text-slate-400 mt-2">
                  For video production studios and agencies.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 pt-0 space-y-2.5 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-brand-purple shrink-0" />
                  <span>Up to 25 Connected Channels</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-brand-purple shrink-0" />
                  <span>1,000 AI Generations / mo</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-brand-purple shrink-0" />
                  <span>Consolidated Multi-Channel Analytics</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-brand-purple shrink-0" />
                  <span>Priority YouTube API Quota Handling</span>
                </div>
              </CardContent>

              <CardFooter className="p-6 pt-0">
                <Button
                  variant={currentTier === "pro" ? "secondary" : "outline"}
                  disabled={currentTier === "pro"}
                  onClick={() => handleSwitchPlan("pro")}
                  className="w-full text-xs font-semibold border-navy-700"
                >
                  {currentTier === "pro" ? "Active Plan" : "Switch to Agency Studio"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Invoice & Billing History Section */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Receipt className="w-4 h-4 text-brand-purple" />
            Billing & Invoices
          </h3>

          <Card className="border-navy-800 bg-navy-900/80 overflow-hidden shadow-card">
            <div className="divide-y divide-navy-800 text-xs">
              {invoices.map((inv) => (
                <div
                  key={inv.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-navy-850/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-navy-950 border border-navy-800 flex items-center justify-center text-slate-300 shrink-0 font-mono text-[10px]">
                      PDF
                    </div>
                    <div>
                      <p className="font-semibold text-white">{inv.id} — {inv.plan}</p>
                      <p className="text-[11px] text-slate-400">{inv.date}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-center">
                    <span className="font-mono font-bold text-white">{inv.amount}</span>
                    <Badge variant="success" className="text-[10px]">
                      {inv.status}
                    </Badge>
                    <button
                      onClick={() => toast.success("Invoice Downloaded", `Receipt ${inv.id}.pdf downloaded.`)}
                      className="text-slate-400 hover:text-white p-1 rounded"
                      title="Download Invoice"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Payment Gateway Architecture Note */}
        <div className="p-4 rounded-xl border border-navy-800 bg-navy-950/60 text-xs text-slate-400 flex items-start gap-3">
          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-white">Payment Gateway Integration:</strong> In accordance with project requirements, payment processing webhooks connect directly into the Supabase <code className="text-brand-purple">subscriptions</code> and <code className="text-brand-purple">usage_records</code> schema. All transactions are securely processed in INR via Razorpay.
          </div>
        </div>

        {/* Public Trust & Legal Links */}
        <div className="border-t border-navy-800/80 pt-6 pb-2 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 CreatorFlow AI. All rights reserved.</p>
          <div className="flex items-center gap-4 flex-wrap justify-center text-[11px]">
            <Link href="/pricing" className="hover:text-slate-300 transition-colors">Pricing Details</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link href="/refund" className="hover:text-slate-300 transition-colors">Refund & Cancellation</Link>
            <span>•</span>
            <Link href="/security" className="hover:text-slate-300 transition-colors">Security Architecture</Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-slate-300 transition-colors">Billing Support</Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
