import { db } from "@/lib/db";
import { getSettingsCached } from "@/lib/settings";
import { ProductCard } from "@/components/site/cards";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { JsonLd } from "@/components/site/json-ld";
import { buildMetadata, breadcrumbSchema, itemListSchema } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Percent, Tag, MessageCircle } from "lucide-react";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    path: "/sale",
    fallbackTitle: "Resin Sale — Discounted Epoxy Resin Offers",
    fallbackDescription:
      "Limited-time sale on selected epoxy resins from Aurexa Resin, Surat — art resin, casting resin, table top epoxy and more at discounted wholesale prices with pan-India dispatch.",
    keywords: "epoxy resin sale, resin discount offer, art resin offer, epoxy resin wholesale price surat",
  });
}

export default async function SalePage() {
  const s = await getSettingsCached();
  const products = await db.product.findMany({
    where: { published: true, onSale: true },
    orderBy: [{ updatedAt: "desc" }],
    include: { category: { select: { name: true, slug: true } } },
  });

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([{ name: "Sale", url: "/sale" }]),
          itemListSchema(
            products.slice(0, 25).map((p) => ({ name: p.name, url: `/products/${p.slug}` })),
            "Sale — Epoxy Resin Offers"
          ),
        ]}
      />

      {/* Hero band */}
      <section className="hero-dark text-cream relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-12 lg:py-16">
          <p className="inline-flex items-center gap-2 text-xs md:text-sm font-bold tracking-[0.22em] uppercase bg-red-600 text-white rounded-full px-4 py-1.5 mb-5">
            <Percent className="h-3.5 w-3.5" aria-hidden /> Sale — Limited Time
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-bold">Resin Sale — Discounted Products</h1>
          <p className="mt-3 text-cream/70 max-w-3xl leading-relaxed text-[15px]">
            Selected epoxy resins at special sale prices. Wholesale buyers and bulk orders get extra discounts —
            message us on WhatsApp with your quantity for the best rate. Sale available while stocks last.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild className="bg-[#25D366] hover:bg-[#1fb857] text-white">
              <a
                href={`https://wa.me/${s.whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(
                  "Hi Aurexa Resin, I want to know your wholesale sale price."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-4 w-4" /> Get Wholesale Sale Price
              </a>
            </Button>
            <Button asChild className="btn-outline-light bg-transparent">
              <Link href="/products">Browse All Products</Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4">
        <Breadcrumbs items={[{ name: "Sale", url: "/sale" }]} />

        {products.length ? (
          <>
            <div className="flex items-center gap-2 mb-6">
              <Tag className="h-5 w-5 text-red-600" aria-hidden />
              <h2 className="font-display text-xl md:text-2xl font-bold text-forest">
                {products.length} Product{products.length > 1 ? "s" : ""} on Sale
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 pb-16">
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  s={s}
                  product={{
                    id: p.id,
                    name: p.name,
                    slug: p.slug,
                    shortDesc: p.shortDesc,
                    image: p.image,
                    mixingRatio: p.mixingRatio,
                    resinType: p.resinType,
                    finish: p.finish,
                    showPrice: p.showPrice,
                    price: p.price,
                    onSale: p.onSale,
                    salePrice: p.salePrice,
                  }}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20 pb-24">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-forest-mist mb-4">
              <Percent className="h-7 w-7 text-forest" aria-hidden />
            </span>
            <h2 className="font-display text-xl font-bold text-forest">No sale is running right now</h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              We run sale offers on selected resins from time to time. Check back soon, or message us on
              WhatsApp — bulk buyers always get our best wholesale rate.
            </p>
            <Button asChild className="btn-gold mt-5">
              <Link href="/products">View All Products</Link>
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
