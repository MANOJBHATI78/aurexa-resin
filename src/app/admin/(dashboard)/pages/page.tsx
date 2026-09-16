"use client";

import { ResourceManager, BoolBadge } from "@/components/admin/resource-manager";

export default function AdminPagesPage() {
  return (
    <ResourceManager
      resource="pages"
      title="Pages"
      description="Legal and info pages — Privacy Policy, Terms, Disclaimer, Shipping Policy and more. Shown at /p/<slug>."
      searchPlaceholder="Search pages…"
      defaults={{ published: true, showInFooter: true, sortOrder: 0, noindex: false }}
      columns={[
        { name: "title", label: "Page", render: (row) => (
          <div>
            <p className="font-medium text-forest">{String(row.title)}</p>
            <p className="text-xs text-muted-foreground">/p/{String(row.slug)}</p>
          </div>
        )},
        { name: "sortOrder", label: "Order" },
        { name: "showInFooter", label: "Footer", render: (row) => <BoolBadge value={row.showInFooter} trueLabel="In footer" falseLabel="Hidden" /> },
        { name: "published", label: "Status", render: (row) => <BoolBadge value={row.published} trueLabel="Published" falseLabel="Draft" /> },
      ]}
      fields={[
        { name: "title", label: "Page Title", type: "text", group: "Page" },
        { name: "slug", label: "URL Slug", type: "text", group: "Page", hint: "e.g. privacy-policy → /p/privacy-policy" },
        { name: "content", label: "Content (Markdown)", type: "markdown", group: "Page", full: true, rows: 14 },
        { name: "sortOrder", label: "Sort Order", type: "number", group: "Page" },
        { name: "showInFooter", label: "Show in footer legal links", type: "boolean", group: "Status" },
        { name: "published", label: "Published", type: "boolean", group: "Status" },
        { name: "seoTitle", label: "SEO Title", type: "text", group: "SEO", full: true },
        { name: "seoDescription", label: "Meta Description", type: "textarea", group: "SEO", rows: 2 },
        { name: "noindex", label: "Hide from search engines (noindex)", type: "boolean", group: "SEO" },
      ]}
    />
  );
}
