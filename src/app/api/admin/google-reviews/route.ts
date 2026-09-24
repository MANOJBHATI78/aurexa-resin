import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { db } from "@/lib/db";

export const runtime = "nodejs";

/**
 * Fetch live Google reviews via the Places API.
 * Admin enters: Google API Key + Place ID (Settings → Google Reviews → Fetch).
 * Saves: rating, review count, and the latest reviews (JSON) — used by the
 * Google Reviews badge on the site and the AggregateRating in Organization schema.
 */
export async function POST(req: NextRequest) {
  return requireAdmin(req, async () => {
    const body = await req.json().catch(() => ({}));
    const apiKey = String(body.apiKey || "").trim();
    const placeId = String(body.placeId || "").trim();

    if (!apiKey || !placeId) {
      return NextResponse.json(
        { error: "Google API Key and Place ID are both required to fetch reviews." },
        { status: 400 },
      );
    }

    const fields = "rating,user_ratings_total,reviews";
    let res: Response;
    try {
      res = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=${fields}&key=${encodeURIComponent(apiKey)}`,
        { cache: "no-store" },
      );
    } catch {
      return NextResponse.json({ error: "Could not reach Google Places API." }, { status: 502 });
    }

    const data = await res.json();
    if (data.status !== "OK" || !data.result) {
      const reason =
        data.status === "REQUEST_DENIED"
          ? "API key rejected — enable Places API for this key."
          : data.status === "INVALID_REQUEST"
            ? "Invalid Place ID."
            : data.status || "Unknown Google API error.";
      return NextResponse.json({ error: `Google API: ${reason}` }, { status: 400 });
    }

    const { rating, user_ratings_total, reviews } = data.result;
    const slim = Array.isArray(reviews)
      ? reviews.slice(0, 8).map((r: { author_name?: string; rating?: number; text?: string; relative_time_description?: string }) => ({
          name: r.author_name,
          rating: r.rating,
          text: r.text,
          when: r.relative_time_description,
        }))
      : [];

    const save = async (key: string, value: string) =>
      db.siteSetting.upsert({ where: { key }, update: { value }, create: { key, value } });

    if (typeof rating === "number") await save("googleRating", rating.toFixed(1));
    if (typeof user_ratings_total === "number") await save("googleReviewCount", String(user_ratings_total));
    await save("googleReviewsData", JSON.stringify(slim));

    return NextResponse.json({
      ok: true,
      rating,
      count: user_ratings_total,
      reviewsFetched: slim.length,
    });
  });
}
