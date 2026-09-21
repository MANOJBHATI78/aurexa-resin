import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
async function main() {
  const hero = await p.homeSection.findFirst({ where: { type: "hero" } });
  console.log("=== HERO DATA ===");
  console.log(JSON.stringify(hero?.data, null, 1).slice(0, 1200));
  const why = await p.homeSection.findFirst({ where: { type: "why_us" } });
  console.log("=== WHY_US DATA ===");
  console.log(JSON.stringify(why?.data, null, 1).slice(0, 1600));
  const cats = await p.category.findMany({ where: { slug: { in: ["2-1-epoxy-resin", "3-1-epoxy-resin", "crystal-clear-epoxy-resin", "fast-dry-epoxy-resin"] } }, select: { name: true, slug: true, image: true, order: true } });
  console.log("=== KEY CATS ===");
  console.log(JSON.stringify(cats, null, 1));
  await p.$disconnect();
}
main();
