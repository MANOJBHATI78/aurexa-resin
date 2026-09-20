import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function main() {
  const cats = await db.category.findMany({ orderBy: { order: "asc" }, select: { id: true, name: true, slug: true, image: true } });
  console.log("=== CATEGORIES ===");
  for (const c of cats) console.log(`${c.slug} | ${c.name} | img=${c.image ?? "-"}`);
  const prods = await db.product.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, slug: true, image: true, categoryId: true } });
  console.log("\n=== PRODUCTS ===");
  for (const p of prods) console.log(`${p.slug} | ${p.name} | img=${p.image ?? "-"} | cat=${p.categoryId ?? "-"}`);
}

main().then(() => db.$disconnect());
