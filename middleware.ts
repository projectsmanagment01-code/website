import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/jwt";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Allow login page and auth API endpoints
  if (
    pathname.startsWith("/admin/login") ||
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/api/auth/verify")
  ) {
    const response = NextResponse.next();
    response.headers.set("x-pathname", pathname);
    return response;
  }

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    // For client-side routes, let the component handle auth
    const response = NextResponse.next();
    response.headers.set("x-pathname", pathname);
    return response;
  }

  // Protect API routes (except public ones)
  if (pathname.startsWith("/api/")) {
    // Allow public API routes
    const publicRoutes = [
      "/api/uploads", // File serving
    ];

    const isPublicRoute = publicRoutes.some((route) =>
      pathname.startsWith(route)
    );

    // Allow public GET requests to recipe endpoints (anyone can read recipes)
    const isPublicRecipeRead =
      pathname.startsWith("/api/recipe") && request.method === "GET";

    if (isPublicRoute || isPublicRecipeRead) {
      const response = NextResponse.next();
      response.headers.set("x-pathname", pathname);
      return response;
    }

    // Check for development environment or SKIP_AUTH
    const isDevelopment = process.env.NODE_ENV === "development";
    const skipAuth = process.env.SKIP_AUTH === "true";

    if (isDevelopment || skipAuth) {
      console.log(
        `🔓 Skipping auth for ${pathname} (development mode or SKIP_AUTH=true)`
      );
      const response = NextResponse.next();
      response.headers.set("x-pathname", pathname);
      return response;
    }

    // Check for authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authorization header required" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Add user info to request headers for API routes to use
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", payload.sub.toString());
    requestHeaders.set("x-user-email", payload.email);
    requestHeaders.set("x-user-role", payload.role);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // For all other routes (main website), add pathname header
  const response = NextResponse.next();
  response.headers.set("x-pathname", pathname);
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
