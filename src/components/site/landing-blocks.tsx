import { db } from "@/lib/db";
import { getSettingsCached, waLink } from "@/lib/settings";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/site/json-ld";
import { FaqSection } from "@/components/site/faq";
import { ProductCard } from "@/components/site/cards";
import { CategoryGrid, TestimonialsBlock } from "@/components/site/sections";
import { faqSchema } from "@/lib/seo";
import { MessageCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export interface Block {
  type: string;
  data: Record<string, unknown>;
}

const VALUE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  gem: (p) => <span {...p}>💎</span>,
  layers: (p) => <span {...p}>🧪</span>,
  truck: (p) => <span {...p}>🚚</span>,
  handshake: (p) => <span {...p}>🤝</span>,
};

/** Shared landing/about block renderer — used by /[slug] landing pages and /about */
export async function LandingBlock({
  block, s, faqHeading,
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

    case "image_text": {
      const cta = resolveCta(d.cta as { label?: string; url?: string });
      return (
        <section className="py-14 lg:py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className={`grid lg:grid-cols-2 gap-10 items-center ${d.reverse ? "lg:[&>*:first-child]:order-2" : ""}`}>
              <div className="rounded-2xl overflow-hidden border shadow-lg aspect-[4/3] bg-forest-mist">
                {d.image ? (
                  <img
                    src={d.image as string}
                    alt={(d.imageAlt as string) || (d.heading as string) || "Aurexa Resin"}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : null}
              </div>
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-forest">{(d.heading as string) || ""}</h2>
                <div className="divider-gold mt-4 mb-5" aria-hidden />
                <div className="prose-aurexa text-muted-foreground text-[15px]">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{(d.body as string) || ""}</ReactMarkdown>
                </div>
                {cta?.href && (
                  <Button asChild className="mt-6 btn-gold">
                    <Link href={cta.href}>{cta.label} <ArrowRight className="h-4 w-4" /></Link>
                  </Button>
                )}
                {cta?.wa && (
                  <Button asChild className="mt-6 bg-[#25D366] hover:bg-[#1fb857] text-white">
                    <a href={waLink(s.whatsappNumber, s.whatsappDefaultMessage)} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="h-4 w-4" /> {cta.label}
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>
      );
    }

    case "stats": {
      const items = (d.items as { value: string; label: string }[]) || [];
      if (!items.length) return null;
      return (
        <section className="py-10 lg:py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="rounded-2xl hero-dark text-cream shadow-xl grid grid-cols-2 lg:grid-cols-4 divide-x divide-white/10 overflow-hidden">
              {items.map((item, i) => (
                <div key={i} className="px-4 py-8 text-center">
                  <p className="font-display text-3xl md:text-4xl font-bold text-gold">{item.value}</p>
                  <p className="mt-2 text-[13px] text-cream/70 leading-snug">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    case "values": {
      const items = (d.items as { icon?: string; title: string; text: string }[]) || [];
      if (!items.length) return null;
      return (
        <section className="py-14 lg:py-16 section-cream">
          <div className="max-w-7xl mx-auto px-4">
            {(d.heading as string) && (
              <div className="max-w-3xl mx-auto text-center mb-10">
                <h2 className="font-display text-2xl md:text-3xl font-bold text-forest">{d.heading as string}</h2>
                <div className="divider-gold mx-auto mt-4" aria-hidden />
                {(d.subheading as string) && (
                  <p className="mt-4 text-[15px] text-muted-foreground">{d.subheading as string}</p>
                )}
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {items.map((item, i) => {
                const Icon = VALUE_ICONS[item.icon || ""] || VALUE_ICONS.gem;
                return (
                  <div key={i} className="card-lift rounded-xl border bg-card p-6 text-center">
                    <span className="h-12 w-12 mx-auto rounded-full bg-forest-mist border border-forest/15 flex items-center justify-center mb-4 text-xl" aria-hidden>
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="font-display font-semibold text-forest">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mt-2">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      );
    }

    case "gallery": {
      const images = (d.images as { url: string; alt?: string }[]) || [];
      if (!images.length) return null;
      return (
        <section className="py-14 lg:py-16">
          <div className="max-w-7xl mx-auto px-4">
            {(d.heading as string) && (
              <div className="max-w-3xl mx-auto text-center mb-10">
                <h2 className="font-display text-2xl md:text-3xl font-bold text-forest">{d.heading as string}</h2>
                <div className="divider-gold mx-auto mt-4" aria-hidden />
                {(d.subheading as string) && (
                  <p className="mt-4 text-[15px] text-muted-foreground">{d.subheading as string}</p>
                )}
              </div>
            )}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {images.map((img, i) => (
                <div key={i} className={`rounded-xl overflow-hidden border bg-forest-mist ${i === 0 ? "col-span-2 row-span-2 aspect-square" : "aspect-square"}`}>
                  <img src={img.url} alt={img.alt || "Resin work by Aurexa Resin customers"} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }

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
            <h2 className="font-display text-2xl md:text-3xl font-bold text-forest mb-8">{(d.heading as string) || faqHeading}</h2>
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

export async function ProductGridForLanding({ data, s }: { data: Record<string, unknown>; s: Awaited<ReturnType<typeof getSettingsCached>> }) {
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
              showPrice: p.showPrice, price: p.price, onSale: p.onSale, salePrice: p.salePrice,
            }} />
          ))}
        </div>
      </div>
    </section>
  );
}
