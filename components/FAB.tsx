"use client";

import { useState } from "react";

interface FABOption {
  label: string;
  icon: string;
  onClick: () => void;
  color?: string;
}

interface FABProps {
  options: FABOption[];
}

/**
 * FAB - Floating Action Button with expandable menu
 *
 * Features:
 * - Fixed position at bottom right
 * - Expandable menu showing options above
 * - Tap main button to expand/collapse
 * - Tap outside to close
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
        {/* Menu options (shown when expanded) */}
        {isOpen && (
          <div className="absolute bottom-16 right-0 flex flex-col gap-3 mb-2">
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => {
                  option.onClick();
                  setIsOpen(false);
                }}
                className={`flex items-center gap-3 ${
                  option.color || "bg-white"
                } shadow-lg rounded-full px-4 py-3 hover:shadow-xl transition-all`}
                style={option.color ? { backgroundColor: option.color } : {}}
              >
                <span className="text-xl">{option.icon}</span>
                <span className={`font-medium whitespace-nowrap ${
                  option.color ? "text-white" : "text-gray-900"
                }`}>
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Main FAB button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center ${
            isOpen
              ? "bg-gray-700 rotate-45"
              : "bg-purple-600"
          }`}
          aria-label="Add new item"
        >
          <svg
            className="w-6 h-6 text-white"
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
