import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
async function main() {
  await p.siteSetting.upsert({ where: { key: "googleRating" }, update: { value: "4.9" }, create: { key: "googleRating", value: "4.9" } });
  await p.siteSetting.upsert({ where: { key: "googleReviewCount" }, update: { value: "87" }, create: { key: "googleReviewCount", value: "87" } });
  console.log("rating/count set");
  await p.$disconnect();
}
main();
