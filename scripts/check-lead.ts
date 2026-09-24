import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
async function main() {
  const rows = await p.inquiry.findMany({ where: { utmSource: { in: ["whatsapp-click", "call-click"] } }, orderBy: { createdAt: "desc" }, take: 3 });
  rows.forEach(r => console.log(`- ${r.name} | ${r.mobile} | ${r.application} | ${r.sourcePage} | ${r.status}`));
  if (!rows.length) console.log("(no lead-gate inquiries)");
  await p.$disconnect();
}
main();
