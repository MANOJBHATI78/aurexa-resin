import { db } from "@/lib/db";
import { getSettingsCached, waLink } from "@/lib/settings";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { JsonLd } from "@/components/site/json-ld";
import { buildMetadata, articleSchema, breadcrumbSchema, parseJsonArray, SITE_URL } from "@/lib/seo";
import { Clock, ArrowLeft, MessageCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const revalidate = 120;

async function getPost(slug: string) {
  return db.blogPost.findUnique({ where: { slug } });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return buildMetadata({
    path: `/blog/${post.slug}`,
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt || undefined,
    keywords: post.seoKeywords,
    canonical: post.canonical,
    ogTitle: post.ogTitle || undefined,
    ogDescription: post.ogDescription || undefined,
    ogImage: post.ogImage || post.featuredImage || undefined,
    noindex: post.noindex,
    fallbackTitle: post.title,
  });
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post || !post.published) notFound();

  const s = await getSettingsCached();
  const relatedProductsSlugs = parseJsonArray(post.tags).length ? [] : [];
  const tags = parseJsonArray(post.tags);
  const [relatedPosts, relatedProducts] = await Promise.all([
    db.blogPost.findMany({ where: { published: true, id: { not: post.id } }, orderBy: { publishedAt: "desc" }, take: 3 }),
    Promise.resolve(relatedProductsSlugs),
  ]);

  const crumbs = [
    { name: "Blog", url: "/blog" },
    { name: post.title, url: `/blog/${post.slug}` },
  ];

  return (
    <>
      <JsonLd
        data={[
          articleSchema({
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            image: post.featuredImage,
            author: post.author,
            publishedAt: post.publishedAt,
            updatedAt: post.updatedAt,
            brand: s.brandName,
          }),
          breadcrumbSchema(crumbs),
        ]}
      />
      <div className="max-w-4xl mx-auto px-4">
        <Breadcrumbs items={crumbs} />
      </div>

      <article className="max-w-4xl mx-auto px-4 pb-14">
        <header className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-forest leading-tight">{post.title}</h1>
          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
            <span>By {post.author}</span>
            {post.publishedAt && (
              <time dateTime={post.publishedAt.toISOString()}>
                {post.publishedAt.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              </time>
            )}
            {post.readingTime && <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {post.readingTime} min read</span>}
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {tags.map((t) => (
                <span key={t} className="text-xs rounded-full bg-forest-mist text-forest px-3 py-1 border border-gold/25">#{t}</span>
              ))}
            </div>
          )}
        </header>

        {post.featuredImage && (
           
          <img src={post.featuredImage} alt={post.title} className="rounded-xl border mb-8 w-full object-cover max-h-[420px]" />
        )}

        {post.excerpt && (
          <p className="text-lg text-muted-foreground leading-relaxed border-l-2 border-gold pl-4 mb-8">{post.excerpt}</p>
        )}

        <div className="prose-aurexa text-foreground/90 text-[15.5px]">
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
            {post.content || ""}
          </ReactMarkdown>
        </div>

        {/* In-content CTA */}
        <div className="mt-12 rounded-xl hero-dark text-cream p-8 text-center">
          <h2 className="font-display text-xl md:text-2xl font-bold">Need Help Choosing Epoxy Resin?</h2>
          <p className="text-cream/70 mt-2 text-[15px] max-w-xl mx-auto">
            Tell the {s.brandName} team about your project — we supply art, casting, table top, deep pour
            and industrial epoxy resin across India.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Button asChild className="btn-gold">
              <a href={waLink(s.whatsappNumber, s.whatsappDefaultMessage)} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4" /> WhatsApp Us
              </a>
            </Button>
            <Button asChild className="btn-outline-light bg-transparent">
              <Link href="/products">Explore Products</Link>
            </Button>
          </div>
        </div>

        {/* Related products (internal linking) */}
        {relatedProducts.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display text-xl font-bold text-forest mb-4">Related Products</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {relatedProducts.map((p: { slug: string; name: string }) => (
                <Link key={p.slug} href={`/products/${p.slug}`} className="card-lift rounded-lg border bg-card px-4 py-3 text-sm font-medium text-forest hover:text-gold-dark">
                  {p.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Related articles */}
        {relatedPosts.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display text-xl font-bold text-forest mb-4">Keep Reading</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {relatedPosts.map((p) => (
                <Link key={p.id} href={`/blog/${p.slug}`} className="card-lift rounded-xl border bg-card p-4">
                  <h3 className="font-display font-semibold text-forest text-sm leading-snug">{p.title}</h3>
                  {p.excerpt && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{p.excerpt}</p>}
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="mt-10">
          <Button asChild variant="ghost" className="text-forest hover:text-gold-dark">
            <Link href="/blog"><ArrowLeft className="h-4 w-4" /> Back to Blog</Link>
          </Button>
        </div>
      </article>
    </>
  );
}
