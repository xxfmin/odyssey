import React, { useEffect, useState } from "react";

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  id: string;
  onExpenseAdded: () => void;
}

interface Category {
  id: string;
  icon: string;
  label: string;
}

export function ExpenseModal({
  isOpen,
  onClose,
  id,
  onExpenseAdded,
}: ExpenseModalProps) {
  const [amount, setAmount] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [date, setDate] = useState("");
  const [error, setError] = useState("");

  const categories: Category[] = [
    { id: "Flights", icon: "✈️", label: "Flights" },
    { id: "Lodging", icon: "🛏️", label: "Lodging" },
    { id: "Car Rental", icon: "🚗", label: "Car rental" },
    { id: "Transit", icon: "🚇", label: "Transit" },
    { id: "Food", icon: "🍴", label: "Food" },
    { id: "Drinks", icon: "🥂", label: "Drinks" },
    { id: "Sightseeing", icon: "🏛️", label: "Sightseeing" },
    { id: "Activities", icon: "🎟️", label: "Activities" },
    { id: "Shopping", icon: "🛍️", label: "Shopping" },
    { id: "Gas", icon: "⛽", label: "Gas" },
    { id: "Groceries", icon: "🛒", label: "Groceries" },
    { id: "Other", icon: "🎫", label: "Other" },
  ];

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  // reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setAmount(0);
      setSelectedCategory(null);
      setDate("");
      setError("");
    }
  }, [isOpen]);

  // close modal if escape key is clicked
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!amount || !selectedCategory || !date) {
      setError("Please fill in all fields.");
      return;
    }

    const response = await fetch("/api/expenses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amount,
        type: selectedCategory,
        date: date,
        tripId: id,
      }),
    });

    if (response.ok) {
      // call the callback function instead of reloading
      onExpenseAdded();
      onClose();
    } else {
      setError("Failed to add expense. Please try again.");
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        {/* panel */}
        <div
          className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl cursor-pointer"
            aria-label="Close modal"
          >
            &times;
          </button>

          <div className="w-full flex flex-col justify-center items-center">
            <h1 className="font-bold text-xl">Add expense</h1>
            <form
              onSubmit={handleSubmit}
              className="w-full flex flex-col items-center space-y-3 px-10 pt-7"
            >
              {/* amount */}
              <div className="flex-row">
                <span className="text-md font-semibold mr-2">$</span>
                <input
                  type="number"
                  step="0.01"
                  className="border rounded px-6 py-2"
                  placeholder="0.00"
                  value={amount || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setAmount(parseFloat(e.currentTarget.value) || 0)
                  }
                  onWheel={(e) => e.currentTarget.blur()}
                />
              </div>
              {/* category */}
              <h1 className="pt-2text-sm font-semibold">
                Select from a category
              </h1>
              <div className="grid grid-cols-4 gap-2">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className={`w-23 flex flex-col items-center justify-center rounded-md cursor-pointer transition-all bg-gray-50 hover:bg-gray-100 ${
                      selectedCategory === category.id
                        ? "border-2 border-blue-500 shadow-md"
                        : "border border-gray-200"
                    }`}
                    onClick={() => handleCategorySelect(category.id)}
                  >
                    <div className="text-xl mb-2">{category.icon}</div>
                    <div className="text-gray-600 font-semibold text-sm">
                      {category.label}
                    </div>
                  </div>
                ))}
              </div>
              {/* date */}
              <div>
                <input
                  type="date"
                  value={date}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setDate(e.target.value)
                  }
                  className="w-full rounded border border-gray-300 px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              {/* error message */}
              <p
                className={`text-center text-red-500 text-sm min-h-[1.25rem] ${
                  error ? "" : "invisible"
                }`}
              >
                {error}
              </p>
              {/* submit button */}
              <button
                type="submit"
                className="px-14 py-2 mt-4 text-white font-semibold border-2 rounded-full bg-blue-500 hover:bg-blue-600/90 cursor-pointer"
              >
                Save
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
