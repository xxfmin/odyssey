import connectMongoDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { sign } from "jsonwebtoken";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

type LeanUser = {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
  password: string;
};

export async function POST(request: NextRequest) {
  await connectMongoDB();

  // parse JSON instead of formData
  const { identifier: rawId, password } = await request.json();
  const identifier = rawId?.trim().toLowerCase();

  if (!identifier || !password) {
    return NextResponse.json(
      { message: "All fields are required" },
      { status: 400 }
    );
  }

  const user = (await User.findOne({
    $or: [{ username: identifier }, { email: identifier }],
  }).lean()) as LeanUser | null;

  if (!user) {
    return NextResponse.json(
      { message: "Invalid credentials" },
      { status: 401 }
    );
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return NextResponse.json(
      { message: "Invalid credentials" },
      { status: 401 }
    );
  }

  // sign JWT
  const payload = { userId: user._id.toString(), username: user.username };
  const token = sign(payload, process.env.JWT_SECRET!, { expiresIn: "1h" });

  const res = NextResponse.redirect(new URL("/dashboard", request.url), 302);
  res.cookies.set({
    name: "token",
    value: token,
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 60 * 60 * 3, // 3 hours
  });

  return res;
}
