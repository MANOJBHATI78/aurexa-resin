import { getSettingsCached, waLink } from "@/lib/settings";
import { db } from "@/lib/db";
import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { JsonLd } from "@/components/site/json-ld";
import { FaqSection } from "@/components/site/faq";
import { buildMetadata, breadcrumbSchema, faqSchema, parseJsonArray } from "@/lib/seo";
import { MessageCircle, Gem, Layers, Truck, Handshake, CheckCircle2, Instagram, Globe } from "lucide-react";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    path: "/about",
    fallbackTitle: "About Aurexa Resin — Epoxy Resin Wholesaler in Surat, Gujarat",
    fallbackDescription:
      "Learn about Aurexa Resin — an epoxy resin wholesaler, supplier and dealer based in Surat, Gujarat, serving artists, workshops, resellers and industries across India.",
    keywords: "about aurexa resin, epoxy resin wholesaler surat, resin supplier gujarat, resin dealer india",
  });
}

export default async function AboutPage() {
  const s = await getSettingsCached();
  const faqs = await db.faq.findMany({ where: { active: true, entityType: "GLOBAL" }, orderBy: { order: "asc" }, take: 6 });

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([{ name: "About Us", url: "/about" }]),
          faqSchema(faqs.map((f) => ({ question: f.question, answer: f.answer }))),
        ]}
      />
      <section className="hero-dark text-cream">
        <div className="max-w-7xl mx-auto px-4 py-14 lg:py-20">
          <h1 className="font-display text-3xl md:text-5xl font-bold">About {s.brandName}</h1>
          <p className="mt-4 text-cream/75 max-w-3xl leading-relaxed text-[15px] md:text-lg">{s.shortDescription}</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4">
        <Breadcrumbs items={[{ name: "About Us", url: "/about" }]} />

        <div className="grid lg:grid-cols-5 gap-10 pb-14">
          <div className="lg:col-span-3 space-y-8">
            <section>
              <h2 className="font-display text-2xl font-bold text-forest mb-3">Who We Are</h2>
              <div className="divider-gold mb-5" aria-hidden />
              <div className="prose-aurexa text-muted-foreground text-[15px] whitespace-pre-line">{s.businessDescription}</div>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-forest mb-3">Our Approach to Quality</h2>
              <div className="divider-gold mb-5" aria-hidden />
              <p className="text-muted-foreground text-[15px] leading-relaxed">
                Resin buyers judge a supplier by consistency — the same clarity, the same cure, batch after batch.
                We focus on sourcing dependable systems, storing and handling them correctly, and guiding every
                buyer to the right product for their specific application. Technical questions are answered by
                people who work with resin daily, not by a script.
              </p>
              <ul className="mt-4 space-y-2.5">
                {[
                  "Carefully selected resin systems for each application family",
                  "Proper storage and handling from our Surat base to your door",
                  "Honest guidance on ratios, pour depths and pack sizes",
                  "Support before and after every order",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-gold-dark mt-0.5 shrink-0" aria-hidden /> {t}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-forest mb-3">Who We Serve</h2>
              <div className="divider-gold mb-5" aria-hidden />
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { icon: Gem, title: "Resin Artists & Makers", text: "Art resin, jewellery resin and craft resin in studio-friendly packs." },
                  { icon: Layers, title: "Workshops & Manufacturers", text: "Table top, deep pour and industrial systems in production volumes." },
                  { icon: Handshake, title: "Resellers & Stores", text: "Wholesale pricing and consistent availability for your channel." },
                  { icon: Truck, title: "Pan-India Buyers", text: "Dispatch from Surat to artists and businesses across the country." },
                ].map(({ icon: Icon, title, text }) => (
                  <div key={title} className="rounded-xl border bg-card p-5">
                    <Icon className="h-5 w-5 text-gold-dark mb-2.5" aria-hidden />
                    <h3 className="font-display font-semibold text-forest text-[15px]">{title}</h3>
                    <p className="text-[13px] text-muted-foreground leading-relaxed mt-1.5">{text}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Contact card */}
          <aside className="lg:col-span-2">
            <div className="sticky top-24 rounded-xl border border-gold/40 overflow-hidden">
              <div className="hero-dark text-cream p-6">
                <h2 className="font-display text-xl font-bold">Talk to {s.brandName}</h2>
                <p className="text-cream/70 text-sm mt-2 leading-relaxed">
                  Questions about products, wholesale pricing or delivery? Reach us directly — we reply during business hours.
                </p>
                <div className="mt-5 flex flex-col gap-2.5">
                  <Button asChild className="btn-gold w-full">
                    <a href={waLink(s.whatsappNumber, s.whatsappDefaultMessage)} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="h-4 w-4" /> WhatsApp {s.phone}
                    </a>
                  </Button>
                  <Button asChild className="btn-outline-light bg-transparent w-full">
                    <Link href="/inquiry">Send an Inquiry</Link>
                  </Button>
                  {s.instagramUrl && (
                    <Button asChild className="bg-transparent border border-gold/40 text-gold hover:bg-gold hover:text-forest-dark w-full">
                      <a href={s.instagramUrl} target="_blank" rel="noopener noreferrer">
                        <Instagram className="h-4 w-4" /> Follow @aurexa_resin
                      </a>
                    </Button>
                  )}
                  {s.googleBusinessProfileUrl && (
                    <Button asChild variant="outline" className="bg-transparent border-cream/30 text-cream/80 hover:text-gold w-full">
                      <a href={s.googleBusinessProfileUrl} target="_blank" rel="noopener noreferrer">
                        <Globe className="h-4 w-4" /> Find Us on Google
                      </a>
                    </Button>
                  )}
                </div>
              </div>
              <div className="bg-card p-6 text-sm text-muted-foreground space-y-2">
                <p><strong className="text-forest">Location:</strong> {[s.addressLine, s.state, s.country].filter(Boolean).join(", ")}</p>
                <p><strong className="text-forest">Business Hours:</strong> {s.businessHours}</p>
                <p><strong className="text-forest">Supply Area:</strong> Pan-India</p>
              </div>
            </div>
          </aside>
        </div>

        {/* FAQ */}
        <section className="max-w-4xl pb-16">
          <h2 className="font-display text-2xl font-bold text-forest mb-2">Frequently Asked Questions</h2>
          <p className="text-sm text-muted-foreground mb-6">Common questions about our business and supply.</p>
          <FaqSection faqs={faqs.map((f) => ({ id: f.id, question: f.question, answer: f.answer }))} className="rounded-xl border bg-card px-6 py-2" />
        </section>
      </div>
    </>
  );
}
