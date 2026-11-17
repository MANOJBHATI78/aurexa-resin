import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { db } from "@/lib/db";
import { ensureLandingSource } from "@/lib/lazy-migrate";
import { slugify } from "@/lib/seo";

export const runtime = "nodejs";

/** Recent pSEO-generated pages for the admin list (called by the pSEO page) */
export async function GET(req: NextRequest) {
  return requireAdmin(req, async () => {
    await ensureLandingSource();
    const items = await db.landingPage.findMany({
      where: { source: "pseo" },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, slug: true, published: true, noindex: true, updatedAt: true },
      take: 100,
    });
    return NextResponse.json({ items });
  });
}

/**
 * Programmatic SEO page generator (compliant, non-cloaking):
 * - Builds unique landing pages from keyword templates × variable lists
 *   (cities, categories, countries…) or from a bulk CSV import.
 * - Every generated page carries its own H1, meta title, meta description,
 *   markdown content with internal links, optional FAQ block (with FAQPage
 *   schema) and CTA — all rendered as normal, visible landing-page content.
 * - Slugs are deduplicated against EVERY content type to prevent URL
 *   collisions and keyword cannibalization.
 */

const MAX_PAGES_PER_BATCH = 500;

const DEFAULT_CONTENT_TEMPLATE = `Aurexa Resin is a Surat-based epoxy resin manufacturer and wholesaler offering {phrase} at direct factory prices — ultra crystal clear, bubble-free epoxy resin dispatched pan-India.

## Why choose Aurexa Resin for {phrase}?

- **Ultra Crystal Clear Finish** — showroom-quality, non-yellowing cure
- **Bubble Free formulation** — self-deaering, flawless results in every pour
- **Atmosphere Friendly** — low odour, safe for home studios and workshops
- **2:1 & 3:1 systems** — 2:1 touch-dry in 4 hours, 3:1 deep-pour in 10 hours
- **Wholesale & B2B bulk supply** — direct manufacturer pricing, bulk pack sizes

## Bulk & Wholesale Enquiries

Whether you need 5 kg or 5 tonnes, our team replies within hours on WhatsApp with the best wholesale pricing for {phrase}.

{relatedLinks}`;

const DEFAULT_DESC_TEMPLATE = `Buy {phrase} at wholesale manufacturer prices. Ultra crystal clear, bubble-free epoxy resin with pan-India dispatch from Surat. Bulk & B2B enquiries welcome.`;

const AUTO_FAQS = [
  {
    q: (p: string) => `Where can I buy ${p} at wholesale rates?`,
    a: (p: string) => `Aurexa Resin supplies ${p} at direct manufacturer prices from Surat, Gujarat. Order online, call or WhatsApp us for a same-day wholesale quotation with pan-India dispatch.`,
  },
  {
    q: (p: string) => `What is the minimum order quantity for bulk purchase?`,
    a: () => `There is no strict minimum — single packs to full truckloads are supported. Bulk slabs start from reseller quantities; contact our sales team for the exact price list.`,
  },
  {
    q: (p: string) => `Which resin system should I choose — 2:1 or 3:1?`,
    a: () => `2:1 epoxy resin touch-dries in about 4 hours — ideal for coating, art and quick production. 3:1 epoxy resin touch-dries in about 10 hours and suits deep, glass-clear casts and river tables.`,
  },
];

function titleCase(text: string): string {
  return text
    .split(" ")
    .map((w) => (w.length > 2 ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ")
    .replace(/^\w/, (c) => c.toUpperCase());
}

function fill(template: string, vars: Record<string, string>, phrase: string): string {
  return template
    .replace(/\{phrase\}/g, phrase)
    .replace(/\{([a-zA-Z_]+)\}/g, (m, name: string) => vars[name] ?? m);
}

/** Minimal RFC-4180-ish CSV parser (quotes, embedded commas/newlines, BOM, CRLF) */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  const src = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += ch;
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field); field = "";
    } else if (ch === "\n") {
      row.push(field); field = "";
      rows.push(row); row = [];
    } else if (ch === "\r") {
      // skip (handle CRLF)
    } else {
      field += ch;
    }
  }
  row.push(field);
  if (row.some((c) => c !== "")) rows.push(row);
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

/** Slugs that already exist anywhere → skip (anti-cannibalization) */
async function collectExistingSlugs(): Promise<Set<string>> {
  const [landings, pages, blogs, locations, products, categories, applications] = await Promise.all([
    db.landingPage.findMany({ select: { slug: true } }),
    db.page.findMany({ select: { slug: true } }),
    db.blogPost.findMany({ select: { slug: true } }),
    db.locationPage.findMany({ select: { slug: true } }),
    db.product.findMany({ select: { slug: true } }),
    db.category.findMany({ select: { slug: true } }),
    db.application.findMany({ select: { slug: true } }),
  ]);
  return new Set([
    ...landings, ...pages, ...blogs, ...locations, ...products, ...categories, ...applications,
  ].map((r) => (r as { slug: string }).slug.toLowerCase()));
}

function buildBlocks(opts: {
  phrase: string;
  content: string;
  vars: Record<string, string>;
  siblingLinks: { phrase: string; slug: string }[];
  faqs: { question: string; answer: string }[];
}): { type: string; data: Record<string, unknown> }[] {
  const relatedLinks = opts.siblingLinks.length
    ? `**Related searches:** ${opts.siblingLinks.map((l) => `[${titleCase(l.phrase)}](/${l.slug})`).join(" · ")}`
    : `Explore the full range: [All Epoxy Resin Categories](/resin) · [All Products](/products)`;

  const blocks: { type: string; data: Record<string, unknown> }[] = [
    {
      type: "text",
      data: { body: fill(opts.content, opts.vars, opts.phrase).replace(/\{relatedLinks\}/g, relatedLinks) },
    },
    { type: "products", data: { heading: "Our Epoxy Resin Range", limit: 8 } },
    { type: "cta", data: { heading: `Get Wholesale Pricing for ${titleCase(opts.phrase)}`, text: "Direct manufacturer rates, bulk pack sizes and same-day dispatch from Surat.", primaryCta: { label: "WhatsApp Us", url: "WA:DEFAULT" }, secondaryCta: { label: "Contact Us", url: "/contact" } } },
  ];
  // Per-page FAQs ship inline in the block — the FAQPage JSON-LD then carries
  // the unique Q&A for THIS page (real SEO value, no shared/global fallback).
  if (opts.faqs.length) {
    blocks.push({ type: "faq", data: { heading: "Frequently Asked Questions", ids: [], faqs: opts.faqs } });
  }
  return blocks;
}

async function generateOne(payload: {
  phrase: string;
  slug: string;
  h1: string;
  title: string;
  description: string;
  keywords: string;
  content?: string;
  vars?: Record<string, string>;
  faqs?: { question: string; answer: string }[];
  published: boolean;
  noindex: boolean;
  siblingLinks: { phrase: string; slug: string }[];
}): Promise<void> {
  const blocks = buildBlocks({
    phrase: payload.phrase,
    content: payload.content || DEFAULT_CONTENT_TEMPLATE,
    vars: payload.vars || {},
    siblingLinks: payload.siblingLinks,
    faqs: payload.faqs || [],
  });
  await db.landingPage.create({
    data: {
      title: payload.h1,
      slug: payload.slug,
      h1: payload.h1,
      blocks: JSON.stringify(blocks),
      published: payload.published,
      noindex: payload.noindex,
      seoTitle: payload.title,
      seoDescription: payload.description,
      seoKeywords: payload.keywords || null,
      source: "pseo",
    },
  });
}

export async function POST(req: NextRequest) {
  return requireAdmin(req, async () => {
    await ensureLandingSource();

    const contentType = req.headers.get("content-type") || "";

    // ---------- CSV BULK IMPORT MODE ----------
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file");
      if (!(file instanceof File)) {
        return NextResponse.json({ error: "No CSV file received." }, { status: 400 });
      }
      const published = form.get("published") !== "false";
      const noindex = form.get("noindex") === "true";
      const rows = parseCsv(await file.text());
      if (rows.length < 2) {
        return NextResponse.json({ error: "CSV looks empty — include a header row." }, { status: 400 });
      }
      const header = rows[0].map((h) => h.trim().toLowerCase());
      const idx = (name: string) => header.indexOf(name);
      const iKeyword = idx("keyword");
      if (iKeyword === -1) {
        return NextResponse.json({ error: `CSV must contain a "keyword" column. Found: ${header.join(", ")}` }, { status: 400 });
      }
      const iSlug = idx("slug"); const iH1 = idx("h1"); const iTitle = idx("title");
      const iDesc = idx("description"); const iContent = idx("content"); const iKeywords = idx("keywords");

      const existing = await collectExistingSlugs();
      let created = 0; const skipped: string[] = []; const createdSlugs: string[] = [];
      const seen = new Set<string>();
      const seenKeywords = new Set<string>();

      for (const row of rows.slice(1)) {
        const keyword = (row[iKeyword] || "").trim();
        if (!keyword) continue;
        const phrase = keyword.toLowerCase();
        const slug = slugify((iSlug !== -1 && row[iSlug]?.trim()) || keyword);
        if (!slug || seen.has(slug)) { skipped.push(keyword); continue; }
        if (existing.has(slug)) { skipped.push(keyword); continue; }
        // Same keyword twice (even with different slugs) = keyword cannibalization → skip
        if (seenKeywords.has(phrase)) { skipped.push(`${keyword} (duplicate keyword)`); continue; }
        seen.add(slug);
        seenKeywords.add(phrase);
        if (created >= MAX_PAGES_PER_BATCH) { skipped.push(`${keyword} (batch limit)`); continue; }

        const h1 = (iH1 !== -1 && row[iH1]?.trim()) || titleCase(phrase);
        const title = (iTitle !== -1 && row[iTitle]?.trim()) || titleCase(phrase);
        const description = (iDesc !== -1 && row[iDesc]?.trim()) || fill(DEFAULT_DESC_TEMPLATE, {}, phrase);
        const keywords = (iKeywords !== -1 && row[iKeywords]?.trim()) || `${phrase}, wholesale, manufacturer, surat`;
        const content = (iContent !== -1 && row[iContent]?.trim()) || undefined;

        await generateOne({
          phrase, slug, h1, title, description, keywords, content,
          faqs: AUTO_FAQS.map((f) => ({ question: f.q(phrase), answer: f.a(phrase) })),
          published, noindex,
          siblingLinks: [],
        });
        created++; createdSlugs.push(slug);
      }
      return NextResponse.json({ ok: true, mode: "csv", created, skipped, createdSlugs });
    }

    // ---------- TEMPLATE MODE ----------
    const body = (await req.json()) as {
      patterns?: string[];
      variables?: { name: string; values: string[] }[];
      descTemplate?: string;
      contentTemplate?: string;
      autoFaq?: boolean;
      published?: boolean;
      noindex?: boolean;
    };

    const patterns = (body.patterns || []).map((p) => p.trim()).filter(Boolean).slice(0, 20);
    const variables = (body.variables || [])
      .map((v) => ({ name: (v.name || "").trim().toLowerCase(), values: (v.values || []).map((x) => x.trim()).filter(Boolean) }))
      .filter((v) => v.name && v.values.length);

    if (!patterns.length) {
      return NextResponse.json({ error: "Add at least one keyword pattern, e.g. \"epoxy resin supplier in {city}\"." }, { status: 400 });
    }
    // All placeholders used in patterns must have a variable group
    for (const p of patterns) {
      const placeholders = [...p.matchAll(/\{([a-zA-Z_]+)\}/g)].map((m) => m[1].toLowerCase());
      for (const ph of placeholders) {
        if (!variables.some((v) => v.name === ph)) {
          return NextResponse.json({ error: `Pattern "${p}" uses {${ph}} but no variable list named "${ph}" is defined.` }, { status: 400 });
        }
      }
    }

    // Cartesian product per pattern
    const combos: { phrase: string; vars: Record<string, string> }[] = [];
    for (const pattern of patterns) {
      const placeholders = [...new Set([...pattern.matchAll(/\{([a-zA-Z_]+)\}/g)].map((m) => m[1].toLowerCase()))];
      const groups = placeholders.length
        ? placeholders.map((name) => ({ name, values: variables.find((v) => v.name === name)!.values }))
        : [{ name: "_none", values: [""] }];
      // iterate cartesian product
      let current: Record<string, string>[] = [{}];
      for (const g of groups) {
        const next: Record<string, string>[] = [];
        for (const base of current) {
          for (const val of g.values) next.push({ ...base, [g.name]: val });
        }
        current = next;
      }
      for (const vars of current) {
        const phrase = pattern.replace(/\{([a-zA-Z_]+)\}/g, (_, name: string) => vars[name.toLowerCase()] ?? "").replace(/\s+/g, " ").trim().toLowerCase();
        if (phrase) combos.push({ phrase, vars });
      }
    }

    if (!combos.length) {
      return NextResponse.json({ error: "No combinations produced — check your variable lists." }, { status: 400 });
    }
    if (combos.length > MAX_PAGES_PER_BATCH) {
      return NextResponse.json({ error: `${combos.length} combinations exceed the ${MAX_PAGES_PER_BATCH}-page batch limit. Use fewer variables or run multiple batches.` }, { status: 400 });
    }

    const existing = await collectExistingSlugs();
    const published = body.published !== false;
    const noindex = body.noindex === true;
    const autoFaq = body.autoFaq !== false;
    const descTemplate = body.descTemplate?.trim() || DEFAULT_DESC_TEMPLATE;
    const contentTemplate = body.contentTemplate?.trim() || DEFAULT_CONTENT_TEMPLATE;

    // Pre-compute all slugs to cross-link siblings (internal linking)
    const planned = combos.map((c) => ({ ...c, slug: slugify(c.phrase) }));
    const createdSlugs: string[] = []; const skipped: string[] = [];
    const seen = new Set<string>();

    for (const item of planned) {
      if (!item.slug || seen.has(item.slug) || existing.has(item.slug)) {
        skipped.push(item.phrase); continue;
      }
      seen.add(item.slug);
    }
    const validPlanned = planned.filter((p) => seen.has(p.slug));

    for (const item of validPlanned) {
      // Siblings: first 5 other pages in this batch (internal linking)
      const siblingLinks = validPlanned
        .filter((p) => p.slug !== item.slug)
        .slice(0, 5)
        .map((p) => ({ phrase: p.phrase, slug: p.slug }));

      const phrase = item.phrase;
      await generateOne({
        phrase,
        slug: item.slug,
        h1: titleCase(phrase),
        title: titleCase(phrase),
        description: fill(descTemplate, item.vars, phrase),
        keywords: `${phrase}, wholesale, manufacturer, supplier, surat`,
        content: contentTemplate,
        vars: item.vars,
        faqs: autoFaq ? AUTO_FAQS.map((f) => ({ question: f.q(phrase), answer: f.a(phrase) })) : undefined,
        published, noindex,
        siblingLinks,
      });
      createdSlugs.push(item.slug);
    }

    return NextResponse.json({ ok: true, mode: "template", created: createdSlugs.length, skipped, createdSlugs });
  });
}
