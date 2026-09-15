import { getSettingsCached, waLink } from "@/lib/settings";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { JsonLd } from "@/components/site/json-ld";
import { InquiryForm } from "@/components/site/inquiry-form";
import { buildMetadata, breadcrumbSchema } from "@/lib/seo";
import { Phone, Mail, MapPin, Clock, MessageCircle, Instagram, Globe, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettingsCached();
  return buildMetadata({
    path: "/contact",
    fallbackTitle: `Contact ${s.brandName} — Epoxy Resin Supplier Surat | Phone & WhatsApp`,
    fallbackDescription:
      "Contact Aurexa Resin — epoxy resin wholesaler in Surat, Gujarat. Call or WhatsApp +91 93164 94976 for product inquiries, wholesale pricing and pan-India delivery.",
    keywords: "contact aurexa resin, epoxy resin contact surat, resin supplier phone number",
  });
}

export default async function ContactPage() {
  const s = await getSettingsCached();

  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Contact", url: "/contact" }])} />
      <section className="hero-dark text-cream">
        <div className="max-w-7xl mx-auto px-4 py-12 lg:py-16">
          <h1 className="font-display text-3xl md:text-4xl font-bold">Contact {s.brandName}</h1>
          <p className="mt-3 text-cream/70 max-w-3xl leading-relaxed text-[15px]">
            Call, WhatsApp or send an inquiry — our team responds during business hours. For the fastest
            response, WhatsApp us with your product and quantity requirement.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4">
        <Breadcrumbs items={[{ name: "Contact", url: "/contact" }]} />

        <div className="grid lg:grid-cols-5 gap-8 pb-16">
          {/* Contact details */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-6 space-y-5">
              <div>
                <h2 className="font-display font-semibold text-forest text-lg mb-4">Business Details</h2>
                <ul className="space-y-4 text-sm">
                  <li className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-gold-dark mt-0.5 shrink-0" aria-hidden />
                    <div>
                      <p className="font-medium text-forest">Phone</p>
                      <a href={`tel:${s.phone.replace(/\s/g, "")}`} className="text-muted-foreground hover:text-gold-dark">{s.phone}</a>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <MessageCircle className="h-5 w-5 text-gold-dark mt-0.5 shrink-0" aria-hidden />
                    <div>
                      <p className="font-medium text-forest">WhatsApp</p>
                      <a href={waLink(s.whatsappNumber, s.whatsappDefaultMessage)} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-gold-dark">
                        {s.phone} — Chat now
                      </a>
                    </div>
                  </li>
                  {s.email && (
                    <li className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-gold-dark mt-0.5 shrink-0" aria-hidden />
                      <div>
                        <p className="font-medium text-forest">Email</p>
                        <a href={`mailto:${s.email}`} className="text-muted-foreground hover:text-gold-dark break-all">{s.email}</a>
                      </div>
                    </li>
                  )}
                  <li className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-gold-dark mt-0.5 shrink-0" aria-hidden />
                    <div>
                      <p className="font-medium text-forest">Address</p>
                      <p className="text-muted-foreground">
                        {[s.addressLine, s.city, s.state, s.country].filter(Boolean).join(", ")}
                        {s.pincode ? ` - ${s.pincode}` : ""}
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-gold-dark mt-0.5 shrink-0" aria-hidden />
                    <div>
                      <p className="font-medium text-forest">Business Hours</p>
                      <p className="text-muted-foreground">{s.businessHours}</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Social & profiles */}
              {(s.instagramUrl || s.googleBusinessProfileUrl || s.facebookUrl || s.linkedinUrl) && (
                <div className="pt-4 border-t">
                  <h3 className="font-display font-semibold text-forest mb-3">Find Us Online</h3>
                  <div className="flex flex-col gap-2.5">
                    {s.googleBusinessProfileUrl && (
                      <a href={s.googleBusinessProfileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 text-sm text-muted-foreground hover:text-gold-dark">
                        <Globe className="h-4 w-4 text-gold-dark" /> Google Business Profile <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {s.instagramUrl && (
                      <a href={s.instagramUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 text-sm text-muted-foreground hover:text-gold-dark">
                        <Instagram className="h-4 w-4 text-gold-dark" /> Instagram — @aurexa_resin <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {s.facebookUrl && (
                      <a href={s.facebookUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 text-sm text-muted-foreground hover:text-gold-dark">
                        <Globe className="h-4 w-4 text-gold-dark" /> Facebook <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </Card>

            {/* Google Maps embed if configured */}
            {s.googleMapsUrl && (
              <Card className="overflow-hidden">
                <iframe
                  src={s.googleMapsUrl}
                  title={`${s.brandName} location map`}
                  className="w-full h-64 border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </Card>
            )}
          </div>

          {/* Inquiry form */}
          <div className="lg:col-span-3">
            <Card className="p-6 md:p-8">
              <h2 className="font-display font-semibold text-forest text-xl mb-1.5">Send Your Requirement</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Fill the form and our team will get back with product options, pack sizes and pricing.
              </p>
              <InquiryForm s={s} sourcePage="/contact" />
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
