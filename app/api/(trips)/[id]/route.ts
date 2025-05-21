import { requireAuth } from "@/lib/auth";
import connectMongoDB from "@/lib/mongodb";
import Expense from "@/models/Expense";
import Trip, { ItineraryDayModel } from "@/models/Trip";
import { NextRequest, NextResponse } from "next/server";

// GET handler
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  // 1) authenticate *before* your try/catch
  const { userId } = requireAuth(request);

  try {
    const { id } = await params;
    await connectMongoDB();

    const trip = await Trip.findById(id);
    if (!trip) {
      return NextResponse.json({ message: "Trip not found" }, { status: 404 });
    }
    // (optional) ensure the trip belongs to the current user
    if (trip.user.toString() !== userId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(trip);
  } catch (error) {
    console.error("Error retrieving trip:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE handler
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  // 1) authenticate *before* your try/catch
  const { userId } = requireAuth(request);

  try {
    const { id } = await params;
    await connectMongoDB();

    const trip = await Trip.findById(id);
    if (!trip) {
      return NextResponse.json({ message: "Trip not found" }, { status: 404 });
    }
    if (trip.user.toString() !== userId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // cascade-delete itinerary days & expenses
    if (Array.isArray(trip.itinerary) && trip.itinerary.length > 0) {
      await ItineraryDayModel.deleteMany({ _id: { $in: trip.itinerary } });
    }
    await Expense.deleteMany({ trip: trip._id });
    await Trip.findByIdAndDelete(id);

    return NextResponse.json(
      { message: "Trip and all associated data deleted." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting trip:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
