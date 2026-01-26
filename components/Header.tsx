"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (!session?.user) {
    return null;
  }

  const isHomePage = pathname === "/";
  const isWeekPage = pathname === "/week";

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
      {/* Title and welcome - stacks on mobile, inline on desktop */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">
          Life OS
        </h1>
        <p className="text-sm md:text-base text-gray-600">
          Welcome back, {session.user.name || session.user.email}!
        </p>
      </div>

      {/* Navigation - horizontal scroll on mobile, normal flex on desktop */}
      <nav className="flex gap-2 overflow-x-auto md:overflow-x-visible scrollbar-hide pb-2 md:pb-0">
        {/* Today button - show when NOT on home page */}
        {!isHomePage && (
          <Link href="/">
            <button className="min-h-11 px-4 py-2 whitespace-nowrap rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-colors font-semibold">
              📅 Today
            </button>
          </Link>
        )}

        {/* Week View button - show when on home page */}
        {isHomePage && (
          <Link href="/week">
            <button className="min-h-11 px-4 py-2 whitespace-nowrap rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-colors font-semibold">
              📅 Week
            </button>
          </Link>
        )}

        {/* Week View button - purple when on week page, gray otherwise */}
        {!isHomePage && isWeekPage && (
          <Link href="/week">
            <button className="min-h-11 px-4 py-2 whitespace-nowrap rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-colors font-semibold">
              📅 Week
            </button>
          </Link>
        )}
        {!isHomePage && !isWeekPage && (
          <Link href="/week">
            <button className="min-h-11 px-4 py-2 whitespace-nowrap rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors font-semibold">
              📅 Week
            </button>
          </Link>
        )}

        {/* Lists button - always visible */}
        <Link href="/lists">
          <button className="min-h-11 px-4 py-2 whitespace-nowrap rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors font-semibold">
            📋 Lists
          </button>
        </Link>

        {/* Sign Out button */}
        <button
          onClick={() => signOut()}
          className="min-h-11 px-4 py-2 whitespace-nowrap rounded-full border-2 border-gray-300 text-gray-700 hover:border-red-500 hover:text-red-600 transition-colors font-semibold"
        >
          Sign Out
        </button>
      </nav>
    </div>
  );
}
