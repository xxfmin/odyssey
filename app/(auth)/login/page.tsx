"use client";

import { Poppins } from "next/font/google";
import Link from "next/link";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600", "700"] });

export default function LoginPage() {
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

        {/* === Standard form POST === */}
        <form
          action="/api/login"
          method="post"
          className="w-full flex flex-col items-center space-y-2 px-10"
        >
          <input
            name="identifier"
            type="text"
            placeholder="Username or email"
            required
            className={`w-full px-4 py-2 text-left text-sm placeholder-gray-400 border-2 rounded-md border-gray-200 ${poppins.className}`}
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            className={`w-full px-4 py-2 text-left text-sm placeholder-gray-400 border-2 rounded-md border-gray-200 ${poppins.className}`}
          />

          <button
            type="button"
            onClick={() => (window.location.href = "/forgot-password")}
            className={`w-full text-center text-xs underline cursor-pointer ${poppins.className}`}
          >
            Forgot password?
          </button>

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
