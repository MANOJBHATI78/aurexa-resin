import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_URL;

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/products`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/sale`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/resin`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/applications`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/inquiry`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/blog`, changeFrequency: "weekly", priority: 0.8 },
  ];

  try {
    const [products, categories, posts, pages, landings, locations] = await Promise.all([
      db.product.findMany({ where: { published: true, noindex: false }, select: { slug: true, updatedAt: true } }),
      db.category.findMany({ where: { published: true, noindex: false }, select: { slug: true, updatedAt: true } }),
      db.blogPost.findMany({ where: { published: true, noindex: false }, select: { slug: true, updatedAt: true } }),
      db.page.findMany({ where: { published: true, noindex: false }, select: { slug: true, updatedAt: true } }),
      db.landingPage.findMany({ where: { published: true, noindex: false }, select: { slug: true, updatedAt: true } }),
      db.locationPage.findMany({ where: { published: true, noindex: false }, select: { slug: true, updatedAt: true } }),
    ]);

    return [
      ...staticRoutes,
      ...products.map((p) => ({ url: `${base}/products/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 })),
      ...categories.map((c) => ({ url: `${base}/resin/${c.slug}`, lastModified: c.updatedAt, changeFrequency: "weekly" as const, priority: 0.85 })),
      ...posts.map((b) => ({ url: `${base}/blog/${b.slug}`, lastModified: b.updatedAt, changeFrequency: "monthly" as const, priority: 0.7 })),
      ...pages.map((p) => ({ url: `${base}/p/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "yearly" as const, priority: 0.3 })),
      ...landings.map((l) => ({ url: `${base}/${l.slug}`, lastModified: l.updatedAt, changeFrequency: "weekly" as const, priority: 0.9 })),
      ...locations.map((l) => ({ url: `${base}/locations/${l.slug}`, lastModified: l.updatedAt, changeFrequency: "monthly" as const, priority: 0.8 })),
    ];
  } catch {
    return staticRoutes;
  }
}
