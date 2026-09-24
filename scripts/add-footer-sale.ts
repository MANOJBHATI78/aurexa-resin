import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function main() {
  const existing = await db.navigationItem.findFirst({ where: { location: "FOOTER_QUICK", url: "/sale" } });
  if (!existing) {
    // insert after "Resin Categories" — just append with a mid order
    const cats = await db.navigationItem.findFirst({ where: { location: "FOOTER_QUICK", url: "/resin" } });
    await db.navigationItem.create({
      data: { label: "Sale Offers", url: "/sale", location: "FOOTER_QUICK", order: (cats?.order ?? 3) + 0.5, enabled: true },
    });
    console.log("Added Sale Offers to footer quick links");
  } else {
    console.log("Footer sale link already exists");
  }
}

main().then(() => db.$disconnect());
