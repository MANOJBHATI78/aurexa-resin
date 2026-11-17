import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const DEFAULT_ROBOTS = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/
Allow: /api/media/

Sitemap: ${SITE_URL}/sitemap.xml
`;

interface RobotsRule {
  userAgent: string;
  allow?: string[];
  disallow?: string[];
}

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
    // /api/media/ stays crawlable — Google Images must index DB-served uploads
    // even though /api/ is disallowed (longer-match Allow wins in robots rules)
    rules: rules.length
      ? rules
      : [
          { userAgent: "*", allow: ["/", "/api/media/"], disallow: ["/admin", "/api/"] },
        ],
    sitemap: sitemapMatch.length ? sitemapMatch : [`${SITE_URL}/sitemap.xml`],
  };
}

/** Parses a robots.txt body into grouped rules; supports multiple Allow lines */
function parseRobots(body: string): RobotsRule[] {
  const rules: RobotsRule[] = [];
  let current: RobotsRule | null = null;
  for (const line of body.split("\n")) {
    const clean = line.trim();
    if (!clean || clean.startsWith("#")) continue;
    const [rawKey, ...rest] = clean.split(":");
    const key = rawKey.trim().toLowerCase();
    const value = rest.join(":").trim();
    if (!value) continue;
    if (key === "user-agent") {
      if (current) rules.push(current);
      current = { userAgent: value, allow: [], disallow: [] };
    } else if (current) {
      if (key === "allow") current.allow!.push(value);
      else if (key === "disallow") current.disallow!.push(value);
    }
  }
  if (current) rules.push(current);
  return rules;
}
