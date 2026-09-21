import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
async function main() {
  const locs = await db.locationPage.findMany({ select: { slug: true, city: true, published: true } });
  console.log("Locations:", locs.map((l) => `${l.slug}(${l.published ? "live" : "draft"})`).join(", ") || "NONE");
}
main().then(() => db.$disconnect());
