import { db } from "@/lib/db";
import { makeCrud, ensureUniqueSlug } from "@/lib/admin-crud";
import { slugify } from "@/lib/seo";

/** Registry of admin-managed resources → Prisma delegates + CRUD config */
export const RESOURCES = {
  products: () =>
    makeCrud({
      model: db.product,
      orderBy: { updatedAt: "desc" as const },
      searchFields: ["name", "slug", "sku"],
      fields: [
        "name", "slug", "sku", "shortDesc", "longDesc", "image", "gallery", "categoryId",
        "resinType", "mixingRatio", "packSizes", "curingInfo", "workingTime", "applications",
        "recommendedUse", "pourDepth", "finish", "features", "benefits", "suitableFor",
        "safetyInfo", "specs", "showPrice", "price", "featured", "published",
        "seoTitle", "seoDescription", "seoKeywords", "canonical", "ogTitle", "ogDescription",
        "ogImage", "noindex", "customHeadCode",
      ],
      transform: (data) => {
        if (!data.slug && data.name) data.slug = slugify(String(data.name));
        if (typeof data.slug === "string" && data.slug) data.slug = slugify(data.slug) || `product-${Date.now()}`;
        if (data.categoryId === "" || data.categoryId === undefined) data.categoryId = null;
        if (typeof data.showPrice !== "boolean") data.showPrice = data.showPrice === "true";
        return data;
      },
    }),

  categories: () =>
    makeCrud({
      model: db.category,
      orderBy: { order: "asc" as const },
      searchFields: ["name", "slug"],
      fields: [
        "name", "slug", "description", "longContent", "image", "icon", "order", "featured", "published",
        "seoTitle", "seoDescription", "seoKeywords", "canonical", "ogTitle", "ogDescription",
        "ogImage", "noindex", "customHeadCode",
      ],
      transform: (data) => {
        if (typeof data.order === "string") data.order = parseInt(data.order, 10) || 0;
        return data;
      },
    }),

  blog: () =>
    makeCrud({
      model: db.blogPost,
      orderBy: { updatedAt: "desc" as const },
      searchFields: ["title", "slug"],
      fields: [
        "title", "slug", "excerpt", "content", "featuredImage", "author", "tags",
        "readingTime", "published", "publishedAt",
        "seoTitle", "seoDescription", "seoKeywords", "canonical", "ogTitle", "ogDescription",
        "ogImage", "noindex", "customHeadCode",
      ],
      transform: (data, mode) => {
        if (!data.slug && data.title) data.slug = slugify(String(data.title));
        if (typeof data.slug === "string" && data.slug) data.slug = slugify(data.slug) || `post-${Date.now()}`;
        if (data.published === true && mode === "update") {
          data.publishedAt = data.publishedAt ? new Date(String(data.publishedAt)) : new Date();
        }
        if (data.publishedAt && typeof data.publishedAt === "string") {
          data.publishedAt = new Date(data.publishedAt);
        } else if (data.publishedAt === null || data.publishedAt === "") {
          data.publishedAt = null;
        }
        if (typeof data.readingTime === "string") data.readingTime = parseInt(data.readingTime, 10) || null;
        return data;
      },
    }),

  pages: () =>
    makeCrud({
      model: db.page,
      orderBy: { sortOrder: "asc" as const },
      searchFields: ["title", "slug"],
      fields: ["title", "slug", "content", "published", "showInFooter", "sortOrder", "seoTitle", "seoDescription", "noindex"],
      transform: (data) => {
        if (typeof data.sortOrder === "string") data.sortOrder = parseInt(data.sortOrder, 10) || 0;
        return data;
      },
    }),

  landing: () =>
    makeCrud({
      model: db.landingPage,
      orderBy: { updatedAt: "desc" as const },
      searchFields: ["title", "slug"],
      fields: [
        "title", "slug", "h1", "blocks", "published",
        "seoTitle", "seoDescription", "seoKeywords", "canonical", "ogTitle", "ogDescription",
        "ogImage", "noindex", "customHeadCode",
      ],
      transform: (data) => {
        if (!data.slug && data.title) data.slug = slugify(String(data.title));
        if (typeof data.slug === "string" && data.slug) data.slug = slugify(data.slug) || `page-${Date.now()}`;
        return data;
      },
    }),

  applications: () =>
    makeCrud({
      model: db.application,
      orderBy: { order: "asc" as const },
      searchFields: ["name", "slug"],
      fields: ["name", "slug", "description", "longContent", "image", "icon", "order", "published", "seoTitle", "seoDescription", "noindex"],
      transform: (data) => {
        if (typeof data.order === "string") data.order = parseInt(data.order, 10) || 0;
        return data;
      },
    }),

  faqs: () =>
    makeCrud({
      model: db.faq,
      orderBy: [{ entityType: "asc" as const }, { order: "asc" as const }],
      searchFields: ["question"],
      fields: ["question", "answer", "order", "active", "entityType", "entityId", "categoryId"],
      transform: (data) => {
        if (typeof data.order === "string") data.order = parseInt(data.order, 10) || 0;
        if (data.entityId === "") data.entityId = null;
        if (data.categoryId === "") data.categoryId = null;
        return data;
      },
    }),

  testimonials: () =>
    makeCrud({
      model: db.testimonial,
      orderBy: { order: "asc" as const },
      searchFields: ["name"],
      fields: ["name", "location", "review", "rating", "product", "visible", "order"],
      transform: (data) => {
        if (typeof data.rating === "string") data.rating = parseInt(data.rating, 10) || 5;
        if (typeof data.order === "string") data.order = parseInt(data.order, 10) || 0;
        return data;
      },
    }),

  inquiries: () =>
    makeCrud({
      model: db.inquiry,
      orderBy: { createdAt: "desc" as const },
      searchFields: ["name", "mobile", "city", "product"],
      fields: ["status", "notes"],
    }),

  navigation: () =>
    makeCrud({
      model: db.navigationItem,
      orderBy: [{ location: "asc" as const }, { order: "asc" as const }],
      fields: ["label", "url", "location", "parentId", "order", "enabled"],
      transform: (data) => {
        if (typeof data.order === "string") data.order = parseInt(data.order, 10) || 0;
        if (data.parentId === "") data.parentId = null;
        return data;
      },
    }),

  sections: () =>
    makeCrud({
      model: db.homeSection,
      orderBy: { order: "asc" as const },
      fields: ["type", "title", "data", "order", "visible"],
      transform: (data) => {
        if (typeof data.order === "string") data.order = parseInt(data.order, 10) || 0;
        return data;
      },
    }),

  locations: () =>
    makeCrud({
      model: db.locationPage,
      orderBy: { updatedAt: "desc" as const },
      searchFields: ["city", "state", "country", "slug"],
      fields: [
        "country", "state", "city", "slug", "description", "content", "keywords", "published",
        "seoTitle", "seoDescription", "noindex",
      ],
      transform: (data) => {
        if (!data.slug && (data.city || data.state)) {
          data.slug = slugify([data.city, data.state].filter(Boolean).join(" ")) || `loc-${Date.now()}`;
        }
        if (typeof data.slug === "string" && data.slug) data.slug = slugify(data.slug) || `loc-${Date.now()}`;
        return data;
      },
    }),

  redirects: () =>
    makeCrud({
      model: db.redirect,
      orderBy: { createdAt: "desc" as const },
      searchFields: ["fromPath", "toPath"],
      fields: ["fromPath", "toPath", "statusCode", "active"],
      transform: (data) => {
        if (data.fromPath) data.fromPath = String(data.fromPath).trim();
        if (!data.fromPath.startsWith("/")) data.fromPath = `/${data.fromPath}`;
        if (data.toPath) data.toPath = String(data.toPath).trim();
        if (typeof data.statusCode === "string") data.statusCode = parseInt(data.statusCode, 10) || 301;
        return data;
      },
    }),

  customcode: () =>
    makeCrud({
      model: db.customCode,
      orderBy: { createdAt: "desc" as const },
      fields: ["name", "placement", "scope", "content", "enabled"],
    }),

  media: () =>
    makeCrud({
      model: db.media,
      orderBy: { createdAt: "desc" as const },
      searchFields: ["filename", "alt", "folder"],
      fields: ["filename", "url", "mimeType", "size", "alt", "title", "caption", "description", "folder"],
    }),
};

export type ResourceName = keyof typeof RESOURCES;

export function getResource(name: string) {
  const factory = RESOURCES[name as ResourceName];
  return factory ? factory() : null;
}

export { ensureUniqueSlug };
