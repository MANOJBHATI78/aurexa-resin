import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { JsonLd } from "@/components/site/json-ld";
import { buildMetadata, breadcrumbSchema } from "@/lib/seo";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getSettingsCached } from "@/lib/settings";
import { MessageCircle } from "lucide-react";

export const revalidate = 120;

async function getPage(slug: string) {
  return db.page.findUnique({ where: { slug } });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) return {};
  return buildMetadata({
    path: `/p/${page.slug}`,
    title: page.seoTitle || page.title,
    description: page.seoDescription || undefined,
    noindex: page.noindex,
    fallbackTitle: page.title,
  });
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page || !page.published) notFound();

  const s = await getSettingsCached();
  const crumbs = [{ name: page.title, url: `/p/${page.slug}` }];

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <section className="hero-dark text-cream">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="font-display text-3xl md:text-4xl font-bold">{page.title}</h1>
        </div>
      </section>
      <div className="max-w-4xl mx-auto px-4">
        <Breadcrumbs items={crumbs} />
        <article className="prose-aurexa text-foreground/90 text-[15px] pb-12">
          <ReactMarkdown remarkPlugins={[remarkGfm]}
            components={{
              a: ({ href, children }) => {
                if (!href) return <a>{children}</a>;
                return href.startsWith("http") || href.startsWith("mailto")
                  ? <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
                  : <Link href={href}>{children}</Link>;
              },
            }}
          >
            {page.content || ""}
          </ReactMarkdown>
          <div className="mt-10 rounded-xl border border-forest/25 bg-forest-mist/60 p-6 text-center">
            <p className="text-forest font-medium">Questions about this policy?</p>
            <p className="text-sm text-muted-foreground mt-1">Contact {s.brandName} — {s.phone}</p>
            <Button asChild className="btn-gold mt-4">
              <a href={`https://wa.me/${s.whatsappNumber}?text=${encodeURIComponent(`Hello ${s.brandName}, I have a question.`)}`} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4" /> WhatsApp Us
              </a>
            </Button>
          </div>
        </article>
      </div>
    </>
  );
}
