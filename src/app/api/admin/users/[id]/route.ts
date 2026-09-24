import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export const runtime = "nodejs";

const ROLES = ["SUPER_ADMIN", "ADMIN", "EDITOR", "SEO_MANAGER"];

async function superAdminCount(): Promise<number> {
  return db.adminUser.count({ where: { role: "SUPER_ADMIN", active: true } });
}

/** Update user (role / name / active / password) — SUPER_ADMIN only */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return requireAdmin(req, async (session) => {
    if (session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Only Super Admin can manage users." }, { status: 403 });
    }
    const { id } = await params;
    const target = await db.adminUser.findUnique({ where: { id } });
    if (!target) return NextResponse.json({ error: "User not found." }, { status: 404 });

    const body = await req.json();
    const data: Record<string, string | boolean> = {};

    if (typeof body.name === "string" && body.name.trim()) data.name = body.name.trim();
    if (typeof body.role === "string" && ROLES.includes(body.role)) data.role = body.role;
    if (typeof body.active === "boolean") data.active = body.active;
    if (typeof body.password === "string" && body.password) {
      if (body.password.length < 8) {
        return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
      }
      data.passwordHash = hashPassword(body.password);
    }

    // Safety rails: never lock yourself out of the system
    if (target.role === "SUPER_ADMIN") {
      const demoting = typeof data.role === "string" && data.role !== "SUPER_ADMIN";
      const deactivating = data.active === false;
      if ((demoting || deactivating) && (await superAdminCount()) <= 1) {
        return NextResponse.json(
          { error: "Cannot demote or deactivate the last Super Admin." },
          { status: 400 },
        );
      }
    }

    const user = await db.adminUser.update({
      where: { id },
      data,
      select: { id: true, email: true, name: true, role: true, active: true, updatedAt: true },
    });
    return NextResponse.json({ user });
  });
}

/** Delete user — SUPER_ADMIN only, cannot delete self or last super admin */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return requireAdmin(req, async (session) => {
    if (session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Only Super Admin can manage users." }, { status: 403 });
    }
    const { id } = await params;
    if (id === session.sub) {
      return NextResponse.json({ error: "You cannot delete your own account." }, { status: 400 });
    }
    const target = await db.adminUser.findUnique({ where: { id } });
    if (!target) return NextResponse.json({ error: "User not found." }, { status: 404 });
    if (target.role === "SUPER_ADMIN" && (await superAdminCount()) <= 1) {
      return NextResponse.json({ error: "Cannot delete the last Super Admin." }, { status: 400 });
    }
    await db.adminUser.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  });
}
