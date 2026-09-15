import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getResource } from "@/lib/admin-resources";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(req: NextRequest, ctx: { params: Promise<{ resource: string; id: string }> }) {
  const { resource, id } = await ctx.params;
  return requireAdmin(req, async () => {
    const crud = getResource(resource);
    if (!crud) return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
    return crud.get(req, id);
  });
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ resource: string; id: string }> }) {
  const { resource, id } = await ctx.params;
  return requireAdmin(req, async () => {
    const crud = getResource(resource);
    if (!crud) return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
    return crud.update(req, id);
  });
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ resource: string; id: string }> }) {
  const { resource, id } = await ctx.params;
  return requireAdmin(req, async () => {
    const crud = getResource(resource);
    if (!crud) return NextResponse.json({ error: "Unknown resource" }, { status: 404 });

    // Guard: category with products
    if (resource === "categories") {
      const count = await db.product.count({ where: { categoryId: id } });
      if (count > 0) {
        return NextResponse.json(
          { error: `Cannot delete: ${count} product(s) still assigned to this category. Reassign them first.` },
          { status: 400 }
        );
      }
    }
    return crud.remove(req, id);
  });
}
