import { headers } from "next/headers";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { FloatingActions } from "@/components/site/floating-actions";
import { LeadGate } from "@/components/site/lead-gate";
import { PageSchemas } from "@/components/site/page-schemas";
import { getSettingsCached } from "@/lib/settings";
import { db } from "@/lib/db";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettingsCached();
  // Concrete page path from middleware — powers per-page schema injection
  const h = await headers();
  const pathname = h.get("x-pathname") || "/";
  const [nav, categories] = await Promise.all([
    db.navigationItem.findMany({
      where: { location: "HEADER", enabled: true, parentId: null },
      orderBy: { order: "asc" },
    }),
    db.category.findMany({
      where: { published: true },
      orderBy: { order: "asc" },
      select: { name: true, slug: true, image: true },
    }),
  ]);

  return (
    <div className="site-wrapper">
      {/* Admin-managed per-page schema / head code — raw in server HTML (view-source) */}
      <PageSchemas path={pathname} />
      <SiteHeader
        s={s}
        nav={nav.map((n) => ({ id: n.id, label: n.label, url: n.url }))}
        categories={categories}
      />
      <main className="site-main">{children}</main>
      <SiteFooter />
      <FloatingActions s={s} />
      <LeadGate
        enabled={s.leadGateEnabled === "true"}
        heading={s.leadGateHeading}
        text={s.leadGateText}
        oncePerVisitor={s.leadGateOncePerVisitor === "true"}
      />
    </div>
  );
}
