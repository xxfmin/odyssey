import { requireAuth } from "@/lib/auth";
import connectMongoDB from "@/lib/mongodb";
import Activity from "@/models/Activity";
import Trip, { ItineraryDayModel } from "@/models/Trip";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // get JWT token username
    const { userId } = requireAuth(request);
    if (!userId) {
      return NextResponse.json({ message: "Unathorized" }, { status: 401 });
    }

    await connectMongoDB();
    const url = new URL(request.url);
    const tripId = url.searchParams.get("tripId");
    if (!tripId) {
      return NextResponse.json(
        { message: "tripId is required" },
        { status: 400 }
      );
    }

    // populate both itinerary days and their nested activities
    const trip = await Trip.findById(tripId)
      .populate({
        path: "itinerary",
        options: { sort: { date: 1 } }, // sort days by date
        populate: {
          path: "activities", // populate each day's activities
          options: { sort: { time: 1 } }, // sort activities by time
        },
      })
      .lean();

    if (!trip) {
      return NextResponse.json({ message: "Trip not found" }, { status: 404 });
    }

    const itinerary = trip.itinerary;

    return NextResponse.json(
      {
        message: "Itinerary retrieved successfully",
        itinerary,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error retrieving itinerary:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // auth
    const { userId } = requireAuth(request);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectMongoDB();

    // parse + validate
    const {
      title,
      time,
      description,
      location, // { lat: number, lng: number }
      type,
      tripId,
      dayId,
    } = await request.json();

    if (
      !title ||
      !type ||
      !location?.lat ||
      !location?.lng ||
      !tripId ||
      !dayId
    ) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // create activity
    const newActivity = await Activity.create({
      title,
      time,
      description,
      location,
      type,
      itineraryDay: dayId,
    });

    // attach activity to itinerary day
    await ItineraryDayModel.findByIdAndUpdate(dayId, {
      $push: { activities: newActivity._id },
    });

    return NextResponse.json(
      { message: "Activity created", activity: newActivity },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error creating activity:", err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // auth
    const { userId } = requireAuth(request);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectMongoDB();

    // parse + validate
    const { tripId, dayId, activityId } = await request.json();
    if (!tripId || !dayId || !activityId) {
      return NextResponse.json(
        { message: "tripId, dayId and activityId are required" },
        { status: 400 }
      );
    }

    // verify if day belongs to trip
    const trip = await Trip.findById(tripId).lean();
    if (!trip) {
      return NextResponse.json({ message: "Trip not found" }, { status: 404 });
    }
    const itineraryIds = trip.itinerary.map((id) => id.toString());
    if (!itineraryIds.includes(dayId)) {
      return NextResponse.json(
        { message: "Day does not belong to this trip" },
        { status: 400 }
      );
    }

    // pull activity from day
    await ItineraryDayModel.findByIdAndUpdate(dayId, {
      $pull: { activities: activityId },
    });

    // delete activity document
    await Activity.findByIdAndDelete(activityId);

    return NextResponse.json(
      { message: "Activity deleted successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error deleting activity:", err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
