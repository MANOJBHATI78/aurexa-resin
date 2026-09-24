import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth";

export const runtime = "nodejs";

/** Get own profile */
export async function GET(req: NextRequest) {
  return requireAdmin(req, async (session) => {
    const user = await db.adminUser.findUnique({
      where: { id: session.sub },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    return NextResponse.json({ user });
  });
}

/** Change own name and/or password (requires current password for password change) */
export async function POST(req: NextRequest) {
  return requireAdmin(req, async (session) => {
    const body = await req.json();
    const user = await db.adminUser.findUnique({ where: { id: session.sub } });
    if (!user) return NextResponse.json({ error: "Account not found." }, { status: 404 });

    const data: Record<string, string> = {};
    if (typeof body.name === "string" && body.name.trim()) data.name = body.name.trim();

    if (typeof body.newPassword === "string" && body.newPassword) {
      if (body.newPassword.length < 8) {
        return NextResponse.json({ error: "New password must be at least 8 characters." }, { status: 400 });
      }
      const ok = verifyPassword(String(body.currentPassword || ""), user.passwordHash);
      if (!ok) {
        return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
      }
      data.passwordHash = hashPassword(body.newPassword);
    }

    if (!Object.keys(data).length) {
      return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
    }
    await db.adminUser.update({ where: { id: user.id }, data });
    return NextResponse.json({ ok: true });
  });
}
