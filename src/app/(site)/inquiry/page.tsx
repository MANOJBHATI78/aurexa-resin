import { getSettingsCached } from "@/lib/settings";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { JsonLd } from "@/components/site/json-ld";
import { InquiryForm } from "@/components/site/inquiry-form";
import { buildMetadata, breadcrumbSchema } from "@/lib/seo";
import { CheckCircle2 } from "lucide-react";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettingsCached();
  return buildMetadata({
    path: "/inquiry",
    fallbackTitle: `Send Inquiry — ${s.brandName} | Epoxy Resin Wholesale & Retail`,
    fallbackDescription:
      "Send your epoxy resin requirement to Aurexa Resin — product, quantity and application. Wholesale and single-piece inquiries welcome. Pan-India supply from Surat, Gujarat.",
    keywords: "epoxy resin inquiry, resin quote, wholesale resin inquiry, buy resin surat",
  });
}

export default async function InquiryPage() {
  const s = await getSettingsCached();
  const products = await db.product.findMany({
    where: { published: true },
    select: { name: true },
    orderBy: { name: "asc" },
    take: 50,
  });

  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Inquiry", url: "/inquiry" }])} />
      <section className="hero-dark text-cream">
        <div className="max-w-7xl mx-auto px-4 py-12 lg:py-16">
          <h1 className="font-display text-3xl md:text-4xl font-bold">Send Your Resin Requirement</h1>
          <p className="mt-3 text-cream/70 max-w-3xl leading-relaxed text-[15px]">
            Tell us what you are making and how much resin you need — we will recommend the right system,
            share pack sizes and respond with pricing. Wholesale, bulk and single-piece inquiries are all welcome.
          </p>
          <ul className="mt-6 grid sm:grid-cols-3 gap-2 max-w-2xl text-sm text-cream/70">
            {["Response during business hours", "Wholesale pricing on bulk volumes", "Pan-India dispatch from Surat"].map((t) => (
              <li key={t} className="inline-flex items-start gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-gold shrink-0 mt-0.5" aria-hidden /> {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4">
        <Breadcrumbs items={[{ name: "Inquiry", url: "/inquiry" }]} />
        <div className="max-w-3xl mx-auto pb-16">
          <div className="rounded-xl border bg-card p-6 md:p-8 shadow-sm">
            <InquiryForm s={s} sourcePage="/inquiry" />
          </div>
        </div>
      </div>
    </>
  );
}
