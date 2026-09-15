import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { db } from "@/lib/db";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";
import { slugify } from "@/lib/seo";

export const runtime = "nodejs";

const ALLOWED_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

export async function POST(req: NextRequest) {
  return requireAdmin(req, async () => {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const folder = String(form.get("folder") || "general");
    const alt = String(form.get("alt") || "");

    if (!file) return NextResponse.json({ error: "No file provided." }, { status: 400 });

    const ext = ALLOWED_MIME[file.type];
    if (!ext) return NextResponse.json({ error: "Unsupported file type. Use JPG, PNG, WebP, GIF or SVG." }, { status: 400 });
    if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "File too large (max 10 MB)." }, { status: 400 });

    const bytes = Buffer.from(await file.arrayBuffer());

    // Meaningful filename from original name (no IMG1234 style)
    const baseName = slugify(file.name.replace(/\.[^.]+$/, "")) || "image";
    const filename = `${baseName}-${randomBytes(4).toString("hex")}.${ext}`;
    const dir = path.join(process.cwd(), "public", "uploads", folder);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), bytes);

    const url = `/uploads/${folder}/${filename}`;
    const media = await db.media.create({
      data: {
        filename,
        url,
        mimeType: file.type,
        size: file.size,
        alt: alt || baseName.replace(/-/g, " "),
        folder,
      },
    });
    return NextResponse.json({ item: media });
  });
}
