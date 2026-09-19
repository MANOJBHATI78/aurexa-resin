import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function main() {
  const nav = await db.navigationItem.findMany({
    where: { location: "HEADER" },
    orderBy: { order: "asc" },
  });
  console.log("=== HEADER NAV ===");
  for (const n of nav) console.log(`${n.order} | ${n.label} | ${n.url} | enabled=${n.enabled} | parent=${n.parentId}`);

  const sections = await db.homeSection.findMany({ orderBy: { order: "asc" } });
  console.log("\n=== HOME SECTIONS ===");
  for (const s of sections) console.log(`${s.order} | ${s.type} | ${s.title ?? ""} | visible=${s.visible}`);

  const counts = await db.$transaction([
    db.product.count(),
    db.product.count({ where: { published: true } }),
    db.category.count(),
  ]);
  console.log(`\nProducts: ${counts[0]} (published ${counts[1]}), Categories: ${counts[2]}`);
}

main().then(() => db.$disconnect());
