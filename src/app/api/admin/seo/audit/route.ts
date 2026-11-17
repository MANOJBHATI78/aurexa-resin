import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { db } from "@/lib/db";
import { ensureLandingSource } from "@/lib/lazy-migrate";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * SEO Health Audit — database-driven validation (fast, no self-crawl needed):
 *  1. Duplicate meta titles/descriptions (within + across content types)
 *  2. Title/description length validation (Google display limits)
 *  3. Root-slug collisions across /[slug] content types (cannibalization)
 *  4. Broken internal links (markdown links, landing-block CTAs, nav items)
 *  5. Media library items missing alt text
 *  6. Indexing sanity: published+noindex conflicts, drafts summary
 */

interface Issue {
  severity: "error" | "warning" | "info";
  type: string;
  message: string;
  entity?: string;
  path?: string;
  editUrl?: string;
}

const STATIC_ROUTES = new Set([
  "/", "/about", "/contact", "/inquiry", "/blog", "/products", "/resin",
  "/applications", "/locations", "/sale", "/p/privacy-policy", "/p/terms-conditions",
]);

function parseMarkdownLinks(text: string): string[] {
  const out: string[] = [];
  const re = /\[[^\]]*\]\((\/[^)\s]+)\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) out.push(m[1]);
  // Bare internal URLs mentioned in CTAs stored in JSON (e.g. "/products")
  return out;
}

/** Extract internal links from a landing page's blocks JSON */
function extractBlockLinks(blocksJson: string | null): string[] {
  if (!blocksJson) return [];
  const links: string[] = [];
  try {
    const blocks = JSON.parse(blocksJson) as { type: string; data: Record<string, unknown> }[];
    for (const block of blocks) {
      const d = block.data || {};
      for (const key of ["body", "content", "text", "heading", "subheading"]) {
        if (typeof d[key] === "string") links.push(...parseMarkdownLinks(d[key] as string));
      }
      const ctas = [d.primaryCta, d.secondaryCta, d.cta];
      for (const cta of ctas) {
        if (cta && typeof cta === "object") {
          const url = (cta as { url?: string }).url;
          if (url && url.startsWith("/") && !url.startsWith("WA:") && !url.startsWith("TEL:")) links.push(url);
        }
      }
      if (Array.isArray(d.images)) {
        for (const img of d.images as { url?: string }[]) {
          if (img?.url?.startsWith("/") && !img.url.startsWith("/uploads")) links.push(img.url);
        }
      }
    }
  } catch {
    // ignore malformed blocks
  }
  return links;
}

export async function GET(req: NextRequest) {
  return requireAdmin(req, async () => {
    await ensureLandingSource();

    const [products, blogs, landings, pages, locations, categories, applications, media, navItems] =
      await Promise.all([
        db.product.findMany({ select: { id: true, name: true, slug: true, published: true, seoTitle: true, seoDescription: true, longDesc: true } }),
        db.blogPost.findMany({ select: { id: true, title: true, slug: true, published: true, seoTitle: true, seoDescription: true, content: true, publishedAt: true } }),
        db.landingPage.findMany({ select: { id: true, title: true, slug: true, published: true, noindex: true, seoTitle: true, seoDescription: true, blocks: true, source: true } }),
        db.page.findMany({ select: { id: true, title: true, slug: true, published: true, noindex: true, seoTitle: true, seoDescription: true, content: true } }),
        db.locationPage.findMany({ select: { id: true, city: true, slug: true, published: true, noindex: true, seoTitle: true, seoDescription: true, content: true } }),
        db.category.findMany({ select: { id: true, name: true, slug: true, published: true, seoTitle: true, seoDescription: true, longContent: true } }),
        db.application.findMany({ select: { id: true, name: true, slug: true, published: true, seoTitle: true, seoDescription: true, longContent: true } }),
        db.media.findMany({ select: { id: true, filename: true, alt: true, url: true } }),
        db.navigationItem.findMany({ select: { id: true, label: true, url: true } }),
      ]);

    const issues: Issue[] = [];
    const push = (i: Issue) => issues.push(i);

    // ---------- 1. Duplicate meta titles / descriptions ----------
    type MetaRow = { type: string; label: string; slug: string; editUrl: string; title: string; desc: string };
    const rows: MetaRow[] = [
      ...products.map((p) => ({ type: "Product", label: p.name, slug: `/products/${p.slug}`, editUrl: "/admin/products", title: p.seoTitle || p.name, desc: p.seoDescription || "" })),
      ...blogs.map((b) => ({ type: "Blog", label: b.title, slug: `/blog/${b.slug}`, editUrl: "/admin/blog", title: b.seoTitle || b.title, desc: b.seoDescription || "" })),
      ...landings.filter((l) => l.published).map((l) => ({ type: "Landing", label: l.title, slug: `/${l.slug}`, editUrl: "/admin/landing", title: l.seoTitle || l.title, desc: l.seoDescription || "" })),
      ...pages.filter((p) => p.published).map((p) => ({ type: "Page", label: p.title, slug: `/p/${p.slug}`, editUrl: "/admin/pages", title: p.seoTitle || p.title, desc: p.seoDescription || "" })),
      ...locations.filter((l) => l.published).map((l) => ({ type: "Location", label: l.city || "", slug: `/locations/${l.slug}`, editUrl: "/admin/locations", title: l.seoTitle || l.city || "", desc: l.seoDescription || "" })),
      ...categories.filter((c) => c.published).map((c) => ({ type: "Category", label: c.name, slug: `/resin/${c.slug}`, editUrl: "/admin/categories", title: c.seoTitle || c.name, desc: c.seoDescription || "" })),
      ...applications.filter((a) => a.published).map((a) => ({ type: "Application", label: a.name, slug: `/applications/${a.slug}`, editUrl: "/admin/applications", title: a.seoTitle || a.name, desc: a.seoDescription || "" })),
    ];

    const titleMap = new Map<string, MetaRow[]>();
    const descMap = new Map<string, MetaRow[]>();
    for (const r of rows) {
      const t = r.title.trim().toLowerCase();
      const d = r.desc.trim().toLowerCase();
      if (t) titleMap.set(t, [...(titleMap.get(t) || []), r]);
      if (d.length > 20) descMap.set(d, [...(descMap.get(d) || []), r]);
    }
    for (const [key, group] of titleMap) {
      if (group.length > 1) {
        push({
          severity: "error", type: "duplicate_title",
          message: `Duplicate meta title used by ${group.length} pages: "${group[0].title}"`,
          entity: group.map((g) => `${g.type}: ${g.label}`).join(", "),
          editUrl: group[0].editUrl,
        });
      }
    }
    for (const [, group] of descMap) {
      if (group.length > 1) {
        push({
          severity: "error", type: "duplicate_description",
          message: `Duplicate meta description used by ${group.length} pages (starts "${group[0].desc.slice(0, 60)}…")`,
          entity: group.map((g) => `${g.type}: ${g.label}`).join(", "),
          editUrl: group[0].editUrl,
        });
      }
    }

    // ---------- 2. Length validation ----------
    for (const r of rows) {
      const tl = r.title.length;
      if (tl < 25) push({ severity: "warning", type: "title_short", message: `Title only ${tl} chars (aim 30–60): "${r.title}"`, entity: `${r.type}: ${r.label}`, path: r.slug, editUrl: r.editUrl });
      else if (tl > 65) push({ severity: "warning", type: "title_long", message: `Title ${tl} chars — may truncate in Google (aim ≤65): "${r.title.slice(0, 70)}…"`, entity: `${r.type}: ${r.label}`, path: r.slug, editUrl: r.editUrl });
      const dl = r.desc.length;
      if (!r.desc) push({ severity: "warning", type: "desc_missing", message: "Missing meta description", entity: `${r.type}: ${r.label}`, path: r.slug, editUrl: r.editUrl });
      else if (dl < 50) push({ severity: "info", type: "desc_short", message: `Description only ${dl} chars (aim 70–160)`, entity: `${r.type}: ${r.label}`, path: r.slug, editUrl: r.editUrl });
      else if (dl > 170) push({ severity: "info", type: "desc_long", message: `Description ${dl} chars — may truncate (aim ≤160)`, entity: `${r.type}: ${r.label}`, path: r.slug, editUrl: r.editUrl });
    }

    // ---------- 3. Root-slug collisions ----------
    const rootSlugs = new Map<string, string[]>();
    for (const l of landings) rootSlugs.set(l.slug, [...(rootSlugs.get(l.slug) || []), `Landing: ${l.title}`]);
    for (const p of pages) rootSlugs.set(p.slug, [...(rootSlugs.get(p.slug) || []), `Page: ${p.title}`]);
    for (const l of locations) rootSlugs.set(l.slug, [...(rootSlugs.get(l.slug) || []), `Location: ${l.city}`]);
    for (const [slug, owners] of rootSlugs) {
      if (owners.length > 1) {
        push({ severity: "error", type: "slug_collision", message: `Slug "/${slug}" is used by multiple pages — only one can win at /${slug}: ${owners.join(", ")}`, editUrl: "/admin/landing" });
      }
    }

    // ---------- 4. Broken internal links ----------
    const productSlugs = new Set(products.map((p) => p.slug));
    const blogSlugs = new Set(blogs.map((b) => b.slug));
    const categorySlugs = new Set(categories.map((c) => c.slug));
    const applicationSlugs = new Set(applications.map((a) => a.slug));
    const locationSlugs = new Set(locations.map((l) => l.slug));
    const pageSlugs = new Set(pages.map((p) => p.slug));
    const landingSlugs = new Set(landings.map((l) => l.slug));

    function linkValid(link: string): boolean {
      const clean = link.split("#")[0].split("?")[0].replace(/\/$/, "") || "/";
      if (STATIC_ROUTES.has(clean) || clean === "/") return true;
      if (clean.startsWith("/admin") || clean.startsWith("/api")) return true; // internal-only
      const parts = clean.split("/").filter(Boolean);
      if (parts.length === 1) return landingSlugs.has(parts[0]) || pageSlugs.has(parts[0]) || locationSlugs.has(parts[0]);
      const [seg, slug] = parts;
      switch (seg) {
        case "products": return productSlugs.has(slug);
        case "blog": return blogSlugs.has(slug);
        case "resin": return categorySlugs.has(slug);
        case "applications": return applicationSlugs.has(slug);
        case "locations": return locationSlugs.has(slug);
        case "p": return pageSlugs.has(slug);
        default: return true; // unknown prefix — assume intentional (files, feeds, etc.)
      }
    }

    const linkSources: { label: string; path: string; editUrl: string; links: string[] }[] = [
      ...landings.map((l) => ({ label: `Landing: ${l.title}`, path: `/${l.slug}`, editUrl: "/admin/landing", links: extractBlockLinks(l.blocks) })),
      ...blogs.map((b) => ({ label: `Blog: ${b.title}`, path: `/blog/${b.slug}`, editUrl: "/admin/blog", links: parseMarkdownLinks(b.content || "") })),
      ...pages.map((p) => ({ label: `Page: ${p.title}`, path: `/p/${p.slug}`, editUrl: "/admin/pages", links: parseMarkdownLinks(p.content || "") })),
      ...locations.map((l) => ({ label: `Location: ${l.city}`, path: `/locations/${l.slug}`, editUrl: "/admin/locations", links: parseMarkdownLinks(l.content || "") })),
      ...categories.map((c) => ({ label: `Category: ${c.name}`, path: `/resin/${c.slug}`, editUrl: "/admin/categories", links: parseMarkdownLinks(c.longContent || "") })),
      ...applications.map((a) => ({ label: `Application: ${a.name}`, path: `/applications/${a.slug}`, editUrl: "/admin/applications", links: parseMarkdownLinks(a.longContent || "") })),
      ...navItems.map((n) => ({ label: `Menu: ${n.label}`, path: "(header/footer)", editUrl: "/admin/navigation", links: n.url?.startsWith("/") ? [n.url] : [] })),
    ];
    for (const src of linkSources) {
      const seen = new Set<string>();
      for (const link of src.links) {
        if (seen.has(link)) continue;
        seen.add(link);
        if (!linkValid(link)) {
          push({ severity: "error", type: "broken_link", message: `Broken internal link "${link}"`, entity: src.label, path: src.path, editUrl: src.editUrl });
        }
      }
    }

    // ---------- 5. Media without alt text ----------
    const noAlt = media.filter((m) => !(m.alt || "").trim());
    if (noAlt.length) {
      push({
        severity: "warning", type: "media_alt",
        message: `${noAlt.length} media file(s) missing alt text: ${noAlt.slice(0, 8).map((m) => m.filename).join(", ")}${noAlt.length > 8 ? "…" : ""}`,
        editUrl: "/admin/media",
      });
    }

    // ---------- 6. Indexing sanity ----------
    const publishedNoindex = [
      ...landings.filter((l) => l.published && l.noindex).map((l) => `Landing: ${l.title}`),
      ...pages.filter((p) => p.published && p.noindex).map((p) => `Page: ${p.title}`),
      ...locations.filter((l) => l.published && l.noindex).map((l) => `Location: ${l.city}`),
    ];
    if (publishedNoindex.length) {
      push({ severity: "warning", type: "published_noindex", message: `Published but set to noindex (Google will not index): ${publishedNoindex.join(", ")}`, editUrl: "/admin/landing" });
    }
    const now = new Date();
    const scheduledBlogs = blogs.filter((b) => b.published && b.publishedAt && b.publishedAt > now);
    if (scheduledBlogs.length) {
      push({ severity: "info", type: "scheduled", message: `${scheduledBlogs.length} blog post(s) scheduled for future publishing: ${scheduledBlogs.map((b) => b.title).join(", ")}`, editUrl: "/admin/blog" });
    }

    const summary = {
      error: issues.filter((i) => i.severity === "error").length,
      warning: issues.filter((i) => i.severity === "warning").length,
      info: issues.filter((i) => i.severity === "info").length,
      total: issues.length,
    };

    return NextResponse.json({
      ok: true,
      generatedAt: new Date().toISOString(),
      scanned: {
        products: products.length, blogs: blogs.length, landings: landings.length,
        pages: pages.length, locations: locations.length, categories: categories.length,
        applications: applications.length, media: media.length, navItems: navItems.length,
      },
      summary,
      issues,
    });
  });
}
