import connectMongoDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { sign } from "jsonwebtoken";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    await connectMongoDB();
    const { identifier, password } = await request.json();

    if (!identifier || !password) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    const normalized = identifier.trim().toLowerCase();
    const user = await User.findOne({
      $or: [{ username: normalized }, { email: normalized }],
    });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (!(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ message: "Your password is incorrect" }, { status: 401 });
    }

    const payload = {
      userId: (user._id as mongoose.Types.ObjectId).toString(),
      username: user.username,
    };
    const token = sign(payload, process.env.JWT_SECRET!, { expiresIn: "1h" });

    // *** 302 REDIRECT SO FETCH WILL SWITCH TO GET /dashboard ***
    const response = NextResponse.redirect(new URL("/dashboard", request.url), 302);
    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 180,
      path: "/",
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Error logging in:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}