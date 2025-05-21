"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const DashNavbar = () => {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/logout", {
      method: "GET",
      credentials: "include",
    });
    router.push("/");
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 py-2 px-4 flex items-center justify-between bg-white border-b border-gray-300 cursor-pointer ${poppins.className}`}
    >
      <Link href="/dashboard" className="text-3xl font-bold text-blue-500">
        odyssey
      </Link>
      <div>
        <Link
          href="/dashboard"
          className="px-4 py-2 rounded-full hover:bg-gray-200 transition font-bold text-md cursor-pointer"
        >
          Home
        </Link>
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-full hover:bg-gray-200 transition font-bold text-md cursor-pointer"
        >
          Sign out
        </button>
      </div>
    </nav>
  );
};
