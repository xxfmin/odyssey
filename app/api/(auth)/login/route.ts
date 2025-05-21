import connectMongoDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { sign } from "jsonwebtoken";
import mongoose, { Document } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

// 1) Define an interface matching your User model
interface IUser {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
  password: string;
}

// 2) Tell TS that our Mongoose result is a Document + IUser
type UserDoc = Document & IUser;

export async function POST(request: NextRequest) {
  try {
    await connectMongoDB();

    const { identifier, password } = await request.json();
    if (!identifier || !password) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    const normalized = identifier.trim().toLowerCase();

    // 3) Cast findOne() result to UserDoc | null
    const userDoc = (await User.findOne({
      $or: [{ username: normalized }, { email: normalized }],
    })) as UserDoc | null;

    if (!userDoc) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // 4) Now TS knows userDoc._id is an ObjectId
    if (!(await bcrypt.compare(password, userDoc.password))) {
      return NextResponse.json(
        { message: "Your password is incorrect" },
        { status: 401 }
      );
    }

    // 5) Create the JWT payload
    const payload = {
      userId: userDoc._id.toString(),
      username: userDoc.username,
    };
    const token = sign(payload, process.env.JWT_SECRET!, { expiresIn: "1h" });

    // 6) Build your JSON response and set the cookie on it
    const res = NextResponse.json(
      {
        success: true,
        user: {
          username: userDoc.username,
          email: userDoc.email,
          _id: userDoc._id,
        },
      },
      { status: 200 }
    );
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
  } catch (error) {
    console.error("Error logging in:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
