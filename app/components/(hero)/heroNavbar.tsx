import Link from "next/link";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const HeroNavbar = () => {
  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 flex items-center justify-end pt-2 pr-2 ${poppins.className}`}
    >
      <div className="flex items-center">
        <Link
          href="/login"
          className="px-4 py-2 rounded-full hover:bg-gray-200 transition font-bold text-md text-blue-950"
        >
          Sign In
        </Link>
        <Link
          href="/signup"
          className="px-4 py-2 text-white rounded-full border-1 bg-gray-600 mr-2 hover:bg-gray-600/70 transition font-bold text-md"
        >
          Sign Up
        </Link>
      </div>
    </nav>
  );
};
