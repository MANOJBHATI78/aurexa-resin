/**
 * Browser-safe settings module — types, defaults and pure helpers ONLY.
 * Client components must import from here (NOT from "@/lib/settings",
 * which imports the Prisma client and can never be bundled for the browser).
 */

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
  ga4CustomCode: string;
  gtmCustomCode: string;
  gscCustomCode: string;
  clarityCustomCode: string;
  metaPixelCustomCode: string;
  customHeadCode: string;
  customBodyStartCode: string;
  customBodyEndCode: string;
  customGlobalCss: string;
  customGlobalJs: string;
  // Lead gate — WhatsApp/Call click capture
  leadGateEnabled: string;
  leadGateHeading: string;
  leadGateText: string;
  leadGateOncePerVisitor: string;
  // Google Reviews
  googleReviewsEnabled: string;
  googleRating: string;
  googleReviewCount: string;
  googleReviewsData: string;
  googlePlaceId: string;
  googleApiKey: string;
  // Google Shopping feed
  shoppingFeedEnabled: string;
  shoppingBrand: string;
  shoppingCondition: string;
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
  headerShowPhone: string;
  headerShowWhatsApp: string;
  headerShowCta: string;
  // Hero banner (desktop + mobile)
  heroBannerEnabled: string;
  heroBannerImage: string;
  heroBannerMobileImage: string;
  heroBannerAlt: string;
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
    "Aurexa Resin — ultra crystal clear epoxy resin wholesale manufacturer, supplier, exporter & B2B bulk supplier in Surat, Gujarat. Bubble free, atmosphere friendly 2:1 resin (4 hrs dry) & 3:1 resin (10 hrs dry), art, casting, table top, deep pour & industrial grades. Pan-India dispatch.",
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
  logo: "/uploads/aurexa-logo.png",
  favicon: "/uploads/aurexa-favicon.png",
  ogDefaultImage: "/uploads/aurexa-logo.png",
  siteTitle: "Aurexa Resin | Ultra Crystal Clear Epoxy Resin Wholesaler, Manufacturer & Supplier — Surat",
  siteMetaDescription:
    "Buy ultra crystal clear epoxy resin direct from Aurexa Resin — wholesale manufacturer, supplier, exporter & B2B bulk supplier in Surat, Gujarat. Bubble free, atmosphere friendly 2:1 resin (4 hrs dry) & 3:1 resin (10 hrs dry) for art, tables, jewellery & industry. Pan-India dispatch. WhatsApp +91 93164 94976.",
  siteKeywords:
    "ultra crystal clear resin, ultra crystal clear epoxy resin, epoxy resin wholesale, resin wholesaler surat, resin manufacturer india, resin supplier surat, resin exporter india, b2b bulk resin supplier, 2:1 resin, 3:1 resin, bubble free resin, atmosphere friendly resin, crystal clear epoxy, art resin, casting resin, deep pour resin, epoxy resin surat, buy epoxy resin india",
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
  ga4CustomCode: "",
  gtmCustomCode: "",
  gscCustomCode: "",
  clarityCustomCode: "",
  metaPixelCustomCode: "",
  leadGateEnabled: "true",
  leadGateHeading: "Before you continue…",
  leadGateText:
    "Please share your details so our team can assist you faster on WhatsApp — wholesale prices, bulk offers and product catalogues.",
  leadGateOncePerVisitor: "true",
  googleReviewsEnabled: "true",
  googleRating: "",
  googleReviewCount: "",
  googleReviewsData: "",
  googlePlaceId: "",
  googleApiKey: "",
  shoppingFeedEnabled: "true",
  shoppingBrand: "Aurexa Resin",
  shoppingCondition: "new",
  showWhatsAppFloat: "true",
  showCallFloat: "true",
  showInquiryFloat: "true",
  floatPosition: "right",
  announcementBar:
    "Ultra Crystal Clear Resin · Bubble Free · 2:1 & 3:1 Systems — Wholesale B2B Bulk Supply | WhatsApp +91 93164 94976",
  announcementEnabled: "true",
  stickyHeader: "true",
  headerCtaLabel: "Send Inquiry",
  headerCtaUrl: "/inquiry",
  headerShowPhone: "true",
  headerShowWhatsApp: "true",
  headerShowCta: "true",
  heroBannerEnabled: "true",
  heroBannerImage: "",
  heroBannerMobileImage: "/uploads/aurexa-banner-mobile.jpg",
  heroBannerAlt:
    "Aurexa Resin — premium epoxy resin wholesaler in Surat, Gujarat. Original brand logo with golden resin drop.",
};

export function waLink(number: string, message: string): string {
  return `https://wa.me/${number.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(message)}`;
}
