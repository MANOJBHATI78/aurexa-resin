/**
 * Smart tracking-input normalizers.
 * Admins can paste EITHER a bare ID OR the full snippet/URL —
 * we extract the ID automatically so nothing ever "fails to save".
 */

function firstMatch(value: string, patterns: RegExp[]): string {
  for (const re of patterns) {
    const m = value.match(re);
    if (m && m[1]) return m[1].trim();
  }
  return "";
}

/** GSC: accepts bare code, full <meta name="google-site-verification" content="…">, or HTML blob */
export function extractGsc(value: string): string {
  const raw = (value || "").trim();
  if (!raw) return "";
  if (/<meta/i.test(raw) || /content\s*=/i.test(raw)) {
    const fromMeta = firstMatch(raw, [
      /name\s*=\s*["']google-site-verification["'][^>]*content\s*=\s*["']([^"']+)["']/i,
      /content\s*=\s*["']([^"']+)["'][^>]*name\s*=\s*["']google-site-verification["']/i,
    ]);
    if (fromMeta) return fromMeta;
  }
  return raw.replace(/<[^>]*>/g, "").trim() || raw; // strip stray tags
}

/** GA4: G-XXXXXXXXXX from an ID, gtag script, or GTM- style fallbacks ignored */
export function extractGa4(value: string): string {
  return firstMatch(value || "", [/\b(G-[A-Z0-9]{6,14})\b/i]);
}

/** GTM: GTM-XXXXXXX from an ID or snippet */
export function extractGtm(value: string): string {
  return firstMatch(value || "", [/\b(GTM-[A-Z0-9]{4,12})\b/i]);
}

/** Clarity: project ID from bare ID or the clarity.ms/tag/… script */
export function extractClarity(value: string): string {
  return firstMatch(value || "", [
    /clarity\.ms\/tag\/([a-z0-9]+)/i,
    /\b([a-z0-9]{10})\b/i, // Clarity IDs are 10 lowercase alphanumeric chars
  ]);
}

/** Meta Pixel: numeric ID from bare ID or fbq('init','…') snippet */
export function extractPixel(value: string): string {
  return firstMatch(value || "", [
    /fbq\(\s*['"]init['"]\s*,\s*['"](\d{8,20})['"]/i,
    /\b(\d{12,20})\b/,
  ]);
}

export interface NormalizedTracking {
  ga4Id: string;
  gtmId: string;
  gscVerification: string;
  clarityId: string;
  metaPixelId: string;
}

/** Normalize an incoming settings payload (mutates a copy, returns tracking keys) */
export function normalizeTrackingFields(payload: Record<string, string>): Record<string, string> {
  const out = { ...payload };
  if ("ga4Id" in out) out.ga4Id = extractGa4(String(out.ga4Id ?? ""));
  if ("gtmId" in out) out.gtmId = extractGtm(String(out.gtmId ?? ""));
  if ("gscVerification" in out) out.gscVerification = extractGsc(String(out.gscVerification ?? ""));
  if ("clarityId" in out) out.clarityId = extractClarity(String(out.clarityId ?? ""));
  if ("metaPixelId" in out) out.metaPixelId = extractPixel(String(out.metaPixelId ?? ""));
  return out;
}
