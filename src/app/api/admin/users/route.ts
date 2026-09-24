import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export const runtime = "nodejs";

const ROLES = ["SUPER_ADMIN", "ADMIN", "EDITOR", "SEO_MANAGER"];

/** List admin users — SUPER_ADMIN only */
export async function GET(req: NextRequest) {
  return requireAdmin(req, async (session) => {
    if (session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Only Super Admin can manage users." }, { status: 403 });
    }
    const users = await db.adminUser.findMany({
      orderBy: { createdAt: "asc" },
      select: { id: true, email: true, name: true, role: true, active: true, createdAt: true, updatedAt: true },
    });
    return NextResponse.json({ users });
  });
}

/** Create admin user — SUPER_ADMIN only */
export async function POST(req: NextRequest) {
  return requireAdmin(req, async (session) => {
    if (session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Only Super Admin can manage users." }, { status: 403 });
    }
    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    const name = String(body.name || "").trim();
    const password = String(body.password || "");
    const role = ROLES.includes(body.role) ? body.role : "EDITOR";

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email required." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }
    const exists = await db.adminUser.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json({ error: "A user with this email already exists." }, { status: 409 });
    }
    const user = await db.adminUser.create({
      data: { email, name: name || email.split("@")[0], role, passwordHash: hashPassword(password), active: true },
      select: { id: true, email: true, name: true, role: true, active: true, createdAt: true },
    });
    return NextResponse.json({ user }, { status: 201 });
  });
}
