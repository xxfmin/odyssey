import connectMongoDB from "@/lib/mongodb";
import Trip from "@/models/Trip";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";

// delete user by id
export async function DELETE(request: NextRequest) {
  try {
    await connectMongoDB();

    const { username } = await request.json();

    const formattedUsername = username.trim().toLowerCase();

    const user = await User.findOneAndDelete({
      username: formattedUsername,
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // delete associated trips
    await Trip.deleteMany({ username: formattedUsername });

    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error deleting user:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
