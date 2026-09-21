/**
 * Task 4 — SEO keyword integration + brand USP content update.
 * Focus keyword: "Ultra Crystal Clear Resin"
 * Supporting: wholesale, wholesaler, manufacturer, supplier, exporter, B2B bulk supplier, 2:1 resin, 3:1 resin
 * Brand qualities: Bubble Free, Atmosphere Friendly, 2:1 → 4 Hrs dry, 3:1 → 10 Hrs dry
 */
import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();

async function main() {
  // ---------- 1. Hero section — focus keyword in headline ----------
  const hero = await p.homeSection.findFirst({ where: { type: "hero" } });
  if (hero) {
    const data = JSON.parse(hero.data || "{}");
    data.headline = "Ultra Crystal Clear Epoxy Resin — Wholesale Manufacturer, Supplier & Exporter";
    data.subheading =
      "Aurexa Resin manufactures and supplies bubble free, atmosphere friendly epoxy resin from Surat, Gujarat — " +
      "our signature Ultra Crystal Clear grade, easy 2:1 resin (touch dry in 4 hrs) and deep-pour 3:1 resin " +
      "(touch dry in 10 hrs). Artists, studios, resellers and industries buy direct with B2B bulk supply across India.";
    data.seoText =
      "Aurexa Resin is an ultra crystal clear epoxy resin wholesale manufacturer, supplier, exporter and B2B bulk " +
      "supplier in Surat, Gujarat, India. Buy crystal clear epoxy resin, 2:1 resin, 3:1 resin, art resin, casting " +
      "resin, table top epoxy, deep pour resin, river table resin, jewellery resin and industrial epoxy systems — " +
      "bubble free, atmosphere friendly, wholesale and single-piece orders, pan-India dispatch.";
    await p.homeSection.update({ where: { id: hero.id }, data: { data: JSON.stringify(data) } });
    console.log("✓ hero section updated");
  }

  // ---------- 2. why_us — brand qualities front and centre ----------
  const why = await p.homeSection.findFirst({ where: { type: "why_us" } });
  if (why) {
    const data = JSON.parse(why.data || "{}");
    data.heading = data.heading || "Why Aurexa Resin";
    data.subheading =
      "The brand qualities our customers know us for — visible in every batch we ship.";
    data.items = [
      { icon: "gem", title: "Ultra Crystal Clear Finish", text: "Our signature ultra crystal clear resin cures glass-clear and non-yellowing — showroom-ready results every time." },
      { icon: "droplets", title: "Bubble Free, Every Pour", text: "Self-deaering formulation releases air on its own — no bubbles, no flaws, no wastage." },
      { icon: "leaf", title: "Atmosphere Friendly", text: "Low-odour, low-irritation chemistry — safe for home studios, workshops and enclosed spaces." },
      { icon: "timer", title: "2:1 & 3:1 — Fast Dry Systems", text: "2:1 resin touch-dry in 4 HRS for quick production. 3:1 resin touch-dry in 10 HRS for deep, glass-clear casts." },
      { icon: "package", title: "Wholesale & B2B Bulk Supply", text: "Direct manufacturer pricing with bulk pack sizes for resellers, studios and industries." },
      { icon: "truck", title: "Pan-India Dispatch — Surat", text: "Reliable supply from Surat, Gujarat to artists, workshops and industries across India." },
    ];
    await p.homeSection.update({ where: { id: why.id }, data: { data: JSON.stringify(data) } });
    console.log("✓ why_us section updated");
  }

  // ---------- 3. Settings — SEO title / meta / keywords / announcement ----------
  const settings: Record<string, string> = {
    siteTitle: "Aurexa Resin | Ultra Crystal Clear Epoxy Resin Wholesaler, Manufacturer & Supplier — Surat",
    siteMetaDescription:
      "Buy ultra crystal clear epoxy resin direct from Aurexa Resin — wholesale manufacturer, supplier, exporter & B2B bulk supplier in Surat, Gujarat. Bubble free, atmosphere friendly 2:1 resin (4 hrs dry) & 3:1 resin (10 hrs dry) for art, tables, jewellery & industry. Pan-India dispatch. WhatsApp +91 93164 94976.",
    siteKeywords:
      "ultra crystal clear resin, ultra crystal clear epoxy resin, epoxy resin wholesale, resin wholesaler surat, resin manufacturer india, resin supplier surat, resin exporter india, b2b bulk resin supplier, 2:1 resin, 3:1 resin, bubble free resin, atmosphere friendly resin, crystal clear epoxy, art resin, casting resin, deep pour resin, epoxy resin surat, buy epoxy resin india",
    announcementBar:
      "Ultra Crystal Clear Resin · Bubble Free · 2:1 & 3:1 Systems — Wholesale B2B Bulk Supply | WhatsApp +91 93164 94976",
    footerDescription:
      "Aurexa Resin — ultra crystal clear epoxy resin wholesale manufacturer, supplier, exporter & B2B bulk supplier in Surat, Gujarat. Bubble free, atmosphere friendly 2:1 resin (4 hrs dry) & 3:1 resin (10 hrs dry), art, casting, table top, deep pour & industrial grades. Pan-India dispatch.",
  };
  for (const [key, value] of Object.entries(settings)) {
    await p.siteSetting.upsert({ where: { key }, update: { value }, create: { key, value } });
  }
  console.log("✓ site settings updated (siteTitle, meta, keywords, announcement, footer)");

  await p.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
