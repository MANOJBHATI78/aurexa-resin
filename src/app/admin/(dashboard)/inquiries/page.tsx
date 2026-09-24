"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Download, Search, Trash2, ChevronLeft, ChevronRight, MessageCircle, Phone, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const STATUSES = ["NEW", "CONTACTED", "FOLLOW_UP", "QUALIFIED", "CONVERTED", "CLOSED"] as const;
const STATUS_STYLES: Record<string, string> = {
  NEW: "bg-gold text-forest-dark",
  CONTACTED: "bg-forest-light text-cream",
  FOLLOW_UP: "bg-blue-200 text-blue-900",
  QUALIFIED: "bg-purple-200 text-purple-900",
  CONVERTED: "bg-green-200 text-green-900",
  CLOSED: "bg-muted text-muted-foreground",
};

interface Inquiry {
  id: string; name: string; mobile: string; countryCode: string; city: string; country: string;
  email?: string | null; product?: string | null; resinType?: string | null; quantity?: string | null;
  application?: string | null; message?: string | null; status: string; notes?: string | null;
  sourcePage?: string | null; landingPage?: string | null; referrer?: string | null;
  utmSource?: string | null; utmMedium?: string | null; utmCampaign?: string | null;
  device?: string | null; createdAt: string;
}

export default function AdminInquiriesPage() {
  const { toast } = useToast();
  const [rows, setRows] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [page, setPage] = useState(0);
  const perPage = 25;

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/admin/inquiries");
      const data = await res.json();
      setRows(data.items || []);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // LIVE mode — poll for new leads every 15s while the tab is visible (silent, no spinner)
  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") load(true);
    }, 15_000);
    return () => clearInterval(timer);
  }, [load]);

  const filtered = rows.filter((r) => {
    if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      return [r.name, r.mobile, r.city, r.country, r.product, r.email].some((f) => (f || "").toLowerCase().includes(q));
    }
    return true;
  });

  const paged = filtered.slice(page * perPage, (page + 1) * perPage);
  const pageCount = Math.max(1, Math.ceil(filtered.length / perPage));

  const statusCount = (s: string) => rows.filter((r) => r.status === s).length;

  async function updateStatus(inquiry: Inquiry, status: string) {
    const res = await fetch(`/api/admin/inquiries/${inquiry.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setRows((rs) => rs.map((r) => (r.id === inquiry.id ? { ...r, status } : r)));
      toast({ title: `Marked as ${status.replace("_", " ").toLowerCase()}` });
    } else {
      toast({ title: "Update failed", variant: "destructive" });
    }
  }

  async function saveNotes() {
    if (!selected) return;
    setSavingNotes(true);
    try {
      const res = await fetch(`/api/admin/inquiries/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      if (!res.ok) throw new Error();
      setRows((rs) => rs.map((r) => (r.id === selected.id ? { ...r, notes } : r)));
      toast({ title: "Notes saved" });
    } catch {
      toast({ title: "Could not save notes", variant: "destructive" });
    } finally {
      setSavingNotes(false);
    }
  }

  async function deleteInquiry(id: string) {
    const res = await fetch(`/api/admin/inquiries/${id}`, { method: "DELETE" });
    if (res.ok) {
      setRows((rs) => rs.filter((r) => r.id !== id));
      setSelected(null);
      toast({ title: "Inquiry deleted" });
    }
  }

  return (
    <div className="space-y-4 max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-forest flex items-center gap-2.5">
            Inquiries
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              Live
            </span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Leads from the website inquiry forms + WhatsApp/Call click capture — auto-refreshes every 15 seconds.</p>
        </div>
        <Button asChild variant="outline">
          <a href="/api/admin/export?type=inquiries" download>
            <Download className="h-4 w-4" /> Export CSV
          </a>
        </Button>
      </div>

      {/* Status pipeline */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={statusFilter === "ALL" ? "default" : "outline"}
          size="sm"
          onClick={() => { setStatusFilter("ALL"); setPage(0); }}
          className={statusFilter === "ALL" ? "bg-forest text-cream" : ""}
        >
          All ({rows.length})
        </Button>
        {STATUSES.map((s) => (
          <Button
            key={s}
            variant={statusFilter === s ? "default" : "outline"}
            size="sm"
            onClick={() => { setStatusFilter(s); setPage(0); }}
            className={statusFilter === s ? "bg-forest text-cream" : ""}
          >
            {s.replace("_", " ")} ({statusCount(s)})
          </Button>
        ))}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
        <Input value={query} onChange={(e) => { setQuery(e.target.value); setPage(0); }} placeholder="Search name, mobile, city, product…" className="pl-9" />
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-gold-dark" /></div>
          ) : paged.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">No inquiries match this view.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lead</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Requirement</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paged.map((r) => (
                    <TableRow key={r.id} className="cursor-pointer" onClick={() => { setSelected(r); setNotes(r.notes || ""); }}>
                      <TableCell>
                        <p className="font-medium text-forest">{r.name}</p>
                        <p className="text-xs text-muted-foreground">{r.city}, {r.country}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{r.countryCode} {r.mobile}</p>
                        {r.email && <p className="text-xs text-muted-foreground truncate max-w-[160px]">{r.email}</p>}
                      </TableCell>
                      <TableCell>
                        <p className="text-sm truncate max-w-[180px]">{r.product || r.resinType || "General"}</p>
                        <p className="text-xs text-muted-foreground">{r.quantity || ""}{r.application ? ` · ${r.application}` : ""}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-xs text-muted-foreground truncate max-w-[140px]">{r.utmSource ? `UTM: ${r.utmSource}` : r.sourcePage || "—"}</p>
                        <p className="text-xs text-muted-foreground">{r.device || ""}</p>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(r.createdAt).toLocaleDateString("en-IN")}
                        <br />
                        {new Date(r.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Select value={r.status} onValueChange={(v) => updateStatus(r, v)}>
                          <SelectTrigger className="w-[130px] h-8 text-xs border-0 p-0 focus:ring-0">
                            <Badge className={`${STATUS_STYLES[r.status] || ""} pointer-events-none`}>{r.status.replace("_", " ")}</Badge>
                          </SelectTrigger>
                          <SelectContent>
                            {STATUSES.map((s) => (
                              <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex items-center justify-end gap-2 text-sm">
          <Button variant="outline" size="icon" disabled={page === 0} onClick={() => setPage((p) => p - 1)} aria-label="Previous page">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-muted-foreground">Page {page + 1} of {pageCount}</span>
          <Button variant="outline" size="icon" disabled={page >= pageCount - 1} onClick={() => setPage((p) => p + 1)} aria-label="Next page">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Detail dialog */}
      <Dialog open={Boolean(selected)} onOpenChange={(v) => !v && setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display">{selected.name}</DialogTitle>
                <DialogDescription>
                  {selected.city}, {selected.country} · {new Date(selected.createdAt).toLocaleString("en-IN")}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <Button asChild className="bg-[#25D366] hover:bg-[#1fb857] text-white">
                    <a href={`https://wa.me/${selected.countryCode.replace("+", "")}${selected.mobile}?text=${encodeURIComponent(`Hello ${selected.name}, regarding your resin inquiry…`)}`} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="h-4 w-4" /> WhatsApp Lead
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="border-forest/30 text-forest">
                    <a href={`tel:${selected.countryCode}${selected.mobile}`}>
                      <Phone className="h-4 w-4" /> Call Lead
                    </a>
                  </Button>
                </div>

                <dl className="space-y-2 rounded-lg border p-4">
                  <Detail label="Mobile" value={`${selected.countryCode} ${selected.mobile}`} />
                  <Detail label="Email" value={selected.email} />
                  <Detail label="Product" value={selected.product} />
                  <Detail label="Resin Type" value={selected.resinType} />
                  <Detail label="Quantity" value={selected.quantity} />
                  <Detail label="Application" value={selected.application} />
                  <Detail label="Message" value={selected.message} />
                </dl>

                <div>
                  <p className="font-medium text-forest mb-1.5">Attribution</p>
                  <dl className="space-y-1.5 rounded-lg border p-4 text-xs text-muted-foreground">
                    <Detail label="Landing Page" value={selected.landingPage} mono />
                    <Detail label="Source Page" value={selected.sourcePage} mono />
                    <Detail label="Referrer" value={selected.referrer} mono />
                    <Detail label="UTM Source" value={selected.utmSource} />
                    <Detail label="UTM Medium" value={selected.utmMedium} />
                    <Detail label="UTM Campaign" value={selected.utmCampaign} />
                    <Detail label="Device" value={selected.device} />
                  </dl>
                </div>

                <div>
                  <Label htmlFor="notes">Internal Notes</Label>
                  <Textarea id="notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1.5" placeholder="Follow-up notes…" />
                  <div className="flex items-center gap-2 mt-2">
                    <Button size="sm" onClick={saveNotes} disabled={savingNotes} className="btn-gold">
                      Save Notes
                    </Button>
                    <Button size="sm" variant="outline" className="text-destructive border-destructive/40" onClick={() => deleteInquiry(selected.id)}>
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Detail({ label, value, mono }: { label: string; value?: string | null; mono?: boolean }) {
  if (!value) return null;
  return (
    <div className="flex flex-wrap gap-x-2">
      <dt className="text-muted-foreground shrink-0">{label}:</dt>
      <dd className={`break-all ${mono ? "font-mono text-[11px]" : ""}`}>{value}</dd>
    </div>
  );
}
