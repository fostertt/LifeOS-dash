"use client";

import { useEffect, useState, useMemo, useContext } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Header from "@/components/Header";
import { SwipeContext } from "@/components/SwipeContainer";
import TaskForm from "@/components/TaskForm";
import { extractUniqueTags, itemMatchesTags } from "@/lib/tags";

interface Item {
  id: number;
  itemType: "habit" | "task" | "reminder";
  name: string;
  description?: string;
  dueDate?: string;
  dueTime?: string;
  isCompleted?: boolean;
  completedAt?: string;
  isParent: boolean;
  priority?: string;
  complexity?: string;
  duration?: string;
  energy?: string;
  state?: string;
  tags?: string[];
  subItems?: any[];
}

type GroupBy = "none" | "state" | "tag" | "complexity" | "energy" | "priority";

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

function AllTasksContent() {
  const { insideSwipe } = useContext(SwipeContext);
  const router = useRouter();
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
  ]); // Don't show completed by default
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPriority, setSelectedPriority] = useState<string>("");
  const [selectedComplexity, setSelectedComplexity] = useState<string>("");
  const [selectedEnergy, setSelectedEnergy] = useState<string>("");
  const [groupBy, setGroupBy] = useState<GroupBy>("state");
  const [showFilters, setShowFilters] = useState(false);

  // Load all tasks
  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/items?type=task");
      if (!response.ok) throw new Error("Failed to fetch tasks");

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

  // Extract unique tags from items
  const availableTags = useMemo(() => extractUniqueTags(items), [items]);

  // Filter items based on selected filters
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
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
  }, [items, selectedStates, selectedTags, selectedPriority, selectedComplexity, selectedEnergy]);

  // Group items
  const groupedItems = useMemo(() => {
    if (groupBy === "none") {
      return { "All Tasks": filteredItems };
    }

    const groups: Record<string, Item[]> = {};

    filteredItems.forEach((item) => {
      let groupKey = "None";

      switch (groupBy) {
        case "state":
          groupKey = STATE_LABELS[item.state as keyof typeof STATE_LABELS] || "Active";
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

      if (!res.ok) throw new Error("Failed to update task");

      // Reload tasks
      await loadData();
    } catch (error) {
      console.error("Error updating task:", error);
      throw error;
    }
  };

  // Toggle state filter
  const toggleStateFilter = (state: string) => {
    setSelectedStates((prev) =>
      prev.includes(state) ? prev.filter((s) => s !== state) : [...prev, state]
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
    setSelectedTags([]);
    setSelectedPriority("");
    setSelectedComplexity("");
    setSelectedEnergy("");
  };

  const hasActiveFilters =
    selectedTags.length > 0 || selectedPriority || selectedComplexity || selectedEnergy;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {!insideSwipe && <Header />}

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filter and Group Controls */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                {showFilters ? "Hide Filters" : "More Filters"}
                {hasActiveFilters && (
                  <span className="ml-2 text-blue-600">
                    (
                    {selectedTags.length +
                      (selectedPriority ? 1 : 0) +
                      (selectedComplexity ? 1 : 0) +
                      (selectedEnergy ? 1 : 0)}{" "}
                    active)
                  </span>
                )}
              </button>

              <div className="flex items-center gap-4">
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Clear filters
                  </button>
                )}
                <label className="text-sm text-gray-700">
                  Group by:
                  <select
                    value={groupBy}
                    onChange={(e) => setGroupBy(e.target.value as GroupBy)}
                    className="ml-2 border rounded px-2 py-1 text-sm"
                  >
                    <option value="none">None</option>
                    <option value="state">State</option>
                    <option value="tag">Tag</option>
                    <option value="complexity">Complexity</option>
                    <option value="energy">Energy</option>
                    <option value="priority">Priority</option>
                  </select>
                </label>
              </div>
            </div>

            {/* Additional Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t mt-4">
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
              <p className="text-gray-600">Loading tasks...</p>
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
              {Object.entries(groupedItems).map(([groupName, groupItems]) => (
                <div key={groupName}>
                  {groupBy !== "none" && (
                    <h2 className="text-lg font-semibold text-gray-900 mb-3 capitalize">
                      {groupName} ({groupItems.length})
                    </h2>
                  )}

                  {groupItems.length === 0 && groupBy === "none" && (
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                      <p className="text-gray-600 mb-2">No tasks match your filters</p>
                      <p className="text-sm text-gray-500">Try adjusting your filters</p>
                    </div>
                  )}

                  <div className="space-y-3">
                    {groupItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleTaskClick(item)}
                        className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900">{item.name}</h3>
                              {/* State badge */}
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full ${
                                  STATE_COLORS[item.state as keyof typeof STATE_COLORS] ||
                                  STATE_COLORS.active
                                }`}
                              >
                                {STATE_LABELS[item.state as keyof typeof STATE_LABELS] ||
                                  "Active"}
                              </span>
                            </div>

                            {/* Date if scheduled */}
                            {item.dueDate && (
                              <p className="text-sm text-gray-600">
                                {(() => {
                                  // Parse date as local to avoid timezone shift
                                  const dateStr = item.dueDate.split('T')[0]; // Get YYYY-MM-DD part
                                  const [year, month, day] = dateStr.split('-').map(Number);
                                  const localDate = new Date(year, month - 1, day);
                                  return localDate.toLocaleDateString("en-US", {
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric",
                                  });
                                })()}
                                {item.dueTime && ` at ${item.dueTime}`}
                              </p>
                            )}

                            {/* Metadata */}
                            {(item.complexity || item.energy || item.duration) && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {item.complexity && (
                                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                    {item.complexity}
                                  </span>
                                )}
                                {item.energy && (
                                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                    {item.energy} energy
                                  </span>
                                )}
                                {item.duration && (
                                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                    {item.duration}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Tags */}
                            {item.tags && item.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {item.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Priority indicator */}
                          {item.priority === "high" && (
                            <span className="text-red-500 text-xl ml-2">!</span>
                          )}
                          {item.priority === "low" && (
                            <span className="text-gray-400 text-xl ml-2">-</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Summary */}
          {!loading && !error && filteredItems.length > 0 && (
            <div className="mt-6 text-center text-sm text-gray-600">
              Showing {filteredItems.length} of {items.length} tasks
            </div>
          )}
        </main>

        {/* Task Edit Modal */}
        <TaskForm
          isOpen={showTaskModal}
          onClose={() => {
            setShowTaskModal(false);
            setEditingTask(null);
          }}
          onSave={saveTask}
          existingTask={editingTask}
          availableTags={availableTags}
          itemType="task"
        />
      </div>
    </ProtectedRoute>
  );
}

export default function AllTasksPage() {
  return <AllTasksContent />;
}
