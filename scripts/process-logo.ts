// Process the original Aurexa Resin logo: create a tight crop for header + favicon circle
// We do NOT redesign the logo — only crop the original artwork.
import sharp from "sharp";
import { mkdirSync } from "fs";

const SRC = "/home/z/my-project/upload/pasted_image_1789499407146.png";
const OUT = "/home/z/my-project/public/uploads";
mkdirSync(OUT, { recursive: true });

async function main() {
  const meta = await sharp(SRC).metadata();
  console.log("Original:", meta.width, "x", meta.height);

  // Full original (OG image / hero use)
  await sharp(SRC).png().toFile(`${OUT}/aurexa-logo.png`);

  // Center crop of the full lockup (circle + AUREXA + RESIN) for header/footer use
  const w = meta.width!, h = meta.height!;
  const cropW = Math.round(w * 0.56);
  const cropH = Math.round(h * 0.78);
  const left = Math.round((w - cropW) / 2);
  const top = Math.round(h * 0.08);
  await sharp(SRC)
    .extract({ left, top, width: cropW, height: cropH })
    .png()
    .toFile(`${OUT}/aurexa-logo-crop.png`);

  // Favicon: square crop of the circular drop mark (centered, upper area)
  const favSize = Math.round(h * 0.42);
  const favLeft = Math.round(w / 2 - favSize / 2);
  const favTop = Math.round(h * 0.09);
  await sharp(SRC)
    .extract({ left: favLeft, top: favTop, width: favSize, height: favSize })
    .resize(64, 64)
    .png()
    .toFile(`${OUT}/aurexa-favicon.png`);

  console.log("Logo assets created in", OUT);
}

main().catch((e) => { console.error(e); process.exit(1); });
