import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim().toLowerCase() || "";
  if (q.length < 2) return NextResponse.json({ results: [] });

  // SQLite LIKE is case-sensitive; fetch and filter in JS for reliable search
  const [products, categories, posts, landings] = await Promise.all([
    db.product.findMany({
      where: { published: true },
      select: { name: true, slug: true, shortDesc: true, resinType: true },
    }),
    db.category.findMany({ where: { published: true }, select: { name: true, slug: true, description: true } }),
    db.blogPost.findMany({ where: { published: true }, select: { title: true, slug: true, excerpt: true } }),
    db.landingPage.findMany({ where: { published: true }, select: { title: true, slug: true, h1: true } }),
  ]);

  const match = (...fields: (string | null | undefined)[]) =>
    fields.some((f) => (f || "").toLowerCase().includes(q));

  const results = [
    ...products.filter((p) => match(p.name, p.shortDesc, p.resinType)).slice(0, 8)
      .map((p) => ({ type: "Product", title: p.name, url: `/products/${p.slug}`, text: p.shortDesc || "" })),
    ...categories.filter((c) => match(c.name, c.description)).slice(0, 4)
      .map((c) => ({ type: "Category", title: c.name, url: `/resin/${c.slug}`, text: c.description || "" })),
    ...posts.filter((b) => match(b.title, b.excerpt)).slice(0, 4)
      .map((b) => ({ type: "Article", title: b.title, url: `/blog/${b.slug}`, text: b.excerpt || "" })),
    ...landings.filter((l) => match(l.title, l.h1)).slice(0, 3)
      .map((l) => ({ type: "Page", title: l.title, url: `/${l.slug}`, text: "" })),
  ];

  return NextResponse.json({ results });
}
