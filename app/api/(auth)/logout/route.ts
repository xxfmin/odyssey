import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function GET(request: NextRequest) {
  // build an absolute url back to “/”
  const redirectUrl = new URL("/", request.url);

  //push user to home page
  const response = NextResponse.redirect(redirectUrl);
  // clear the JWT cookie
  response.cookies.set("token", "", {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0, // expire immediately
  });
  return response;
}
