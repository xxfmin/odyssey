import { requireAuth } from "@/lib/auth";
import connectMongoDB from "@/lib/mongodb";
import Trip from "@/models/Trip";
import User from "@/models/User";
import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

// route for creating new trip
export async function POST(request: NextRequest) {
  try {
    // get JWT token username
    const { userId } = requireAuth(request);
    // turn it into a mongo ObjectId
    const ownerId = new Types.ObjectId(userId);

    await connectMongoDB();

    // take in input from request
    const {
      title,
      destination,
      startDate,
      endDate,
      destinationLat,
      destinationLng,
    } = await request.json();

    // basic validation
    if (!title || !destination || !startDate || !endDate) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    // find user
    const user = await User.findById(ownerId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // create trip
    const newTrip = await Trip.create({
      title,
      destination,
      destinationLat,
      destinationLng,
      startDate,
      endDate,
      user: ownerId,
    });

    // add trip to user's trips
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
