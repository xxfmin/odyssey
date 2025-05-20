// app/trips/[id]/food/ExploreFoodClient.tsx
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

interface RestaurantItem {
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

export default function ExploreFoodClient({
  tripId,
  tripTitle,
  tripDestination,
  itineraryDays,
}: Props) {
  const [suggestions, setSuggestions] = useState<RestaurantItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // track selected day for each card
  const [selectedDays, setSelectedDays] = useState<Record<string, string>>({});
  // track which items have been added
  const [added, setAdded] = useState<Record<string, boolean>>({});

  const fetchFromGemini = useCallback(async () => {
    if (!tripDestination) {
      setError("No destination provided to fetch restaurants.");
      return;
    }
    setLoading(true);
    setError(null);

    const prompt = `
You are a travel assistant. Given the destination "${tripDestination}", create a list of 24 unique, concrete restaurant recommendations ordered by popularity (most popular first). For each, provide:
1. "name": Name of the restaurant
2. "description": 2–3 sentences about cuisine/style and why it's special
3. "address": Full address
4. "website": Official URL or reliable info page
5. "latitude": Decimal latitude
6. "longitude": Decimal longitude
7. "type": A short category like "fine dining", "casual", "street food", etc.

Respond with **only** a JSON array. Example:

\`\`\`json
[
  {
    "name": "Joe’s Seafood Bar",
    "description": "A waterfront staple known for jumbo shrimp and oysters. ...",
    "address": "123 Harbor Rd, City, State ZIP",
    "website": "https://joesseafood.example.com",
    "latitude": 37.7749,
    "longitude": -122.4194,
    "type": "seafood"
  },
  …
]
\`\`\`
`.trim();

    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) throw new Error(`Gemini API returned ${res.status}`);

      const data = await res.json();
      const cand = data.candidates?.[0];
      let content =
        cand?.content?.parts?.[0]?.text ||
        (typeof cand?.content === "string" ? cand.content : "");
      content = content
        .replace(/^```json\s*/i, "")
        .replace(/```$/, "")
        .trim();

      if (!content.startsWith("[")) {
        const m = content.match(/(\[[\s\S]*\])/);
        if (m) content = m[1];
        else throw new Error("Cannot parse JSON array from Gemini.");
      }

      const raw = JSON.parse(content);
      if (!Array.isArray(raw)) throw new Error("Parsed data is not an array.");

      const restaurants: RestaurantItem[] = raw.map((item: any, i: number) => ({
        name: item.name || `Restaurant ${i + 1}`,
        description: item.description || "",
        address: item.address,
        website: item.website,
        latitude: Number(item.latitude) || 0,
        longitude: Number(item.longitude) || 0,
        type: item.type || "restaurant",
      }));

      setSuggestions(restaurants);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Unknown error fetching restaurants.");
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [tripDestination]);

  useEffect(() => {
    fetchFromGemini();
  }, [fetchFromGemini]);

  const saveToItinerary = async (
    restaurant: RestaurantItem,
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
          title: restaurant.name,
          description: restaurant.description,
          location: {
            lat: restaurant.latitude,
            lng: restaurant.longitude,
          },
          type: restaurant.type,
          tripId,
          dayId,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(err.message || `Status ${res.status}`);
      }
      setAdded((prev) => ({ ...prev, [key]: true }));
    } catch (err: any) {
      console.error(err);
      alert(`Failed to save restaurant: ${err.message}`);
    }
  };

  return (
    <div className={`${poppins.className} p-4 md:p-8`}>
      <Link
        href={`/trips/${tripId}`}
        className="inline-block text-indigo-600 hover:underline mb-4"
      >
        ← Back to trip
      </Link>

      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">
        Explore Food: {tripTitle}
      </h1>

      {loading && (
        <div className="flex flex-col justify-center items-center py-12">
          <div className="flex items-center space-x-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500" />
            <p className="text-lg text-gray-600">
              Loading restaurant suggestions…
            </p>
          </div>
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
          No restaurant suggestions found.
        </div>
      )}

      {!loading && !error && suggestions.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {suggestions.map((r, idx) => {
            const key = `${r.name}-${idx}`;
            const selected = selectedDays[key] || "";
            const isAdded = !!added[key];

            return (
              <div
                key={key}
                className="flex flex-col justify-between border border-gray-200 rounded-lg shadow hover:shadow-lg transition h-full bg-white overflow-hidden"
              >
                <div className="p-4 flex-grow flex flex-col">
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">
                    {r.website ? (
                      <a
                        href={r.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline"
                      >
                        {r.name}
                      </a>
                    ) : (
                      r.name
                    )}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">{r.description}</p>
                  {r.address && (
                    <p className="text-gray-500 text-xs mb-2">
                      Address: {r.address}
                    </p>
                  )}
                  {r.website && (
                    <p className="mt-1">
                      <a
                        href={r.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-indigo-600 hover:underline"
                      >
                        Visit website
                      </a>
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
                    disabled={isAdded || !itineraryDays.length}
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

                  {!isAdded ? (
                    <button
                      onClick={() => saveToItinerary(r, selected, key)}
                      disabled={!selected}
                      className="mt-2 w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
                    >
                      Add
                    </button>
                  ) : (
                    <div className="mt-2 flex items-center text-green-600 font-semibold">
                      ✓ Added
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
