import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, SESSION_COOKIE, type SessionPayload } from "@/lib/auth";

/** Reads and verifies the admin session (server components / route handlers) */
export async function getAdminSession(req?: NextRequest): Promise<SessionPayload | null> {
  let token: string | undefined;
  if (req) {
    token = req.cookies.get(SESSION_COOKIE)?.value;
  } else {
    try {
      const store = await cookies();
      token = store.get(SESSION_COOKIE)?.value;
    } catch {
      return null;
    }
  }
  return verifyToken(token);
}

/** Wrapper for admin API handlers — returns 401 response when unauthorized */
export async function requireAdmin(
  req: NextRequest,
  handler: (session: SessionPayload) => Promise<NextResponse>
): Promise<NextResponse> {
  const session = getAdminSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
  }
  try {
    return await handler(session);
  } catch (e) {
    console.error("Admin API error:", e);
    const message = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
