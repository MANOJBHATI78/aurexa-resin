import { db } from "@/lib/db";
import { getSettingsCached } from "@/lib/settings";
import { ProductCard } from "@/components/site/cards";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { JsonLd } from "@/components/site/json-ld";
import { buildMetadata, breadcrumbSchema, itemListSchema } from "@/lib/seo";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    path: "/products",
    fallbackTitle: "Epoxy Resin Products — Clear, Art, Casting, Table Top & Industrial Grades",
    fallbackDescription:
      "Browse the full range of epoxy resin products supplied by Aurexa Resin, Surat — clear, crystal clear, art, casting, table top, deep pour, jewellery, craft and industrial epoxy resin with pan-India supply.",
    keywords: "epoxy resin products, buy epoxy resin, clear epoxy resin, art resin, casting resin, table top epoxy, resin wholesaler surat",
  });
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q, category } = await searchParams;
  const s = await getSettingsCached();
  const [categories, allProducts] = await Promise.all([
    db.category.findMany({ where: { published: true }, orderBy: { order: "asc" } }),
    db.product.findMany({
      where: { published: true },
      orderBy: [{ featured: "desc" }, { name: "asc" }],
      include: { category: { select: { name: true, slug: true } } },
    }),
  ]);

  let products = allProducts;
  if (category) products = products.filter((p) => p.category?.slug === category);
  if (q) {
    const needle = q.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(needle) ||
        (p.shortDesc || "").toLowerCase().includes(needle) ||
        (p.resinType || "").toLowerCase().includes(needle)
    );
  }

  const activeCat = category ? categories.find((c) => c.slug === category) : null;

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([{ name: "Products", url: "/products" }]),
          itemListSchema(
            products.slice(0, 25).map((p) => ({ name: p.name, url: `/products/${p.slug}` })),
            "Epoxy Resin Products"
          ),
        ]}
      />
      <section className="hero-dark text-cream">
        <div className="max-w-7xl mx-auto px-4 py-12 lg:py-16">
          <h1 className="font-display text-3xl md:text-4xl font-bold">
            {activeCat ? `${activeCat.name} Products` : "Epoxy Resin Products"}
          </h1>
          <p className="mt-3 text-cream/70 max-w-3xl leading-relaxed text-[15px]">
            {activeCat
              ? activeCat.description
              : "A complete range of epoxy resin systems for art, craft, jewellery, woodworking, table tops and industrial applications. Wholesale and single-piece orders welcome."}
          </p>
          <form action="/products" className="mt-6 flex gap-2 max-w-xl" role="search">
            {category && <input type="hidden" name="category" value={category} />}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cream/40" aria-hidden />
              <Input
                name="q"
                defaultValue={q}
                placeholder="Search resin products…"
                className="pl-9 bg-white/10 border-cream/25 text-cream placeholder:text-cream/40"
                aria-label="Search products"
              />
            </div>
            <Button type="submit" className="btn-gold">Search</Button>
          </form>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4">
        <Breadcrumbs items={activeCat ? [{ name: "Products", url: "/products" }, { name: activeCat.name, url: `/products?category=${activeCat.slug}` }] : [{ name: "Products", url: "/products" }]} />

        <div className="flex flex-wrap gap-2 pb-6">
          <Link
            href="/products"
            className={`text-[13px] rounded-full px-3.5 py-1.5 border transition-colors ${!category ? "bg-forest text-cream border-forest" : "bg-card text-muted-foreground hover:border-gold/50 hover:text-forest"}`}
          >
            All Products
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/products?category=${c.slug}`}
              className={`text-[13px] rounded-full px-3.5 py-1.5 border transition-colors ${category === c.slug ? "bg-forest text-cream border-forest" : "bg-card text-muted-foreground hover:border-gold/50 hover:text-forest"}`}
            >
              {c.name}
            </Link>
          ))}
        </div>

        {products.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 pb-16">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                s={s}
                product={{
                  id: p.id, name: p.name, slug: p.slug, shortDesc: p.shortDesc,
                  image: p.image, mixingRatio: p.mixingRatio, resinType: p.resinType, finish: p.finish,
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No products matched your search. Try a different keyword or category.</p>
            <Button asChild className="btn-gold mt-4"><Link href="/products">View All Products</Link></Button>
          </div>
        )}
      </div>
    </>
  );
}
