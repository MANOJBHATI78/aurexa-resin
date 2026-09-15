"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, CheckCircle2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const TABS = [
  { value: "general", label: "General" },
  { value: "contact", label: "Contact & Location" },
  { value: "social", label: "Social & Profiles" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "seo", label: "SEO Defaults" },
  { value: "integrations", label: "Integrations" },
  { value: "floating", label: "Floating Buttons" },
];

interface FieldRow {
  key: string;
  label: string;
  type?: "text" | "textarea" | "number";
  hint?: string;
  placeholder?: string;
}

const FIELDS: Record<string, FieldRow[]> = {
  general: [
    { key: "brandName", label: "Brand Name" },
    { key: "tagline", label: "Tagline", hint: "Shown under the logo and in hero text." },
    { key: "shortDescription", label: "Short Description", type: "textarea", hint: "Used in About hero and metadata fallbacks." },
    { key: "businessDescription", label: "Business Description", type: "textarea", hint: "Used in About page and Organization schema." },
    { key: "footerDescription", label: "Footer Description", type: "textarea", rows: 3 },
  ],
  contact: [
    { key: "phone", label: "Phone Number", placeholder: "+91 93164 94976" },
    { key: "whatsappNumber", label: "WhatsApp Number (digits only)", placeholder: "919316494976", hint: "Digits only with country code, no + sign." },
    { key: "email", label: "Email", placeholder: "Leave empty if not available" },
    { key: "addressLine", label: "Address Line", placeholder: "Surat, Gujarat" },
    { key: "city", label: "City" },
    { key: "state", label: "State" },
    { key: "country", label: "Country" },
    { key: "pincode", label: "PIN Code", hint: "Leave empty if not published." },
    { key: "businessHours", label: "Business Hours" },
    { key: "googleMapsUrl", label: "Google Maps Embed URL", hint: "Optional — embeds a map on the Contact page." },
  ],
  social: [
    { key: "googleBusinessProfileUrl", label: "Google Business Profile (GMB) URL", hint: "Shown in footer, contact page, About and Organization schema." },
    { key: "instagramUrl", label: "Instagram URL" },
    { key: "facebookUrl", label: "Facebook URL" },
    { key: "linkedinUrl", label: "LinkedIn URL" },
    { key: "youtubeUrl", label: "YouTube URL" },
    { key: "pinterestUrl", label: "Pinterest URL" },
  ],
  whatsapp: [
    { key: "whatsappDefaultMessage", label: "Default WhatsApp Message", type: "textarea", rows: 2 },
    { key: "whatsappProductTemplate", label: "Product Page Template", type: "textarea", rows: 2, hint: "Use {PRODUCT} — replaced with product name." },
    { key: "whatsappCategoryTemplate", label: "Category Page Template", type: "textarea", rows: 2, hint: "Use {CATEGORY} — replaced with category name." },
  ],
  seo: [
    { key: "siteTitle", label: "Site Title (homepage)", type: "textarea", rows: 2 },
    { key: "siteMetaDescription", label: "Default Meta Description", type: "textarea", rows: 3 },
    { key: "siteKeywords", label: "Default Keywords", type: "textarea", rows: 2 },
    { key: "seoTitleTemplateProduct", label: "Product Title Template", hint: "Use {name}" },
    { key: "seoTitleTemplateCategory", label: "Category Title Template", hint: "Use {name}" },
    { key: "seoTitleTemplateLocation", label: "Location Title Template", hint: "Use {name}" },
    { key: "defaultOgImage", label: "Default OG Image URL" },
    { key: "robotsTxt", label: "Robots.txt Override", type: "textarea", rows: 8, hint: "Leave empty for safe defaults. Always include Sitemap line." },
  ],
  integrations: [
    { key: "ga4Id", label: "Google Analytics 4 — Measurement ID", placeholder: "G-XXXXXXXXXX" },
    { key: "gtmId", label: "Google Tag Manager — Container ID", placeholder: "GTM-XXXXXXX" },
    { key: "gscVerification", label: "Google Search Console — Verification Code", placeholder: "google-site-verification value", hint: "Only the code, not the full meta tag." },
    { key: "clarityId", label: "Microsoft Clarity — Project ID" },
    { key: "metaPixelId", label: "Meta (Facebook) Pixel ID" },
    { key: "customHeadCode", label: "Custom Head Code", type: "textarea", rows: 4, hint: "Raw HTML injected before </head>. Use Custom Code manager for scoped snippets." },
    { key: "customBodyEndCode", label: "Custom Body End Code", type: "textarea", rows: 4 },
    { key: "customGlobalCss", label: "Global Custom CSS", type: "textarea", rows: 4 },
    { key: "customGlobalJs", label: "Global Custom JavaScript", type: "textarea", rows: 4 },
  ],
};

const TOGGLES: Record<string, { key: string; label: string; hint?: string }> = {
  general: [
  ],
  floating: [
    { key: "showWhatsAppFloat", label: "Show WhatsApp floating button" },
    { key: "showCallFloat", label: "Show Call floating button" },
    { key: "showInquiryFloat", label: "Show Inquiry floating button" },
  ],
};

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Record<string, string> | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => setSettings(d.settings))
      .catch(() => toast({ title: "Failed to load settings", variant: "destructive" }));
  }, [toast]);

  if (!settings) {
    return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-gold-dark" /></div>;
  }

  const set = (key: string, value: string) => setSettings((s) => ({ ...(s || {}), [key]: value }));

  async function saveAll() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      toast({ title: "Settings saved", description: "Changes are live across the website." });
    } catch (e) {
      toast({ title: e instanceof Error ? e.message : "Save failed", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  const isOn = (key: string) => settings[key] === "true";

  return (
    <div className="space-y-4 max-w-4xl pb-16">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-forest">Site Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Everything here applies instantly across the website — no code changes needed.
          </p>
        </div>
        <Button onClick={saveAll} disabled={saving} className="btn-gold">
          {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : <><Save className="h-4 w-4" /> Save All Settings</>}
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1">
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value} className="text-xs sm:text-sm">{t.label}</TabsTrigger>
          ))}
        </TabsList>

        {TABS.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="space-y-4 mt-4">
            {tab.value === "integrations" && (
              <Card className="border-gold/40 bg-gold/5">
                <CardContent className="p-4 flex gap-2.5 text-sm">
                  <Info className="h-4 w-4 text-gold-dark shrink-0 mt-0.5" />
                  <p className="text-muted-foreground">
                    Paste your tracking IDs here and they are injected site-wide automatically.
                    Supports GA4, Google Tag Manager, Search Console verification, Microsoft Clarity and Meta Pixel.
                  </p>
                </CardContent>
              </Card>
            )}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="font-display text-lg">{TABS.find((t) => t.value === tab.value)?.label}</CardTitle>
                {tab.value === "social" && (
                  <CardDescription>Only configured platforms appear on the website — leave others empty.</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-3.5">
                {(FIELDS[tab.value] || [])
                  .filter((f) => f.type !== "special")
                  .map((f) => (
                    <div key={f.key} className="space-y-1.5">
                      <Label htmlFor={`set-${f.key}`}>{f.label}</Label>
                      {f.type === "textarea" ? (
                        <Textarea
                          id={`set-${f.key}`}
                          rows={f.rows || 3}
                          value={settings[f.key] ?? ""}
                          placeholder={f.placeholder}
                          onChange={(e) => set(f.key, e.target.value)}
                        />
                      ) : (
                        <Input
                          id={`set-${f.key}`}
                          value={settings[f.key] ?? ""}
                          placeholder={f.placeholder}
                          onChange={(e) => set(f.key, e.target.value)}
                        />
                      )}
                      {f.hint && <p className="text-[11px] text-muted-foreground">{f.hint}</p>}
                    </div>
                  ))}

                {/* Header toggles */}
                {tab.value === "general" && (
                  <ToggleRow
                    label="Show announcement bar"
                    hint="Configurable text below the header."
                    checked={isOn("announcementEnabled")}
                    onChange={(v) => set("announcementEnabled", String(v))}
                  />
                )}

                {/* Floating button toggles + position */}
                {tab.value === "floating" && (
                  <>
                    <div className="space-y-1.5">
                      <Label htmlFor="set-announcementBar">Announcement Bar Text</Label>
                      <Input id="set-announcementBar" value={settings.announcementBar ?? ""} onChange={(e) => set("announcementBar", e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="set-floatPosition">Button Position</Label>
                      <div className="flex gap-2">
                        {["right", "left"].map((pos) => (
                          <Button
                            key={pos}
                            variant={settings.floatPosition === pos ? "default" : "outline"}
                            size="sm"
                            onClick={() => set("floatPosition", pos)}
                            className={settings.floatPosition === pos ? "bg-forest text-cream" : ""}
                          >
                            {pos === "right" ? "Bottom Right" : "Bottom Left"}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="set-headerCtaLabel">Header CTA Label</Label>
                      <Input id="set-headerCtaLabel" value={settings.headerCtaLabel ?? ""} onChange={(e) => set("headerCtaLabel", e.target.value)} />
                    </div>
                  </>
                )}
                {tab.value === "floating" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="set-stickyHeader">Sticky Header</Label>
                    <ToggleRow label="Pin header to top when scrolling" checked={isOn("stickyHeader")} onChange={(v) => set("stickyHeader", String(v))} />
                  </div>
                )}

                {TOGGLES[tab.value]?.map((t) => (
                  <ToggleRow
                    key={t.key}
                    label={t.label}
                    hint={t.hint}
                    checked={isOn(t.key)}
                    onChange={(v) => set(t.key, String(v))}
                  />
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <div className="flex justify-end sticky bottom-4">
        <Button onClick={saveAll} disabled={saving} className="btn-gold shadow-xl">
          {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : <><CheckCircle2 className="h-4 w-4" /> Save All Settings</>}
        </Button>
      </div>
    </div>
  );
}

function ToggleRow({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded-lg border px-3.5 py-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} aria-label={label} />
    </div>
  );
}
