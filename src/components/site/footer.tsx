import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin, Clock, MessageCircle, Instagram, Facebook, Linkedin, Youtube, Globe, ExternalLink } from "lucide-react";
import { getSettingsCached, waLink } from "@/lib/settings";
import { db } from "@/lib/db";

export async function SiteFooter() {
  const s = await getSettingsCached();
  const [quickNav, categories, legalPages] = await Promise.all([
    db.navigationItem.findMany({
      where: { location: "FOOTER_QUICK", enabled: true, parentId: null },
      orderBy: { order: "asc" },
    }),
    db.category.findMany({
      where: { published: true },
      orderBy: { order: "asc" },
      take: 8,
      select: { name: true, slug: true },
    }),
    db.page.findMany({
      where: { published: true, showInFooter: true },
      orderBy: { sortOrder: "asc" },
      select: { title: true, slug: true },
    }),
  ]);

  const socials = [
    { url: s.instagramUrl, label: "Instagram", Icon: Instagram },
    { url: s.facebookUrl, label: "Facebook", Icon: Facebook },
    { url: s.linkedinUrl, label: "LinkedIn", Icon: Linkedin },
    { url: s.youtubeUrl, label: "YouTube", Icon: Youtube },
    { url: s.googleBusinessProfileUrl, label: "Google Business Profile", Icon: Globe },
  ].filter((x) => x.url);

  return (
    <footer className="mt-auto hero-dark text-cream/80 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-12 lg:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12">
          {/* Brand */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3 mb-4">
              <Image
                src={s.logo || "/uploads/aurexa-logo.png"}
                alt={`${s.brandName} logo`}
                width={56}
                height={56}
                className="h-14 w-auto object-contain rounded-lg"
              />
              <div>
                <p className="font-display text-lg font-bold text-cream">{s.brandName}</p>
                <p className="text-xs tracking-[0.2em] uppercase text-cream/50">Epoxy Resin · Surat</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-cream/65">{s.footerDescription}</p>
            {socials.length > 0 && (
              <div className="flex items-center gap-2 mt-5">
                {socials.map(({ url, label, Icon }) => (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${s.brandName} on ${label}`}
                    title={label}
                    className="h-9 w-9 rounded-full border border-cream/25 flex items-center justify-center text-cream/80 hover:bg-cream hover:text-forest-dark transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick links */}
          <div className="lg:col-span-2">
            <h3 className="font-display text-sm font-semibold tracking-widest uppercase text-cream/90 mb-4">Quick Links</h3>
            <ul className="space-y-2.5 text-sm">
              {quickNav.map((item) => (
                <li key={item.id}>
                  <Link href={item.url} className="hover:text-cream transition-colors">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className="lg:col-span-3">
            <h3 className="font-display text-sm font-semibold tracking-widest uppercase text-cream/90 mb-4">Resin Categories</h3>
            <ul className="space-y-2.5 text-sm">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link href={`/resin/${c.slug}`} className="hover:text-cream transition-colors">{c.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-3">
            <h3 className="font-display text-sm font-semibold tracking-widest uppercase text-cream/90 mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <Phone className="h-4 w-4 mt-0.5 text-cream/60 shrink-0" />
                <a href={`tel:${s.phone.replace(/\s/g, "")}`} className="hover:text-cream">{s.phone}</a>
              </li>
              <li className="flex items-start gap-2.5">
                <MessageCircle className="h-4 w-4 mt-0.5 text-cream/60 shrink-0" />
                <a href={waLink(s.whatsappNumber, s.whatsappDefaultMessage)} target="_blank" rel="noopener noreferrer" className="hover:text-cream">
                  WhatsApp: {s.phone}
                </a>
              </li>
              {s.email && (
                <li className="flex items-start gap-2.5">
                  <Mail className="h-4 w-4 mt-0.5 text-cream/60 shrink-0" />
                  <a href={`mailto:${s.email}`} className="hover:text-cream break-all">{s.email}</a>
                </li>
              )}
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 mt-0.5 text-cream/60 shrink-0" />
                <span>{[s.addressLine, s.city, s.state, s.country].filter(Boolean).join(", ")}{s.pincode ? ` - ${s.pincode}` : ""}</span>
              </li>
              {s.businessHours && (
                <li className="flex items-start gap-2.5">
                  <Clock className="h-4 w-4 mt-0.5 text-cream/60 shrink-0" />
                  <span>{s.businessHours}</span>
                </li>
              )}
            </ul>
            {s.googleBusinessProfileUrl && (
              <a
                href={s.googleBusinessProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-4 text-xs text-cream/70 hover:text-cream underline underline-offset-4"
              >
                Find us on Google <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>

        {/* SEO keyword line — focus + supporting search terms */}
        <p className="mt-8 text-[11.5px] leading-relaxed text-cream/40">
          Aurexa Resin — ultra crystal clear resin · crystal clear epoxy resin · 2:1 resin (4 hrs dry) · 3:1 resin
          (10 hrs dry) · epoxy resin wholesale · resin wholesaler · resin manufacturer · resin supplier · resin
          exporter · B2B bulk supplier · bubble free resin · atmosphere friendly resin — Surat, Gujarat, India.
        </p>

        {/* Bottom bar */}
        <div className="mt-6 pt-6 border-t border-cream/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-cream/50">
          <p>© {new Date().getFullYear()} {s.brandName}. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            {legalPages.map((p) => (
              <Link key={p.slug} href={`/p/${p.slug}`} className="hover:text-cream transition-colors">
                {p.title}
              </Link>
            ))}
            <Link href="/sitemap.xml" className="hover:text-cream transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
