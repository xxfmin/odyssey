import connectMongoDB from "@/lib/mongodb";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    //connect to database
    await connectMongoDB();

    // take in user data from request
    const { username, email, password, confirmPassword, firstName, lastName } =
      await request.json();

    // basic validation
    if (
      !username ||
      !email ||
      !password ||
      !confirmPassword ||
      !firstName ||
      !lastName
    ) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { message: "Passwords do not match" },
        { status: 400 }
      );
    }

    // trim username/email and covert to lowercase
    const trimmedUsername = username.trim().toLowerCase();
    const trimmedEmail = email.trim().toLowerCase();

    // check if username already exists
    const existingUsername = await User.findOne({ username: trimmedUsername });
    if (existingUsername) {
      return NextResponse.json(
        { message: "Username already exists" },
        { status: 400 }
      );
    }

    // check if email already exists
    const existingEmail = await User.findOne({ email: trimmedEmail });
    if (existingEmail) {
      return NextResponse.json(
        { message: "Email already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const newUser = await User.create({
      username: trimmedUsername,
      email: trimmedEmail,
      password: hashedPassword,
      firstName,
      lastName,
    });

    return NextResponse.json(
      {
        message: "User created successfully",
        newUser,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
