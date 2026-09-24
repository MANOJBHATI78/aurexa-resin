import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit, cleanupRateLimits } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  cleanupRateLimits();

  // Rate limit by IP
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const limited = rateLimit(`inquiry:${ip}`, 5, 10 * 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many inquiries from this connection. Please try again later or WhatsApp us directly." },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot check — bots fill hidden fields
  if (typeof body.hp_field === "string" && body.hp_field.trim()) {
    return NextResponse.json({ error: "Submission rejected." }, { status: 400 });
  }

  // Mandatory fields
  const name = str(body.name);
  const mobileDigits = str(body.mobile).replace(/[^0-9]/g, "");
  const city = str(body.city);
  const country = str(body.country);

  if (!name || name.length > 100) return NextResponse.json({ error: "Please enter a valid name." }, { status: 400 });
  if (mobileDigits.length < 7 || mobileDigits.length > 12)
    return NextResponse.json({ error: "Please enter a valid mobile number." }, { status: 400 });
  if (!city || city.length > 100) return NextResponse.json({ error: "Please enter your city." }, { status: 400 });
  if (!country || country.length > 100) return NextResponse.json({ error: "Please select your country." }, { status: 400 });

  try {
    const inquiry = await db.inquiry.create({
      data: {
        name,
        mobile: mobileDigits,
        countryCode: str(body.countryCode) || "+91",
        city,
        country,
        email: str(body.email) || null,
        product: str(body.product) || null,
        resinType: str(body.resinType) || null,
        quantity: str(body.quantity) || null,
        application: str(body.application) || null,
        message: str(body.message) || null,
        sourcePage: str(body.sourcePage) || null,
        landingPage: str(body.landingPage) || null,
        currentUrl: str(body.currentUrl) || null,
        referrer: str(body.referrer) || null,
        utmSource: str(body.utm_source) || null,
        utmMedium: str(body.utm_medium) || null,
        utmCampaign: str(body.utm_campaign) || null,
        utmTerm: str(body.utm_term) || null,
        utmContent: str(body.utm_content) || null,
        device: str(body.device) || null,
      },
    });
    return NextResponse.json({ ok: true, id: inquiry.id });
  } catch (e) {
    console.error("Inquiry save failed:", e);
    return NextResponse.json({ error: "Could not save your inquiry. Please try again or WhatsApp us." }, { status: 500 });
  }
}

function str(v: unknown): string {
  return typeof v === "string" ? v.trim().slice(0, 2000) : "";
}
