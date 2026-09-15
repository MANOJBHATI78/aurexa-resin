"use client";

import { ResourceManager, BoolBadge } from "@/components/admin/resource-manager";

export default function AdminLandingPagesPage() {
  return (
    <ResourceManager
      resource="landing"
      title="Landing Pages"
      description="SEO landing pages served at /<slug> — e.g. /epoxy-resin-wholesaler-surat. Build pages from reusable blocks (hero, text, products, benefits, FAQ, CTA)."
      searchPlaceholder="Search landing pages…"
      defaults={{ published: true, noindex: false }}
      columns={[
        { name: "title", label: "Landing Page", render: (row) => (
          <div>
            <p className="font-medium text-forest truncate max-w-[280px]">{String(row.title)}</p>
            <p className="text-xs text-muted-foreground">/{String(row.slug)}</p>
          </div>
        )},
        { name: "h1", label: "H1", render: (row) => <span className="truncate block max-w-[200px]">{String(row.h1 || "—")}</span> },
        { name: "published", label: "Status", render: (row) => <BoolBadge value={row.published} trueLabel="Published" falseLabel="Draft" /> },
      ]}
      fields={[
        { name: "title", label: "Internal Title", type: "text", group: "Basics", full: true },
        { name: "slug", label: "URL Slug", type: "text", group: "Basics", hint: "Page lives at /<slug> — keep it keyword-focused, e.g. epoxy-resin-wholesaler-surat" },
        { name: "h1", label: "Visible H1", type: "text", group: "Basics", full: true },
        { name: "published", label: "Published", type: "boolean", group: "Basics" },

        { name: "blocks", label: "Page Blocks (JSON)", type: "code", group: "Blocks", full: true, rows: 18, hint:
          "Array of blocks. Types: hero {title, subtitle, primaryCta:{label,url}, secondaryCta} · text {heading, body:markdown} · products {heading, limit} · categories {heading} · benefits {heading, items:[{title,text}]} · faq {heading, ids:[exact global FAQ questions]} · testimonials {heading} · cta {heading, text, primaryCta, secondaryCta}. Use \"WA:DEFAULT\" as CTA url for WhatsApp link, \"TEL:DEFAULT\" for call link." },

        { name: "seoTitle", label: "SEO Title", type: "text", group: "SEO", full: true },
        { name: "seoDescription", label: "Meta Description", type: "textarea", group: "SEO", rows: 2 },
        { name: "seoKeywords", label: "Keywords", type: "text", group: "SEO", full: true },
        { name: "canonical", label: "Canonical URL", type: "text", group: "SEO" },
        { name: "ogTitle", label: "OG Title", type: "text", group: "Social" },
        { name: "ogDescription", label: "OG Description", type: "text", group: "Social" },
        { name: "ogImage", label: "OG Image URL", type: "text", group: "Social" },
        { name: "noindex", label: "Hide from search engines (noindex)", type: "boolean", group: "SEO" },
        { name: "customHeadCode", label: "Custom Head Code", type: "code", group: "Advanced", full: true },
      ]}
    />
  );
}
