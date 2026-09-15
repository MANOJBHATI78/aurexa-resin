import { db } from "@/lib/db";

export interface SiteSettings {
  brandName: string;
  brandLegalName: string;
  tagline: string;
  shortDescription: string;
  businessDescription: string;
  footerDescription: string;
  phone: string;
  whatsappNumber: string;
  whatsappDefaultMessage: string;
  whatsappProductTemplate: string;
  whatsappCategoryTemplate: string;
  email: string;
  addressLine: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  businessHours: string;
  googleMapsUrl: string;
  googleBusinessProfileUrl: string;
  instagramUrl: string;
  facebookUrl: string;
  linkedinUrl: string;
  youtubeUrl: string;
  pinterestUrl: string;
  logo: string;
  favicon: string;
  ogDefaultImage: string;
  // SEO defaults
  siteTitle: string;
  siteMetaDescription: string;
  siteKeywords: string;
  seoTitleTemplateProduct: string;
  seoTitleTemplateCategory: string;
  seoTitleTemplateLocation: string;
  defaultOgImage: string;
  robotsTxt: string;
  // Tracking
  ga4Id: string;
  gtmId: string;
  gscVerification: string;
  clarityId: string;
  metaPixelId: string;
  customHeadCode: string;
  customBodyStartCode: string;
  customBodyEndCode: string;
  customGlobalCss: string;
  customGlobalJs: string;
  // Floating buttons
  showWhatsAppFloat: string;
  showCallFloat: string;
  showInquiryFloat: string;
  floatPosition: string;
  // Header
  announcementBar: string;
  announcementEnabled: string;
  stickyHeader: string;
  headerCtaLabel: string;
  headerCtaUrl: string;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  brandName: "Aurexa Resin",
  brandLegalName: "Aurexa Resin",
  tagline: "Premium Epoxy Resin Wholesaler in Surat",
  shortDescription:
    "Aurexa Resin is an epoxy resin wholesaler, supplier and dealer based in Surat, Gujarat, serving artists, workshops, resellers and industries across India.",
  businessDescription:
    "Aurexa Resin is a Surat-based epoxy resin supply business offering a wide range of epoxy resin systems for art, craft, jewellery, woodworking, table tops, river tables, coating, casting and industrial applications. We cater to wholesale, bulk and single-piece requirements with pan-India supply.",
  footerDescription:
    "Aurexa Resin — epoxy resin wholesaler, supplier and dealer in Surat, Gujarat. Clear, casting, art, table top and industrial epoxy resin for artists, workshops, resellers and industries across India.",
  phone: "+91 93164 94976",
  whatsappNumber: "919316494976",
  whatsappDefaultMessage:
    "Hello Aurexa Resin, I am interested in your resin products. Please share product details.",
  whatsappProductTemplate:
    "Hello Aurexa Resin, I am interested in {PRODUCT}. Please share the details.",
  whatsappCategoryTemplate:
    "Hello Aurexa Resin, I want to know about your {CATEGORY} products.",
  email: "",
  addressLine: "",
  city: "Surat",
  state: "Gujarat",
  country: "India",
  pincode: "",
  businessHours: "Monday – Saturday, 10:00 AM – 8:00 PM IST",
  googleMapsUrl: "",
  googleBusinessProfileUrl: "https://share.google/ndEXNcLkKfN17xSUx",
  instagramUrl: "https://www.instagram.com/aurexa_resin/",
  facebookUrl: "",
  linkedinUrl: "",
  youtubeUrl: "",
  pinterestUrl: "",
  logo: "/uploads/aurexa-logo-crop.png",
  favicon: "/uploads/aurexa-favicon.png",
  ogDefaultImage: "/uploads/aurexa-logo.png",
  siteTitle: "Aurexa Resin | Epoxy Resin Wholesaler, Supplier & Dealer in Surat",
  siteMetaDescription:
    "Aurexa Resin is an epoxy resin wholesaler, supplier and dealer in Surat, Gujarat. Buy clear, crystal clear, art, casting, table top, deep pour and industrial epoxy resin for art, craft, jewellery, woodworking and industrial use. Pan-India supply. WhatsApp +91 93164 94976.",
  siteKeywords:
    "epoxy resin wholesaler surat, epoxy resin supplier surat, resin dealer surat, clear epoxy resin, art resin, casting resin, table top epoxy, deep pour epoxy, buy epoxy resin india",
  seoTitleTemplateProduct: "{name} | Epoxy Resin Supplier in Surat | Aurexa Resin",
  seoTitleTemplateCategory: "{name} | Epoxy Resin Supplier & Wholesaler | Aurexa Resin",
  seoTitleTemplateLocation: "Epoxy Resin Supplier in {name} | Aurexa Resin",
  defaultOgImage: "/uploads/aurexa-logo.png",
  robotsTxt: "",
  ga4Id: "",
  gtmId: "",
  gscVerification: "",
  clarityId: "",
  metaPixelId: "",
  customHeadCode: "",
  customBodyStartCode: "",
  customBodyEndCode: "",
  customGlobalCss: "",
  customGlobalJs: "",
  showWhatsAppFloat: "true",
  showCallFloat: "true",
  showInquiryFloat: "true",
  floatPosition: "right",
  announcementBar:
    "Wholesale & bulk epoxy resin inquiries welcome — Pan-India supply | WhatsApp +91 93164 94976",
  announcementEnabled: "true",
  stickyHeader: "true",
  headerCtaLabel: "Send Inquiry",
  headerCtaUrl: "/inquiry",
};

export async function getSettings(): Promise<SiteSettings> {
  try {
    const rows = await db.siteSetting.findMany();
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    return { ...DEFAULT_SETTINGS, ...map } as SiteSettings;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

// Cached for public page rendering — invalidated by admin updates via revalidation calls
let cache: { data: SiteSettings; ts: number } | null = null;
const TTL = 30_000;

export async function getSettingsCached(): Promise<SiteSettings> {
  if (cache && Date.now() - cache.ts < TTL) return cache.data;
  const data = await getSettings();
  cache = { data, ts: Date.now() };
  return data;
}

export function invalidateSettingsCache() {
  cache = null;
}

export async function saveSettings(partial: Partial<Record<keyof SiteSettings, string>>) {
  for (const [key, value] of Object.entries(partial)) {
    await db.siteSetting.upsert({
      where: { key },
      update: { value: value ?? "" },
      create: { key, value: value ?? "" },
    });
  }
  invalidateSettingsCache();
}

export function waLink(number: string, message: string): string {
  return `https://wa.me/${number.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(message)}`;
}
