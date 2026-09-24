"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Loader2, X } from "lucide-react";

/**
 * LeadGate — captures lead details before WhatsApp / Call clicks.
 *
 * Mounted once in the site layout. A global click listener intercepts every
 * WhatsApp (wa.me / api.whatsapp.com) and tel: link site-wide — header, footer,
 * floating buttons, product pages, sale page — no per-component wiring needed.
 *
 * Flow: click → modal (name + mobile) → saved as Inquiry (source WHATSAPP/CALL)
 * → original action proceeds (WhatsApp opens / dialer opens).
 *
 * If the visitor already submitted once (stored locally), later clicks go
 * straight through — no repeated friction.
 */

interface GateProps {
  enabled: boolean;
  heading: string;
  text: string;
  oncePerVisitor: boolean;
}

const STORAGE_KEY = "aurexa_lead";

export function LeadGate({ enabled, heading, text, oncePerVisitor }: GateProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [kind, setKind] = useState<"WHATSAPP" | "CALL">("WHATSAPP");
  const pendingHref = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const isWhatsApp = (href: string) => /wa\.me\/|api\.whatsapp\.com|whatsapp:\/\//i.test(href);

    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.button !== 0) return;
      const anchor = (e.target as HTMLElement | null)?.closest?.("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href") || "";
      if (!href) return;

      let kind: "WHATSAPP" | "CALL" | null = null;
      if (isWhatsApp(href)) kind = "WHATSAPP";
      else if (href.toLowerCase().startsWith("tel:")) kind = "CALL";
      if (!kind) return;

      const alreadyCaptured = oncePerVisitor && localStorage.getItem(STORAGE_KEY) === "1";
      if (alreadyCaptured) return; // straight through — no friction

      e.preventDefault();
      e.stopPropagation();
      pendingHref.current = href;
      setKind(kind);
      setOpen(true);
    }

    // Capture phase — runs before other handlers
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [enabled, oncePerVisitor]);

  async function proceed() {
    setError("");
    const digits = mobile.replace(/\D/g, "");
    if (name.trim().length < 2) {
      setError("Please enter your name.");
      return;
    }
    if (digits.length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setBusy(true);
    try {
      await fetch("/api/lead-capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          mobile: digits,
          kind,
          page: window.location.pathname,
          referrer: document.referrer || "",
        }),
      });
    } catch {
      // Never block the customer — lead save failure still proceeds to WhatsApp
    }
    localStorage.setItem(STORAGE_KEY, "1");
    sessionStorage.setItem("aurexa_lead_name", name.trim());
    setBusy(false);
    setOpen(false);
    const href = pendingHref.current;
    if (href) {
      if (href.toLowerCase().startsWith("tel:")) {
        window.location.href = href;
      } else {
        window.open(href, "_blank", "noopener,noreferrer");
      }
    }
  }

  if (!enabled) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 transition-opacity ${
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Contact details"
      style={{ background: "rgba(4, 24, 18, 0.72)", backdropFilter: "blur(3px)" }}
      onClick={(e) => e.target === e.currentTarget && undefined} // backdrop click does NOT dismiss — small friction, more leads
    >
      <div className="w-full max-w-sm rounded-2xl bg-card shadow-2xl border overflow-hidden translate-y-0">
        <div className="hero-dark text-cream px-5 py-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="h-10 w-10 rounded-full bg-[#25D366] flex items-center justify-center shrink-0">
              <MessageCircle className="h-5 w-5 text-white" aria-hidden />
            </span>
            <div>
              <p className="font-display font-bold text-[15px] leading-snug">{heading || "Before you continue…"}</p>
              <p className="text-[11px] text-cream/60 uppercase tracking-[0.18em] mt-0.5">
                {kind === "CALL" ? "Call Aurexa Resin" : "WhatsApp Aurexa Resin"}
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close"
            className="text-cream/60 hover:text-cream"
            onClick={() => setOpen(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5 space-y-3.5">
          <p className="text-[13px] text-muted-foreground leading-relaxed">{text}</p>
          <input
            className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm"
            placeholder="Your name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            aria-label="Your name"
          />
          <input
            className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm"
            placeholder="Mobile number * (10 digits)"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            inputMode="numeric"
            autoComplete="tel"
            aria-label="Mobile number"
            onKeyDown={(e) => e.key === "Enter" && proceed()}
          />
          {error && <p className="text-[12.5px] text-red-600 font-medium">{error}</p>}
          <button
            type="button"
            onClick={proceed}
            disabled={busy}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] hover:bg-[#1fb857] text-white font-semibold text-sm py-2.5 transition-colors disabled:opacity-70"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageCircle className="h-4 w-4" />}
            Continue to {kind === "CALL" ? "Call" : "WhatsApp"}
          </button>
          <p className="text-[11px] text-muted-foreground text-center">
            Your details help us respond faster with wholesale prices.
          </p>
        </div>
      </div>
    </div>
  );
}
