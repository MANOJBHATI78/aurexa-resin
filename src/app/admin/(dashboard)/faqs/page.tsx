"use client";

import { ResourceManager, BoolBadge } from "@/components/admin/resource-manager";

const ENTITY_TYPES = [
  { value: "GLOBAL", label: "Global (used on homepage + FAQ blocks)" },
  { value: "HOME", label: "Homepage" },
  { value: "ABOUT", label: "About Page" },
  { value: "CONTACT", label: "Contact Page" },
  { value: "CATEGORY", label: "Category (select below)" },
];

export default function AdminFaqsPage() {
  return (
    <ResourceManager
      resource="faqs"
      title="FAQs"
      description="Reusable Q&A pairs. Write natural questions (AEO-friendly). FAQ schema is generated automatically where FAQs are shown."
      searchPlaceholder="Search questions…"
      defaults={{ active: true, order: 0, entityType: "GLOBAL" }}
      columns={[
        { name: "question", label: "Question", render: (row) => (
          <div className="max-w-[380px]">
            <p className="font-medium text-forest truncate">{String(row.question)}</p>
            <p className="text-xs text-muted-foreground">{String(row.entityType)}{row.entityId ? ` · ${String(row.entityId).slice(0, 8)}…` : ""}</p>
          </div>
        )},
        { name: "order", label: "Order" },
        { name: "active", label: "Status", render: (row) => <BoolBadge value={row.active} trueLabel="Active" falseLabel="Hidden" /> },
      ]}
      fields={[
        { name: "question", label: "Question", type: "text", group: "FAQ", full: true, hint: "Write the way customers ask — e.g. \"Which epoxy resin is suitable for jewellery?\"" },
        { name: "answer", label: "Answer", type: "textarea", group: "FAQ", full: true, rows: 4, hint: "Give a direct, complete answer. 2–4 sentences works well for answer engines." },
        { name: "entityType", label: "Show On", type: "select", group: "Placement", options: ENTITY_TYPES },
        { name: "categoryId", label: "Category (if placement = Category)", type: "select", group: "Placement", optionsResource: "categories", placeholder: "Select category" },
        { name: "order", label: "Sort Order", type: "number", group: "Placement" },
        { name: "active", label: "Active", type: "boolean", group: "Placement" },
      ]}
    />
  );
}
