/**
 * One-time migration: local SQLite  →  Turso (libSQL cloud)
 *
 * Usage (from project root):
 *   bun scripts/migrate-to-turso.ts <TURSO_DATABASE_URL> <TURSO_AUTH_TOKEN>
 *   (ya env vars TURSO_DATABASE_URL / TURSO_AUTH_TOKEN set karke bina args ke)
 *
 * What it does:
 *   1. Generates the exact SQLite DDL from prisma/schema.prisma (prisma migrate diff)
 *   2. Creates all tables on the Turso database (idempotent: IF NOT EXISTS)
 *   3. Copies every table row-by-row (upsert by id → safe to re-run)
 *   4. Prints a source-vs-target count comparison
 */
import { execSync } from "child_process";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";

const args = process.argv.slice(2);
const url = args[0] || process.env.TURSO_DATABASE_URL;
const token = args[1] || process.env.TURSO_AUTH_TOKEN;

const allowFile = args.includes("--allow-file");

if (!url || !(url.startsWith("libsql://") || (allowFile && url.startsWith("file:")))) {
  console.error("❌ Turso URL chahiye (libsql://...). Arg ya TURSO_DATABASE_URL do.");
  console.error("   Example: bun scripts/migrate-to-turso.ts libsql://aurexa-prod-xxx.turso.io eyJ...");
  console.error("   (Testing ke liye file: URL sirf --allow-file ke saath)");
  process.exit(1);
}
if (!token) {
  console.error("❌ Turso auth token chahiye. Arg ya TURSO_AUTH_TOKEN do.");
  process.exit(1);
}

// 1) DDL from schema (exact tables/indexes the app expects)
const ddl = execSync(
  "bunx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script",
  { encoding: "utf-8", cwd: process.cwd() }
);

// 2) Create schema on Turso via raw libsql client
async function createSchema() {
  const { createClient } = await import("@libsql/client");
  const raw = createClient({ url, authToken: token });
  const statements = ddl
    .split(/;\s*\n/) // statements end with ";" + newline
    .map((chunk) =>
      chunk
        .split("\n")
        .filter((line) => !line.trim().startsWith("--")) // strip -- comments
        .join("\n")
        .trim()
    )
    .filter(Boolean);
  for (const stmt of statements) {
    try {
      await raw.execute(stmt);
    } catch (e) {
      // idempotent re-runs: table/index already exists is fine
      if (!/already exists/i.test(String(e))) throw e;
    }
  }
  raw.close();
  console.log(`✅ Schema created/verified on Turso (${statements.length} statements)`);
}

// 3) Copy data
const local = new PrismaClient(); // local SQLite (DATABASE_URL)
const remote = new PrismaClient({
  adapter: new PrismaLibSQL({ url, authToken: token }),
});

type ModelName =
  | "adminUser" | "category" | "application" | "navigationItem" | "product"
  | "blogPost" | "page" | "landingPage" | "locationPage" | "faq"
  | "testimonial" | "homeSection" | "inquiry" | "media" | "siteSetting"
  | "redirect" | "customCode" | "pageSchema";

const PK: Record<ModelName, string> = {
  adminUser: "id", category: "id", application: "id", navigationItem: "id",
  product: "id", blogPost: "id", page: "id", landingPage: "id",
  locationPage: "id", faq: "id", testimonial: "id", homeSection: "id",
  inquiry: "id", media: "id", siteSetting: "key", redirect: "id",
  customCode: "id", pageSchema: "id",
};

async function copyModel(model: ModelName, rows: Record<string, unknown>[]) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const delegate = (remote as any)[model];
  const pk = PK[model];
  let n = 0;
  for (const row of rows) {
    const { [pk]: id, ...rest } = row as Record<string, unknown>;
    await delegate.upsert({
      where: { [pk]: id },
      create: { ...(rest as object), [pk]: id },
      update: rest,
    });
    n++;
  }
  console.log(`   ${model}: ${n} rows`);
  return n;
}

async function main() {
  console.log("▶ Source: local SQLite | Target:", url.split("?")[0]);
  await createSchema();

  console.log("▶ Copying data…");
  await copyModel("adminUser", await local.adminUser.findMany());
  await copyModel("category", await local.category.findMany());
  await copyModel("application", await local.application.findMany());

  // NavigationItem: self-referencing FK → parents first
  await copyModel("navigationItem", await local.navigationItem.findMany({ where: { parentId: null } }));
  await copyModel("navigationItem", await local.navigationItem.findMany({ where: { NOT: { parentId: null } } }));

  await copyModel("product", await local.product.findMany());
  await copyModel("blogPost", await local.blogPost.findMany());
  await copyModel("page", await local.page.findMany());
  await copyModel("landingPage", await local.landingPage.findMany());
  await copyModel("locationPage", await local.locationPage.findMany());
  await copyModel("faq", await local.faq.findMany());
  await copyModel("testimonial", await local.testimonial.findMany());
  await copyModel("homeSection", await local.homeSection.findMany());
  await copyModel("inquiry", await local.inquiry.findMany());
  await copyModel("media", await local.media.findMany());
  await copyModel("siteSetting", await local.siteSetting.findMany());
  await copyModel("redirect", await local.redirect.findMany());
  await copyModel("customCode", await local.customCode.findMany());
  await copyModel("pageSchema", await local.pageSchema.findMany());

  // 4) Verification
  console.log("\n▶ Verification (source → target):");
  const models: ModelName[] = [
    "adminUser", "category", "application", "navigationItem", "product",
    "blogPost", "page", "landingPage", "locationPage", "faq",
    "testimonial", "homeSection", "inquiry", "media", "siteSetting",
    "redirect", "customCode", "pageSchema",
  ];
  let allOk = true;
  for (const m of models) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = await (local as any)[m].count();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const t = await (remote as any)[m].count();
    const ok = s === t;
    if (!ok) allOk = false;
    console.log(`   ${ok ? "✅" : "❌"} ${m}: ${s} → ${t}`);
  }

  await local.$disconnect();
  await remote.$disconnect();
  console.log(allOk ? "\n🎉 MIGRATION COMPLETE — Turso ready for Netlify" : "\n⚠️ Mismatch — dobara run karo (script idempotent hai)");
  process.exit(allOk ? 0 : 1);
}

main().catch((e) => {
  console.error("❌ Migration failed:", e);
  process.exit(1);
});
