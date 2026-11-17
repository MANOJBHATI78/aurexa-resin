"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, History, Undo2, RefreshCw, DatabaseBackup } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface Revision {
  id: string; entityType: string; entityId: string; entityLabel: string;
  action: string; createdBy?: string | null; createdAt: string;
}

const TYPE_LABELS: Record<string, string> = {
  product: "Product", blogPost: "Blog Post", landingPage: "Landing Page",
  page: "Page", category: "Category", locationPage: "Location", application: "Application",
};

const EDIT_URLS: Record<string, string> = {
  product: "/admin/products", blogPost: "/admin/blog", landingPage: "/admin/landing",
  page: "/admin/pages", category: "/admin/categories", locationPage: "/admin/locations",
  application: "/admin/applications",
};

export default function AdminRevisionsPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<Revision[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [confirmItem, setConfirmItem] = useState<Revision | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/revisions");
      const data = await res.json();
      setItems(data.items || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function restore(rev: Revision) {
    setRestoring(rev.id);
    try {
      const res = await fetch("/api/admin/revisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ revisionId: rev.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Restore failed");
      toast({ title: `Restored "${data.restored}"`, description: data.action === "recreated" ? "Deleted record recreated with its original content." : "Content rolled back to the saved snapshot." });
      setConfirmItem(null);
      load();
    } catch (e) {
      toast({ title: e instanceof Error ? e.message : "Restore failed", variant: "destructive" });
    } finally {
      setRestoring(null);
    }
  }

  return (
    <div className="space-y-4 max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-forest">Revision History</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Automatic snapshots saved before every update/delete of products, blogs, landing pages, categories,
            locations and applications. Restore any previous version in one click (last 10 per record).
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={load} aria-label="Refresh"><RefreshCw className="h-4 w-4" /></Button>
      </div>

      <div className="rounded-xl border border-gold/40 bg-gold/5 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-forest flex items-center gap-2"><DatabaseBackup className="h-4 w-4 text-gold-dark" /> Database Backup</p>
            <p className="text-xs text-muted-foreground mt-1">Download a complete JSON snapshot of all content (products, blogs, pages, settings, media files). Save it weekly.</p>
          </div>
          <div className="flex gap-2">
            <a href="/api/admin/backup" download>
              <Button size="sm" className="btn-gold">Download Full Backup</Button>
            </a>
            <a href="/api/admin/backup?media=meta" download>
              <Button size="sm" variant="outline">Content Only (light)</Button>
            </a>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-gold-dark" /></div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <History className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground text-sm">No revisions yet. Snapshots appear automatically when you edit content.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((rev) => (
            <Card key={rev.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-2 p-3.5">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-forest truncate">
                    {rev.entityLabel || "(untitled)"}
                    {rev.action === "delete" && <Badge variant="destructive" className="ml-2 text-[10px]">was deleted</Badge>}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {TYPE_LABELS[rev.entityType] || rev.entityType}
                    {rev.createdBy ? ` · by ${rev.createdBy}` : ""} · {new Date(rev.createdAt).toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {EDIT_URLS[rev.entityType] && (
                    <a href={EDIT_URLS[rev.entityType]} className="text-xs text-muted-foreground hover:text-forest-light hover:underline">open editor</a>
                  )}
                  <Button size="sm" variant="outline" onClick={() => setConfirmItem(rev)}>
                    <Undo2 className="h-3.5 w-3.5" /> Restore
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={Boolean(confirmItem)} onOpenChange={(v) => !v && setConfirmItem(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Restore this version?</DialogTitle>
            <DialogDescription>
              "{confirmItem?.entityLabel}" will be rolled back to its content as of{" "}
              {confirmItem && new Date(confirmItem.createdAt).toLocaleString("en-IN")}.
              {confirmItem?.action === "delete" && " This record was deleted — restoring will recreate it."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmItem(null)}>Cancel</Button>
            <Button className="btn-gold" disabled={restoring !== null} onClick={() => confirmItem && restore(confirmItem)}>
              {restoring ? <Loader2 className="h-4 w-4 animate-spin" /> : <Undo2 className="h-4 w-4" />} Restore
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
