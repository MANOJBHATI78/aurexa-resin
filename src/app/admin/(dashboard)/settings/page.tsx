"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Save, CheckCircle2, Info, Upload, ImageIcon, Star } from "lucide-react";
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
  { value: "header", label: "Header & Banner" },
  { value: "contact", label: "Contact & Location" },
  { value: "social", label: "Social & Profiles" },
  { value: "whatsapp", label: "WhatsApp & Lead Gate" },
  { value: "seo", label: "SEO Defaults" },
  { value: "integrations", label: "Integrations" },
  { value: "reviews", label: "Google Reviews" },
  { value: "shopping", label: "Google Shopping" },
  { value: "floating", label: "Floating Buttons" },
];

interface FieldRow {
  key: string;
  label: string;
  type?: "text" | "textarea" | "number";
  hint?: string;
  placeholder?: string;
  rows?: number;
}

const FIELDS: Record<string, FieldRow[]> = {
  general: [
    { key: "brandName", label: "Brand Name" },
    { key: "tagline", label: "Tagline", hint: "Shown under the logo and in hero text." },
    { key: "shortDescription", label: "Short Description", type: "textarea", hint: "Used in About hero and metadata fallbacks." },
    { key: "businessDescription", label: "Business Description", type: "textarea", hint: "Used in About page and Organization schema." },
    { key: "footerDescription", label: "Footer Description", type: "textarea", rows: 3 },
  ],
  header: [
    { key: "headerCtaLabel", label: "Header CTA Button Label", placeholder: "Send Inquiry" },
    { key: "headerCtaUrl", label: "Header CTA Button URL", placeholder: "/inquiry" },
    { key: "announcementBar", label: "Announcement Bar Text", hint: "Thin strip above the header. Hide it with the toggle below." },
    { key: "heroBannerAlt", label: "Banner Image Alt Text (SEO)", type: "textarea", rows: 2, hint: "Describe the banner images for search engines and screen readers." },
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
    { key: "leadGateHeading", label: "Lead Gate — Popup Heading", hint: "Shown when a visitor clicks WhatsApp/Call before the chat opens." },
    { key: "leadGateText", label: "Lead Gate — Popup Text", type: "textarea", rows: 3 },
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
    { key: "ga4Id", label: "Google Analytics 4 — Measurement ID", placeholder: "G-XXXXXXXXXX", hint: "Paste ONLY the ID, or the full gtag snippet — both accepted (ID auto-extracted)." },
    { key: "ga4CustomCode", label: "GA4 — Custom Code (optional, overrides ID)", type: "textarea", rows: 3, hint: "Full <script> tag(s) as-is. If filled, this replaces the auto-built GA4 code above." },
    { key: "gtmId", label: "Google Tag Manager — Container ID", placeholder: "GTM-XXXXXXX", hint: "Paste ONLY the ID, or the full GTM snippet — both accepted. Noscript fallback auto-included." },
    { key: "gtmCustomCode", label: "GTM — Custom Code (optional, overrides ID)", type: "textarea", rows: 3, hint: "Full <script>+<noscript> as-is. If filled, this replaces the ID-based injection." },
    { key: "gscVerification", label: "Google Search Console — Verification", placeholder: "google-site-verification code", hint: "Paste ONLY the code, the full <meta> tag, or the whole HTML — all accepted. Renders in raw view-source." },
    { key: "gscCustomCode", label: "GSC — Custom Code (optional, overrides ID)", type: "textarea", rows: 3, hint: "Alternative method: paste the full verification meta tag / HTML file content marker here." },
    { key: "clarityId", label: "Microsoft Clarity — Project ID", placeholder: "abcdefghij", hint: "Paste ONLY the Project ID or the full Clarity snippet — both accepted." },
    { key: "clarityCustomCode", label: "Clarity — Custom Code (optional, overrides ID)", type: "textarea", rows: 3 },
    { key: "metaPixelId", label: "Meta (Facebook) Pixel ID", placeholder: "1234567890", hint: "Paste ONLY the Pixel ID or the full pixel <script> — both accepted. PageView fires automatically." },
    { key: "metaPixelCustomCode", label: "Meta Pixel — Custom Code (optional, overrides ID)", type: "textarea", rows: 3 },
    { key: "customHeadCode", label: "Custom Head Code (<head>)", type: "textarea", rows: 4, hint: "Raw HTML injected into every page head — visible in view-source." },
    { key: "customBodyStartCode", label: "Custom Body Start Code (top of <body>)", type: "textarea", rows: 4, hint: "Raw HTML injected right after <body> opens — e.g. GTM noscript, widgets." },
    { key: "customBodyEndCode", label: "Custom Body End Code (bottom of <body>)", type: "textarea", rows: 4, hint: "Raw HTML injected before </body> — e.g. chat widgets, closing scripts." },
    { key: "customGlobalCss", label: "Global Custom CSS", type: "textarea", rows: 4, hint: "Injected as a <style> tag on every page." },
    { key: "customGlobalJs", label: "Global Custom JavaScript", type: "textarea", rows: 4, hint: "Injected as a script on every page." },
  ],
  reviews: [
    { key: "googleRating", label: "Google Rating (0–5)", placeholder: "4.9", hint: "Copy the star rating from your Google Business Profile — used in the site badge + search star schema." },
    { key: "googleReviewCount", label: "Google Review Count", placeholder: "132", hint: "Total reviews on your Google Business Profile." },
    { key: "googlePlaceId", label: "Google Place ID", hint: "Find it at gmobility / google.com/maps → your business → Place ID. Needed only for auto-fetch." },
    { key: "googleApiKey", label: "Google Places API Key", hint: "Needed only for auto-fetch. Enable 'Places API' in Google Cloud for this key." },
  ],
  shopping: [
    { key: "shoppingBrand", label: "Feed Brand Name", hint: "Brand shown for every product in the Google Shopping feed." },
    { key: "shoppingCondition", label: "Product Condition", hint: "new / refurbished / used — Google Shopping field. Default: new." },
  ],
  floating: [],
};

// Image upload fields — key → { label, hint, tab }
const IMAGE_FIELDS: Record<string, { tab: string; label: string; hint?: string; preview?: "wide" | "square" }> = {
  logo: { tab: "general", label: "Brand Logo", hint: "Shown in the header, mobile menu and hero. Use the original artwork (PNG with transparent or brand-green background).", preview: "square" },
  favicon: { tab: "general", label: "Favicon", hint: "Small square icon in the browser tab (64×64 PNG recommended).", preview: "square" },
  heroBannerImage: { tab: "header", label: "Hero Banner — Desktop Image", hint: "Optional. Shown on the right side of the homepage hero on desktop. Leave empty to display the brand logo there.", preview: "wide" },
  heroBannerMobileImage: { tab: "header", label: "Hero Banner — Mobile Image", hint: "Shown below the hero text on mobile screens. Recommended size: 1080×1350 (4:5 portrait).", preview: "wide" },
};

const TOGGLES: Record<string, { key: string; label: string; hint?: string }[]> = {
  general: [],
  header: [
    { key: "stickyHeader", label: "Sticky header", hint: "Pin the header to the top while scrolling." },
    { key: "announcementEnabled", label: "Show announcement bar", hint: "Displays the announcement text above the header." },
    { key: "headerShowPhone", label: "Show phone call button", hint: "Round call icon — visible on desktop AND mobile header." },
    { key: "headerShowWhatsApp", label: "Show WhatsApp button", hint: "Round WhatsApp icon — visible on desktop AND mobile header." },
    { key: "headerShowCta", label: "Show header CTA button", hint: "\"Send Inquiry\" pill button on desktop and inside the mobile menu." },
    { key: "heroBannerEnabled", label: "Show hero banner images", hint: "Displays the desktop banner (right side) and the mobile-size banner (below hero text)." },
  ],
  whatsapp: [
    { key: "leadGateEnabled", label: "Lead Gate — capture details on WhatsApp/Call click", hint: "Shows a small name + mobile form before opening WhatsApp or the dialer. Every submission lands in Inquiries LIVE." },
    { key: "leadGateOncePerVisitor", label: "Ask only once per visitor", hint: "Returning clickers go straight to WhatsApp without the form again." },
  ],
  reviews: [
    { key: "googleReviewsEnabled", label: "Show Google Reviews badge", hint: "Displays your Google rating in the hero, footer and star schema in search results." },
  ],
  shopping: [
    { key: "shoppingFeedEnabled", label: "Enable Google Shopping feed", hint: "Publishes /feeds/google-shopping.xml with all priced products for Merchant Center." },
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
  const [fetchingReviews, setFetchingReviews] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

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

  async function handleImageUpload(file: File, key: string) {
    setUploadingKey(key);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/media/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      set(key, data.url);
      toast({ title: "Image uploaded", description: data.url });
    } catch (e) {
      toast({ title: e instanceof Error ? e.message : "Upload failed", variant: "destructive" });
    } finally {
      setUploadingKey(null);
    }
  }

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
      toast({ title: "Settings saved", description: `${data.saved || "All"} settings are live across the website.` });
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
            {tab.value === "header" && (
              <Card className="border-forest/20 bg-forest-mist/50">
                <CardContent className="p-4 flex gap-2.5 text-sm">
                  <Info className="h-4 w-4 text-forest shrink-0 mt-0.5" />
                  <p className="text-muted-foreground">
                    Control everything in the website header from here — phone &amp; WhatsApp round buttons
                    (always visible on mobile), CTA button, announcement bar, sticky behaviour and the
                    homepage hero banners (desktop + mobile-size). Navigation menu items are managed under
                    <span className="font-medium text-forest"> Admin → Navigation</span>.
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
                {(FIELDS[tab.value] || []).map((f) => (
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

                {/* Image upload fields for this tab */}
                {Object.entries(IMAGE_FIELDS)
                  .filter(([, cfg]) => cfg.tab === tab.value)
                  .map(([key, cfg]) => (
                    <div key={key} className="space-y-1.5 rounded-lg border p-3.5">
                      <div className="flex items-center justify-between gap-3">
                        <Label htmlFor={`set-${key}`} className="flex items-center gap-1.5">
                          <ImageIcon className="h-4 w-4 text-muted-foreground" aria-hidden /> {cfg.label}
                        </Label>
                        <input
                          ref={(el) => { fileInputs.current[key] = el; }}
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/svg+xml"
                          className="hidden"
                          aria-hidden
                          onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], key)}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={uploadingKey === key}
                          onClick={() => fileInputs.current[key]?.click()}
                        >
                          {uploadingKey === key ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                          {uploadingKey === key ? "Uploading…" : "Upload"}
                        </Button>
                      </div>
                      <Input
                        id={`set-${key}`}
                        value={settings[key] ?? ""}
                        placeholder="/uploads/… or https://…"
                        onChange={(e) => set(key, e.target.value)}
                      />
                      {cfg.hint && <p className="text-[11px] text-muted-foreground">{cfg.hint}</p>}
                      {settings[key] && (
                        <img
                          src={settings[key]}
                          alt={`${cfg.label} preview`}
                          className={`mt-1 rounded-lg border bg-[repeating-conic-gradient(#f3f3f3_0_25%,#fff_0_50%)] bg-[length:16px_16px] object-contain ${cfg.preview === "square" ? "h-16" : "h-24 w-full"}`}
                        />
                      )}
                    </div>
                  ))}

                {/* Toggles for this tab */}
                {TOGGLES[tab.value]?.map((t) => (
                  <ToggleRow
                    key={t.key}
                    label={t.label}
                    hint={t.hint}
                    checked={isOn(t.key)}
                    onChange={(v) => set(t.key, String(v))}
                  />
                ))}

                {/* Google Reviews — auto-fetch from Places API */}
                {tab.value === "reviews" && (
                  <div className="rounded-lg border border-gold/40 bg-gold/5 p-4 space-y-2.5">
                    <p className="text-sm font-medium text-forest">Auto-fetch from Google</p>
                    <p className="text-[12px] text-muted-foreground">
                      Fill the API Key + Place ID above, then fetch — rating, review count and latest reviews are pulled
                      straight from your Google Business Profile. No API key? Just type the rating and count manually above.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={fetchingReviews}
                      onClick={async () => {
                        setFetchingReviews(true);
                        try {
                          const res = await fetch("/api/admin/google-reviews", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ apiKey: settings.googleApiKey, placeId: settings.googlePlaceId }),
                          });
                          const data = await res.json();
                          if (!res.ok) throw new Error(data.error || "Fetch failed");
                          toast({ title: "Reviews fetched", description: `Rating ${data.rating} from ${data.count} reviews.` });
                          const refreshed = await fetch("/api/admin/settings").then((r) => r.json());
                          setSettings(refreshed.settings);
                        } catch (e) {
                          toast({ title: e instanceof Error ? e.message : "Fetch failed", variant: "destructive" });
                        } finally {
                          setFetchingReviews(false);
                        }
                      }}
                    >
                      {fetchingReviews ? <Loader2 className="h-4 w-4 animate-spin" /> : <Star className="h-4 w-4" />}
                      {fetchingReviews ? "Fetching…" : "Fetch from Google Now"}
                    </Button>
                  </div>
                )}

                {/* Google Shopping — feed URL card */}
                {tab.value === "shopping" && (
                  <div className="rounded-lg border border-forest/20 bg-forest-mist/50 p-4 space-y-2">
                    <p className="text-sm font-medium text-forest">Merchant Center Feed</p>
                    <p className="text-[12px] text-muted-foreground">
                      In Google Merchant Center: Products → Feeds → Add feed → Scheduled fetch, and use this URL.
                      Only products with a price are included — set prices in Admin → Products.
                    </p>
                    <code className="block rounded bg-forest text-cream/90 px-3 py-2 text-[12px] break-all select-all">
                      {typeof window !== "undefined" ? window.location.origin : ""}/feeds/google-shopping.xml
                    </code>
                    <p className="text-[12px] text-muted-foreground">
                      Product schema on every product page also includes the price — so your products appear in
                      Google search rich results and the Shopping tab when brand keywords are searched.
                    </p>
                  </div>
                )}

                {/* Floating button position */}
                {tab.value === "floating" && (
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
                )}
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
