"use client";

import { ResourceManager, BoolBadge, type FieldDef } from "@/components/admin/resource-manager";

const SEO_FIELDS: FieldDef[] = [
  { name: "seoTitle", label: "SEO Title", type: "text", group: "SEO", full: true, hint: "Overrides the automatic title template." },
  { name: "seoDescription", label: "Meta Description", type: "textarea", group: "SEO", rows: 2, hint: "155–160 characters recommended." },
  { name: "seoKeywords", label: "Keywords (comma separated)", type: "text", group: "SEO", full: true },
  { name: "canonical", label: "Canonical URL", type: "text", group: "SEO", hint: "Leave empty for default." },
  { name: "ogTitle", label: "OG Title", type: "text", group: "Social" },
  { name: "ogDescription", label: "OG Description", type: "text", group: "Social" },
  { name: "ogImage", label: "OG Image URL", type: "text", group: "Social", hint: "1200×630 recommended." },
  { name: "noindex", label: "Hide from search engines (noindex)", type: "boolean", group: "SEO" },
  { name: "customHeadCode", label: "Custom Head Code (HTML/JSON-LD)", type: "code", group: "Advanced", full: true, hint: "Only for authorized admins. Injected into <head> on this page type." },
];

export default function AdminProductsPage() {
  return (
    <ResourceManager
      resource="products"
      title="Products"
      description="Manage your resin product catalogue — details, specifications, pack sizes, SEO and visibility."
      searchPlaceholder="Search products by name, slug or SKU…"
      defaults={{ published: true, featured: false, noindex: false, showPrice: false }}
      columns={[
        { name: "name", label: "Product", render: (row) => (
          <div>
            <p className="font-medium text-forest truncate">{String(row.name)}</p>
            <p className="text-xs text-muted-foreground truncate">/products/{String(row.slug)}</p>
          </div>
        )},
        { name: "sku", label: "SKU" },
        { name: "mixingRatio", label: "Ratio" },
        { name: "featured", label: "Featured", render: (row) => <BoolBadge value={row.featured} trueLabel="Featured" falseLabel="—" /> },
        { name: "published", label: "Status", render: (row) => <BoolBadge value={row.published} trueLabel="Published" falseLabel="Draft" /> },
      ]}
      fields={[
        // Basics
        { name: "name", label: "Product Name", type: "text", group: "Basics", full: true },
        { name: "slug", label: "URL Slug", type: "text", group: "Basics", hint: "Auto-generated from name if empty. e.g. clear-epoxy-resin" },
        { name: "sku", label: "SKU", type: "text", group: "Basics" },
        { name: "categoryId", label: "Category", type: "select", group: "Basics", optionsResource: "categories", placeholder: "Select category" },
        { name: "shortDesc", label: "Short Description", type: "textarea", group: "Basics", full: true, rows: 2 },
        { name: "longDesc", label: "Long Description", type: "markdown", group: "Basics", full: true, rows: 6 },
        { name: "image", label: "Main Image", type: "image", group: "Basics", full: true },

        // Specifications
        { name: "resinType", label: "Resin Type", type: "text", group: "Specifications", hint: "e.g. Clear Epoxy, Deep Pour Epoxy" },
        { name: "mixingRatio", label: "Mixing Ratio", type: "text", group: "Specifications", hint: "e.g. 2:1, 3:1" },
        { name: "finish", label: "Finish", type: "text", group: "Specifications", hint: "e.g. High gloss, water clear" },
        { name: "pourDepth", label: "Pour Depth Guidance", type: "text", group: "Specifications" },
        { name: "workingTime", label: "Working Time", type: "text", group: "Specifications" },
        { name: "curingInfo", label: "Curing Information", type: "textarea", group: "Specifications", full: true, rows: 2 },
        { name: "recommendedUse", label: "Recommended Use", type: "text", group: "Specifications", full: true },
        { name: "packSizes", label: "Pack Sizes", type: "list", group: "Specifications", full: true, placeholder: "e.g. 1 kg", hint: "Stored as variants with availability." },
        { name: "applications", label: "Applications", type: "list", group: "Specifications", full: true, placeholder: "e.g. Table tops" },
        { name: "features", label: "Features", type: "list", group: "Content", full: true },
        { name: "benefits", label: "Benefits", type: "list", group: "Content", full: true },
        { name: "suitableFor", label: "Suitable For", type: "list", group: "Content", full: true, placeholder: "e.g. Jewellery makers" },
        { name: "safetyInfo", label: "Safety Information", type: "textarea", group: "Content", full: true, rows: 2 },

        // Pricing
        { name: "showPrice", label: "Show Price (disabled by default)", type: "boolean", group: "Pricing" },
        { name: "price", label: "Price (only if enabled)", type: "text", group: "Pricing" },

        // Status
        { name: "published", label: "Published", type: "boolean", group: "Status" },
        { name: "featured", label: "Featured (shows on homepage)", type: "boolean", group: "Status" },
        ...SEO_FIELDS,
      ]}
    />
  );
}
