"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package, FolderTree, BookOpen, Megaphone, Inbox, FileText, Globe,
  CheckCircle2, AlertTriangle, Loader2, ArrowRight, ImageIcon, MapPin,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface StatsData {
  stats: {
    products: number; categories: number; blogs: number; landings: number;
    pages: number; locations: number; apps: number; inquiries: number;
    media: number; published: number; drafts: number; newInquiries: number;
  };
  seo: { score: number; checks: { label: string; count: number; ok: boolean }[] };
  recentInquiries: { id: string; name: string; city: string; mobile: string; product?: string; status: string; createdAt: string }[];
  recentProducts: { id: string; name: string; slug: string; published: boolean }[];
  recentBlogs: { id: string; title: string; slug: string; published: boolean }[];
}

export default function AdminDashboard() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-gold-dark" />
      </div>
    );
  }
  if (!data) return <p className="text-muted-foreground">Could not load dashboard.</p>;

  const cards = [
    { label: "Products", value: data.stats.products, icon: Package, href: "/admin/products" },
    { label: "Categories", value: data.stats.categories, icon: FolderTree, href: "/admin/categories" },
    { label: "Blog Posts", value: data.stats.blogs, icon: BookOpen, href: "/admin/blog" },
    { label: "Landing Pages", value: data.stats.landings, icon: Megaphone, href: "/admin/landing" },
    { label: "Inquiries", value: data.stats.inquiries, icon: Inbox, href: "/admin/inquiries", highlight: data.stats.newInquiries > 0 },
    { label: "Pages", value: data.stats.pages, icon: FileText, href: "/admin/pages" },
    { label: "Locations", value: data.stats.locations, icon: MapPin, href: "/admin/locations" },
    { label: "Media Files", value: data.stats.media, icon: ImageIcon, href: "/admin/media" },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-forest">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of your website content, leads and SEO health.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cards.map(({ label, value, icon: Icon, href, highlight }) => (
          <Link key={label} href={href}>
            <Card className={`card-lift h-full ${highlight ? "border-gold" : ""}`}>
              <CardContent className="p-4 flex items-center gap-3">
                <span className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${highlight ? "gold-gradient-bg" : "bg-forest-mist"}`}>
                  <Icon className={`h-5 w-5 ${highlight ? "text-forest-dark" : "text-forest"}`} />
                </span>
                <div className="min-w-0">
                  <p className="text-2xl font-bold text-forest leading-none">{value}</p>
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {label}
                    {highlight ? ` · ${data.stats.newInquiries} new` : ""}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* SEO health */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-lg flex items-center justify-between">
              SEO Health
              <Badge className={data.seo.score >= 80 ? "bg-forest text-cream" : "bg-gold text-forest-dark"}>
                Score: {data.seo.score}/100
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {data.seo.checks.map((check) => (
              <div key={check.label} className="flex items-center gap-2.5 text-sm">
                {check.ok ? (
                  <CheckCircle2 className="h-4 w-4 text-green-700 shrink-0" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-gold-dark shrink-0" />
                )}
                <span className="text-muted-foreground">{check.label}</span>
                {check.count > 0 && (
                  <Badge variant="outline" className="ml-auto">{check.count}</Badge>
                )}
              </div>
            ))}
            <p className="text-xs text-muted-foreground pt-2 border-t mt-3">
              Technical SEO — sitemap, robots, schema and tracking — is managed under{" "}
              <Link href="/admin/settings" className="text-gold-dark underline">Settings</Link> and{" "}
              <Link href="/admin/custom-code" className="text-gold-dark underline">Custom Code</Link>.
            </p>
          </CardContent>
        </Card>

        {/* Recent inquiries */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-lg flex items-center justify-between">
              Recent Inquiries
              <Button asChild variant="ghost" size="sm" className="text-gold-dark">
                <Link href="/admin/inquiries">View all <ArrowRight className="h-3.5 w-3.5" /></Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentInquiries.length ? (
              <div className="divide-y">
                {data.recentInquiries.map((inq) => (
                  <div key={inq.id} className="py-2.5 flex items-center gap-3 text-sm">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-forest truncate">{inq.name} · {inq.city}</p>
                      <p className="text-xs text-muted-foreground truncate">{inq.product || "General inquiry"} — {inq.mobile}</p>
                    </div>
                    <Badge variant="outline" className="shrink-0 text-[10px]">{inq.status}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">No inquiries yet. Share your website to start collecting leads.</p>
            )}
          </CardContent>
        </Card>

        {/* Recent products */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-lg">Recently Updated Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {data.recentProducts.map((p) => (
                <div key={p.id} className="py-2.5 flex items-center gap-3 text-sm">
                  <span className="min-w-0 flex-1 truncate text-forest">{p.name}</span>
                  <Badge className={p.published ? "bg-forest text-cream text-[10px]" : "bg-muted text-muted-foreground text-[10px]"}>
                    {p.published ? "Published" : "Draft"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent blogs */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-lg">Recently Updated Blogs</CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentBlogs.length ? (
              <div className="divide-y">
                {data.recentBlogs.map((b) => (
                  <div key={b.id} className="py-2.5 flex items-center gap-3 text-sm">
                    <span className="min-w-0 flex-1 truncate text-forest">{b.title}</span>
                    <Badge className={b.published ? "bg-forest text-cream text-[10px]" : "bg-muted text-muted-foreground text-[10px]"}>
                      {b.published ? "Published" : "Draft"}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">No blog posts yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Integration status */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-lg">Integration Status</CardTitle>
        </CardHeader>
        <CardContent>
          <IntegrationStatus />
        </CardContent>
      </Card>
    </div>
  );
}

function IntegrationStatus() {
  const [settings, setSettings] = useState<Record<string, string> | null>(null);
  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => setSettings(d.settings))
      .catch(() => setSettings({}));
  }, []);

  if (!settings) return <Loader2 className="h-5 w-5 animate-spin text-gold-dark" />;

  const integrations = [
    { label: "Google Analytics (GA4)", key: "ga4Id", placeholder: "G-XXXXXXXXXX" },
    { label: "Google Tag Manager", key: "gtmId", placeholder: "GTM-XXXXXXX" },
    { label: "Google Search Console", key: "gscVerification", placeholder: "verification meta tag" },
    { label: "Microsoft Clarity", key: "clarityId", placeholder: "Project ID" },
    { label: "Meta Pixel", key: "metaPixelId", placeholder: "Pixel ID" },
    { label: "Google Business Profile", key: "googleBusinessProfileUrl", placeholder: "Profile URL" },
  ];

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {integrations.map(({ label, key, placeholder }) => {
        const configured = Boolean(settings[key]);
        return (
          <div key={key} className="rounded-lg border p-3.5 flex items-start gap-2.5">
            {configured ? (
              <CheckCircle2 className="h-5 w-5 text-green-700 shrink-0 mt-0.5" />
            ) : (
              <Globe className="h-5 w-5 text-muted-foreground/40 shrink-0 mt-0.5" />
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium text-forest">{label}</p>
              <p className="text-xs text-muted-foreground truncate">
                {configured ? (settings[key] as string) : `Not configured — add ${placeholder} in Settings → Integrations`}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
