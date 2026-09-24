"use client";

import { ResourceManager, BoolBadge } from "@/components/admin/resource-manager";

export default function AdminBlogPage() {
  return (
    <ResourceManager
      resource="blog"
      title="Blog Posts"
      description="Write educational articles and buying guides. Markdown supported — headings, lists, tables, links and more."
      searchPlaceholder="Search posts…"
      defaults={{ published: false, noindex: false, author: "Aurexa Resin" }}
      columns={[
        { name: "title", label: "Post", render: (row) => (
          <div>
            <p className="font-medium text-forest truncate max-w-[300px]">{String(row.title)}</p>
            <p className="text-xs text-muted-foreground">/blog/{String(row.slug)}</p>
          </div>
        )},
        { name: "author", label: "Author" },
        { name: "publishedAt", label: "Date", render: (row) => row.publishedAt ? new Date(String(row.publishedAt)).toLocaleDateString("en-IN") : "—" },
        { name: "published", label: "Status", render: (row) => <BoolBadge value={row.published} trueLabel="Published" falseLabel="Draft" /> },
      ]}
      fields={[
        { name: "title", label: "Post Title", type: "text", group: "Post", full: true },
        { name: "slug", label: "URL Slug", type: "text", group: "Post", hint: "Auto-generated from title if empty." },
        { name: "author", label: "Author", type: "text", group: "Post" },
        { name: "featuredImage", label: "Featured Image", type: "image", group: "Post", full: true },
        { name: "excerpt", label: "Excerpt", type: "textarea", group: "Post", full: true, rows: 2 },
        { name: "content", label: "Content (Markdown)", type: "markdown", group: "Post", full: true, rows: 18, hint: "Supports ## headings, **bold**, lists, [links](/products), tables and quotes." },
        { name: "tags", label: "Tags", type: "list", group: "Post", full: true, hint: "e.g. buying guide, tutorial" },
        { name: "published", label: "Published", type: "boolean", group: "Status", hint: "Publishing sets the publish date automatically." },
        { name: "publishedAt", label: "Publish Date", type: "date", group: "Status" },
        { name: "seoTitle", label: "SEO Title", type: "text", group: "SEO", full: true },
        { name: "seoDescription", label: "Meta Description", type: "textarea", group: "SEO", rows: 2 },
        { name: "seoKeywords", label: "Keywords", type: "text", group: "SEO", full: true },
        { name: "canonical", label: "Canonical URL", type: "text", group: "SEO" },
        { name: "ogTitle", label: "OG Title", type: "text", group: "Social" },
        { name: "ogDescription", label: "OG Description", type: "text", group: "Social" },
        { name: "ogImage", label: "OG Image", type: "text", group: "Social" },
        { name: "noindex", label: "Hide from search engines (noindex)", type: "boolean", group: "SEO" },
        { name: "customHeadCode", label: "Custom Head Code", type: "code", group: "Advanced", full: true },
      ]}
    />
  );
}
