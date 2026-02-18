"use client";

import { useState, useEffect } from "react";
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
}

/**
 * TaskForm - Modal for creating/editing tasks, habits, and reminders
 *
 * Features:
 * - Task name and description
 * - Date and Time scheduling
 * - Habit frequency (daily, weekdays, weekends, specific days)
 * - State, priority, complexity, energy fields
 * - Sub-items (sub-tasks/sub-habits)
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
}: TaskFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [state, setState] = useState("backlog");
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

  // Handle browser back button/gesture to close modal
  useEffect(() => {
    if (isOpen) {
      // Push a new history state when modal opens
      window.history.pushState({ modalOpen: true }, '');

      // Listen for back button/gesture
      const handlePopState = () => {
        onClose();
      };

      window.addEventListener('popstate', handlePopState);

      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [isOpen, onClose]);

  // Populate form when editing existing task
  useEffect(() => {
    if (existingTask) {
      setName(existingTask.name);
      setDescription(existingTask.description || "");
      setState(existingTask.state || (itemType === "habit" ? "active" : "backlog"));
      setPriority(existingTask.priority || "");
      setComplexity(existingTask.complexity || "");
      setEnergy(existingTask.energy || "");
      setTags(existingTask.tags || []);

      // Populate schedule fields
      if (existingTask.dueDate) {
        const d = typeof existingTask.dueDate === 'string' ? existingTask.dueDate.split('T')[0] : '';
        setDate(d);
      } else {
        setDate("");
      }

      // Handle time
      const t = existingTask.dueTime || existingTask.scheduledTime || "";
      setTime(t ? t.substring(0, 5) : "");

      // Handle recurrence
      setIsRecurring(existingTask.scheduleType === "daily");

      // Handle habit schedule
      if (existingTask.scheduleType) {
        setHabitScheduleType(existingTask.scheduleType);
      }
      if (existingTask.scheduleDays) {
        setHabitScheduleDays(existingTask.scheduleDays.split(",").filter(Boolean));
      } else {
        setHabitScheduleDays([]);
      }

      // Handle Pin to Today
      setShowOnCalendar(existingTask.showOnCalendar || false);

      // Phase 3.10: Handle overdue flag
      setIsOverdue(existingTask.isOverdue || false);

      // Sub-items
      if (existingTask.subItems && existingTask.subItems.length > 0) {
        setSubItems(existingTask.subItems.map((si: any) => ({
          id: si.id,
          name: si.name || "",
          dueDate: si.dueDate ? (typeof si.dueDate === 'string' ? si.dueDate.split('T')[0] : '') : undefined,
        })));
      } else {
        setSubItems([]);
      }
    } else {
      // Reset form for new task
      setName("");
      setDescription("");
      setState(itemType === "habit" ? "active" : "backlog");
      setPriority("");
      setComplexity("");
      setEnergy("");
      setTags([]);
      setDate("");
      setTime("");
      setIsRecurring(false);
      setShowOnCalendar(false);
      setIsOverdue(false);
      setHabitScheduleType("daily");
      setHabitScheduleDays([]);
      setSubItems([]);
      setShowDeleteConfirm(false);
    }
  }, [existingTask, isOpen, itemType]);

  const handleSave = async () => {
    if (!name.trim()) return;

    setSaving(true);
    try {
      // ADR-012: Auto-adjust state based on date presence
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

      // Add scheduling data based on itemType
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

      // Include sub-items if any
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {title || (existingTask ? `Edit ${itemType === 'habit' ? 'Habit' : itemType === 'reminder' ? 'Reminder' : 'Task'}` : `New ${itemType === 'habit' ? 'Habit' : itemType === 'reminder' ? 'Reminder' : 'Task'}`)}
        </h2>

        <div className="space-y-4">
          {/* Task name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-gray-500">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional details..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 resize-none"
            />
          </div>

          {/* Schedule Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
             {itemType !== 'habit' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white text-gray-900"
                  />
                </div>
             )}

             <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white text-gray-900"
                />
             </div>

             {/* Habit recurrence options */}
             {itemType === 'habit' && (
               <div className="sm:col-span-2 space-y-3">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                   <select
                     value={habitScheduleType}
                     onChange={(e) => setHabitScheduleType(e.target.value)}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white text-gray-900"
                   >
                     <option value="daily">Every day</option>
                     <option value="weekdays">Weekdays (Mon-Fri)</option>
                     <option value="weekends">Weekends (Sat-Sun)</option>
                     <option value="specific_days">Specific days</option>
                   </select>
                 </div>

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

             {/* Task/reminder options */}
             {itemType !== 'habit' && (
               <div className="sm:col-span-2 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isRecurring}
                      onChange={(e) => setIsRecurring(e.target.checked)}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Recurring (daily)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showOnCalendar}
                      onChange={(e) => setShowOnCalendar(e.target.checked)}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-700">Pin to Today</span>
                      <span className="text-xs text-gray-500">Show on calendar regardless of due date</span>
                    </div>
                  </label>

                  {/* Phase 3.10: Overdue status and clear button */}
                  {existingTask && isOverdue && (
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
             )}
          </div>

          {/* State */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
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

          {/* Priority, Complexity, Energy row */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Complexity</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Energy</label>
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

          {/* Sub-Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                {getSubItemLabel()}s
              </label>
              <button
                type="button"
                onClick={() => setSubItems([...subItems, { name: "", dueDate: undefined }])}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add {getSubItemLabel()}
              </button>
            </div>

            {subItems.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No {getSubItemLabel().toLowerCase()}s added yet</p>
            ) : (
              <div className="space-y-2">
                {subItems.map((subItem, index) => (
                  <div key={subItem.id || `new-${index}`} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={subItem.name}
                      onChange={(e) => {
                        const updated = [...subItems];
                        updated[index] = { ...updated[index], name: e.target.value };
                        setSubItems(updated);
                      }}
                      placeholder={`${getSubItemLabel()} name...`}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 text-sm"
                    />
                    {itemType !== 'habit' && (
                      <input
                        type="date"
                        value={subItem.dueDate || ""}
                        onChange={(e) => {
                          const updated = [...subItems];
                          updated[index] = { ...updated[index], dueDate: e.target.value || undefined };
                          setSubItems(updated);
                        }}
                        className="w-36 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 text-sm"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => setSubItems(subItems.filter((_, i) => i !== index))}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
        <div className="flex gap-3 mt-6">
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
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
