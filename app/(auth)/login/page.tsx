"use client";

import React from "react";
import Link from "next/link";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export default function Login() {
  const [identifier, setIdentifier] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");

  async function doLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ identifier, password }),
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok && (data as any).success) {
      // full-page nav so the cookie you just set is committed
      window.location.href = "/dashboard";
    } else {
      setError(data.message || "Sign in failed");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="relative w-full max-w-md py-15 bg-white border-2 rounded-2xl border-gray-200 flex flex-col space-y-6">
        <Link
          href="/"
          className={`absolute top-4 left-4 px-2 py-1 text-xs font-semibold hover:text-black/50 rounded ${poppins.className}`}
        >
          Go back
        </Link>
        <h1
          className={`w-full pt-6 text-center text-2xl font-bold ${poppins.className}`}
        >
          Welcome to odyssey
        </h1>
        <form
          onSubmit={doLogin}
          className="w-full flex flex-col items-center space-y-2 px-10"
        >
          <input
            name="identifier"
            type="text"
            placeholder="Username or email"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className={`w-full px-4 py-2 text-left text-sm placeholder-gray-400 border-2 rounded-md border-gray-200 ${poppins.className}`}
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full px-4 py-2 text-left text-sm placeholder-gray-400 border-2 rounded-md border-gray-200 ${poppins.className}`}
          />
          <button
            type="button"
            onClick={() => (window.location.href = "/forgot-password")}
            className={`w-full text-center text-xs underline cursor-pointer ${poppins.className}`}
          >
            Forgot password?
          </button>
          <div className="w-full min-h-[1rem] flex justify-center items-center">
            <div
              className={`
                flex items-center space-x-2
                bg-pink-50 border border-pink-200 text-pink-700
                px-4 rounded-lg
                ${error ? "visible" : "invisible"}
                ${poppins.className}
              `}
            >
              <span className="text-lg">❗</span>
              <span className="text-xs font-medium">{error}</span>
            </div>
          </div>
          <button
            type="submit"
            className={`px-14 py-2 mt-2 text-white font-semibold border-2 rounded-full bg-blue-500 hover:bg-blue-600/90 ${poppins.className} cursor-pointer`}
          >
            Sign in
          </button>
        </form>
        <div
          className={`w-full mt-4 flex justify-center items-center text-sm text-gray-600 ${poppins.className}`}
        >
          <span>Don't have an account?</span>
          <button
            onClick={() => (window.location.href = "/signup")}
            className="pl-1 text-md text-blue-500 font-bold underline cursor-pointer"
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
}
