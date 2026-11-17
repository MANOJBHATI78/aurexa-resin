"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Upload, Trash2, Copy, Search, Image as ImageIcon, Film, FileText, Replace } from "lucide-react";
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

// Same limits as the upload API (images are auto-converted to WebP server-side)
const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB pre-conversion
const MAX_RAW_BYTES = 4 * 1024 * 1024; // 4 MB for videos / PDFs
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif", "application/pdf", "video/mp4", "video/webm", "video/quicktime"];

function isVideo(m: MediaItem) {
  return (m.mimeType || "").startsWith("video/") || /\.(mp4|webm|mov)(\?|$)/i.test(m.url || "");
}

function isPdf(m: MediaItem) {
  return m.mimeType === "application/pdf" || /\.pdf(\?|$)/i.test(m.url || "");
}

function formatSize(bytes?: number | null) {
  if (!bytes || bytes <= 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function AdminMediaPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const replaceRef = useRef<HTMLInputElement>(null);

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
    const errors: string[] = [];
    try {
      for (const file of Array.from(files)) {
        // Client-side validation — mirrors the API so users get instant feedback
        if (!ACCEPTED_TYPES.includes(file.type)) {
          errors.push(`${file.name}: unsupported format (use JPG, PNG, WebP, GIF, AVIF, PDF, MP4, WebM or MOV)`);
          continue;
        }
        const isImg = file.type.startsWith("image/");
        const max = isImg ? MAX_IMAGE_BYTES : MAX_RAW_BYTES;
        if (file.size > max) {
          errors.push(`${file.name}: too large (${formatSize(file.size)}). Max ${isImg ? "10 MB (images are auto-optimized to WebP)" : "4 MB"}. Bigger videos ke liye YouTube link use karein.`);
          continue;
        }
        const fd = new FormData();
        fd.append("file", file);
        fd.append("folder", "general");
        const res = await fetch("/api/admin/media/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) errors.push(`${file.name}: ${data.error || "upload failed"}`);
      }
      if (errors.length) {
        toast({ title: "Some files failed", description: errors.join(" \u2022 "), variant: "destructive" });
      } else {
        toast({ title: "Upload complete" });
      }
      load();
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function replaceMedia(file: File | undefined) {
    if (!file || !selected) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast({ title: "Unsupported format", variant: "destructive" });
      return;
    }
    const isImg = file.type.startsWith("image/");
    if (file.size > (isImg ? MAX_IMAGE_BYTES : MAX_RAW_BYTES)) {
      toast({ title: `Too large (max ${isImg ? "10 MB" : "4 MB"})`, variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("replaceId", selected.id);
      const res = await fetch("/api/admin/media/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Replace failed");
      toast({ title: "File replaced", description: "Same URL — all website links still work." });
      setSelected(null);
      load();
    } catch (e) {
      toast({ title: e instanceof Error ? e.message : "Replace failed", variant: "destructive" });
    } finally {
      setUploading(false);
      if (replaceRef.current) replaceRef.current.value = "";
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
    <div
      className={`space-y-4 max-w-6xl rounded-xl transition-colors ${dragging ? "ring-2 ring-gold bg-gold/5" : ""}`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={(e) => { if (e.currentTarget === e.target) setDragging(false); }}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        if (e.dataTransfer.files?.length) handleUpload(e.dataTransfer.files);
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-forest">Media Library</h1>
          <p className="text-sm text-muted-foreground mt-1">Drag & drop photos / videos / PDFs anywhere here, or use the button. Images auto-convert to fast-loading WebP.</p>
        </div>
        <label className="inline-flex">
          <Button onClick={() => fileRef.current?.click()} disabled={uploading} className="btn-gold">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {uploading ? "Uploading…" : "Upload Media"}
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif,application/pdf,video/mp4,video/webm,video/quicktime"
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
            <Upload className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground text-sm">Drag & drop photos, videos and PDFs here — or click "Upload Media" above.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filtered.map((m) => (
            <Card key={m.id} className="overflow-hidden card-lift">
              <div className="relative aspect-square bg-muted">
                {isVideo(m) ? (
                  <video src={m.url} className="w-full h-full object-cover cursor-pointer" preload="metadata" muted playsInline onClick={() => setSelected(m)} />
                ) : isPdf(m) ? (
                  <button type="button" className="w-full h-full flex flex-col items-center justify-center gap-2 cursor-pointer" onClick={() => setSelected(m)}>
                    <FileText className="h-10 w-10 text-forest/50" />
                    <span className="text-[10px] font-medium text-muted-foreground">PDF</span>
                  </button>
                ) : (
                  <img src={m.url} alt={m.alt || m.filename} className="w-full h-full object-cover cursor-pointer" onClick={() => setSelected(m)} loading="lazy" />
                )}
                {isVideo(m) && (
                  <span className="absolute bottom-1.5 left-1.5 inline-flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
                    <Film className="h-3 w-3" /> Video
                  </span>
                )}
              </div>
              <CardContent className="p-2.5">
                <p className="text-[11px] font-medium text-forest truncate">{m.filename}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{formatSize(m.size)}</p>
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
                <DialogTitle className="font-display">Media Details</DialogTitle>
                <DialogDescription>Meaningful filenames and alt text improve image SEO.</DialogDescription>
              </DialogHeader>
              {isVideo(selected) ? (
                <video src={selected.url} controls className="rounded-lg border max-h-56 w-full bg-muted" />
              ) : isPdf(selected) ? (
                <a href={selected.url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 rounded-lg border bg-muted py-8 hover:bg-forest-mist">
                  <FileText className="h-10 w-10 text-forest/50" />
                  <span className="text-sm text-forest font-medium">Open PDF in new tab</span>
                </a>
              ) : (
                <img src={selected.url} alt={selected.alt || ""} className="rounded-lg border max-h-56 w-full object-contain bg-muted" />
              )}
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
                <div className="flex gap-2">
                  <Button onClick={saveMetadata} className="btn-gold flex-1">Save Details</Button>
                  <Button type="button" variant="outline" className="flex-1" disabled={uploading} onClick={() => replaceRef.current?.click()}>
                    <Replace className="h-4 w-4" /> Replace File
                  </Button>
                  <input
                    ref={replaceRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/avif,application/pdf,video/mp4,video/webm,video/quicktime"
                    className="sr-only"
                    onChange={(e) => replaceMedia(e.target.files?.[0])}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">Replace uploads a new file under the SAME URL — every existing link stays unbroken.</p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
