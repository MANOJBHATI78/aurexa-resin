import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

/**
 * Task: simplify header nav + restructure homepage sections
 * - Header: Home, Categories, Products, Sale (Applications/About/Blog/Contact removed from header; still in footer)
 * - Homepage: hero -> categories -> featured_products -> sale banner -> rest
 */
async function main() {
  // 1. Remove clutter items from HEADER (they remain in FOOTER_QUICK)
  const removeHeader = ["Applications", "About", "Blog", "Contact", "Resin Categories"];
  const del = await db.navigationItem.deleteMany({
    where: { location: "HEADER", label: { in: removeHeader } },
  });
  console.log(`Removed ${del.count} clutter items from header nav`);

  // 2. Rename "Resin Categories" concept: ensure a single "Categories" item pointing to /resin
  const existingCats = await db.navigationItem.findFirst({ where: { location: "HEADER", url: "/resin" } });
  if (!existingCats) {
    await db.navigationItem.create({
      data: { label: "Categories", url: "/resin", location: "HEADER", order: 1, enabled: true },
    });
    console.log("Created Categories nav item");
  } else {
    await db.navigationItem.update({ where: { id: existingCats.id }, data: { label: "Categories" } });
    console.log("Renamed to Categories");
  }

  // 3. Ensure Sale item exists
  const existingSale = await db.navigationItem.findFirst({ where: { location: "HEADER", url: "/sale" } });
  if (!existingSale) {
    await db.navigationItem.create({
      data: { label: "Sale", url: "/sale", location: "HEADER", order: 3, enabled: true },
    });
    console.log("Created Sale nav item");
  }

  // 4. Normalize header order: Home(0), Categories(1), Products(2), Sale(3)
  const orderMap: Record<string, number> = { "/": 0, "/resin": 1, "/products": 2, "/sale": 3 };
  const headerItems = await db.navigationItem.findMany({ where: { location: "HEADER" } });
  for (const item of headerItems) {
    const order = orderMap[item.url];
    if (order !== undefined && item.order !== order) {
      await db.navigationItem.update({ where: { id: item.id }, data: { order } });
    }
  }
  console.log("Header order normalized");

  // 5. Homepage sections: reorder + insert sale section
  //    hero(1) categories(2) featured_products(3) sale(4) why_us(5) applications(6)
  //    guide(7) comparison(8) b2b(9) info(10) testimonials(11) faq(12) cta(13)
  const orderType: [string, number][] = [
    ["hero", 1], ["categories", 2], ["featured_products", 3], ["sale", 4],
    ["why_us", 5], ["applications", 6], ["guide", 7], ["comparison", 8],
    ["b2b", 9], ["info", 10], ["testimonials", 11], ["faq", 12], ["cta", 13],
  ];

  const existingSaleSection = await db.homeSection.findFirst({ where: { type: "sale" } });
  if (!existingSaleSection) {
    await db.homeSection.create({
      data: {
        type: "sale",
        title: "Sale",
        order: 4,
        visible: true,
        data: JSON.stringify({
          heading: "Resin Sale — Limited Time Offers",
          subheading: "Discounted prices on selected epoxy resins. Bulk buyers get extra wholesale rates — grab the deal before stock runs out.",
          badge: "SALE",
          cta: { label: "View Sale Products", url: "/sale" },
          whatsappCta: { label: "Get Wholesale Price" },
        }),
      },
    });
    console.log("Created homepage sale section");
  }

  for (const [type, order] of orderType) {
    await db.homeSection.updateMany({ where: { type }, data: { order } });
  }
  console.log("Homepage sections reordered");

  // 6. Mark a few products as on-sale so the page is not empty (admin can change anytime)
  const sample = await db.product.findMany({
    where: { published: true },
    orderBy: [{ featured: "desc" }, { name: "asc" }],
    take: 4,
  });
  for (const p of sample) {
    await db.product.update({
      where: { id: p.id },
      data: { onSale: true, salePrice: p.price || "Ask for sale price" },
    });
  }
  console.log(`Marked ${sample.length} products on sale (sample)`);

  const finalNav = await db.navigationItem.findMany({ where: { location: "HEADER" }, orderBy: { order: "asc" } });
  console.log("\nFinal header nav:", finalNav.map((n) => `${n.order}:${n.label}`).join(" | "));
}

main().then(() => db.$disconnect());
