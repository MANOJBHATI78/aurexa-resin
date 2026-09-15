import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  return requireAdmin(req, async () => {
    const [products, categories, blogs, landings, pages, locations, apps, inquiries, published, drafts, newInquiries, media] =
      await Promise.all([
        db.product.count(),
        db.category.count(),
        db.blogPost.count(),
        db.landingPage.count(),
        db.page.count(),
        db.locationPage.count(),
        db.application.count(),
        db.inquiry.count(),
        db.product.count({ where: { published: true } }),
        db.product.count({ where: { published: false } }),
        db.inquiry.count({ where: { status: "NEW" } }),
        db.media.count(),
      ]);

    const [recentInquiries, recentProducts, recentBlogs] = await Promise.all([
      db.inquiry.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
      db.product.findMany({ orderBy: { updatedAt: "desc" }, take: 5, select: { id: true, name: true, slug: true, published: true, updatedAt: true } }),
      db.blogPost.findMany({ orderBy: { updatedAt: "desc" }, take: 5, select: { id: true, title: true, slug: true, published: true, updatedAt: true } }),
    ]);

    // SEO health: simple heuristic checks
    const [productsNoSeo, categoriesNoSeo, blogsNoSeo] = await Promise.all([
      db.product.count({ where: { OR: [{ seoTitle: null }, { seoDescription: null }] } }),
      db.category.count({ where: { OR: [{ seoTitle: null }, { seoDescription: null }] } }),
      db.blogPost.count({ where: { OR: [{ seoTitle: null }, { seoDescription: null }] } }),
    ]);

    const seoChecks = [
      { label: "Products missing SEO title/description", count: productsNoSeo, ok: productsNoSeo === 0 },
      { label: "Categories missing SEO title/description", count: categoriesNoSeo, ok: categoriesNoSeo === 0 },
      { label: "Blog posts missing SEO title/description", count: blogsNoSeo, ok: blogsNoSeo === 0 },
    ];
    const passed = seoChecks.filter((c) => c.ok).length;
    const seoScore = Math.round((passed / seoChecks.length) * 100);

    return NextResponse.json({
      stats: {
        products, categories, blogs, landings, pages, locations, apps, inquiries, media,
        published, drafts, newInquiries,
      },
      seo: { score: seoScore, checks: seoChecks },
      recentInquiries,
      recentProducts,
      recentBlogs,
    });
  });
}
