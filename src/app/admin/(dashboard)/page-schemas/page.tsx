"use client";

import { ResourceManager, BoolBadge } from "@/components/admin/resource-manager";

export default function AdminPageSchemasPage() {
  return (
    <ResourceManager
      resource="pageschemas"
      title="Page Schema (JSON-LD)"
      description="Attach structured-data schema to ANY page — rich results, stars, FAQs, breadcrumbs, products. Path supports wildcards, e.g. /products/* covers every product page. Code accepts a raw <script type=application/ld+json> tag OR bare JSON — both work."
      searchPlaceholder="Search path or label…"
      defaults={{ kind: "SCHEMA", enabled: true }}
      columns={[
        { name: "path", label: "Page Path", render: (row) => (
          <div>
            <p className="font-medium text-forest font-mono text-[13px]">{String(row.path)}</p>
            {row.label ? <p className="text-xs text-muted-foreground">{String(row.label)}</p> : null}
          </div>
        )},
        { name: "kind", label: "Type" },
        { name: "enabled", label: "Status", render: (row) => <BoolBadge value={row.enabled} trueLabel="Live" falseLabel="Off" /> },
      ]}
      fields={[
        { name: "path", label: "Page Path", type: "text", group: "Target", full: true, hint: 'Exact: "/" or "/resin" — Wildcard: "/products/*", "/blog/*". Changes are live within ~1 minute.', placeholder: "/ or /resin or /products/*" },
        { name: "label", label: "Internal Label", type: "text", group: "Target", full: true, hint: "Only for your reference, e.g. \"Product offer schema\"" },
        { name: "kind", label: "Code Type", type: "select", group: "Target", options: [
          { value: "SCHEMA", label: "Schema — JSON-LD (paste <script> tag or bare JSON)" },
          { value: "RAW_HEAD", label: "Raw Head HTML — any meta/script tag" },
        ]},
        { name: "code", label: "Code", type: "code", group: "Code", full: true, rows: 12, hint: 'Example: <script type="application/ld+json">{"@context":"https://schema.org","@type":"Product",…}</script>' },
        { name: "enabled", label: "Enabled", type: "boolean", group: "Status" },
      ]}
    />
  );
}
