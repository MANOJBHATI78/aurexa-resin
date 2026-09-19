import Link from "next/link";
import Image from "next/image";
import {
  Gem, Layers, Palette, Factory, Package, Truck, ArrowRight, MessageCircle,
  CheckCircle2, Star, Sparkles, GraduationCap, Scale, Handshake, BookOpen, Percent,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard, CategoryCard } from "@/components/site/cards";
import { FaqSection, type FaqItem } from "@/components/site/faq";
import { waLink, type SiteSettings } from "@/lib/settings";
import { parseJsonArray } from "@/lib/seo";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  gem: Gem, layers: Layers, palette: Palette, factory: Factory,
  package: Package, truck: Truck, sparkles: Sparkles,
};

export interface SectionDef {
  id: string;
  type: string;
  title?: string | null;
  data: any;
}

function Heading({ text, sub, light }: { text?: string; sub?: string; light?: boolean }) {
  if (!text && !sub) return null;
  return (
    <div className="max-w-3xl mx-auto text-center mb-10 lg:mb-14">
      {text && (
        <h2 className={`font-display text-2xl md:text-4xl font-bold ${light ? "text-cream" : "text-forest"}`}>
          {text}
        </h2>
      )}
      <div className="divider-gold mx-auto mt-4" aria-hidden />
      {sub && (
        <p className={`mt-4 text-[15px] leading-relaxed ${light ? "text-cream/70" : "text-muted-foreground"}`}>
          {sub}
        </p>
      )}
    </div>
  );
}

// ---------- Section components ----------

function HeroSection({ data, s }: { data: any; s: SiteSettings }) {
  const wa = waLink(s.whatsappNumber, s.whatsappDefaultMessage);
  const bannerOn = s.heroBannerEnabled === "true";
  const desktopBanner = bannerOn && s.heroBannerImage ? s.heroBannerImage : "";
  const mobileBanner = bannerOn && s.heroBannerMobileImage ? s.heroBannerMobileImage : "";
  const bannerAlt = s.heroBannerAlt || "Aurexa Resin — epoxy resin wholesaler in Surat, Gujarat";
  return (
    <section className="hero-dark text-cream relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 lg:py-28 relative">
        <div className="grid lg:grid-cols-5 gap-10 items-center">
          <div className="lg:col-span-3">
            <p className="inline-flex items-center gap-2 text-xs md:text-sm tracking-[0.25em] uppercase text-cream/90 border border-white/25 rounded-full px-4 py-1.5 mb-6">
              <Sparkles className="h-3.5 w-3.5 text-gold" aria-hidden /> Epoxy Resin Wholesaler · Surat, Gujarat
            </p>
            <h1 className="font-display text-3xl md:text-5xl lg:text-[3.4rem] font-bold leading-[1.15]">
              {data.headline || "Premium Epoxy Resin Solutions"}
            </h1>
            <p className="mt-6 text-cream/75 text-[15px] md:text-lg leading-relaxed max-w-2xl">
              {data.subheading}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {data.primaryCta && (
                <Button asChild size="lg" className="btn-gold">
                  <Link href={data.primaryCta.url}>{data.primaryCta.label}<ArrowRight className="h-4 w-4 ml-1" /></Link>
                </Button>
              )}
              {data.secondaryCta && (
                <Button asChild size="lg" className="btn-outline-light bg-transparent">
                  <Link href={data.secondaryCta.url}>{data.secondaryCta.label}</Link>
                </Button>
              )}
              {data.whatsappCta && (
                <Button asChild size="lg" className="bg-[#25D366] hover:bg-[#1fb857] text-white">
                  <a href={wa} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-4 w-4" /> {data.whatsappCta.label}
                  </a>
                </Button>
              )}
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-cream/65">
              {["Wholesale & Bulk Supply", "Pan-India Dispatch", "Single-Piece Orders Welcome"].map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-gold/80" aria-hidden /> {t}
                </span>
              ))}
            </div>
          </div>
          {/* Desktop visual — hidden on mobile when the mobile banner is active (avoids duplicate branding) */}
          <div className={`lg:col-span-2 justify-center lg:justify-end ${mobileBanner ? "hidden lg:flex" : "flex"}`}>
            <div className="relative w-full max-w-[380px] lg:max-w-[460px]">
              {desktopBanner ? (
                <Image
                  src={desktopBanner}
                  alt={bannerAlt}
                  width={900}
                  height={600}
                  priority
                  className="relative rounded-3xl border border-white/10 shadow-2xl w-full h-auto object-cover"
                />
              ) : (
                <>
                  <div className="absolute inset-0 rounded-full bg-gold/10 blur-3xl scale-90" aria-hidden />
                  <Image
                    src="/uploads/aurexa-logo.png"
                    alt="Aurexa Resin — Epoxy Resin Wholesaler in Surat, Gujarat. Original brand logo featuring a golden resin drop."
                    width={420}
                    height={420}
                    priority
                    className="relative rounded-2xl border border-white/10 shadow-2xl w-full max-w-[380px] h-auto"
                  />
                </>
              )}
            </div>
          </div>
        </div>
        {/* Mobile-size banner — always visible on small screens */}
        {mobileBanner && (
          <div className="lg:hidden mt-10">
            <Image
              src={mobileBanner}
              alt={bannerAlt}
              width={1080}
              height={1350}
              priority
              className="w-full max-w-sm mx-auto rounded-3xl border border-white/10 shadow-2xl h-auto"
            />
          </div>
        )}
        {data.seoText && <p className="sr-only">{data.seoText}</p>}
      </div>
    </section>
  );
}

function CategoriesSection({ data, s }: { data: any; s: SiteSettings }) {
  return <CategoryGrid data={data} s={s} />;
}

// Shared: category grid used on home & landing pages
export async function CategoryGrid({ data, s, limit = 8 }: { data: any; s: SiteSettings; limit?: number }) {
  const { db } = await import("@/lib/db");
  const categories = await db.category.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
    take: limit,
    include: { _count: { select: { products: { where: { published: true } } } } },
  });
  if (!categories.length) return null;
  return (
    <section className="py-16 lg:py-20" id="categories">
      <div className="max-w-7xl mx-auto px-4">
        <Heading text={data?.heading} sub={data?.subheading} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => (
            <CategoryCard key={c.id} name={c.name} slug={c.slug} description={c.description} count={c._count.products} />
          ))}
        </div>
        <div className="text-center mt-8">
          <Button asChild variant="outline" className="border-forest/30 text-forest hover:bg-forest hover:text-cream">
            <Link href="/resin">View All Categories <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function WhyUsSection({ data }: { data: any }) {
  const items: { icon?: string; title: string; text: string }[] = data?.items || [];
  if (!items.length) return null;
  return (
    <section className="py-16 lg:py-20 section-cream" id="why-us">
      <div className="max-w-7xl mx-auto px-4">
        <Heading text={data?.heading} sub={data?.subheading} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => {
            const Icon = ICONS[item.icon || ""] || Gem;
            return (
              <div key={i} className="card-lift rounded-xl border bg-card p-6">
                <span className="h-12 w-12 rounded-xl bg-forest flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-forest-dark" aria-hidden />
                </span>
                <h3 className="font-display font-semibold text-forest text-lg">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mt-2">{item.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FeaturedProductsSection({ data, s }: { data: any; s: SiteSettings }) {
  return <ProductGridSection data={data} s={s} featuredOnly url="/products" linkLabel="View All Products" />;
}

// Shared: product grid used on home & landing pages
export async function ProductGridSection({
  data, s, featuredOnly = false, limit = 8, url = "/products", linkLabel,
}: { data: any; s: SiteSettings; featuredOnly?: boolean; limit?: number; url?: string; linkLabel?: string }) {
  const { db } = await import("@/lib/db");
  const products = await db.product.findMany({
    where: { published: true, ...(featuredOnly ? { featured: true } : {}) },
    orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
    take: limit,
  });
  if (!products.length) return null;
  return (
    <section className="py-16 lg:py-20" id="products">
      <div className="max-w-7xl mx-auto px-4">
        <Heading text={data?.heading} sub={data?.subheading} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} s={s} product={{
              id: p.id, name: p.name, slug: p.slug, shortDesc: p.shortDesc,
              image: p.image, mixingRatio: p.mixingRatio, resinType: p.resinType, finish: p.finish,
              showPrice: p.showPrice, price: p.price, onSale: p.onSale, salePrice: p.salePrice,
            }} />
          ))}
        </div>
        {linkLabel && (
          <div className="text-center mt-8">
            <Button asChild variant="outline" className="border-forest/30 text-forest hover:bg-forest hover:text-cream">
              <Link href={url}>{linkLabel} <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

function SaleSection({ data, s }: { data: any; s: SiteSettings }) {
  return (
    <section className="py-16 lg:py-20" id="sale">
      <div className="max-w-7xl mx-auto px-4">
        <div className="relative overflow-hidden rounded-2xl bg-forest text-cream shadow-xl">
          <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-red-600/25 blur-3xl" aria-hidden />
          <div className="absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-gold/10 blur-3xl" aria-hidden />
          <div className="relative grid lg:grid-cols-2 gap-8 items-center p-8 md:p-12">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-white">
                <Percent className="h-3.5 w-3.5" aria-hidden /> {data?.badge || "Sale"}
              </span>
              <h2 className="font-display text-2xl md:text-4xl font-bold mt-5">{data?.heading || "Resin Sale Offers"}</h2>
              <div className="divider-gold mt-4" aria-hidden />
              {data?.subheading && (
                <p className="mt-4 text-cream/70 leading-relaxed max-w-xl">{data.subheading}</p>
              )}
            </div>
            <div className="flex flex-col items-start lg:items-end gap-3">
              {data?.cta && (
                <Button asChild size="lg" className="bg-red-600 hover:bg-red-700 text-white border-transparent font-bold">
                  <Link href={data.cta.url || "/sale"}>
                    {data.cta.label || "View Sale Products"} <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              )}
              {data?.whatsappCta && (
                <Button asChild size="lg" className="bg-[#25D366] hover:bg-[#1fb857] text-white">
                  <a href={waLink(s.whatsappNumber, s.whatsappDefaultMessage)} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-4 w-4" /> {data.whatsappCta.label || "WhatsApp Us"}
                  </a>
                </Button>
              )}
              <p className="text-xs text-cream/50">Limited stock · Bulk buyers get extra wholesale discount</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ApplicationsSection({ data }: { data: any }) {
  return <ApplicationGrid data={data} limit={12} />;
}

// Shared: applications grid
export async function ApplicationGrid({ data, limit = 12 }: { data?: any; limit?: number }) {
  const { db } = await import("@/lib/db");
  const apps = await db.application.findMany({
    where: { published: true }, orderBy: { order: "asc" }, take: limit,
  });
  if (!apps.length) return null;
  return (
    <section className="py-16 lg:py-20 section-cream" id="applications">
      <div className="max-w-7xl mx-auto px-4">
        {data && <Heading text={data?.heading} sub={data?.subheading} />}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {apps.map((a) => (
            <Link
              key={a.id}
              href={`/applications/${a.slug}`}
              className="card-lift rounded-xl border bg-card p-5 flex flex-col items-center text-center gap-3"
            >
              <span className="h-12 w-12 rounded-full border-2 border-white/25 hero-dark flex items-center justify-center">
                <Palette className="h-5 w-5 text-cream" aria-hidden />
              </span>
              <h3 className="font-display font-semibold text-forest text-sm leading-snug">{a.name}</h3>
              {a.description && (
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{a.description}</p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function GuideSection({ data }: { data: any }) {
  const steps: { title: string; text: string }[] = data?.steps || [];
  if (!steps.length) return null;
  return (
    <section className="py-16 lg:py-20" id="guide">
      <div className="max-w-7xl mx-auto px-4">
        <Heading text={data?.heading} sub={data?.subheading} />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div key={i} className="relative rounded-xl border bg-card p-6 card-lift">
              <span className="absolute -top-3.5 left-6 h-7 w-7 rounded-full bg-forest text-cream text-sm font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <h3 className="font-display font-semibold text-forest mt-3">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mt-2">{step.text}</p>
            </div>
          ))}
        </div>
        {data?.cta && (
          <div className="text-center mt-8">
            <Button asChild variant="outline" className="border-forest/30 text-forest hover:bg-forest hover:text-cream">
              <Link href={data.cta.url}>{data.cta.label} <BookOpen className="h-4 w-4" /></Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

function ComparisonSection({ data }: { data: any }) {
  const columns: string[] = data?.columns || [];
  const rows: string[][] = data?.rows || [];
  if (!columns.length || !rows.length) return null;
  return (
    <section className="py-16 lg:py-20 section-cream" id="comparison">
      <div className="max-w-7xl mx-auto px-4">
        <Heading text={data?.heading} sub={data?.subheading} />
        <div className="rounded-xl border overflow-x-auto bg-card shadow-sm">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="bg-forest text-cream">
                {columns.map((c) => (
                  <th key={c} className="px-4 py-3.5 text-left font-display font-semibold text-[13px] tracking-wide">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className={i % 2 ? "bg-cream/60" : "bg-card"}>
                  {row.map((cell, j) => (
                    <td key={j} className={`px-4 py-3.5 border-t border-border/70 ${j === 0 ? "font-semibold text-forest" : "text-muted-foreground"}`}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function B2BSection({ data, s }: { data: any; s: SiteSettings }) {
  const items: { title: string; text: string }[] = data?.items || [];
  return (
    <section className="py-16 lg:py-20 hero-dark text-cream" id="b2b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-2 text-xs tracking-[0.25em] uppercase text-forest-light mb-4">
              <Handshake className="h-4 w-4" aria-hidden /> Wholesale · Bulk · B2B
            </span>
            <h2 className="font-display text-2xl md:text-4xl font-bold text-cream">{data?.heading}</h2>
            <div className="divider-gold mt-4" aria-hidden />
            <p className="mt-4 text-cream/70 leading-relaxed">{data?.text}</p>
            {data?.cta && (
              <Button asChild size="lg" className="btn-gold mt-6">
                <Link href={data.cta.url}>{data.cta.label} <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            )}
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {items.map((item, i) => (
              <div key={i} className="rounded-xl border border-forest/15 bg-white/[0.04] p-5">
                <CheckCircle2 className="h-5 w-5 text-cream mb-2.5" aria-hidden />
                <h3 className="font-display font-semibold text-cream text-[15px]">{item.title}</h3>
                <p className="text-[13px] text-cream/60 leading-relaxed mt-1.5">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoSection({ data }: { data: any }) {
  const links: { title: string; url: string }[] = data?.links || [];
  if (!links.length) return null;
  return (
    <section className="py-16 lg:py-20" id="learn">
      <div className="max-w-7xl mx-auto px-4">
        <Heading text={data?.heading} sub={data?.subheading} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {links.map((l, i) => (
            <Link
              key={i}
              href={l.url}
              className="card-lift group rounded-xl border bg-card p-5 flex items-start gap-3.5"
            >
              <span className="h-10 w-10 rounded-lg bg-forest-mist flex items-center justify-center shrink-0">
                <GraduationCap className="h-5 w-5 text-forest" aria-hidden />
              </span>
              <div>
                <h3 className="font-semibold text-forest text-[15px] leading-snug group-hover:text-forest-light transition-colors">
                  {l.title}
                </h3>
                <span className="inline-flex items-center gap-1 text-xs text-forest-light font-medium mt-1.5">
                  Read guide <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection({ data }: { data: any }) {
  return <TestimonialsBlock data={data} />;
}

export async function TestimonialsBlock({ data }: { data?: any }) {
  const { db } = await import("@/lib/db");
  const testimonials = await db.testimonial.findMany({
    where: { visible: true }, orderBy: { order: "asc" }, take: 9,
  });
  if (!testimonials.length) return null;
  return (
    <section className="py-16 lg:py-20 section-cream" id="testimonials">
      <div className="max-w-7xl mx-auto px-4">
        {data && <Heading text={data?.heading} sub={data?.subheading} />}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <figure key={t.id} className="card-lift rounded-xl border bg-card p-6">
              <div className="flex gap-0.5 mb-3" aria-label={`Rated ${t.rating} out of 5`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < t.rating ? "fill-gold text-gold" : "text-border"}`}
                    aria-hidden
                  />
                ))}
              </div>
              <blockquote className="text-sm text-muted-foreground leading-relaxed">
                “{t.review}”
              </blockquote>
              <figcaption className="mt-4 flex items-center gap-3">
                <span className="h-9 w-9 rounded-full hero-dark flex items-center justify-center font-display text-cream text-sm font-bold">
                  {t.name.charAt(0)}
                </span>
                <span>
                  <span className="block text-sm font-semibold text-forest">{t.name}</span>
                  {t.location && <span className="block text-xs text-muted-foreground">{t.location}{t.product ? ` · ${t.product}` : ""}</span>}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqHomepageSection({ data, globalFaqs }: { data: any; globalFaqs: FaqItem[] }) {
  if (!globalFaqs.length) return null;
  return (
    <section className="py-16 lg:py-20" id="faq">
      <div className="max-w-4xl mx-auto px-4">
        <Heading text={data?.heading} sub={data?.subheading} />
        <FaqSection faqs={globalFaqs} className="rounded-xl border bg-card px-6 py-2" />
      </div>
    </section>
  );
}

function CtaSection({ data, s }: { data: any; s: SiteSettings }) {
  return (
    <section className="py-16 lg:py-20 hero-dark text-cream">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <Scale className="h-10 w-10 text-cream/85 mx-auto mb-5" aria-hidden />
        <h2 className="font-display text-2xl md:text-4xl font-bold">{data?.heading}</h2>
        {data?.text && <p className="mt-4 text-cream/70 leading-relaxed max-w-2xl mx-auto">{data.text}</p>}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {data?.primaryCta && (
            <Button asChild size="lg" className="btn-gold">
              <Link href={data.primaryCta.url}>{data.primaryCta.label}</Link>
            </Button>
          )}
          {data?.secondaryCta && (
            <Button asChild size="lg" className="bg-[#25D366] hover:bg-[#1fb857] text-white">
              <a href={waLink(s.whatsappNumber, s.whatsappDefaultMessage)} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4" /> {data.secondaryCta.label}
              </a>
            </Button>
          )}
          {data?.tertiaryCta && (
            <Button asChild size="lg" className="btn-outline-light bg-transparent">
              <Link href={data.tertiaryCta.url}>{data.tertiaryCta.label}</Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}

// ---------- Renderer ----------

export function HomeSectionRenderer({
  section, s, globalFaqs,
}: { section: SectionDef; s: SiteSettings; globalFaqs: FaqItem[] }) {
  switch (section.type) {
    case "hero": return <HeroSection data={section.data} s={s} />;
    case "categories": return <CategoriesSection data={section.data} s={s} />;
    case "why_us": return <WhyUsSection data={section.data} />;
    case "featured_products": return <FeaturedProductsSection data={section.data} s={s} />;
    case "products": return <ProductGridSection data={section.data} s={s} />;
    case "sale": return <SaleSection data={section.data} s={s} />;
    case "applications": return <ApplicationsSection data={section.data} />;
    case "guide": return <GuideSection data={section.data} />;
    case "comparison": return <ComparisonSection data={section.data} />;
    case "b2b": return <B2BSection data={section.data} s={s} />;
    case "info": return <InfoSection data={section.data} />;
    case "testimonials": return <TestimonialsSection data={section.data} />;
    case "faq": return <FaqHomepageSection data={section.data} globalFaqs={globalFaqs} />;
    case "cta": return <CtaSection data={section.data} s={s} />;
    case "text":
      return (
        <section className="py-14">
          <div className="max-w-4xl mx-auto px-4">
            {section.data?.heading && <h2 className="font-display text-2xl md:text-3xl font-bold text-forest mb-4">{section.data.heading}</h2>}
            <div className="prose-aurexa text-muted-foreground whitespace-pre-line">{section.data?.body}</div>
          </div>
        </section>
      );
    default:
      return null;
  }
}
