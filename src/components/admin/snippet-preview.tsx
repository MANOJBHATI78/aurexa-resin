"use client";

import { Clock } from "lucide-react";

/**
 * Google search-result snippet preview — live-updates as the admin types
 * meta title / description / slug in any resource edit dialog.
 */
export function SnippetPreview({ title, description, url }: { title: string; description: string; url: string }) {
  const clamp = (text: string, max: number) => (text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text);
  const displayTitle = clamp(title || "Untitled page", 60);
  const displayDesc = clamp(description || "Add a meta description so Google can show a summary of this page here.", 165);

  return (
    <div className="rounded-lg border bg-white p-3.5 shadow-sm" data-snippet-preview>
      <p className="text-[11px] font-medium text-muted-foreground mb-2 uppercase tracking-wider flex items-center gap-1">
        <Clock className="h-3 w-3" /> Google Preview
      </p>
      <div className="font-sans">
        <p className="text-[13px] text-[#4d5156] leading-4 truncate">{url}</p>
        <p className="text-[19px] leading-[1.3] text-[#1a0dab] mt-0.5 hover:underline cursor-pointer">{displayTitle}</p>
        <p className="text-[13px] leading-[1.45] text-[#4d5156] mt-1">{displayDesc}</p>
      </div>
    </div>
  );
}
