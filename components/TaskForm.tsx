"use client";

import { useState, useEffect, useRef } from "react";
import TagInput from "./TagInput";

interface SubItem {
  id?: number;
  name: string;
  dueDate?: string;
}

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: {
    name: string;
    description?: string;
    state?: string;
    priority?: string;
    complexity?: string;
    energy?: string;
    tags?: string[];
    dueDate?: string;
    dueTime?: string;
    scheduledTime?: string;
    scheduleType?: string;
    scheduleDays?: string;
    showOnCalendar?: boolean;
    isOverdue?: boolean;
    subItems?: SubItem[];
  }) => Promise<void>;
  onDelete?: () => Promise<void>;
  existingTask?: {
    id: number;
    name: string;
    description?: string;
    state?: string;
    priority?: string;
    complexity?: string;
    duration?: string;
    energy?: string;
    tags?: string[];
    dueDate?: string;
    dueTime?: string;
    scheduledTime?: string;
    scheduleType?: string;
    scheduleDays?: string;
    showOnCalendar?: boolean;
    isOverdue?: boolean;
    subItems?: any[];
  } | null;
  availableTags: string[];
  title?: string;
  itemType?: "task" | "habit" | "reminder";
  /** Pre-fill date/time for new items (e.g., click-to-add from timeline) */
  prefill?: { date?: string; time?: string };
}

/**
 * TaskForm - Modal for creating/editing tasks, habits, and reminders
 *
 * Features:
 * - Task name and description
 * - Compact date+time selector (sequential native pickers) for tasks/reminders
 * - Habit frequency (daily, weekdays, weekends, specific days)
 * - Collapsible Advanced section: State, Priority, Complexity, Energy
 * - Sub-items with Enter-to-add (Android-compatible via beforeinput) and calendar icon date picker
 * - Tag support with autocomplete
 * - Delete with confirmation
 * - Back button/gesture support
 */
export default function TaskForm({
  isOpen,
  onClose,
  onSave,
  onDelete,
  existingTask,
  availableTags,
  title,
  itemType = "task",
  prefill,
}: TaskFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [state, setState] = useState("active");
  const [priority, setPriority] = useState("");
  const [complexity, setComplexity] = useState("");
  const [energy, setEnergy] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  // Schedule fields
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [showOnCalendar, setShowOnCalendar] = useState(false);

  // Habit schedule fields
  const [habitScheduleType, setHabitScheduleType] = useState("daily");
  const [habitScheduleDays, setHabitScheduleDays] = useState<string[]>([]);

  // Sub-items
  const [subItems, setSubItems] = useState<SubItem[]>([]);

  // Delete state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Phase 3.10: Overdue persistence
  const [isOverdue, setIsOverdue] = useState(false);

  const [saving, setSaving] = useState(false);

  // Advanced section toggle (collapsed by default for new items)
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Hidden native picker inputs for the compact date/time selector
  const dateInputRef = useRef<HTMLInputElement>(null);
  const timeInputRef = useRef<HTMLInputElement>(null);

  // Refs for sub-item name inputs (Enter-to-add) and sub-item date inputs (showPicker)
  const subItemRefs = useRef<(HTMLInputElement | null)[]>([]);
  const datePickerRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Always-current snapshot of subItems used inside async beforeinput handlers
  const subItemsRef = useRef(subItems);
  useEffect(() => { subItemsRef.current = subItems; }, [subItems]);

  // Handle browser back button/gesture to close modal
  useEffect(() => {
    if (isOpen) {
      window.history.pushState({ modalOpen: true }, '');
      const handlePopState = () => onClose();
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, [isOpen, onClose]);

  // Register native beforeinput listeners for Android virtual keyboard Enter detection.
  // Android keyboards send keyCode 229 for all keys so onKeyDown(e.key==='Enter') is unreliable.
  // The beforeinput event with inputType='insertLineBreak' is the correct cross-platform hook.
  useEffect(() => {
    const cleanups: (() => void)[] = [];

    subItemRefs.current.forEach((el, index) => {
      if (!el) return;

      const handler = (e: Event) => {
        const inputEvent = e as InputEvent;
        if (inputEvent.inputType === 'insertLineBreak') {
          e.preventDefault();
          const current = subItemsRef.current;
          const updated = [...current];
          updated.splice(index + 1, 0, { name: "", dueDate: undefined });
          setSubItems(updated);
          setTimeout(() => subItemRefs.current[index + 1]?.focus(), 50);
        }
      };

      el.addEventListener('beforeinput', handler);
      cleanups.push(() => el.removeEventListener('beforeinput', handler));
    });

    return () => cleanups.forEach(fn => fn());
  }, [subItems.length]);

  // Populate form when editing existing task
  useEffect(() => {
    if (existingTask) {
      setName(existingTask.name);
      setDescription(existingTask.description || "");
      setState(existingTask.state || "active");
      setPriority(existingTask.priority || "");
      setComplexity(existingTask.complexity || "");
      setEnergy(existingTask.energy || "");
      setTags(existingTask.tags || []);

      if (existingTask.dueDate) {
        const d = typeof existingTask.dueDate === 'string' ? existingTask.dueDate.split('T')[0] : '';
        setDate(d);
      } else {
        setDate("");
      }

      const t = existingTask.dueTime || existingTask.scheduledTime || "";
      setTime(t ? t.substring(0, 5) : "");

      setIsRecurring(existingTask.scheduleType === "daily");

      if (existingTask.scheduleType) {
        setHabitScheduleType(existingTask.scheduleType);
      }
      if (existingTask.scheduleDays) {
        setHabitScheduleDays(existingTask.scheduleDays.split(",").filter(Boolean));
      } else {
        setHabitScheduleDays([]);
      }

      setShowOnCalendar(existingTask.showOnCalendar || false);
      setIsOverdue(existingTask.isOverdue || false);

      if (existingTask.subItems && existingTask.subItems.length > 0) {
        setSubItems(existingTask.subItems.map((si: any) => ({
          id: si.id,
          name: si.name || "",
          dueDate: si.dueDate ? (typeof si.dueDate === 'string' ? si.dueDate.split('T')[0] : '') : undefined,
        })));
      } else {
        setSubItems([]);
      }

      // Auto-expand advanced if any non-default metadata is set
      const hasAdvancedValues = !!(
        existingTask.priority ||
        existingTask.complexity ||
        existingTask.energy ||
        (existingTask.state && existingTask.state !== "active")
      );
      setShowAdvanced(hasAdvancedValues);
    } else {
      setName("");
      setDescription("");
      setState("active");
      setPriority("");
      setComplexity("");
      setEnergy("");
      setTags([]);
      setDate(prefill?.date || "");
      setTime(prefill?.time || "");
      setIsRecurring(false);
      setShowOnCalendar(false);
      setIsOverdue(false);
      setHabitScheduleType("daily");
      setHabitScheduleDays([]);
      setSubItems([]);
      setShowDeleteConfirm(false);
      setShowAdvanced(false);
    }
  }, [existingTask, isOpen, itemType]);

  const handleSave = async () => {
    if (!name.trim()) return;

    setSaving(true);
    try {
      let finalState = state;
      if (itemType === "task" || itemType === "reminder") {
        if (date && state === "backlog") {
          finalState = "active";
        }
      }

      const payload: any = {
        name: name.trim(),
        description: description.trim() || undefined,
        state: finalState,
        priority: priority || undefined,
        complexity: complexity || undefined,
        energy: energy || undefined,
        tags,
        showOnCalendar,
        isOverdue,
      };

      if (itemType === "habit") {
        if (time) payload.scheduledTime = time;
        payload.scheduleType = habitScheduleType;
        if (habitScheduleType === "specific_days" && habitScheduleDays.length > 0) {
          payload.scheduleDays = habitScheduleDays.join(",");
        }
      } else {
        if (date) payload.dueDate = date;
        if (time) payload.dueTime = time;
        if (isRecurring) payload.scheduleType = "daily";
      }

      if (subItems.length > 0) {
        payload.subItems = subItems.filter((si) => si.name.trim());
      }

      await onSave(payload);
      onClose();
    } catch (error) {
      console.error("Error saving task:", error);
    } finally {
      setSaving(false);
    }
  };

  /** Get the label for sub-items based on item type */
  const getSubItemLabel = () => {
    switch (itemType) {
      case "habit": return "Sub-Habit";
      case "reminder": return "Sub-Item";
      default: return "Sub-Task";
    }
  };

  /** Format date string for compact display: "2026-02-21" → "Feb 21" */
  const formatDisplayDate = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length < 3) return dateStr;
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[parseInt(parts[1]) - 1]} ${parseInt(parts[2])}`;
  };

  /** Format time string for compact display: "14:30" → "2:30 PM" */
  const formatDisplayTime = (timeStr: string) => {
    const parts = timeStr.split(':');
    if (parts.length < 2) return timeStr;
    const hours = parseInt(parts[0]);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h = hours % 12 || 12;
    return `${h}:${parts[1]} ${ampm}`;
  };

  /** Open native date picker */
  const openDatePicker = () => {
    try { (dateInputRef.current as any)?.showPicker(); }
    catch { dateInputRef.current?.focus(); }
  };

  /** Open native time picker */
  const openTimePicker = () => {
    try { (timeInputRef.current as any)?.showPicker(); }
    catch { timeInputRef.current?.focus(); }
  };

  /** Open native date picker for a specific sub-item */
  const openSubItemDatePicker = (index: number) => {
    const el = datePickerRefs.current[index];
    try { (el as any)?.showPicker(); }
    catch { el?.focus(); }
  };

  /** Add a sub-item after the given index (or at end) and focus it */
  const addSubItem = (afterIndex?: number) => {
    const newItem: SubItem = { name: "", dueDate: undefined };
    if (afterIndex !== undefined) {
      const current = subItemsRef.current;
      const updated = [...current];
      updated.splice(afterIndex + 1, 0, newItem);
      setSubItems(updated);
      setTimeout(() => subItemRefs.current[afterIndex + 1]?.focus(), 50);
    } else {
      const current = subItemsRef.current;
      setSubItems([...current, newItem]);
      setTimeout(() => subItemRefs.current[current.length]?.focus(), 50);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-5 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {title || (existingTask ? `Edit ${itemType === 'habit' ? 'Habit' : itemType === 'reminder' ? 'Reminder' : 'Task'}` : `New ${itemType === 'habit' ? 'Habit' : itemType === 'reminder' ? 'Reminder' : 'Task'}`)}
        </h2>

        <div className="space-y-3">
          {/* Task name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={itemType === 'habit' ? "e.g., Morning Jog" : "What needs to be done?"}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description <span className="text-gray-500">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional details..."
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 resize-none"
            />
          </div>

          {/* Schedule section — compact icon buttons for date/time, same style for all item types */}
          <div className="space-y-2">
            {/* Date + Time row (tasks/reminders only) or Time-only row (habits) */}
            <div className="flex items-center gap-2">
              {/* Date button (tasks/reminders only) */}
              {itemType !== 'habit' && (
                <div className="relative flex-1">
                  <button
                    type="button"
                    onClick={openDatePicker}
                    className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm w-full bg-white hover:bg-gray-50 text-left"
                  >
                    <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {date ? (
                      <span className="text-gray-900">{formatDisplayDate(date)}</span>
                    ) : (
                      <span className="text-gray-400">Date</span>
                    )}
                  </button>
                  {/* Hidden date input — showPicker() is called directly from the button click (user gesture) */}
                  <input
                    ref={dateInputRef}
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="absolute top-0 left-0 opacity-0 pointer-events-none w-px h-px"
                  />
                </div>
              )}

              {/* Time button (all item types) */}
              <div className="relative flex-1">
                <button
                  type="button"
                  onClick={openTimePicker}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm w-full bg-white hover:bg-gray-50 text-left"
                >
                  <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {time ? (
                    <span className="text-gray-900">{formatDisplayTime(time)}</span>
                  ) : (
                    <span className="text-gray-400">Time</span>
                  )}
                </button>
                {/* Hidden time input */}
                <input
                  ref={timeInputRef}
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="absolute top-0 left-0 opacity-0 pointer-events-none w-px h-px"
                />
              </div>

              {/* Clear button — only shown when date or time is set */}
              {(date || time) && (
                <button
                  type="button"
                  onClick={() => { setDate(''); setTime(''); }}
                  className="p-2 text-gray-400 hover:text-gray-600"
                  title="Clear date & time"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Habit: frequency selector */}
            {itemType === 'habit' && (
              <div className="space-y-2">
                <select
                  value={habitScheduleType}
                  onChange={(e) => setHabitScheduleType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 text-sm"
                >
                  <option value="daily">Every day</option>
                  <option value="weekdays">Weekdays (Mon–Fri)</option>
                  <option value="weekends">Weekends (Sat–Sun)</option>
                  <option value="specific_days">Specific days</option>
                </select>
                {habitScheduleType === "specific_days" && (
                  <div className="flex flex-wrap gap-2">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          setHabitScheduleDays((prev) =>
                            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
                          );
                        }}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          habitScheduleDays.includes(day)
                            ? "bg-purple-600 text-white"
                            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Task/reminder: recurring + pin on same line */}
            {itemType !== 'habit' && (
              <div className="flex gap-5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">Recurring</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showOnCalendar}
                    onChange={(e) => setShowOnCalendar(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">Pin to Today</span>
                </label>
              </div>
            )}

            {/* Phase 3.10: Overdue warning */}
            {itemType !== 'habit' && existingTask && isOverdue && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-red-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <span className="text-sm font-medium text-red-900">Overdue</span>
                      <p className="text-xs text-red-700 mt-0.5">This task is marked as overdue. It will stay in the overdue section even after rescheduling.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsOverdue(false)}
                    className="px-3 py-1 bg-white text-red-700 border border-red-300 rounded hover:bg-red-50 transition-colors text-xs font-medium shrink-0"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Advanced collapsible: State, Priority, Complexity, Energy */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg
                className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              Advanced
            </button>

            {showAdvanced && (
              <div className="mt-3 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
                  >
                    <option value="backlog">Backlog</option>
                    <option value="active">Active</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm"
                    >
                      <option value="">None</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Complexity</label>
                    <select
                      value={complexity}
                      onChange={(e) => setComplexity(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm"
                    >
                      <option value="">None</option>
                      <option value="1">1 - Easy</option>
                      <option value="2">2</option>
                      <option value="3">3 - Medium</option>
                      <option value="4">4</option>
                      <option value="5">5 - Hard</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Energy</label>
                    <select
                      value={energy}
                      onChange={(e) => setEnergy(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm"
                    >
                      <option value="">None</option>
                      <option value="1">1 - Low</option>
                      <option value="2">2</option>
                      <option value="3">3 - Medium</option>
                      <option value="4">4</option>
                      <option value="5">5 - High</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sub-Items */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                {getSubItemLabel()}s
              </label>
              <button
                type="button"
                onClick={() => addSubItem()}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add {getSubItemLabel()}
              </button>
            </div>

            {subItems.length > 0 && (
              <div className="space-y-1">
                {subItems.map((subItem, index) => (
                  <div key={subItem.id || `new-${index}`} className="flex items-center gap-1.5">
                    <input
                      ref={(el) => { subItemRefs.current[index] = el; }}
                      type="text"
                      value={subItem.name}
                      onChange={(e) => {
                        const updated = [...subItems];
                        updated[index] = { ...updated[index], name: e.target.value };
                        setSubItems(updated);
                      }}
                      onKeyDown={(e) => {
                        // Desktop Enter key (Android handled via beforeinput effect above)
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSubItem(index);
                        }
                      }}
                      placeholder={`${getSubItemLabel()} name...`}
                      className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 text-sm"
                    />

                    {/* Calendar icon opens native date picker directly via showPicker() */}
                    {itemType !== 'habit' && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openSubItemDatePicker(index)}
                          className="p-1.5 text-gray-400 hover:text-purple-600 transition-colors rounded"
                          title={subItem.dueDate ? `Due: ${subItem.dueDate}` : "Set due date"}
                        >
                          {subItem.dueDate ? (
                            <span className="text-xs text-purple-600 font-medium whitespace-nowrap">
                              {subItem.dueDate.slice(5).replace('-', '/')}
                            </span>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          )}
                        </button>

                        {/* Clear date button — only shown when date is set */}
                        {subItem.dueDate && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...subItems];
                              updated[index] = { ...updated[index], dueDate: undefined };
                              setSubItems(updated);
                            }}
                            className="p-0.5 text-gray-300 hover:text-red-400 transition-colors"
                            title="Clear date"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}

                        {/* Hidden date input — showPicker() triggers the native date picker directly */}
                        <input
                          ref={(el) => { datePickerRefs.current[index] = el; }}
                          type="date"
                          value={subItem.dueDate || ""}
                          onChange={(e) => {
                            const updated = [...subItems];
                            updated[index] = { ...updated[index], dueDate: e.target.value || undefined };
                            setSubItems(updated);
                          }}
                          className="absolute opacity-0 pointer-events-none w-px h-px"
                        />
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => setSubItems(subItems.filter((_, i) => i !== index))}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Tags
            </label>
            <TagInput
              tags={tags}
              availableTags={availableTags}
              onTagsChange={setTags}
              placeholder="Add tags..."
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-5">
          {existingTask && onDelete && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={saving || deleting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Delete
            </button>
          )}
          <button
            onClick={onClose}
            disabled={saving || deleting}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || saving || deleting}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : existingTask ? "Update" : "Create"}
          </button>
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Delete Item?</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this item? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    setDeleting(true);
                    try {
                      await onDelete!();
                      setShowDeleteConfirm(false);
                    } catch (error) {
                      console.error("Error deleting:", error);
                    } finally {
                      setDeleting(false);
                    }
                  }}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
