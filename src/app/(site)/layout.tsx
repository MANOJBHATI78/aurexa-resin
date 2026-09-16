import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { FloatingActions } from "@/components/site/floating-actions";
import { getSettingsCached } from "@/lib/settings";
import { db } from "@/lib/db";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettingsCached();
  const [nav, categories] = await Promise.all([
    db.navigationItem.findMany({
      where: { location: "HEADER", enabled: true, parentId: null },
      orderBy: { order: "asc" },
    }),
    db.category.findMany({
      where: { published: true },
      orderBy: { order: "asc" },
      select: { name: true, slug: true },
    }),
  ]);

  return (
    <div className="site-wrapper">
      <SiteHeader
        s={s}
        nav={nav.map((n) => ({ id: n.id, label: n.label, url: n.url }))}
        categories={categories}
      />
      <main className="site-main">{children}</main>
      <SiteFooter />
      <FloatingActions s={s} />
    </div>
  );
}
