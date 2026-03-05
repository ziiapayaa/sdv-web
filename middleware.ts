import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // --- ADMIN ROUTES: require ADMIN role ---
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin") || pathname.startsWith("/api/upload")) {
    // Skip /admin/login (public)
    if (pathname === "/admin/login") return NextResponse.next();

    if (!token) {
      // Not logged in → redirect to ADMIN login
      const loginUrl = new URL("/admin/login", req.url);
      return NextResponse.redirect(loginUrl);
    }

    if (token.role !== "ADMIN") {
      // Logged in but not admin → redirect to home
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  }

  // --- CHECKOUT & ACCOUNT: require any authenticated user ---
  if (pathname.startsWith("/checkout") || pathname.startsWith("/account")) {
    if (!token) {
      // Not logged in → redirect to CUSTOMER login with callbackUrl
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin",
    "/admin/(.*)",
    "/api/admin/:path*",
    "/api/upload",
    "/checkout",
    "/account",
  ],
};
