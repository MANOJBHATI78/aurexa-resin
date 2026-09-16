import { db } from "@/lib/db";
import { getSettingsCached, waLink } from "@/lib/settings";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { JsonLd } from "@/components/site/json-ld";
import { ProductCard } from "@/components/site/cards";
import { FaqSection } from "@/components/site/faq";
import { buildMetadata, breadcrumbSchema, faqSchema, itemListSchema, parseJsonArray } from "@/lib/seo";
import { MessageCircle } from "lucide-react";
import Link from "next/link";

export const revalidate = 60;

async function getCategory(slug: string) {
  return db.category.findUnique({ where: { slug } });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return {};
  return buildMetadata({
    path: `/resin/${category.slug}`,
    title: category.seoTitle || undefined,
    description: category.seoDescription || category.description || undefined,
    keywords: category.seoKeywords,
    canonical: category.canonical,
    ogTitle: category.ogTitle || undefined,
    ogDescription: category.ogDescription || undefined,
    ogImage: category.ogImage || undefined,
    noindex: category.noindex,
    fallbackTitle: category.name,
  });
}

export default async function CategoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category || !category.published) notFound();

  const s = await getSettingsCached();
  const [products, faqs] = await Promise.all([
    db.product.findMany({
      where: { published: true, categoryId: category.id },
      orderBy: [{ featured: "desc" }, { name: "asc" }],
    }),
    db.faq.findMany({ where: { active: true, entityType: "CATEGORY", categoryId: category.id }, orderBy: { order: "asc" } }),
  ]);

  const waMsg = s.whatsappCategoryTemplate.replace("{CATEGORY}", category.name);
  const crumbs = [
    { name: "Resin Categories", url: "/resin" },
    { name: category.name, url: `/resin/${category.slug}` },
  ];

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema(crumbs),
          faqSchema(faqs.map((f) => ({ question: f.question, answer: f.answer }))),
          itemListSchema(products.map((p) => ({ name: p.name, url: `/products/${p.slug}` })), category.name),
        ]}
      />
      <section className="hero-dark text-cream">
        <div className="max-w-7xl mx-auto px-4 py-12 lg:py-16">
          <h1 className="font-display text-3xl md:text-4xl font-bold">{category.name}</h1>
          {category.description && (
            <p className="mt-3 text-cream/70 max-w-3xl leading-relaxed text-[15px]">{category.description}</p>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild className="btn-gold">
              <a href={waLink(s.whatsappNumber, waMsg)} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4" /> WhatsApp About {category.name}
              </a>
            </Button>
            <Button asChild className="btn-outline-light bg-transparent">
              <Link href={`/products?category=${category.slug}`}>View as Product List</Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4">
        <Breadcrumbs items={crumbs} />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 pb-14">
          {products.map((p) => (
            <ProductCard key={p.id} s={s} product={{
              id: p.id, name: p.name, slug: p.slug, shortDesc: p.shortDesc,
              image: p.image, mixingRatio: p.mixingRatio, resinType: p.resinType, finish: p.finish,
            }} />
          ))}
          {!products.length && (
            <p className="text-muted-foreground col-span-full py-12 text-center">
              Products are being added to this category. Contact us on WhatsApp for current availability.
            </p>
          )}
        </div>

        {category.longContent && (
          <section className="max-w-4xl pb-14">
            <h2 className="font-display text-xl md:text-2xl font-bold text-forest mb-4">About {category.name}</h2>
            <div className="prose-aurexa text-muted-foreground text-[15px] whitespace-pre-line">{category.longContent}</div>
          </section>
        )}

        {faqs.length > 0 && (
          <section className="max-w-4xl pb-16">
            <h2 className="font-display text-xl md:text-2xl font-bold text-forest mb-4">Frequently Asked Questions</h2>
            <FaqSection faqs={faqs.map((f) => ({ id: f.id, question: f.question, answer: f.answer }))} className="rounded-xl border bg-card px-6 py-2" />
          </section>
        )}
      </div>
    </>
  );
}
