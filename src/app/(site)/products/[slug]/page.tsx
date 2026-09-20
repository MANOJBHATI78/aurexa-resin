import { db } from "@/lib/db";
import { getSettingsCached, waLink } from "@/lib/settings";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { JsonLd } from "@/components/site/json-ld";
import { ProductCard, CategoryCard } from "@/components/site/cards";
import { FaqSection } from "@/components/site/faq";
import { buildMetadata, breadcrumbSchema, faqSchema, productSchema, parseJsonArray, absoluteUrl } from "@/lib/seo";
import { toVideoEmbed, isDirectVideo } from "@/lib/video";
import { MessageCircle, Phone, Layers, Droplets, Package, Clock, Wrench, Sparkles, CheckCircle2, ShieldCheck, Users, Percent } from "lucide-react";
import type { Metadata } from "next";

export const revalidate = 60;

async function getProduct(slug: string) {
  return db.product.findUnique({
    where: { slug },
    include: { category: true },
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};
  const s = await getSettingsCached();
  const title = product.seoTitle || s.seoTitleTemplateProduct.replace("{name}", product.name);
  return buildMetadata({
    path: `/products/${product.slug}`,
    title,
    description: product.seoDescription || product.shortDesc || undefined,
    keywords: product.seoKeywords,
    canonical: product.canonical,
    ogTitle: product.ogTitle || undefined,
    ogDescription: product.ogDescription || undefined,
    ogImage: product.ogImage || product.image || undefined,
    noindex: product.noindex,
    fallbackTitle: product.name,
  });
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product || !product.published) notFound();

  const s = await getSettingsCached();
  const [related, categoryFaqs] = await Promise.all([
    product.categoryId
      ? db.product.findMany({
          where: { published: true, categoryId: product.categoryId, id: { not: product.id } },
          take: 4,
        })
      : Promise.resolve([]),
    product.categoryId
      ? db.faq.findMany({ where: { active: true, entityType: "CATEGORY", categoryId: product.categoryId }, orderBy: { order: "asc" } })
      : Promise.resolve([]),
  ]);

  const packSizes = parseJsonArray<{ size: string; availability?: string }>(product.packSizes);
  const applications = parseJsonArray(product.applications);
  const features = parseJsonArray(product.features);
  const benefits = parseJsonArray(product.benefits);
  const suitableFor = parseJsonArray(product.suitableFor);
  const specs = parseJsonArray<{ label: string; value: string }>(product.specs);
  const gallery = parseJsonArray<{ url: string; alt?: string }>(product.gallery);

  const waMsg = s.whatsappProductTemplate.replace("{PRODUCT}", product.name);
  const crumbs = [
    { name: "Products", url: "/products" },
    ...(product.category ? [{ name: product.category.name, url: `/resin/${product.category.slug}` }] : []),
    { name: product.name, url: `/products/${product.slug}` },
  ];

  const structuredSpecs = [
    { icon: Layers, label: "Mixing Ratio", value: product.mixingRatio },
    { icon: Droplets, label: "Resin Type", value: product.resinType },
    { icon: Sparkles, label: "Finish", value: product.finish },
    { icon: Package, label: "Pack Sizes", value: packSizes.map((p) => p.size).join(", ") },
    { icon: Clock, label: "Working Time", value: product.workingTime },
    { icon: Wrench, label: "Pour Depth", value: product.pourDepth },
    { icon: CheckCircle2, label: "Recommended Use", value: product.recommendedUse },
  ].filter((x) => x.value);

  return (
    <>
      <JsonLd
        data={[
          productSchema({
            name: product.name,
            slug: product.slug,
            description: product.seoDescription || product.shortDesc,
            image: product.image,
            brand: s.brandName,
            sku: product.sku,
          }),
          breadcrumbSchema(crumbs),
          faqSchema(categoryFaqs.map((f) => ({ question: f.question, answer: f.answer }))),
        ]}
      />

      {/* Hero band */}
      <section className="hero-dark text-cream">
        <div className="max-w-7xl mx-auto px-4 py-10 lg:py-14">
          <p className="inline-flex items-center gap-2 text-xs tracking-[0.22em] uppercase text-forest-light mb-4">
            {product.category ? product.category.name : "Epoxy Resin"}
          </p>
          <h1 className="font-display text-2xl md:text-4xl font-bold max-w-3xl leading-snug">{product.name}</h1>
          {product.shortDesc && (
            <p className="mt-4 text-cream/70 max-w-3xl leading-relaxed text-[15px]">{product.shortDesc}</p>
          )}
          {/* Price block — shows sale price when on sale, regular price when enabled */}
          {(product.onSale && product.salePrice) || (product.showPrice && product.price) ? (
            <div className="mt-5 inline-flex items-center gap-3 rounded-xl bg-white/[0.06] border border-white/10 px-4 py-2.5">
              {product.onSale && (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                  <Percent className="h-3 w-3" aria-hidden /> Sale
                </span>
              )}
              <span className={`font-display text-xl font-bold ${product.onSale ? "text-red-400" : "text-cream"}`}>
                {product.onSale && product.salePrice ? product.salePrice : product.price}
              </span>
              {product.onSale && product.price && (
                <span className="text-sm text-cream/50 line-through">{product.price}</span>
              )}
            </div>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild className="btn-gold">
              <a href={waLink(s.whatsappNumber, waMsg)} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4" /> WhatsApp Inquiry
              </a>
            </Button>
            <Button asChild className="btn-outline-light bg-transparent">
              <a href={`tel:${s.phone.replace(/\s/g, "")}`}><Phone className="h-4 w-4" /> Call {s.phone}</a>
            </Button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4">
        <Breadcrumbs items={crumbs} />

        <div className="grid lg:grid-cols-5 gap-8 pb-14">
          {/* Images */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border overflow-hidden bg-card aspect-square">
              {product.image ? (
                product.mobileImage ? (
                  <picture>
                    <source media="(max-width: 767px)" srcSet={product.mobileImage} />
                    <img
                      src={product.image}
                      alt={`${product.name} — ${s.brandName}, epoxy resin supplier in Surat`}
                      className="w-full h-full object-cover"
                    />
                  </picture>
                ) : (
                  <img
                    src={product.image}
                    alt={`${product.name} — ${s.brandName}, epoxy resin supplier in Surat`}
                    className="w-full h-full object-cover"
                  />
                )
              ) : (
                <div className="w-full h-full hero-dark flex flex-col items-center justify-center gap-3 text-cream/85">
                  <Droplets className="h-16 w-16 opacity-70" aria-hidden />
                  <p className="text-sm text-cream/50 px-8 text-center">Product photo coming soon — supplied by {s.brandName}, Surat</p>
                </div>
              )}
            </div>
            {gallery.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-3">
                {gallery.slice(0, 4).map((g, i) => (
                   
                  <img key={i} src={g.url} alt={g.alt || `${product.name} image ${i + 1}`} className="rounded-lg border aspect-square object-cover" loading="lazy" />
                ))}
              </div>
            )}
            {/* Product video — admin can attach a YouTube/Vimeo/mp4 link */}
            {(() => {
              const embed = toVideoEmbed(product.videoUrl);
              if (!embed) return null;
              return (
                <div className="mt-3 rounded-xl overflow-hidden border shadow-md aspect-video bg-black">
                  {isDirectVideo(embed) ? (
                    <video src={embed} controls playsInline className="w-full h-full" preload="metadata" />
                  ) : (
                    <iframe
                      src={embed}
                      title={`${product.name} video`}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      loading="lazy"
                    />
                  )}
                </div>
              );
            })()}
          </div>

          {/* Details */}
          <div className="lg:col-span-3 space-y-8">
            {/* Structured specs */}
            {structuredSpecs.length > 0 && (
              <div className="rounded-xl border bg-card p-6">
                <h2 className="font-display font-semibold text-forest text-lg mb-4">Product Overview</h2>
                <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3.5">
                  {structuredSpecs.map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-start gap-3">
                      <Icon className="h-5 w-5 text-forest mt-0.5 shrink-0" aria-hidden />
                      <div>
                        <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
                        <dd className="text-sm font-medium text-forest mt-0.5">{value}</dd>
                      </div>
                    </div>
                  ))}
                </dl>
                {packSizes.length > 0 && (
                  <div className="mt-5 pt-5 border-t">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Available Pack Sizes</p>
                    <div className="flex flex-wrap gap-2">
                      {packSizes.map((p) => (
                        <span key={p.size} className="text-[13px] rounded-full bg-forest-mist text-forest px-3 py-1 border border-forest/20">
                          {p.size}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Applications */}
            {applications.length > 0 && (
              <div className="rounded-xl border bg-card p-6">
                <h2 className="font-display font-semibold text-forest text-lg mb-3">Applications</h2>
                <div className="flex flex-wrap gap-2">
                  {applications.map((a) => (
                    <span key={a} className="text-[13px] rounded-full bg-forest-mist text-forest px-3 py-1 border border-forest/20">{a}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {product.longDesc && (
              <div className="rounded-xl border bg-card p-6">
                <h2 className="font-display font-semibold text-forest text-lg mb-3">About This Product</h2>
                <div className="prose-aurexa text-muted-foreground text-[15px] whitespace-pre-line">{product.longDesc}</div>
              </div>
            )}

            {/* Features & benefits */}
            {(features.length > 0 || benefits.length > 0) && (
              <div className="grid sm:grid-cols-2 gap-4">
                {features.length > 0 && (
                  <div className="rounded-xl border bg-card p-6">
                    <h2 className="font-display font-semibold text-forest text-lg mb-3">Key Features</h2>
                    <ul className="space-y-2.5">
                      {features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-forest mt-0.5 shrink-0" aria-hidden /> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {benefits.length > 0 && (
                  <div className="rounded-xl border bg-card p-6">
                    <h2 className="font-display font-semibold text-forest text-lg mb-3">Benefits</h2>
                    <ul className="space-y-2.5">
                      {benefits.map((b) => (
                        <li key={b} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <ShieldCheck className="h-4 w-4 text-forest mt-0.5 shrink-0" aria-hidden /> {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Suitable for */}
            {suitableFor.length > 0 && (
              <div className="rounded-xl border bg-card p-6">
                <h2 className="font-display font-semibold text-forest text-lg mb-3 flex items-center gap-2">
                  <Users className="h-5 w-5 text-forest-light" aria-hidden /> Who Buys This Product
                </h2>
                <p className="text-sm text-muted-foreground">{suitableFor.join(" · ")}</p>
              </div>
            )}

            {/* Custom specs table */}
            {specs.length > 0 && (
              <div className="rounded-xl border bg-card p-6">
                <h2 className="font-display font-semibold text-forest text-lg mb-3">Technical Specifications</h2>
                <table className="w-full text-sm">
                  <tbody>
                    {specs.map((sp) => (
                      <tr key={sp.label} className="border-t border-border/60">
                        <td className="py-2.5 pr-4 text-muted-foreground w-2/5">{sp.label}</td>
                        <td className="py-2.5 font-medium text-forest">{sp.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Safety */}
            {product.safetyInfo && (
              <div className="rounded-xl border border-forest/25 bg-forest-mist/60 p-6">
                <h2 className="font-display font-semibold text-forest text-lg mb-2">Safety Information</h2>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{product.safetyInfo}</p>
              </div>
            )}

            {/* Curing info */}
            {product.curingInfo && (
              <div className="rounded-xl border bg-card p-6">
                <h2 className="font-display font-semibold text-forest text-lg mb-2">Curing Information</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{product.curingInfo}</p>
              </div>
            )}

            {/* Category FAQs */}
            {categoryFaqs.length > 0 && (
              <div className="rounded-xl border bg-card p-6">
                <h2 className="font-display font-semibold text-forest text-lg mb-3">Frequently Asked Questions</h2>
                <FaqSection faqs={categoryFaqs.map((f) => ({ id: f.id, question: f.question, answer: f.answer }))} />
              </div>
            )}
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <section className="pb-16">
            <h2 className="font-display text-xl md:text-2xl font-bold text-forest mb-6">Related Products</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} s={s} product={{
                  id: p.id, name: p.name, slug: p.slug, shortDesc: p.shortDesc,
                  image: p.image, mixingRatio: p.mixingRatio, resinType: p.resinType, finish: p.finish,
                  showPrice: p.showPrice, price: p.price, onSale: p.onSale, salePrice: p.salePrice,
                }} />
              ))}
            </div>
          </section>
        )}

        {/* Related category */}
        {product.category && (
          <section className="pb-16">
            <h2 className="font-display text-xl md:text-2xl font-bold text-forest mb-6">Browse Category</h2>
            <div className="max-w-sm">
              <CategoryCard name={product.category.name} slug={product.category.slug} description={product.category.description} />
            </div>
          </section>
        )}
      </div>
    </>
  );
}
