import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth-options";
import { getToken } from "next-auth/jwt";

/**
 * Server-side admin guard for API routes.
 * Returns null if authorized, or a NextResponse error if not.
 * 
 * Usage:
 *   const denied = await requireAdmin(req);
 *   if (denied) return denied;
 */
export async function requireAdmin(req: Request): Promise<NextResponse | null> {
  const session = await getServerSession(authOptions);

  if (session && session.user) {
    // @ts-expect-error - role is added via JWT callback
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return null; // Authorized
  }

  // Fallback for Vercel custom domains where getServerSession drops cookies
  // because of NEXTAUTH_URL strict matching
  const token = await getToken({ 
    req: req as any, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (token.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return null; // Authorized
}
