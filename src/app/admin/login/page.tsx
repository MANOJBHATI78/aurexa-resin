"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, Mail } from "lucide-react";
import Image from "next/image";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      router.push(params.get("next") || "/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm">
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@aurexaresin.com" className="pl-9" required autoComplete="username" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="pl-9" required autoComplete="current-password" />
        </div>
      </div>
      {error && <p className="text-destructive text-sm font-medium" role="alert">{error}</p>}
      <Button type="submit" disabled={loading} className="btn-gold w-full">
        {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</> : "Sign In"}
      </Button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="hero-dark min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-card shadow-2xl border border-gold/30 overflow-hidden">
          <div className="hero-dark px-8 py-8 text-center">
            <Image
              src="/uploads/aurexa-logo-crop.png"
              alt="Aurexa Resin"
              width={90}
              height={90}
              className="rounded-full border border-gold/40 mx-auto"
            />
            <h1 className="font-display text-xl font-bold text-cream mt-4">Aurexa Resin CMS</h1>
            <p className="text-cream/50 text-xs mt-1 tracking-widest uppercase">Admin Panel</p>
          </div>
          <div className="p-8 flex justify-center">
            <Suspense fallback={<Loader2 className="h-5 w-5 animate-spin text-gold-dark" />}>
              <LoginForm />
            </Suspense>
          </div>
        </div>
        <p className="text-center text-cream/40 text-xs mt-4">
          Default credentials: admin@aurexaresin.com / Aurexa@123 — change the password after first login.
        </p>
      </div>
    </div>
  );
}
