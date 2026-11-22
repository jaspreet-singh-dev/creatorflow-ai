"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  X,
  CreditCard,
  ShieldCheck,
  Zap,
  Youtube,
  HelpCircle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/context/auth-context";

export default function PublicPricingPage() {
  const { user } = useAuth();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const plans = [
    {
      id: "free",
      name: "Free Starter",
      desc: "For creators launching their first channel.",
      monthlyPrice: "₹0",
      yearlyPrice: "₹0",
      periodLabel: "forever free",
      badge: null,
      highlight: false,
      features: [
        "1 Connected YouTube Channel",
        "15 AI Metadata Generations / mo",
        "5 Direct YouTube Upload Jobs / mo",
        "Content Calendar & Project Workspace",
        "Standard YouTube Title Studio",
        "Community Support",
      ],
      notIncluded: [
        "Multiple Channel Management",
        "YouTube Analytics Velocity Breakdown",
        "Thumbnail Studio AI Visual Generator",
        "Priority Customer Support",
      ],
      ctaText: user ? "Current Starter Tier" : "Get Started Free",
      ctaHref: user ? "/dashboard" : "/signup",
      ctaVariant: "outline" as const,
    },
    {
      id: "creator",
      name: "Creator Pro",
      desc: "For active creators publishing weekly long-form & shorts.",
      monthlyPrice: "₹999",
      yearlyPrice: "₹9,990",
      periodLabel: billingCycle === "monthly" ? "/ month" : "/ year (save 17%)",
      badge: "MOST POPULAR",
      highlight: true,
      features: [
        "Up to 3 Connected YouTube Channels",
        "200 AI Metadata Generations / mo",
        "30 Direct YouTube Upload Jobs / mo",
        "YouTube Analytics Dashboard (7d, 28d, 90d, Lifetime)",
        "Shorts & Video Thumbnail Studio",
        "Content Idea Discovery Assistant",
        "High-CTR Title Generator & Quality Scorer",
        "Priority Email Support (24h response)",
      ],
      notIncluded: [
        "Multi-channel Agency Scaling (25+ channels)",
        "Custom Dedicated API Quotas",
      ],
      ctaText: user ? "Upgrade in Dashboard" : "Start Creator Pro",
      ctaHref: user ? "/dashboard/subscription" : "/signup?plan=creator",
      ctaVariant: "gradient" as const,
    },
    {
      id: "pro",
      name: "Agency Studio",
      desc: "For digital media networks, production teams & agencies.",
      monthlyPrice: "₹2,499",
      yearlyPrice: "₹24,990",
      periodLabel: billingCycle === "monthly" ? "/ month" : "/ year (save 17%)",
      badge: "MAX CAPACITY",
      highlight: false,
      features: [
        "Up to 25 Connected YouTube Channels",
        "1,000 AI Metadata Generations / mo",
        "200 Direct YouTube Upload Jobs / mo",
        "Cross-Channel Unified Analytics",
        "Unlimited Thumbnail Studio Exports",
        "Advanced SEO & Tag Benchmarking",
        "Version History Snapshots & Rollbacks",
        "VIP Support & Dedicated Account Manager",
      ],
      notIncluded: [],
      ctaText: user ? "Upgrade to Agency" : "Get Agency Studio",
      ctaHref: user ? "/dashboard/subscription" : "/signup?plan=pro",
      ctaVariant: "outline" as const,
    },
  ];

  const faqs = [
    {
      q: "What payment methods are supported?",
      a: "All transactions are billed in Indian Rupees (INR - ₹) and processed through our verified Razorpay payment gateway. We accept UPI (Google Pay, PhonePe, Paytm, BHIM), credit and debit cards (Visa, MasterCard, RuPay), and Indian Netbanking.",
    },
    {
      q: "Can I cancel my subscription at any time?",
      a: "Yes. You can cancel your subscription at any time from your dashboard under 'Subscription & Usage Limits'. Upon cancellation, you retain full access to your paid features and monthly quotas until the end of your prepaid billing period. No future automatic renewals will occur.",
    },
    {
      q: "How does the refund policy work?",
      a: "Because CreatorFlow AI provisions computational AI generation quotas immediately upon payment, fees are generally non-refundable once consumed. However, we honor full refunds in cases of accidental duplicate billing or verified technical delivery failure reported within 48 hours. Please review our Refund & Cancellation Policy for full details.",
    },
    {
      q: "Does CreatorFlow AI guarantee views or subscriber growth?",
      a: "No. CreatorFlow AI is an optimization and workflow acceleration tool. We help you create compelling hooks, structured titles, and SEO metadata. YouTube's recommendation algorithm and viewer retention dictate final distribution. We never use bots or promise artificial algorithmic placement.",
    },
    {
      q: "What happens if I exceed my monthly AI quota?",
      a: "Your usage resets automatically at the start of each billing cycle. If you need more AI generations or upload capacity before your reset date, you can upgrade to a higher tier instantly with prorated quotas.",
    },
  ];

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col selection:bg-brand-purple/30 selection:text-white">
      {/* Header */}
      <header className="border-b border-navy-800 bg-navy-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-purple to-brand-blue flex items-center justify-center text-white shadow-glow">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-base tracking-tight text-white">
              CreatorFlow <span className="text-brand-purple">AI</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-xs text-slate-400 hover:text-white">
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                Home
              </Button>
            </Link>
            {user ? (
              <Link href="/dashboard">
                <Button variant="gradient" size="sm" className="text-xs font-semibold">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/signup">
                <Button variant="gradient" size="sm" className="text-xs font-semibold shadow-glow">
                  Get Started Free
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-12 lg:py-16 space-y-16 w-full">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <Badge variant="default" className="text-xs px-3 py-1 font-semibold uppercase tracking-wider">
            Simple, Transparent Pricing
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Plans Built for Creators at Every Stage
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
            Transparent INR billing with no hidden fees. Start free, upgrade when your channel grows, cancel anytime.
          </p>

          {/* Billing Cycle Switcher */}
          <div className="inline-flex items-center p-1 rounded-xl bg-navy-900 border border-navy-800 mt-4">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                billingCycle === "monthly"
                  ? "bg-brand-purple text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                billingCycle === "yearly"
                  ? "bg-brand-purple text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-extrabold">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((p) => {
            const price = billingCycle === "monthly" ? p.monthlyPrice : p.yearlyPrice;

            return (
              <Card
                key={p.id}
                className={`border-2 transition-all flex flex-col justify-between relative shadow-card ${
                  p.highlight
                    ? "border-brand-purple bg-navy-900/95 shadow-glow"
                    : "border-navy-800 bg-navy-900/60"
                }`}
              >
                {p.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="default" className="text-[10px] font-bold px-3 shadow-md">
                      {p.badge}
                    </Badge>
                  </div>
                )}

                <CardHeader className="p-6 sm:p-8 pb-4">
                  <CardTitle className="text-xl text-white font-extrabold">{p.name}</CardTitle>
                  <CardDescription className="text-xs text-slate-400 mt-1 min-h-[32px]">
                    {p.desc}
                  </CardDescription>

                  <div className="flex items-baseline gap-1.5 pt-4">
                    <span className="text-3xl sm:text-4xl font-black text-white">{price}</span>
                    <span className="text-xs text-slate-400 font-medium">{p.periodLabel}</span>
                  </div>
                </CardHeader>

                <CardContent className="p-6 sm:p-8 pt-2 space-y-4 flex-1">
                  <div className="space-y-2.5 text-xs text-slate-300">
                    <p className="font-semibold text-white text-[11px] uppercase tracking-wider text-slate-400">
                      Included in this plan:
                    </p>
                    {p.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  {p.notIncluded.length > 0 && (
                    <div className="space-y-2 text-xs text-slate-500 pt-2 border-t border-navy-800/80">
                      {p.notIncluded.map((feat, i) => (
                        <div key={i} className="flex items-start gap-2 opacity-60">
                          <X className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>

                <CardFooter className="p-6 sm:p-8 pt-0">
                  <Link href={p.ctaHref} className="w-full">
                    <Button
                      variant={p.ctaVariant}
                      className="w-full text-xs font-bold py-2.5"
                    >
                      {p.ctaText}
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Payment Security Badge Banner */}
        <div className="p-6 rounded-2xl border border-navy-800 bg-navy-900/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Secure Payment Gateway</p>
              <p>Processed through Razorpay with 256-bit SSL encryption. We never store credit cards, debit cards, or UPI PINs.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400 bg-navy-950 px-3 py-1.5 rounded-lg border border-navy-800 shrink-0">
            <span>UPI</span>
            <span>•</span>
            <span>Cards</span>
            <span>•</span>
            <span>Netbanking</span>
          </div>
        </div>

        {/* FAQ Section */}
        <section className="space-y-6 max-w-4xl mx-auto pt-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">Frequently Asked Questions</h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Everything you need to know about our billing, plans, and cancellation terms.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="p-5 rounded-xl border border-navy-800 bg-navy-900/60 space-y-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-brand-purple shrink-0" />
                  {faq.q}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed pl-6">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-navy-800 py-10 px-6 bg-navy-950 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 CreatorFlow AI. All rights reserved.</p>
          <div className="flex items-center gap-4 flex-wrap">
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/refund" className="hover:text-white transition-colors">Refund & Cancellation</Link>
            <Link href="/security" className="hover:text-white transition-colors">Security</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
