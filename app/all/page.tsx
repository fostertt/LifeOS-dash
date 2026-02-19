"use client";

import { useEffect, useState, useMemo, useContext, useCallback } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Header from "@/components/Header";
import { SwipeContext } from "@/components/SwipeContainer";
import TaskForm from "@/components/TaskForm";
import { extractUniqueTags, itemMatchesTags } from "@/lib/tags";
import { useRefreshOnFocus } from "@/lib/useRefreshOnFocus";

interface Item {
  id: number;
  itemType: "habit" | "task" | "reminder";
  name: string;
  description?: string;
  dueDate?: string;
  dueTime?: string;
  scheduledTime?: string;
  scheduleType?: string;
  scheduleDays?: string;
  isCompleted?: boolean;
  completedAt?: string;
  isParent: boolean;
  priority?: string;
  complexity?: string;
  duration?: string;
  energy?: string;
  state?: string;
  tags?: string[];
  showOnCalendar?: boolean;
  isOverdue?: boolean;
  subItems?: any[];
}

type GroupBy = "none" | "state" | "type" | "tag" | "complexity" | "energy" | "priority";

// State badge colors
const STATE_COLORS = {
  backlog: "bg-gray-100 text-gray-800",
  active: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
};

const STATE_LABELS = {
  backlog: "Backlog",
  active: "Active",
  in_progress: "In Progress",
  completed: "Completed",
};

// Preferred section order
const STATE_ORDER = ["In Progress", "Active", "Backlog", "Completed"];

// Item type labels and colors
const TYPE_LABELS: Record<string, string> = {
  task: "Task",
  habit: "Habit",
  reminder: "Reminder",
};

const TYPE_COLORS: Record<string, string> = {
  task: "bg-purple-100 text-purple-800",
  habit: "bg-green-100 text-green-800",
  reminder: "bg-amber-100 text-amber-800",
};

function AllTasksContent() {
  const { insideSwipe } = useContext(SwipeContext);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Task modal state
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Item | null>(null);

  // Filters
  const [selectedStates, setSelectedStates] = useState<string[]>([
    "backlog",
    "active",
    "in_progress",
    "completed",
  ]); // Show all states by default
  const [selectedTypes, setSelectedTypes] = useState<string[]>([
    "task",
    "habit",
    "reminder",
  ]); // Show all types by default
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPriority, setSelectedPriority] = useState<string>("");
  const [selectedComplexity, setSelectedComplexity] = useState<string>("");
  const [selectedEnergy, setSelectedEnergy] = useState<string>("");
  const [groupBy, setGroupBy] = useState<GroupBy>("state");
  const [showFilters, setShowFilters] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  // Load all items (tasks, habits, reminders)
  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/items");
      if (!response.ok) throw new Error("Failed to fetch items");

      const allItems = await response.json();
      setItems(allItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Re-fetch data when user returns to the tab/app
  useRefreshOnFocus(loadData, !loading);

  // Extract unique tags from items
  const availableTags = useMemo(() => extractUniqueTags(items), [items]);

  // Filter items based on selected filters
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Type filter
      if (!selectedTypes.includes(item.itemType)) {
        return false;
      }

      // State filter
      if (!selectedStates.includes(item.state || "active")) {
        return false;
      }

      // Tag filter
      if (selectedTags.length > 0 && !itemMatchesTags(item.tags, selectedTags)) {
        return false;
      }

      // Priority filter
      if (selectedPriority && item.priority !== selectedPriority) {
        return false;
      }

      // Complexity filter
      if (selectedComplexity && item.complexity !== selectedComplexity) {
        return false;
      }

      // Energy filter
      if (selectedEnergy && item.energy !== selectedEnergy) {
        return false;
      }

      return true;
    });
  }, [items, selectedTypes, selectedStates, selectedTags, selectedPriority, selectedComplexity, selectedEnergy]);

  // Group items
  const groupedItems = useMemo(() => {
    if (groupBy === "none") {
      return { "All Items": filteredItems };
    }

    const groups: Record<string, Item[]> = {};

    filteredItems.forEach((item) => {
      let groupKey = "None";

      switch (groupBy) {
        case "state":
          groupKey = STATE_LABELS[item.state as keyof typeof STATE_LABELS] || "Active";
          break;
        case "type":
          groupKey = TYPE_LABELS[item.itemType] || "Task";
          break;
        case "tag":
          if (item.tags && item.tags.length > 0) {
            item.tags.forEach((tag) => {
              if (!groups[tag]) groups[tag] = [];
              groups[tag].push(item);
            });
            return; // Skip default grouping
          }
          break;
        case "complexity":
          groupKey = item.complexity || "None";
          break;
        case "energy":
          groupKey = item.energy || "None";
          break;
        case "priority":
          groupKey = item.priority || "None";
          break;
      }

      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(item);
    });

    return groups;
  }, [filteredItems, groupBy]);

  // Handle task click (open modal)
  const handleTaskClick = (item: Item) => {
    setEditingTask(item);
    setShowTaskModal(true);
  };

  // Save task changes
  const saveTask = async (taskData: any) => {
    if (!editingTask) return;

    try {
      const res = await fetch(`/api/items/${editingTask.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });

      if (!res.ok) throw new Error("Failed to update item");

      // Reload items
      await loadData();
    } catch (error) {
      console.error("Error updating item:", error);
      throw error;
    }
  };

  // Delete item
  const deleteTask = async () => {
    if (!editingTask) return;

    try {
      const res = await fetch(`/api/items/${editingTask.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete item");

      setShowTaskModal(false);
      setEditingTask(null);
      await loadData();
    } catch (error) {
      console.error("Error deleting item:", error);
      throw error;
    }
  };

  // Toggle completion
  const toggleCompletion = async (item: Item, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      const res = await fetch(`/api/items/${item.id}/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: item.dueDate || new Date().toISOString().split("T")[0],
        }),
      });

      if (!res.ok) throw new Error("Failed to toggle completion");

      // Reload items
      await loadData();
    } catch (error) {
      console.error("Error toggling completion:", error);
    }
  };

  // Toggle state filter
  const toggleStateFilter = (state: string) => {
    setSelectedStates((prev) =>
      prev.includes(state) ? prev.filter((s) => s !== state) : [...prev, state]
    );
  };

  // Toggle type filter
  const toggleTypeFilter = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  // Toggle tag filter
  const toggleTagFilter = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Clear all filters (but keep default states)
  const clearFilters = () => {
    setSelectedStates(["backlog", "active", "in_progress"]);
    setSelectedTypes(["task", "habit", "reminder"]);
    setSelectedTags([]);
    setSelectedPriority("");
    setSelectedComplexity("");
    setSelectedEnergy("");
  };

  /** Toggle a section's collapsed state */
  const toggleSection = (groupName: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(groupName)) {
        next.delete(groupName);
      } else {
        next.add(groupName);
      }
      return next;
    });
  };

  /** Sort items chronologically by dueDate (earliest first, no-date items last) */
  const sortChronologically = (a: Item, b: Item): number => {
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return a.dueDate.localeCompare(b.dueDate);
  };

  const hasActiveFilters =
    selectedTags.length > 0 || selectedPriority || selectedComplexity || selectedEnergy ||
    selectedTypes.length < 3;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 overflow-x-hidden">
        {!insideSwipe && <Header />}

        <main className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8 py-4">
          {/* Filter and Group Controls */}
          <div className="bg-white rounded-lg shadow p-3 mb-4">
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Filters
                {hasActiveFilters && (
                  <span className="ml-1 text-blue-600 text-xs">
                    ({selectedTags.length + (selectedPriority ? 1 : 0) + (selectedComplexity ? 1 : 0) + (selectedEnergy ? 1 : 0) + (selectedTypes.length < 3 ? 1 : 0)})
                  </span>
                )}
              </button>

              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Clear
                  </button>
                )}
                <select
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value as GroupBy)}
                  className="border rounded px-2 py-1 text-xs"
                >
                  <option value="none">No grouping</option>
                  <option value="state">By State</option>
                  <option value="type">By Type</option>
                  <option value="tag">By Tag</option>
                  <option value="complexity">By Complexity</option>
                  <option value="energy">By Energy</option>
                  <option value="priority">By Priority</option>
                </select>
              </div>
            </div>

            {/* Additional Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t mt-4">
                {/* Type */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(TYPE_LABELS).map(([type, label]) => (
                      <button
                        key={type}
                        onClick={() => toggleTypeFilter(type)}
                        className={`px-3 py-1 text-sm rounded-full ${
                          selectedTypes.includes(type)
                            ? TYPE_COLORS[type]
                            : "bg-gray-200 text-gray-400"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* State */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(STATE_LABELS).map(([state, label]) => (
                      <button
                        key={state}
                        onClick={() => toggleStateFilter(state)}
                        className={`px-3 py-1 text-sm rounded-full ${
                          selectedStates.includes(state)
                            ? STATE_COLORS[state as keyof typeof STATE_COLORS]
                            : "bg-gray-200 text-gray-400"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => toggleTagFilter(tag)}
                        className={`px-3 py-1 text-sm rounded-full ${
                          selectedTags.includes(tag)
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                    {availableTags.length === 0 && (
                      <p className="text-sm text-gray-500">No tags yet</p>
                    )}
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm"
                  >
                    <option value="">All</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                {/* Complexity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Complexity
                  </label>
                  <select
                    value={selectedComplexity}
                    onChange={(e) => setSelectedComplexity(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm"
                  >
                    <option value="">All</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                {/* Energy */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Energy</label>
                  <select
                    value={selectedEnergy}
                    onChange={(e) => setSelectedEnergy(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm"
                  >
                    <option value="">All</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading items...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Task Groups */}
          {!loading && !error && (
            <div className="space-y-6">
              {Object.entries(groupedItems)
                .sort(([groupNameA], [groupNameB]) => {
                  // Sort by state order when grouping by state
                  if (groupBy === "state") {
                    const indexA = STATE_ORDER.indexOf(groupNameA);
                    const indexB = STATE_ORDER.indexOf(groupNameB);
                    return indexA - indexB;
                  }
                  return 0; // Keep original order for other groupings
                })
                .map(([groupName, groupItems]) => {
                  const isCollapsed = collapsedSections.has(groupName);
                  const sortedItems = [...groupItems].sort(sortChronologically);
                  return (
                <div key={groupName}>
                  {groupBy !== "none" && (
                    <button
                      onClick={() => toggleSection(groupName)}
                      className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3 capitalize w-full text-left"
                    >
                      {groupName} ({groupItems.length})
                      <div className="flex-1" />
                      <svg
                        className={`w-4 h-4 text-gray-500 transition-transform ${isCollapsed ? "" : "rotate-90"}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}

                  {groupItems.length === 0 && groupBy === "none" && (
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                      <p className="text-gray-600 mb-2">No items match your filters</p>
                      <p className="text-sm text-gray-500">Try adjusting your filters</p>
                    </div>
                  )}

                  {!isCollapsed && (
                  <div className="space-y-2">
                    {sortedItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleTaskClick(item)}
                        className="bg-white rounded-lg border border-gray-200 p-2 sm:p-3 hover:border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-1 sm:gap-2">
                          <div className="flex-1 min-w-0">
                            {/* Item name with type badge and inline date/time */}
                            <div className="flex items-baseline gap-2 flex-wrap">
                              {/* Type indicator for habits and reminders */}
                              {item.itemType !== "task" && (
                                <span className={`text-xs px-1.5 py-0.5 rounded ${TYPE_COLORS[item.itemType]}`}>
                                  {item.itemType === "habit" ? "🔄" : "⏰"}
                                </span>
                              )}
                              <h3 className="font-medium text-gray-900 wrap-break-word">
                                {item.name}
                              </h3>
                              {/* Schedule info for habits */}
                              {item.itemType === "habit" && item.scheduleType && (
                                <span className="text-xs text-green-600">
                                  {item.scheduleType === "daily" ? "Daily" :
                                   item.scheduleType === "weekdays" ? "Weekdays" :
                                   item.scheduleType === "weekends" ? "Weekends" :
                                   item.scheduleDays || item.scheduleType}
                                </span>
                              )}
                              {item.dueDate && (
                                <span className="text-sm text-gray-500">
                                  ·{" "}
                                  {(() => {
                                    // Parse date as local to avoid timezone shift
                                    const dateStr = item.dueDate.split('T')[0];
                                    const [year, month, day] = dateStr.split('-').map(Number);
                                    const localDate = new Date(year, month - 1, day);
                                    return localDate.toLocaleDateString("en-US", {
                                      weekday: "short",
                                      month: "short",
                                      day: "numeric",
                                    });
                                  })()}
                                  {item.dueTime && `, ${item.dueTime}`}
                                </span>
                              )}
                            </div>

                            {/* Tags */}
                            {item.tags && item.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-1.5">
                                {item.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Right side: Priority indicator and checkbox */}
                          <div className="flex items-center gap-2 shrink-0">
                            {item.priority === "high" && (
                              <span className="text-red-500 text-lg">!</span>
                            )}
                            {/* Checkbox */}
                            <button
                              onClick={(e) => toggleCompletion(item, e)}
                              className="w-5 h-5 rounded border-2 border-gray-300 hover:border-gray-400 flex items-center justify-center shrink-0"
                            >
                              {item.isCompleted && (
                                <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  )}
                </div>
                  );
                })}
            </div>
          )}

          {/* Summary */}
          {!loading && !error && filteredItems.length > 0 && (
            <div className="mt-6 text-center text-sm text-gray-600">
              Showing {filteredItems.length} of {items.length} items
            </div>
          )}
        </main>

        {/* Item Edit Modal */}
        <TaskForm
          isOpen={showTaskModal}
          onClose={() => {
            setShowTaskModal(false);
            setEditingTask(null);
          }}
          onSave={saveTask}
          onDelete={deleteTask}
          existingTask={editingTask}
          availableTags={availableTags}
          itemType={editingTask?.itemType || "task"}
        />
      </div>
    </ProtectedRoute>
  );
}

export default function AllTasksPage() {
  return <AllTasksContent />;
}
