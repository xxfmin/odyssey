"use client";

import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { Poppins } from "next/font/google";
import Link from "next/link";
import { DashNavbar } from "../components/dashNavbar";
import { Carousel, Card } from "../components/ui/cards-carousel";
import Image from "next/image";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

interface Trip {
  _id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
}

export default function Dashboard() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // simple set of gradients to cycle through
  const gradients = [
    "bg-gradient-to-br from-indigo-400 to-purple-600",
    "bg-gradient-to-br from-pink-400 to-red-600",
    "bg-gradient-to-br from-green-400 to-blue-600",
    "bg-gradient-to-br from-yellow-300 to-orange-500",
  ];

  useEffect(() => {
    async function loadTrips() {
      try {
        const res = await fetch("/api/get-trips", {
          credentials: "include",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setTrips(data.trips);
      } catch (err: any) {
        setError(err.message || "Failed to load trips");
      } finally {
        setLoading(false);
      }
    }
    loadTrips();
  }, []);

  // loading skeleton similar to final UI
  if (loading)
    return (
      <div className={poppins.className}>
        <DashNavbar />
        <div className="min-h-screen flex flex-col justify-center items-center bg-slate-200 py-20">
          <div className="w-full max-w-[93vw] mx-auto pt-5 p-6 pb-10 rounded-xl bg-white">
            {/* Header Skeleton */}
            <div className="relative mb-16 mt-4">
              <div className="h-8 w-48 mx-auto bg-gray-300 rounded animate-pulse"></div>
              <div className="absolute top-0 right-0 h-8 w-36 bg-gray-300 rounded-full animate-pulse"></div>
            </div>
            {/* Carousel Skeleton */}
            <Carousel
              items={[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-64 w-64 bg-gray-300 rounded-2xl animate-pulse"
                ></div>
              ))}
              initialScroll={0}
            />
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className={poppins.className}>
        <DashNavbar />
        <p className="p-8 text-center text-red-500">Error: {error}</p>
      </div>
    );

  const items = trips.map((trip, i) => (
    <Card
      key={trip._id}
      href={`/trips/${trip._id}`}
      layout
      card={{
        title: trip.title,
        category: `${format(
          new Date(trip.startDate),
          "MMM d, yyyy"
        )} – ${format(new Date(trip.endDate), "MMM d, yyyy")}`,
        gradient: gradients[i % gradients.length],
      }}
    />
  ));

  return (
    <div className={poppins.className}>
      <DashNavbar />

      <div className="h-screen flex flex-col justify-center items-center bg-slate-200 py-20">
        <div className="w-full max-w-[93vw] mx-auto pt-5 p-6 pb-10 rounded-xl bg-white mt-10">
          {/* Header */}
          <div className="flex justify-between items-center mb-12 mt-4">
            <h1 className="text-3xl font-bold">Your Trips</h1>
            <Link
              href="/trips/create-trip"
              className="px-6 py-2 font-bold text-white bg-blue-500 rounded-full hover:bg-blue-600/90"
            >
              + Plan new trip
            </Link>
          </div>

          {/* carousel or empty state */}
          {trips.length ? (
            <Carousel items={items} initialScroll={0} />
          ) : (
            <div className="relative flex flex-col items-center py-12 mt-20">
              {/* pastel blob behind */}
              <div className="absolute -top-8 w-56 h-56 bg-pink-100 rounded-full opacity-60"></div>

              <Image
                src="/sad_dog.gif"
                alt="No trips yet"
                width={250}
                height={250}
                style={{ filter: "grayscale(80%)" }}
              />

              {/* friendly prompt */}
              <p className="mt-6 text-lg text-gray-600">
                Your adventure awaits… start planning!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
