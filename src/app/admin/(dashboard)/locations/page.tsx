"use client";

import { ResourceManager, BoolBadge } from "@/components/admin/resource-manager";

export default function AdminLocationsPage() {
  return (
    <ResourceManager
      resource="locations"
      title="Location Pages"
      description="GEO targeting — create genuinely unique location pages at /locations/<slug>. Avoid duplicate content: write real, useful local content."
      searchPlaceholder="Search locations…"
      defaults={{ published: true, noindex: false }}
      columns={[
        { name: "city", label: "Location", render: (row) => (
          <div>
            <p className="font-medium text-forest">{[row.city, row.state, row.country].filter(Boolean).join(", ")}</p>
            <p className="text-xs text-muted-foreground">/locations/{String(row.slug)}</p>
          </div>
        )},
        { name: "country", label: "Country" },
        { name: "published", label: "Status", render: (row) => <BoolBadge value={row.published} trueLabel="Published" falseLabel="Draft" /> },
      ]}
      fields={[
        { name: "country", label: "Country", type: "text", group: "Location", placeholder: "India" },
        { name: "state", label: "State / Region", type: "text", group: "Location", placeholder: "Gujarat" },
        { name: "city", label: "City", type: "text", group: "Location", placeholder: "Surat" },
        { name: "slug", label: "URL Slug", type: "text", group: "Location", hint: "Auto: surat-gujarat" },
        { name: "description", label: "Short Description", type: "textarea", group: "Content", full: true, rows: 2 },
        { name: "content", label: "Local Content (Markdown)", type: "markdown", group: "Content", full: true, rows: 10, hint: "Write genuinely useful local content — what you supply here, local delivery notes, local applications." },
        { name: "keywords", label: "Local Keywords", type: "text", group: "SEO", full: true, hint: "e.g. epoxy resin surat, resin supplier gujarat" },
        { name: "seoTitle", label: "SEO Title", type: "text", group: "SEO", full: true },
        { name: "seoDescription", label: "Meta Description", type: "textarea", group: "SEO", rows: 2 },
        { name: "published", label: "Published", type: "boolean", group: "Status" },
        { name: "noindex", label: "Hide from search engines (noindex)", type: "boolean", group: "Status" },
      ]}
    />
  );
}
