"use client";

import { ResourceManager, BoolBadge } from "@/components/admin/resource-manager";

export default function AdminApplicationsPage() {
  return (
    <ResourceManager
      resource="applications"
      title="Applications"
      description="Resin applications — art, jewellery, tables, woodworking, industry. Shown at /applications and on the homepage."
      searchPlaceholder="Search applications…"
      defaults={{ published: true, order: 0, noindex: false }}
      columns={[
        { name: "name", label: "Application", render: (row) => (
          <div>
            <p className="font-medium text-forest">{String(row.name)}</p>
            <p className="text-xs text-muted-foreground">/applications/{String(row.slug)}</p>
          </div>
        )},
        { name: "order", label: "Order" },
        { name: "published", label: "Status", render: (row) => <BoolBadge value={row.published} trueLabel="Published" falseLabel="Draft" /> },
      ]}
      fields={[
        { name: "name", label: "Application Name", type: "text", group: "Basics" },
        { name: "slug", label: "URL Slug", type: "text", group: "Basics" },
        { name: "description", label: "Short Description", type: "textarea", group: "Basics", full: true, rows: 2 },
        { name: "longContent", label: "Detailed Content", type: "markdown", group: "Basics", full: true, rows: 8 },
        { name: "image", label: "Image", type: "image", group: "Basics", full: true },
        { name: "order", label: "Sort Order", type: "number", group: "Basics" },
        { name: "published", label: "Published", type: "boolean", group: "Status" },
        { name: "seoTitle", label: "SEO Title", type: "text", group: "SEO", full: true },
        { name: "seoDescription", label: "Meta Description", type: "textarea", group: "SEO", rows: 2 },
        { name: "noindex", label: "Hide from search engines (noindex)", type: "boolean", group: "SEO" },
      ]}
    />
  );
}
