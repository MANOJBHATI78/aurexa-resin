import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { JsonLd } from "@/components/site/json-ld";
import { buildMetadata, breadcrumbSchema, itemListSchema } from "@/lib/seo";
import { BookOpen, ArrowRight, Clock } from "lucide-react";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    path: "/blog",
    fallbackTitle: "Epoxy Resin Blog — Guides, Tutorials & Buying Advice",
    fallbackDescription:
      "Learn about epoxy resin — what it is, how to mix it, 2:1 vs 3:1 ratios, bubble-free casting, choosing resin for jewellery and tables. Practical guides from Aurexa Resin, Surat.",
    keywords: "epoxy resin blog, resin guides, resin tutorials, epoxy resin india, how to use epoxy resin",
  });
}

export default async function BlogListingPage() {
  const posts = await db.blogPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
  });
  if (!posts) notFound();

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([{ name: "Blog", url: "/blog" }]),
          itemListSchema(posts.map((p) => ({ name: p.title, url: `/blog/${p.slug}` })), "Resin Blog Articles"),
        ]}
      />
      <section className="hero-dark text-cream">
        <div className="max-w-7xl mx-auto px-4 py-12 lg:py-16">
          <p className="inline-flex items-center gap-2 text-xs tracking-[0.25em] uppercase text-gold mb-3">
            <BookOpen className="h-4 w-4" aria-hidden /> Resin Knowledge
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-bold">Epoxy Resin Guides & Articles</h1>
          <p className="mt-3 text-cream/70 max-w-3xl leading-relaxed text-[15px]">
            Practical, no-nonsense guides to help you choose, mix and use epoxy resin with confidence —
            written for artists, makers and businesses.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4">
        <Breadcrumbs items={[{ name: "Blog", url: "/blog" }]} />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 pb-16">
          {posts.map((post) => (
            <article key={post.id} className="card-lift rounded-xl border bg-card overflow-hidden flex flex-col">
              <Link href={`/blog/${post.slug}`} className="block aspect-[16/9] hero-dark flex items-center justify-center" aria-label={post.title}>
                {post.featuredImage ? (
                   
                  <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <span className="font-display text-gold/60 text-4xl" aria-hidden>❞</span>
                )}
              </Link>
              <div className="p-5 flex flex-col gap-2.5 flex-1">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {post.publishedAt && (
                    <time dateTime={post.publishedAt.toISOString()}>
                      {post.publishedAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </time>
                  )}
                  {post.readingTime && (
                    <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {post.readingTime} min read</span>
                  )}
                </div>
                <h2 className="font-display font-semibold text-forest text-[17px] leading-snug">
                  <Link href={`/blog/${post.slug}`} className="hover:text-gold-dark transition-colors">{post.title}</Link>
                </h2>
                {post.excerpt && <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{post.excerpt}</p>}
                <span className="mt-auto inline-flex items-center gap-1.5 text-[13px] font-semibold text-gold-dark pt-2">
                  Read article <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </article>
          ))}
          {!posts.length && (
            <div className="col-span-full text-center py-16">
              <p className="text-muted-foreground">Articles are coming soon.</p>
              <Button asChild className="btn-gold mt-4"><Link href="/products">Browse Products</Link></Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
