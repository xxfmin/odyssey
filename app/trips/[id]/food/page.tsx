// app/trips/[id]/explore-food/page.tsx
import React from "react";
import { notFound } from "next/navigation";
import Trip from "@/models/Trip";
import { ItineraryDayModel } from "@/models/Trip";
import ExploreFoodClient, { SerializedItineraryDay } from "./FoodClient";

interface PageProps {
  params: { id: string };
}

export default async function ExploreFoodPage(props: PageProps) {
  const { id: tripId } = await props.params;

  // 1) fetch the trip (title, destination, itinerary IDs)
  const tripDoc = await Trip.findById(tripId)
    .select("title destination itinerary")
    .lean();
  if (!tripDoc) notFound();

  // 2) fetch all days belonging to that trip
  const rawDays = await ItineraryDayModel.find({
    _id: { $in: tripDoc.itinerary },
  })
    .select("date activities")
    .lean();

  // 3) serialize for the client: ObjectId -> string, Date -> ISO string
  const itineraryDays: SerializedItineraryDay[] = rawDays.map((day) => ({
    _id: day._id.toString(),
    date: day.date.toISOString(),
    activities: day.activities.map((a) => a.toString()),
  }));

  return (
    <ExploreFoodClient
      tripId={tripId}
      tripTitle={tripDoc.title}
      tripDestination={tripDoc.destination}
      itineraryDays={itineraryDays}
    />
  );
}
