"use client";

import { useEffect, useState, useMemo, useContext, useCallback } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Header from "@/components/Header";
import { SwipeContext } from "@/components/SwipeContainer";
import TaskForm from "@/components/TaskForm";
import { extractUniqueTags, itemMatchesTags } from "@/lib/tags";
import { useRefreshOnFocus } from "@/lib/useRefreshOnFocus";
import FilterPanel from "@/components/FilterPanel";

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
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedComplexities, setSelectedComplexities] = useState<string[]>([]);
  const [selectedEnergies, setSelectedEnergies] = useState<string[]>([]);

  // Badge visibility toggles — shown in always-visible control bar
  const [showPriorityBadge, setShowPriorityBadge] = useState(true);
  const [showComplexityBadge, setShowComplexityBadge] = useState(true);
  const [showEnergyBadge, setShowEnergyBadge] = useState(true);
  const [groupBy, setGroupBy] = useState<GroupBy>("state");
  const [showFilters, setShowFilters] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set(["Completed"]));

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
  useRefreshOnFocus(loadData);

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

      // Priority filter (multi-select; items with no value always pass)
      if (selectedPriorities.length > 0 && item.priority && !selectedPriorities.includes(item.priority)) {
        return false;
      }

      // Complexity filter (multi-select)
      if (selectedComplexities.length > 0 && item.complexity && !selectedComplexities.includes(item.complexity)) {
        return false;
      }

      // Energy filter (multi-select)
      if (selectedEnergies.length > 0 && item.energy && !selectedEnergies.includes(item.energy)) {
        return false;
      }

      return true;
    });
  }, [items, selectedTypes, selectedStates, selectedTags, selectedPriorities, selectedComplexities, selectedEnergies]);

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

    // Always include a Completed section when grouping by state
    if (groupBy === "state" && !groups["Completed"]) {
      groups["Completed"] = [];
    }

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

  // Toggle priority filter
  const togglePriorityFilter = (p: string) => {
    setSelectedPriorities((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  // Toggle complexity filter
  const toggleComplexityFilter = (c: string) => {
    setSelectedComplexities((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  // Toggle energy filter
  const toggleEnergyFilter = (e: string) => {
    setSelectedEnergies((prev) =>
      prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e]
    );
  };

  // Clear all filters (but keep default states)
  const clearFilters = () => {
    setSelectedStates(["backlog", "active", "in_progress"]);
    setSelectedTypes(["task", "habit", "reminder"]);
    setSelectedTags([]);
    setSelectedPriorities([]);
    setSelectedComplexities([]);
    setSelectedEnergies([]);
  };

  // Back button closes filter panel instead of navigating away
  useEffect(() => {
    if (showFilters) {
      window.history.pushState({ filterOpen: true }, '');
      const handlePopState = () => setShowFilters(false);
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, [showFilters]);

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

  /** Delete all completed non-recurring items */
  const clearCompleted = async () => {
    const completedItems = items.filter(
      (item) => item.state === "completed" && !item.scheduleType
    );
    if (completedItems.length === 0) return;

    if (!confirm(`Delete ${completedItems.length} completed item${completedItems.length > 1 ? "s" : ""}?`)) return;

    try {
      await Promise.all(
        completedItems.map((item) =>
          fetch(`/api/items/${item.id}`, { method: "DELETE" })
        )
      );
      await loadData();
    } catch (error) {
      console.error("Error clearing completed items:", error);
    }
  };

  const hasActiveFilters =
    selectedTags.length > 0 ||
    selectedPriorities.length > 0 ||
    selectedComplexities.length > 0 ||
    selectedEnergies.length > 0 ||
    selectedTypes.length < 3;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 overflow-x-hidden">
        {!insideSwipe && <Header onFilterClick={() => setShowFilters(!showFilters)} />}

        <main className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8 py-4">
          {/* Always-visible control bar: Group By + badge toggles + clear */}
          <div className="bg-white rounded-lg shadow px-3 py-2 mb-4">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Group By */}
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value as GroupBy)}
                className="border rounded px-2 py-1 text-sm font-medium text-gray-700"
              >
                <option value="none">No grouping</option>
                <option value="state">By State</option>
                <option value="type">By Type</option>
                <option value="tag">By Tag</option>
                <option value="complexity">By Complexity</option>
                <option value="energy">By Energy</option>
                <option value="priority">By Priority</option>
              </select>

              <span className="text-gray-300 hidden sm:inline">·</span>

              {/* Badge visibility chip toggles */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowPriorityBadge((v) => !v)}
                  className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${
                    showPriorityBadge
                      ? "bg-red-100 text-red-700 border-red-200"
                      : "bg-gray-50 text-gray-400 border-gray-200"
                  }`}
                  title="Toggle priority badges"
                >
                  ↑P
                </button>
                <button
                  onClick={() => setShowComplexityBadge((v) => !v)}
                  className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${
                    showComplexityBadge
                      ? "bg-green-100 text-green-700 border-green-200"
                      : "bg-gray-50 text-gray-400 border-gray-200"
                  }`}
                  title="Toggle complexity badges"
                >
                  C
                </button>
                <button
                  onClick={() => setShowEnergyBadge((v) => !v)}
                  className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${
                    showEnergyBadge
                      ? "bg-purple-100 text-purple-700 border-purple-200"
                      : "bg-gray-50 text-gray-400 border-gray-200"
                  }`}
                  title="Toggle energy badges"
                >
                  ⚡E
                </button>
              </div>

              {/* Clear filters (only when active) */}
              {hasActiveFilters && (
                <>
                  <span className="text-gray-300 hidden sm:inline">·</span>
                  <button
                    onClick={clearFilters}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Clear filters
                  </button>
                </>
              )}
            </div>

            {/* Filter panel (bubble UI) — shown when filter icon in header is tapped */}
            {showFilters && (
              <FilterPanel
                selectedTypes={selectedTypes}
                onToggleType={toggleTypeFilter}
                availableTypes={["task", "habit", "reminder"]}
                selectedStates={selectedStates}
                onToggleState={toggleStateFilter}
                selectedPriorities={selectedPriorities}
                onTogglePriority={togglePriorityFilter}
                selectedComplexities={selectedComplexities}
                onToggleComplexity={toggleComplexityFilter}
                selectedEnergies={selectedEnergies}
                onToggleEnergy={toggleEnergyFilter}
                selectedTags={selectedTags}
                onTagsChange={setSelectedTags}
                availableTags={availableTags}
              />
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
                    <div className="flex items-center gap-2 mb-3">
                      <button
                        onClick={() => toggleSection(groupName)}
                        className="flex items-center gap-2 text-lg font-semibold text-gray-900 capitalize flex-1 text-left"
                      >
                        {groupName} ({groupItems.length})
                        <svg
                          className={`w-4 h-4 text-gray-500 transition-transform ${isCollapsed ? "" : "rotate-90"}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      {groupName === "Completed" && groupItems.length > 0 && (
                        <button
                          onClick={clearCompleted}
                          className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50"
                        >
                          Clear all
                        </button>
                      )}
                    </div>
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
                        className={`bg-white rounded-lg border border-gray-200 p-2 sm:p-3 hover:border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer ${item.isCompleted ? "opacity-60" : ""}`}
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
                              <h3 className={`font-medium text-gray-900 wrap-break-word ${item.isCompleted ? "line-through" : ""}`}>
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

                            {/* Metadata badges: Priority, Complexity, Energy — gated by badge visibility toggles */}
                            {(showPriorityBadge || showComplexityBadge || showEnergyBadge) &&
                             (item.priority || item.complexity || item.energy) && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {showPriorityBadge && item.priority && (
                                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                                    item.priority === "high" ? "bg-red-100 text-red-700" :
                                    item.priority === "medium" ? "bg-orange-100 text-orange-700" :
                                    "bg-gray-100 text-gray-600"
                                  }`}>
                                    {item.priority === "high" ? "↑ High" : item.priority === "medium" ? "Med" : "↓ Low"}
                                  </span>
                                )}
                                {showComplexityBadge && item.complexity && (
                                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                                    item.complexity === "hard" ? "bg-red-50 text-red-600" :
                                    item.complexity === "medium" ? "bg-yellow-50 text-yellow-700" :
                                    "bg-green-50 text-green-700"
                                  }`}>
                                    {item.complexity === "hard" ? "Hard" : item.complexity === "medium" ? "Med" : "Easy"}
                                  </span>
                                )}
                                {showEnergyBadge && item.energy && (
                                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                                    item.energy === "high" ? "bg-purple-50 text-purple-700" :
                                    item.energy === "medium" ? "bg-blue-50 text-blue-700" :
                                    "bg-slate-100 text-slate-600"
                                  }`}>
                                    ⚡{item.energy === "high" ? "High" : item.energy === "medium" ? "Med" : "Low"}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Tags */}
                            {item.tags && item.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-1">
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

                          {/* Right side: Checkbox */}
                          <div className="flex items-center gap-2 shrink-0">
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
