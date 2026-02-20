"use client";

import { useState } from "react";

interface FABOption {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

interface FABProps {
  options: FABOption[];
}

/**
 * FAB - Floating Action Button with popover menu
 *
 * Minimal popover menu anchored to bottom-right FAB button.
 * Clean text options with subtle SVG icons, no emojis.
 */
export default function FAB({ options }: FABProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Backdrop when menu is open */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* FAB container */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Popover menu */}
        {isOpen && (
          <div className="absolute bottom-16 right-0 mb-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 overflow-hidden">
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => {
                  option.onClick();
                  setIsOpen(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <span className="w-4 h-4 text-gray-400">{option.icon}</span>
                <span className="font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Main FAB button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-12 h-12 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center ${
            isOpen
              ? "bg-gray-800 rotate-45"
              : "bg-gray-900 hover:bg-gray-800"
          }`}
          aria-label="Add new item"
        >
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </div>
    </>
  );
}
