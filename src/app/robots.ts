import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const DEFAULT_ROBOTS = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: ${SITE_URL}/sitemap.xml
`;

export default async function robots(): Promise<MetadataRoute.Robots> {
  let body = DEFAULT_ROBOTS;
  try {
    const setting = await db.siteSetting.findUnique({ where: { key: "robotsTxt" } });
    if (setting?.value?.trim()) body = setting.value;
  } catch {
    // fall back to defaults
  }

  const rules = parseRobots(body);
  const sitemapMatch = body.match(/Sitemap:\s*(\S+)/g)?.map((l) => l.replace(/Sitemap:\s*/, "")) || [];

  return {
    rules: rules.length ? rules : [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] }],
    sitemap: sitemapMatch.length ? sitemapMatch : [`${SITE_URL}/sitemap.xml`],
  };
}

function parseRobots(body: string): MetadataRoute.Robots["rules"] {
  const rules: { userAgent: string; allow?: string; disallow?: string[] }[] = [];
  let current: { userAgent: string; allow?: string; disallow: string[] } | null = null;
  for (const line of body.split("\n")) {
    const clean = line.trim();
    if (!clean || clean.startsWith("#")) continue;
    const [rawKey, ...rest] = clean.split(":");
    const key = rawKey.trim().toLowerCase();
    const value = rest.join(":").trim();
    if (key === "user-agent") {
      if (current) rules.push(current);
      current = { userAgent: value, disallow: [] };
    } else if (current) {
      if (key === "allow") current.allow = value;
      else if (key === "disallow") current.disallow.push(value);
    }
  }
  if (current) rules.push(current);
  return rules as MetadataRoute.Robots["rules"];
}
