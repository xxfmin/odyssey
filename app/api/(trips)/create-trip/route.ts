import { requireAuth } from "@/lib/auth";
import connectMongoDB from "@/lib/mongodb";
import Trip from "@/models/Trip";
import User from "@/models/User";
import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

// route for creating new trip
export async function POST(request: NextRequest): Promise<NextResponse> {
  // 1) authenticate *before* your try/catch
  const { userId } = requireAuth(request);
  const ownerId = new Types.ObjectId(userId);

  try {
    await connectMongoDB();

    const {
      title,
      destination,
      startDate,
      endDate,
      destinationLat,
      destinationLng,
    } = await request.json();

    if (!title || !destination || !startDate || !endDate) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    const user = await User.findById(ownerId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const newTrip = await Trip.create({
      title,
      destination,
      destinationLat,
      destinationLng,
      startDate,
      endDate,
      user: ownerId,
    });
    user.trips.push(newTrip._id as Types.ObjectId);
    await user.save();

    return NextResponse.json(
      {
        message: "Trip created successfully",
        trip: newTrip,
      },
      { status: 201 }
    );
  } catch (error) {
    console.log("Error creating trip:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
