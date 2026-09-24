/**
 * Server-side settings loader (uses the database).
 * Types/defaults/helpers live in "./settings-shared" (browser-safe) —
 * client components must import from there, never from this file.
 */
import { db } from "@/lib/db";
import { DEFAULT_SETTINGS, type SiteSettings, waLink } from "./settings-shared";

export type { SiteSettings };
export { DEFAULT_SETTINGS, waLink };

export async function getSettings(): Promise<SiteSettings> {
  try {
    const rows = await db.siteSetting.findMany();
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    return { ...DEFAULT_SETTINGS, ...map } as SiteSettings;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

// Cached for public page rendering — invalidated by admin updates via revalidation calls
let cache: { data: SiteSettings; ts: number } | null = null;
const TTL = 30_000;

export async function getSettingsCached(): Promise<SiteSettings> {
  if (cache && Date.now() - cache.ts < TTL) return cache.data;
  const data = await getSettings();
  cache = { data, ts: Date.now() };
  return data;
}

export function invalidateSettingsCache() {
  cache = null;
}

export async function saveSettings(partial: Partial<Record<keyof SiteSettings, string>>) {
  for (const [key, value] of Object.entries(partial)) {
    await db.siteSetting.upsert({
      where: { key },
      update: { value: value ?? "" },
      create: { key, value: value ?? "" },
    });
  }
  invalidateSettingsCache();
}
