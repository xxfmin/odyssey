// middleware.ts: pushes users to home page if they're not logged in
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// any paths you want to allow through without auth:
const PUBLIC_PATHS = ["/", "/login", "/signup"];
const STATIC_FILE = /\.(.*)$/;

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1) allow static files and Next internals
  if (
    STATIC_FILE.test(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  // 2) allow any explicitly public routes
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // 3) check for our auth cookie
  const token = req.cookies.get("token")?.value;
  if (!token) {
    // redirect to landing page
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // 4) otherwise, let them through
  return NextResponse.next();
}

export const config = {
  // apply this middleware to all routes except /api/*
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
