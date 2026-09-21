import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { CategoryCard } from "@/components/site/cards";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { JsonLd } from "@/components/site/json-ld";
import { buildMetadata, breadcrumbSchema, itemListSchema } from "@/lib/seo";
import { UspStripCompact, RatioShowcase } from "@/components/site/usp-strip";
import { waLink } from "@/lib/settings";
import type { Metadata } from "next";
import { Sparkles, ArrowRight, MessageCircle, Droplets, Leaf, Timer, CheckCircle2, Handshake } from "lucide-react";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    path: "/resin",
    fallbackTitle: "Epoxy Resin Categories — Ultra Crystal Clear Resin Manufacturer & Supplier",
    fallbackDescription:
      "Browse all epoxy resin categories from Aurexa Resin — ultra crystal clear resin, 2:1 resin (4 hrs dry), 3:1 resin (10 hrs dry), art, casting, table top, deep pour, river table and jewellery epoxy. Bubble free, atmosphere friendly. Wholesale manufacturer, supplier & exporter from Surat — B2B bulk supply across India.",
    keywords:
      "ultra crystal clear resin, crystal clear epoxy resin, 2:1 resin, 3:1 resin, epoxy resin wholesale, resin wholesaler, resin manufacturer, resin supplier, resin exporter, b2b bulk resin supplier, bubble free resin, art resin, deep pour resin, resin categories",
  });
}

export default async function ResinCategoriesPage() {
  const [categories, settings] = await Promise.all([
    db.category.findMany({
      where: { published: true },
      orderBy: { order: "asc" },
      include: { _count: { select: { products: { where: { published: true } } } } },
    }),
    (await import("@/lib/settings")).getSettingsCached(),
  ]);

  const flagship = categories.find((c) => c.slug === "crystal-clear-epoxy-resin");
  const rest = flagship ? categories.filter((c) => c.id !== flagship.id) : categories;
  const wa = waLink(settings.whatsappNumber, settings.whatsappDefaultMessage);

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

      {/* ── Hero — keyword-rich intro ── */}
      <section className="hero-dark text-cream relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-12 lg:py-16 relative">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 text-[11px] sm:text-xs tracking-[0.22em] uppercase text-cream/85 border border-white/25 rounded-full px-4 py-1.5">
              <Sparkles className="h-3.5 w-3.5 text-gold" aria-hidden />
              {categories.length} Resin Systems · B2B Bulk Supplier · Surat, Gujarat
            </p>
            <h1 className="font-display text-3xl md:text-4xl lg:text-[2.75rem] font-bold leading-[1.15] mt-5">
              Epoxy Resin Categories — <span className="text-gold">Ultra Crystal Clear Resin</span> & Specialty Systems
            </h1>
            <div className="divider-gold mt-5" aria-hidden />
            <p className="mt-5 text-cream/75 leading-relaxed text-[15px]">
              Every project needs the right resin behaviour — and the right partner. Aurexa Resin is an epoxy resin{" "}
              <strong className="text-cream">wholesaler, manufacturer, supplier &amp; exporter</strong> from Surat, Gujarat,
              serving artists, studios, workshops and industries with{" "}
              <strong className="text-cream">B2B bulk supply</strong> across India. From our signature{" "}
              <strong className="text-cream">Ultra Crystal Clear Resin</strong> to dedicated{" "}
              <strong className="text-cream">2:1 resin (4 hrs dry)</strong> and{" "}
              <strong className="text-cream">3:1 resin (10 hrs dry)</strong> systems — every grade is bubble free,
              atmosphere friendly and finished glass-clear.
            </p>
            <UspStripCompact className="mt-6" />
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg" className="btn-gold">
                <Link href="#all-categories">Browse All Categories <ArrowRight className="h-4 w-4 ml-1" /></Link>
              </Button>
              <Button asChild size="lg" className="bg-[#25D366] hover:bg-[#1fb857] text-white">
                <a href={wa} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4" /> WhatsApp for Bulk Price
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4">
        <Breadcrumbs items={[{ name: "Resin Categories", url: "/resin" }]} />

        {/* ── Flagship — Ultra Crystal Clear Resin ── */}
        {flagship && (
          <section aria-labelledby="flagship-heading" className="pb-4">
            <div className="relative overflow-hidden rounded-2xl bg-forest text-cream shadow-xl">
              <div className="absolute -top-16 -right-10 h-56 w-56 rounded-full bg-gold/15 blur-3xl" aria-hidden />
              <div className="relative grid md:grid-cols-2 items-stretch">
                <div className="p-7 lg:p-10 flex flex-col justify-center">
                  <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-gold/15 border border-gold/40 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-gold">
                    <Sparkles className="h-3.5 w-3.5" aria-hidden /> Signature Grade
                  </span>
                  <h2 id="flagship-heading" className="font-display text-2xl md:text-3xl font-bold mt-4">
                    {flagship.name} — <span className="text-gold">Ultra Crystal Clear Resin</span>
                  </h2>
                  <div className="divider-gold mt-4" aria-hidden />
                  <p className="mt-4 text-cream/70 text-[14.5px] leading-relaxed">
                    The grade our brand is known for. Maximum transparency, non-yellowing chemistry and a
                    glass-like high-gloss cure that makes art, tables and jewellery look showroom-ready.
                  </p>
                  <ul className="mt-5 grid sm:grid-cols-2 gap-x-4 gap-y-2.5 text-[13.5px]">
                    {[
                      { Icon: Droplets, t: "Bubble free, self-levelling cure" },
                      { Icon: Leaf, t: "Atmosphere friendly, low odour" },
                      { Icon: Timer, t: "UV-stable, non-yellowing" },
                      { Icon: CheckCircle2, t: "Wholesale & bulk pack sizes" },
                    ].map(({ Icon, t }) => (
                      <li key={t} className="flex items-center gap-2 text-cream/85">
                        <Icon className="h-4 w-4 text-gold shrink-0" aria-hidden /> {t}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button asChild className="btn-gold rounded-full">
                      <Link href={`/resin/${flagship.slug}`}>Explore Crystal Clear Range <ArrowRight className="h-4 w-4 ml-1" /></Link>
                    </Button>
                  </div>
                </div>
                <div className="relative min-h-[240px] md:min-h-full">
                  {flagship.image ? (
                    <Image
                      src={flagship.image}
                      alt={`${flagship.name} — ultra crystal clear epoxy resin, wholesale manufacturer & supplier in Surat`}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full hero-dark flex items-center justify-center">
                      <Droplets className="h-12 w-12 text-cream/70" aria-hidden />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-forest via-forest/20 to-transparent" aria-hidden />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── Mixing ratio systems — 2:1 & 3:1 ── */}
        <section aria-labelledby="ratio-heading" className="py-10 lg:py-12">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <h2 id="ratio-heading" className="font-display text-2xl md:text-3xl font-bold text-forest">
              Choose Your Mixing Ratio — 2:1 or 3:1
            </h2>
            <div className="divider-gold mx-auto mt-4" aria-hidden />
            <p className="mt-4 text-[15px] text-muted-foreground leading-relaxed">
              Our two core systems cover almost every project. Same brand quality — bubble free, atmosphere
              friendly, glass-clear — just different cure speeds for different jobs.
            </p>
          </div>
          <RatioShowcase />
        </section>

        {/* ── All categories grid ── */}
        <section id="all-categories" aria-labelledby="all-heading" className="py-10 lg:py-12 scroll-mt-28">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <h2 id="all-heading" className="font-display text-2xl md:text-3xl font-bold text-forest">
              All Resin Categories
            </h2>
            <div className="divider-gold mx-auto mt-4" aria-hidden />
            <p className="mt-4 text-[15px] text-muted-foreground leading-relaxed">
              {categories.length} epoxy resin categories in stock — every one available for wholesale and
              single-piece orders, dispatched pan-India from Surat.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((c) => (
              <CategoryCard key={c.id} name={c.name} slug={c.slug} description={c.description} count={c._count.products} image={c.image} />
            ))}
          </div>
        </section>

        {/* ── B2B / keyword summary + CTA ── */}
        <section aria-labelledby="b2b-heading" className="py-10 lg:py-14 pb-16">
          <div className="rounded-2xl border bg-card p-7 lg:p-10">
            <div className="grid lg:grid-cols-[1fr_300px] gap-8 items-center">
              <div>
                <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-forest-light">
                  <Handshake className="h-4 w-4" aria-hidden /> Wholesale · Manufacturer · Supplier · Exporter
                </span>
                <h2 id="b2b-heading" className="font-display text-2xl md:text-3xl font-bold text-forest mt-3">
                  B2B Bulk Supply of Ultra Crystal Clear Epoxy Resin
                </h2>
                <p className="mt-4 text-[14.5px] text-muted-foreground leading-relaxed">
                  Aurexa Resin supplies ultra crystal clear epoxy resin, 2:1 and 3:1 systems, art, casting,
                  table top, deep pour, river table, jewellery, coating, craft, woodworking and industrial
                  grades — as a direct <strong>wholesaler and B2B bulk supplier</strong> from Surat, Gujarat.
                  Resellers, galleries, furniture makers, studios and manufacturers get bulk pack sizes,
                  consistent batch quality and dependable pan-India dispatch. Every grade ships bubble free
                  and atmosphere friendly, with our 2:1 resin touch-dry in 4 hours and 3:1 resin in 10 hours.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Button asChild size="lg" className="btn-gold rounded-full">
                  <a href={wa} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-4 w-4" /> Get Wholesale Price List
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full border-forest/30 text-forest hover:bg-forest hover:text-cream">
                  <Link href="/inquiry">Send Bulk Enquiry</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
