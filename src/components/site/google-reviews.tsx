import Link from "next/link";
import { Star } from "lucide-react";
import { getSettingsCached } from "@/lib/settings";

/**
 * Google Reviews badge — shows the brand's real Google rating & review count.
 * Data is entered (or auto-fetched) in Admin → Settings → Google Reviews.
 * Renders nothing unless enabled with a rating > 0 — never invents numbers.
 */
export async function GoogleReviewsBadge({ variant = "light" }: { variant?: "light" | "dark" }) {
  const s = await getSettingsCached();
  if (s.googleReviewsEnabled !== "true") return null;
  const rating = Number(s.googleRating || 0);
  const count = Number(s.googleReviewCount || 0);
  if (!(rating > 0 && rating <= 5)) return null;

  const url = s.googleBusinessProfileUrl || "";
  const dark = variant === "dark";

  const stars = (
    <span className="flex gap-0.5" aria-label={`Rated ${rating} out of 5 on Google`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i < Math.round(rating) ? "fill-gold text-gold" : dark ? "text-cream/25" : "text-border"}`}
          aria-hidden
        />
      ))}
    </span>
  );

  const content = (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[12px] ${
        dark ? "border-white/25 bg-white/[0.06] text-cream/85" : "border-forest/20 bg-card text-forest"
      }`}
    >
      {/* Google "G" mark */}
      <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden>
        <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.57 5.57 0 0 1-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A11.99 11.99 0 0 0 12 24z" />
        <path fill="#FBBC05" d="M5.27 14.29A7.2 7.2 0 0 1 4.89 12c0-.8.14-1.57.38-2.29V6.62H1.29a12 12 0 0 0 0 10.76l3.98-3.09z" />
        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42A11.98 11.98 0 0 0 12 0 11.99 11.99 0 0 0 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z" />
      </svg>
      {stars}
      <span className="font-semibold">{rating.toFixed(1)}</span>
      {count > 0 && <span className={dark ? "text-cream/60" : "text-muted-foreground"}>· {count}+ Google reviews</span>}
    </span>
  );

  if (url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" aria-label="See our Google reviews" className="inline-flex">
        {content}
      </a>
    );
  }
  return <Link href="/testimonials" aria-label="Customer reviews" className="inline-flex">{content}</Link>;
}
