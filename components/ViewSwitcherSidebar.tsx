"use client";

import { useRouter } from "next/navigation";

type ViewMode = "timeline" | "compact" | "schedule" | "week" | "month";

interface ViewSwitcherSidebarProps {
  currentView: ViewMode;
  selectedDate: Date;
  onViewChange: (view: ViewMode) => void;
  isOpen: boolean;
  onClose: () => void;
}

const VIEW_OPTIONS = [
  { id: "timeline" as ViewMode, label: "Timeline", description: "Hourly schedule grid" },
  { id: "compact" as ViewMode, label: "Compact", description: "Single day, condensed" },
  { id: "schedule" as ViewMode, label: "Schedule", description: "Multi-day list view" },
  { id: "week" as ViewMode, label: "Week", description: "7-day grid" },
  { id: "month" as ViewMode, label: "Month", description: "Calendar overview" },
];

export default function ViewSwitcherSidebar({
  currentView,
  selectedDate,
  onViewChange,
  isOpen,
  onClose,
}: ViewSwitcherSidebarProps) {
  const router = useRouter();

  const handleViewSelect = (view: ViewMode) => {
    onViewChange(view);
    onClose();
  };

  const handleTodayClick = () => {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    router.push(`/calendar?view=${currentView}&date=${dateStr}`, { scroll: false });
    onClose();
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateStr = e.target.value;
    if (dateStr) {
      router.push(`/calendar?view=${currentView}&date=${dateStr}`, { scroll: false });
      onClose();
    }
  };

  // Format date for input value (YYYY-MM-DD)
  const formattedDate = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white dark:bg-gray-800 shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Calendar Views
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close sidebar"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* View Options */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-2">
              {VIEW_OPTIONS.map((view) => (
                <button
                  key={view.id}
                  onClick={() => handleViewSelect(view.id)}
                  className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors ${
                    currentView === view.id
                      ? 'bg-purple-50 dark:bg-purple-900/30'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {/* Radio button indicator */}
                  <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    currentView === view.id
                      ? 'border-purple-600 dark:border-purple-400'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {currentView === view.id && (
                      <div className="w-3 h-3 rounded-full bg-purple-600 dark:bg-purple-400" />
                    )}
                  </div>

                  {/* Label and description */}
                  <div className="flex-1 text-left">
                    <div className={`font-medium ${
                      currentView === view.id
                        ? 'text-purple-700 dark:text-purple-300'
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {view.label}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {view.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Date Navigation */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Jump to Date
              </label>
              <input
                type="date"
                value={formattedDate}
                onChange={handleDateChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={handleTodayClick}
              className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
            >
              Go to Today
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
