import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getSettingsCached } from "@/lib/settings";
import { HomeSectionRenderer, type SectionDef } from "@/components/site/sections";
import { UspStripDark } from "@/components/site/usp-strip";
import { JsonLd } from "@/components/site/json-ld";
import { buildMetadata, faqSchema } from "@/lib/seo";
import { Fragment } from "react";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const meta = await buildMetadata({
    path: "/",
    fallbackTitle: "Aurexa Resin — Ultra Crystal Clear Epoxy Resin Wholesale Manufacturer, Supplier & Exporter",
    fallbackDescription:
      "Buy ultra crystal clear epoxy resin direct from Aurexa Resin — wholesale manufacturer, supplier, exporter & B2B bulk supplier in Surat, Gujarat. Bubble free, atmosphere friendly 2:1 resin (4 hrs dry) & 3:1 resin (10 hrs dry) for art, tables, jewellery & industry. Pan-India dispatch.",
    keywords:
      "ultra crystal clear resin, ultra crystal clear epoxy resin, epoxy resin wholesale, resin wholesaler surat, resin manufacturer india, resin supplier, resin exporter, b2b bulk resin supplier, 2:1 resin, 3:1 resin, bubble free resin, atmosphere friendly resin, crystal clear epoxy, art resin, deep pour resin, epoxy resin surat",
  });
  // Root layout template would append "| Aurexa Resin" — use absolute to avoid brand duplication
  return { ...meta, title: { absolute: "Aurexa Resin — Ultra Crystal Clear Epoxy Resin Wholesale Manufacturer, Supplier & Exporter" } };
}

export default async function HomePage() {
  const s = await getSettingsCached();
  const [sections, globalFaqs] = await Promise.all([
    db.homeSection.findMany({ where: { visible: true }, orderBy: { order: "asc" } }),
    db.faq.findMany({ where: { active: true, entityType: "GLOBAL" }, orderBy: { order: "asc" } }),
  ]);

  const faqItems = globalFaqs.map((f) => ({ question: f.question, answer: f.answer }));

  return (
    <>
      <JsonLd data={faqSchema(faqItems)} />
      {sections.map((sec) => {
        const section: SectionDef = {
          id: sec.id,
          type: sec.type,
          title: sec.title,
          data: safeParse(sec.data),
        };
        return (
          <Fragment key={sec.id}>
            <HomeSectionRenderer section={section} s={s} globalFaqs={faqItems} />
            {/* Brand USP band directly under the hero — Bubble Free · Atmosphere Friendly · 2:1/3:1 dry times */}
            {sec.type === "hero" && <UspStripDark />}
          </Fragment>
        );
      })}
    </>
  );
}

function safeParse(raw: string | null): Record<string, unknown> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}
