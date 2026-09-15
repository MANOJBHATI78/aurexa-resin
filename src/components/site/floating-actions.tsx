"use client";

import Link from "next/link";
import { MessageCircle, Phone, ClipboardEdit } from "lucide-react";
import { waLink, type SiteSettings } from "@/lib/settings";

/** Floating WhatsApp / Call / Inquiry buttons — controlled from Admin → Settings */
export function FloatingActions({ s }: { s: SiteSettings }) {
  const enabled = s.showWhatsAppFloat === "true" || s.showCallFloat === "true" || s.showInquiryFloat === "true";
  if (!enabled) return null;

  const side = s.floatPosition === "left" ? "left-4" : "right-4";

  return (
    <div className={`fixed bottom-20 md:bottom-6 ${side} z-40 flex flex-col gap-2.5`} aria-label="Quick contact actions">
      {s.showWhatsAppFloat === "true" && (
        <a
          href={waLink(s.whatsappNumber, s.whatsappDefaultMessage)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with Aurexa Resin on WhatsApp"
          className="group flex items-center h-12 w-12 rounded-full bg-[#25D366] text-white shadow-lg hover:scale-105 transition-transform"
        >
          <MessageCircle className="h-6 w-6 mx-auto" />
          <span className="sr-only">WhatsApp</span>
          <span className="hidden md:block max-w-0 overflow-hidden group-hover:max-w-[200px] group-hover:ml-2 group-hover:mr-3 text-sm font-medium whitespace-nowrap transition-all duration-300">
            WhatsApp Us
          </span>
        </a>
      )}
      {s.showCallFloat === "true" && (
        <a
          href={`tel:${s.phone.replace(/\s/g, "")}`}
          aria-label={`Call ${s.brandName}`}
          className="group flex items-center h-12 w-12 rounded-full bg-forest text-gold border border-gold/40 shadow-lg hover:scale-105 transition-transform"
        >
          <Phone className="h-5 w-5 mx-auto" />
          <span className="sr-only">Call</span>
          <span className="hidden md:block max-w-0 overflow-hidden group-hover:max-w-[200px] group-hover:ml-2 group-hover:mr-3 text-sm font-medium whitespace-nowrap transition-all duration-300">
            Call Now
          </span>
        </a>
      )}
      {s.showInquiryFloat === "true" && (
        <Link
          href="/inquiry"
          aria-label="Send an inquiry to Aurexa Resin"
          className="group flex items-center h-12 w-12 rounded-full btn-gold shadow-lg hover:scale-105 transition-transform"
        >
          <ClipboardEdit className="h-5 w-5 mx-auto" />
          <span className="sr-only">Inquiry</span>
          <span className="hidden md:block max-w-0 overflow-hidden group-hover:max-w-[200px] group-hover:ml-2 group-hover:mr-3 text-sm font-semibold whitespace-nowrap transition-all duration-300">
            Inquiry
          </span>
        </Link>
      )}
    </div>
  );
}
