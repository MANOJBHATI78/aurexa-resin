import type { Metadata } from "next";
import { getSettingsCached, type SiteSettings } from "@/lib/settings";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.aurexaresin.com";

export function absoluteUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

interface SeoInput {
  title?: string | null;
  description?: string | null;
  keywords?: string | null;
  canonical?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  noindex?: boolean | null;
  path: string;
  fallbackTitle: string;
  fallbackDescription?: string;
}

export async function buildMetadata(input: SeoInput): Promise<Metadata> {
  const s = await getSettingsCached();
  const title = input.title || input.fallbackTitle;
  const description =
    input.description || input.fallbackDescription || s.siteMetaDescription;
  const image = input.ogImage || s.defaultOgImage;
  const url = absoluteUrl(input.canonical || input.path);
  return {
    title,
    description,
    keywords: input.keywords || undefined,
    alternates: { canonical: input.canonical ? absoluteUrl(input.canonical) : url },
    robots: input.noindex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      title: input.ogTitle || title,
      description: input.ogDescription || description,
      url,
      siteName: s.brandName,
      images: [{ url: absoluteUrl(image) }],
      type: "website",
      locale: "en_IN",
    },
    twitter: {
      card: "summary_large_image",
      title: input.ogTitle || title,
      description: input.ogDescription || description,
      images: [absoluteUrl(image)],
    },
  };
}

// ---------- JSON-LD builders ----------

export function organizationSchema(s: SiteSettings) {
  const sameAs = [s.instagramUrl, s.facebookUrl, s.linkedinUrl, s.youtubeUrl, s.pinterestUrl, s.googleBusinessProfileUrl].filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness"],
    "@id": `${SITE_URL}/#organization`,
    name: s.brandName,
    description: s.businessDescription,
    url: SITE_URL,
    logo: absoluteUrl(s.logo),
    image: absoluteUrl(s.ogDefaultImage),
    telephone: s.phone,
    email: s.email || undefined,
    address: {
      "@type": "PostalAddress",
      addressLocality: s.city,
      addressRegion: s.state,
      addressCountry: "IN",
    },
    openingHours: s.businessHours || undefined,
    sameAs: sameAs.length ? sameAs : undefined,
    ...(s.googleBusinessProfileUrl
      ? { hasMap: s.googleMapsUrl || undefined }
      : {}),
    areaServed: { "@type": "Country", name: "India" },
    priceRange: "$$",
  };
}

export function websiteSchema(s: SiteSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: s.brandName,
    url: SITE_URL,
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  };
}

export function faqSchema(faqs: { question: string; answer: string }[]) {
  if (!faqs.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function productSchema(p: {
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  brand: string;
  sku?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description || `${p.name} available from ${p.brand}, epoxy resin wholesaler in Surat, Gujarat.`,
    sku: p.sku || undefined,
    image: p.image ? [absoluteUrl(p.image)] : undefined,
    brand: { "@type": "Brand", name: p.brand },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      seller: { "@type": "Organization", name: p.brand },
      url: absoluteUrl(`/products/${p.slug}`),
      // price omitted — wholesale pricing shared on inquiry
    },
  };
}

export function articleSchema(b: {
  title: string;
  slug: string;
  excerpt?: string | null;
  image?: string | null;
  author: string;
  publishedAt?: Date | null;
  updatedAt?: Date | null;
  brand: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: b.title,
    description: b.excerpt || undefined,
    image: b.image ? [absoluteUrl(b.image)] : undefined,
    author: { "@type": "Organization", name: b.author },
    publisher: { "@type": "Organization", name: b.brand, logo: { "@type": "ImageObject", url: absoluteUrl("/uploads/aurexa-logo-crop.png") } },
    datePublished: b.publishedAt?.toISOString(),
    dateModified: (b.updatedAt || b.publishedAt)?.toISOString(),
    mainEntityOfPage: absoluteUrl(`/blog/${b.slug}`),
  };
}

export function itemListSchema(items: { name: string; url: string }[], name: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      url: absoluteUrl(item.url),
    })),
  };
}

export function parseJsonArray<T = string>(raw: string | null | undefined): T[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
