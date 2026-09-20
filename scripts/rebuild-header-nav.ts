import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

/**
 * Restore FULL header menu per client request:
 * Home, About, Categories, Products, Contact Us, Enquiry, Sale, Blogs
 * (calling + WhatsApp icons remain in header action cluster)
 */
async function main() {
  const wanted: { label: string; url: string; order: number }[] = [
    { label: "Home", url: "/", order: 0 },
    { label: "About", url: "/about", order: 1 },
    { label: "Categories", url: "/resin", order: 2 },
    { label: "Products", url: "/products", order: 3 },
    { label: "Contact Us", url: "/contact", order: 4 },
    { label: "Enquiry", url: "/inquiry", order: 5 },
    { label: "Sale", url: "/sale", order: 6 },
    { label: "Blogs", url: "/blog", order: 7 },
  ];

  // Remove current header items and rebuild cleanly
  await db.navigationItem.deleteMany({ where: { location: "HEADER" } });
  for (const item of wanted) {
    await db.navigationItem.create({
      data: { ...item, location: "HEADER", enabled: true },
    });
  }
  console.log("Header nav rebuilt:", wanted.map((w) => w.label).join(" | "));

  const check = await db.navigationItem.findMany({ where: { location: "HEADER" }, orderBy: { order: "asc" } });
  console.log("Verify:", check.map((n) => `${n.order}:${n.label}→${n.url}`).join(", "));
}

main().then(() => db.$disconnect());
