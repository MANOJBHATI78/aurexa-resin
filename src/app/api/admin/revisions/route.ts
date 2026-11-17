import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { db } from "@/lib/db";
import { ensureRevisionsTable, ensureLandingSource } from "@/lib/lazy-migrate";

export const runtime = "nodejs";

async function modelFor(entityType: string) {
  switch (entityType) {
    case "product": return { delegate: db.product };
    case "blogPost": return { delegate: db.blogPost };
    case "landingPage": return { delegate: db.landingPage, prepare: ensureLandingSource };
    case "page": return { delegate: db.page };
    case "category": return { delegate: db.category };
    case "locationPage": return { delegate: db.locationPage };
    case "application": return { delegate: db.application };
    default: return null;
  }
}

/** GET — list revisions (latest first, optional ?entityType=&entityId=) */
export async function GET(req: NextRequest) {
  return requireAdmin(req, async () => {
    await ensureRevisionsTable();
    const entityType = req.nextUrl.searchParams.get("entityType") || undefined;
    const entityId = req.nextUrl.searchParams.get("entityId") || undefined;
    const items = await db.contentRevision.findMany({
      where: { ...(entityType ? { entityType } : {}), ...(entityId ? { entityId } : {}) },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: { id: true, entityType: true, entityId: true, entityLabel: true, action: true, createdBy: true, createdAt: true },
    });
    return NextResponse.json({ items });
  });
}

/** POST — restore a revision: { revisionId } */
export async function POST(req: NextRequest) {
  return requireAdmin(req, async () => {
    await ensureRevisionsTable();
    const body = (await req.json()) as { revisionId?: string };
    if (!body.revisionId) return NextResponse.json({ error: "revisionId is required." }, { status: 400 });

    const revision = await db.contentRevision.findUnique({ where: { id: body.revisionId } });
    if (!revision) return NextResponse.json({ error: "Revision not found." }, { status: 404 });

    const target = await modelFor(revision.entityType);
    if (!target) return NextResponse.json({ error: `Unknown entity type "${revision.entityType}".` }, { status: 400 });

    let snapshot: Record<string, unknown>;
    try {
      snapshot = JSON.parse(revision.snapshot) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "Snapshot is corrupt." }, { status: 500 });
    }

    // Strip system fields before writing back
    const data: Record<string, unknown> = { ...snapshot };
    delete data.id; delete data.createdAt; delete data.updatedAt;

    if (target.prepare) await target.prepare();

    // For "delete" revisions the entity row is gone — recreate it with the original id
    if (revision.action === "delete") {
      const exists = await (target.delegate as any).findUnique({ where: { id: revision.entityId } });
      if (exists) {
        return NextResponse.json({ error: "A record with this id already exists — restore blocked to avoid overwriting newer data." }, { status: 409 });
      }
      await (target.delegate as any).create({ data: { ...data, id: revision.entityId } });
      return NextResponse.json({ ok: true, restored: revision.entityLabel || revision.entityType, action: "recreated" });
    }

    await (target.delegate as any).update({ where: { id: revision.entityId }, data });
    return NextResponse.json({ ok: true, restored: revision.entityLabel || revision.entityType, action: "restored" });
  });
}

/** DELETE — permanently remove a revision entry: ?id= */
export async function DELETE(req: NextRequest) {
  return requireAdmin(req, async () => {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id is required." }, { status: 400 });
    await db.contentRevision.delete({ where: { id } }).catch(() => undefined);
    return NextResponse.json({ ok: true });
  });
}
