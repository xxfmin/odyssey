import Link from "next/link";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const DashNavbar = () => {
  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 py-2 px-4 flex items-center justify-between bg-white border-b border-gray-300 ${poppins}`}
    >
      <Link href={"/dashboard"} className="text-3xl font-bold text-blue-500">
        odyssey
      </Link>
      <div>
        <Link
          href={"/dashboard"}
          className="px-4 py-2 rounded-full hover:bg-gray-200 transition font-bold text-md"
        >
          Home
        </Link>
        <Link
          href={"/api/logout"}
          className="px-4 py-2 rounded-full hover:bg-gray-200 transition font-bold text-md"
        >
          Sign out
        </Link>
      </div>
    </nav>
  );
};
