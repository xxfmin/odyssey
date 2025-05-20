import { requireAuth } from "@/lib/auth";
import connectMongoDB from "@/lib/mongodb";
import User from "@/models/User";
import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // get JWT token username
    const { userId } = requireAuth(request);
    if (!userId) {
      NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // turn it into a mongo ObjectId
    const ownerId = new Types.ObjectId(userId);

    await connectMongoDB();

    const user = await User.findById(ownerId).populate("trips");
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    const trips = user.trips;

    return NextResponse.json(
      {
        message: "Trips retrieved successfully",
        trips,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error retrieving trips:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
