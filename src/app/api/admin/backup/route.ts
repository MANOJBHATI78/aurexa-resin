import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { db } from "@/lib/db";
import { ensureLandingSource, ensureRevisionsTable } from "@/lib/lazy-migrate";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Full database backup as a single JSON download.
 * Includes every table (optionally without heavy media file bytes via
 * ?media=meta). Date-stamped filename for easy archival.
 */
export async function GET(req: NextRequest) {
  return requireAdmin(req, async () => {
    await ensureLandingSource();
    await ensureRevisionsTable();

    const includeMediaFiles = req.nextUrl.searchParams.get("media") !== "meta";

    const [
      adminUsers, categories, applications, navigationItems, products,
      blogPosts, pages, landingPages, locationPages, faqs, testimonials,
      homeSections, inquiries, media, siteSettings, redirects, customCode, pageSchemas,
    ] = await Promise.all([
      db.adminUser.findMany({ select: { id: true, email: true, name: true, role: true, createdAt: true } }), // never export password hashes
      db.category.findMany(),
      db.application.findMany(),
      db.navigationItem.findMany(),
      db.product.findMany(),
      db.blogPost.findMany(),
      db.page.findMany(),
      db.landingPage.findMany(),
      db.locationPage.findMany(),
      db.faq.findMany(),
      db.testimonial.findMany(),
      db.homeSection.findMany(),
      db.inquiry.findMany(),
      includeMediaFiles
        ? db.media.findMany()
        : db.media.findMany({ select: { id: true, filename: true, url: true, mimeType: true, size: true, alt: true, title: true, caption: true, description: true, folder: true, createdAt: true, updatedAt: true } }),
      db.siteSetting.findMany(),
      db.redirect.findMany(),
      db.customCode.findMany(),
      db.pageSchema.findMany(),
    ]);

    const backup = {
      meta: {
        brand: "Aurexa Resin",
        generatedAt: new Date().toISOString(),
        mediaFiles: includeMediaFiles ? "full (base64)" : "metadata only",
        version: 1,
      },
      tables: {
        adminUser: adminUsers,
        category: categories,
        application: applications,
        navigationItem: navigationItems,
        product: products,
        blogPost: blogPosts,
        page: pages,
        landingPage: landingPages,
        locationPage: locationPages,
        faq: faqs,
        testimonial: testimonials,
        homeSection: homeSections,
        inquiry: inquiries,
        media,
        siteSetting: siteSettings,
        redirect: redirects,
        customCode,
        pageSchema: pageSchemas,
      },
    };

    const date = new Date().toISOString().slice(0, 10);
    return new NextResponse(JSON.stringify(backup, null, 1), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="aurexa-backup-${date}.json"`,
        "Cache-Control": "no-store",
      },
    });
  });
}
