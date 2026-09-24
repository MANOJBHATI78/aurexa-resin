import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

const U = (n: string) => `/uploads/${n}`;

// Category → image map (theme matched)
const CATEGORY_IMAGES: Record<string, string> = {
  "clear-epoxy-resin": U("resin-pour-2.jpg"),
  "crystal-clear-epoxy-resin": U("resin-pour-3.jpg"),
  "art-epoxy-resin": U("resin-canvas-1.jpg"),
  "casting-epoxy-resin": U("resin-pour-5.jpg"),
  "table-top-epoxy-resin": U("resin-table-2.jpg"),
  "deep-pour-epoxy-resin": U("resin-pour-6.jpg"),
  "river-table-epoxy-resin": U("resin-table-1.jpg"),
  "jewellery-epoxy-resin": U("resin-jewel-1.jpg"),
  "coating-epoxy-resin": U("resin-floor-2.jpg"),
  "industrial-epoxy-resin": U("resin-kit-3.jpg"),
  "craft-epoxy-resin": U("resin-art-3.jpg"),
  "woodworking-epoxy-resin": U("resin-table-3.jpg"),
  "2-1-epoxy-resin": U("resin-kit-1.jpg"),
  "3-1-epoxy-resin": U("resin-kit-2.jpg"),
  "fast-dry-epoxy-resin": U("resin-pour-8.jpg"),
};

const PRODUCT_IMAGES: Record<string, string> = {
  "2-1-epoxy-resin-easy-measure": U("resin-kit-4.jpg"),
  "3-1-epoxy-resin-artist": U("resin-kit-5.jpg"),
  "art-epoxy-resin-pouring": U("resin-canvas-2.jpg"),
  "casting-epoxy-resin-mould": U("resin-pour-9.jpg"),
  "clear-epoxy-resin-standard": U("resin-pour-1.jpg"),
  "coating-epoxy-resin-protective": U("resin-floor-3.jpg"),
  "craft-epoxy-resin-diy": U("resin-art-4.jpg"),
  "crystal-clear-epoxy-resin-premium": U("resin-pour-4.jpg"),
  "decorative-epoxy-resin-countertop": U("resin-floor-1.jpg"),
  "deep-pour-epoxy-resin-thick-cast": U("resin-pour-10.jpg"),
  "fast-dry-epoxy-resin-quick-demould": U("resin-art-6.jpg"),
  "industrial-epoxy-resin-laminating": U("resin-kit-6.jpg"),
  "jewellery-epoxy-resin-high-clarity": U("resin-jewel-2.jpg"),
  "laminating-epoxy-resin-composite": U("resin-kit-7.jpg"),
  "river-table-epoxy-resin-live-edge": U("resin-table-4.jpg"),
  "table-top-epoxy-resin-durable": U("resin-table-5.jpg"),
  "transparent-epoxy-resin-general": U("resin-pour-7.jpg"),
  "woodworking-epoxy-resin-fill": U("resin-table-6.jpg"),
};

const PRODUCT_GALLERY: Record<string, string[]> = {
  "clear-epoxy-resin-standard": [U("resin-pour-2.jpg"), U("resin-work-1.jpg")],
  "art-epoxy-resin-pouring": [U("resin-canvas-3.jpg"), U("resin-art-5.jpg")],
  "river-table-epoxy-resin-live-edge": [U("resin-table-3.jpg"), U("resin-art-8.jpg")],
  "jewellery-epoxy-resin-high-clarity": [U("resin-jewel-3.jpg"), U("resin-jewel-4.jpg")],
  "crystal-clear-epoxy-resin-premium": [U("resin-art-1.jpg"), U("resin-work-2.jpg")],
};

const APPLICATION_IMAGE_POOL = [
  U("resin-work-5.jpg"), U("resin-art-2.jpg"), U("resin-table-2.jpg"), U("resin-floor-4.jpg"),
  U("resin-canvas-1.jpg"), U("resin-jewel-5.jpg"), U("resin-pour-3.jpg"), U("resin-art-5.jpg"),
  U("resin-floor-5.jpg"), U("resin-work-6.jpg"),
];

const BLOG_IMAGE_POOL = [
  U("resin-art-7.jpg"), U("resin-canvas-5.jpg"), U("resin-canvas-6.jpg"),
  U("resin-work-3.jpg"), U("resin-work-4.jpg"), U("resin-art-8.jpg"),
];

const ABOUT_BLOCKS = [
  {
    type: "hero",
    data: {
      title: "About Aurexa Resin — Surat's Trusted Epoxy Resin Partner",
      subtitle:
        "We are a Surat-based epoxy resin wholesaler, supplier and dealer serving resin artists, workshops, jewellers, resellers and industries across India. Real people, real stock, honest guidance — from a single 250 g pack to wholesale volumes.",
      primaryCta: { label: "Explore Our Products", url: "/products" },
      secondaryCta: { label: "WhatsApp Us", url: "WA:DEFAULT" },
    },
  },
  {
    type: "image_text",
    data: {
      heading: "Our Story",
      image: U("resin-work-1.jpg"),
      imageAlt: "Hands mixing two-part epoxy resin in cups at Aurexa Resin workshop in Surat",
      body:
        "Aurexa Resin began with a simple observation: resin creators in and around Surat struggled to find consistent, good-quality epoxy resin with honest guidance on which system to use.\n\nWhat started as a small supply operation for local artists has grown into a full resin supply business stocking clear, crystal clear, art, casting, table top, deep pour, jewellery, coating and industrial epoxy systems — dispatched from our Surat base to buyers across India.\n\nWe are not a faceless marketplace. When you message us, you talk to people who work with resin every day and understand the difference a correct mixing ratio, pour depth or cure time makes to your finished piece.",
      cta: { label: "Browse Our Range", url: "/products" },
    },
  },
  {
    type: "stats",
    data: {
      items: [
        { value: "15+", label: "Resin Systems in Stock" },
        { value: "10", label: "Application Families Served" },
        { value: "Pan-India", label: "Dispatch from Surat" },
        { value: "1:1", label: "Guidance Before You Buy" },
      ],
    },
  },
  {
    type: "image_text",
    data: {
      heading: "How We Work",
      image: U("resin-work-2.jpg"),
      imageAlt: "Epoxy resin kit bottles and supplies ready for dispatch from Surat",
      reverse: true,
      body:
        "Every order starts with a conversation. Tell us what you are making and how much you need — a jewellery batch, a river table, a production run — and we recommend the right system and pack size.\n\nStock is stored correctly, rotated properly and packed carefully before dispatch. Wholesale buyers get structured pricing, and single-piece buyers get the same product at retail-friendly quantities.\n\nAfter delivery, we stay reachable — mixing questions, cure issues or re-order guidance, we answer on WhatsApp during business hours.",
    },
  },
  {
    type: "values",
    data: {
      heading: "What We Stand For",
      subheading: "The principles behind every order we ship from Surat.",
      items: [
        { icon: "gem", title: "Honest Products", text: "What the label says is what you get — no exaggerated claims, no mystery rebadging." },
        { icon: "layers", title: "Right Guidance", text: "We help you pick the correct system for your application before you spend a rupee." },
        { icon: "truck", title: "Careful Dispatch", text: "Proper packing and dependable logistics from Surat to your doorstep, pan-India." },
        { icon: "handshake", title: "Long-term Relationships", text: "Artists, workshops and resellers stay with us because we stay reachable." },
      ],
    },
  },
  {
    type: "gallery",
    data: {
      heading: "Resin in Real Hands",
      subheading: "A glimpse of the world our resin reaches — art, jewellery, tables and finishes.",
      images: [
        { url: U("resin-art-2.jpg"), alt: "Colourful epoxy resin art coasters made with Aurexa Resin" },
        { url: U("resin-canvas-4.jpg"), alt: "Artist pouring pigmented resin on canvas" },
        { url: U("resin-jewel-5.jpg"), alt: "Handmade epoxy resin jewellery pendants" },
        { url: U("resin-table-1.jpg"), alt: "Epoxy river table with glossy finish" },
      ],
    },
  },
  {
    type: "cta",
    data: {
      heading: "Ready to Create With Us?",
      text: "Tell us what you are making — we will recommend the right resin system and share pricing on WhatsApp.",
      primaryCta: { label: "WhatsApp Us Now", url: "WA:DEFAULT" },
      secondaryCta: { label: "Send an Inquiry", url: "/inquiry" },
    },
  },
];

async function main() {
  // 1. Category images
  for (const [slug, image] of Object.entries(CATEGORY_IMAGES)) {
    await db.category.updateMany({ where: { slug }, data: { image } });
  }
  console.log(`Seeded ${Object.keys(CATEGORY_IMAGES).length} category images`);

  // 2. Product images + galleries
  for (const [slug, image] of Object.entries(PRODUCT_IMAGES)) {
    await db.product.updateMany({ where: { slug }, data: { image } });
  }
  for (const [slug, gallery] of Object.entries(PRODUCT_GALLERY)) {
    const json = JSON.stringify(gallery.map((url) => ({ url, alt: "Epoxy resin product photo — Aurexa Resin Surat" })));
    await db.product.updateMany({ where: { slug }, data: { gallery: json } });
  }
  console.log(`Seeded ${Object.keys(PRODUCT_IMAGES).length} product images, ${Object.keys(PRODUCT_GALLERY).length} galleries`);

  // 3. Hero banner (desktop) — settings
  await db.siteSetting.upsert({
    where: { key: "heroBannerImage" },
    update: { value: U("resin-pour-1.jpg") },
    create: { key: "heroBannerImage", value: U("resin-pour-1.jpg") },
  });
  await db.siteSetting.upsert({
    where: { key: "heroBannerAlt" },
    update: { value: "Glossy clear epoxy resin being poured — Aurexa Resin, epoxy resin wholesaler in Surat" },
    create: { key: "heroBannerAlt", value: "Glossy clear epoxy resin being poured — Aurexa Resin, epoxy resin wholesaler in Surat" },
  });
  console.log("Hero banner image set");

  // 4. Application images
  const apps = await db.application.findMany({ orderBy: { order: "asc" } });
  for (let i = 0; i < apps.length; i++) {
    const img = APPLICATION_IMAGE_POOL[i % APPLICATION_IMAGE_POOL.length];
    await db.application.update({ where: { id: apps[i].id }, data: { image: img } });
  }
  console.log(`Seeded ${apps.length} application images`);

  // 5. Blog featured images
  const posts = await db.blogPost.findMany({ orderBy: { createdAt: "asc" } });
  for (let i = 0; i < posts.length; i++) {
    const img = BLOG_IMAGE_POOL[i % BLOG_IMAGE_POOL.length];
    await db.blogPost.update({ where: { id: posts[i].id }, data: { featuredImage: img } });
  }
  console.log(`Seeded ${posts.length} blog images`);

  // 6. About landing page (creative, block-based, admin editable)
  const about = await db.landingPage.findUnique({ where: { slug: "about" } });
  const blocks = JSON.stringify(ABOUT_BLOCKS);
  if (about) {
    await db.landingPage.update({ where: { slug: "about" }, data: { blocks, published: true, title: "About Aurexa Resin" } });
    console.log("Updated existing about landing page");
  } else {
    await db.landingPage.create({
      data: {
        title: "About Aurexa Resin",
        slug: "about",
        h1: "About Aurexa Resin",
        blocks,
        published: true,
        seoTitle: "About Aurexa Resin — Epoxy Resin Wholesaler in Surat, Gujarat",
        seoDescription:
          "Aurexa Resin is a Surat-based epoxy resin wholesaler and supplier serving artists, workshops, resellers and industries across India with honest guidance and dependable stock.",
      },
    });
    console.log("Created about landing page");
  }
}

main().then(() => db.$disconnect());
