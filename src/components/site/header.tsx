"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, Phone, MessageCircle, ChevronDown, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet, SheetContent, SheetTrigger, SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { waLink, type SiteSettings } from "@/lib/settings";

interface NavItem {
  id: string;
  label: string;
  url: string;
  children?: { id: string; label: string; url: string }[];
}

export function SiteHeader({ s, nav, categories }: { s: SiteSettings; nav: NavItem[]; categories: { name: string; slug: string }[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const whatsappHref = waLink(s.whatsappNumber, s.whatsappDefaultMessage);
  const telHref = `tel:${s.phone.replace(/\s/g, "")}`;

  // Build nav: only the Categories item (/resin) gets a dropdown of categories
  const items = nav.map((item) => {
    if (item.url === "/resin") {
      return {
        ...item,
        children: categories.slice(0, 12).map((c) => ({
          id: c.slug,
          label: c.name,
          url: `/resin/${c.slug}`,
        })),
      };
    }
    return item;
  });

  const isActive = (url: string) =>
    url === "/" ? pathname === "/" : pathname.startsWith(url);

  // Round icon button — always visible (desktop + mobile), teapost.in style
  const iconBtn =
    "inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/50";

  return (
    <header className={s.stickyHeader === "true" ? "sticky top-0 z-50" : "relative z-50"}>
      {/* Announcement bar — full-width horizontal line */}
      {s.announcementEnabled === "true" && s.announcementBar && (
        <div className="bg-forest-dark text-cream/85 text-[11px] sm:text-[13px] text-center px-4 py-2 border-b border-white/10">
          <span className="inline-flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-gold inline-block shrink-0" aria-hidden />
            {s.announcementBar}
          </span>
        </div>
      )}

      {/* Header container with decorative vertical side lines (connect top line → header, both sides) */}
      <div className="bg-forest-dark md:bg-transparent">
        <div className="relative max-w-7xl mx-auto px-3 sm:px-4 pt-2 md:pt-4 pb-1">
          {/* Vertical top-to-bottom lines — left & right */}
          <span aria-hidden className="pointer-events-none hidden md:block absolute top-0 bottom-2 left-4 w-px bg-gradient-to-b from-gold/60 via-gold/25 to-transparent" />
          <span aria-hidden className="pointer-events-none hidden md:block absolute top-0 bottom-2 right-4 w-px bg-gradient-to-b from-gold/60 via-gold/25 to-transparent" />

          <div className="rounded-2xl md:rounded-full bg-forest shadow-xl ring-1 ring-white/10">
            <div className="flex items-center justify-between gap-2 h-14 md:h-[68px] pl-3 md:pl-6 pr-3 md:pr-4">

              {/* Logo — original Aurexa Resin artwork, uncropped */}
              <Link
                href="/"
                className="flex items-center shrink-0"
                aria-label={`${s.brandName} — Home`}
              >
                <Image
                  src={s.logo || "/uploads/aurexa-logo.png"}
                  alt={`${s.brandName} — Epoxy Resin Wholesaler in Surat`}
                  width={520}
                  height={284}
                  priority
                  className="h-9 md:h-11 w-auto object-contain rounded-lg"
                />
              </Link>

              {/* Desktop nav — full menu, compact for 8 items */}
              <nav className="hidden lg:flex items-center gap-0 mx-auto" aria-label="Main navigation">
                {items.map((item) =>
                  item.url === "/sale" ? (
                    <Link
                      key={item.id}
                      href={item.url}
                      className={`ml-1 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold uppercase tracking-wide transition-colors ${
                        isActive(item.url)
                          ? "bg-red-700 text-white"
                          : "bg-red-600 text-white hover:bg-red-700"
                      }`}
                      aria-label={`${item.label} — discounted products`}
                    >
                      <Percent className="h-3.5 w-3.5" aria-hidden />
                      {item.label}
                    </Link>
                  ) : item.children ? (
                    <DropdownMenu key={item.id}>
                      <DropdownMenuTrigger asChild>
                        <Link
                          href={item.url}
                          className={`flex items-center gap-1 px-2.5 py-2 rounded-full text-[12px] font-medium uppercase tracking-wide transition-colors ${
                            isActive(item.url)
                              ? "bg-white/15 text-white"
                              : "text-cream/85 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          {item.label}
                          <ChevronDown className="h-3 w-3" aria-hidden />
                        </Link>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-64 max-h-96 overflow-y-auto rounded-xl border-forest/10">
                        {item.children.map((child) => (
                          <DropdownMenuItem key={child.id} asChild>
                            <Link href={child.url} className="cursor-pointer text-forest hover:text-forest">
                              {child.label}
                            </Link>
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuItem asChild>
                          <Link href={item.url} className="cursor-pointer font-semibold text-forest">
                            View All →
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Link
                      key={item.id}
                      href={item.url}
                      className={`px-2.5 py-2 rounded-full text-[12px] font-medium uppercase tracking-wide transition-colors ${
                        isActive(item.url)
                          ? "bg-white/15 text-white"
                          : "text-cream/85 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {item.label}
                    </Link>
                  )
                )}
              </nav>

              {/* Action cluster — icons visible on ALL screen sizes */}
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
                  <Button
                    asChild
                    size="sm"
                    className="hidden xl:inline-flex btn-gold rounded-full px-4"
                  >
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
                        )
                      )}
                    </nav>
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
