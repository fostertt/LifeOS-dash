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

  // Show filter button on Calendar, All, and Vault pages
  const showFilter = pathname === "/calendar" || pathname === "/week" || pathname === "/all" || pathname === "/tasks" || pathname?.startsWith("/vault") || pathname?.startsWith("/lists");

  return (
    <>
      {/* Sidebar component */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile header - LifeOS centered, hamburger on right */}
      <div className="md:hidden sticky top-0 bg-white z-30 border-b border-gray-200 px-4 py-3 mb-2">
        <div className="flex items-center justify-between">
          {/* Left spacer for balance */}
          <div className="w-10"></div>

          {/* LifeOS title centered */}
          <h1 className="text-lg font-semibold text-gray-900 absolute left-1/2 transform -translate-x-1/2">
            LifeOS
          </h1>

          {/* Right side icons: filter + hamburger */}
          <div className="flex items-center gap-2">
            {/* Filter button (only on certain pages) */}
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

            {/* Hamburger menu button - on right for right-handed use */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
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
          </div>
        </div>
      </div>

      {/* Desktop header - keep existing layout */}
      <div className="hidden md:flex md:items-center md:justify-between gap-4 mb-4">
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
            Home
          </Link>
          <Link
            href="/projects"
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              pathname === "/projects"
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Projects
          </Link>
          <Link
            href="/all"
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              pathname === "/all" || pathname === "/tasks"
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All
          </Link>
          <Link
            href="/calendar"
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              pathname === "/calendar" || pathname === "/week"
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Calendar
          </Link>
          <Link
            href="/vault"
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              pathname?.startsWith("/vault") || pathname?.startsWith("/lists")
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Vault
          </Link>
          <Link
            href="/recipes"
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              pathname === "/recipes"
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Recipes
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
