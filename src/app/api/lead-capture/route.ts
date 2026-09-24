import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit, cleanupRateLimits } from "@/lib/rate-limit";

export const runtime = "nodejs";

/**
 * Lead capture from WhatsApp / Call click gate.
 * Fired by the LeadGate component before the visitor is redirected.
 * Saves directly into the Inquiries pipeline so the admin sees it LIVE.
 */
export async function POST(req: NextRequest) {
  cleanupRateLimits();

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const limited = rateLimit(`lead-gate:${ip}`, 12, 10 * 60_000);
  if (!limited.ok) {
    return NextResponse.json({ ok: true }); // silent — never block the customer
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const name = String(body.name || "").trim().slice(0, 100);
  const mobile = String(body.mobile || "").replace(/[^0-9]/g, "").slice(0, 12);
  const kind = body.kind === "CALL" ? "CALL" : "WHATSAPP";
  const page = String(body.page || "/").slice(0, 300);

  if (!name || mobile.length < 10) {
    return NextResponse.json({ error: "Name and valid mobile required." }, { status: 400 });
  }

  try {
    await db.inquiry.create({
      data: {
        name,
        mobile,
        countryCode: "+91",
        city: "—",
        country: "—",
        application: kind === "CALL" ? "Call Button Click" : "WhatsApp Button Click",
        message:
          kind === "CALL"
            ? `Visitor clicked the CALL button on ${page}. Number captured before connecting the call.`
            : `Visitor clicked the WhatsApp button on ${page}. Number captured before opening chat.`,
        status: "NEW",
        sourcePage: page,
        currentUrl: page,
        referrer: String(body.referrer || "").slice(0, 500) || null,
        utmSource: kind === "CALL" ? "call-click" : "whatsapp-click",
        utmMedium: "lead-gate",
        device: /mobile|android|iphone/i.test(req.headers.get("user-agent") || "") ? "mobile" : "desktop",
      },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("lead-capture error:", e);
    return NextResponse.json({ ok: true }); // still OK — never block the redirect
  }
}
