import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

// QA: verify tracking injection works with a value present (then cleanup)
async function main() {
  await db.siteSetting.upsert({ where: { key: "ga4Id" }, update: { value: "G-QATEST123" }, create: { key: "ga4Id", value: "G-QATEST123" } });
  console.log("ga4Id set");
}
main().then(() => db.$disconnect());
