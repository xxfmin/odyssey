// this file centralizes all of the JWT extraction + verification logic

import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";

export interface AuthPayload {
  userId: string;
  username: string;
  iat?: number;
  exp?: number;
}

// 1) grab the token out of the cookie (or authorization header)
export function getTokenFromRequest(req: NextRequest): string | null {
  // try cookie first
  const cookie = req.cookies.get("token")?.value;
  if (cookie) return cookie;

  // fallback to bearer header
  const auth = req.headers.get("authorization") || "";
  if (auth.startsWith("Bearer ")) {
    return auth.substring("Bearer ".length);
  }

  return null;
}

if (!process.env.JWT_SECRET) {
  throw new Error("Missing JWT_SECRET in .env.local!");
}

// 2) verify and decode; returns payload or throws
export function verifyJwt(token: string): AuthPayload {
  try {
    return verify(token, process.env.JWT_SECRET!) as AuthPayload;
  } catch (err) {
    throw new Error("Invalid or expired token");
  }
}

// 3) main helper you call in routes that needs auth
export function requireAuth(req: NextRequest): AuthPayload {
  const token = getTokenFromRequest(req);
  if (!token) {
    // short-circuit an unauthorized response
    throw NextResponse.json(
      { message: "Authentication token missing" },
      { status: 401 }
    );
  }

  try {
    return verifyJwt(token);
  } catch {
    throw NextResponse.json(
      { message: "Invalid or expired authentication token" },
      { status: 401 }
    );
  }
}
