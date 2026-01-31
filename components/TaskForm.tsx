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
  } | null;
  availableTags: string[];
}

/**
 * TaskForm - Modal for viewing and editing tasks
 *
 * Features:
 * - Task name and description
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
}: TaskFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [state, setState] = useState("scheduled");
  const [priority, setPriority] = useState("");
  const [complexity, setComplexity] = useState("");
  const [energy, setEnergy] = useState("");
  const [tags, setTags] = useState<string[]>([]);
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
      setState(existingTask.state || "scheduled");
      setPriority(existingTask.priority || "");
      setComplexity(existingTask.complexity || "");
      setEnergy(existingTask.energy || "");
      setTags(existingTask.tags || []);
    } else {
      // Reset form for new task
      setName("");
      setDescription("");
      setState("scheduled");
      setPriority("");
      setComplexity("");
      setEnergy("");
      setTags([]);
    }
  }, [existingTask, isOpen]);

  const handleSave = async () => {
    if (!name.trim()) return;

    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        description: description.trim() || undefined,
        state,
        priority: priority || undefined,
        complexity: complexity || undefined,
        energy: energy || undefined,
        tags,
      });
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
          {existingTask ? "Edit Task" : "New Task"}
        </h2>

        <div className="space-y-4">
          {/* Task name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="What needs to be done?"
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

          {/* State */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
            >
              <option value="unscheduled">Unscheduled</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="on_hold">On Hold</option>
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
