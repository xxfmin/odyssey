"use client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { PlaceholderCyclingInput } from "@/app/components/ui/placeholder-cycling-input";
import { DashNavbar } from "@/app/components/dashNavbar";
import { Poppins } from "next/font/google";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600", "700"] });

type Geo = { lat: number; lng: number };

async function DestinationChecker(place: string): Promise<Geo | null> {
  const prompt = `
You are a geocoding assistant. Parse this user entry exactly into JSON:
"${place}"

If it’s a real, travel-able location, respond with exactly:
{"lat": <number>, "lng": <number>}

Otherwise respond with:
{"error":"invalid"}
  `.trim();

  const res = await fetch("/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok) return null;

  const data = await res.json();
  const cand = data.candidates?.[0];
  let text =
    cand?.content?.parts?.[0]?.text ||
    cand?.content?.text ||
    cand?.text ||
    (typeof cand?.content === "string" ? cand.content : "");

  text = text
    .replace(/^```json/i, "")
    .replace(/```$/, "")
    .trim();
  const m = text.match(/(\{[\s\S]*\})/);
  if (m) text = m[1];

  try {
    const parsed = JSON.parse(text);
    if (parsed.error === "invalid") return null;
    return { lat: Number(parsed.lat), lng: Number(parsed.lng) };
  } catch {
    return null;
  }
}

export default function CreateTrip() {
  const router = useRouter();
  const [whereTo, setWhereTo] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");

  // yyyy-MM-dd for <input type="date" min=...>
  const today = new Date().toISOString().slice(0, 10);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!whereTo || !startDate || !endDate) {
      setError("Please fill in all fields.");
      return;
    }

    if (startDate > endDate) {
      setError("Start date cannot be after the end date.");
      return;
    }

    const geo = await DestinationChecker(whereTo);
    if (!geo) {
      setError("Please enter a real location.");
      return;
    }

    const response = await fetch("/api/create-trip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        title: whereTo,
        destination: whereTo,
        destinationLat: geo.lat,
        destinationLng: geo.lng,
        startDate,
        endDate,
      }),
    });

    if (response.ok) {
      const {
        trip: { _id },
      } = (await response.json()) as { trip: { _id: string } };
      router.push(`/trips/${_id}`);
    } else {
      const data = await response.json().catch(() => ({}));
      setError(data.message || "Failed to create trip");
    }
  }

  return (
    <div className={`h-screen flex flex-col ${poppins.className}`}>
      <DashNavbar />
      <div className="flex-1 flex flex-col justify-center items-center bg-gray-50 p-4">
        <div className="w-full max-w-md space-y-6 px-4">
          <h1 className="text-3xl font-bold text-center pb-10">
            Plan a new trip
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h3 className="text-sm pl-4 font-semibold">Where to?</h3>
              <PlaceholderCyclingInput
                placeholders={[
                  "Tokyo, Japan",
                  "Paris, France",
                  "Rio de Janeiro, Brazil",
                  "London, England",
                ]}
                value={whereTo}
                onChange={(e) => setWhereTo(e.target.value)}
              />
            </div>

            <div className="flex space-x-4">
              {/* Start Date */}
              <div className="flex-1">
                <h3 className="text-sm pl-4 font-semibold">Start date</h3>
                <input
                  type="date"
                  min={today}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-full border border-gray-300 px-4 py-2"
                />
              </div>

              {/* End Date */}
              <div className="flex-1">
                <h3 className="text-sm pl-4 font-semibold">End date</h3>
                <input
                  type="date"
                  min={startDate || today}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-full border border-gray-300 px-4 py-2"
                />
              </div>
            </div>

            <p
              className={`text-center text-red-500 text-sm min-h-[1.25rem] ${
                error ? "" : "invisible"
              }`}
            >
              {error}
            </p>

            <div className="flex justify-center">
              <button
                type="submit"
                className="px-14 py-2 mt-4 text-white font-semibold border-2 rounded-full bg-blue-500 hover:bg-blue-600/90 cursor-pointer"
              >
                Start planning
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
