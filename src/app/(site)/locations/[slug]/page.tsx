import { db } from "@/lib/db";
import { getSettingsCached, waLink } from "@/lib/settings";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { JsonLd } from "@/components/site/json-ld";
import { FaqSection } from "@/components/site/faq";
import { CategoryCard } from "@/components/site/cards";
import { buildMetadata, breadcrumbSchema, faqSchema, parseJsonArray } from "@/lib/seo";
import { MessageCircle, MapPin } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";

export const revalidate = 120;

async function getLocation(slug: string) {
  return db.locationPage.findUnique({ where: { slug } });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const loc = await getLocation(slug);
  if (!loc) return {};
  const name = [loc.city, loc.state].filter(Boolean).join(", ");
  return buildMetadata({
    path: `/locations/${loc.slug}`,
    title: loc.seoTitle || undefined,
    description: loc.seoDescription || loc.description || undefined,
    keywords: loc.keywords,
    noindex: loc.noindex,
    fallbackTitle: `Epoxy Resin Supplier in ${name} | Aurexa Resin`,
  });
}

export default async function LocationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const loc = await getLocation(slug);
  if (!loc || !loc.published) notFound();

  const s = await getSettingsCached();
  const faqs = await db.faq.findMany({ where: { active: true, entityType: "GLOBAL" }, orderBy: { order: "asc" }, take: 6 });
  const categories = await db.category.findMany({ where: { published: true }, orderBy: { order: "asc" }, take: 8 });

  const name = [loc.city, loc.state].filter(Boolean).join(", ");
  const crumbs = [{ name: `Epoxy Resin in ${name}`, url: `/locations/${loc.slug}` }];
  const waMsg = `Hello ${s.brandName}, I am looking for an epoxy resin supplier in ${loc.city || name}. Please share details.`;

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema(crumbs),
          faqSchema(faqs.map((f) => ({ question: f.question, answer: f.answer }))),
        ]}
      />
      <section className="hero-dark text-cream">
        <div className="max-w-7xl mx-auto px-4 py-12 lg:py-16">
          <p className="inline-flex items-center gap-2 text-xs tracking-[0.22em] uppercase text-gold mb-3">
            <MapPin className="h-4 w-4" aria-hidden /> {[loc.country, loc.state].filter(Boolean).join(" · ")}
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-bold max-w-3xl leading-snug">
            Epoxy Resin Supplier{loc.city ? ` in ${loc.city}` : ""}{loc.state ? `, ${loc.state}` : ""}
          </h1>
          {loc.description && (
            <p className="mt-3 text-cream/70 max-w-3xl leading-relaxed text-[15px]">{loc.description}</p>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild className="btn-gold">
              <a href={waLink(s.whatsappNumber, waMsg)} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4" /> WhatsApp for {loc.city || name} Supply
              </a>
            </Button>
            <Button asChild className="btn-outline-light bg-transparent">
              <Link href="/inquiry">Send Inquiry</Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4">
        <Breadcrumbs items={crumbs} />

        {loc.content && (
          <section className="max-w-4xl pb-12">
            <div className="prose-aurexa text-muted-foreground text-[15px]">
              <ReactMarkdown remarkPlugins={[remarkGfm]}
                components={{
                  a: ({ href, children }) => {
                    if (!href) return <a>{children}</a>;
                    return href.startsWith("http") || href.startsWith("mailto")
                      ? <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
                      : <Link href={href}>{children}</Link>;
                  },
                }}
              >
                {loc.content}
              </ReactMarkdown>
            </div>
          </section>
        )}

        <section className="pb-14">
          <h2 className="font-display text-xl md:text-2xl font-bold text-forest mb-6">Products Available in {loc.city || name}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((c) => (
              <CategoryCard key={c.id} name={c.name} slug={c.slug} description={c.description} />
            ))}
          </div>
        </section>

        {faqs.length > 0 && (
          <section className="max-w-4xl pb-16">
            <h2 className="font-display text-xl md:text-2xl font-bold text-forest mb-4">Supply & Delivery FAQs</h2>
            <FaqSection faqs={faqs.map((f) => ({ id: f.id, question: f.question, answer: f.answer }))} className="rounded-xl border bg-card px-6 py-2" />
          </section>
        )}
      </div>
    </>
  );
}
