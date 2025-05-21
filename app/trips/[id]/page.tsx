"use client";

import { ExpenseModal } from "@/app/components/(trip)/expenseModal";
import { Map } from "@/app/components/(trip)/map";
import VerticalNavbar from "@/app/components/(trip)/verticalNavbar";
import { DashNavbar } from "@/app/components/dashNavbar";
import { format } from "date-fns";
import { Types } from "mongoose";
import { Poppins } from "next/font/google";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

interface Expense {
  _id: string;
  amount: number;
  type: string;
  date: Date;
  trip: Types.ObjectId;
}

interface Activity {
  _id: string;
  title: string;
  description?: string;
  location: { lat: number; lng: number };
  type: string;
  trip: string;
}

interface ItineraryDay {
  _id: string;
  date: Date;
  activities: Activity[];
}

interface Trip {
  _id: string;
  title: string;
  destination: string;
  destinationLat: number;
  destinationLng: number;
  startDate: Date;
  endDate: Date;
  itinerary: Types.ObjectId[];
  expenses: Types.ObjectId[];
  user: Types.ObjectId;
}

function LoadingSkeleton() {
  return (
    <div className="h-screen flex overflow-hidden bg-white animate-pulse">
      {/* Sidebar */}
      <aside className="fixed w-32 border-r border-gray-200 pt-16 px-4 space-y-6">
        {/* Logo */}
        <div className="h-8 bg-gray-300 rounded w-20 mx-auto" />
        {/* Nav items */}
        <div className="space-y-2 mt-4">
          <div className="h-4 bg-gray-200 rounded w-16" />
          <div className="h-4 bg-gray-200 rounded w-12" />
          <div className="h-4 bg-gray-200 rounded w-10" />
          <div className="h-4 bg-gray-200 rounded w-10" />
          <div className="h-4 bg-gray-200 rounded w-10" />
        </div>
        {/* Budget link */}
        <div className="h-4 bg-gray-200 rounded w-12 mt-8" />
      </aside>

      {/* Main & Map */}
      <div className="ml-32 flex flex-1 overflow-y-auto">
        {/* Center column */}
        <div className="flex-1 p-8 space-y-6">
          {/* Title */}
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto" />
          {/* Date */}
          <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto" />
          {/* Buttons */}
          <div className="flex justify-center space-x-4">
            <div className="h-10 w-32 bg-blue-200 rounded-full" />
            <div className="h-10 w-32 bg-blue-200 rounded-full" />
          </div>
          {/* Itinerary heading */}
          <div className="h-6 bg-gray-200 rounded w-1/5 mt-6" />
          {/* Itinerary cards */}
          <div className="space-y-4 mt-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 bg-gray-100 rounded-lg space-y-2">
                <div className="h-4 bg-gray-200 rounded w-2/5" />
                <div className="h-3 bg-gray-200 rounded w-full" />
                <div className="h-3 bg-gray-200 rounded w-5/6" />
              </div>
            ))}
          </div>
          {/* Budget section */}
          <div className="mt-8 p-4 bg-gray-100 rounded-lg max-w-sm space-y-2">
            <div className="h-5 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded w-1/3" />
          </div>
        </div>

        {/* Map column */}
        <div className="flex-1 p-8">
          <div className="h-full bg-gray-100 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export default function Trip() {
  const { id: tripId } = useParams() as { id: string };
  const router = useRouter();
  const contentRef = useRef<HTMLDivElement>(null);

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [itineraryDays, setItineraryDays] = useState<ItineraryDay[]>([]);
  const [loadingItineraryDays, setLoadingItineraryDays] = useState(false);
  const [deletingItineraryActivityId, setDeletingItineraryActivityId] =
    useState<string | null>(null);

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loadingExpenses, setLoadingExpenses] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(
    null
  );
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  // track whether to show inline delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // track map center
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: 0,
    lng: 0,
  });

  // scroll to hash on load
  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.substring(1);
      const el = document.getElementById(id);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, []);

  // fetch trip, itinerary days, and expenses
  useEffect(() => {
    const fetchTrip = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/${tripId}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error(`Error: ${res.status}`);
        const data: Trip = await res.json();
        setTrip(data);

        // initialize map center to trip destination
        setMapCenter({ lat: data.destinationLat, lng: data.destinationLng });

        await fetchItineraryDays();
        await fetchExpenses();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load trip");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (tripId) fetchTrip();
  }, [tripId]);

  const goToExplore = () => {
    router.push(`/trips/${tripId}/explore`);
  };

  const goToFood = () => {
    router.push(`/trips/${tripId}/food`);
  };

  const handleDeleteTrip = async () => {
    const res = await fetch(`/api/${tripId}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) router.push("/dashboard");
    else alert("Failed to delete trip");
  };

  const fetchItineraryDays = async () => {
    try {
      setLoadingItineraryDays(true);
      const res = await fetch(`/api/itinerary?tripId=${tripId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Itinerary error ${res.status}`);
      const json = await res.json();
      if (Array.isArray(json.itinerary)) {
        setItineraryDays(
          json.itinerary.map((day: any) => ({
            _id: day._id,
            date: new Date(day.date),
            activities: day.activities,
          }))
        );
      }
    } catch (err) {
      console.error("fetchItineraryDays:", err);
    } finally {
      setLoadingItineraryDays(false);
    }
  };

  const fetchExpenses = async () => {
    try {
      setLoadingExpenses(true);
      const res = await fetch(`/api/expenses?tripId=${tripId}`);
      if (!res.ok) throw new Error(`Error fetching expenses: ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data.expenses)) setExpenses(data.expenses);
    } catch (err) {
      console.error("Error fetching expenses:", err);
    } finally {
      setLoadingExpenses(false);
    }
  };

  const handleExpenseAdded = async () => {
    await fetchExpenses();
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      setDeletingExpenseId(expenseId);
      const res = await fetch(`/api/expenses`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ expenseId, tripId }),
      });
      if (res.ok) {
        setExpenses((es) => es.filter((e) => e._id !== expenseId));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingExpenseId(null);
    }
  };

  const handleDeleteActivity = async (dayId: string, activityId: string) => {
    try {
      setDeletingItineraryActivityId(activityId);
      const res = await fetch(`/api/itinerary`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ tripId, dayId, activityId }),
      });
      if (res.ok) {
        setItineraryDays((days) =>
          days.map((day) =>
            day._id === dayId
              ? {
                  ...day,
                  activities: day.activities.filter(
                    (a) => a._id !== activityId
                  ),
                }
              : day
          )
        );
      }
    } catch (err) {
      console.error("Error deleting activity:", err);
    } finally {
      setDeletingItineraryActivityId(null);
    }
  };

  // called when clicking an activity
  const handleActivityClick = (location: { lat: number; lng: number }) => {
    setMapCenter(location);
  };

  if (loading) return LoadingSkeleton();
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;
  if (!trip) return <div className="p-8">Trip not found</div>;

  return (
    <div className={poppins.className}>
      <DashNavbar />

      <div className="h-screen flex overflow-hidden">
        {/* Sidebar */}
        <aside className="fixed w-32 border-r border-gray-300 pt-16 overflow-y-auto">
          <VerticalNavbar
            tripId={trip._id.toString()}
            itineraryDays={itineraryDays}
          />
        </aside>

        {/* Main & Map split 50/50 */}
        <div className="ml-32 flex flex-1 overflow-y-auto">
          {/* Center Div */}
          <div
            ref={contentRef}
            className="flex-1 px-15 py-6 pt-20 overflow-y-auto max-w-4xl"
          >
            {/* Centered header block */}
            <div id="overview" className="flex flex-col items-center">
              <h1 className="text-3xl font-bold text-center mt-7">
                Trip to {trip.title}
              </h1>
              <p className="text-sm text-gray-600 text-center mt-1">
                {format(trip.startDate, "MMM d, yyyy")} –{" "}
                {format(trip.endDate, "MMM d, yyyy")}
              </p>
            </div>

            <div className="mt-6 flex space-x-4 justify-center">
              <button
                onClick={goToExplore}
                className="px-6 py-2 bg-blue-500 text-white rounded-full cursor-pointer"
              >
                Explore Activities
              </button>
              <button
                onClick={goToFood}
                className="px-6 py-2 bg-blue-500 text-white rounded-full cursor-pointer"
              >
                Explore Restaurants
              </button>
            </div>

            {/* Itinerary */}
            <div className="mt-13 space-y-8">
              <h2 className="text-2xl font-semibold mb-4">Itinerary</h2>
              {loadingItineraryDays ? (
                <p className="text-gray-500">Loading itinerary…</p>
              ) : itineraryDays.length ? (
                itineraryDays.map((day) => (
                  <section id={day._id} key={day._id} className="space-y-4">
                    <h3 className="text-xl font-medium">
                      {format(day.date, "EEEE, MMM d")}
                    </h3>

                    {day.activities.length ? (
                      <ul className="space-y-3">
                        {day.activities.map((act) => (
                          <li key={act._id} className="flex items-center group">
                            {/* activity card */}
                            <div
                              onClick={() => handleActivityClick(act.location)}
                              className="flex-grow p-4 ml-5 bg-gray-200 rounded-lg cursor-pointer"
                            >
                              <h4 className="font-semibold text-lg">
                                {act.title}
                              </h4>
                              {act.description && (
                                <p className="text-gray-700 text-sm mt-1">
                                  {act.description}
                                </p>
                              )}
                            </div>

                            {/* delete‐activity button (matches expense delete) */}
                            <button
                              onClick={() =>
                                handleDeleteActivity(day._id, act._id)
                              }
                              disabled={deletingItineraryActivityId === act._id}
                              className="ml-3 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                              aria-label="Delete activity"
                            >
                              {deletingItineraryActivityId === act._id ? (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5 animate-spin"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                >
                                  {/* spinner path */}
                                </svg>
                              ) : (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 7h12
           M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2
           M8 7l1 12a1 1 0 001 1h4a1 1 0 001-1l1-12"
                                  />
                                </svg>
                              )}
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 italic ml-8 text-sm">
                        No activities planned for this day yet.
                      </p>
                    )}
                  </section>
                ))
              ) : (
                <p className="text-gray-500">No itinerary days yet.</p>
              )}
            </div>

            {/* Expenses */}
            <div id="budget" className="mt-12">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Budgeting</h2>
                <button
                  onClick={() => setExpenseModalOpen(true)}
                  className="px-3 py-2 bg-blue-500 text-white text-sm rounded-full cursor-pointer"
                >
                  + Add expense
                </button>
              </div>
              <ExpenseModal
                isOpen={expenseModalOpen}
                onClose={() => setExpenseModalOpen(false)}
                id={tripId}
                onExpenseAdded={handleExpenseAdded}
              />
              {loadingExpenses ? (
                <p className="text-gray-500">Loading expenses…</p>
              ) : expenses.length ? (
                <ul className="space-y-2">
                  {expenses.map((exp) => {
                    const expDate = new Date(exp.date);
                    return (
                      <li key={exp._id} className="flex items-center group">
                        <div className="flex-grow p-4 ml-5 bg-gray-200 rounded-lg flex justify-between">
                          <div>
                            <p className="font-semibold">{exp.type}</p>
                            <p className="text-xs text-gray-500">
                              {expDate.toLocaleDateString()}
                            </p>
                          </div>
                          <p className="font-semibold">
                            ${exp.amount.toFixed(2)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteExpense(exp._id)}
                          disabled={deletingExpenseId === exp._id}
                          className="ml-3 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          aria-label="Delete expense"
                        >
                          {deletingExpenseId === exp._id ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 animate-spin"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              {/* spinner path */}
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 7h12 M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2 M8 7l1 12a1 1 0 001 1h4a1 1 0 001-1l1-12"
                              />
                            </svg>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-gray-500 ml-8 text-sm">No expenses yet.</p>
              )}
              {/* Total row */}
              <div className="flex justify-end mt-4 pr-5">
                <span className="text-lg font-semibold">Total:</span>
                <span className="ml-2 text-lg font-semibold">
                  ${totalExpenses.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Delete Trip button */}
            <div className="flex justify-center items-center mt-10">
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-red-600 text-sm hover:text-red-800 cursor-pointer"
                >
                  Delete Trip
                </button>
              ) : (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700">
                    Are you sure you want to delete this trip?
                  </span>
                  <button
                    onClick={handleDeleteTrip}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded cursor-pointer"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-3 py-1 bg-gray-200 text-gray-800 text-sm rounded cursor-pointer"
                  >
                    No
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Map Div (50%) */}
          <div className="flex-1 bg-blue-50 pt-13">
            <Map
              lat={mapCenter.lat}
              lng={mapCenter.lng}
              activities={itineraryDays.flatMap((day) => day.activities)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
