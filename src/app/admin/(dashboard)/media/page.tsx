"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Upload, Trash2, Copy, Search, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface MediaItem {
  id: string; filename: string; url: string; mimeType?: string | null; size?: number | null;
  alt?: string | null; title?: string | null; caption?: string | null; description?: string | null;
  folder: string;
}

export default function AdminMediaPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/media");
      const data = await res.json();
      setItems(data.items || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleUpload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("folder", "general");
        const res = await fetch("/api/admin/media/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || `Upload failed for ${file.name}`);
      }
      toast({ title: "Upload complete" });
      load();
    } catch (e) {
      toast({ title: e instanceof Error ? e.message : "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function saveMetadata() {
    if (!selected) return;
    const res = await fetch(`/api/admin/media/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        alt: selected.alt, title: selected.title,
        caption: selected.caption, description: selected.description,
      }),
    });
    if (res.ok) {
      toast({ title: "Image metadata saved" });
      load();
      setSelected(null);
    } else {
      toast({ title: "Save failed", variant: "destructive" });
    }
  }

  async function deleteMedia(id: string) {
    const res = await fetch(`/api/admin/media/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast({ title: "Deleted" });
      load();
    }
  }

  async function copyUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "URL copied" });
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  }

  const filtered = items.filter((i) =>
    !query.trim() ||
    [i.filename, i.alt, i.folder].some((f) => (f || "").toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="space-y-4 max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-forest">Media Library</h1>
          <p className="text-sm text-muted-foreground mt-1">Upload and manage images. Edit alt text for image SEO.</p>
        </div>
        <label className="inline-flex">
          <Button onClick={() => fileRef.current?.click()} disabled={uploading} className="btn-gold">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {uploading ? "Uploading…" : "Upload Images"}
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(e) => handleUpload(e.target.files)}
          />
        </label>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search files…" className="pl-9" />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-gold-dark" /></div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground text-sm">No images yet. Upload product photos, category images and blog images here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filtered.map((m) => (
            <Card key={m.id} className="overflow-hidden card-lift">
              <div className="aspect-square bg-muted">
                { }
                <img src={m.url} alt={m.alt || m.filename} className="w-full h-full object-cover cursor-pointer" onClick={() => setSelected(m)} loading="lazy" />
              </div>
              <CardContent className="p-2.5">
                <p className="text-[11px] font-medium text-forest truncate">{m.filename}</p>
                <div className="flex items-center gap-1 mt-1.5">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyUrl(m.url)} aria-label="Copy URL">
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelected(m)} aria-label="Edit metadata">
                    <Label className="sr-only">Edit</Label>
                    <ImageIcon className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteMedia(m.id)} aria-label="Delete">
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Metadata editor */}
      <Dialog open={Boolean(selected)} onOpenChange={(v) => !v && setSelected(null)}>
        <DialogContent className="max-w-md">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display">Image Details</DialogTitle>
                <DialogDescription>Meaningful filenames and alt text improve image SEO.</DialogDescription>
              </DialogHeader>
              { }
              <img src={selected.url} alt={selected.alt || ""} className="rounded-lg border max-h-56 w-full object-contain bg-muted" />
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <code className="truncate flex-1">{selected.url}</code>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyUrl(selected.url)} aria-label="Copy URL">
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="space-y-1.5">
                  <Label>Alt Text (important for SEO)</Label>
                  <Input value={selected.alt || ""} onChange={(e) => setSelected({ ...selected, alt: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Title</Label>
                  <Input value={selected.title || ""} onChange={(e) => setSelected({ ...selected, title: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Caption</Label>
                  <Input value={selected.caption || ""} onChange={(e) => setSelected({ ...selected, caption: e.target.value })} />
                </div>
                <Button onClick={saveMetadata} className="btn-gold w-full">Save Details</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
