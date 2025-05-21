import connectMongoDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { sign } from "jsonwebtoken";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

// Define a minimal user shape for TypeScript after .lean()
type LeanUser = {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
  password: string;
};

export async function POST(request: NextRequest) {
  // 1) connect
  await connectMongoDB();

  // 2) read the form
  const form = await request.formData();
  const identifier = (form.get("identifier") as string)?.trim().toLowerCase();
  const password = form.get("password") as string;

  // 3) validate
  if (!identifier || !password) {
    return NextResponse.json(
      { message: "All fields are required" },
      { status: 400 }
    );
  }

  // 4) lookup user as a plain object
  const user = (await User.findOne({
    $or: [{ username: identifier }, { email: identifier }],
  }).lean()) as LeanUser | null;

  if (!user) {
    return NextResponse.json(
      { message: "Invalid credentials" },
      { status: 401 }
    );
  }

  // 5) check password
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return NextResponse.json(
      { message: "Invalid credentials" },
      { status: 401 }
    );
  }

  // 6) sign JWT
  const payload = { userId: user._id.toString(), username: user.username };
  const token = sign(payload, process.env.JWT_SECRET!, { expiresIn: "1h" });

  // 7) set cookie + redirect
  const res = NextResponse.redirect(new URL("/dashboard", request.url), 302);
  res.cookies.set({
    name: "token",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 180, // 3 hours
    path: "/",
    sameSite: "lax",
  });

  return res;
}
