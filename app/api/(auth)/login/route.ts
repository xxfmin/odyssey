import connectMongoDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { sign } from "jsonwebtoken";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  console.log("👉 [API] POST /api/login called");

  try {
    await connectMongoDB();
    console.log("🔗 Connected to MongoDB");

    const { identifier, password } = await request.json();
    console.log("📥 Payload:", { identifier, password: password ? "***" : null });

    if (!identifier || !password) {
      console.log("⚠️ Missing fields");
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    const normalized = identifier.trim().toLowerCase();
    const user = await User.findOne({
      $or: [{ username: normalized }, { email: normalized }],
    });
    console.log("🔍 User lookup:", user ? user._id : "not found");

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    if (!(await bcrypt.compare(password, user.password))) {
      console.log("❌ Password mismatch");
      return NextResponse.json({ message: "Your password is incorrect" }, { status: 401 });
    }

    const payload = {
      userId: user._id.toString(),
      username: user.username,
    };
    const token = sign(payload, process.env.JWT_SECRET!, { expiresIn: "1h" });
    console.log("✅ JWT signed:", token.substring(0, 10) + "...");

    // create JSON response and set cookie on it
    const res = NextResponse.json(
      {
        success: true,
        user: {
          username: user.username,
          email: user.email,
          _id: user._id,
        },
      },
      { status: 200 }
    );

    // DEV‐ONLY: make the cookie visible to document.cookie so we can debug.
    // In production, switch httpOnly: true.
    const isDev = process.env.NODE_ENV !== "production";

    res.cookies.set({
      name: "token",
      value: token,
      httpOnly: !isDev,      // <— false in dev to let document.cookie see it
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 180,
      path: "/",
      sameSite: "lax",
    });
    console.log(`🍪 Set-Cookie header sent (httpOnly=${!isDev})`);

    return res;
  } catch (error) {
    console.error("🔥 Error in POST /api/login:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
