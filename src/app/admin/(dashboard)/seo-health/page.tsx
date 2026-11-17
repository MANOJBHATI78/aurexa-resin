"use client";

import { useState } from "react";
import { Loader2, ShieldCheck, AlertTriangle, Info, XCircle, RefreshCw, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Issue {
  severity: "error" | "warning" | "info";
  type: string;
  message: string;
  entity?: string;
  path?: string;
  editUrl?: string;
}

interface AuditData {
  ok: boolean;
  generatedAt: string;
  scanned: Record<string, number>;
  summary: { error: number; warning: number; info: number; total: number };
  issues: Issue[];
}

export default function AdminSeoHealthPage() {
  const { toast } = useToast();
  const [data, setData] = useState<AuditData | null>(null);
  const [running, setRunning] = useState(false);
  const [filter, setFilter] = useState<"all" | "error" | "warning" | "info">("all");

  async function runAudit() {
    setRunning(true);
    try {
      const res = await fetch("/api/admin/seo/audit");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Audit failed");
      setData(json);
      toast({ title: "Audit complete", description: `${json.summary.error} errors, ${json.summary.warning} warnings` });
    } catch (e) {
      toast({ title: e instanceof Error ? e.message : "Audit failed", variant: "destructive" });
    } finally {
      setRunning(false);
    }
  }

  const filtered = data ? data.issues.filter((i) => filter === "all" || i.severity === filter) : [];

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-forest">SEO Health Check</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Validates every page before you publish: duplicate titles/descriptions, length limits, slug collisions,
            broken internal links, missing alt text and indexing conflicts.
          </p>
        </div>
        <Button onClick={runAudit} disabled={running} className="btn-gold">
          {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
          {running ? "Auditing…" : "Run Audit"}
        </Button>
      </div>

      {data && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card><CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-destructive">{data.summary.error}</p>
              <p className="text-xs text-muted-foreground mt-1">Errors</p>
            </CardContent></Card>
            <Card><CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-amber-500">{data.summary.warning}</p>
              <p className="text-xs text-muted-foreground mt-1">Warnings</p>
            </CardContent></Card>
            <Card><CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-sky-500">{data.summary.info}</p>
              <p className="text-xs text-muted-foreground mt-1">Suggestions</p>
            </CardContent></Card>
            <Card><CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-forest">{Object.values(data.scanned).reduce((a, b) => a + b, 0)}</p>
              <p className="text-xs text-muted-foreground mt-1">Items scanned</p>
            </CardContent></Card>
          </div>

          <p className="text-xs text-muted-foreground">Last run: {new Date(data.generatedAt).toLocaleString("en-IN")}</p>

          <div className="flex gap-2">
            {(["all", "error", "warning", "info"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full px-3 py-1 text-xs font-medium capitalize border ${filter === f ? "bg-forest text-cream border-forest" : "bg-card text-muted-foreground border-input hover:border-forest/40"}`}
              >
                {f === "all" ? `All (${data.summary.total})` : `${f}s (${data.summary[f]})`}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {filtered.length === 0 ? (
              <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">
                {data.summary.total === 0 ? "No SEO issues found — everything looks healthy." : "No issues in this severity level."}
              </CardContent></Card>
            ) : (
              filtered.map((issue, i) => (
                <Card key={i}>
                  <CardContent className="flex flex-wrap items-start justify-between gap-2 p-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {issue.severity === "error" ? <XCircle className="h-4 w-4 text-destructive" /> : issue.severity === "warning" ? <AlertTriangle className="h-4 w-4 text-amber-500" /> : <Info className="h-4 w-4 text-sky-500" />}
                        <Badge variant="outline" className="text-[10px]">{issue.type.replace(/_/g, " ")}</Badge>
                      </div>
                      <p className="text-sm text-foreground">{issue.message}</p>
                      {issue.entity && <p className="text-xs text-muted-foreground mt-1">{issue.entity}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      {issue.path && <code className="text-[11px] text-muted-foreground">{issue.path}</code>}
                      {issue.editUrl && (
                        <a href={issue.editUrl} className="inline-flex items-center gap-1 text-xs font-medium text-forest-light hover:underline">
                          Fix <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </>
      )}

      {!data && !running && (
        <Card>
          <CardContent className="py-16 text-center">
            <RefreshCw className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground text-sm">Run an audit to scan all products, blogs, landing pages, categories, locations and media for SEO problems.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
