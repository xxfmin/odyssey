"use client";

import Link from "next/link";

interface NavDay {
  _id: string;
}

interface Props {
  /** trip’s ID so URLs can be built */
  tripId: string;
  /** just need the day IDs to build the anchors */
  itineraryDays: NavDay[];
}

export default function VerticalNavbar({ tripId, itineraryDays }: Props) {
  const basePath = `/trips/${tripId}`;

  const itineraryItems = itineraryDays.map((day, idx) => ({
    label: `Day ${idx + 1}`,
    href: `${basePath}#${day._id}`,
    id: day._id,
  }));

  const navSections = [
    {
      title: "Overview",
      items: [
        { label: "Explore", href: `${basePath}#overview`, id: "overview" },
      ],
    },
    {
      title: "Itinerary",
      items: itineraryItems,
    },
    {
      title: "Budget",
      items: [{ label: "View", href: `${basePath}#budget`, id: "budget" }],
    },
  ];

  // smooth‐scroll handler
  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault();

    if (href.includes("#")) {
      const id = href.split("#")[1];
      const element = document.getElementById(id);
      if (element) {
        window.history.pushState({}, "", href);
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      window.history.pushState({}, "", href);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <nav className="w-full h-screen overflow-y-auto p-4">
      {navSections.map((sec) => (
        <div key={sec.title} className="mb-8 last:mb-0">
          <h2 className="text-xs font-semibold uppercase text-gray-500 mb-2">
            {sec.title}
          </h2>
          <ul>
            {sec.items.map((it) => (
              <li key={it.href}>
                <Link
                  href={it.href}
                  onClick={(e) => handleNavClick(e, it.href)}
                  className="block py-2 px-3 rounded text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  {it.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
