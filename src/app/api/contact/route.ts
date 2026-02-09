import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const rate = checkRateLimit(`contact:${ip}`, 5, 60 * 60 * 1000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "rate_limit" },
        { status: 429, headers: { "Retry-After": "3600" } }
      );
    }

    const body = await req.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const phone = String(body.phone || "").trim();
    const subject = String(body.subject || "general").trim();
    const message = String(body.message || "").trim();
    const consent = Boolean(body.consent);
    const company = String(body.company || "").trim();

    if (company) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    if (name.length < 2 || name.length > 80) {
      return NextResponse.json({ error: "invalid_name" }, { status: 400 });
    }
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "invalid_email" }, { status: 400 });
    }
    if (message.length < 10 || message.length > 2000) {
      return NextResponse.json({ error: "invalid_message" }, { status: 400 });
    }
    if (!consent) {
      return NextResponse.json({ error: "invalid_consent" }, { status: 400 });
    }

    // TODO: Integrate email sending (Resend) when configured.
    // We keep minimal data and do not persist contact messages by default.

    return NextResponse.json(
      { ok: true },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json(
      { error: "server_error" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
