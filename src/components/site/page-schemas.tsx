import { db } from "@/lib/db";

/**
 * Server component — renders admin-managed per-page schema / head code.
 * Matches the concrete page path against exact entries ("/", "/resin")
 * and wildcard patterns ("/products/*", "/blog/*").
 * Raw output → visible in view-source (Google reads it directly).
 */
export async function PageSchemas({ path }: { path: string }) {
  let items: { id: string; code: string; kind: string }[] = [];
  try {
    const rows = await db.pageSchema.findMany({ where: { enabled: true } });
    items = rows
      .filter((r) => {
        const p = r.path.trim();
        if (!p) return false;
        if (p.endsWith("/*")) return path.startsWith(p.slice(0, -1)); // keep the trailing slash
        if (p.endsWith("*")) return path.startsWith(p.slice(0, -1));
        return p === path;
      })
      .map((r) => ({ id: r.id, code: r.code, kind: r.kind }));
  } catch {
    return null;
  }
  if (!items.length) return null;
  return (
    <>
      {items.map((item) =>
        item.kind === "RAW_HEAD" ? (
          <div key={item.id} dangerouslySetInnerHTML={{ __html: item.code }} />
        ) : (
          // SCHEMA — accept either a raw <script> tag or bare JSON
          item.code.trim().toLowerCase().startsWith("<script") ? (
            <div key={item.id} dangerouslySetInnerHTML={{ __html: item.code }} />
          ) : (
            <script
              key={item.id}
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: item.code }}
            />
          )
        ),
      )}
    </>
  );
}
