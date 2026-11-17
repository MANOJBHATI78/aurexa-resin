import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { db } from "@/lib/db";
import { ensureMediaData } from "@/lib/lazy-migrate";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Media upload — stores the file INSIDE the database (Media.data, base64).
 *
 * Why DB storage? On Netlify the filesystem is ephemeral/read-only for static
 * serving, so files written to public/uploads at runtime would never be served.
 * Storing in the database (local SQLite / production Turso) + serving via the
 * public route /api/media/[id] works identically in dev and production.
 *
 * Features:
 *  - Images are auto-converted to WebP (quality 82) and downscaled to max
 *    1920px width — smaller files, faster pages, less DB storage.
 *  - Videos and PDFs are stored as-is.
 *  - replaceId: re-upload into an EXISTING media row (same id/URL) so all
 *    existing website links keep working (media replacement).
 *
 * Limits: images ≤ 10 MB (pre-conversion), videos/PDFs ≤ 4 MB — stays safely
 * under Netlify's 6 MB request-body limit after multipart/base64 overhead.
 */

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB (pre-WebP)
const MAX_RAW_BYTES = 4 * 1024 * 1024;    // 4 MB (videos / PDFs)
const MAX_STORED_BYTES = 6 * 1024 * 1024; // post-conversion guard
const MAX_WIDTH = 1920;

const ALLOWED_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
  "application/pdf": ".pdf",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/quicktime": ".mov",
};

function sanitizeFilename(raw: string, ext: string): string {
  const base = raw
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  return `${base || "file"}-${Date.now().toString(36)}${ext}`;
}

export async function POST(req: NextRequest) {
  return requireAdmin(req, async () => {
    let form: FormData;
    try {
      form = await req.formData();
    } catch {
      return NextResponse.json({ error: "Invalid form data. Please try again." }, { status: 400 });
    }

    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file received. Please select a file." }, { status: 400 });
    }
    const replaceId = (form.get("replaceId") as string) || "";

    const mimeType = (file.type || "").toLowerCase();
    if (!ALLOWED_MIME[mimeType]) {
      return NextResponse.json(
        { error: `Unsupported file type "${mimeType || "unknown"}". Allowed: JPG, PNG, WebP, GIF, AVIF, PDF, MP4, WebM, MOV.` },
        { status: 400 }
      );
    }

    const isImage = mimeType.startsWith("image/") && mimeType !== "image/svg+xml";
    const limit = isImage ? MAX_IMAGE_BYTES : MAX_RAW_BYTES;
    if (file.size > limit) {
      return NextResponse.json(
        { error: `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is ${limit / 1024 / 1024} MB. For bigger videos use a YouTube link instead.` },
        { status: 400 }
      );
    }

    await ensureMediaData();

    let bytes: Buffer<ArrayBufferLike> = Buffer.from(await file.arrayBuffer());
    let finalMime = mimeType;
    let finalExt = ALLOWED_MIME[mimeType];

    // ---------- Image optimization: convert to WebP + downscale ----------
    if (isImage && mimeType !== "image/gif") {
      // GIF stays as-is (animation would be lost)
      try {
        const sharp = (await import("sharp")).default;
        const pipeline = sharp(bytes).rotate(); // respect EXIF orientation
        const meta = await pipeline.metadata();
        if (meta.width && meta.width > MAX_WIDTH) {
          pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });
        }
        const webp = await pipeline.webp({ quality: 82 }).toBuffer();
        if (webp.length <= bytes.length) {
          bytes = webp;
          finalMime = "image/webp";
          finalExt = ".webp";
        }
      } catch (err) {
        console.error("WebP conversion failed — storing original:", err);
      }
    }

    if (bytes.length > MAX_STORED_BYTES) {
      return NextResponse.json(
        { error: `Processed file still too large (${(bytes.length / 1024 / 1024).toFixed(1)} MB). Try a smaller file.` },
        { status: 400 }
      );
    }

    const b64 = bytes.toString("base64");
    const folder = String(form.get("folder") || "general").slice(0, 40) || "general";

    // ---------- Replace existing media (keep id + URL, links never break) ----------
    if (replaceId) {
      const existing = await db.media.findUnique({ where: { id: replaceId }, select: { id: true, url: true } });
      if (!existing) {
        return NextResponse.json({ error: "Media to replace not found." }, { status: 404 });
      }
      const filename = sanitizeFilename(file.name || `file${finalExt}`, finalExt);
      const updated = await db.media.update({
        where: { id: replaceId },
        data: { filename, mimeType: finalMime, size: bytes.length, data: b64 },
      });
      const item = {
        id: updated.id, filename, url: updated.url, mimeType: finalMime,
        size: bytes.length, folder: updated.folder,
        alt: updated.alt, title: updated.title, caption: updated.caption, description: updated.description,
      };
      return NextResponse.json({ ok: true, url: updated.url, item, replaced: true });
    }

    // ---------- New media row ----------
    const filename = sanitizeFilename(file.name || `upload${finalExt}`, finalExt);
    const tempUrl = `pending:${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const created = await db.media.create({
      data: {
        filename,
        url: tempUrl,
        mimeType: finalMime,
        size: bytes.length,
        data: b64,
        folder,
      },
    });
    const publicUrl = `/api/media/${created.id}`;
    await db.media.update({ where: { id: created.id }, data: { url: publicUrl } });

    const item = {
      id: created.id,
      filename,
      url: publicUrl,
      mimeType: finalMime,
      size: bytes.length,
      folder,
      alt: null,
      title: null,
      caption: null,
      description: null,
    };

    // Response covers every caller:
    //  - media library page  (checks ok, then reloads)
    //  - settings page       (uses data.url)
    //  - resource-manager    (uses data.item.url)
    return NextResponse.json({ ok: true, url: publicUrl, item });
  });
}
