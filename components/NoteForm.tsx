"use client";

import { useState, useEffect } from "react";
import TagInput from "./TagInput";

interface NoteFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (noteData: {
    title: string;
    content: string;
    tags: string[];
    pinned: boolean;
  }) => Promise<void>;
  onDelete?: (noteId: number) => Promise<void>;
  existingNote?: {
    id: number;
    title?: string | null;
    content: string;
    tags?: string[] | null;
    pinned: boolean;
  } | null;
  availableTags: string[];
}

/**
 * NoteForm - Modal for creating or editing notes
 *
 * Features:
 * - Optional title field
 * - Freeform textarea for content
 * - Tag support with autocomplete
 * - Pin toggle
 * - Validation (content required)
 */
export default function NoteForm({
  isOpen,
  onClose,
  onSave,
  onDelete,
  existingNote,
  availableTags,
}: NoteFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [pinned, setPinned] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  // Populate form when editing existing note
  useEffect(() => {
    if (existingNote) {
      setTitle(existingNote.title || "");
      setContent(existingNote.content);
      setTags((existingNote.tags as string[]) || []);
      setPinned(existingNote.pinned);
    } else {
      // Reset form for new note
      setTitle("");
      setContent("");
      setTags([]);
      setPinned(false);
    }
    setShowDeleteConfirm(false);
    setDeleting(false);
  }, [existingNote, isOpen]);

  /** Delete note with confirmation */
  const handleDelete = async () => {
    if (!existingNote || !onDelete) return;
    setDeleting(true);
    try {
      await onDelete(existingNote.id);
      onClose();
    } catch (error) {
      console.error("Error deleting note:", error);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleSave = async () => {
    if (!content.trim()) return;

    setSaving(true);
    try {
      await onSave({
        title: title.trim() || "",
        content: content.trim(),
        tags,
        pinned,
      });
      onClose();
    } catch (error) {
      console.error("Error saving note:", error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {existingNote ? "Edit Note" : "New Note"}
        </h2>

        <div className="space-y-4">
          {/* Title field (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-gray-500">(optional)</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled note"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
            />
          </div>

          {/* Content field (required) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content <span className="text-red-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note here..."
              rows={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 resize-none"
              autoFocus
            />
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

          {/* Pin toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="pin-toggle"
              checked={pinned}
              onChange={(e) => setPinned(e.target.checked)}
              className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
            />
            <label htmlFor="pin-toggle" className="text-sm text-gray-700 cursor-pointer">
              Pin to top
            </label>
          </div>
        </div>

        {/* Delete confirmation */}
        {existingNote && onDelete && showDeleteConfirm && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 mb-3">Delete this note? This cannot be undone.</p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          {/* Delete button - only shown when editing an existing note */}
          {existingNote && onDelete && !showDeleteConfirm && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={saving}
              className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
            >
              Delete
            </button>
          )}
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!content.trim() || saving}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : existingNote ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
