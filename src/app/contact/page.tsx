"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowLeft,
  Mail,
  MessageSquare,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("General Support");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState(""); // Anti-spam field

  const [isLoading, setIsLoading] = useState(false);
  const [successTicket, setSuccessTicket] = useState<{ id: string; message: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessTicket(null);

    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMessage("Please fill in all required fields (Name, Email, and Message).");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          category,
          subject: subject.trim() || undefined,
          message: message.trim(),
          honeypot,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessTicket({
          id: data.ticketId || "CF-TKT-ACK",
          message: data.message || "Thank you. Your message has been received.",
        });
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
      } else {
        setErrorMessage(data.error || "Failed to submit message. Please try again or email us directly.");
      }
    } catch {
      setErrorMessage("A network error occurred. Please email us directly at support@creatorflow.ai.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col selection:bg-brand-purple/30 selection:text-white">
      {/* Navigation Header */}
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
            <Link href="/pricing">
              <Button variant="outline" size="sm" className="text-xs border-navy-700 hidden sm:inline-flex">
                Pricing
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-12 lg:py-16 space-y-12 w-full">
        <div className="space-y-3 max-w-2xl">
          <Badge variant="default" className="text-xs px-3 py-1 font-semibold uppercase tracking-wider">
            Help & Customer Care
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Contact Support & Business Inquiries
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Have questions about your subscription, YouTube channel integration, or need help with a refund? Send us a message and our team will get back to you within 24 to 48 business hours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Details Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl border border-navy-800 bg-navy-900/60 space-y-6 shadow-card">
              <h2 className="text-base font-bold text-white border-b border-navy-800 pb-3 flex items-center gap-2">
                <Building className="w-4 h-4 text-brand-purple" />
                Business & Contact Directory
              </h2>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-200 block">General & Billing Support:</span>
                    <a href="mailto:support@creatorflow.ai" className="text-brand-purple hover:underline font-mono">
                      support@creatorflow.ai
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-200 block">Privacy & Grievance Officer:</span>
                    <a href="mailto:privacy@creatorflow.ai" className="text-brand-purple hover:underline font-mono">
                      privacy@creatorflow.ai
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-200 block">Support Response Window:</span>
                    <span className="text-slate-400">Monday to Friday, 9:00 AM – 6:00 PM IST (Response within 24–48 hours)</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-navy-800 bg-navy-950 text-xs text-slate-400 space-y-1.5">
                <p className="font-semibold text-slate-300">Merchant Entity Information:</p>
                <p><span className="text-slate-500">Legal Entity:</span> Jaspreet Singh (CreatorFlow AI)</p>
                <p><span className="text-slate-500">Nature of Business:</span> Software as a Service (SaaS)</p>
                <p><span className="text-slate-500">Location:</span> Delhi/NCR, India</p>
                <p><span className="text-slate-500">Operating Currency:</span> Indian Rupee (INR - ₹)</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-2xl border border-navy-800 bg-navy-900/80 shadow-card">
              <h2 className="text-lg font-bold text-white mb-1">Send a Message</h2>
              <p className="text-xs text-slate-400 mb-6">
                All submissions are securely logged and reviewed by verified support personnel.
              </p>

              {successTicket && (
                <div className="mb-6 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs sm:text-sm space-y-2">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Message Dispatched (Ticket #{successTicket.id})</span>
                  </div>
                  <p className="text-emerald-200/90">{successTicket.message}</p>
                </div>
              )}

              {errorMessage && (
                <div className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Honeypot field (hidden from legitimate users, catches automated bots) */}
                <input
                  type="text"
                  name="website_url"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Your Full Name <span className="text-red-400">*</span>
                    </label>
                    <Input
                      placeholder="e.g. Jaspreet Singh"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="text-xs h-10 bg-navy-950 border-navy-700"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Email Address <span className="text-red-400">*</span>
                    </label>
                    <Input
                      type="email"
                      placeholder="e.g. creator@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="text-xs h-10 bg-navy-950 border-navy-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Inquiry Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full h-10 rounded-lg bg-navy-950 border border-navy-700 text-xs text-slate-200 px-3 focus:outline-none focus:border-brand-purple"
                    >
                      <option value="General Support">General Support</option>
                      <option value="Billing & Refund">Billing, Invoices & Refund</option>
                      <option value="YouTube OAuth">YouTube OAuth / Channel Connection</option>
                      <option value="Feature Request">Feature Request</option>
                      <option value="Security Report">Security Vulnerability Report</option>
                      <option value="Privacy / DPDP Grievance">Privacy / DPDP Grievance</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Subject</label>
                    <Input
                      placeholder="Brief summary of your inquiry"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="text-xs h-10 bg-navy-950 border-navy-700"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                    <label>
                      Detailed Message <span className="text-red-400">*</span>
                    </label>
                    <span className="text-[11px] text-slate-500 font-normal">{message.length}/3000 chars</span>
                  </div>
                  <Textarea
                    placeholder="Please describe how we can help you. If inquiring about a payment, please mention your invoice or order number."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    required
                    maxLength={3000}
                    className="text-xs bg-navy-950 border-navy-700 resize-none text-slate-100 placeholder:text-slate-500"
                  />
                </div>

                <Button
                  type="submit"
                  variant="gradient"
                  isLoading={isLoading}
                  className="w-full text-xs font-bold py-2.5 shadow-glow"
                >
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  Submit Support Ticket
                </Button>

                <p className="text-[11px] text-slate-500 text-center pt-2">
                  By submitting, you agree to our{" "}
                  <Link href="/privacy" className="text-brand-purple hover:underline">Privacy Policy</Link>{" "}
                  and{" "}
                  <Link href="/terms" className="text-brand-purple hover:underline">Terms of Service</Link>.
                </p>
              </form>
            </div>
          </div>
        </div>
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
