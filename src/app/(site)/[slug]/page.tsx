import { db } from "@/lib/db";
import { getSettingsCached } from "@/lib/settings";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { JsonLd } from "@/components/site/json-ld";
import { LandingBlock } from "@/components/site/landing-blocks";
import { buildMetadata, breadcrumbSchema } from "@/lib/seo";

export const revalidate = 60;

async function getLanding(slug: string) {
  return db.landingPage.findUnique({ where: { slug } });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = await getLanding(slug);
  if (!page) return {};
  return buildMetadata({
    path: `/${page.slug}`,
    title: page.seoTitle || page.title,
    description: page.seoDescription || undefined,
    keywords: page.seoKeywords,
    canonical: page.canonical,
    ogTitle: page.ogTitle || undefined,
    ogDescription: page.ogDescription || undefined,
    ogImage: page.ogImage || undefined,
    noindex: page.noindex,
    fallbackTitle: page.title,
  });
}

export default async function LandingPageView({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Check redirect manager first (301/302/307/308)
  const redirectRule = await db.redirect.findFirst({ where: { fromPath: `/${slug}`, active: true } });
  if (redirectRule) redirect(redirectRule.statusCode, redirectRule.toPath);

  const page = await getLanding(slug);
  if (!page || !page.published) notFound();

  const s = await getSettingsCached();
  const blocks: Block[] = safeBlocks(page.blocks);
  const crumbs = [{ name: page.title, url: `/${page.slug}` }];

  return (
    <>
      {page.customHeadCode && <div dangerouslySetInnerHTML={{ __html: page.customHeadCode }} />}
      <JsonLd data={breadcrumbSchema(crumbs)} />
      {blocks.map((block, i) => (
        <LandingBlock key={i} block={block} s={s} faqHeading={page.title} />
      ))}
    </>
  );
}

interface Block {
  type: string;
  data: Record<string, unknown>;
}

function safeBlocks(raw: string | null): Block[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
