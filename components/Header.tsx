"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import Sidebar from "./Sidebar";

interface HeaderProps {
  onFilterClick?: () => void;
}

export default function Header({ onFilterClick }: HeaderProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!session?.user) {
    return null;
  }

  // Get page title based on current path
  const getPageTitle = () => {
    if (pathname === "/") return "Today";
    if (pathname === "/week") return "Week";
    if (pathname?.startsWith("/lists")) return "Lists";
    if (pathname?.startsWith("/settings/calendars")) return "Calendars";
    return "Life OS";
  };

  // Show filter button on Today, Week, and Lists pages
  const showFilter = pathname === "/" || pathname === "/week" || pathname?.startsWith("/lists");

  return (
    <>
      {/* Sidebar component */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile header - compact with hamburger */}
      <div className="md:hidden sticky top-0 bg-white z-30 border-b border-gray-200 px-4 py-3 mb-4">
        <div className="flex items-center justify-between">
          {/* Hamburger menu button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Open menu"
          >
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Page title */}
          <h1 className="text-lg font-semibold text-gray-900">
            {getPageTitle()}
          </h1>

          {/* Right side icons */}
          <div className="flex items-center gap-2">
            {/* Filter button (only on Today/Week pages) */}
            {showFilter && onFilterClick && (
              <button
                onClick={onFilterClick}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Filter"
              >
                <svg
                  className="w-5 h-5 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
              </button>
            )}

            {/* User profile icon */}
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-semibold">
              {session.user.name?.charAt(0).toUpperCase() || "U"}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop header - keep existing layout */}
      <div className="hidden md:flex md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-1">Life OS</h1>
          <p className="text-base text-gray-600">
            Welcome back, {session.user.name || session.user.email}!
          </p>
        </div>

        <nav className="flex gap-2">
          <Link
            href="/"
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              pathname === "/"
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Today
          </Link>
          <Link
            href="/week"
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              pathname === "/week"
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Week
          </Link>
          <Link
            href="/lists"
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              pathname?.startsWith("/lists")
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Lists
          </Link>
          <Link
            href="/settings/calendars"
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              pathname?.startsWith("/settings/calendars")
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Calendars
          </Link>

          {/* Filter button (only on Today/Week/Lists pages) */}
          {showFilter && onFilterClick && (
            <button
              onClick={onFilterClick}
              className="px-4 py-2 rounded-lg font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              Filter
            </button>
          )}
        </nav>
      </div>
    </>
  );
}
