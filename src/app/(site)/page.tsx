import { db } from "@/lib/db";
import { getSettingsCached } from "@/lib/settings";
import { HomeSectionRenderer, type SectionDef } from "@/components/site/sections";
import { JsonLd } from "@/components/site/json-ld";
import { faqSchema } from "@/lib/seo";

export const revalidate = 60;

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
          <HomeSectionRenderer key={sec.id} section={section} s={s} globalFaqs={faqItems} />
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
