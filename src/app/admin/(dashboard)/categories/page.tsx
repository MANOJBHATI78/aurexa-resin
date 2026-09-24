"use client";

import { ResourceManager, BoolBadge, type FieldDef } from "@/components/admin/resource-manager";

const SEO_FIELDS: FieldDef[] = [
  { name: "seoTitle", label: "SEO Title", type: "text", group: "SEO", full: true },
  { name: "seoDescription", label: "Meta Description", type: "textarea", group: "SEO", rows: 2 },
  { name: "seoKeywords", label: "Keywords (comma separated)", type: "text", group: "SEO", full: true },
  { name: "canonical", label: "Canonical URL", type: "text", group: "SEO" },
  { name: "ogTitle", label: "OG Title", type: "text", group: "Social" },
  { name: "ogDescription", label: "OG Description", type: "text", group: "Social" },
  { name: "ogImage", label: "OG Image URL", type: "text", group: "Social" },
  { name: "noindex", label: "Hide from search engines (noindex)", type: "boolean", group: "SEO" },
  { name: "customHeadCode", label: "Custom Head Code (HTML/JSON-LD)", type: "code", group: "Advanced", full: true },
];

export default function AdminCategoriesPage() {
  return (
    <ResourceManager
      resource="categories"
      title="Categories"
      description="Product categories live at /resin/<slug>/ — each gets a dedicated SEO-friendly page."
      searchPlaceholder="Search categories…"
      defaults={{ published: true, featured: false, noindex: false, order: 0 }}
      columns={[
        { name: "name", label: "Category", render: (row) => (
          <div>
            <p className="font-medium text-forest">{String(row.name)}</p>
            <p className="text-xs text-muted-foreground">/resin/{String(row.slug)}</p>
          </div>
        )},
        { name: "order", label: "Order" },
        { name: "featured", label: "Featured", render: (row) => <BoolBadge value={row.featured} trueLabel="Featured" falseLabel="—" /> },
        { name: "published", label: "Status", render: (row) => <BoolBadge value={row.published} trueLabel="Published" falseLabel="Draft" /> },
      ]}
      fields={[
        { name: "name", label: "Category Name", type: "text", group: "Basics" },
        { name: "slug", label: "URL Slug", type: "text", group: "Basics", hint: "Auto-generated from name if empty." },
        { name: "description", label: "Short Description", type: "textarea", group: "Basics", full: true, rows: 2 },
        { name: "longContent", label: "Detailed Content", type: "markdown", group: "Basics", full: true, rows: 6, hint: "Plain text paragraphs. Shown below the product grid." },
        { name: "image", label: "Category Image (desktop)", type: "image", group: "Basics", full: true, hint: "Used on category cards + page banner. Recommended: 1200×750 or similar landscape." },
        { name: "mobileImage", label: "Category Image (mobile size)", type: "image", group: "Basics", full: true, hint: "Optional. Shown instead of the desktop image on phones. Recommended: 800×1200 portrait." },
        { name: "videoUrl", label: "Video URL (YouTube / Vimeo / mp4)", type: "text", group: "Basics", full: true, hint: "Optional. Paste a YouTube link e.g. https://youtu.be/… — shown on the category page." },
        { name: "order", label: "Sort Order", type: "number", group: "Basics", hint: "Lower numbers appear first." },
        { name: "featured", label: "Featured Category", type: "boolean", group: "Status" },
        { name: "published", label: "Published", type: "boolean", group: "Status" },
        ...SEO_FIELDS,
      ]}
    />
  );
}
