"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, Trash2, ArrowUp, ArrowDown, Eye, EyeOff, Copy, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface HomeSection {
  id: string; type: string; title?: string | null; data?: string | null; order: number; visible: boolean;
}

const SECTION_TYPES = [
  { value: "hero", label: "Hero — headline, subtext, CTAs, logo" },
  { value: "categories", label: "Category Grid" },
  { value: "why_us", label: "Why Us — USP cards" },
  { value: "featured_products", label: "Featured Products" },
  { value: "products", label: "Product Grid" },
  { value: "applications", label: "Applications Grid" },
  { value: "guide", label: "Selection Guide — numbered steps" },
  { value: "comparison", label: "Comparison Table" },
  { value: "b2b", label: "Wholesale / B2B Band" },
  { value: "info", label: "Info / Blog Links" },
  { value: "testimonials", label: "Testimonials" },
  { value: "faq", label: "FAQ" },
  { value: "cta", label: "Final CTA Band" },
];

export default function AdminSectionsPage() {
  const { toast } = useToast();
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<HomeSection | null>(null);
  const [dataObj, setDataObj] = useState<Record<string, unknown>>({});
  const [rawJson, setRawJson] = useState("");
  const [useRaw, setUseRaw] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/sections");
      const d = await res.json();
      setSections((d.items || []).sort((a: HomeSection, b: HomeSection) => a.order - b.order));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openEdit(section: HomeSection) {
    setEditing(section);
    try {
      const parsed = section.data ? JSON.parse(section.data) : {};
      setDataObj(parsed);
      setRawJson(JSON.stringify(parsed, null, 2));
      setUseRaw(false);
    } catch {
      setDataObj({});
      setRawJson(section.data || "{}");
      setUseRaw(true);
    }
  }

  async function save() {
    if (!editing) return;
    setSaving(true);
    try {
      const data = useRaw ? rawJson : JSON.stringify(dataObj);
      JSON.parse(data); // validate
      const res = await fetch(`/api/admin/sections/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editing.title, data, visible: editing.visible }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Section saved" });
      setEditing(null);
      load();
    } catch (e) {
      toast({ title: e instanceof Error && e.message ? e.message : "Invalid JSON — check the section data", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function patch(id: string, body: Record<string, unknown>) {
    const res = await fetch(`/api/admin/sections/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) toast({ title: "Update failed", variant: "destructive" });
  }

  async function move(index: number, dir: -1 | 1) {
    const a = sections[index];
    const b = sections[index + dir];
    if (!b) return;
    setSections((ss) => {
      const next = [...ss];
      next[index] = b;
      next[index + dir] = a;
      return next;
    });
    await Promise.all([
      fetch(`/api/admin/sections/${a.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ order: b.order }) }),
      fetch(`/api/admin/sections/${b.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ order: a.order }) }),
    ]);
    load();
  }

  async function addSection(type: string) {
    const maxOrder = sections.length ? Math.max(...sections.map((s) => s.order)) : 0;
    const res = await fetch("/api/admin/sections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, title: SECTION_TYPES.find((t) => t.value === type)?.label.split(" — ")[0], data: "{}", order: maxOrder + 1, visible: true }),
    });
    if (res.ok) {
      toast({ title: "Section added — edit its content now" });
      load();
    }
  }

  async function duplicate(section: HomeSection) {
    const maxOrder = sections.length ? Math.max(...sections.map((s) => s.order)) : 0;
    const res = await fetch("/api/admin/sections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: section.type, title: section.title, data: section.data, order: maxOrder + 1, visible: false }),
    });
    if (res.ok) {
      toast({ title: "Section duplicated (hidden) — edit then show it" });
      load();
    }
  }

  async function remove(id: string) {
    const res = await fetch(`/api/admin/sections/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast({ title: "Section deleted" });
      load();
    }
  }

  // Editor helpers for common fields
  function setDataField(key: string, value: unknown) {
    setDataObj((d) => ({ ...d, [key]: value }));
  }

  function setItemField(listKey: string, index: number, field: "title" | "text" | "icon", value: string) {
    setDataObj((d) => {
      const list = [...((d[listKey] as { title?: string; text?: string; icon?: string }[]) || [])];
      list[index] = { ...list[index], [field]: value };
      return { ...d, [listKey]: list };
    });
  }

  function addListItem(listKey: string) {
    setDataObj((d) => ({
      ...d,
      [listKey]: [...((d[listKey] as unknown[]) || []), { title: "", text: "", icon: "gem" }],
    }));
  }

  function removeListItem(listKey: string, index: number) {
    setDataObj((d) => ({
      ...d,
      [listKey]: ((d[listKey] as unknown[]) || []).filter((_, i) => i !== index),
    }));
  }

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-forest">Homepage Sections</h1>
          <p className="text-sm text-muted-foreground mt-1">Reorder, hide, edit or add sections — no developer needed.</p>
        </div>
        <AddSectionSelect onAdd={addSection} />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-gold-dark" /></div>
      ) : (
        <div className="space-y-2.5">
          {sections.map((section, i) => (
            <Card key={section.id} className={`${!section.visible ? "opacity-60" : ""}`}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => move(i, -1)} disabled={i === 0} className="text-muted-foreground hover:text-forest disabled:opacity-30" aria-label="Move up">
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button onClick={() => move(i, 1)} disabled={i === sections.length - 1} className="text-muted-foreground hover:text-forest disabled:opacity-30" aria-label="Move down">
                    <ArrowDown className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-forest text-sm">{section.title || section.type}</p>
                  <p className="text-xs text-muted-foreground">Type: {section.type} · Order: {section.order}</p>
                </div>
                <Switch
                  checked={section.visible}
                  onCheckedChange={(v) => { setSections((ss) => ss.map((s) => (s.id === section.id ? { ...s, visible: v } : s))); patch(section.id, { visible: v }); }}
                  aria-label="Show/hide section"
                />
                <Button variant="ghost" size="icon" onClick={() => openEdit(section)} aria-label="Edit section">
                  <Pencil className="h-4 w-4 text-forest" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => duplicate(section)} aria-label="Duplicate section">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => remove(section.id)} aria-label="Delete section">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Editor dialog */}
      <Dialog open={Boolean(editing)} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {editing && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display">Edit Section — {editing.title || editing.type}</DialogTitle>
                <DialogDescription>Simple fields for common content, or raw JSON for full control.</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <Button variant={useRaw ? "outline" : "default"} size="sm" onClick={() => setUseRaw(false)} className={useRaw ? "" : "bg-forest text-cream"}>Simple Fields</Button>
                  <Button variant={useRaw ? "default" : "outline"} size="sm" onClick={() => { setRawJson(JSON.stringify(dataObj, null, 2)); setUseRaw(true); }} className={useRaw ? "bg-forest text-cream" : ""}>Raw JSON</Button>
                </div>

                {!useRaw ? (
                  <>
                    <div className="space-y-1.5">
                      <Label>Heading</Label>
                      <Input value={String(dataObj.heading ?? dataObj.headline ?? "")} onChange={(e) => setDataField(dataObj.headline !== undefined ? "headline" : "heading", e.target.value)} />
                    </div>
                    {(dataObj.subheading || dataObj.subtitle || dataObj.text) !== undefined && (
                      <div className="space-y-1.5">
                        <Label>Sub-heading / Text</Label>
                        <Textarea rows={2} value={String(dataObj.subheading ?? dataObj.subtitle ?? dataObj.text ?? "")}
                          onChange={(e) => setDataField(dataObj.subheading !== undefined ? "subheading" : dataObj.subtitle !== undefined ? "subtitle" : "text", e.target.value)} />
                      </div>
                    )}

                    {/* List editors for common shapes */}
                    {Array.isArray(dataObj.items) && (
                      <div className="space-y-2">
                        <Label>Items (cards)</Label>
                        {(dataObj.items as { title?: string; text?: string }[]).map((item, idx) => (
                          <div key={idx} className="rounded-lg border p-3 space-y-2">
                            <Input value={item.title || ""} placeholder="Title" onChange={(e) => setItemField("items", idx, "title", e.target.value)} />
                            <Textarea rows={2} value={item.text || ""} placeholder="Text" onChange={(e) => setItemField("items", idx, "text", e.target.value)} />
                            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => removeListItem("items", idx)}>
                              <Trash2 className="h-3.5 w-3.5" /> Remove
                            </Button>
                          </div>
                        ))}
                        <Button variant="outline" size="sm" onClick={() => addListItem("items")}><Plus className="h-3.5 w-3.5" /> Add item</Button>
                      </div>
                    )}

                    {Array.isArray(dataObj.steps) && (
                      <div className="space-y-2">
                        <Label>Steps</Label>
                        {(dataObj.steps as { title?: string; text?: string }[]).map((item, idx) => (
                          <div key={idx} className="rounded-lg border p-3 space-y-2">
                            <Input value={item.title || ""} placeholder="Step title" onChange={(e) => setItemField("steps", idx, "title", e.target.value)} />
                            <Textarea rows={2} value={item.text || ""} placeholder="Step text" onChange={(e) => setItemField("steps", idx, "text", e.target.value)} />
                            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => removeListItem("steps", idx)}>
                              <Trash2 className="h-3.5 w-3.5" /> Remove
                            </Button>
                          </div>
                        ))}
                        <Button variant="outline" size="sm" onClick={() => addListItem("steps")}><Plus className="h-3.5 w-3.5" /> Add step</Button>
                      </div>
                    )}

                    {Array.isArray(dataObj.rows) && (
                      <div className="space-y-1.5">
                        <Label>Comparison rows (one row per line, cells separated by |)</Label>
                        <Textarea
                          rows={8}
                          className="font-mono text-xs"
                          value={(dataObj.rows as string[][]).map((r) => r.join(" | ")).join("\n")}
                          onChange={(e) => setDataField("rows", e.target.value.split("\n").map((line) => line.split("|").map((c) => c.trim())))}
                        />
                      </div>
                    )}

                    {Array.isArray(dataObj.links) && (
                      <div className="space-y-2">
                        <Label>Links</Label>
                        {(dataObj.links as { title?: string; url?: string }[]).map((item, idx) => (
                          <div key={idx} className="flex gap-2">
                            <Input value={item.title || ""} placeholder="Title" onChange={(e) => {
                              const list = [...(dataObj.links as { title?: string; url?: string }[])];
                              list[idx] = { ...list[idx], title: e.target.value };
                              setDataField("links", list);
                            }} />
                            <Input value={item.url || ""} placeholder="/blog/…" onChange={(e) => {
                              const list = [...(dataObj.links as { title?: string; url?: string }[])];
                              list[idx] = { ...list[idx], url: e.target.value };
                              setDataField("links", list);
                            }} />
                            <Button variant="ghost" size="icon" onClick={() => removeListItem("links", idx)} aria-label="Remove link">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        ))}
                        <Button variant="outline" size="sm" onClick={() => addListItem("links")}><Plus className="h-3.5 w-3.5" /> Add link</Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-1.5">
                    <Label>Section Data (JSON)</Label>
                    <Textarea rows={16} className="font-mono text-xs" value={rawJson} onChange={(e) => setRawJson(e.target.value)} />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                <Button onClick={save} disabled={saving} className="btn-gold">
                  {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : "Save Section"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AddSectionSelect({ onAdd }: { onAdd: (type: string) => void }) {
  const [value, setValue] = useState("");
  return (
    <div className="flex items-center gap-2">
      <Select value={value} onValueChange={(v) => { setValue(v); onAdd(v); }}>
        <SelectTrigger className="w-[240px]"><SelectValue placeholder="+ Add a section…" /></SelectTrigger>
        <SelectContent>
          {SECTION_TYPES.map((t) => (
            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
