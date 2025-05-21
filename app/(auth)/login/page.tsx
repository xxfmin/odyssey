"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ← crucial for cookie persistence
        body: JSON.stringify({ identifier, password }),
      });

      if (res.ok) {
        router.push("/dashboard");
      } else {
        const { message } = await res.json();
        setError(message || "Login failed");
      }
    } catch {
      setError("Network error. Please try again.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="relative w-full max-w-md py-15 bg-white border-2 rounded-2xl border-gray-200 flex flex-col space-y-6">
        <button
          onClick={() => router.push("/")}
          className={`absolute top-4 left-4 px-2 py-1 text-xs font-semibold hover:text-black/50 rounded ${poppins.className}`}
        >
          Go back
        </button>

        <h1
          className={`w-full pt-6 text-center text-2xl font-bold ${poppins.className}`}
        >
          Welcome to odyssey
        </h1>

        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col items-center space-y-2 px-10"
        >
          <input
            name="identifier"
            type="text"
            placeholder="Username or email"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className={`w-full px-4 py-2 text-left text-sm placeholder-gray-400 border-2 rounded-md border-gray-200 ${poppins.className}`}
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full px-4 py-2 text-left text-sm placeholder-gray-400 border-2 rounded-md border-gray-200 ${poppins.className}`}
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="button"
            onClick={() => router.push("/forgot-password")}
            className={`w-full text-center text-xs underline cursor-pointer ${poppins.className}`}
          >
            Forgot password?
          </button>

          <button
            type="submit"
            className={`px-14 py-2 mt-2 text-white font-semibold border-2 rounded-full bg-blue-500 hover:bg-blue-600/90 ${poppins.className}`}
          >
            Sign in
          </button>
        </form>

        <div
          className={`w-full mt-4 flex justify-center items-center text-sm text-gray-600 ${poppins.className}`}
        >
          <span>Don't have an account?</span>
          <button
            onClick={() => router.push("/signup")}
            className="pl-1 text-md text-blue-500 font-bold underline cursor-pointer"
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
}
