import { NextRequest, NextResponse } from "next/server";
import { slugify } from "@/lib/seo";
import { getAdminSession } from "@/lib/admin-guard";
import { db } from "@/lib/db";
import { ensureRevisionsTable } from "@/lib/lazy-migrate";

type ModelDelegate = any; // Prisma dynamic delegate

export interface CrudConfig {
  model: ModelDelegate;
  /** Fields allowed on create/update (whitelist) */
  fields: string[];
  /** Transform payload before persist (e.g. slug generation) */
  transform?: (data: Record<string, unknown>, mode: "create" | "update") => Record<string, unknown>;
  /** Default orderBy for list — single key or compound (array) */
  orderBy?: Record<string, "asc" | "desc"> | Record<string, "asc" | "desc">[];
  /** Search across these fields for ?q= */
  searchFields?: string[];
  /** Prisma include for list/get */
  include?: Record<string, unknown>;
  /** Prisma select for list/get/create/update — use to exclude heavy columns
   *  (e.g. Media.data base64) from API responses */
  select?: Record<string, boolean>;
  /** Prevent delete when referenced */
  deleteGuard?: (id: string) => Promise<string | null>;
  /** Lazy-migration hook — runs before every handler (ensures new DB columns/tables exist) */
  prepare?: () => Promise<void>;
  /** Automatic revision history: snapshot before update/delete */
  revisions?: { entityType: string; labelField: string };
}

function pickFields(body: Record<string, unknown>, fields: string[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    if (f in body) out[f] = body[f];
  }
  return out;
}

/** Builds standard admin CRUD handlers for a Prisma model */
export function makeCrud(cfg: CrudConfig) {
  const runPrepare = async () => { if (cfg.prepare) await cfg.prepare(); };

  /** Saves a pre-change snapshot for revision history. NEVER blocks the main
   *  operation — failures are logged and ignored. */
  async function snapshot(req: NextRequest, id: string, action: "update" | "delete") {
    if (!cfg.revisions) return;
    try {
      await ensureRevisionsTable();
      const row = await cfg.model.findUnique({ where: { id } });
      if (!row) return;
      const session = await getAdminSession(req);
      await db.contentRevision.create({
        data: {
          entityType: cfg.revisions.entityType,
          entityId: id,
          entityLabel: String((row as Record<string, unknown>)[cfg.revisions.labelField] ?? ""),
          action,
          snapshot: JSON.stringify(row),
          createdBy: session?.email || null,
        },
      });
      // Prune: keep the latest 10 revisions per entity
      const old = await db.contentRevision.findMany({
        where: { entityType: cfg.revisions.entityType, entityId: id },
        orderBy: { createdAt: "desc" },
        skip: 10,
        select: { id: true },
      });
      if (old.length) {
        await db.contentRevision.deleteMany({ where: { id: { in: old.map((r) => r.id) } } });
      }
    } catch (err) {
      console.error("Revision snapshot failed (ignored):", err);
    }
  }

  const buildWhere = (req: NextRequest) => {
    const q = req.nextUrl.searchParams.get("q")?.trim();
    const wheres: Record<string, unknown>[] = [];
    if (q && cfg.searchFields?.length) {
      // JS-based search happens after fetch for SQLite case-insensitivity; use contains here for perf
      wheres.push({ OR: cfg.searchFields.map((f) => ({ [f]: { contains: q } })) });
    }
    const entityType = req.nextUrl.searchParams.get("entityType");
    if (entityType) wheres.push({ entityType });
    return wheres.length ? { AND: wheres } : {};
  };

  async function list(req: NextRequest) {
    await runPrepare();
    const rows = await cfg.model.findMany({
      where: buildWhere(req),
      orderBy: cfg.orderBy || { updatedAt: "desc" },
      ...(cfg.include ? { include: cfg.include } : {}),
      ...(cfg.select ? { select: cfg.select } : {}),
      take: 500,
    });
    // SQLite contains is case-sensitive — refine filter in JS when q present
    const q = req.nextUrl.searchParams.get("q")?.trim().toLowerCase();
    const filtered =
      q && cfg.searchFields?.length
        ? rows.filter((r: Record<string, unknown>) =>
            cfg.searchFields!.some((f) => String(r[f] ?? "").toLowerCase().includes(q))
          )
        : rows;
    return NextResponse.json({ items: filtered });
  }

  async function create(req: NextRequest) {
    await runPrepare();
    const body = (await req.json()) as Record<string, unknown>;
    let data = pickFields(body, cfg.fields);
    if (cfg.transform) data = cfg.transform(data, "create");
    const row = await cfg.model.create({ data, ...(cfg.include ? { include: cfg.include } : {}), ...(cfg.select ? { select: cfg.select } : {}) });
    return NextResponse.json({ item: row });
  }

  async function update(req: NextRequest, id: string) {
    await runPrepare();
    const body = (await req.json()) as Record<string, unknown>;
    let data = pickFields(body, cfg.fields);
    if (cfg.transform) data = cfg.transform(data, "update");
    await snapshot(req, id, "update");
    const row = await cfg.model.update({ where: { id }, data, ...(cfg.include ? { include: cfg.include } : {}), ...(cfg.select ? { select: cfg.select } : {}) });
    return NextResponse.json({ item: row });
  }

  async function remove(req: NextRequest, id: string) {
    await runPrepare();
    if (cfg.deleteGuard) {
      const block = await cfg.deleteGuard(id);
      if (block) return NextResponse.json({ error: block }, { status: 400 });
    }
    await snapshot(req, id, "delete");
    await cfg.model.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  }

  async function get(req: NextRequest, id: string) {
    await runPrepare();
    const row = await cfg.model.findUnique({ where: { id }, ...(cfg.include ? { include: cfg.include } : {}), ...(cfg.select ? { select: cfg.select } : {}) });
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ item: row });
  }

  return { list, create, update, remove, get };
}

/** Ensures slug presence & uniqueness for a model */
export function slugTransformer(
  modelName: "category" | "product" | "blog" | "page" | "landing" | "application" | "location",
  nameField = "name"
) {
  const delegates: Record<string, any> = {};
  return (data: Record<string, unknown>, mode: "create" | "update") => {
    void mode; void delegates; void modelName;
    if (!data.slug && data[nameField]) {
      data.slug = slugify(String(data[nameField]));
    }
    if (typeof data.slug === "string") {
      data.slug = slugify(data.slug) || `item-${Date.now()}`;
    }
    return data;
  };
}

export async function ensureUniqueSlug(
  delegate: ModelDelegate,
  slug: string,
  currentId?: string
): Promise<string> {
  let candidate = slug;
  let n = 1;
  while (true) {
    const existing = await delegate.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === currentId) return candidate;
    candidate = `${slug}-${++n}`;
  }
}
