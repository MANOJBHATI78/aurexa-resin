"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Menu, Phone, MessageCircle, ChevronDown, Percent, Sparkles,
  Droplets, Leaf, Timer, Hourglass, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet, SheetContent, SheetTrigger, SheetTitle,
} from "@/components/ui/sheet";
import { waLink, type SiteSettings } from "@/lib/settings";

interface NavItem {
  id: string;
  label: string;
  url: string;
  children?: { id: string; label: string; url: string }[];
}

interface HeaderCategory {
  name: string;
  slug: string;
  image?: string | null;
}

export function SiteHeader({
  s, nav, categories,
}: {
  s: SiteSettings;
  nav: NavItem[];
  categories: HeaderCategory[];
}) {
  const [open, setOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const pathname = usePathname();
  const whatsappHref = waLink(s.whatsappNumber, s.whatsappDefaultMessage);
  const telHref = `tel:${s.phone.replace(/\s/g, "")}`;

  // Only the Categories item (/resin) carries the mega menu
  const items = nav.map((item) =>
    item.url === "/resin"
      ? {
          ...item,
          children: categories.slice(0, 12).map((c) => ({
            id: c.slug,
            label: c.name,
            url: `/resin/${c.slug}`,
          })),
        }
      : item,
  );

  const featured = categories.find((c) => c.slug === "crystal-clear-epoxy-resin");
  const isActive = (url: string) =>
    url === "/" ? pathname === "/" : pathname.startsWith(url);

  // Brand keyword ticker — the qualities & search terms buyers look for
  const tickerItems: { text: string; highlight?: boolean }[] = [];
  if (s.announcementEnabled === "true" && s.announcementBar) {
    tickerItems.push({ text: s.announcementBar, highlight: true });
  }
  tickerItems.push(
    { text: "Ultra Crystal Clear Resin", highlight: true },
    { text: "Bubble Free" },
    { text: "Atmosphere Friendly" },
    { text: "2:1 Resin — 4 Hrs Dry" },
    { text: "3:1 Resin — 10 Hrs Dry" },
    { text: "Wholesale · Manufacturer · Supplier · Exporter" },
    { text: "B2B Bulk Supplier" },
    { text: "Pan-India Dispatch" },
    { text: "Surat, Gujarat" },
  );

  const iconBtn =
    "inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/50";

  const megaCategories = categories.slice(0, 10);

  return (
    <header className={s.stickyHeader === "true" ? "sticky top-0 z-50" : "relative z-50"}>
      {/* ── Keyword ticker bar — brand qualities + search terms ── */}
      <div className="bg-forest-dark border-b border-white/10 ticker-wrap overflow-hidden" aria-label="Brand highlights">
        <div className="flex items-center">
          <span className="hidden sm:flex shrink-0 items-center gap-1.5 pl-4 lg:pl-8 pr-3 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-gold border-r border-white/10 bg-white/[0.03]">
            <Sparkles className="h-3 w-3" aria-hidden /> Aurexa
          </span>
          <div className="relative flex-1 overflow-hidden py-2" aria-hidden="true">
            <div className="animate-ticker flex w-max items-center gap-8 whitespace-nowrap pl-6">
              {[...tickerItems, ...tickerItems].map((t, i) => (
                <span
                  key={i}
                  className={`inline-flex items-center gap-2 text-[11px] sm:text-[12px] tracking-wide ${
                    t.highlight ? "font-semibold text-gold" : "text-cream/60"
                  }`}
                >
                  <span className={`h-1 w-1 rounded-full shrink-0 ${t.highlight ? "bg-gold" : "bg-gold/40"}`} />
                  {t.text}
                </span>
              ))}
            </div>
          </div>
          <a
            href={telHref}
            className="hidden md:flex shrink-0 items-center gap-2 px-4 lg:px-6 py-2 text-[12px] font-semibold text-cream/85 border-l border-white/10 hover:text-white hover:bg-white/[0.04] transition-colors"
            aria-label={`Call ${s.brandName} — ${s.phone}`}
          >
            <Phone className="h-3.5 w-3.5 text-gold" aria-hidden /> {s.phone}
          </a>
        </div>
      </div>

      {/* ── Main header pill — decorative side lines connect ticker → pill ── */}
      <div className="bg-forest-dark md:bg-transparent">
        <div className="relative max-w-7xl mx-auto px-3 sm:px-4 pt-2 md:pt-4 pb-1">
          <span aria-hidden className="pointer-events-none hidden md:block absolute top-0 bottom-2 left-4 w-px bg-gradient-to-b from-gold/70 via-gold/30 to-transparent" />
          <span aria-hidden className="pointer-events-none hidden md:block absolute top-0 bottom-2 right-4 w-px bg-gradient-to-b from-gold/70 via-gold/30 to-transparent" />

          <div className="rounded-2xl md:rounded-full bg-forest shadow-xl ring-1 ring-white/10">
            <div className="flex items-center justify-between gap-2 h-14 md:h-[68px] pl-3 md:pl-6 pr-3 md:pr-4">

              {/* Logo */}
              <Link href="/" className="flex items-center shrink-0" aria-label={`${s.brandName} — Home`}>
                <Image
                  src={s.logo || "/uploads/aurexa-logo.png"}
                  alt={`${s.brandName} — Epoxy Resin Wholesaler in Surat`}
                  width={520}
                  height={284}
                  priority
                  className="h-9 md:h-11 w-auto object-contain rounded-lg"
                />
              </Link>

              {/* Desktop nav */}
              <nav className="hidden lg:flex items-center gap-0 mx-auto" aria-label="Main navigation">
                {items.map((item) =>
                  item.url === "/sale" ? (
                    <Link
                      key={item.id}
                      href={item.url}
                      className={`ml-1 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold uppercase tracking-wide transition-colors ${
                        isActive(item.url) ? "bg-red-700 text-white" : "bg-red-600 text-white hover:bg-red-700"
                      }`}
                      aria-label={`${item.label} — discounted products`}
                    >
                      <Percent className="h-3.5 w-3.5" aria-hidden />
                      {item.label}
                    </Link>
                  ) : item.children ? (
                    /* ── Categories: hover mega menu ── */
                    <div
                      key={item.id}
                      className="relative"
                      onMouseEnter={() => setMegaOpen(true)}
                      onMouseLeave={() => setMegaOpen(false)}
                    >
                      <Link
                        href={item.url}
                        onClick={() => setMegaOpen(false)}
                        className={`flex items-center gap-1 px-2.5 py-2 rounded-full text-[12px] font-medium uppercase tracking-wide transition-colors ${
                          megaOpen || isActive(item.url)
                            ? "bg-white/15 text-white"
                            : "text-cream/85 hover:bg-white/10 hover:text-white"
                        }`}
                        aria-haspopup="true"
                        aria-expanded={megaOpen}
                      >
                        {item.label}
                        <ChevronDown className={`h-3 w-3 transition-transform ${megaOpen ? "rotate-180" : ""}`} aria-hidden />
                      </Link>

                      {/* Mega panel */}
                      {megaOpen && (
                        <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 z-50">
                          <div className="w-[min(760px,calc(100vw-2rem))] rounded-2xl bg-card text-forest shadow-2xl ring-1 ring-forest/10 overflow-hidden">
                            <div className="grid md:grid-cols-[1fr_240px]">
                              {/* Category grid with images */}
                              <div className="p-4">
                                <div className="flex items-center justify-between mb-2.5">
                                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-forest/60">
                                    Shop by Resin Type
                                  </p>
                                  <span className="text-[11px] text-forest/50">{categories.length} categories</span>
                                </div>
                                <div className="grid grid-cols-2 gap-1">
                                  {megaCategories.map((c) => (
                                    <Link
                                      key={c.slug}
                                      href={`/resin/${c.slug}`}
                                      onClick={() => setMegaOpen(false)}
                                      className="group flex items-center gap-2.5 rounded-lg p-1.5 hover:bg-forest-mist/70 transition-colors"
                                    >
                                      <span className="h-10 w-10 rounded-lg overflow-hidden bg-forest-mist shrink-0 ring-1 ring-forest/10">
                                        {c.image ? (
                                          <img src={c.image} alt="" className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300" loading="lazy" />
                                        ) : (
                                          <span className="h-full w-full hero-dark flex items-center justify-center"><Droplets className="h-4 w-4 text-cream/80" aria-hidden /></span>
                                        )}
                                      </span>
                                      <span className="text-[12.5px] font-medium leading-tight group-hover:text-forest-light transition-colors">
                                        {c.name}
                                      </span>
                                    </Link>
                                  ))}
                                </div>
                                <Link
                                  href="/resin"
                                  onClick={() => setMegaOpen(false)}
                                  className="mt-3 flex items-center justify-center gap-1.5 rounded-lg border border-forest/20 py-2 text-[12.5px] font-semibold text-forest hover:bg-forest hover:text-cream transition-colors"
                                >
                                  View All {categories.length} Categories <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                                </Link>
                              </div>

                              {/* Featured rail — signature grade + brand USPs */}
                              <div className="bg-forest text-cream p-4 flex flex-col gap-3">
                                <div>
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
                                    <Sparkles className="h-3 w-3" aria-hidden /> Signature Grade
                                  </span>
                                  <Link
                                    href={featured ? `/resin/${featured.slug}` : "/resin/crystal-clear-epoxy-resin"}
                                    onClick={() => setMegaOpen(false)}
                                    className="block mt-2 rounded-xl overflow-hidden ring-1 ring-white/15 group"
                                  >
                                    <span className="block aspect-[16/9] overflow-hidden bg-forest-dark">
                                      {featured?.image ? (
                                        <img src={featured.image} alt="Ultra Crystal Clear Epoxy Resin — signature grade" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                                      ) : (
                                        <span className="h-full w-full flex items-center justify-center"><Droplets className="h-6 w-6 text-cream/70" aria-hidden /></span>
                                      )}
                                    </span>
                                    <span className="block p-3">
                                      <span className="block font-display text-[14px] font-bold leading-snug">Ultra Crystal Clear Resin</span>
                                      <span className="block text-[11.5px] text-cream/65 mt-1 leading-relaxed">Our flagship glass-clear grade — bubble free, non-yellowing.</span>
                                      <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-gold mt-1.5">
                                        Explore <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" aria-hidden />
                                      </span>
                                    </span>
                                  </Link>
                                </div>
                                <ul className="space-y-1.5 mt-auto">
                                  {[
                                    { Icon: Droplets, t: "Bubble Free" },
                                    { Icon: Timer, t: "2:1 — 4 Hrs Dry" },
                                    { Icon: Hourglass, t: "3:1 — 10 Hrs Dry" },
                                    { Icon: Leaf, t: "Atmosphere Friendly" },
                                  ].map(({ Icon, t }) => (
                                    <li key={t} className="flex items-center gap-2 text-[11.5px] text-cream/85">
                                      <Icon className="h-3.5 w-3.5 text-gold" aria-hidden /> {t}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      key={item.id}
                      href={item.url}
                      className={`px-2.5 py-2 rounded-full text-[12px] font-medium uppercase tracking-wide transition-colors ${
                        isActive(item.url) ? "bg-white/15 text-white" : "text-cream/85 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ),
                )}
              </nav>

              {/* Action cluster */}
              <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
                {s.headerShowPhone !== "false" && (
                  <a
                    href={telHref}
                    aria-label={`Call ${s.brandName} — ${s.phone}`}
                    className={`${iconBtn} border border-cream/30 text-cream hover:bg-cream hover:text-forest`}
                  >
                    <Phone className="h-4 w-4" aria-hidden />
                  </a>
                )}
                {s.headerShowWhatsApp !== "false" && (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="WhatsApp us"
                    className={`${iconBtn} bg-[#25D366] text-white hover:bg-[#1fb857]`}
                  >
                    <MessageCircle className="h-4 w-4" aria-hidden />
                  </a>
                )}
                {s.headerShowCta !== "false" && (
                  <Button asChild size="sm" className="hidden xl:inline-flex btn-gold rounded-full px-4">
                    <Link href={s.headerCtaUrl || "/inquiry"}>{s.headerCtaLabel || "Send Inquiry"}</Link>
                  </Button>
                )}

                {/* Mobile menu */}
                <Sheet open={open} onOpenChange={setOpen}>
                  <SheetTrigger asChild className="lg:hidden">
                    <button
                      type="button"
                      aria-label="Open menu"
                      className={`${iconBtn} border border-cream/30 text-cream hover:bg-cream hover:text-forest ml-0.5`}
                    >
                      <Menu className="h-5 w-5" aria-hidden />
                    </button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-80 bg-forest-dark text-cream border-l border-white/10 overflow-y-auto p-0">
                    <div className="px-5 pt-6 pb-4 border-b border-white/10">
                      <SheetTitle className="sr-only">{s.brandName} menu</SheetTitle>
                      <Image
                        src={s.logo || "/uploads/aurexa-logo.png"}
                        alt={`${s.brandName} logo`}
                        width={520}
                        height={284}
                        className="h-14 w-auto object-contain"
                      />
                    </div>
                    <nav className="px-3 py-4 flex flex-col gap-0.5" aria-label="Mobile navigation">
                      {items.map((item) =>
                        item.url === "/sale" ? (
                          <Link
                            key={item.id}
                            href={item.url}
                            onClick={() => setOpen(false)}
                            className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-3 py-3 text-sm font-bold uppercase tracking-wide text-white hover:bg-red-700 transition-colors"
                          >
                            <Percent className="h-4 w-4" aria-hidden />
                            {item.label}
                          </Link>
                        ) : (
                          <div key={item.id}>
                            <Link
                              href={item.url}
                              onClick={() => setOpen(false)}
                              className={`block px-3 py-2.5 rounded-lg text-sm font-medium uppercase tracking-wide transition-colors ${
                                isActive(item.url) ? "bg-white/15 text-white" : "text-cream/90 hover:bg-white/10 hover:text-white"
                              }`}
                            >
                              {item.label}
                            </Link>
                            {item.children && (
                              <div className="ml-4 border-l border-white/10 pl-2">
                                {item.children.map((child) => (
                                  <Link
                                    key={child.id}
                                    href={child.url}
                                    onClick={() => setOpen(false)}
                                    className="block px-3 py-2 text-[13px] text-cream/70 hover:text-cream rounded-md"
                                  >
                                    {child.label}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        ),
                      )}
                    </nav>
                    {/* Brand USPs in sheet */}
                    <div className="px-5 pb-2 grid grid-cols-2 gap-1.5">
                      {[
                        { Icon: Droplets, t: "Bubble Free" },
                        { Icon: Leaf, t: "Atmosphere Friendly" },
                        { Icon: Timer, t: "2:1 · 4 Hrs Dry" },
                        { Icon: Hourglass, t: "3:1 · 10 Hrs Dry" },
                      ].map(({ Icon, t }) => (
                        <span key={t} className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.05] px-2.5 py-1.5 text-[10.5px] text-cream/80">
                          <Icon className="h-3 w-3 text-gold" aria-hidden /> {t}
                        </span>
                      ))}
                    </div>
                    <div className="mt-auto px-4 pb-6 pt-4 border-t border-white/10 flex flex-col gap-2">
                      {s.headerShowCta !== "false" && (
                        <Button asChild className="btn-gold w-full rounded-full">
                          <Link href={s.headerCtaUrl || "/inquiry"} onClick={() => setOpen(false)}>
                            {s.headerCtaLabel || "Send Inquiry"}
                          </Link>
                        </Button>
                      )}
                      <div className="grid grid-cols-2 gap-2">
                        <Button asChild variant="outline" className="btn-outline-light w-full rounded-full">
                          <a href={telHref}>
                            <Phone className="h-4 w-4" /> Call
                          </a>
                        </Button>
                        <Button asChild className="w-full rounded-full bg-[#25D366] hover:bg-[#1fb857] text-white border-transparent">
                          <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                            <MessageCircle className="h-4 w-4" /> WhatsApp
                          </a>
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
