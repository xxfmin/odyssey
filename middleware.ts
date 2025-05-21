// middleware.ts: pushes users to home page if they're not logged in
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // only guard /dashboard and /trips/*
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/trips")) {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  // everything else is public
  return NextResponse.next();
}

export const config = {
  // only run this middleware on /dashboard* and /trips*
  matcher: ["/dashboard/:path*", "/trips/:path*"],
};
