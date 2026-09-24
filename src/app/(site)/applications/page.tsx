import { db } from "@/lib/db";
import { ApplicationGrid } from "@/components/site/sections";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { JsonLd } from "@/components/site/json-ld";
import { buildMetadata, breadcrumbSchema, itemListSchema } from "@/lib/seo";
import { Palette } from "lucide-react";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    path: "/applications",
    fallbackTitle: "Epoxy Resin Applications — Art, Jewellery, Tables, Woodworking & Industry",
    fallbackDescription:
      "Explore epoxy resin applications served by Aurexa Resin — resin art, jewellery making, table tops, river tables, woodworking, coating, casting, craft and industrial uses.",
    keywords: "resin applications, resin art, resin jewellery, resin table top, resin woodworking, epoxy uses",
  });
}

export default async function ApplicationsPage() {
  const apps = await db.application.findMany({ where: { published: true }, orderBy: { order: "asc" } });

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([{ name: "Applications", url: "/applications" }]),
          itemListSchema(apps.map((a) => ({ name: a.name, url: `/applications/${a.slug}` })), "Resin Applications"),
        ]}
      />
      <section className="hero-dark text-cream">
        <div className="max-w-7xl mx-auto px-4 py-12 lg:py-16">
          <p className="inline-flex items-center gap-2 text-xs tracking-[0.25em] uppercase text-forest-light mb-3">
            <Palette className="h-4 w-4" aria-hidden /> What Will You Make?
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-bold">Resin Applications</h1>
          <p className="mt-3 text-cream/70 max-w-3xl leading-relaxed text-[15px]">
            Different projects need different resin behaviour — pour depth, working time, clarity and finish.
            Explore the applications we supply for, and find the right system for yours.
          </p>
        </div>
      </section>
      <div className="max-w-7xl mx-auto px-4">
        <Breadcrumbs items={[{ name: "Applications", url: "/applications" }]} />
        <ApplicationGrid limit={20} />
        <div className="pb-16" />
      </div>
    </>
  );
}
