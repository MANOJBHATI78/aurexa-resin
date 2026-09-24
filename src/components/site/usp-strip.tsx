import Link from "next/link";
import { Droplets, Leaf, Timer, Hourglass, ArrowRight } from "lucide-react";

/**
 * Brand USP strip — the core qualities Aurexa Resin is known for.
 * Shown across the site so buyers instantly understand the brand value:
 *  - Bubble Free          → glass-clear, self-deaering cure
 *  - Atmosphere Friendly  → low-odour, studio-safe formulation
 *  - 2:1 Resin System     → touch dry in 4 HRS
 *  - 3:1 Resin System     → touch dry in 10 HRS
 */

const USPS = [
  {
    Icon: Droplets,
    title: "Bubble Free",
    text: "Self-deaering formula cures glass-clear — no bubbles, no flaws.",
    accent: "text-sky-300",
    chipBg: "bg-sky-400/10 border-sky-300/30",
  },
  {
    Icon: Leaf,
    title: "Atmosphere Friendly",
    text: "Low-odour, low-irritation — safe for home studios & workshops.",
    accent: "text-emerald-300",
    chipBg: "bg-emerald-400/10 border-emerald-300/30",
  },
  {
    Icon: Timer,
    title: "2:1 Resin · 4 Hrs Dry",
    text: "Easy 2 resin : 1 hardener mix — touch dry in just 4 hours.",
    accent: "text-gold",
    chipBg: "bg-gold/10 border-gold/40",
  },
  {
    Icon: Hourglass,
    title: "3:1 Resin · 10 Hrs Dry",
    text: "3 resin : 1 hardener for deep pours — flawless cure in 10 hours.",
    accent: "text-amber-300",
    chipBg: "bg-amber-400/10 border-amber-300/30",
  },
] as const;

/** Full 4-card band on dark (forest) background */
export function UspStripDark({ className = "" }: { className?: string }) {
  return (
    <section aria-label="Aurexa Resin brand qualities" className={`hero-dark text-cream border-y border-white/10 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 py-8 lg:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {USPS.map(({ Icon, title, text, accent, chipBg }) => (
            <div
              key={title}
              className={`rounded-xl border ${chipBg} p-4 lg:p-5 flex items-start gap-3.5 backdrop-blur-sm`}
            >
              <span className="h-10 w-10 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                <Icon className={`h-5 w-5 ${accent}`} aria-hidden />
              </span>
              <div>
                <p className="font-display font-semibold text-[15px] text-cream leading-snug">{title}</p>
                <p className="text-[12.5px] text-cream/65 leading-relaxed mt-1">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Compact chips row — fits inside page heroes */
export function UspStripCompact({ className = "" }: { className?: string }) {
  return (
    <ul aria-label="Aurexa Resin brand qualities" className={`flex flex-wrap gap-2 ${className}`}>
      {USPS.map(({ Icon, title, accent }) => (
        <li
          key={title}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/[0.06] backdrop-blur-sm px-3 py-1.5 text-[12px] font-medium text-cream/90"
        >
          <Icon className={`h-3.5 w-3.5 ${accent}`} aria-hidden />
          {title}
        </li>
      ))}
    </ul>
  );
}

/** Light (cream) card band for light backgrounds — used on category/product pages */
export function UspStripLight({ className = "" }: { className?: string }) {
  return (
    <section aria-label="Aurexa Resin brand qualities" className={`section-cream border-b border-border/60 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 py-7 lg:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {USPS.map(({ Icon, title, text }) => (
            <div key={title} className="rounded-xl border bg-card p-4 flex items-start gap-3">
              <span className="h-9 w-9 rounded-lg bg-forest-mist flex items-center justify-center shrink-0">
                <Icon className="h-4.5 w-4.5 text-forest" aria-hidden />
              </span>
              <div>
                <p className="font-display font-semibold text-[14px] text-forest leading-snug">{title}</p>
                <p className="text-[12.5px] text-muted-foreground leading-relaxed mt-0.5">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Ratio showcase — the two mixing systems with dry-time stats (used on /resin) */
export function RatioShowcase({ className = "" }: { className?: string }) {
  const systems = [
    {
      ratio: "2:1",
      name: "2:1 Epoxy Resin System",
      dry: "4 HRS",
      text: "Two parts resin, one part hardener — the easy-measure workhorse for art pours, coatings, table tops and fast production cycles. Touch dry in just 4 hours, demould the same day.",
      slug: "2-1-epoxy-resin",
    },
    {
      ratio: "3:1",
      name: "3:1 Epoxy Resin System",
      dry: "10 HRS",
      text: "Three parts resin, one part hardener — slower exotherm for deeper, glass-clear casts. Ideal for river tables, thick casting and jewellery where zero bubbles matter most.",
      slug: "3-1-epoxy-resin",
    },
  ];
  return (
    <div className={`grid gap-4 md:grid-cols-2 ${className}`}>
      {systems.map((sys) => (
        <Link
          key={sys.ratio}
          href={`/resin/${sys.slug}`}
          className="card-lift group relative overflow-hidden rounded-2xl bg-forest text-cream p-6 lg:p-8 shadow-xl"
        >
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-gold/10 blur-2xl" aria-hidden />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <span className="font-display text-4xl lg:text-5xl font-bold text-gold">{sys.ratio}</span>
              <p className="font-display font-semibold text-lg text-cream mt-2">{sys.name}</p>
            </div>
            <div className="text-right shrink-0">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/20 px-3 py-1.5">
                <Timer className="h-4 w-4 text-gold" aria-hidden />
                <span className="text-xs uppercase tracking-wider text-cream/70">Dry in</span>
              </span>
              <p className="font-display text-2xl lg:text-3xl font-bold text-cream mt-1.5">{sys.dry}</p>
            </div>
          </div>
          <p className="relative text-[13.5px] text-cream/70 leading-relaxed mt-4">{sys.text}</p>
          <span className="relative inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-gold group-hover:text-cream transition-colors">
            Explore {sys.ratio} resin <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
          </span>
        </Link>
      ))}
    </div>
  );
}
