import connectMongoDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { sign } from "jsonwebtoken";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // connect to database
    await connectMongoDB();

    // take in user data from request
    const { identifier, password } = await request.json();

    // basic validation
    if (!identifier || !password) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    // normalize input
    const normalized = identifier.trim().toLowerCase();

    // query by username/email
    const user = await User.findOne({
      $or: [{ username: normalized }, { email: normalized }],
    });

    // make sure user exists
    if (!user) {
      return NextResponse.json(
        {
          message: "User not found",
        },
        { status: 404 }
      );
    }

    // compare hashed password with stored password
    if (!(await bcrypt.compare(password, user.password))) {
      return NextResponse.json(
        { message: "Your password is incorrect" },
        { status: 401 }
      );
    }

    // jwt creation
    const payload = {
      userId: (user._id as mongoose.Types.ObjectId).toString(),
      username: user.username,
    };
    const token = sign(payload, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });

    // cookie setup
    const response = NextResponse.json(
      { message: "Login successful", user },
      { status: 200 }
    );
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 180 * 60, // 180 * 60 seconds = 3 hours
      path: "/",
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Error logging in:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
