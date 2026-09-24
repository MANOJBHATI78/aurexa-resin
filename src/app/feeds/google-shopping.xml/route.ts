import { db } from "@/lib/db";
import { getSettingsCached } from "@/lib/settings";
import { SITE_URL, absoluteUrl } from "@/lib/seo";

export const revalidate = 3600;

/**
 * Google Merchant Center product feed (RSS 2.0 with g: namespace).
 * Submit this URL in Merchant Center:  https://your-domain/feeds/google-shopping.xml
 * Only products that are published AND have a price are included
 * (Google Shopping requires a price; wholesale quotes-only products are skipped).
 */
export async function GET() {
  const s = await getSettingsCached();
  const brand = s.shoppingBrand || s.brandName || "Aurexa Resin";
  const condition = s.shoppingCondition || "new";

  if (s.shoppingFeedEnabled !== "true") {
    return new Response("Feed disabled", { status: 404 });
  }

  const products = await db.product.findMany({
    where: { published: true },
    include: { category: { select: { name: true } } },
    orderBy: { updatedAt: "desc" },
  });

  const esc = (v: string) =>
    v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  const items: string[] = [];
  for (const p of products) {
    const priceNum = Number(String(p.price || "").replace(/[^0-9.]/g, ""));
    if (!priceNum || priceNum <= 0) continue; // Shopping requires a price
    const saleNum = p.onSale && p.salePrice ? Number(String(p.salePrice).replace(/[^0-9.]/g, "")) : 0;
    const image = p.image ? absoluteUrl(p.image) : "";
    const title = esc(p.name);
    const description = esc((p.shortDesc || p.longDesc || p.name).slice(0, 5000));
    const link = absoluteUrl(`/products/${p.slug}`);
    items.push(`    <item>
      <g:id>${esc(p.id)}</g:id>
      <g:title>${title}</g:title>
      <g:description>${description}</g:description>
      <g:link>${link}</g:link>
      ${image ? `<g:image_link>${esc(image)}</g:image_link>` : ""}
      <g:price>${priceNum.toFixed(2)} INR</g:price>
      ${saleNum > 0 && saleNum < priceNum ? `<g:sale_price>${saleNum.toFixed(2)} INR</g:sale_price>` : ""}
      <g:brand>${esc(brand)}</g:brand>
      <g:condition>${esc(condition)}</g:condition>
      <g:availability>in_stock</g:availability>
      ${p.sku ? `<g:mpn>${esc(p.sku)}</g:mpn>` : ""}
      ${p.category?.name ? `<g:product_type>${esc(p.category.name)}</g:product_type>` : ""}
      <g:identifier_exists>no</g:identifier_exists>
    </item>`);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${esc(brand)} — Epoxy Resin Products</title>
    <link>${SITE_URL}</link>
    <description>Ultra crystal clear epoxy resin, 2:1 and 3:1 systems, art, casting, deep pour and industrial grades — wholesale manufacturer and supplier from Surat, Gujarat.</description>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items.join("\n")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
