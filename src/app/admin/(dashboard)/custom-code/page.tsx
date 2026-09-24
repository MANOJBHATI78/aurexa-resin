"use client";

import { ResourceManager, BoolBadge } from "@/components/admin/resource-manager";

export default function AdminCustomCodePage() {
  return (
    <ResourceManager
      resource="customcode"
      title="Custom Code"
      description="Inject custom HTML/CSS/JS without editing source files. ⚠️ Only authorized admins should use this. Disabled by default."
      searchPlaceholder="Search code snippets…"
      defaults={{ placement: "HEAD", scope: "GLOBAL", enabled: false }}
      columns={[
        { name: "name", label: "Name", render: (row) => (
          <div>
            <p className="font-medium text-forest">{String(row.name)}</p>
            <p className="text-xs text-muted-foreground">{String(row.placement)} · {String(row.scope)}</p>
          </div>
        )},
        { name: "placement", label: "Placement" },
        { name: "enabled", label: "Status", render: (row) => <BoolBadge value={row.enabled} trueLabel="Enabled" falseLabel="Disabled" /> },
      ]}
      fields={[
        { name: "name", label: "Snippet Name", type: "text", group: "Snippet", full: true, hint: "Internal label, e.g. \"Clarity extra script\"" },
        { name: "placement", label: "Placement", type: "select", group: "Snippet", options: [
          { value: "HEAD", label: "Head — meta tags, verification, scripts" },
          { value: "BODY_START", label: "Body start — pixels, noscript" },
          { value: "BODY_END", label: "Body end — scripts" },
          { value: "CSS", label: "Custom CSS" },
          { value: "JS", label: "Custom JavaScript" },
        ]},
        { name: "scope", label: "Scope", type: "select", group: "Snippet", options: [
          { value: "GLOBAL", label: "Global (all pages)" },
          { value: "HOME", label: "Homepage only" },
        ]},
        { name: "content", label: "Code", type: "code", group: "Snippet", full: true, rows: 10 },
        { name: "enabled", label: "Enabled", type: "boolean", group: "Status" },
      ]}
    />
  );
}
