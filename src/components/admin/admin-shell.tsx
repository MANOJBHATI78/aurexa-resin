"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Package, FolderTree, FileText, Image as ImageIcon,
  MessageSquareQuote, HelpCircle, Star, Inbox, Globe, Link2, Code2,
  PanelTop, Menu, LogOut, Settings, Megaphone, BookOpen, MapPin, Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

const NAV_GROUPS: { label: string; items: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }[] }[] = [
  {
    label: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/categories", label: "Categories", icon: FolderTree },
      { href: "/admin/applications", label: "Applications", icon: Layers, },
      { href: "/admin/blog", label: "Blog Posts", icon: BookOpen },
      { href: "/admin/pages", label: "Pages", icon: FileText },
      { href: "/admin/faqs", label: "FAQs", icon: HelpCircle },
      { href: "/admin/testimonials", label: "Testimonials", icon: Star },
    ],
  },
  {
    label: "Leads",
    items: [{ href: "/admin/inquiries", label: "Inquiries", icon: Inbox }],
  },
  {
    label: "SEO",
    items: [
      { href: "/admin/landing", label: "Landing Pages", icon: Megaphone },
      { href: "/admin/locations", label: "Locations", icon: MapPin },
      { href: "/admin/redirects", label: "Redirects", icon: Link2 },
      { href: "/admin/custom-code", label: "Custom Code", icon: Code2 },
    ],
  },
  {
    label: "Design",
    items: [
      { href: "/admin/sections", label: "Homepage Sections", icon: PanelTop },
      { href: "/admin/navigation", label: "Header & Footer", icon: Menu },
      { href: "/admin/media", label: "Media Library", icon: ImageIcon },
    ],
  },
  {
    label: "Settings",
    items: [{ href: "/admin/settings", label: "Site Settings", icon: Settings }],
  },
];


export function AdminShell({ children, user }: { children: React.ReactNode; user: { name: string; email: string; role: string } }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const nav = (
    <nav className="flex flex-col gap-5 py-4 px-3 flex-1 overflow-y-auto">
      {NAV_GROUPS.map((group) => (
        <div key={group.label}>
          <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-muted-foreground px-3 mb-1.5">{group.label}</p>
          <div className="flex flex-col gap-0.5">
            {group.items.map(({ href, label, icon: Icon }) => {
              const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active ? "bg-forest text-cream" : "text-foreground/70 hover:bg-muted hover:text-forest"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-forest text-cream border-b border-gold/30">
        <div className="h-14 px-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" className="text-cream hover:text-gold" aria-label="Admin menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0 bg-card">
                <SheetTitle className="sr-only">Admin navigation</SheetTitle>
                {nav}
              </SheetContent>
            </Sheet>
            <Link href="/admin" className="font-display font-bold tracking-wide gold-gradient-text">
              Aurexa CMS
            </Link>
            <span className="hidden md:inline text-xs text-cream/50 border-l border-cream/20 pl-3">
              {user.name} · {user.role}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="text-cream/80 hover:text-gold hidden sm:inline-flex">
              <Link href="/" target="_blank">View Site</Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={logout} className="text-cream/80 hover:text-gold">
              <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-60 shrink-0 border-r bg-card">
          <div className="sticky top-14 h-[calc(100vh-3.5rem)] flex flex-col">{nav}</div>
        </aside>

        <main className="flex-1 min-w-0 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
