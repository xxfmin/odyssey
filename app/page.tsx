// app/page.tsx
"use client";

import { HeroNavbar } from "./components/(hero)/heroNavbar";
import { Hero } from "./components/(hero)/hero";
import { Poppins } from "next/font/google";
import { WorldMap } from "./components/ui/world-map";

import ai from "./components/images/ai.png";
import map from "./components/images/map.png";
import expense from "./components/images/expense.png";
import linkedin from "./components/images/linkedin.png";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600", "700"] });

export default function Home() {
  const routes = [
    {
      start: { lat: -22.9068, lng: -43.1729, label: "Rio de Janeiro, Brazil" },
      end: { lat: 37.7749, lng: -122.4194, label: "San Francisco, USA" },
    },
    {
      start: { lat: 37.7749, lng: -122.4194, label: "San Francisco, USA" },
      end: { lat: 40.7128, lng: -74.006, label: "New York, USA" },
    },
    {
      start: { lat: 40.7128, lng: -74.006, label: "New York, USA" },
      end: { lat: 48.8566, lng: 2.3522, label: "Paris, France" },
    },
    {
      start: { lat: 48.8566, lng: 2.3522, label: "Paris, France" },
      end: { lat: 35.6895, lng: 139.6917, label: "Tokyo, Japan" },
    },
    {
      start: { lat: 35.6895, lng: 139.6917, label: "Tokyo, Japan" },
      end: { lat: -33.9249, lng: 18.4241, label: "Cape Town, South Africa" },
    },
    {
      start: { lat: -33.9249, lng: 18.4241, label: "Cape Town, South Africa" },
      end: { lat: -33.8688, lng: 151.2093, label: "Sydney, Australia" },
    },
  ];

  return (
    <div className={`${poppins.className}`}>
      <HeroNavbar />
      <Hero />

      {/* Features Section */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-screen-lg mx-auto px-6 flex flex-col items-center">
          <h1 className="text-4xl font-bold text-center">
            Simplify Your Travel
          </h1>
          <p className="mt-4 text-center text-gray-700">
            Everything you need to plan and customize your trips.
          </p>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
            {/* AI-Powered Itineraries Card */}
            <div className="bg-white rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-200 p-6">
              <div className="bg-blue-100 rounded-full p-3 mb-4 inline-block">
                <img
                  src={ai.src}
                  alt="AI Icon"
                  className="w-6 h-6"
                  style={{
                    filter: `brightness(0) saturate(100%) invert(38%) sepia(95%) saturate(4600%) hue-rotate(206deg) brightness(95%) contrast(102%)`,
                  }}
                />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                AI-Powered Itineraries
              </h3>
              <p className="text-gray-600 text-sm">
                Generate day-by-day plans with personalized recommendations.
              </p>
            </div>

            {/* Interactive Maps Card */}
            <div className="bg-white rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-200 p-6">
              <div className="bg-blue-100 rounded-full p-3 mb-4 inline-block">
                <img
                  src={map.src}
                  alt="Map Icon"
                  className="w-6 h-6"
                  style={{
                    filter: `brightness(0) saturate(100%) invert(38%) sepia(95%) saturate(4600%) hue-rotate(206deg) brightness(95%) contrast(102%)`,
                  }}
                />
              </div>
              <h3 className="text-xl font-semibold mb-2">Interactive Maps</h3>
              <p className="text-gray-600 text-sm">
                View and navigate your itinerary with detailed, dynamic maps.
              </p>
            </div>

            {/* Expense Tracker Card */}
            <div className="bg-white rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-200 p-6">
              <div className="bg-blue-100 rounded-full p-3 mb-4 inline-block">
                <img
                  src={expense.src}
                  alt="Expense Icon"
                  className="w-6 h-6"
                  style={{
                    filter: `brightness(0) saturate(100%) invert(38%) sepia(95%) saturate(4600%) hue-rotate(206deg) brightness(95%) contrast(102%)`,
                  }}
                />
              </div>
              <h3 className="text-xl font-semibold mb-2">Expense Tracker</h3>
              <p className="text-gray-600 text-sm">
                Manage your travel budget and track all your expenses.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* World Map Section */}
      <section className="flex flex-col justify-center items-center mx-35 my-15 py-12">
        <h1 className="text-3xl font-bold text-center pb-8">
          Stop talking trips. Start taking them.
        </h1>
        <WorldMap dots={routes} lineColor="#3b82f6" />
      </section>

      <footer className="w-full flex flex-col justify-center items-center bg-gray-600 py-12">
        <h1 className="flex text-sm text-white">
          © 2025 Felipe Min. All Rights Reserved.
        </h1>
        <a href="https://www.linkedin.com/in/felipe-min/">
          <img
            src={linkedin.src}
            alt="LinkedIn Icon"
            className="w-6 mt-2 cursor-pointer"
          />
        </a>
      </footer>
    </div>
  );
}
