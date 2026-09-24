import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
async function main() {
  const keys = ["gscVerification", "ga4Id", "gtmId", "clarityId", "metaPixelId", "customHeadCode", "customBodyStartCode", "customBodyEndCode"];
  const rows = await p.siteSetting.findMany({ where: { key: { in: keys } } });
  for (const k of keys) {
    const r = rows.find(x => x.key === k);
    console.log(`${k} = ${r ? JSON.stringify(r.value)?.slice(0, 200) : "(not set)"}`);
  }
  const admins = await p.adminUser.findMany();
  console.log("=== ADMIN USERS ===");
  admins.forEach(a => console.log(`- ${a.email} role=${(a as any).role || "n/a"} name=${a.name || "-"}`));
  await p.$disconnect();
}
main();
