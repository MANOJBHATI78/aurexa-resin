"use client";

import { ResourceManager, BoolBadge } from "@/components/admin/resource-manager";

export default function AdminRedirectsPage() {
  return (
    <ResourceManager
      resource="redirects"
      title="301 Redirects"
      description="Redirect old URLs to new ones without touching code. Applied when a landing-page slug is not found."
      searchPlaceholder="Search redirects…"
      defaults={{ statusCode: 301, active: true }}
      columns={[
        { name: "fromPath", label: "From", render: (row) => <code className="text-xs">{String(row.fromPath)}</code> },
        { name: "toPath", label: "To", render: (row) => <code className="text-xs">{String(row.toPath)}</code> },
        { name: "statusCode", label: "Code", render: (row) => <span className="font-mono text-xs">{String(row.statusCode)}</span> },
        { name: "active", label: "Status", render: (row) => <BoolBadge value={row.active} trueLabel="Active" falseLabel="Off" /> },
      ]}
      fields={[
        { name: "fromPath", label: "Old URL (path)", type: "text", group: "Redirect", full: true, hint: "e.g. /old-page or old-page — leading slash added automatically." },
        { name: "toPath", label: "New URL", type: "text", group: "Redirect", full: true, hint: "e.g. /new-page or https://external.com" },
        { name: "statusCode", label: "Status Code", type: "select", group: "Redirect", options: [
          { value: "301", label: "301 — Permanent (recommended for SEO)" },
          { value: "302", label: "302 — Temporary" },
          { value: "307", label: "307 — Temporary (strict)" },
          { value: "308", label: "308 — Permanent (strict)" },
        ]},
        { name: "active", label: "Active", type: "boolean", group: "Redirect" },
      ]}
    />
  );
}
