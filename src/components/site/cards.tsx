import Link from "next/link";
import { MessageCircle, Droplets, Layers, Package, Percent } from "lucide-react";
import { waLink, type SiteSettings } from "@/lib/settings";

export interface ProductCardData {
  id: string;
  name: string;
  slug: string;
  shortDesc?: string | null;
  image?: string | null;
  mixingRatio?: string | null;
  resinType?: string | null;
  finish?: string | null;
  showPrice?: boolean;
  price?: string | null;
  onSale?: boolean;
  salePrice?: string | null;
}

/** Elegant placeholder tile when no product photo exists yet (no fake images). */
function PlaceholderTile({ name }: { name: string }) {
  const initials = name
    .replace(/Epoxy Resin/gi, "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <div className="w-full h-full hero-dark flex flex-col items-center justify-center gap-2 text-cream/85">
      <Droplets className="h-10 w-10 opacity-80" aria-hidden />
      <span className="font-display text-2xl tracking-widest opacity-90">{initials}</span>
      <span className="text-[10px] tracking-[0.25em] uppercase text-cream/40">Aurexa Resin</span>
    </div>
  );
}

export function ProductCard({ product, s }: { product: ProductCardData; s: SiteSettings }) {
  const msg = s.whatsappProductTemplate.replace("{PRODUCT}", product.name);
  return (
    <article className="card-lift group flex flex-col rounded-xl border bg-card overflow-hidden h-full">
      <Link href={`/products/${product.slug}`} className="relative block aspect-[4/3] overflow-hidden" aria-label={product.name}>
        {product.image ? (
          
          <img
            src={product.image}
            alt={`${product.name} — supplied by Aurexa Resin, epoxy resin wholesaler in Surat`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <PlaceholderTile name={product.name} />
        )}
        {product.onSale && (
          <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 rounded-full bg-red-600 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-md">
            <Percent className="h-3 w-3" aria-hidden /> Sale
          </span>
        )}
      </Link>
      <div className="flex flex-col flex-1 p-4 gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {product.mixingRatio && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-forest bg-forest-mist border border-forest/20 rounded-full px-2 py-0.5">
              <Layers className="h-3 w-3" /> {product.mixingRatio} ratio
            </span>
          )}
          {product.finish && (
            <span className="text-[11px] text-muted-foreground truncate max-w-[180px]">{product.finish}</span>
          )}
        </div>
        <h3 className="font-display font-semibold text-[15px] leading-snug text-forest">
          <Link href={`/products/${product.slug}`} className="hover:text-forest-light transition-colors">
            {product.name}
          </Link>
        </h3>
        {product.shortDesc && (
          <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-3">{product.shortDesc}</p>
        )}
        {(product.onSale && product.salePrice) || (product.showPrice && product.price) ? (
          <div className="flex items-baseline gap-2 flex-wrap">
            {product.onSale && product.salePrice ? (
              <>
                <span className="text-[15px] font-bold text-red-600">{product.salePrice}</span>
                {product.price && (
                  <span className="text-[12px] text-muted-foreground line-through">{product.price}</span>
                )}
              </>
            ) : (
              <span className="text-[15px] font-bold text-forest">{product.price}</span>
            )}
          </div>
        ) : null}
        <div className="mt-auto pt-3 flex items-center gap-2">
          <Link
            href={`/products/${product.slug}`}
            className="text-[13px] font-semibold text-forest hover:text-forest-light underline-offset-4 hover:underline"
          >
            View Details
          </Link>
          <a
            href={waLink(s.whatsappNumber, msg)}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#128C4B] hover:text-[#0b6a39]"
            aria-label={`WhatsApp inquiry for ${product.name}`}
          >
            <MessageCircle className="h-4 w-4" /> Inquiry
          </a>
        </div>
      </div>
    </article>
  );
}

export function CategoryCard({ name, slug, description, count }: { name: string; slug: string; description?: string | null; count?: number }) {
  return (
    <Link
      href={`/resin/${slug}`}
      className="card-lift group rounded-xl border bg-card p-5 flex flex-col gap-2 h-full"
      aria-label={`${name} category`}
    >
      <div className="flex items-center gap-3">
        <span className="h-10 w-10 rounded-lg bg-forest flex items-center justify-center shrink-0">
          <Droplets className="h-5 w-5 text-cream" aria-hidden />
        </span>
        <h3 className="font-display font-semibold text-[15px] text-forest group-hover:text-forest-light transition-colors leading-snug">
          {name}
        </h3>
      </div>
      {description && (
        <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-3">{description}</p>
      )}
      {typeof count === "number" && count > 0 && (
        <span className="mt-auto inline-flex items-center gap-1 text-xs text-forest-light font-medium pt-2">
          <Package className="h-3.5 w-3.5" /> {count} product{count > 1 ? "s" : ""}
        </span>
      )}
    </Link>
  );
}
