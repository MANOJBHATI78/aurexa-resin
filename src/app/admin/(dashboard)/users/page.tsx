"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, Pencil, Trash2, KeyRound, ShieldCheck, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface AdminUserRow {
  id: string;
  email: string;
  name: string;
  role: string;
  active: boolean;
  createdAt?: string;
}

const ROLE_OPTIONS = [
  { value: "SUPER_ADMIN", label: "Super Admin — full control incl. users" },
  { value: "ADMIN", label: "Admin — everything except user management" },
  { value: "SEO_MANAGER", label: "SEO Manager — settings, SEO & content" },
  { value: "EDITOR", label: "Editor — products, blog, categories only" },
];

const emptyForm = { name: "", email: "", password: "", role: "EDITOR" };

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<AdminUserRow[] | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<AdminUserRow | null>(null);
  const [editPassword, setEditPassword] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setUsers(data.users);
    } catch (e) {
      toast({ title: e instanceof Error ? e.message : "Load failed", variant: "destructive" });
      setUsers([]);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  async function addUser() {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Create failed");
      toast({ title: "User created", description: `${data.user.email} can log in now.` });
      setAddOpen(false);
      setForm(emptyForm);
      load();
    } catch (e) {
      toast({ title: e instanceof Error ? e.message : "Create failed", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  }

  async function patchUser(id: string, body: Record<string, unknown>, okMsg: string) {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      toast({ title: okMsg });
      setEditing(null);
      setEditPassword("");
      load();
    } catch (e) {
      toast({ title: e instanceof Error ? e.message : "Update failed", variant: "destructive" });
    }
  }

  async function deleteUser(u: AdminUserRow) {
    if (!confirm(`Delete user ${u.email}? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/users/${u.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      toast({ title: "User deleted" });
      load();
    } catch (e) {
      toast({ title: e instanceof Error ? e.message : "Delete failed", variant: "destructive" });
    }
  }

  if (!users) {
    return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-gold-dark" /></div>;
  }

  return (
    <div className="space-y-4 max-w-4xl pb-16">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-forest">Admin Users</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Add team members with roles &amp; permissions. Change passwords anytime.
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="btn-gold">
          <Plus className="h-4 w-4" /> Add User
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="font-display text-lg">All Users ({users.length})</CardTitle></CardHeader>
        <CardContent className="space-y-2.5">
          {users.map((u) => (
            <div key={u.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border px-3.5 py-3">
              <div className="min-w-0">
                <p className="font-medium text-forest text-sm flex items-center gap-2">
                  {u.name}
                  <span className={`text-[10px] font-bold uppercase tracking-wide rounded-full px-2 py-0.5 ${
                    u.role === "SUPER_ADMIN" ? "bg-gold/20 text-gold-dark" : "bg-forest-mist text-forest"
                  }`}>{u.role.replace("_", " ")}</span>
                  {!u.active && <span className="text-[10px] font-bold uppercase rounded-full px-2 py-0.5 bg-red-100 text-red-700">Disabled</span>}
                </p>
                <p className="text-xs text-muted-foreground">{u.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 mr-1">
                  <Switch
                    checked={u.active}
                    aria-label={`Toggle active for ${u.email}`}
                    onCheckedChange={(v) => patchUser(u.id, { active: v }, v ? "User enabled" : "User disabled")}
                  />
                  {u.active ? <ShieldCheck className="h-4 w-4 text-forest-light" aria-hidden /> : <ShieldOff className="h-4 w-4 text-muted-foreground" aria-hidden />}
                </div>
                <Button variant="outline" size="sm" onClick={() => { setEditing(u); setEditPassword(""); }}>
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Button>
                <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => deleteUser(u)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
          {users.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No users found.</p>}
        </CardContent>
      </Card>

      {/* Add user dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Add Admin User</DialogTitle>
          </DialogHeader>
          <div className="space-y-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="nu-name">Name</Label>
              <Input id="nu-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Team member name" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nu-email">Login Email</Label>
              <Input id="nu-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@aurexaresin.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nu-pass">Password</Label>
              <Input id="nu-pass" type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min 8 characters" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nu-role">Role &amp; Permission</Label>
              <select
                id="nu-role"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {ROLE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <Button onClick={addUser} disabled={busy} className="btn-gold w-full">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Create User
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit user dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Edit — {editing?.email}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="ed-name">Name</Label>
                <Input id="ed-name" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ed-role">Role &amp; Permission</Label>
                <select
                  id="ed-role"
                  value={editing.role}
                  onChange={(e) => setEditing({ ...editing, role: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {ROLE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ed-pass" className="flex items-center gap-1.5"><KeyRound className="h-3.5 w-3.5" /> New Password</Label>
                <Input id="ed-pass" type="text" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} placeholder="Leave empty to keep current password" />
              </div>
              <Button
                onClick={() =>
                  patchUser(
                    editing.id,
                    {
                      name: editing.name,
                      role: editing.role,
                      ...(editPassword ? { password: editPassword } : {}),
                    },
                    "User updated",
                  )
                }
                className="btn-gold w-full"
              >
                Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
