"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import TagInput from "@/components/TagInput";
import { VAULT_COLORS } from "@/lib/constants";

/** Warm off-white background */
const DEFAULT_BG = "#FAFAF8";

interface Note {
  id: number;
  title?: string | null;
  content: string;
  tags?: string[] | null;
  pinned: boolean;
  color?: string | null;
}

/**
 * NoteEditorPage - Full-page note editor
 *
 * [id]="new" for creation, numeric for editing.
 * Back arrow = cancel (no save). Explicit Save button at bottom.
 * Color swatches, tags, and pin toggle are inline in the editor body.
 */
export default function NoteEditorPage() {
  const params = useParams();
  const router = useRouter();
  const idParam = params.id as string;
  const isNew = idParam === "new";
  const noteId = isNew ? null : parseInt(idParam);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [pinned, setPinned] = useState(false);
  const [color, setColor] = useState<string | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /** Load existing note data */
  useEffect(() => {
    if (isNew) return;

    const loadNote = async () => {
      try {
        const res = await fetch(`/api/notes/${noteId}`);
        if (!res.ok) { router.push("/vault"); return; }
        const note: Note = await res.json();
        setTitle(note.title || "");
        setContent(note.content);
        setTags((note.tags as string[]) || []);
        setPinned(note.pinned);
        setColor(note.color || null);
      } catch {
        router.push("/vault");
      } finally {
        setLoading(false);
      }
    };
    loadNote();
  }, [noteId, isNew, router]);

  /** Load all tags for autocomplete */
  useEffect(() => {
    const loadTags = async () => {
      try {
        const [notesRes, listsRes] = await Promise.all([fetch("/api/notes"), fetch("/api/lists")]);
        const notes = notesRes.ok ? await notesRes.json() : [];
        const lists = listsRes.ok ? await listsRes.json() : [];
        const allTags = new Set<string>();
        notes.forEach((n: any) => ((n.tags as string[]) || []).forEach((t: string) => allTags.add(t)));
        lists.forEach((l: any) => ((l.tags as string[]) || []).forEach((t: string) => allTags.add(t)));
        setAvailableTags(Array.from(allTags));
      } catch { /* non-critical */ }
    };
    loadTags();
  }, []);

  /** Auto-resize textarea */
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
    }
  }, [content]);

  /** Save note (create or update) */
  const handleSave = async () => {
    if (!content.trim()) return;
    setSaving(true);
    try {
      const body = { title: title.trim() || null, content: content.trim(), tags, pinned, color };
      if (isNew) {
        const res = await fetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("Failed to create note");
      } else {
        const res = await fetch(`/api/notes/${noteId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("Failed to update note");
      }
      router.back();
    } catch (error) {
      console.error("Error saving note:", error);
      setSaving(false);
    }
  };

  /** Delete note */
  const handleDelete = async () => {
    if (!noteId) return;
    try {
      const res = await fetch(`/api/notes/${noteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete note");
      router.back();
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: DEFAULT_BG }}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: DEFAULT_BG }}>
        {/* Top bar — back arrow (cancel) */}
        <div className="flex items-center px-4 py-3 sticky top-0 z-30" style={{ backgroundColor: DEFAULT_BG }}>
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-full hover:bg-black/5 transition-colors"
            title="Cancel"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Editor body */}
        <div className="flex-1 px-4 pb-8 max-w-2xl mx-auto w-full">
          {/* Title input */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full text-2xl font-semibold text-gray-900 placeholder-gray-400 bg-transparent border-none outline-none mb-4"
          />

          {/* Content textarea — auto-expanding */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Note"
            className="w-full text-base text-gray-800 placeholder-gray-400 bg-transparent border-none outline-none resize-none min-h-[200px] leading-relaxed"
            autoFocus={isNew}
          />

          {/* Divider */}
          <div className="border-t border-gray-200 my-6" />

          {/* Color picker */}
          <div className="mb-5">
            <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Color</div>
            <div className="flex items-center gap-2">
              {/* No color option */}
              <button
                onClick={() => setColor(null)}
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                  !color ? "border-gray-900" : "border-gray-300"
                } bg-white`}
                title="No color"
              >
                {!color && (
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              {VAULT_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                    color === c ? "border-gray-900" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                >
                  {color === c && (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="mb-5">
            <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Tags</div>
            <TagInput
              tags={tags}
              availableTags={availableTags}
              onTagsChange={setTags}
              placeholder="Add tags..."
            />
          </div>

          {/* Pin toggle */}
          <div className="mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">Pin to top</span>
            </label>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            {!isNew && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={saving}
                className="px-4 py-2.5 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium text-sm"
              >
                Delete
              </button>
            )}
            <div className="flex-1" />
            <button
              onClick={handleSave}
              disabled={!content.trim() || saving}
              className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm disabled:opacity-50"
            >
              {saving ? "Saving..." : isNew ? "Create" : "Update"}
            </button>
          </div>
        </div>

        {/* Delete confirmation overlay */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete note?</h3>
              <p className="text-gray-600 mb-4 text-sm">This cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
