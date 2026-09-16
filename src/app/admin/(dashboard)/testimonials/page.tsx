"use client";

import { ResourceManager, BoolBadge } from "@/components/admin/resource-manager";

export default function AdminTestimonialsPage() {
  return (
    <ResourceManager
      resource="testimonials"
      title="Testimonials"
      description="Customer reviews. ⚠️ Only enable visibility for REAL customer reviews — never publish fake or sample testimonials."
      searchPlaceholder="Search testimonials…"
      defaults={{ visible: false, rating: 5, order: 0 }}
      columns={[
        { name: "name", label: "Customer", render: (row) => (
          <div>
            <p className="font-medium text-forest">{String(row.name)}</p>
            <p className="text-xs text-muted-foreground truncate max-w-[260px]">{String(row.location || "")}{row.product ? ` · ${String(row.product)}` : ""}</p>
          </div>
        )},
        { name: "rating", label: "Rating", render: (row) => <span>{"★".repeat(Number(row.rating || 5))}</span> },
        { name: "visible", label: "Visibility", render: (row) => <BoolBadge value={row.visible} trueLabel="Visible" falseLabel="Hidden" /> },
      ]}
      fields={[
        { name: "name", label: "Customer Name", type: "text", group: "Review" },
        { name: "location", label: "Location", type: "text", group: "Review", placeholder: "e.g. Surat" },
        { name: "product", label: "Product (optional)", type: "text", group: "Review" },
        { name: "rating", label: "Rating (1–5)", type: "number", group: "Review" },
        { name: "review", label: "Review Text", type: "textarea", group: "Review", full: true, rows: 4 },
        { name: "visible", label: "Visible on website", type: "boolean", group: "Status", hint: "Keep OFF until you have permission from a real customer." },
        { name: "order", label: "Sort Order", type: "number", group: "Status" },
      ]}
    />
  );
}
