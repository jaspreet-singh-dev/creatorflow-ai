"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sparkles,
  Mail,
  Lock,
  User,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function SignUpPage() {
  const router = useRouter();
  const { signUp, signInDemo } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setIsLoading(false);
      return;
    }

    const { error: signUpError } = await signUp(email, password, fullName);
    setIsLoading(false);

    if (signUpError) {
      setError(signUpError.message || "Failed to create account. Please check your details.");
    } else {
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1200);
    }
  };

  const handleLaunchDemo = () => {
    signInDemo();
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 relative overflow-hidden flex flex-col justify-between selection:bg-brand-purple/30 selection:text-white">
      {/* Background Kinetic Cyber Grid & Ambient Glows */}
      <div className="absolute inset-0 bg-cyber-grid opacity-60 pointer-events-none" />
      <div className="ambient-glow-violet -top-32 -left-32 opacity-40" />
      <div className="ambient-glow-cyan bottom-0 right-0 opacity-30" />

      {/* Header */}
      <header className="relative z-20 px-6 lg:px-12 py-5 flex items-center justify-between border-b border-white/[0.06] backdrop-blur-md bg-[#030712]/50">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-purple via-violet-600 to-brand-blue flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">
            CreatorFlow <span className="cyber-accent-text">AI</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/login">
            <Button variant="outline" size="sm" className="text-xs font-semibold">
              Sign In
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Panel */}
          <div className="lg:col-span-7 space-y-6 text-left hidden md:block">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs font-bold text-violet-300 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-brand-purple" />
              <span>Free Tier Creator Onboarding</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
              Unlock Viral YouTube Growth with{" "}
              <span className="cyber-accent-text">AI Precision.</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-400 max-w-lg leading-relaxed">
              Start formulating high-retention titles, opening hooks, structured scripts, and automated publishing tags on day one.
            </p>

            <div className="cyber-card p-5 space-y-3.5 max-w-lg">
              <p className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Included with your Free Creator account:
              </p>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>30 AI metadata & viral title formulations per month</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Interactive YouTube Shorts & Desktop Player Simulator</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Direct YouTube Channel sync & chunked 4K upload manager</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Gaming & Minecraft retention challenge prompt presets</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Signup Form */}
          <div className="lg:col-span-5 w-full max-w-md mx-auto space-y-4">
            <div className="cyber-card p-6 sm:p-7 space-y-5">
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  Create Account
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Join creators scaling their channels with CreatorFlow AI.
                </p>
              </div>

              {isSuccess ? (
                <div className="p-6 text-center space-y-4 animate-in zoom-in-95">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-white text-base">Account Created!</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Welcome to CreatorFlow AI, <strong className="text-white">{fullName || email}</strong>! Redirecting to your workspace...
                  </p>
                  <Button
                    variant="gradient"
                    className="w-full text-xs font-bold"
                    onClick={() => router.push("/dashboard")}
                  >
                    Enter Dashboard Now
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-bold text-slate-300">Creator or Channel Name</label>
                    <Input
                      type="text"
                      placeholder="e.g. Alex Rivera"
                      icon={<User className="w-4 h-4" />}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-bold text-slate-300">Email Address</label>
                    <Input
                      type="email"
                      placeholder="creator@example.com"
                      icon={<Mail className="w-4 h-4" />}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-bold text-slate-300">Password</label>
                    <Input
                      type="password"
                      placeholder="At least 6 characters"
                      icon={<Lock className="w-4 h-4" />}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="gradient"
                    className="w-full text-xs sm:text-sm font-bold h-11 shadow-glow"
                    isLoading={isLoading}
                  >
                    Start Creating Free
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </form>
              )}

              <div className="pt-3 border-t border-white/[0.08] text-center">
                <p className="text-xs text-slate-400">
                  Already have an account?{" "}
                  <Link href="/login" className="text-brand-purple hover:underline font-bold">
                    Sign In
                  </Link>
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 text-[11px] text-slate-500 flex-wrap pt-2">
              <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
              <span>•</span>
              <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
              <span>•</span>
              <Link href="/contact" className="hover:text-slate-300 transition-colors">Support</Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 py-4 px-6 text-center text-xs text-slate-600 border-t border-white/[0.04]">
        © 2026 CreatorFlow AI. Designed for high-velocity YouTube creators.
      </footer>
    </div>
  );
}
