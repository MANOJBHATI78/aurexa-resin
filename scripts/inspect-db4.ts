import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
async function main() {
  const keys = ["siteTitle", "siteMetaDescription", "siteKeywords", "announcementBar", "announcementEnabled", "footerDescription", "heroBannerEnabled", "heroBannerImage", "heroBannerMobileImage"];
  const rows = await p.siteSetting.findMany({ where: { key: { in: keys } } });
  rows.forEach(r => console.log(`${r.key} = ${r.value?.slice(0, 200)}`));
  await p.$disconnect();
}
main();
