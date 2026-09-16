import { db } from "@/lib/db";
import { getSettingsCached, waLink } from "@/lib/settings";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/site/json-ld";
import { FaqSection } from "@/components/site/faq";
import { ProductCard } from "@/components/site/cards";
import { CategoryGrid, TestimonialsBlock } from "@/components/site/sections";
import { buildMetadata, breadcrumbSchema, faqSchema } from "@/lib/seo";
import { MessageCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const revalidate = 60;

interface Block {
  type: string;
  data: Record<string, unknown>;
}

async function getLanding(slug: string) {
  return db.landingPage.findUnique({ where: { slug } });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = await getLanding(slug);
  if (!page) return {};
  return buildMetadata({
    path: `/${page.slug}`,
    title: page.seoTitle || page.title,
    description: page.seoDescription || undefined,
    keywords: page.seoKeywords,
    canonical: page.canonical,
    ogTitle: page.ogTitle || undefined,
    ogDescription: page.ogDescription || undefined,
    ogImage: page.ogImage || undefined,
    noindex: page.noindex,
    fallbackTitle: page.title,
  });
}

export default async function LandingPageView({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Check redirect manager first (301/302/307/308)
  const redirectRule = await db.redirect.findFirst({ where: { fromPath: `/${slug}`, active: true } });
  if (redirectRule) redirect(redirectRule.statusCode, redirectRule.toPath);

  const page = await getLanding(slug);
  if (!page || !page.published) notFound();

  const s = await getSettingsCached();
  const blocks: Block[] = safeBlocks(page.blocks);
  const crumbs = [{ name: page.title, url: `/${page.slug}` }];

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      {blocks.map((block, i) => (
        <LandingBlock key={i} block={block} s={s} faqHeading={page.title} />
      ))}
    </>
  );
}

function safeBlocks(raw: string | null): Block[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function LandingBlock({
  block, s,
}: { block: Block; s: Awaited<ReturnType<typeof getSettingsCached>>; faqHeading: string }) {
  const d = block.data || {};

  const resolveCta = (cta: { label?: string; url?: string } | undefined) => {
    if (!cta?.url) return null;
    let url = cta.url;
    if (url === "WA:DEFAULT") return { label: cta.label || "WhatsApp Us", wa: true };
    if (url === "TEL:DEFAULT") return { label: cta.label || "Call Now", tel: true };
    return { label: cta.label || "Learn More", href: url };
  };

  switch (block.type) {
    case "hero": {
      const primary = resolveCta(d.primaryCta as { label?: string; url?: string });
      const secondary = resolveCta(d.secondaryCta as { label?: string; url?: string });
      return (
        <section className="hero-dark text-cream">
          <div className="max-w-7xl mx-auto px-4 py-16 lg:py-24">
            <h1 className="font-display text-3xl md:text-5xl font-bold max-w-4xl leading-tight">{d.title as string}</h1>
            {(d.subtitle as string) && (
              <p className="mt-5 text-cream/75 max-w-3xl leading-relaxed text-[15px] md:text-lg">{d.subtitle as string}</p>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              {primary?.href && (
                <Button asChild size="lg" className="btn-gold">
                  <Link href={primary.href}>{primary.label}<ArrowRight className="h-4 w-4" /></Link>
                </Button>
              )}
              {primary?.wa && (
                <Button asChild size="lg" className="bg-[#25D366] hover:bg-[#1fb857] text-white">
                  <a href={waLink(s.whatsappNumber, s.whatsappDefaultMessage)} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-4 w-4" /> {primary.label}
                  </a>
                </Button>
              )}
              {primary?.tel && (
                <Button asChild size="lg" className="btn-outline-light bg-transparent">
                  <a href={`tel:${s.phone.replace(/\s/g, "")}`}>{primary.label}</a>
                </Button>
              )}
              {secondary?.href && (
                <Button asChild size="lg" className="btn-outline-light bg-transparent">
                  <Link href={secondary.href}>{secondary.label}</Link>
                </Button>
              )}
              {secondary?.wa && (
                <Button asChild size="lg" className="bg-[#25D366] hover:bg-[#1fb857] text-white">
                  <a href={waLink(s.whatsappNumber, s.whatsappDefaultMessage)} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-4 w-4" /> {secondary.label}
                  </a>
                </Button>
              )}
            </div>
          </div>
        </section>
      );
    }

    case "text":
      return (
        <section className="py-14 lg:py-16">
          <div className="max-w-4xl mx-auto px-4">
            {(d.heading as string) && (
              <h2 className="font-display text-2xl md:text-3xl font-bold text-forest mb-5">{d.heading as string}</h2>
            )}
            <div className="prose-aurexa text-muted-foreground text-[15.5px]">
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
                {(d.body as string) || ""}
              </ReactMarkdown>
            </div>
          </div>
        </section>
      );

    case "products":
      return <ProductGridForLanding data={d} s={s} />;

    case "benefits": {
      const items = (d.items as { title: string; text: string }[]) || [];
      return (
        <section className="py-14 lg:py-16 section-cream">
          <div className="max-w-7xl mx-auto px-4">
            {(d.heading as string) && (
              <h2 className="font-display text-2xl md:text-3xl font-bold text-forest text-center mb-10">{d.heading as string}</h2>
            )}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {items.map((item, i) => (
                <div key={i} className="card-lift rounded-xl border bg-card p-6">
                  <CheckCircle2 className="h-6 w-6 text-forest-light mb-3" aria-hidden />
                  <h3 className="font-display font-semibold text-forest">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-2">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    case "faq": {
      const ids = (d.ids as string[]) || [];
      const globalFaqs = await db.faq.findMany({ where: { active: true, entityType: "GLOBAL" }, orderBy: { order: "asc" } });
      const selected = ids.length
        ? ids.map((q) => globalFaqs.find((f) => f.question === q)).filter((f): f is (typeof globalFaqs)[0] => Boolean(f))
            .map((f) => ({ question: f.question, answer: f.answer }))
        : globalFaqs.slice(0, 6).map((f) => ({ question: f.question, answer: f.answer }));
      if (!selected.length) return null;
      return (
        <section className="py-14 lg:py-16">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-forest mb-8">{(d.heading as string) || "Frequently Asked Questions"}</h2>
            <JsonLd data={faqSchema(selected)} />
            <FaqSection faqs={selected} className="rounded-xl border bg-card px-6 py-2" />
          </div>
        </section>
      );
    }

    case "categories":
      return <CategoryGrid data={d} s={s} limit={8} />;

    case "testimonials":
      return <TestimonialsBlock data={d} />;

    case "cta": {
      const primary = resolveCta(d.primaryCta as { label?: string; url?: string });
      const secondary = resolveCta(d.secondaryCta as { label?: string; url?: string });
      return (
        <section className="py-16 hero-dark text-cream">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="font-display text-2xl md:text-4xl font-bold">{d.heading as string}</h2>
            {(d.text as string) && <p className="mt-4 text-cream/70 leading-relaxed max-w-2xl mx-auto">{d.text as string}</p>}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {primary?.href && (
                <Button asChild size="lg" className="btn-gold"><Link href={primary.href}>{primary.label}</Link></Button>
              )}
              {primary?.wa && (
                <Button asChild size="lg" className="bg-[#25D366] hover:bg-[#1fb857] text-white">
                  <a href={waLink(s.whatsappNumber, s.whatsappDefaultMessage)} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-4 w-4" /> {primary.label}
                  </a>
                </Button>
              )}
              {secondary?.href && (
                <Button asChild size="lg" className="btn-outline-light bg-transparent"><Link href={secondary.href}>{secondary.label}</Link></Button>
              )}
              {secondary?.wa && (
                <Button asChild size="lg" className="bg-[#25D366] hover:bg-[#1fb857] text-white">
                  <a href={waLink(s.whatsappNumber, s.whatsappDefaultMessage)} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-4 w-4" /> {secondary.label}
                  </a>
                </Button>
              )}
            </div>
          </div>
        </section>
      );
    }

    default:
      return null;
  }
}

async function ProductGridForLanding({ data, s }: { data: Record<string, unknown>; s: Awaited<ReturnType<typeof getSettingsCached>> }) {
  const limit = typeof data.limit === "number" ? data.limit : 8;
  const products = await db.product.findMany({
    where: { published: true },
    orderBy: [{ featured: "desc" }, { name: "asc" }],
    take: limit,
  });
  if (!products.length) return null;
  return (
    <section className="py-14 lg:py-16">
      <div className="max-w-7xl mx-auto px-4">
        {(data.heading as string) && (
          <h2 className="font-display text-2xl md:text-3xl font-bold text-forest text-center mb-10">{data.heading as string}</h2>
        )}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} s={s} product={{
              id: p.id, name: p.name, slug: p.slug, shortDesc: p.shortDesc,
              image: p.image, mixingRatio: p.mixingRatio, resinType: p.resinType, finish: p.finish,
            }} />
          ))}
        </div>
      </div>
    </section>
  );
}
