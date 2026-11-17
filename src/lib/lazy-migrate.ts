import { db } from "@/lib/db";

/**
 * Lazy, idempotent schema migrations for the production Turso database.
 *
 * Netlify builds run `prisma generate` from the repo schema, but the Turso
 * database may not yet have newly added columns/tables. These helpers create
 * them on first use, so a deploy never breaks the live site — no manual
 * migration step required. Each operation runs at most once per process.
 */

const done = new Set<string>();

export async function ensureColumn(table: string, column: string, ddlType = "TEXT"): Promise<void> {
  const key = `${table}.${column}`;
  if (done.has(key)) return;
  try {
    await db.$executeRawUnsafe(`ALTER TABLE "${table}" ADD COLUMN "${column}" ${ddlType}`);
    done.add(key);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/duplicate column|already exists/i.test(msg)) {
      done.add(key); // column already present — all good
      return;
    }
    throw err;
  }
}

const REVISIONS_DDL = `CREATE TABLE IF NOT EXISTS "ContentRevision" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "entityLabel" TEXT NOT NULL DEFAULT '',
  "action" TEXT NOT NULL DEFAULT 'update',
  "snapshot" TEXT NOT NULL,
  "createdBy" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
)`;

export async function ensureRevisionsTable(): Promise<void> {
  if (done.has("ContentRevision")) return;
  await db.$executeRawUnsafe(REVISIONS_DDL);
  await db.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "ContentRevision_entityType_entityId_idx" ON "ContentRevision"("entityType", "entityId")`
  );
  done.add("ContentRevision");
}

export async function ensureLandingSource(): Promise<void> {
  return ensureColumn("LandingPage", "source");
}

export async function ensureMediaData(): Promise<void> {
  return ensureColumn("Media", "data");
}
