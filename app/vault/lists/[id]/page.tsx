"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import TagInput from "@/components/TagInput";
import { VAULT_COLORS } from "@/lib/constants";

/** Warm off-white background — same as note editor */
const DEFAULT_BG = "#FAFAF8";

interface Task {
  id: number;
  name: string;
  isCompleted?: boolean;
  dueDate?: string;
  priority?: string;
}

interface ListItem {
  id: number;
  text: string;
  isChecked: boolean;
  taskId?: number;
  task?: Task;
}

interface List {
  id: number;
  name: string;
  listType: "simple" | "smart";
  filterCriteria?: string;
  color?: string | null;
  description?: string;
  tags?: string[] | null;
  pinned: boolean;
  items: ListItem[];
  filteredTasks?: Task[];
}

/**
 * ListEditorPage - Full-page list editor
 *
 * [id]="new" for creation, numeric for editing.
 * Back arrow = cancel (no save). Explicit Save button at bottom.
 * For new lists: auto-creates on first item add so users can start adding items immediately.
 * Item operations (add, toggle, delete) save immediately.
 * UX-010: Bottom panel (color/tags/pin/buttons) is fixed to viewport bottom;
 *          content scrolls above it. Accounts for BottomTabBar on mobile.
 */
export default function ListEditorPage() {
  const params = useParams();
  const router = useRouter();
  const idParam = params.id as string;
  const isNewParam = idParam === "new";

  // createdId tracks server-side list ID after eager creation from item add
  const [createdId, setCreatedId] = useState<number | null>(null);
  const listId = isNewParam ? createdId : parseInt(idParam);
  const isNew = isNewParam && createdId === null;

  const [name, setName] = useState("");
  const [color, setColor] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [pinned, setPinned] = useState(false);
  const [listType, setListType] = useState<"simple" | "smart">("simple");
  const [items, setItems] = useState<ListItem[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [filterCriteria, setFilterCriteria] = useState<string | null>(null);
  const [newItemText, setNewItemText] = useState("");
  const [loading, setLoading] = useState(!isNewParam);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  const newItemRef = useRef<HTMLInputElement>(null);

  /** Load existing list data */
  useEffect(() => {
    if (isNewParam) return;

    const loadList = async () => {
      try {
        const id = parseInt(idParam);
        const res = await fetch(`/api/lists/${id}`);
        if (!res.ok) { router.push("/vault"); return; }
        const list: List = await res.json();
        setName(list.name);
        setColor(list.color || null);
        setTags((list.tags as string[]) || []);
        setPinned(list.pinned);
        setListType(list.listType);
        setItems(list.items || []);
        setFilteredTasks(list.filteredTasks || []);
        setFilterCriteria(list.filterCriteria || null);
      } catch {
        router.push("/vault");
      } finally {
        setLoading(false);
      }
    };
    loadList();
  }, [idParam, isNewParam, router]);

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

  /** Eagerly create the list and return the new ID */
  const ensureListCreated = async (): Promise<number | null> => {
    if (listId) return listId;
    const listName = name.trim() || "Untitled";
    try {
      const res = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: listName,
          listType: "simple",
          color,
          tags: tags.length > 0 ? tags : null,
          pinned,
        }),
      });
      if (!res.ok) throw new Error("Failed to create list");
      const created = await res.json();
      setCreatedId(created.id);
      if (!name.trim()) setName(listName);
      return created.id;
    } catch (error) {
      console.error("Error creating list:", error);
      return null;
    }
  };

  /** Save metadata — creates new list or updates existing */
  const handleSave = async () => {
    if (!name.trim() && items.length === 0) return;
    setSaving(true);
    try {
      if (isNew) {
        // Create list (no items added yet, just metadata)
        const res = await fetch("/api/lists", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim() || "Untitled",
            listType: "simple",
            color,
            tags: tags.length > 0 ? tags : null,
            pinned,
          }),
        });
        if (!res.ok) throw new Error("Failed to create list");
      } else if (listId) {
        // Update existing list metadata
        const res = await fetch(`/api/lists/${listId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            color,
            tags: tags.length > 0 ? tags : null,
            pinned,
          }),
        });
        if (!res.ok) throw new Error("Failed to update list");
      }
      router.back();
    } catch (error) {
      console.error("Error saving list:", error);
      setSaving(false);
    }
  };

  /** Reload list items from server */
  const reloadList = async (id?: number) => {
    const targetId = id || listId;
    if (!targetId) return;
    try {
      const res = await fetch(`/api/lists/${targetId}`);
      if (!res.ok) return;
      const list: List = await res.json();
      setItems(list.items || []);
      setFilteredTasks(list.filteredTasks || []);
    } catch { /* silent */ }
  };

  /** Add item — eagerly creates list if needed */
  const addItem = async () => {
    if (!newItemText.trim()) return;
    const targetId = await ensureListCreated();
    if (!targetId) return;
    try {
      const res = await fetch(`/api/lists/${targetId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newItemText.trim() }),
      });
      if (!res.ok) throw new Error("Failed to add item");
      setNewItemText("");
      await reloadList(targetId);
      newItemRef.current?.focus();
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  /** Toggle item checked state */
  const toggleItem = async (itemId: number, currentChecked: boolean) => {
    if (!listId) return;
    try {
      const res = await fetch(`/api/lists/${listId}/items`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, isChecked: !currentChecked }),
      });
      if (!res.ok) throw new Error("Failed to toggle item");
      await reloadList();
    } catch (error) {
      console.error("Error toggling item:", error);
    }
  };

  /** Delete item */
  const deleteItem = async (itemId: number) => {
    if (!listId) return;
    try {
      const res = await fetch(`/api/lists/${listId}/items?itemId=${itemId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete item");
      await reloadList();
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  /** Toggle smart list task */
  const toggleSmartTask = async (taskId: number) => {
    try {
      const today = new Date();
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      const res = await fetch(`/api/items/${taskId}/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: dateStr }),
      });
      if (!res.ok) throw new Error("Failed to toggle task");
      await reloadList();
    } catch (error) {
      console.error("Error toggling task:", error);
    }
  };

  /** Delete the entire list */
  const handleDelete = async () => {
    if (!listId) return;
    try {
      const res = await fetch(`/api/lists/${listId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete list");
      router.back();
    } catch (error) {
      console.error("Error deleting list:", error);
    }
  };

  /** Parse smart list filter criteria for display */
  const getFilterDescription = () => {
    if (!filterCriteria) return "";
    try {
      const criteria = JSON.parse(filterCriteria);
      const parts = [];
      if (criteria.priority) parts.push(`Priority = ${criteria.priority}`);
      if (criteria.effort) parts.push(`Effort = ${criteria.effort}`);
      if (criteria.duration) parts.push(`Duration = ${criteria.duration}`);
      if (criteria.focus) parts.push(`Focus = ${criteria.focus}`);
      return parts.join(", ");
    } catch { return ""; }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: DEFAULT_BG }}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      {/* UX-010: fixed inset-0 so content scrolls and bottom panel pins to viewport */}
      <div className="fixed inset-0 flex flex-col overflow-hidden" style={{ backgroundColor: DEFAULT_BG }}>
        {/* Top bar — back arrow (cancel) */}
        <div className="flex-shrink-0 flex items-center px-4 py-3 z-30" style={{ backgroundColor: DEFAULT_BG }}>
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

        {/* Scrollable editor content */}
        <div className="flex-1 overflow-y-auto px-4 max-w-2xl mx-auto w-full">
          {/* Title input */}
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Title"
            className="w-full text-2xl font-semibold text-gray-900 placeholder-gray-400 bg-transparent border-none outline-none mb-4"
            autoFocus={isNewParam}
          />

          {/* Smart list filter info */}
          {listType === "smart" && (
            <div className="bg-blue-50 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-700">
                <span className="font-medium">Showing tasks where:</span> {getFilterDescription()}
              </p>
            </div>
          )}

          {/* Items */}
          {listType === "simple" ? (
            <div className="space-y-1 mb-6">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 py-2 px-1 rounded-lg group ${
                    item.isChecked ? "opacity-60" : ""
                  }`}
                >
                  <button
                    onClick={() => toggleItem(item.id, item.isChecked)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      item.isChecked
                        ? "border-green-500 bg-green-500"
                        : "border-gray-400 hover:border-green-500"
                    }`}
                  >
                    {item.isChecked && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <span className={`flex-1 text-base ${
                    item.isChecked ? "line-through text-gray-400" : "text-gray-900"
                  }`}>
                    {item.text}
                  </span>
                  {item.task?.dueDate && (
                    <span className="text-xs text-gray-400">
                      {new Date(item.task.dueDate).toLocaleDateString()}
                    </span>
                  )}
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Delete item"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}

              {/* Add item row — always visible, eagerly creates list if needed */}
              <div className="flex items-center gap-3 py-2 px-1">
                <span className="w-5 h-5 flex items-center justify-center flex-shrink-0 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </span>
                <input
                  ref={newItemRef}
                  type="text"
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { e.preventDefault(); addItem(); }
                  }}
                  placeholder="Add item"
                  className="flex-1 text-base text-gray-900 placeholder-gray-400 bg-transparent border-none outline-none"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-1 mb-6">
              {filteredTasks.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No tasks match your filter criteria.</p>
              ) : (
                filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center gap-3 py-2 px-1 rounded-lg ${
                      task.isCompleted ? "opacity-60" : ""
                    }`}
                  >
                    <button
                      onClick={() => toggleSmartTask(task.id)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        task.isCompleted
                          ? "border-green-500 bg-green-500"
                          : "border-gray-400 hover:border-green-500"
                      }`}
                    >
                      {task.isCompleted && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <span className={`flex-1 text-base ${
                      task.isCompleted ? "line-through text-gray-400" : "text-gray-900"
                    }`}>
                      {task.name}
                    </span>
                    {task.priority && (
                      <span className={`w-2 h-2 rounded-full ${
                        task.priority === "high" ? "bg-red-500" : task.priority === "medium" ? "bg-yellow-500" : "bg-green-500"
                      }`} />
                    )}
                    {task.dueDate && (
                      <span className="text-xs text-gray-400">
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Spacer so items aren't hidden behind bottom panel */}
          <div className="h-8" />
        </div>

        {/* Bottom panel — pinned to viewport bottom. pb-16 clears BottomTabBar (md:hidden) on mobile */}
        <div className="flex-shrink-0 border-t border-gray-200 px-4 pt-3 pb-16 md:pb-4 max-w-2xl mx-auto w-full">
          {/* Color picker */}
          <div className="mb-4">
            <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Color</div>
            <div className="flex items-center gap-2">
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
          <div className="mb-4">
            <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Tags</div>
            <TagInput
              tags={tags}
              availableTags={availableTags}
              onTagsChange={setTags}
              placeholder="Add tags..."
            />
          </div>

          {/* Pin toggle + action buttons in one row */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">Pin to top</span>
            </label>
            <div className="flex-1" />
            {!isNew && listId && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={saving}
                className="px-4 py-2.5 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium text-sm"
              >
                Delete
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={(!name.trim() && items.length === 0) || saving}
              className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm disabled:opacity-50"
            >
              {saving ? "Saving..." : (isNew && !createdId) ? "Create" : "Update"}
            </button>
          </div>
        </div>
      </div>

      {/* Delete confirmation overlay */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete list?</h3>
            <p className="text-gray-600 mb-4 text-sm">This will delete all items. This cannot be undone.</p>
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
    </ProtectedRoute>
  );
}
