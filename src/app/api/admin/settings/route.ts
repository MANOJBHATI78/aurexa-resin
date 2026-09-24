import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getSettings, saveSettings, type SiteSettings } from "@/lib/settings";
import { normalizeTrackingFields } from "@/lib/tracking-input";

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
    // Accept whatever the admin pasted — IDs or full snippets — then normalize tracking keys
    const normalized = normalizeTrackingFields(body as Record<string, string>);
    const allowed = Object.keys(normalized).filter(
      (k) => typeof normalized[k] === "string" || normalized[k] === "",
    );
    const payload: Record<string, string> = {};
    for (const k of allowed) payload[k] = String(normalized[k] ?? "");
    await saveSettings(payload);
    return NextResponse.json({ ok: true, saved: allowed.length });
  });
}
