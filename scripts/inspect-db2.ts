import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
async function main() {
  const cats = await p.category.findMany({ select: { name: true, slug: true, description: true } });
  console.log("=== CATEGORIES ===");
  cats.forEach(c => console.log(`- ${c.name} (${c.slug}): ${c.description?.slice(0, 80)}`));
  const nav = await p.navigationItem.findMany({ where: { location: "HEADER", enabled: true }, orderBy: { order: "asc" } });
  console.log("=== HEADER NAV ===");
  nav.forEach(n => console.log(`- ${n.label} -> ${n.url} (order ${n.order})`));
  const settings = await p.siteSetting.findMany({ where: { key: { in: ["defaultMetaTitle", "defaultMetaDescription", "announcementBar", "seoKeywords", "metaKeywords"] } } });
  console.log("=== SEO SETTINGS ===");
  settings.forEach(s => console.log(`- ${s.key}: ${s.value?.slice(0, 150)}`));
  const sections = await p.homeSection.findMany({ where: { visible: true }, orderBy: { order: "asc" } });
  console.log("=== HOME SECTIONS ===");
  sections.forEach(s => console.log(`- [${s.order}] ${s.type} — ${s.title}`));
  await p.$disconnect();
}
main();
