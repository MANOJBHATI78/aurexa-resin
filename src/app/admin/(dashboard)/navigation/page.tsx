"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, Trash2, GripVertical, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface NavItem {
  id: string; label: string; url: string; location: string; order: number; enabled: boolean;
}

const LOCATIONS = [
  { value: "HEADER", label: "Header Menu" },
  { value: "FOOTER_QUICK", label: "Footer — Quick Links" },
];

export default function AdminNavigationPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState("HEADER");
  const [newItem, setNewItem] = useState({ label: "", url: "" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/navigation");
      const data = await res.json();
      setItems(data.items || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const visible = items
    .filter((i) => i.location === location)
    .sort((a, b) => a.order - b.order);

  async function addItem() {
    if (!newItem.label.trim() || !newItem.url.trim()) {
      toast({ title: "Label and URL are required", variant: "destructive" });
      return;
    }
    const res = await fetch("/api/admin/navigation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newItem,
        location,
        order: visible.length,
        enabled: true,
      }),
    });
    if (res.ok) {
      setNewItem({ label: "", url: "" });
      toast({ title: "Link added" });
      load();
    } else {
      toast({ title: "Could not add link", variant: "destructive" });
    }
  }

  async function patch(id: string, data: Partial<NavItem>) {
    const res = await fetch(`/api/admin/navigation/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) toast({ title: "Update failed", variant: "destructive" });
    else load();
  }

  async function remove(id: string) {
    const res = await fetch(`/api/admin/navigation/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast({ title: "Link removed" });
      load();
    }
  }

  async function move(index: number, dir: -1 | 1) {
    const target = visible[index + dir];
    const current = visible[index];
    if (!target) return;
    await Promise.all([
      fetch(`/api/admin/navigation/${current.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: target.order }),
      }),
      fetch(`/api/admin/navigation/${target.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: current.order }),
      }),
    ]);
    load();
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-forest">Header & Footer Navigation</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Control menu links without touching code. Product/Resin menu items automatically get category dropdowns on the site.
        </p>
      </div>

      <div className="flex gap-2">
        {LOCATIONS.map((loc) => (
          <Button
            key={loc.value}
            variant={location === loc.value ? "default" : "outline"}
            size="sm"
            onClick={() => setLocation(loc.value)}
            className={location === loc.value ? "bg-forest text-cream" : ""}
          >
            {loc.label}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-lg">Add Link</CardTitle>
          <CardDescription>
            Internal paths (e.g. /products, /resin) or full URLs (https://…).
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2 items-end">
          <div className="space-y-1.5 flex-1 min-w-[140px]">
            <Label htmlFor="nav-label">Label</Label>
            <Input id="nav-label" value={newItem.label} onChange={(e) => setNewItem((n) => ({ ...n, label: e.target.value }))} placeholder="e.g. About" />
          </div>
          <div className="space-y-1.5 flex-1 min-w-[160px]">
            <Label htmlFor="nav-url">URL</Label>
            <Input id="nav-url" value={newItem.url} onChange={(e) => setNewItem((n) => ({ ...n, url: e.target.value }))} placeholder="e.g. /about" />
          </div>
          <Button onClick={addItem} className="btn-gold">
            <Plus className="h-4 w-4" /> Add
          </Button>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-7 w-7 animate-spin text-gold-dark" /></div>
      ) : (
        <Card>
          <CardContent className="p-0">
            {visible.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">No links in this menu yet.</p>
            ) : (
              <div className="divide-y">
                {visible.map((item, i) => (
                  <div key={item.id} className="flex items-center gap-2 px-4 py-3">
                    <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0" aria-hidden />
                    <div className="flex flex-col gap-0.5">
                      <button onClick={() => move(i, -1)} disabled={i === 0} className="text-[10px] text-muted-foreground hover:text-forest disabled:opacity-30" aria-label="Move up">▲</button>
                      <button onClick={() => move(i, 1)} disabled={i === visible.length - 1} className="text-[10px] text-muted-foreground hover:text-forest disabled:opacity-30" aria-label="Move down">▼</button>
                    </div>
                    <div className="flex-1 min-w-0 grid gap-1.5 sm:grid-cols-2 sm:px-2">
                      <Input
                        defaultValue={item.label}
                        onBlur={(e) => e.target.value !== item.label && patch(item.id, { label: e.target.value })}
                        aria-label="Link label"
                      />
                      <Input
                        defaultValue={item.url}
                        onBlur={(e) => e.target.value !== item.url && patch(item.id, { url: e.target.value })}
                        aria-label="Link URL"
                      />
                    </div>
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-gold-dark" aria-label="Preview link">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    <Switch
                      checked={item.enabled}
                      onCheckedChange={(v) => patch(item.id, { enabled: v })}
                      aria-label="Enable/disable link"
                    />
                    <Button variant="ghost" size="icon" onClick={() => remove(item.id)} aria-label="Delete link">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
