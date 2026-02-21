"use client";

import { useEffect, useState, useMemo, useContext, useRef } from "react";
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

// Preferred section order
const STATE_ORDER = ["Active", "Backlog", "Completed"];

// Item type colors (for the type indicator on cards)
const TYPE_COLORS: Record<string, string> = {
  task: "bg-purple-100 text-purple-800",
  habit: "bg-green-100 text-green-800",
  reminder: "bg-amber-100 text-amber-800",
};

const STATE_LABELS: Record<string, string> = {
  backlog: "Backlog",
  active: "Active",
  completed: "Completed",
};

function AllTasksContent() {
  const { insideSwipe } = useContext(SwipeContext);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Task modal state
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Item | null>(null);

  // Filters — empty array = "All" (no filter applied)
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedComplexities, setSelectedComplexities] = useState<string[]>([]);
  const [selectedEnergies, setSelectedEnergies] = useState<string[]>([]);

  // Display toggles — which metadata fields show on each item card (default: all off = clean view)
  const [showPriorityBadge, setShowPriorityBadge] = useState(false);
  const [showComplexityBadge, setShowComplexityBadge] = useState(false);
  const [showEnergyBadge, setShowEnergyBadge] = useState(false);
  const [showTagsBadge, setShowTagsBadge] = useState(false);

  // Display dropdown state
  const [showDisplayMenu, setShowDisplayMenu] = useState(false);
  const displayMenuRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => { loadData(); }, []);
  useRefreshOnFocus(loadData);

  // Close Display dropdown on click outside
  useEffect(() => {
    if (!showDisplayMenu) return;
    const handler = (e: MouseEvent) => {
      if (displayMenuRef.current && !displayMenuRef.current.contains(e.target as Node)) {
        setShowDisplayMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showDisplayMenu]);

  // Back button closes filter panel instead of navigating away
  useEffect(() => {
    if (showFilters) {
      window.history.pushState({ filterOpen: true }, '');
      const handlePopState = () => setShowFilters(false);
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, [showFilters]);

  const availableTags = useMemo(() => extractUniqueTags(items), [items]);

  // Filter items — empty array means no filter for that dimension
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (selectedTypes.length > 0 && !selectedTypes.includes(item.itemType)) return false;
      if (selectedStates.length > 0 && !selectedStates.includes(item.state || "active")) return false;
      if (selectedTags.length > 0 && !itemMatchesTags(item.tags, selectedTags)) return false;
      if (selectedPriorities.length > 0 && item.priority && !selectedPriorities.includes(item.priority)) return false;
      if (selectedComplexities.length > 0 && item.complexity && !selectedComplexities.includes(item.complexity)) return false;
      if (selectedEnergies.length > 0 && item.energy && !selectedEnergies.includes(item.energy)) return false;
      return true;
    });
  }, [items, selectedTypes, selectedStates, selectedTags, selectedPriorities, selectedComplexities, selectedEnergies]);

  // Group items
  const groupedItems = useMemo(() => {
    if (groupBy === "none") return { "All Items": filteredItems };

    const groups: Record<string, Item[]> = {};
    filteredItems.forEach((item) => {
      let groupKey = "None";
      switch (groupBy) {
        case "state":
          groupKey = STATE_LABELS[item.state as keyof typeof STATE_LABELS] || "Active";
          break;
        case "type":
          groupKey = item.itemType.charAt(0).toUpperCase() + item.itemType.slice(1);
          break;
        case "tag":
          if (item.tags && item.tags.length > 0) {
            item.tags.forEach((tag) => {
              if (!groups[tag]) groups[tag] = [];
              groups[tag].push(item);
            });
            return;
          }
          break;
        case "complexity": groupKey = item.complexity || "None"; break;
        case "energy":     groupKey = item.energy || "None";     break;
        case "priority":   groupKey = item.priority || "None";   break;
      }
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(item);
    });

    if (groupBy === "state" && !groups["Completed"]) groups["Completed"] = [];
    return groups;
  }, [filteredItems, groupBy]);

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
      const res = await fetch(`/api/items/${editingTask.id}`, { method: "DELETE" });
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
        body: JSON.stringify({ date: item.dueDate || new Date().toISOString().split("T")[0] }),
      });
      if (!res.ok) throw new Error("Failed to toggle completion");
      await loadData();
    } catch (error) {
      console.error("Error toggling completion:", error);
    }
  };

  // Toggle helpers — add to selection, or remove if already selected
  const toggleTypeFilter     = (t: string) => setSelectedTypes((p) => p.includes(t) ? p.filter((x) => x !== t) : [...p, t]);
  const toggleStateFilter    = (s: string) => setSelectedStates((p) => p.includes(s) ? p.filter((x) => x !== s) : [...p, s]);
  const togglePriorityFilter = (v: string) => setSelectedPriorities((p) => p.includes(v) ? p.filter((x) => x !== v) : [...p, v]);
  const toggleComplexityFilter = (v: string) => setSelectedComplexities((p) => p.includes(v) ? p.filter((x) => x !== v) : [...p, v]);
  const toggleEnergyFilter   = (v: string) => setSelectedEnergies((p) => p.includes(v) ? p.filter((x) => x !== v) : [...p, v]);

  const clearFilters = () => {
    setSelectedTypes([]);
    setSelectedStates([]);
    setSelectedTags([]);
    setSelectedPriorities([]);
    setSelectedComplexities([]);
    setSelectedEnergies([]);
  };

  const hasActiveFilters =
    selectedTypes.length > 0 ||
    selectedStates.length > 0 ||
    selectedTags.length > 0 ||
    selectedPriorities.length > 0 ||
    selectedComplexities.length > 0 ||
    selectedEnergies.length > 0;

  // Whether any display badges are on (for the Display button indicator)
  const anyDisplayOn = showPriorityBadge || showComplexityBadge || showEnergyBadge || showTagsBadge;

  const toggleSection = (groupName: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      next.has(groupName) ? next.delete(groupName) : next.add(groupName);
      return next;
    });
  };

  const sortChronologically = (a: Item, b: Item): number => {
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return a.dueDate.localeCompare(b.dueDate);
  };

  const clearCompleted = async () => {
    const completedItems = items.filter((item) => item.state === "completed" && !item.scheduleType);
    if (completedItems.length === 0) return;
    if (!confirm(`Delete ${completedItems.length} completed item${completedItems.length > 1 ? "s" : ""}?`)) return;
    try {
      await Promise.all(completedItems.map((item) => fetch(`/api/items/${item.id}`, { method: "DELETE" })));
      await loadData();
    } catch (error) {
      console.error("Error clearing completed items:", error);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 overflow-x-hidden">
        {!insideSwipe && <Header onFilterClick={() => setShowFilters(!showFilters)} />}

        {/* Compact control bar — right below header, no gap, right-aligned */}
        <div className="bg-white border-b border-gray-100 px-4 py-1.5 flex items-center justify-end gap-2 -mt-2 md:mt-0">
          {/* Group By */}
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as GroupBy)}
            className="border border-gray-200 rounded px-2 py-1 text-sm text-gray-700 bg-white"
          >
            <option value="none">No grouping</option>
            <option value="state">By State</option>
            <option value="type">By Type</option>
            <option value="tag">By Tag</option>
            <option value="complexity">By Complexity</option>
            <option value="energy">By Energy</option>
            <option value="priority">By Priority</option>
          </select>

          {/* Display dropdown — toggles what metadata shows on item cards */}
          <div className="relative" ref={displayMenuRef}>
            <button
              onClick={() => setShowDisplayMenu((v) => !v)}
              className={`flex items-center gap-1 px-2.5 py-1 text-sm rounded border transition-colors ${
                anyDisplayOn
                  ? "border-purple-300 bg-purple-50 text-purple-700"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              Display
              {anyDisplayOn && <span className="w-1.5 h-1.5 rounded-full bg-purple-500 inline-block" />}
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showDisplayMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white shadow-lg rounded-lg border border-gray-200 py-1.5 z-50 min-w-[140px]">
                {[
                  { key: "priority",   label: "Priority",   state: showPriorityBadge,   set: setShowPriorityBadge },
                  { key: "complexity", label: "Complexity", state: showComplexityBadge, set: setShowComplexityBadge },
                  { key: "energy",     label: "Energy",     state: showEnergyBadge,     set: setShowEnergyBadge },
                  { key: "tags",       label: "Tags",       state: showTagsBadge,        set: setShowTagsBadge },
                ].map(({ key, label, state, set }) => (
                  <button
                    key={key}
                    onClick={() => set((v) => !v)}
                    className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-gray-50"
                  >
                    <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                      state ? "bg-purple-600 border-purple-600" : "border-gray-300"
                    }`}>
                      {state && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={state ? "text-gray-900" : "text-gray-500"}>{label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Clear filters link — only when active */}
          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-xs text-gray-400 hover:text-gray-600">
              Clear
            </button>
          )}
        </div>

        {/* Filter panel (bubble UI) — shown when header filter icon is tapped */}
        {showFilters && (
          <div className="bg-white border-b border-gray-200 px-4 pb-4">
            <FilterPanel
              selectedTypes={selectedTypes}
              onToggleType={toggleTypeFilter}
              onClearTypes={() => setSelectedTypes([])}
              availableTypes={["task", "habit", "reminder"]}
              selectedStates={selectedStates}
              onToggleState={toggleStateFilter}
              onClearStates={() => setSelectedStates([])}
              selectedPriorities={selectedPriorities}
              onTogglePriority={togglePriorityFilter}
              onClearPriorities={() => setSelectedPriorities([])}
              selectedComplexities={selectedComplexities}
              onToggleComplexity={toggleComplexityFilter}
              onClearComplexities={() => setSelectedComplexities([])}
              selectedEnergies={selectedEnergies}
              onToggleEnergy={toggleEnergyFilter}
              onClearEnergies={() => setSelectedEnergies([])}
              selectedTags={selectedTags}
              onTagsChange={setSelectedTags}
              availableTags={availableTags}
            />
          </div>
        )}

        <main className="max-w-7xl mx-auto px-4 py-3">
          {loading && (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading items...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-6">
              {Object.entries(groupedItems)
                .sort(([a], [b]) => {
                  if (groupBy === "state") {
                    return STATE_ORDER.indexOf(a) - STATE_ORDER.indexOf(b);
                  }
                  return 0;
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
                              onClick={() => { setEditingTask(item); setShowTaskModal(true); }}
                              className={`bg-white rounded-lg border border-gray-200 p-2 sm:p-3 hover:border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer ${item.isCompleted ? "opacity-60" : ""}`}
                            >
                              <div className="flex items-start justify-between gap-1 sm:gap-2">
                                <div className="flex-1 min-w-0">
                                  {/* Name line with type indicator, schedule info, and date */}
                                  <div className="flex items-baseline gap-2 flex-wrap">
                                    {item.itemType !== "task" && (
                                      <span className={`text-xs px-1.5 py-0.5 rounded ${TYPE_COLORS[item.itemType]}`}>
                                        {item.itemType === "habit" ? "🔄" : "⏰"}
                                      </span>
                                    )}
                                    <h3 className={`font-medium text-gray-900 wrap-break-word ${item.isCompleted ? "line-through" : ""}`}>
                                      {item.name}
                                    </h3>
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
                                          const dateStr = item.dueDate!.split('T')[0];
                                          const [year, month, day] = dateStr.split('-').map(Number);
                                          return new Date(year, month - 1, day).toLocaleDateString("en-US", {
                                            weekday: "short", month: "short", day: "numeric",
                                          });
                                        })()}
                                        {item.dueTime && `, ${item.dueTime}`}
                                      </span>
                                    )}
                                  </div>

                                  {/* Metadata badges — gated by Display dropdown toggles */}
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

                                  {/* Tags — gated by Display dropdown */}
                                  {showTagsBadge && item.tags && item.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-1">
                                      {item.tags.map((tag) => (
                                        <span key={tag} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>

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
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}

          {!loading && !error && filteredItems.length > 0 && (
            <div className="mt-6 text-center text-sm text-gray-600">
              Showing {filteredItems.length} of {items.length} items
            </div>
          )}
        </main>

        <TaskForm
          isOpen={showTaskModal}
          onClose={() => { setShowTaskModal(false); setEditingTask(null); }}
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
