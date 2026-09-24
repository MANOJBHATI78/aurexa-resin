import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
async function main() {
  // remove test artifacts
  await p.pageSchema.deleteMany({ where: { label: "Test Home Schema" } });
  await p.inquiry.deleteMany({ where: { utmSource: { in: ["whatsapp-click", "call-click"] }, name: "Test Visitor" } });
  await p.adminUser.deleteMany({ where: { email: "seo@aurexaresin.com" } });
  // clean test tracking + fake rating values (owner enters real ones)
  const keys = ["gscVerification", "ga4Id", "googleRating", "googleReviewCount"];
  await p.siteSetting.deleteMany({ where: { key: { in: keys } } });
  // remove test price from the product
  const prod = await p.product.findFirst({ where: { slug: { contains: "crystal-clear" } } });
  if (prod && prod.price === "₹850") await p.product.update({ where: { id: prod.id }, data: { price: "" } });
  console.log("✓ cleanup done");
  await p.$disconnect();
}
main();
