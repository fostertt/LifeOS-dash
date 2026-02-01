"use client";

import { useEffect, useState, Suspense, useMemo, useContext } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Header from "@/components/Header";
import { SwipeContext } from "@/components/SwipeContainer";
import EventDetailModal, { CalendarEvent } from "@/components/EventDetailModal";
import TagInput from "@/components/TagInput";
import { extractUniqueTags } from "@/lib/tags";

interface SubItem {
  id?: number;
  name: string;
  dueDate?: string;
  isCompleted?: boolean;
  completions?: Array<{ completionDate: string }>;
}

interface Item {
  id: number;
  itemType: "habit" | "task" | "reminder";
  name: string;
  description?: string;
  scheduleType?: string;
  scheduleDays?: string;
  scheduledTime?: string;
  dueDate?: string;
  dueTime?: string;
  isCompleted?: boolean;
  completedAt?: string;
  isParent: boolean;
  parentItemId?: number;
  priority?: string;
  // Phase 3.1: Renamed fields
  complexity?: string; // Renamed from 'effort'
  duration?: string; // User-friendly display ("15min", "30min")
  durationMinutes?: number; // Phase 3.4: Actual duration in minutes for timeline
  energy?: string; // Renamed from 'focus'
  // Phase 3.1: New fields
  state?: string; // unscheduled | scheduled | in_progress | on_hold | completed
  tags?: string[]; // Array of tag strings
  // Phase 3.4: Calendar display fields
  showOnCalendar?: boolean; // Pin to today's calendar view
  subItems?: SubItem[];
  completions?: Array<{ completionDate: string }>;
}

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

// Phase 3.4: Categorized calendar data structure
interface CategorizedCalendarData {
  reminders: Item[];
  overdue: Item[];
  inProgress: Item[];
  scheduled: Item[];
  scheduledNoTime: Item[];
  pinned: Item[];
}

type ItemType = "habit" | "task" | "reminder" | "event";
type ViewMode = "timeline" | "compact";

function HomeContent() {
  const { insideSwipe } = useContext(SwipeContext);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Parse date from URL or use today
  const getSelectedDate = () => {
    const dateParam = searchParams.get("date");
    if (dateParam) {
      const [year, month, day] = dateParam.split("-").map(Number);
      return new Date(year, month - 1, day);
    }
    return new Date();
  };

  const [selectedDate, setSelectedDate] = useState<Date>(getSelectedDate);
  const [items, setItems] = useState<Item[]>([]);
  const [categorizedData, setCategorizedData] = useState<CategorizedCalendarData | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completedToday, setCompletedToday] = useState<Set<number>>(new Set());
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedItemType, setSelectedItemType] = useState<ItemType>("habit");
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [savingItem, setSavingItem] = useState(false);
  const [deletingItem, setDeletingItem] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [filterTypes, setFilterTypes] = useState<Set<ItemType>>(
    new Set(["habit", "task", "reminder", "event"])
  );
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );

  // Phase 3.4: View mode (timeline vs compact)
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    // Check localStorage first
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('calendarViewMode');
      if (saved === 'timeline' || saved === 'compact') {
        return saved;
      }
      // Default based on screen size: compact for mobile, timeline for desktop
      return window.innerWidth < 768 ? 'compact' : 'timeline';
    }
    return 'compact';
  });

  // Phase 3.4: Timeline zoom level (pixels per hour)
  const [timelineZoom, setTimelineZoom] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('timelineZoom');
      return saved ? parseInt(saved) : 80; // Default: 80px per hour
    }
    return 80;
  });

  // Form fields
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formTime, setFormTime] = useState("");
  const [formDay, setFormDay] = useState("");
  const [formRecurring, setFormRecurring] = useState(false);
  const [formPriority, setFormPriority] = useState("");
  const [formComplexity, setFormComplexity] = useState(""); // Renamed from formEffort
  const [formDuration, setFormDuration] = useState("");
  const [formEnergy, setFormEnergy] = useState(""); // Renamed from formFocus
  const [formTags, setFormTags] = useState<string[]>([]); // Phase 3.2: Tag support
  const [formShowOnCalendar, setFormShowOnCalendar] = useState(false); // Phase 3.4: Pin to today
  const [formSubItems, setFormSubItems] = useState<SubItem[]>([]);

  // Track expanded items for sub-item display
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  // Date navigation functions
  const navigateToDate = (date: Date) => {
    const dateStr = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    router.push(`/?date=${dateStr}`);
    setSelectedDate(date);
  };

  const goToPreviousDay = () => {
    const prevDay = new Date(selectedDate);
    prevDay.setDate(prevDay.getDate() - 1);
    navigateToDate(prevDay);
  };

  const goToNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    navigateToDate(nextDay);
  };

  const goToToday = () => {
    const today = new Date();
    navigateToDate(today);
  };

  const isToday = () => {
    const today = new Date();
    return selectedDate.toDateString() === today.toDateString();
  };

  const formatSelectedDate = () => {
    return selectedDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const showToast = (message: string, type: Toast["type"] = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  };

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  // Update selectedDate when URL changes
  useEffect(() => {
    const newDate = getSelectedDate();
    if (newDate.toDateString() !== selectedDate.toDateString()) {
      setSelectedDate(newDate);
    }
  }, [searchParams]);

  // Phase 3.2: Extract all unique tags from items for autocomplete
  const availableTags = useMemo(() => {
    return extractUniqueTags(items);
  }, [items]);

  const loadData = async () => {
    try {
      setError(null);

      // Fetch all items
      const itemsRes = await fetch("/api/items");
      if (!itemsRes.ok) {
        throw new Error("Failed to load items");
      }
      const itemsData = await itemsRes.json();
      setItems(Array.isArray(itemsData) ? itemsData : []);

      // Fetch completions for selected date
      const dateStr = `${selectedDate.getFullYear()}-${String(
        selectedDate.getMonth() + 1
      ).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;
      const completionsRes = await fetch(`/api/completions?date=${dateStr}`);
      if (!completionsRes.ok) {
        throw new Error("Failed to load completions");
      }
      const completionsData = await completionsRes.json();

      if (completionsData.completedHabitIds) {
        setCompletedToday(new Set(completionsData.completedHabitIds));
      }

      // Phase 3.4: Fetch categorized calendar items for the selected date
      const calendarItemsRes = await fetch(`/api/calendar/items?date=${dateStr}`);
      if (calendarItemsRes.ok) {
        const categorized = await calendarItemsRes.json();
        setCategorizedData(categorized);
      } else {
        console.warn("Failed to load categorized calendar items");
        setCategorizedData(null);
      }

      // Fetch calendar events for the selected date
      try {
        const eventsRes = await fetch(
          `/api/calendar/events?startDate=${dateStr}&endDate=${dateStr}`
        );
        if (eventsRes.ok) {
          const eventsData = await eventsRes.json();
          setEvents(Array.isArray(eventsData) ? eventsData : []);
        } else {
          // Calendar events are optional, don't fail if they don't load
          console.warn("Failed to load calendar events");
          setEvents([]);
        }
      } catch (eventError) {
        console.warn("Calendar events unavailable:", eventError);
        setEvents([]);
      }

      setLoading(false);
    } catch (err) {
      console.error("Error loading data:", err);
      setError(err instanceof Error ? err.message : "Failed to load data");
      setLoading(false);
    }
  };

  const toggleItem = async (itemId: number) => {
    try {
      const dateStr = `${selectedDate.getFullYear()}-${String(
        selectedDate.getMonth() + 1
      ).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;
      const response = await fetch(`/api/items/${itemId}/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: dateStr }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error && errorData.incompleteCount) {
          showToast(
            `Complete all ${errorData.incompleteCount} sub-items first`,
            "error"
          );
          return;
        }
        throw new Error("Failed to toggle item");
      }

      const data = await response.json();

      // Update local state for recurring items (habits)
      if (data.completed) {
        setCompletedToday((prev) => new Set(prev).add(itemId));
      } else {
        setCompletedToday((prev) => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
      }

      // Reload items to get updated isCompleted field for non-recurring items
      await loadData();
    } catch (error) {
      console.error("Error toggling item:", error);
      showToast("Failed to toggle item", "error");
    }
  };

  const openCreateModal = (type: ItemType) => {
    setSelectedItemType(type);
    setModalMode("create");
    setFormName("");
    setFormDescription("");
    setFormTime("");
    setFormDay("");
    setFormRecurring(false);
    setFormPriority("");
    setFormComplexity(""); // Phase 3.1: Renamed from formEffort
    setFormDuration("");
    setFormEnergy(""); // Phase 3.1: Renamed from formFocus
    setFormTags([]); // Phase 3.2: Tags
    setFormShowOnCalendar(false); // Phase 3.4: Pin to today
    setFormSubItems([]);
    setShowAddMenu(false);
    setShowModal(true);
  };

  const openEditModal = (item: Item) => {
    setEditingItem(item);
    setModalMode("edit");
    setSelectedItemType(item.itemType);
    setFormName(item.name);
    setFormDescription(item.description || "");

    // Set time based on item type
    if (item.itemType === "habit") {
      setFormTime(item.scheduledTime ? item.scheduledTime.substring(0, 5) : "");
    } else {
      setFormTime(item.dueTime ? item.dueTime.substring(0, 5) : "");
    }

    // Set day for tasks
    setFormDay(item.dueDate ? item.dueDate.split("T")[0] : "");

    // Set recurring if scheduleType is daily
    setFormRecurring(item.scheduleType === "daily");

    // Set metadata fields (Phase 3.1: updated field names)
    setFormPriority(item.priority || "");
    setFormComplexity(item.complexity || "");
    setFormDuration(item.duration || "");
    setFormEnergy(item.energy || "");
    setFormTags(item.tags || []); // Phase 3.2: Tags
    setFormShowOnCalendar(item.showOnCalendar || false); // Phase 3.4: Pin to today

    // Load sub-items
    setFormSubItems(
      item.subItems?.map((si) => ({
        id: si.id,
        name: si.name,
        dueDate: si.dueDate ? si.dueDate.split("T")[0] : undefined,
      })) || []
    );

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setShowDeleteConfirm(false);
  };

  const createItem = async () => {
    if (!formName.trim()) return;

    setSavingItem(true);
    setError(null);

    try {
      const itemData: any = {
        itemType: selectedItemType,
        name: formName,
        description: formDescription || null,
        priority: formPriority || null,
        complexity: formComplexity || null, // Phase 3.1: Renamed from effort
        duration: formDuration || null,
        energy: formEnergy || null, // Phase 3.1: Renamed from focus
        tags: formTags.length > 0 ? formTags : null, // Phase 3.2: Tags
        showOnCalendar: formShowOnCalendar, // Phase 3.4: Pin to today
        subItems: formSubItems.filter((si) => si.name.trim()),
      };

      // Set time and date based on item type
      if (selectedItemType === "habit") {
        if (formTime) itemData.scheduledTime = formTime;
        // Habits are always daily recurring by default
        itemData.scheduleType = "daily";
      } else if (selectedItemType === "task") {
        if (formTime) itemData.dueTime = formTime;
        if (formDay) itemData.dueDate = formDay;
        if (formRecurring) itemData.scheduleType = "daily";
      } else if (selectedItemType === "reminder") {
        if (formTime) itemData.dueTime = formTime;
        if (formDay) itemData.dueDate = formDay;
        if (formRecurring) itemData.scheduleType = "daily";
      }

      const response = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemData),
      });

      if (!response.ok) {
        throw new Error("Failed to create item");
      }

      await loadData();
      closeModal();
      showToast(
        `${
          selectedItemType.charAt(0).toUpperCase() + selectedItemType.slice(1)
        } created successfully!`,
        "success"
      );
    } catch (error) {
      console.error("Error creating item:", error);
      const message =
        error instanceof Error ? error.message : "Failed to create item";
      setError(message);
      showToast(message, "error");
    } finally {
      setSavingItem(false);
    }
  };

  const updateItem = async () => {
    if (!editingItem || !formName.trim()) return;

    setSavingItem(true);
    setError(null);

    try {
      const itemData: any = {
        name: formName,
        description: formDescription || null,
        priority: formPriority || null,
        complexity: formComplexity || null, // Phase 3.1: Renamed from effort
        duration: formDuration || null,
        energy: formEnergy || null, // Phase 3.1: Renamed from focus
        tags: formTags.length > 0 ? formTags : null, // Phase 3.2: Tags
        showOnCalendar: formShowOnCalendar, // Phase 3.4: Pin to today
        subItems: formSubItems.filter((si) => si.name.trim()),
      };

      // Set time and date based on item type
      if (editingItem.itemType === "habit") {
        if (formTime) itemData.scheduledTime = formTime;
        itemData.scheduleType = formRecurring ? "daily" : null;
      } else if (editingItem.itemType === "task") {
        if (formTime) itemData.dueTime = formTime;
        if (formDay) itemData.dueDate = formDay;
        itemData.scheduleType = formRecurring ? "daily" : null;
      } else if (editingItem.itemType === "reminder") {
        if (formTime) itemData.dueTime = formTime;
        if (formDay) itemData.dueDate = formDay;
        itemData.scheduleType = formRecurring ? "daily" : null;
      }

      const response = await fetch(`/api/items/${editingItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemData),
      });

      if (!response.ok) {
        throw new Error("Failed to update item");
      }

      await loadData();
      closeModal();
      showToast("Item updated successfully!", "success");
    } catch (error) {
      console.error("Error updating item:", error);
      const message =
        error instanceof Error ? error.message : "Failed to update item";
      setError(message);
      showToast(message, "error");
    } finally {
      setSavingItem(false);
    }
  };

  const deleteItem = async () => {
    if (!editingItem) return;

    setDeletingItem(true);
    setError(null);

    try {
      const response = await fetch(`/api/items/${editingItem.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete item");
      }

      await loadData();
      closeModal();
      showToast("Item deleted successfully!", "success");
    } catch (error) {
      console.error("Error deleting item:", error);
      const message =
        error instanceof Error ? error.message : "Failed to delete item";
      setError(message);
      showToast(message, "error");
    } finally {
      setDeletingItem(false);
    }
  };

  const isScheduledForDate = (item: Item) => {
    const dayOfWeek = selectedDate.getDay();
    const dayForSchedule = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    if (item.itemType === "habit") {
      if (item.scheduleType === "daily") return true;
      if (item.scheduleType === "weekly" && item.scheduleDays) {
        const scheduledDays = item.scheduleDays
          .split(",")
          .map((d) => parseInt(d.trim()));
        return scheduledDays.includes(dayForSchedule);
      }
    }

    // Tasks and reminders without a due date appear on today only
    if (item.itemType === "task" || item.itemType === "reminder") {
      if (!item.dueDate) {
        // Show only on actual today
        const today = new Date();
        return selectedDate.toDateString() === today.toDateString();
      }
      // Parse the date string without timezone conversion to avoid off-by-one errors
      // The dueDate comes as ISO string like "2025-11-16T00:00:00.000Z" or date string "2025-11-16"
      const dueDateStr =
        typeof item.dueDate === "string"
          ? item.dueDate
          : (item.dueDate as Date)?.toISOString() || "";
      const datePart = dueDateStr.split("T")[0]; // Extract "2025-11-16"
      const [year, month, day] = datePart.split("-").map(Number);
      const dueDate = new Date(year, month - 1, day); // Create local date without timezone shift
      return dueDate.toDateString() === selectedDate.toDateString();
    }

    return false;
  };

  const getItemTime = (item: Item): string | null => {
    if (item.itemType === "habit") {
      return item.scheduledTime || null;
    }
    return item.dueTime || null;
  };

  const sortItemsChronologically = (items: Item[]) => {
    return items.sort((a, b) => {
      // Check completion status (recurring vs non-recurring)
      const isRecurringA = a.scheduleType && a.scheduleType !== "";
      const isRecurringB = b.scheduleType && b.scheduleType !== "";
      const isCompletedA = isRecurringA
        ? completedToday.has(a.id)
        : a.isCompleted || false;
      const isCompletedB = isRecurringB
        ? completedToday.has(b.id)
        : b.isCompleted || false;

      // Completed items go to bottom
      if (isCompletedA && !isCompletedB) return 1;
      if (!isCompletedA && isCompletedB) return -1;

      const timeA = getItemTime(a);
      const timeB = getItemTime(b);

      // Items without time come first
      if (!timeA && !timeB) return 0;
      if (!timeA) return -1;
      if (!timeB) return 1;

      // Compare times
      return timeA.localeCompare(timeB);
    });
  };

  const toggleFilter = (type: ItemType) => {
    setFilterTypes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
      }
      return newSet;
    });
  };

  // Phase 3.4: Toggle view mode and persist to localStorage
  const toggleViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('calendarViewMode', mode);
    }
  };

  // Phase 3.4: Adjust timeline zoom
  const adjustZoom = (direction: 'in' | 'out') => {
    setTimelineZoom((prev) => {
      const newZoom = direction === 'in'
        ? Math.min(prev + 20, 160) // Max 160px per hour
        : Math.max(prev - 20, 40);  // Min 40px per hour
      if (typeof window !== 'undefined') {
        localStorage.setItem('timelineZoom', newZoom.toString());
      }
      return newZoom;
    });
  };

  const todayItems = items.filter(isScheduledForDate);
  const filteredItems = todayItems.filter((item) =>
    filterTypes.has(item.itemType)
  );

  // Filter events based on filter settings
  const filteredEvents = filterTypes.has("event") ? events : [];

  // Combine items and events, then sort chronologically
  const allDisplayItems = [...filteredItems, ...filteredEvents];
  const sortedItems = sortItemsChronologically(filteredItems);

  const getItemTypeLabel = (type: ItemType) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getItemTypeIcon = (type: ItemType) => {
    switch (type) {
      case "habit":
        return "🎯";
      case "task":
        return "✅";
      case "reminder":
        return "🔔";
      case "event":
        return "📅";
    }
  };

  const getItemTypeColor = (type: ItemType) => {
    switch (type) {
      case "habit":
        return "bg-purple-100 text-purple-700";
      case "task":
        return "bg-blue-100 text-blue-700";
      case "reminder":
        return "bg-yellow-100 text-yellow-700";
      case "event":
        return "bg-green-100 text-green-700";
    }
  };

  const toggleExpanded = (itemId: number) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  // Phase 3.4: Helper to render section headers
  const renderSectionHeader = (title: string, color: string = "text-gray-700", icon?: string) => (
    <div className="flex items-center gap-2 mb-3 mt-6 first:mt-0">
      {icon && <span className="text-lg">{icon}</span>}
      <h3 className={`text-sm font-semibold uppercase tracking-wide ${color}`}>
        {title}
      </h3>
      <div className="flex-1 border-t border-gray-200"></div>
    </div>
  );

  // Phase 3.4: Helper to render item cards
  const renderItemCard = (item: Item, isOverdue: boolean = false) => {
    const isRecurring = item.scheduleType && item.scheduleType !== "";
    const isCompleted = isRecurring
      ? completedToday.has(item.id)
      : item.isCompleted || false;
    const itemTime = getItemTime(item);

    return (
      <div
        key={item.id}
        onClick={() => openEditModal(item)}
        className={`border-2 rounded-xl p-3 md:p-5 hover:shadow-md transition-all duration-200 cursor-pointer ${
          isOverdue
            ? "border-red-300 bg-gradient-to-r from-red-50 to-orange-50"
            : isCompleted
            ? "border-green-300 bg-gradient-to-r from-green-50 to-emerald-50"
            : "border-gray-100 bg-gradient-to-r from-white to-gray-50 hover:border-purple-300"
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {/* Overdue indicator */}
              {isOverdue && !isCompleted && (
                <span className="text-red-500 text-lg flex-shrink-0" title="Overdue">
                  ⚠
                </span>
              )}
              {/* Priority indicator */}
              {!isOverdue && item.priority === "high" && (
                <span className="text-red-500 text-lg flex-shrink-0" title="High priority">
                  !
                </span>
              )}
              {!isOverdue && item.priority === "low" && (
                <span className="text-gray-400 text-lg flex-shrink-0" title="Low priority">
                  -
                </span>
              )}
              {/* State badge for in_progress */}
              {item.state === "in_progress" && (
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                  In Progress
                </span>
              )}
              <h3
                className={`text-sm font-semibold ${
                  isCompleted
                    ? "text-gray-500 line-through"
                    : isOverdue
                    ? "text-red-900"
                    : "text-gray-900"
                }`}
              >
                {item.name}
              </h3>
              {/* Metadata */}
              {(item.complexity || item.duration || item.energy) && (
                <span className="hidden md:inline text-xs text-gray-500">
                  (
                  {[
                    item.complexity &&
                      item.complexity.charAt(0).toUpperCase() +
                        item.complexity.slice(1),
                    item.duration &&
                      item.duration.charAt(0).toUpperCase() +
                        item.duration.slice(1),
                    item.energy &&
                      item.energy.charAt(0).toUpperCase() +
                        item.energy.slice(1),
                  ]
                    .filter(Boolean)
                    .join(", ")}
                  )
                </span>
              )}
              {/* Recurring icon */}
              {item.scheduleType === "daily" && (
                <span className="ml-auto flex items-center gap-1 text-gray-600 text-xs">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </span>
              )}
            </div>

            {item.description && (
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {item.description}
              </p>
            )}

            {/* Time display */}
            {itemTime && (
              <div className="flex items-center gap-2 text-sm text-gray-700 mb-3">
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{itemTime}</span>
              </div>
            )}

            {/* Sub-items */}
            {item.isParent && item.subItems && item.subItems.length > 0 && (
              <div className="mt-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpanded(item.id);
                  }}
                  className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1 mb-2"
                >
                  {expandedItems.has(item.id) ? "Hide" : "Show"}{" "}
                  {item.subItems.length} sub-
                  {item.itemType === "habit"
                    ? "habits"
                    : item.itemType === "task"
                    ? "tasks"
                    : "items"}
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      expandedItems.has(item.id) ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {expandedItems.has(item.id) && (
                  <div className="space-y-2 pl-4 border-l-2 border-purple-200">
                    {item.subItems.map((subItem) => {
                      const subCompleted = isSubItemCompletedForDate(
                        subItem,
                        selectedDate
                      );
                      return (
                        <div
                          key={subItem.id}
                          className="flex items-center gap-2 text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={subCompleted}
                            onChange={(e) => {
                              e.stopPropagation();
                              if (subItem.id) toggleItem(subItem.id);
                            }}
                            className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                          />
                          <span
                            className={
                              subCompleted
                                ? "text-gray-500 line-through"
                                : "text-gray-700"
                            }
                          >
                            {subItem.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Completion checkbox */}
          <div className="ml-4 flex-shrink-0">
            <input
              type="checkbox"
              checked={isCompleted}
              onChange={(e) => {
                e.stopPropagation();
                toggleItem(item.id);
              }}
              className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500 cursor-pointer"
            />
          </div>
        </div>
      </div>
    );
  };

  const isSubItemCompletedForDate = (subItem: SubItem, date: Date) => {
    if (!subItem.completions) return false;
    const dateStr = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    return subItem.completions.some((c) =>
      c.completionDate.startsWith(dateStr)
    );
  };

  // Phase 3.4: Render Timeline view
  const renderTimelineView = () => {
    if (!categorizedData) return null;

    // Timeline hours: 5am to 11pm (18 hours)
    const startHour = 5;
    const endHour = 23;
    const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);

    // Helper to convert time string (HH:MM) to position in pixels
    const timeToPosition = (timeStr: string): number => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const totalMinutes = (hours - startHour) * 60 + minutes;
      return (totalMinutes / 60) * timelineZoom;
    };

    // Helper to convert duration minutes to height in pixels
    const durationToHeight = (minutes: number): number => {
      return (minutes / 60) * timelineZoom;
    };

    return (
      <div className="space-y-6">
        {/* Zoom controls */}
        <div className="flex items-center justify-end gap-2">
          <span className="text-xs text-gray-600">Zoom:</span>
          <button
            onClick={() => adjustZoom('out')}
            disabled={timelineZoom <= 40}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Zoom out"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <button
            onClick={() => adjustZoom('in')}
            disabled={timelineZoom >= 160}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Zoom in"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Timeline grid */}
        <div className="relative border-l-2 border-gray-300 ml-12 md:ml-0">
          {hours.map((hour) => {
            const topPosition = (hour - startHour) * timelineZoom;
            const timeLabel = hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`;

            return (
              <div
                key={hour}
                className="absolute w-full border-t border-gray-200"
                style={{ top: `${topPosition}px` }}
              >
                <span className="absolute -left-11 md:-left-16 -top-3 text-xs text-gray-600 font-medium w-10 md:w-14 text-right">
                  {timeLabel}
                </span>
              </div>
            );
          })}

          {/* Render scheduled items with time */}
          {categorizedData.scheduled.filter((item) => filterTypes.has(item.itemType)).map((item) => {
            const itemTime = getItemTime(item);
            if (!itemTime) return null;

            const topPosition = timeToPosition(itemTime);
            const height = durationToHeight(item.durationMinutes || 30);
            const isRecurring = item.scheduleType && item.scheduleType !== "";
            const isCompleted = isRecurring ? completedToday.has(item.id) : item.isCompleted || false;

            return (
              <div
                key={item.id}
                className={`absolute left-2 right-2 rounded-lg p-2 cursor-pointer border-l-4 ${
                  isCompleted
                    ? 'bg-green-50 border-green-400'
                    : 'bg-purple-50 border-purple-400 hover:bg-purple-100'
                }`}
                style={{
                  top: `${topPosition}px`,
                  height: `${Math.max(height, 30)}px`, // Minimum height for readability
                }}
                onClick={() => openEditModal(item)}
              >
                <div className="text-xs font-semibold text-gray-900 truncate">{item.name}</div>
                {height > 40 && item.description && (
                  <div className="text-xs text-gray-600 truncate mt-1">{item.description}</div>
                )}
              </div>
            );
          })}

          {/* Render calendar events with time */}
          {filteredEvents.map((event) => {
            if (event.isAllDay) return null;

            const startTime = new Date(event.startTime);
            const endTime = new Date(event.endTime);
            const timeStr = `${startTime.getHours()}:${String(startTime.getMinutes()).padStart(2, '0')}`;
            const durationMs = endTime.getTime() - startTime.getTime();
            const durationMins = Math.round(durationMs / 60000);

            const topPosition = timeToPosition(timeStr);
            const height = durationToHeight(durationMins);

            return (
              <div
                key={`event-${event.id}`}
                className="absolute left-2 right-2 rounded-lg p-2 cursor-pointer border-l-4 bg-green-50 border-green-400 hover:bg-green-100"
                style={{
                  top: `${topPosition}px`,
                  height: `${Math.max(height, 30)}px`,
                  borderLeftColor: event.calendarColor || '#10b981',
                }}
                onClick={() => setSelectedEvent(event)}
              >
                <div className="text-xs font-semibold text-gray-900 truncate">{event.title}</div>
                {height > 40 && event.location && (
                  <div className="text-xs text-gray-600 truncate mt-1">{event.location}</div>
                )}
              </div>
            );
          })}

          {/* Timeline height spacer */}
          <div style={{ height: `${(endHour - startHour + 1) * timelineZoom}px` }} />
        </div>
      </div>
    );
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 overflow-x-hidden">
        <div className="max-w-5xl mx-auto px-4 py-4 md:p-8">
          {!insideSwipe && <Header onFilterClick={() => setShowFilterMenu(!showFilterMenu)} />}

          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
              <svg
                className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="flex-1">
                <h3 className="font-semibold text-red-900">Error</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}

          {/* Date Navigation - Compact on mobile, full on desktop */}
          <div className="bg-white rounded-2xl shadow-lg p-3 md:p-6 mb-4 md:mb-6">
            {/* Mobile: Just arrows and date */}
            <div className="md:hidden flex items-center justify-between">
              <button
                onClick={goToPreviousDay}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Previous day"
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <div className="text-center flex-1">
                <h2 className="text-sm font-semibold text-gray-900">
                  {formatSelectedDate()}
                </h2>
                {!isToday() && (
                  <button
                    onClick={goToToday}
                    className="mt-1 text-xs text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Today
                  </button>
                )}
              </div>

              <button
                onClick={goToNextDay}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Next day"
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>

            {/* Desktop: Full buttons with text */}
            <div className="hidden md:flex items-center justify-between">
              <button
                onClick={goToPreviousDay}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center gap-2"
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Previous Day
              </button>

              <div className="text-center">
                <h2 className="text-base font-semibold text-gray-800">
                  {formatSelectedDate()}
                </h2>
                {!isToday() && (
                  <button
                    onClick={goToToday}
                    className="mt-2 px-3 py-1 bg-purple-600 text-white rounded-full text-sm font-medium hover:bg-purple-700 transition-colors"
                  >
                    Back to Today
                  </button>
                )}
              </div>

              <button
                onClick={goToNextDay}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center gap-2"
              >
                Next Day
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Items Section */}
          <div className="bg-white rounded-2xl shadow-lg p-3 md:p-8 mb-6">
            {/* Desktop: Show header with Today/Items title and count badges */}
            <div className="hidden md:flex items-center gap-3 mb-6 flex-wrap">
              <span className="text-3xl">📋</span>
              <h2 className="text-lg font-semibold text-gray-800">
                {isToday() ? "Today" : "Items"}
              </h2>
              <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold">
                {sortedItems.length + filteredEvents.length} items
              </span>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                {completedToday.size} completed
              </span>

              {/* Phase 3.4: View mode toggle */}
              <div className="ml-auto flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => toggleViewMode('timeline')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'timeline'
                      ? 'bg-white text-purple-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Timeline
                </button>
                <button
                  onClick={() => toggleViewMode('compact')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'compact'
                      ? 'bg-white text-purple-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Compact
                </button>
              </div>
            </div>

            {/* Mobile: Completed count and view toggle */}
            <div className="md:hidden flex items-center justify-between mb-3 gap-2">
              <span className="text-xs text-green-700 font-medium">
                {completedToday.size} completed
              </span>

              {/* Phase 3.4: Mobile view mode toggle */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => toggleViewMode('timeline')}
                  className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                    viewMode === 'timeline'
                      ? 'bg-white text-purple-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Timeline
                </button>
                <button
                  onClick={() => toggleViewMode('compact')}
                  className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                    viewMode === 'compact'
                      ? 'bg-white text-purple-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Compact
                </button>
              </div>
            </div>

            {/* Filter dropdown menu (triggered from header) */}
            {showFilterMenu && (
              <div className="fixed top-16 right-4 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                {(["habit", "task", "reminder", "event"] as ItemType[]).map(
                  (type) => (
                    <button
                      key={type}
                      onClick={() => toggleFilter(type)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                    >
                      <div
                        className={`w-4 h-4 border-2 rounded ${
                          filterTypes.has(type)
                            ? "bg-purple-600 border-purple-600"
                            : "border-gray-300"
                        }`}
                      >
                        {filterTypes.has(type) && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm text-gray-700">
                        {getItemTypeLabel(type)}s
                      </span>
                    </button>
                  )
                )}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
            ) : !categorizedData || (
              categorizedData.reminders.length === 0 &&
              categorizedData.overdue.length === 0 &&
              categorizedData.inProgress.length === 0 &&
              categorizedData.scheduled.length === 0 &&
              categorizedData.scheduledNoTime.length === 0 &&
              categorizedData.pinned.length === 0 &&
              filteredEvents.length === 0
            ) ? (
              <div className="text-center py-16">
                <div className="flex justify-center mb-4">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-12 h-12 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  No items for today
                </h3>
                <p className="text-gray-600 mb-6">
                  Start by adding a habit, task, event, or reminder.
                </p>
              </div>
            ) : viewMode === 'compact' ? (
              <div className="space-y-4">
                {/* Phase 3.4: Compact Mode - Categorized sections */}

                {/* Reminders Section */}
                {categorizedData && categorizedData.reminders.length > 0 && filterTypes.has("reminder") && (
                  <>
                    {renderSectionHeader("Reminders", "text-yellow-700", "🔔")}
                    <div className="space-y-3">
                      {categorizedData.reminders.map((item) => renderItemCard(item, false))}
                    </div>
                  </>
                )}

                {/* Overdue Section */}
                {categorizedData && categorizedData.overdue.length > 0 && filterTypes.has("task") && (
                  <>
                    {renderSectionHeader("Overdue", "text-red-700", "⚠️")}
                    <div className="space-y-3">
                      {categorizedData.overdue.map((item) => renderItemCard(item, true))}
                    </div>
                  </>
                )}

                {/* In Progress Section */}
                {categorizedData && categorizedData.inProgress.length > 0 && filterTypes.has("task") && (
                  <>
                    {renderSectionHeader("In Progress", "text-blue-700", "🔵")}
                    <div className="space-y-3">
                      {categorizedData.inProgress.map((item) => renderItemCard(item, false))}
                    </div>
                  </>
                )}

                {/* Calendar Events Section */}
                {filteredEvents.length > 0 && (
                  <>
                    {renderSectionHeader("Events", "text-green-700", "📅")}
                    <div className="space-y-3">
                      {filteredEvents.map((event) => (
                        <div
                          key={`event-${event.id}`}
                          onClick={() => setSelectedEvent(event)}
                          className="border-2 rounded-xl p-3 md:p-5 hover:shadow-md transition-all duration-200 cursor-pointer border-gray-100 bg-gradient-to-r from-white to-gray-50 hover:border-green-300"
                          style={{
                            borderLeftWidth: "4px",
                            borderLeftColor: event.calendarColor || "#10b981",
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-sm font-semibold text-gray-900">
                                  {event.title}
                                </h3>
                                {event.isAllDay && (
                                  <span className="text-xs px-2 py-1 rounded-full font-medium bg-blue-100 text-blue-700">
                                    All Day
                                  </span>
                                )}
                              </div>

                              {event.description && (
                                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                  {event.description}
                                </p>
                              )}

                              <div className="flex items-center gap-4 text-sm">
                                {!event.isAllDay && (
                                  <span className="flex items-center gap-2 text-gray-700">
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
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                    <span>
                                      {new Date(event.startTime).toLocaleTimeString(
                                        "en-US",
                                        {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        }
                                      )}{" "}
                                      -{" "}
                                      {new Date(event.endTime).toLocaleTimeString(
                                        "en-US",
                                        {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        }
                                      )}
                                    </span>
                                  </span>
                                )}

                                {event.location && (
                                  <span className="flex items-center gap-2 text-gray-700">
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
                                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                      />
                                    </svg>
                                    <span className="truncate max-w-xs">
                                      {event.location}
                                    </span>
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="ml-2">
                              <span className="text-xs text-gray-500">
                                {event.calendarName}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Scheduled (with time) Section */}
                {categorizedData && categorizedData.scheduled.length > 0 && filterTypes.has("task") && (
                  <>
                    {renderSectionHeader("Scheduled", "text-purple-700", "📋")}
                    <div className="space-y-3">
                      {categorizedData.scheduled.map((item) => renderItemCard(item, false))}
                    </div>
                  </>
                )}

                {/* Scheduled (no time) Section */}
                {categorizedData && categorizedData.scheduledNoTime.length > 0 && filterTypes.has("task") && (
                  <>
                    {renderSectionHeader("Scheduled (No Time)", "text-gray-600")}
                    <div className="space-y-3">
                      {categorizedData.scheduledNoTime.map((item) => renderItemCard(item, false))}
                    </div>
                  </>
                )}

                {/* Pinned / Quick Captures Section */}
                {categorizedData && categorizedData.pinned.length > 0 && filterTypes.has("task") && (
                  <>
                    {renderSectionHeader("Quick Captures", "text-gray-500", "📌")}
                    <div className="space-y-3">
                      {categorizedData.pinned.map((item) => renderItemCard(item, false))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Phase 3.4: Timeline Mode */}

                {/* Reminders Section (above timeline) */}
                {categorizedData && categorizedData.reminders.length > 0 && filterTypes.has("reminder") && (
                  <>
                    {renderSectionHeader("Reminders", "text-yellow-700", "🔔")}
                    <div className="space-y-3">
                      {categorizedData.reminders.map((item) => renderItemCard(item, false))}
                    </div>
                  </>
                )}

                {/* Overdue Section (above timeline) */}
                {categorizedData && categorizedData.overdue.length > 0 && filterTypes.has("task") && (
                  <>
                    {renderSectionHeader("Overdue", "text-red-700", "⚠️")}
                    <div className="space-y-3">
                      {categorizedData.overdue.map((item) => renderItemCard(item, true))}
                    </div>
                  </>
                )}

                {/* In Progress Section (above timeline) */}
                {categorizedData && categorizedData.inProgress.length > 0 && filterTypes.has("task") && (
                  <>
                    {renderSectionHeader("In Progress", "text-blue-700", "🔵")}
                    <div className="space-y-3">
                      {categorizedData.inProgress.map((item) => renderItemCard(item, false))}
                    </div>
                  </>
                )}

                {/* Timeline Section */}
                {(categorizedData && (categorizedData.scheduled.length > 0 || filteredEvents.length > 0)) && (
                  <>
                    {renderSectionHeader("Timeline", "text-purple-700", "📅")}
                    {renderTimelineView()}
                  </>
                )}

                {/* Scheduled (no time) Section (below timeline) */}
                {categorizedData && categorizedData.scheduledNoTime.length > 0 && filterTypes.has("task") && (
                  <>
                    {renderSectionHeader("Scheduled (No Time)", "text-gray-600")}
                    <div className="space-y-3">
                      {categorizedData.scheduledNoTime.map((item) => renderItemCard(item, false))}
                    </div>
                  </>
                )}

                {/* Pinned / Quick Captures Section (below timeline) */}
                {categorizedData && categorizedData.pinned.length > 0 && filterTypes.has("task") && (
                  <>
                    {renderSectionHeader("Quick Captures", "text-gray-500", "📌")}
                    <div className="space-y-3">
                      {categorizedData.pinned.map((item) => renderItemCard(item, false))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Universal Add Button - REMOVED (Replaced by GlobalCreateManager) */}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {modalMode === "create"
                  ? `Create New ${getItemTypeLabel(selectedItemType)}`
                  : `Edit ${getItemTypeLabel(selectedItemType)}`}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder={`e.g., ${
                      selectedItemType === "habit"
                        ? "Morning Exercise"
                        : selectedItemType === "task"
                        ? "Finish report"
                        : "Doctor's appointment"
                    }`}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
                    autoFocus
                    maxLength={100}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formName.length}/100 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Add additional details or notes..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400 resize-none"
                    rows={3}
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formDescription.length}/500 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time (optional)
                  </label>
                  <input
                    type="time"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
                  />
                </div>

                {(selectedItemType === "task" ||
                  selectedItemType === "reminder") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Day (optional)
                    </label>
                    <input
                      type="date"
                      value={formDay}
                      onChange={(e) => setFormDay(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
                    />
                  </div>
                )}

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formRecurring}
                      onChange={(e) => setFormRecurring(e.target.checked)}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Recurring (daily)
                    </span>
                  </label>
                </div>

                {/* Phase 3.4: Pin to Today */}
                {selectedItemType === "task" && (
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formShowOnCalendar}
                        onChange={(e) => setFormShowOnCalendar(e.target.checked)}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Pin to today's calendar
                      </span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1 ml-6">
                      Show this task on today's calendar regardless of due date
                    </p>
                  </div>
                )}

                {/* Metadata Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      value={formPriority}
                      onChange={(e) => setFormPriority(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
                    >
                      <option value="">None</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Complexity
                    </label>
                    <select
                      value={formComplexity}
                      onChange={(e) => setFormComplexity(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
                    >
                      <option value="">None</option>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration
                    </label>
                    <select
                      value={formDuration}
                      onChange={(e) => setFormDuration(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
                    >
                      <option value="">None</option>
                      <option value="15min">15 min</option>
                      <option value="30min">30 min</option>
                      <option value="1hour">1 hour</option>
                      <option value="1-2hours">1-2 hours</option>
                      <option value="2-4hours">2-4 hours</option>
                      <option value="4-8hours">4-8 hours (full day)</option>
                      <option value="1-3days">1-3 days</option>
                      <option value="4-7days">4-7 days</option>
                      <option value="1-2weeks">1-2 weeks</option>
                      <option value="2+weeks">2+ weeks</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Energy Required
                    </label>
                    <select
                      value={formEnergy}
                      onChange={(e) => setFormEnergy(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
                    >
                      <option value="">None</option>
                      <option value="high">High energy</option>
                      <option value="medium">Medium energy</option>
                      <option value="low">Low energy</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      What mental/physical state do you need to be in?
                    </p>
                  </div>

                  {/* Phase 3.2: Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags
                    </label>
                    <TagInput
                      tags={formTags}
                      availableTags={availableTags}
                      onTagsChange={setFormTags}
                      placeholder="Add tags (projects, contexts, areas)..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Organize with tags like "The Deck", "@home", "Health", etc.
                    </p>
                  </div>
                </div>

                {/* Sub-Items Section */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Sub-
                      {selectedItemType === "habit"
                        ? "Habits"
                        : selectedItemType === "task"
                        ? "Tasks"
                        : "Items"}
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setFormSubItems([
                          ...formSubItems,
                          { name: "", dueDate: undefined },
                        ])
                      }
                      className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
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
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Add Sub-
                      {selectedItemType === "habit"
                        ? "Habit"
                        : selectedItemType === "task"
                        ? "Task"
                        : "Item"}
                    </button>
                  </div>

                  {formSubItems.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">
                      No sub-items added yet
                    </p>
                  ) : (
                    <div className="space-y-3 max-h-48 overflow-y-auto">
                      {formSubItems.map((subItem, index) => {
                        // Date validation - only warn if sub-task date is AFTER parent date
                        const parentDueDate = formDay
                          ? new Date(formDay)
                          : null;
                        const subItemDate = subItem.dueDate
                          ? new Date(subItem.dueDate)
                          : null;
                        const isAfterParent =
                          parentDueDate &&
                          subItemDate &&
                          subItemDate > parentDueDate;

                        return (
                          <div key={index} className="flex items-start gap-2">
                            <div className="flex-1">
                              <input
                                type="text"
                                value={subItem.name}
                                onChange={(e) => {
                                  const updated = [...formSubItems];
                                  updated[index] = {
                                    ...updated[index],
                                    name: e.target.value,
                                  };
                                  setFormSubItems(updated);
                                }}
                                placeholder={`Sub-${selectedItemType} name`}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 text-sm"
                              />
                            </div>
                            {(selectedItemType === "task" ||
                              selectedItemType === "reminder") && (
                              <div className="w-36">
                                <input
                                  type="date"
                                  value={subItem.dueDate || ""}
                                  onChange={(e) => {
                                    const updated = [...formSubItems];
                                    updated[index] = {
                                      ...updated[index],
                                      dueDate: e.target.value || undefined,
                                    };
                                    setFormSubItems(updated);
                                  }}
                                  className={`w-full px-2 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-sm ${
                                    isAfterParent
                                      ? "border-red-500 text-red-500"
                                      : "border-gray-300 text-gray-900"
                                  }`}
                                />
                                {isAfterParent && (
                                  <p className="text-xs text-red-500 mt-1">
                                    After parent due date
                                  </p>
                                )}
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                const updated = formSubItems.filter(
                                  (_, i) => i !== index
                                );
                                setFormSubItems(updated);
                              }}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                              title="Remove sub-item"
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
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                {modalMode === "edit" && (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={deletingItem || savingItem}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Delete
                  </button>
                )}
                <button
                  onClick={closeModal}
                  disabled={savingItem || deletingItem}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={modalMode === "create" ? createItem : updateItem}
                  disabled={!formName.trim() || savingItem || deletingItem}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {savingItem && (
                    <svg
                      className="animate-spin h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  )}
                  {savingItem
                    ? modalMode === "create"
                      ? "Creating..."
                      : "Saving..."
                    : modalMode === "create"
                    ? "Create"
                    : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
            <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4">
              <h2 className="text-base font-semibold text-gray-900 mb-3">
                Delete Item?
              </h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this item? This action cannot be
                undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deletingItem}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteItem}
                  disabled={deletingItem}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {deletingItem && (
                    <svg
                      className="animate-spin h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  )}
                  {deletingItem ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notifications */}
        <div className="fixed bottom-8 left-8 space-y-2 z-50">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] animate-in slide-in-from-bottom-5 ${
                toast.type === "success"
                  ? "bg-green-600 text-white"
                  : toast.type === "error"
                  ? "bg-red-600 text-white"
                  : "bg-blue-600 text-white"
              }`}
            >
              {toast.type === "success" && (
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
              {toast.type === "error" && (
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
              <span className="flex-1 font-medium">{toast.message}</span>
            </div>
          ))}
        </div>

        {/* Event Detail Modal */}
        {selectedEvent && (
          <EventDetailModal
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
