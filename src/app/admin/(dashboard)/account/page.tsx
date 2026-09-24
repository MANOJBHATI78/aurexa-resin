"use client";

import { useEffect, useState } from "react";
import { Loader2, KeyRound, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function AdminAccountPage() {
  const { toast } = useToast();
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/admin/account")
      .then((r) => r.json())
      .then((d) => {
        setUser(d.user);
        setName(d.user?.name || "");
      })
      .catch(() => toast({ title: "Failed to load account", variant: "destructive" }));
  }, [toast]);

  async function save() {
    if (newPassword && newPassword !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          ...(newPassword ? { currentPassword, newPassword } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      toast({ title: "Account updated", description: newPassword ? "Password changed — use it on next login." : "Name saved." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e) {
      toast({ title: e instanceof Error ? e.message : "Save failed", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  }

  if (!user) {
    return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-gold-dark" /></div>;
  }

  return (
    <div className="space-y-4 max-w-xl pb-16">
      <div>
        <h1 className="font-display text-2xl font-bold text-forest">My Account</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {user.email} · {user.role.replace("_", " ")}
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-gold-dark" /> Profile &amp; Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3.5">
          <div className="space-y-1.5">
            <Label htmlFor="ac-name">Display Name</Label>
            <Input id="ac-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="pt-2 space-y-3.5 border-t">
            <p className="text-sm font-medium pt-3">Change Password</p>
            <div className="space-y-1.5">
              <Label htmlFor="ac-cur">Current Password</Label>
              <Input id="ac-cur" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} autoComplete="current-password" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ac-new">New Password</Label>
              <Input id="ac-new" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" placeholder="Min 8 characters" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ac-con">Confirm New Password</Label>
              <Input id="ac-con" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" />
            </div>
          </div>
          <Button onClick={save} disabled={busy} className="btn-gold w-full">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Save Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
