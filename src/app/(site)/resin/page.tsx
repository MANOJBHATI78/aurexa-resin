import { db } from "@/lib/db";
import { CategoryCard } from "@/components/site/cards";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { JsonLd } from "@/components/site/json-ld";
import { buildMetadata, breadcrumbSchema, itemListSchema } from "@/lib/seo";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    path: "/resin",
    fallbackTitle: "Epoxy Resin Categories — Browse Resin Types for Every Application",
    fallbackDescription:
      "Browse Aurexa Resin's epoxy resin categories — clear, crystal clear, art, casting, table top, deep pour, river table, jewellery, coating, craft, woodworking and industrial epoxy resin supplied from Surat, Gujarat.",
    keywords: "epoxy resin types, resin categories, clear epoxy, art resin, casting resin, deep pour resin, resin supplier surat",
  });
}

export default async function ResinCategoriesPage() {
  const categories = await db.category.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
    include: { _count: { select: { products: { where: { published: true } } } } },
  });

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([{ name: "Resin Categories", url: "/resin" }]),
          itemListSchema(
            categories.map((c) => ({ name: c.name, url: `/resin/${c.slug}` })),
            "Epoxy Resin Categories"
          ),
        ]}
      />
      <section className="hero-dark text-cream">
        <div className="max-w-7xl mx-auto px-4 py-12 lg:py-16">
          <h1 className="font-display text-3xl md:text-4xl font-bold">Resin Categories</h1>
          <p className="mt-3 text-cream/70 max-w-3xl leading-relaxed text-[15px]">
            Every project needs the right resin behaviour. Browse our category range — from crystal clear
            art and jewellery resins to deep pour river table systems and industrial grades.
          </p>
        </div>
      </section>
      <div className="max-w-7xl mx-auto px-4">
        <Breadcrumbs items={[{ name: "Resin Categories", url: "/resin" }]} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pb-16">
          {categories.map((c) => (
            <CategoryCard key={c.id} name={c.name} slug={c.slug} description={c.description} count={c._count.products} />
          ))}
        </div>
      </div>
    </>
  );
}
