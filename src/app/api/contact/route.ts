import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export const dynamic = "force-dynamic";

// In-memory sliding rate limiter (5 submissions per IP per 10 minutes)
const ipRateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = ipRateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    ipRateLimitMap.set(ip, { count: 1, resetAt: now + 10 * 60 * 1000 });
    return false;
  }

  if (record.count >= 5) {
    return true;
  }

  record.count += 1;
  return false;
}

// Sanitize string inputs to prevent XSS / script injection
function sanitizeInput(str: string): string {
  return str
    .replace(/[<>]/g, "")
    .trim();
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many contact submissions. Please wait 10 minutes before submitting another message.",
        },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request payload." },
        { status: 400 }
      );
    }

    const { name, email, subject, category, message, honeypot } = body;

    // Honeypot spam check: hidden field must be empty
    if (honeypot && String(honeypot).trim() !== "") {
      return NextResponse.json(
        { success: true, message: "Message received." },
        { status: 200 }
      );
    }

    // Validation
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Please enter your name (at least 2 characters)." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== "string" || !emailRegex.test(email.trim())) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    if (!message || typeof message !== "string" || message.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: "Message must be at least 10 characters long." },
        { status: 400 }
      );
    }

    if (message.length > 3000) {
      return NextResponse.json(
        { success: false, error: "Message exceeds maximum permitted length (3000 characters)." },
        { status: 400 }
      );
    }

    const sanitizedName = sanitizeInput(name).substring(0, 100);
    const sanitizedEmail = email.trim().toLowerCase().substring(0, 150);
    const sanitizedSubject = sanitizeInput(subject || "General Inquiry").substring(0, 150);
    const sanitizedCategory = sanitizeInput(category || "General Support").substring(0, 50);
    const sanitizedMessage = sanitizeInput(message);
    const ticketId = `CF-TKT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Optional Supabase logging
    try {
      const serviceClient = createServiceRoleClient();
      await serviceClient.from("contact_messages").insert({
        ticket_id: ticketId,
        name: sanitizedName,
        email: sanitizedEmail,
        subject: sanitizedSubject,
        category: sanitizedCategory,
        message: sanitizedMessage,
        ip_address: ip,
        status: "new",
        created_at: new Date().toISOString(),
      });
    } catch {
      // If contact_messages table is pending migration, ticket is still acknowledged
    }

    return NextResponse.json({
      success: true,
      ticketId,
      message: "Thank you for reaching out. Your message has been received by CreatorFlow support. We will reply to your email within 24–48 business hours.",
    });
  } catch (error: any) {
    console.error("Contact Form Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process contact submission. Please email support@creatorflow.ai directly." },
      { status: 500 }
    );
  }
}
