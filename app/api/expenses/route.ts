import { requireAuth } from "@/lib/auth";
import connectMongoDB from "@/lib/mongodb";
import Expense from "@/models/Expense";
import Trip from "@/models/Trip";
import User from "@/models/User";
import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // make sure user is signed in
    const { userId } = requireAuth(request);
    const ownerId = new Types.ObjectId(userId);

    await connectMongoDB();

    const user = await User.findById(ownerId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const { amount, type, date, tripId } = await request.json();
    if (!amount || !type || !date || !tripId) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return NextResponse.json({ message: "Trip not found" }, { status: 404 });
    }

    const newExpense = await Expense.create({
      amount,
      type,
      date,
      trip: tripId,
    });

    trip.expenses.push(newExpense._id as Types.ObjectId);
    await trip.save();

    return NextResponse.json(
      {
        message: "Expense created successfully",
        expense: newExpense,
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

export async function DELETE(request: NextRequest) {
  try {
    // make sure user is signed in
    const { userId } = requireAuth(request);
    await connectMongoDB();

    const { expenseId, tripId } = await request.json();
    if (!expenseId || !tripId) {
      return NextResponse.json(
        { message: "expenseId and tripId are missing" },
        { status: 400 }
      );
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return NextResponse.json({ message: "Trip not found" }, { status: 404 });
    }

    // remove the expense from the expense array within the trip
    await Trip.findByIdAndUpdate(tripId, {
      $pull: { expenses: new Types.ObjectId(expenseId) },
    });
    await Expense.findByIdAndDelete(expenseId);

    return NextResponse.json(
      { message: "Expense deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // get JWT token username
    const { userId } = requireAuth(request);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
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

    const trip = await Trip.findById(tripId).populate("expenses");
    if (!trip) {
      return NextResponse.json({ message: "Trip not found" }, { status: 404 });
    }

    const expenses = trip.expenses;

    return NextResponse.json(
      {
        message: "Expenses retrieved successfully",
        expenses,
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
