/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Generate default mobile-size banner (4:5, 1080x1350) for Aurexa Resin
 * Uses the ORIGINAL logo artwork (no redesign) on a brand forest-green
 * gradient background with a subtle gold frame accent.
 */
const sharp = require("sharp");
const path = require("path");

const SRC = path.join(__dirname, "..", "public", "uploads", "aurexa-logo.png");
const OUT = path.join(__dirname, "..", "public", "uploads", "aurexa-banner-mobile.jpg");

const W = 1080;
const H = 1350;

(async () => {
  // Subtle gradient background (deep forest, barely-differentiated tones)
  const bgSvg = Buffer.from(`
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0" stop-color="#0e4634"/>
          <stop offset="0.55" stop-color="#0b3d2e"/>
          <stop offset="1" stop-color="#072a20"/>
        </linearGradient>
        <radialGradient id="glow" cx="0.5" cy="0.42" r="0.55">
          <stop offset="0" stop-color="#d4af37" stop-opacity="0.10"/>
          <stop offset="1" stop-color="#d4af37" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#g)"/>
      <rect width="${W}" height="${H}" fill="url(#glow)"/>
      <rect x="26" y="26" width="${W - 52}" height="${H - 52}" fill="none"
            stroke="#d4af37" stroke-opacity="0.35" stroke-width="2" rx="28"/>
      <rect x="38" y="38" width="${W - 76}" height="${H - 76}" fill="none"
            stroke="#d4af37" stroke-opacity="0.15" stroke-width="1" rx="22"/>
    </svg>
  `);

  // Original logo, scaled — artwork untouched
  const logo = await sharp(SRC).resize(920, null, { withoutEnlargement: false }).toBuffer();
  const meta = await sharp(logo).metadata();
  const logoW = meta.width;
  const logoH = meta.height;

  const banner = await sharp({
    create: { width: W, height: H, channels: 3, background: "#0b3d2e" },
  })
    .composite([
      { input: bgSvg, top: 0, left: 0 },
      { input: logo, top: Math.round(H * 0.40 - logoH / 2), left: Math.round((W - logoW) / 2) },
    ])
    .jpeg({ quality: 88 })
    .toFile(OUT);

  console.log("Mobile banner created:", OUT, banner.width + "x" + banner.height);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
