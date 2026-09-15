"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, Phone, MessageCircle, ChevronDown } from "lucide-react";
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

  // Build nav: Products item gets a dropdown of categories
  const items = nav.map((item) => {
    if (item.url === "/products" || item.url === "/resin") {
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

  return (
    <header className={s.stickyHeader === "true" ? "sticky top-0 z-50" : "relative z-50"}>
      {/* Announcement bar */}
      {s.announcementEnabled === "true" && s.announcementBar && (
        <div className="bg-forest-dark text-cream/90 text-xs sm:text-[13px] text-center px-4 py-2 border-b border-gold/20">
          <span className="inline-flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-gold inline-block" aria-hidden />
            {s.announcementBar}
          </span>
        </div>
      )}

      <div className="hero-dark text-cream shadow-lg">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16 md:h-20 gap-4">
          {/* Logo — original Aurexa Resin artwork */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0" aria-label={`${s.brandName} — Home`}>
            <Image
              src={s.logo || "/uploads/aurexa-logo-crop.png"}
              alt={`${s.brandName} — Epoxy Resin Wholesaler in Surat`}
              width={64}
              height={64}
              priority
              className="h-11 w-11 md:h-12 md:w-12 object-cover rounded-full border border-gold/40"
            />
            <span className="leading-tight">
              <span className="font-display block text-base md:text-lg font-bold tracking-wide gold-gradient-text">
                {s.brandName}
              </span>
              <span className="block text-[10px] md:text-[11px] tracking-[0.22em] text-cream/60 uppercase">
                Epoxy Resin · Surat
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
            {items.map((item) =>
              item.children ? (
                <DropdownMenu key={item.id}>
                  <DropdownMenuTrigger asChild>
                    <Link
                      href={item.url}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 hover:text-gold ${isActive(item.url) ? "text-gold" : "text-cream/85"}`}
                    >
                      {item.label}
                      <ChevronDown className="h-3.5 w-3.5" />
                    </Link>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-64 max-h-96 overflow-y-auto">
                    {item.children.map((child) => (
                      <DropdownMenuItem key={child.id} asChild>
                        <Link href={child.url} className="cursor-pointer">{child.label}</Link>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuItem asChild>
                      <Link href={item.url} className="cursor-pointer font-semibold text-gold-dark">
                        View All →
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  key={item.id}
                  href={item.url}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors hover:text-gold ${isActive(item.url) ? "text-gold" : "text-cream/85"}`}
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" asChild className="btn-outline-light border-cream/40 text-cream hover:text-gold">
              <a href={`tel:${s.phone.replace(/\s/g, "")}`} aria-label={`Call ${s.brandName}`}>
                <Phone className="h-4 w-4" /> {s.phone}
              </a>
            </Button>
            <Button size="sm" asChild className="btn-gold">
              <Link href={s.headerCtaUrl || "/inquiry"}>{s.headerCtaLabel || "Send Inquiry"}</Link>
            </Button>
          </div>

          {/* Mobile menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="text-cream hover:text-gold" aria-label="Open menu">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-forest-dark text-cream border-l border-gold/30 overflow-y-auto">
              <SheetTitle className="font-display gold-gradient-text text-lg">{s.brandName}</SheetTitle>
              <nav className="mt-4 flex flex-col gap-1" aria-label="Mobile navigation">
                {items.map((item) => (
                  <div key={item.id}>
                    <Link
                      href={item.url}
                      onClick={() => setOpen(false)}
                      className={`block px-3 py-2.5 rounded-md text-[15px] font-medium hover:bg-white/5 ${isActive(item.url) ? "text-gold" : "text-cream/90"}`}
                    >
                      {item.label}
                    </Link>
                    {item.children && (
                      <div className="ml-4 border-l border-gold/20 pl-2">
                        {item.children.map((child) => (
                          <Link
                            key={child.id}
                            href={child.url}
                            onClick={() => setOpen(false)}
                            className="block px-3 py-1.5 text-sm text-cream/70 hover:text-gold rounded-md"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
              <div className="mt-6 flex flex-col gap-2 border-t border-gold/20 pt-4">
                <Button asChild className="btn-gold w-full">
                  <Link href="/inquiry" onClick={() => setOpen(false)}>Send Inquiry</Link>
                </Button>
                <Button asChild variant="outline" className="btn-outline-light w-full">
                  <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-4 w-4" /> WhatsApp Us
                  </a>
                </Button>
                <Button asChild variant="outline" className="btn-outline-light w-full">
                  <a href={`tel:${s.phone.replace(/\s/g, "")}`}>
                    <Phone className="h-4 w-4" /> {s.phone}
                  </a>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
