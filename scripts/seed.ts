// Seed script for Aurexa Resin CMS
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/auth";
import {
  CATEGORIES, PRODUCTS, APPLICATIONS, GLOBAL_FAQS, LEGAL_PAGES,
  BLOG_POSTS, LANDING_PAGES, HOME_SECTIONS, NAV_HEADER, NAV_FOOTER_QUICK,
} from "./seed-data";

const db = new PrismaClient();

async function main() {
  console.log("Seeding Aurexa Resin CMS...");

  // ---- Admin user ----
  const adminEmail = "admin@aurexaresin.com";
  await db.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Aurexa Admin",
      passwordHash: hashPassword("Aurexa@123"),
      role: "SUPER_ADMIN",
    },
  });
  console.log("✓ Admin user:", adminEmail, "/ Aurexa@123");

  // ---- Key settings (defaults live in code; seed the business-critical ones so admin sees them) ----
  const settings: Record<string, string> = {
    googleBusinessProfileUrl: "https://share.google/ndEXNcLkKfN17xSUx",
    instagramUrl: "https://www.instagram.com/aurexa_resin/",
    phone: "+91 93164 94976",
    whatsappNumber: "919316494976",
    city: "Surat",
    state: "Gujarat",
    country: "India",
    addressLine: "",
    siteTitle: "Aurexa Resin | Epoxy Resin Wholesaler, Supplier & Dealer in Surat",
  };
  for (const [key, value] of Object.entries(settings)) {
    await db.siteSetting.upsert({ where: { key }, update: { value }, create: { key, value } });
  }
  console.log("✓ Site settings (GMB link, Instagram, contact)");

  // ---- Categories ----
  const catMap = new Map<string, string>();
  let order = 0;
  for (const c of CATEGORIES) {
    const cat = await db.category.upsert({
      where: { slug: c.slug },
      update: {
        name: c.name, description: c.description, longContent: c.longContent,
        featured: c.featured ?? false, order: order++,
        seoTitle: `${c.name} | Epoxy Resin Supplier & Wholesaler | Aurexa Resin`,
        seoDescription: c.description,
      },
      create: {
        name: c.name, slug: c.slug, description: c.description, longContent: c.longContent,
        featured: c.featured ?? false, order: order++,
        seoTitle: `${c.name} | Epoxy Resin Supplier & Wholesaler | Aurexa Resin`,
        seoDescription: c.description,
      },
    });
    catMap.set(c.slug, cat.id);
  }
  console.log("✓", CATEGORIES.length, "categories");

  // ---- Products ----
  for (const p of PRODUCTS) {
    const common = {
      name: p.name,
      sku: `AUR-${p.slug.toUpperCase().replace(/-/g, "").slice(0, 12)}`,
      shortDesc: p.shortDesc,
      categoryId: catMap.get(p.categorySlug) ?? null,
      resinType: p.resinType,
      mixingRatio: p.mixingRatio ?? null,
      packSizes: JSON.stringify(p.packSizes.map((s) => ({ size: s, availability: "Available" }))),
      applications: JSON.stringify(p.applications),
      finish: p.finish ?? null,
      pourDepth: p.pourDepth ?? null,
      workingTime: p.workingTime ?? null,
      curingInfo: p.curingInfo ?? null,
      recommendedUse: p.recommendedUse ?? null,
      features: JSON.stringify(p.features),
      benefits: JSON.stringify(p.benefits),
      suitableFor: JSON.stringify(p.suitableFor),
      featured: p.featured ?? false,
      published: true,
    };
    const data = {
      ...common,
      longDesc: `${p.shortDesc}\n\n${p.features.map((f) => `- ${f}`).join("\n")}\n\nRecommended for: ${p.suitableFor.join(", ")}. Supplied by Aurexa Resin — epoxy resin wholesaler in Surat, Gujarat — with pan-India delivery. Contact us for pack sizes, wholesale pricing and application guidance.`,
      seoTitle: `${p.name} | Aurexa Resin`,
      seoDescription: p.shortDesc,
    };
    await db.product.upsert({ where: { slug: p.slug }, update: data, create: { ...data, slug: p.slug } });
  }
  console.log("✓", PRODUCTS.length, "products");

  // ---- Applications ----
  order = 0;
  for (const a of APPLICATIONS) {
    await db.application.upsert({
      where: { slug: a.slug },
      update: { name: a.name, description: a.description, order: order++ },
      create: { ...a, order: order++, published: true },
    });
  }
  console.log("✓", APPLICATIONS.length, "applications");

  // ---- Global FAQs ----
  const faqCount = await db.faq.count({ where: { entityType: "GLOBAL" } });
  if (faqCount === 0) {
    for (let i = 0; i < GLOBAL_FAQS.length; i++) {
      await db.faq.create({ data: { ...GLOBAL_FAQS[i], order: i, entityType: "GLOBAL" } });
    }
  }
  console.log("✓", GLOBAL_FAQS.length, "global FAQs");

  // ---- Legal pages ----
  for (const [i, pg] of LEGAL_PAGES.entries()) {
    await db.page.upsert({
      where: { slug: pg.slug },
      update: { title: pg.title, content: pg.content },
      create: { ...pg, published: true, sortOrder: i, showInFooter: true },
    });
  }
  console.log("✓", LEGAL_PAGES.length, "legal pages");

  // ---- Blog posts ----
  for (const [i, b] of BLOG_POSTS.entries()) {
    const exists = await db.blogPost.findUnique({ where: { slug: b.slug } });
    const data = {
      title: b.title, excerpt: b.excerpt, content: b.content,
      tags: JSON.stringify(b.tags), author: "Aurexa Resin",
      readingTime: Math.max(3, Math.round(b.content.split(/\s+/).length / 200)),
      published: true,
      publishedAt: new Date(Date.now() - (BLOG_POSTS.length - i) * 86400000 * 5),
      seoTitle: `${b.title} | Aurexa Resin Blog`,
      seoDescription: b.excerpt,
    };
    if (exists) await db.blogPost.update({ where: { slug: b.slug }, data });
    else await db.blogPost.create({ data: { ...data, slug: b.slug } });
  }
  console.log("✓", BLOG_POSTS.length, "blog posts");

  // ---- Landing pages ----
  for (const l of LANDING_PAGES) {
    await db.landingPage.upsert({
      where: { slug: l.slug },
      update: { title: l.title, h1: l.h1, blocks: JSON.stringify(l.blocks), seoTitle: l.seoTitle, seoDescription: l.seoDescription },
      create: { ...l, blocks: JSON.stringify(l.blocks), published: true },
    });
  }
  console.log("✓", LANDING_PAGES.length, "landing pages");

  // ---- Homepage sections ----
  const sectionCount = await db.homeSection.count();
  if (sectionCount === 0) {
    for (const s of HOME_SECTIONS) {
      await db.homeSection.create({ data: { type: s.type, title: s.title, data: JSON.stringify(s.data), order: s.order, visible: true } });
    }
  }
  console.log("✓", HOME_SECTIONS.length, "homepage sections");

  // ---- Navigation ----
  const navCount = await db.navigationItem.count();
  if (navCount === 0) {
    for (const [i, n] of NAV_HEADER.entries()) {
      await db.navigationItem.create({ data: { ...n, location: "HEADER", order: i, enabled: true } });
    }
    for (const [i, n] of NAV_FOOTER_QUICK.entries()) {
      await db.navigationItem.create({ data: { ...n, location: "FOOTER_QUICK", order: i, enabled: true } });
    }
  }
  console.log("✓ Navigation items");

  // ---- Location page: Surat ----
  await db.locationPage.upsert({
    where: { slug: "surat-gujarat" },
    update: {},
    create: {
      country: "India", state: "Gujarat", city: "Surat", slug: "surat-gujarat",
      description: "Aurexa Resin is an epoxy resin wholesaler, supplier and dealer based in Surat, Gujarat, serving artists, workshops and industries locally and across India.",
      content:
        "## Epoxy Resin Supplier in Surat, Gujarat\n\nSurat is home to a thriving community of resin artists, furniture workshops, jewellery makers and manufacturing businesses. Aurexa Resin is based in Surat and supplies the full range of epoxy resin systems locally and across India.\n\n### What We Supply in Surat\n\n- Clear and crystal clear epoxy resin for coating and casting\n- Art resin for fluid art and decorative work\n- Table top and deep pour systems for furniture makers\n- Jewellery resin for makers and brands\n- Craft resin for hobby stores and workshop organisers\n- Industrial grades for manufacturing requirements\n\n### Wholesale & Bulk from Surat\n\nAs a Surat-based wholesaler, we serve resellers, workshops and industries with bulk pack sizes and repeat-supply arrangements. Walk-in and local delivery inquiries are welcome — call or WhatsApp +91 93164 94976.",
      keywords: "epoxy resin surat, resin wholesaler surat, resin supplier gujarat, buy resin surat",
      seoTitle: "Epoxy Resin Supplier in Surat, Gujarat | Aurexa Resin",
      seoDescription: "Aurexa Resin — epoxy resin wholesaler and supplier in Surat, Gujarat. Clear, art, casting, table top and industrial epoxy resin with local and pan-India supply.",
      published: true,
    },
  });
  console.log("✓ Location: Surat");

  // ---- Sample testimonials (hidden — admin must replace with real reviews and enable) ----
  const tCount = await db.testimonial.count();
  if (tCount === 0) {
    await db.testimonial.create({ data: { name: "Sample Review — Replace Me", location: "Surat", review: "This is a placeholder record. Replace it with a real customer review from your business, then enable visibility.", rating: 5, visible: false, order: 0 } });
  }

  console.log("\n✅ Seed complete.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
