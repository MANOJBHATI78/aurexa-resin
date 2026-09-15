import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getSettings, saveSettings, type SiteSettings } from "@/lib/settings";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  return requireAdmin(req, async () => {
    const settings = await getSettings();
    return NextResponse.json({ settings });
  });
}

export async function PUT(req: NextRequest) {
  return requireAdmin(req, async (session) => {
    if (!["SUPER_ADMIN", "ADMIN", "SEO_MANAGER"].includes(session.role)) {
      return NextResponse.json({ error: "Insufficient permissions." }, { status: 403 });
    }
    const body = (await req.json()) as Partial<Record<keyof SiteSettings, string>>;
    // Only save known keys
    const allowed = Object.keys(body).filter((k) => typeof body[k as keyof SiteSettings] === "string" || body[k as keyof SiteSettings] === "");
    const payload: Record<string, string> = {};
    for (const k of allowed) payload[k] = String(body[k as keyof SiteSettings] ?? "");
    await saveSettings(payload);
    return NextResponse.json({ ok: true });
  });
}
