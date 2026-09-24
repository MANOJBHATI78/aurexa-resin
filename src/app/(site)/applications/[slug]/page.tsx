import { db } from "@/lib/db";
import { getSettingsCached, waLink } from "@/lib/settings";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { JsonLd } from "@/components/site/json-ld";
import { ProductCard } from "@/components/site/cards";
import { buildMetadata, breadcrumbSchema, itemListSchema } from "@/lib/seo";
import { MessageCircle, ArrowRight } from "lucide-react";

export const revalidate = 60;

async function getApp(slug: string) {
  return db.application.findUnique({ where: { slug } });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const app = await getApp(slug);
  if (!app) return {};
  return buildMetadata({
    path: `/applications/${app.slug}`,
    title: app.seoTitle || `${app.name} — Epoxy Resin Supply by Aurexa Resin`,
    description: app.seoDescription || app.description || undefined,
    noindex: app.noindex,
    fallbackTitle: app.name,
  });
}

export default async function ApplicationDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const app = await getApp(slug);
  if (!app || !app.published) notFound();

  const s = await getSettingsCached();
  const relatedCategories = await db.category.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
    take: 4,
  });

  const crumbs = [
    { name: "Applications", url: "/applications" },
    { name: app.name, url: `/applications/${app.slug}` },
  ];

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema(crumbs),
          itemListSchema(relatedCategories.map((c) => ({ name: c.name, url: `/resin/${c.slug}` })), "Recommended Categories"),
        ]}
      />
      <section className="hero-dark text-cream">
        <div className="max-w-7xl mx-auto px-4 py-12 lg:py-16">
          <h1 className="font-display text-3xl md:text-4xl font-bold">Epoxy Resin for {app.name}</h1>
          {app.description && (
            <p className="mt-3 text-cream/70 max-w-3xl leading-relaxed text-[15px]">{app.description}</p>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild className="btn-gold">
              <a href={waLink(s.whatsappNumber, `Hello ${s.brandName}, I need epoxy resin for ${app.name}. Please guide me on the right product.`)} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4" /> Discuss Your {app.name} Project
              </a>
            </Button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4">
        <Breadcrumbs items={crumbs} />

        {app.longContent && (
          <section className="max-w-4xl pb-10">
            <div className="prose-aurexa text-muted-foreground text-[15px] whitespace-pre-line">{app.longContent}</div>
          </section>
        )}

        <section className="pb-14">
          <h2 className="font-display text-xl md:text-2xl font-bold text-forest mb-2">Recommended Resin Categories for {app.name}</h2>
          <p className="text-sm text-muted-foreground mb-6">These systems are most commonly used for this application.</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {relatedCategories.map((c) => (
              <Link key={c.id} href={`/resin/${c.slug}`} className="card-lift group rounded-xl border bg-card p-5">
                <h3 className="font-display font-semibold text-forest group-hover:text-forest-light transition-colors text-[15px]">{c.name}</h3>
                {c.description && <p className="text-[13px] text-muted-foreground mt-2 line-clamp-3 leading-relaxed">{c.description}</p>}
                <span className="inline-flex items-center gap-1 text-xs text-forest-light font-medium mt-3">
                  Browse <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <ProductShowcase s={s} />
      </div>
    </>
  );
}

async function ProductShowcase({ s }: { s: Awaited<ReturnType<typeof getSettingsCached>> }) {
  const featured = await db.product.findMany({
    where: { published: true, featured: true },
    take: 4,
  });
  if (!featured.length) return null;
  return (
    <section className="pb-16">
      <h2 className="font-display text-xl md:text-2xl font-bold text-forest mb-6">Popular Products</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {featured.map((p) => (
          <ProductCard key={p.id} s={s} product={{
            id: p.id, name: p.name, slug: p.slug, shortDesc: p.shortDesc,
            image: p.image, mixingRatio: p.mixingRatio, resinType: p.resinType, finish: p.finish,
          }} />
        ))}
      </div>
    </section>
  );
}
