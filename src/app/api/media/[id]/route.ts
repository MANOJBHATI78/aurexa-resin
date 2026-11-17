import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

/**
 * Public media server — returns uploaded file bytes stored in the Media table.
 * URLs look like /api/media/<id> and are unique per upload, so responses are
 * cached immutably by browsers and CDNs.
 */
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  // Basic shape guard (cuid-ish); avoids useless DB hits for junk paths
  if (!/^[a-z0-9]{8,40}$/i.test(id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const media = await db.media.findUnique({
    where: { id },
    select: { id: true, filename: true, url: true, mimeType: true, data: true },
  });

  if (!media || !media.data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const etag = `"${media.id}"`;
  if (req.headers.get("if-none-match") === etag) {
    return new NextResponse(null, { status: 304, headers: { ETag: etag } });
  }

  const buffer = Buffer.from(media.data, "base64");
  const mime = media.mimeType || "application/octet-stream";

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": mime,
      "Content-Length": String(buffer.length),
      "Cache-Control": "public, max-age=31536000, immutable",
      ETag: etag,
      "Content-Disposition": `inline; filename="${media.filename}"`,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
