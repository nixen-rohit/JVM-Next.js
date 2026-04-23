// middleware.ts - UPDATED with new route protections
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get("auth_session")?.value;

  // ✅ Public APIs - NO auth required
  const publicApiPatterns = [
    /^\/api\/auth\//,
    /^\/api\/contacts$/,
    /^\/api\/hero-slides$/,
    /^\/api\/upload$/,
    /^\/api\/projects\/slug\//, // ✅ Public project fetch by slug
    /^\/api\/projects\/slug$/, // ✅ Public slug list
  ];

  if (publicApiPatterns.some((pattern) => pattern.test(pathname))) {
    // Allow GET requests to public APIs
    if (request.method === "GET") {
      return NextResponse.next();
    }
    // Block non-GET to public APIs unless authenticated
    if (request.method !== "GET" && !token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // ✅ Public login page
  if (pathname === "/login") {
    if (token) {
      const user = await verifyToken(token);
      if (user) {
        const redirectTo =
          request.nextUrl.searchParams.get("redirect") || "/admin";
        return NextResponse.redirect(new URL(redirectTo, request.url));
      }
    }
    return NextResponse.next();
  }

  // 🔒 Protect ALL /admin routes
  if (pathname.startsWith("/admin")) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname + search);
      return NextResponse.redirect(loginUrl);
    }

    const user = await verifyToken(token);
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname + search);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete("auth_session");
      return response;
    }
  }

  // 🔒 Protect Admin API routes (POST/PUT/DELETE)
  if (
    pathname.startsWith("/api/admin") ||
    (pathname.match(/^\/api\/projects\/\d+$/) && request.method !== "GET")
  ) {
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/login",
    "/api/contacts",
    "/api/admin/:path*",
    "/api/projects/:path*",
  ],
};
