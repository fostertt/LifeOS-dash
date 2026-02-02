"use client";

import { useState, useEffect } from "react";
import TagInput from "./TagInput";

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
    showOnCalendar?: boolean;
  }) => Promise<void>;
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
    showOnCalendar?: boolean;
  } | null;
  availableTags: string[];
  title?: string;
  itemType?: "task" | "habit" | "reminder";
}

/**
 * TaskForm - Modal for viewing and editing tasks
 *
 * Features:
 * - Task name and description
 * - Date and Time scheduling
 * - State, priority, complexity, energy fields
 * - Tag support with autocomplete
 * - Back button/gesture support
 */
export default function TaskForm({
  isOpen,
  onClose,
  onSave,
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
      setState(existingTask.state || "backlog");
      setPriority(existingTask.priority || "");
      setComplexity(existingTask.complexity || "");
      setEnergy(existingTask.energy || "");
      setTags(existingTask.tags || []);
      
      // Populate schedule fields
      // Handle both date string (YYYY-MM-DD) and ISO date objects
      if (existingTask.dueDate) {
        const d = typeof existingTask.dueDate === 'string' ? existingTask.dueDate.split('T')[0] : '';
        setDate(d);
      } else {
        setDate("");
      }

      // Handle time
      const t = existingTask.dueTime || existingTask.scheduledTime || "";
      setTime(t ? t.substring(0, 5) : ""); // Ensure HH:MM format

      // Handle recurrence
      setIsRecurring(existingTask.scheduleType === "daily");
      
      // Handle Pin to Today
      setShowOnCalendar(existingTask.showOnCalendar || false);
    } else {
      // Reset form for new task
      setName("");
      setDescription("");
      setState("backlog");
      setPriority("");
      setComplexity("");
      setEnergy("");
      setTags([]);
      setDate("");
      setTime("");
      setIsRecurring(false);
      setShowOnCalendar(false);
    }
  }, [existingTask, isOpen]);

  const handleSave = async () => {
    if (!name.trim()) return;

    setSaving(true);
    try {
      // ADR-012: Auto-adjust state based on date presence
      let finalState = state;
      if (itemType === "task" || itemType === "reminder") {
        if (date && state === "backlog") {
          // Adding date to backlog task → auto-promote to active
          finalState = "active";
        } else if (!date && state === "active" && !existingTask?.dueDate) {
          // Creating new task without date in active state → suggest backlog
          // (but don't force it - user may want active without date)
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
      };

      // Add scheduling data based on itemType
      if (itemType === "habit") {
        if (time) payload.scheduledTime = time;
        // Habits are daily by default if created here, or use checkbox
        payload.scheduleType = "daily";
      } else {
        // Task or Reminder
        // Ensure date is sent as YYYY-MM-DD string to avoid timezone issues
        if (date) payload.dueDate = date;
        if (time) payload.dueTime = time;
        if (isRecurring) payload.scheduleType = "daily";
      }

      await onSave(payload);
      onClose();
    } catch (error) {
      console.error("Error saving task:", error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {title || (existingTask ? `Edit ${itemType === 'habit' ? 'Habit' : 'Task'}` : `New ${itemType === 'habit' ? 'Habit' : 'Task'}`)}
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
               </div>
             )}
          </div>

          {/* State (Tasks only) */}
          {itemType === 'task' && (
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
          )}

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
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || saving}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : existingTask ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
