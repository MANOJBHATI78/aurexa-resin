"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Pencil, Trash2, Search, RefreshCw, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

export type FieldType =
  | "text" | "textarea" | "number" | "boolean" | "select" | "list" | "image" | "code" | "markdown" | "date";

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  options?: { value: string; label: string }[];
  /** Load options dynamically from another admin resource (e.g. "categories") */
  optionsResource?: string;
  optionsLabelField?: string;
  placeholder?: string;
  hint?: string;
  group?: string;
  full?: boolean;
  rows?: number;
}

export interface ColumnDef {
  name: string;
  label: string;
  render?: (row: Record<string, unknown>) => React.ReactNode;
}

interface Props {
  resource: string;
  title: string;
  description?: string;
  fields: FieldDef[];
  columns: ColumnDef[];
  defaults?: Record<string, unknown>;
  initialRow?: Record<string, unknown>; // passed to defaults fn for new rows
  searchPlaceholder?: string;
  canCreate?: boolean;
  canDelete?: boolean;
}

function emptyForm(fields: FieldDef[], defaults?: Record<string, unknown>): Record<string, unknown> {
  const form: Record<string, unknown> = {};
  for (const f of fields) {
    if (defaults && f.name in defaults) {
      form[f.name] = defaults[f.name];
      continue;
    }
    form[f.name] =
      f.type === "boolean" ? false
      : f.type === "number" ? 0
      : f.type === "list" ? []
      : "";
  }
  return form;
}

function toFormValue(type: FieldType, value: unknown): unknown {
  if (type === "list") {
    if (Array.isArray(value)) return value;
    if (typeof value === "string" && value.trim()) {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : String(value).split(",").map((s) => s.trim());
      } catch {
        return String(value).split(",").map((s) => s.trim());
      }
    }
    return [];
  }
  if (type === "boolean") return Boolean(value);
  if (type === "number") return typeof value === "number" ? value : parseInt(String(value || "0"), 10) || 0;
  return value ?? "";
}

export function ResourceManager({
  resource, title, description, fields, columns,
  defaults, searchPlaceholder, canCreate = true, canDelete = true,
}: Props) {
  const { toast } = useToast();
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>(() => emptyForm(fields, defaults));
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/${resource}`);
      const data = await res.json();
      setRows(data.items || []);
    } catch {
      toast({ title: "Failed to load", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [resource, toast]);

  useEffect(() => { load(); }, [load]);

  // Debounced server search
  useEffect(() => {
    const t = setTimeout(() => setSearch(query), 350);
    return () => clearTimeout(t);
  }, [query]);

  const visibleRows = useMemo(() => {
    if (!search.trim() || !rows.length) return rows;
    const q = search.toLowerCase();
    return rows.filter((r) =>
      Object.values(r).some((v) => String(v ?? "").toLowerCase().includes(q))
    );
  }, [rows, search]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm(fields, defaults));
    setDialogOpen(true);
  }

  function openEdit(row: Record<string, unknown>) {
    const f: Record<string, unknown> = {};
    for (const field of fields) f[field.name] = toFormValue(field.type, row[field.name]);
    setEditingId(row.id as string);
    setForm(f);
    setDialogOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload: Record<string, unknown> = { ...form };
      // convert list → JSON strings
      for (const field of fields) {
        if (field.type === "list") payload[field.name] = JSON.stringify(form[field.name] || []);
      }
      const res = await fetch(
        editingId ? `/api/admin/${resource}/${editingId}` : `/api/admin/${resource}`,
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      toast({ title: editingId ? "Updated successfully" : "Created successfully" });
      setDialogOpen(false);
      load();
    } catch (e) {
      toast({ title: e instanceof Error ? e.message : "Save failed", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/${resource}/${deleteId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      toast({ title: "Deleted" });
      load();
    } catch (e) {
      toast({ title: e instanceof Error ? e.message : "Delete failed", variant: "destructive" });
    } finally {
      setDeleteId(null);
    }
  }

  async function handleImageUpload(file: File, fieldName: string) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", resource);
    try {
      const res = await fetch("/api/admin/media/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setForm((f) => ({ ...f, [fieldName]: data.item.url }));
      toast({ title: "Image uploaded" });
    } catch (e) {
      toast({ title: e instanceof Error ? e.message : "Upload failed", variant: "destructive" });
    }
  }

  const grouped = useMemo(() => {
    const groups = new Map<string, FieldDef[]>();
    for (const f of fields) {
      const key = f.group || "Details";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(f);
    }
    return Array.from(groups.entries());
  }, [fields]);

  // Dynamic options from other resources
  const [dynamicOptions, setDynamicOptions] = useState<Record<string, { value: string; label: string }[]>>({});
  useEffect(() => {
    const sources = Array.from(new Set(fields.filter((f) => f.optionsResource).map((f) => f.optionsResource!)));
    for (const src of sources) {
      fetch(`/api/admin/${src}`)
        .then((r) => r.json())
        .then((d) => {
          const items = (d.items || []) as Record<string, unknown>[];
          const labelField = fields.find((f) => f.optionsResource === src)?.optionsLabelField || "name";
          setDynamicOptions((prev) => ({
            ...prev,
            [src]: items.map((it) => ({ value: String(it.id), label: String(it[labelField] ?? it.name ?? it.id) })),
          }));
        })
        .catch(() => undefined);
    }
     
  }, [resource]);

  const getOptions = (field: FieldDef) =>
    field.optionsResource ? dynamicOptions[field.optionsResource] || [] : field.options || [];

  return (
    <div className="space-y-4 max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-forest">{title}</h1>
          {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={load} aria-label="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
          {canCreate && (
            <Button onClick={openCreate} className="btn-gold">
              <Plus className="h-4 w-4" /> Add New
            </Button>
          )}
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={searchPlaceholder || "Search…"} className="pl-9" />
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-gold-dark" /></div>
          ) : visibleRows.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-muted-foreground text-sm">No records found.</p>
              {canCreate && (
                <Button onClick={openCreate} variant="outline" size="sm" className="mt-3">
                  <Plus className="h-4 w-4" /> Create the first one
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((c) => (
                      <TableHead key={c.name}>{c.label}</TableHead>
                    ))}
                    <TableHead className="w-24 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleRows.map((row) => (
                    <TableRow key={String(row.id)}>
                      {columns.map((c) => (
                        <TableCell key={c.name} className="max-w-[280px]">
                          {c.render ? c.render(row) : <span className="block truncate">{String(row[c.name] ?? "—")}</span>}
                        </TableCell>
                      ))}
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(row)} aria-label="Edit">
                            <Pencil className="h-4 w-4 text-forest" />
                          </Button>
                          {canDelete && (
                            <Button variant="ghost" size="icon" onClick={() => setDeleteId(String(row.id))} aria-label="Delete">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">{editingId ? `Edit ${title.replace(/s$/, "")}` : `Add ${title.replace(/s$/, "")}`}</DialogTitle>
            <DialogDescription>
              {editingId ? "Update the fields below and save." : "Fill the fields below to create a new record."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {grouped.map(([groupName, groupFields]) => (
              <fieldset key={groupName} className="space-y-3.5">
                {grouped.length > 1 && (
                  <legend className="text-xs font-semibold uppercase tracking-wider text-gold-dark">{groupName}</legend>
                )}
                <div className="grid gap-3.5 sm:grid-cols-2">
                  {groupFields.map((field) => (
                    <div key={field.name} className={`space-y-1.5 ${field.full || ["textarea", "markdown", "code", "list"].includes(field.type) ? "sm:col-span-2" : ""}`}>
                      {field.type !== "boolean" && (
                        <Label htmlFor={`f-${field.name}`}>
                          {field.label}
                        </Label>
                      )}
                      {field.type === "text" && (
                        <Input id={`f-${field.name}`} value={String(form[field.name] ?? "")} placeholder={field.placeholder}
                          onChange={(e) => setForm((f) => ({ ...f, [field.name]: e.target.value }))} />
                      )}
                      {field.type === "number" && (
                        <Input id={`f-${field.name}`} type="number" value={String(form[field.name] ?? 0)}
                          onChange={(e) => setForm((f) => ({ ...f, [field.name]: parseInt(e.target.value, 10) || 0 }))} />
                      )}
                      {field.type === "date" && (
                        <Input id={`f-${field.name}`} type="date" value={String(form[field.name] ?? "").slice(0, 10)}
                          onChange={(e) => setForm((f) => ({ ...f, [field.name]: e.target.value }))} />
                      )}
                      {(field.type === "textarea" || field.type === "markdown" || field.type === "code") && (
                        <Textarea
                          id={`f-${field.name}`}
                          rows={field.rows || (field.type === "textarea" ? 3 : 10)}
                          className={field.type === "code" ? "font-mono text-xs" : ""}
                          value={String(form[field.name] ?? "")}
                          placeholder={field.placeholder}
                          onChange={(e) => setForm((f) => ({ ...f, [field.name]: e.target.value }))}
                        />
                      )}
                      {field.type === "boolean" && (
                        <div className="flex items-center justify-between rounded-lg border px-3 py-2.5">
                          <Label htmlFor={`f-${field.name}`} className="cursor-pointer">{field.label}</Label>
                          <Switch id={`f-${field.name}`} checked={Boolean(form[field.name])}
                            onCheckedChange={(v) => setForm((f) => ({ ...f, [field.name]: v }))} />
                        </div>
                      )}
                      {field.type === "select" && (
                        <Select value={String(form[field.name] ?? "")} onValueChange={(v) => setForm((f) => ({ ...f, [field.name]: v }))}>
                          <SelectTrigger id={`f-${field.name}`}><SelectValue placeholder={field.placeholder || "Select…"} /></SelectTrigger>
                          <SelectContent className="max-h-64">
                            {getOptions(field).map((o) => (
                              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      {field.type === "list" && (
                        <ListEditor
                          value={(form[field.name] as string[]) || []}
                          onChange={(v) => setForm((f) => ({ ...f, [field.name]: v }))}
                          placeholder={field.placeholder}
                        />
                      )}
                      {field.type === "image" && (
                        <div className="flex gap-2">
                          <Input id={`f-${field.name}`} value={String(form[field.name] ?? "")} placeholder="/uploads/… or https://…"
                            onChange={(e) => setForm((f) => ({ ...f, [field.name]: e.target.value }))} className="flex-1" />
                          <label className="inline-flex items-center gap-1.5 rounded-md border border-input px-3 text-sm cursor-pointer hover:bg-muted shrink-0">
                            <Upload className="h-3.5 w-3.5" /> Upload
                            <input type="file" accept="image/*" className="sr-only"
                              onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], field.name)} />
                          </label>
                        </div>
                      )}
                      {field.hint && <p className="text-[11px] text-muted-foreground">{field.hint}</p>}
                    </div>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="btn-gold">
              {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={Boolean(deleteId)} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this record?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The record will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white hover:bg-destructive/90">
              <Trash2 className="h-4 w-4" /> Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/** Simple string list editor (for arrays like features, applications, pack sizes) */
function ListEditor({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  return (
    <div className="space-y-2">
      {value.map((item, i) => (
        <div key={i} className="flex gap-2">
          <Input
            value={item}
            placeholder={placeholder}
            onChange={(e) => {
              const next = [...value];
              next[i] = e.target.value;
              onChange(next);
            }}
          />
          <Button type="button" variant="ghost" size="icon" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label="Remove item">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...value, ""])}>
        <Plus className="h-3.5 w-3.5" /> Add item
      </Button>
    </div>
  );
}

export function BoolBadge({ value, trueLabel = "Yes", falseLabel = "No" }: { value: unknown; trueLabel?: string; falseLabel?: string }) {
  return (
    <Badge className={value ? "bg-forest text-cream" : "bg-muted text-muted-foreground"}>
      {value ? trueLabel : falseLabel}
    </Badge>
  );
}
