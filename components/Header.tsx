"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Sidebar from "./Sidebar";

export default function Header() {
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

          {/* User profile icon */}
          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-semibold">
            {session.user.name?.charAt(0).toUpperCase() || "U"}
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
          {/* Desktop navigation - simplified, keep for now */}
          {/* We can refine this later if needed */}
        </nav>
      </div>
    </>
  );
}
