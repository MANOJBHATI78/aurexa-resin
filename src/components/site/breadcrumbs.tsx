import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export function Breadcrumbs({ items }: { items: { name: string; url: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-[13px] text-muted-foreground py-3">
      <ol className="flex flex-wrap items-center gap-1">
        <li className="flex items-center gap-1">
          <Link href="/" className="inline-flex items-center gap-1 hover:text-forest-light">
            <Home className="h-3.5 w-3.5" aria-hidden /> Home
          </Link>
        </li>
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1">
            <ChevronRight className="h-3.5 w-3.5 text-border" aria-hidden />
            {i === items.length - 1 ? (
              <span className="text-forest font-medium" aria-current="page">{item.name}</span>
            ) : (
              <Link href={item.url} className="hover:text-forest-light">{item.name}</Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
