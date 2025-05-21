import React from "react";
import { notFound } from "next/navigation";
import Trip from "@/models/Trip";
import { ItineraryDayModel } from "@/models/Trip";
import ExploreClient, { SerializedItineraryDay } from "./ExploreClient";
import connectMongoDB from "@/lib/mongodb";

// Tell TS that params comes in as a Promise
type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ExplorePage({ params }: PageProps) {
  // now await the promise before destructuring
  const { id: tripId } = await params;

  await connectMongoDB();

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

  // 3) serialize for the client: ObjectId → string, Date → ISO string
  const itineraryDays: SerializedItineraryDay[] = rawDays.map((day) => ({
    _id: day._id.toString(),
    date: day.date.toISOString(),
    activities: day.activities.map((a) => a.toString()),
  }));

  return (
    <ExploreClient
      tripId={tripId}
      tripTitle={tripDoc.title}
      tripDestination={tripDoc.destination}
      itineraryDays={itineraryDays}
    />
  );
}
