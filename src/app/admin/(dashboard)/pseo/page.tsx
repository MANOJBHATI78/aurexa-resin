"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Wand2, FileSpreadsheet, ExternalLink, CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface GeneratedPage {
  id: string; title: string; slug: string; published: boolean; noindex: boolean; updatedAt: string;
}

export default function AdminPseoPage() {
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);
  const [patterns, setPatterns] = useState("epoxy resin supplier in {city}\nepoxy resin wholesale in {city}\nbuy epoxy resin online {city}");
  const [cities, setCities] = useState("");
  const [extraVarName, setExtraVarName] = useState("");
  const [extraVarValues, setExtraVarValues] = useState("");
  const [descTemplate, setDescTemplate] = useState("");
  const [contentTemplate, setContentTemplate] = useState("");
  const [autoFaq, setAutoFaq] = useState(true);
  const [published, setPublished] = useState(true);
  const [noindex, setNoindex] = useState(false);
  const [result, setResult] = useState<{ created: number; skipped: string[]; createdSlugs: string[]; mode: string } | null>(null);
  const [recent, setRecent] = useState<GeneratedPage[]>([]);
  const [csvFile, setCsvFile] = useState<File | null>(null);

  const loadRecent = useCallback(async () => {
    const res = await fetch("/api/admin/pseo/generate");
    const data = await res.json();
    setRecent(data.items || []);
  }, []);

  useEffect(() => { loadRecent(); }, [loadRecent]);

  const cityList = cities.split(",").map((s) => s.trim()).filter(Boolean);
  const patternCount = patterns.split("\n").filter((p) => p.trim()).length;
  const estimate = patternCount * Math.max(cityList.length, 1) * (extraVarValues.trim() ? extraVarValues.split(",").filter((s) => s.trim()).length : 1);

  async function generateTemplate() {
    setGenerating(true);
    setResult(null);
    try {
      const variables = [{ name: "city", values: cityList }];
      if (extraVarName.trim() && extraVarValues.trim()) {
        variables.push({ name: extraVarName.trim().toLowerCase(), values: extraVarValues.split(",").map((s) => s.trim()).filter(Boolean) });
      }
      const res = await fetch("/api/admin/pseo/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patterns: patterns.split("\n").map((p) => p.trim()).filter(Boolean),
          variables,
          descTemplate: descTemplate.trim() || undefined,
          contentTemplate: contentTemplate.trim() || undefined,
          autoFaq,
          published,
          noindex,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setResult(data);
      toast({ title: `${data.created} pages created`, description: data.skipped.length ? `${data.skipped.length} skipped (already exist)` : "No duplicates" });
      loadRecent();
    } catch (e) {
      toast({ title: e instanceof Error ? e.message : "Generation failed", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  }

  async function generateCsv() {
    if (!csvFile) return;
    setGenerating(true);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append("file", csvFile);
      fd.append("published", String(published));
      fd.append("noindex", String(noindex));
      const res = await fetch("/api/admin/pseo/generate", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");
      setResult(data);
      toast({ title: `${data.created} pages imported`, description: data.skipped.length ? `${data.skipped.length} skipped` : "" });
      loadRecent();
    } catch (e) {
      toast({ title: e instanceof Error ? e.message : "Import failed", variant: "destructive" });
    } finally {
      setGenerating(false);
      setCsvFile(null);
    }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-forest">pSEO Generator</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Create hundreds of unique, useful SEO landing pages from keyword templates — fully Google-compliant
          (no cloaking, no doorway pages: every page gets real visible content, FAQs and internal links).
        </p>
      </div>

      {/* Template builder */}
      <Card>
        <CardHeader><CardTitle className="font-display text-lg flex items-center gap-2"><Wand2 className="h-5 w-5 text-gold-dark" /> Template Builder</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Keyword Patterns (one per line — use {"{city}"} or your custom variable)</Label>
            <Textarea value={patterns} onChange={(e) => setPatterns(e.target.value)} rows={4} />
            <p className="text-xs text-muted-foreground">Each line × each location = one page. Example: <code>epoxy resin supplier in {"{city}"}</code></p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>City / Location list (comma separated)</Label>
              <Textarea value={cities} onChange={(e) => setCities(e.target.value)} rows={3} placeholder="Surat, Mumbai, Delhi, Ahmedabad, Pune, Jaipur…" />
            </div>
            <div className="space-y-1.5">
              <Label>Optional 2nd variable</Label>
              <div className="flex gap-2">
                <Input value={extraVarName} onChange={(e) => setExtraVarName(e.target.value)} placeholder="variable name e.g. category" />
                <Input value={extraVarValues} onChange={(e) => setExtraVarValues(e.target.value)} placeholder="Art Resin, Deep Pour…" />
              </div>
              <p className="text-xs text-muted-foreground">Use as {"{category}"} in patterns. Pattern lines must contain it.</p>
            </div>
          </div>

          <details className="rounded-lg border bg-muted/30 p-3">
            <summary className="text-sm font-medium text-forest cursor-pointer">Advanced: custom description & content templates</summary>
            <div className="space-y-3 mt-3">
              <div className="space-y-1.5">
                <Label>Meta description template</Label>
                <Textarea value={descTemplate} onChange={(e) => setDescTemplate(e.target.value)} rows={2} placeholder={"Buy {phrase} at wholesale manufacturer prices…"} />
              </div>
              <div className="space-y-1.5">
                <Label>Content template (Markdown — {"{phrase}"}, {"{relatedLinks}"} supported)</Label>
                <Textarea value={contentTemplate} onChange={(e) => setContentTemplate(e.target.value)} rows={6} placeholder={"Aurexa Resin offers {phrase} at direct factory prices…"} />
              </div>
            </div>
          </details>

          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch checked={autoFaq} onCheckedChange={setAutoFaq} id="faq" />
              <Label htmlFor="faq">Auto-add FAQ block (with FAQPage schema)</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={published} onCheckedChange={setPublished} id="pub" />
              <Label htmlFor="pub">Publish immediately</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={noindex} onCheckedChange={setNoindex} id="noidx" />
              <Label htmlFor="noidx">noindex (not recommended for pSEO)</Label>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-forest-mist border border-forest/15 px-4 py-3">
            <p className="text-sm text-forest">
              <strong>{patternCount}</strong> pattern(s) × <strong>{cityList.length || "?"}</strong> locations{extraVarValues.trim() ? ` × ${extraVarValues.split(",").filter((s) => s.trim()).length} categories` : ""} = <strong>{estimate}</strong> page(s)
              {estimate > 500 && <span className="text-destructive"> — over the 500 batch limit</span>}
            </p>
            <Button onClick={generateTemplate} disabled={generating || !cityList.length || estimate < 1 || estimate > 500} className="btn-gold">
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
              {generating ? "Generating…" : "Generate Pages"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* CSV import */}
      <Card>
        <CardHeader><CardTitle className="font-display text-lg flex items-center gap-2"><FileSpreadsheet className="h-5 w-5 text-gold-dark" /> Bulk CSV Import</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            CSV columns: <code>keyword</code> (required), <code>slug</code>, <code>h1</code>, <code>title</code>, <code>description</code>, <code>content</code> (markdown), <code>keywords</code>.
            Missing fields are auto-generated from the keyword.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="file"
              accept=".csv,text/csv"
              className="text-sm file:mr-3 file:rounded-md file:border-0 file:bg-forest file:text-cream file:px-3 file:py-1.5 file:text-sm"
              onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
            />
            <Button onClick={generateCsv} disabled={generating || !csvFile} className="btn-gold">
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}
              Import CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Result */}
      {result && (
        <Card className="border-gold/40">
          <CardContent className="pt-6 space-y-2">
            <p className="flex items-center gap-2 font-medium text-forest"><CheckCircle2 className="h-5 w-5 text-green-600" /> {result.created} page(s) created ({result.mode} mode)</p>
            {result.skipped.length > 0 && (
              <p className="flex items-start gap-2 text-sm text-muted-foreground"><AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-amber-500" /> Skipped {result.skipped.length} (duplicate slug / already exists): {result.skipped.slice(0, 10).join(", ")}{result.skipped.length > 10 ? "…" : ""}</p>
            )}
            {result.createdSlugs.slice(0, 12).map((s) => (
              <a key={s} href={`/${s}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-forest-light hover:underline">/{s} <ExternalLink className="h-3 w-3" /></a>
            ))}
            {result.createdSlugs.length > 12 && <p className="text-xs text-muted-foreground">+ {result.createdSlugs.length - 12} more — see list below</p>}
          </CardContent>
        </Card>
      )}

      {/* Recent generated */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-display text-lg">Generated Pages ({recent.length})</CardTitle>
          <Button variant="ghost" size="icon" onClick={loadRecent} aria-label="Refresh"><RefreshCw className="h-4 w-4" /></Button>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">No generated pages yet. Build your first batch above.</p>
          ) : (
            <div className="space-y-2">
              {recent.map((p) => (
                <div key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-forest truncate">{p.title}</p>
                    <a href={`/${p.slug}`} target="_blank" rel="noopener noreferrer" className="text-xs text-forest-light hover:underline">/{p.slug}</a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={p.published ? "default" : "secondary"}>{p.published ? "Published" : "Draft"}</Badge>
                    {p.noindex && <Badge variant="outline">noindex</Badge>}
                    <span className="text-[11px] text-muted-foreground">{new Date(p.updatedAt).toLocaleDateString("en-IN")}</span>
                  </div>
                </div>
              ))}
              <p className="text-xs text-muted-foreground mt-2">Manage / edit / unpublish any page in <strong>Landing Pages</strong> — they appear there too.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
