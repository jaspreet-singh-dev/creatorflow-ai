"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Mail, Lock, ArrowRight, PlayCircle, AlertCircle } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signInDemo } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const { error: signInError } = await signIn(email, password);
    setIsLoading(false);

    if (signInError) {
      setError(signInError.message || "Invalid login credentials. Please try again or use the Demo Sandbox.");
    } else {
      router.push("/dashboard");
    }
  };

  const handleDemoLogin = () => {
    signInDemo();
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-navy-950 relative overflow-hidden">
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-purple/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-blue/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-purple to-brand-blue flex items-center justify-center shadow-glow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-white">CreatorFlow <span className="text-brand-purple">AI</span></span>
          </Link>
          <p className="text-sm text-slate-400">
            Sign in to manage your YouTube channels, AI metadata & publishing.
          </p>
        </div>

        {/* Demo Fast Access Pill */}
        <div className="bg-navy-900/90 border border-navy-800 rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-sm">
          <div className="text-left">
            <p className="text-xs font-semibold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Instant Evaluation Sandbox
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Explore with pre-seeded channels & demo data.
            </p>
          </div>
          <Button
            type="button"
            variant="blue"
            size="sm"
            onClick={handleDemoLogin}
            className="text-xs h-8 px-3 shrink-0"
          >
            <PlayCircle className="w-3.5 h-3.5 mr-1" />
            Launch Demo
          </Button>
        </div>

        <Card className="border-navy-800 bg-navy-900/90 shadow-2xl backdrop-blur-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg text-white">Sign In</CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Enter your Supabase email and password to access your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Email Address</label>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  icon={<Mail className="w-4 h-4" />}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-300">Password</label>
                  <Link
                    href="/reset-password"
                    className="text-xs text-brand-purple hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  type="password"
                  placeholder="••••••••"
                  icon={<Lock className="w-4 h-4" />}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                variant="gradient"
                className="w-full text-sm font-semibold"
                isLoading={isLoading}
              >
                Sign In to Dashboard
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-navy-800/80 pt-4">
            <p className="text-xs text-slate-400">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-brand-purple hover:underline font-semibold">
                Sign Up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
