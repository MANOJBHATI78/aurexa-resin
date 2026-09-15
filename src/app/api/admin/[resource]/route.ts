import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getResource } from "@/lib/admin-resources";
import { ensureUniqueSlug } from "@/lib/admin-crud";
import { db } from "@/lib/db";

export const runtime = "nodejs";

const SLUG_MODELS: Record<string, any> = {
  products: db.product,
  categories: db.category,
  blog: db.blogPost,
  pages: db.page,
  landing: db.landingPage,
  applications: db.application,
  locations: db.locationPage,
};

export async function GET(req: NextRequest, ctx: { params: Promise<{ resource: string }> }) {
  const { resource } = await ctx.params;
  return requireAdmin(req, async () => {
    const crud = getResource(resource);
    if (!crud) return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
    return crud.list(req);
  });
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ resource: string }> }) {
  const { resource } = await ctx.params;
  return requireAdmin(req, async () => {
    const crud = getResource(resource);
    if (!crud) return NextResponse.json({ error: "Unknown resource" }, { status: 404 });

    // Slug uniqueness check
    if (SLUG_MODELS[resource]) {
      const body = await req.clone().json().catch(() => ({}));
      if (body?.slug) {
        body.slug = await ensureUniqueSlug(SLUG_MODELS[resource], String(body.slug));
        // Replace request body
        const patched = new NextRequest(req.url, { method: "POST", body: JSON.stringify(body), headers: req.headers });
        return crud.create(patched);
      }
    }
    return crud.create(req);
  });
}
