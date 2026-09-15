import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { db } from "@/lib/db";

export const runtime = "nodejs";

function toCsv(rows: Record<string, unknown>[], columns: string[]): string {
  const esc = (v: unknown) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [columns.join(","), ...rows.map((r) => columns.map((c) => esc(r[c])).join(","))].join("\n");
}

export async function GET(req: NextRequest) {
  return requireAdmin(req, async () => {
    const type = req.nextUrl.searchParams.get("type") || "inquiries";

    if (type === "inquiries") {
      const items = await db.inquiry.findMany({ orderBy: { createdAt: "desc" } });
      const csv = toCsv(items as unknown as Record<string, unknown>[], [
        "id", "createdAt", "name", "countryCode", "mobile", "city", "country", "email",
        "product", "resinType", "quantity", "application", "message", "status", "notes",
        "sourcePage", "landingPage", "referrer", "utmSource", "utmMedium", "utmCampaign", "utmTerm", "utmContent", "device",
      ]);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="aurexa-inquiries-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    if (type === "products") {
      const items = await db.product.findMany({ orderBy: { createdAt: "desc" }, include: { category: { select: { name: true } } } });
      const rows = items.map((p) => ({
        name: p.name, sku: p.sku, slug: p.slug, category: p.category?.name || "",
        shortDesc: p.shortDesc, resinType: p.resinType, mixingRatio: p.mixingRatio,
        packSizes: p.packSizes, applications: p.applications, finish: p.finish,
        seoTitle: p.seoTitle, seoDescription: p.seoDescription,
        published: p.published ? "yes" : "no", featured: p.featured ? "yes" : "no",
      }));
      const csv = toCsv(rows, [
        "name", "sku", "slug", "category", "shortDesc", "resinType", "mixingRatio",
        "packSizes", "applications", "finish", "seoTitle", "seoDescription", "published", "featured",
      ]);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="aurexa-products-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    return NextResponse.json({ error: "Unknown export type" }, { status: 400 });
  });
}
