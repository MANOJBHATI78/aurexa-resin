"use client";

import { useEffect, useMemo, useState } from "react";
import { Send, MessageCircle, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { waLink, type SiteSettings } from "@/lib/settings";

const COUNTRY_CODES = [
  { code: "+91", label: "India (+91)" },
  { code: "+971", label: "UAE (+971)" },
  { code: "+966", label: "Saudi Arabia (+966)" },
  { code: "+965", label: "Kuwait (+965)" },
  { code: "+973", label: "Bahrain (+973)" },
  { code: "+974", label: "Qatar (+974)" },
  { code: "+968", label: "Oman (+968)" },
  { code: "+44", label: "UK (+44)" },
  { code: "+1", label: "USA / Canada (+1)" },
  { code: "+61", label: "Australia (+61)" },
  { code: "+65", label: "Singapore (+65)" },
  { code: "+60", label: "Malaysia (+60)" },
  { code: "+49", label: "Germany (+49)" },
  { code: "+33", label: "France (+33)" },
  { code: "+27", label: "South Africa (+27)" },
  { code: "+234", label: "Nigeria (+234)" },
  { code: "+94", label: "Sri Lanka (+94)" },
  { code: "+880", label: "Bangladesh (+880)" },
  { code: "+977", label: "Nepal (+977)" },
  { code: "+20", label: "Egypt (+20)" },
  { code: "+7", label: "Russia (+7)" },
  { code: "+86", label: "China (+86)" },
  { code: "+81", label: "Japan (+81)" },
  { code: "+82", label: "South Korea (+82)" },
  { code: "+55", label: "Brazil (+55)" },
  { code: "+52", label: "Mexico (+52)" },
];

const COUNTRIES = [
  "India", "United Arab Emirates", "Saudi Arabia", "United States", "United Kingdom",
  "Australia", "Canada", "Singapore", "Malaysia", "Qatar", "Kuwait", "Oman", "Bahrain",
  "Germany", "France", "Netherlands", "South Africa", "Nigeria", "Kenya", "Sri Lanka",
  "Bangladesh", "Nepal", "Other",
];

const RESIN_TYPES = [
  "Clear / Crystal Clear Epoxy", "Art Epoxy Resin", "Casting Epoxy Resin",
  "Table Top Epoxy Resin", "Deep Pour / River Table Epoxy", "Jewellery Epoxy Resin",
  "Coating / Laminating Epoxy", "Industrial Epoxy Resin", "Craft Epoxy Resin",
  "Woodworking Epoxy Resin", "Not sure — need guidance",
];

const QUANTITIES = [
  "Below 1 kg", "1 kg – 5 kg", "5 kg – 20 kg", "20 kg – 50 kg",
  "50 kg – 100 kg", "100 kg+ (Bulk / Wholesale)", "Need guidance",
];

const APPLICATIONS = [
  "Resin Art", "Jewellery Making", "Table Tops & Counters", "River Tables",
  "Woodworking", "Coating & Sealing", "Casting & Mould Making", "Craft / DIY",
  "Industrial Application", "Reselling / Trading", "Other",
];

interface Props {
  s: SiteSettings;
  defaultProduct?: string;
  compact?: boolean;
  sourcePage?: string;
}

export function InquiryForm({ s, defaultProduct, compact, sourcePage }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [submittedName, setSubmittedName] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", countryCode: "+91", mobile: "", city: "", country: "India",
    email: "", product: defaultProduct || "", resinType: "", quantity: "",
    application: "", message: "", hp_field: "",
  });

  // ---- UTM / attribution capture ----
  const attribution = useMemo(() => ({} as Record<string, string>), []);
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];
      let landing = sessionStorage.getItem("aurexa_landing") || "";
      if (!landing) {
        landing = window.location.href;
        sessionStorage.setItem("aurexa_landing", landing);
      }
      attribution.landingPage = landing;
      attribution.currentUrl = window.location.href;
      attribution.referrer = document.referrer || "";
      attribution.device = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? "Mobile" : "Desktop";
      utmKeys.forEach((k) => { const v = params.get(k); if (v) attribution[k] = v; });
    } catch { /* attribution is best-effort */ }
  }, [attribution]);

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Validation
    if (!form.name.trim()) return setError("Please enter your name.");
    const digits = form.mobile.replace(/[^0-9]/g, "");
    if (digits.length < 7 || digits.length > 12) return setError("Please enter a valid mobile number.");
    if (!form.city.trim()) return setError("Please enter your city.");
    if (!form.country.trim()) return setError("Please select your country.");

    setSubmitting(true);
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          mobile: digits,
          sourcePage: sourcePage || attribution.currentUrl || "/",
          ...attribution,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      setSubmittedName(form.name.trim());
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    const waMsg = `Hello ${s.brandName}, I just submitted an inquiry on your website. My name is ${submittedName}.`;
    return (
      <div className="rounded-xl border border-forest/25 bg-gradient-to-b from-forest-mist to-transparent p-8 text-center" role="status">
        <CheckCircle2 className="h-14 w-14 mx-auto text-forest-light" aria-hidden />
        <h3 className="font-display text-xl font-bold text-forest mt-4">
          Thank You{submittedName ? `, ${submittedName.split(" ")[0]}` : ""}!
        </h3>
        <p className="text-muted-foreground mt-2 max-w-md mx-auto text-[15px] leading-relaxed">
          Your inquiry has been received. Our team will contact you shortly during business hours.
          For a faster response, continue the conversation on WhatsApp.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
          <Button asChild className="bg-[#25D366] hover:bg-[#1fb857] text-white font-semibold">
            <a href={waLink(s.whatsappNumber, waMsg)} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4" /> Continue on WhatsApp
            </a>
          </Button>
          <Button asChild variant="outline" className="border-forest/30 text-forest hover:bg-forest hover:text-cream">
            <a href={`tel:${s.phone.replace(/\s/g, "")}`}>Call {s.phone}</a>
          </Button>
        </div>
      </div>
    );
  }

  const gridCls = compact ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2";

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Honeypot — hidden from humans */}
      <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="hp_field">Leave this field empty</label>
        <input tabIndex={-1} autoComplete="off" id="hp_field" name="hp_field" value={form.hp_field} onChange={(e) => set("hp_field", e.target.value)} />
      </div>

      <div className={`grid gap-4 ${gridCls}`}>
        <div className="space-y-1.5">
          <Label htmlFor="inq-name">Name <span className="text-destructive">*</span></Label>
          <Input id="inq-name" placeholder="Your full name" value={form.name} onChange={(e) => set("name", e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="inq-mobile">Mobile Number <span className="text-destructive">*</span></Label>
          <div className="flex gap-2">
            <Select value={form.countryCode} onValueChange={(v) => set("countryCode", v)}>
              <SelectTrigger className="w-[120px] shrink-0" aria-label="Country code">
                <SelectValue placeholder="+91" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {COUNTRY_CODES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input id="inq-mobile" type="tel" inputMode="numeric" placeholder="Mobile number" value={form.mobile} onChange={(e) => set("mobile", e.target.value)} required className="flex-1" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="inq-city">City <span className="text-destructive">*</span></Label>
          <Input id="inq-city" placeholder="Your city" value={form.city} onChange={(e) => set("city", e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="inq-country">Country <span className="text-destructive">*</span></Label>
          <Select value={form.country} onValueChange={(v) => set("country", v)}>
            <SelectTrigger id="inq-country" aria-label="Country">
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {COUNTRIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className={`grid gap-4 ${gridCls}`}>
        <div className="space-y-1.5">
          <Label htmlFor="inq-email">Email (optional)</Label>
          <Input id="inq-email" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => set("email", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="inq-product">Product (optional)</Label>
          <Input id="inq-product" placeholder="e.g. Crystal Clear Epoxy Resin" value={form.product} onChange={(e) => set("product", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Resin Type (optional)</Label>
          <Select value={form.resinType} onValueChange={(v) => set("resinType", v)}>
            <SelectTrigger aria-label="Resin type"><SelectValue placeholder="Select resin type" /></SelectTrigger>
            <SelectContent className="max-h-72">
              {RESIN_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Quantity Requirement (optional)</Label>
          <Select value={form.quantity} onValueChange={(v) => set("quantity", v)}>
            <SelectTrigger aria-label="Quantity"><SelectValue placeholder="Select quantity" /></SelectTrigger>
            <SelectContent className="max-h-72">
              {QUANTITIES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label>Application (optional)</Label>
          <Select value={form.application} onValueChange={(v) => set("application", v)}>
            <SelectTrigger aria-label="Application"><SelectValue placeholder="What will you use the resin for?" /></SelectTrigger>
            <SelectContent className="max-h-72">
              {APPLICATIONS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="inq-message">Message (optional)</Label>
        <Textarea id="inq-message" rows={compact ? 3 : 4} placeholder="Tell us about your requirement — project type, pack sizes, regular volumes…" value={form.message} onChange={(e) => set("message", e.target.value)} />
      </div>

      {error && (
        <p className="text-destructive text-sm font-medium" role="alert">{error}</p>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <Button type="submit" disabled={submitting} className="btn-gold flex-1 sm:flex-none sm:px-8">
          {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</> : <><Send className="h-4 w-4" /> Send Inquiry</>}
        </Button>
        <Button type="button" variant="outline" asChild className="border-[#25D366] text-[#128C4B] hover:bg-[#25D366] hover:text-white">
          <a href={waLink(s.whatsappNumber, s.whatsappDefaultMessage)} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-4 w-4" /> WhatsApp Instead
          </a>
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        By submitting, you agree to be contacted about your inquiry. We respect your privacy — see our{" "}
        <a href="/p/privacy-policy" className="underline underline-offset-2 hover:text-forest-light">Privacy Policy</a>.
      </p>
    </form>
  );
}
