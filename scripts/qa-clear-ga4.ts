import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function main() {
  await db.siteSetting.upsert({ where: { key: "ga4Id" }, update: { value: "" }, create: { key: "ga4Id", value: "" } });
  console.log("ga4Id cleared");
}
main().then(() => db.$disconnect());
