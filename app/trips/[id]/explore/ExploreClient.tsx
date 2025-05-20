"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export interface SerializedItineraryDay {
  _id: string;
  date: string;
  activities: string[];
}

interface ActivityItem {
  name: string;
  description: string;
  address?: string;
  website?: string;
  latitude: number;
  longitude: number;
  type: string;
}

interface Props {
  tripId: string;
  tripTitle: string;
  tripDestination: string;
  itineraryDays: SerializedItineraryDay[];
}

export default function ExploreClient({
  tripId,
  tripTitle,
  tripDestination,
  itineraryDays,
}: Props) {
  const [suggestions, setSuggestions] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // track selected day for each card
  const [selectedDays, setSelectedDays] = useState<Record<string, string>>({});
  // track which activities have been added
  const [addedActivities, setAddedActivities] = useState<
    Record<string, boolean>
  >({});

  const fetchFromGemini = useCallback(async () => {
    if (!tripDestination) {
      setError("No destination provided to fetch activities.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuggestions([]);

    try {
      const prompt =
        `You are a travel assistant. Given the destination "${tripDestination}", create a list of 24 unique, concrete activities ordered by popularity (most popular first). Do **not** suggest overly broad ideas such as “visit a neighborhood” or “go to a local bakery.” Instead, recommend specific places, venues or experiences by name (e.g. “Eiffel Tower summit access,” “Louvre: Denon Wing highlights tour,” “Seine River dinner cruise”).

For each activity, please provide:
1. "name": A short, descriptive activity name
2. "description": 2–3 sentences describing the activity, what makes it special, and why it’s worth adding
3. "address": The exact street address, landmark name, or full venue name
4. "website": The official URL, or a website that contains relevant, reliable information if no official URL.
5. "latitude": A decimal latitude for the activity location
6. "longitude": A decimal longitude for the activity location
7. "type": A short category like "sightseeing", "dining", "cultural", etc.

Respond with **only** a valid JSON array of objects, for example:

json
[
  {
    "name": "Eiffel Tower Summit Access",
    "description": "Ascend to the summit of the Eiffel Tower for panoramic views of Paris and beyond. Book your skip-the-line ticket in advance to avoid the crowds and enjoy sunset from the top.",
    "address": "Champ de Mars, 5 Avenue Anatole France, 75007 Paris, France",
    "website": "https://www.toureiffel.paris/en",
    "latitude": 48.8584,
    "longitude": 2.2945,
    "type": "sightseeing"
  },
  {
    "name": "Louvre Museum: Denon Wing Highlights Tour",
    "description": "Take a guided tour through the Denon Wing of the Louvre to see masterpieces like the Mona Lisa, Winged Victory of Samothrace, and The Coronation of Napoleon. Learn insider stories about each work as you stroll through grand halls.",
    "address": "Rue de Rivoli, 75001 Paris, France",
    "website": "https://www.louvre.fr/en",
    "latitude": 48.8606,
    "longitude": 2.3376,
    "type": "museum"
  },
  …
]
`.trim();

      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        let msg = `Gemini API returned ${res.status}`;
        try {
          msg += `: ${await res.text()}`;
        } catch {}
        throw new Error(msg);
      }

      const data = await res.json();
      let content: string;

      if (data.candidates?.length) {
        const cand = data.candidates[0];
        content =
          cand.content?.parts?.[0]?.text ||
          cand.content?.text ||
          cand.text ||
          (typeof cand.content === "string" ? cand.content : "");
      } else {
        throw new Error("Unexpected Gemini response structure.");
      }

      content = content
        .replace(/^`{3}json\s*/i, "")
        .replace(/\s*`{3}$/, "")
        .trim();

      if (!content.startsWith("[")) {
        const m = content.match(/(\[[\s\S]*\])/);
        if (m) content = m[1];
        else throw new Error("Cannot extract JSON array from Gemini response.");
      }

      const rawActivities = JSON.parse(content);
      if (!Array.isArray(rawActivities)) {
        throw new Error("Parsed Gemini data is not an array.");
      }

      const validated: ActivityItem[] = rawActivities.map(
        (item: any, i: number) => ({
          name: item.name || `Activity ${i + 1}`,
          description: item.description || "No description available.",
          address: item.address,
          website: item.website,
          latitude: Number(item.latitude) || 0,
          longitude: Number(item.longitude) || 0,
          type: item.type || "general",
        })
      );

      setSuggestions(validated);
      setLoading(false);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Unknown error fetching activities.");
      setSuggestions([]);
      setLoading(false);
    }
  }, [tripDestination]);

  useEffect(() => {
    fetchFromGemini();
  }, [fetchFromGemini]);

  const saveActivity = async (
    activity: ActivityItem,
    dayId: string,
    key: string
  ) => {
    if (!dayId) {
      alert("Please select a day first.");
      return;
    }

    try {
      const res = await fetch("/api/itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: activity.name,
          description: activity.description,
          location: { lat: activity.latitude, lng: activity.longitude },
          type: activity.type,
          tripId,
          dayId,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(err.message || `Status ${res.status}`);
      }

      // mark as added instead of alert
      setAddedActivities((prev) => ({ ...prev, [key]: true }));
    } catch (err: any) {
      console.error(err);
      alert(`Failed to save activity: ${err.message}`);
    }
  };

  return (
    <div className={`${poppins.className} p-4 md:p-8`}>
      {/* Back to trip link */}
      <Link
        href={`/trips/${tripId}`}
        className="inline-block text-indigo-600 hover:underline mb-4"
      >
        ← Back to trip
      </Link>

      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">
        Explore: {tripTitle}
      </h1>

      {loading && (
        <div className="flex flex-col justify-center items-center py-12">
          {/* first row: spinner + message */}
          <div className="flex items-center space-x-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500" />
            <p className="text-lg text-gray-600">
              Loading activity suggestions for {tripDestination}...
            </p>
          </div>
          {/* second row: timing note */}
          <p className="text-sm text-gray-500">(around 30 seconds)</p>
        </div>
      )}

      {error && !loading && (
        <div
          className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6"
          role="alert"
        >
          <strong className="font-bold">Error:</strong> {error}
        </div>
      )}

      {!loading && !error && suggestions.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No activity suggestions found.
        </div>
      )}

      {!loading && !error && suggestions.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {suggestions.map((activity, idx) => {
            const key = `${activity.name}-${idx}`;
            const selected = selectedDays[key] || "";
            const added = !!addedActivities[key];

            return (
              <div
                key={key}
                className="flex flex-col justify-between border border-gray-200 rounded-lg shadow-md hover:shadow-xl transition h-full bg-white overflow-hidden"
              >
                <div className="p-4 flex-grow flex flex-col">
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">
                    <a
                      href={activity.website ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={
                        activity.website && activity.website !== "Not Available"
                          ? "text-indigo-600 hover:underline"
                          : ""
                      }
                    >
                      {activity.name}
                    </a>
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">
                    {activity.description}
                  </p>
                  {activity.address && (
                    <p className="text-gray-500 text-xs mb-2">
                      Address: {activity.address}
                    </p>
                  )}
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50">
                  <label
                    htmlFor={`day-select-${idx}`}
                    className="text-xs font-medium text-gray-600 block mb-1"
                  >
                    Add to day:
                  </label>
                  <select
                    id={`day-select-${idx}`}
                    value={selected}
                    onChange={(e) =>
                      setSelectedDays((prev) => ({
                        ...prev,
                        [key]: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    disabled={added || !itineraryDays.length}
                  >
                    <option value="" disabled>
                      {itineraryDays.length
                        ? "Select a day"
                        : "No days available"}
                    </option>
                    {itineraryDays.map((d) => (
                      <option key={d._id} value={d._id}>
                        {format(new Date(d.date), "EEE, MMM d")}
                      </option>
                    ))}
                  </select>

                  {!added ? (
                    <button
                      onClick={() => saveActivity(activity, selected, key)}
                      disabled={!selected}
                      className="mt-2 w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
                    >
                      Add
                    </button>
                  ) : (
                    <div className="mt-2 flex items-center text-green-600 font-semibold">
                      ✓ Added to itinerary
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
