"use client";

import { useEffect, useState, useContext, useCallback } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Header from "@/components/Header";
import { SwipeContext } from "@/components/SwipeContainer";
import NoteCard from "@/components/NoteCard";
import NoteForm from "@/components/NoteForm";
import ListCard from "@/components/ListCard";
import FAB from "@/components/FAB";
import { useRefreshOnFocus } from "@/lib/useRefreshOnFocus";

interface ListItem {
  id: number;
  text: string;
  isChecked: boolean;
  taskId?: number;
}

interface List {
  id: number;
  name: string;
  listType: "simple" | "smart";
  filterCriteria?: string;
  color?: string;
  description?: string;
  tags?: string[];
  pinned: boolean;
  items: ListItem[];
  filteredTasks?: any[];
}

interface Note {
  id: number;
  title?: string | null;
  content: string;
  tags?: string[] | null;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

const COLORS = ["#8B5CF6", "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#EC4899"];

export default function NotesAndListsPage() {
  const { insideSwipe } = useContext(SwipeContext);
  const router = useRouter();
  const [lists, setLists] = useState<List[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [showListModal, setShowListModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // Filter and sort state
  const [filterType, setFilterType] = useState<"all" | "notes" | "lists">("all");
  const [sortBy, setSortBy] = useState<"recent" | "alphabetical">("recent");

  // Form state for lists
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formType, setFormType] = useState<"simple" | "smart">("simple");
  const [formColor, setFormColor] = useState(COLORS[0]);
  const [formPriority, setFormPriority] = useState("");
  const [formEffort, setFormEffort] = useState("");
  const [formDuration, setFormDuration] = useState("");
  const [formFocus, setFormFocus] = useState("");
  const [saving, setSaving] = useState(false);

  const showToast = (message: string, type: "success" | "error") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  };

  const loadLists = async () => {
    try {
      const res = await fetch("/api/lists");
      if (!res.ok) throw new Error("Failed to load lists");
      const data = await res.json();
      setLists(data);
    } catch (error) {
      console.error("Error loading lists:", error);
      showToast("Failed to load lists", "error");
    }
  };

  const loadNotes = async () => {
    try {
      const res = await fetch("/api/notes");
      if (!res.ok) throw new Error("Failed to load notes");
      const data = await res.json();
      setNotes(data);
    } catch (error) {
      console.error("Error loading notes:", error);
      showToast("Failed to load notes", "error");
    }
  };

  /** Reload both notes and lists */
  const refreshAll = useCallback(() => {
    Promise.all([loadLists(), loadNotes()]);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([loadLists(), loadNotes()]);
      setLoading(false);
    };
    loadData();
  }, []);

  // Re-fetch data when user returns to the tab/app
  useRefreshOnFocus(refreshAll);

  // Handle browser back button/gesture for list modal
  useEffect(() => {
    if (showListModal) {
      // Push a new history state when modal opens
      window.history.pushState({ modalOpen: true }, '');

      // Listen for back button/gesture
      const handlePopState = () => {
        setShowListModal(false);
      };

      window.addEventListener('popstate', handlePopState);

      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [showListModal]);

  // Get all unique tags from notes and lists
  const allTags = Array.from(
    new Set([
      ...notes.flatMap((n) => (n.tags as string[]) || []),
      ...lists.flatMap((l) => l.tags || []),
    ])
  );

  const openListModal = () => {
    setFormName("");
    setFormDescription("");
    setFormType("simple");
    setFormColor(COLORS[0]);
    setFormPriority("");
    setFormEffort("");
    setFormDuration("");
    setFormFocus("");
    setShowListModal(true);
  };

  const openNoteModal = (note?: Note) => {
    if (note) {
      setEditingNote(note);
    } else {
      setEditingNote(null);
    }
    setShowNoteModal(true);
  };

  const createList = async () => {
    if (!formName.trim()) return;
    setSaving(true);

    try {
      const listData: any = {
        name: formName,
        description: formDescription || null,
        listType: formType,
        color: formColor,
      };

      if (formType === "smart") {
        const criteria: any = {};
        if (formPriority) criteria.priority = formPriority;
        if (formEffort) criteria.effort = formEffort;
        if (formDuration) criteria.duration = formDuration;
        if (formFocus) criteria.focus = formFocus;
        listData.filterCriteria = criteria;
      }

      const res = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(listData),
      });

      if (!res.ok) throw new Error("Failed to create list");

      await loadLists();
      setShowListModal(false);
      showToast("List created successfully!", "success");
    } catch (error) {
      console.error("Error creating list:", error);
      showToast("Failed to create list", "error");
    } finally {
      setSaving(false);
    }
  };

  const saveNote = async (noteData: {
    title: string;
    content: string;
    tags: string[];
    pinned: boolean;
  }) => {
    try {
      if (editingNote) {
        // Update existing note
        const res = await fetch(`/api/notes/${editingNote.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(noteData),
        });

        if (!res.ok) throw new Error("Failed to update note");
        showToast("Note updated successfully!", "success");
      } else {
        // Create new note
        const res = await fetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(noteData),
        });

        if (!res.ok) throw new Error("Failed to create note");
        showToast("Note created successfully!", "success");
      }

      await loadNotes();
      setShowNoteModal(false);
      setEditingNote(null);
    } catch (error) {
      console.error("Error saving note:", error);
      showToast(`Failed to ${editingNote ? "update" : "create"} note`, "error");
      throw error;
    }
  };

  const toggleNotePin = async (note: Note) => {
    try {
      const res = await fetch(`/api/notes/${note.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinned: !note.pinned }),
      });

      if (!res.ok) throw new Error("Failed to update note");
      await loadNotes();
      showToast(note.pinned ? "Note unpinned" : "Note pinned", "success");
    } catch (error) {
      console.error("Error toggling note pin:", error);
      showToast("Failed to update note", "error");
    }
  };

  const deleteNote = async (noteId: number) => {
    try {
      const res = await fetch(`/api/notes/${noteId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete note");
      await loadNotes();
      showToast("Note deleted", "success");
    } catch (error) {
      console.error("Error deleting note:", error);
      showToast("Failed to delete note", "error");
    }
  };

  const toggleListPin = async (list: List) => {
    try {
      const res = await fetch(`/api/lists/${list.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinned: !list.pinned }),
      });

      if (!res.ok) throw new Error("Failed to update list");
      await loadLists();
      showToast(list.pinned ? "List unpinned" : "List pinned", "success");
    } catch (error) {
      console.error("Error toggling list pin:", error);
      showToast("Failed to update list", "error");
    }
  };

  const deleteList = async (listId: number) => {
    try {
      const res = await fetch(`/api/lists/${listId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete list");
      await loadLists();
      showToast("List deleted", "success");
    } catch (error) {
      console.error("Error deleting list:", error);
      showToast("Failed to delete list", "error");
    }
  };

  const getListStats = (list: List) => {
    if (list.listType === "smart") {
      const count = list.filteredTasks?.length || 0;
      return `${count} task${count !== 1 ? "s" : ""}`;
    }
    const total = list.items.length;
    const checked = list.items.filter((i) => i.isChecked).length;
    return `${checked}/${total} items`;
  };

  // Apply filters
  const filteredNotes = filterType === "lists" ? [] : notes;
  const filteredLists = filterType === "notes" ? [] : lists;

  // Apply sorting
  const sortItems = <T extends { createdAt?: string; name?: string; title?: string | null; pinned: boolean }>(
    items: T[]
  ): T[] => {
    const sorted = [...items];
    if (sortBy === "alphabetical") {
      sorted.sort((a, b) => {
        const nameA = ("name" in a ? a.name : a.title) || "";
        const nameB = ("name" in b ? b.name : b.title) || "";
        return nameA.localeCompare(nameB);
      });
    } else {
      // Sort by recent (createdAt descending)
      sorted.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
    }
    return sorted;
  };

  // Separate pinned and unpinned items, then sort within each group
  const sortedNotes = sortItems(filteredNotes);
  const sortedLists = sortItems(filteredLists);

  const pinnedNotes = sortedNotes.filter((n) => n.pinned);
  const unpinnedNotes = sortedNotes.filter((n) => !n.pinned);
  const pinnedLists = sortedLists.filter((l) => l.pinned);
  const unpinnedLists = sortedLists.filter((l) => !l.pinned);

  const hasContent = notes.length > 0 || lists.length > 0;
  const hasFilteredContent = filteredNotes.length > 0 || filteredLists.length > 0;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-5xl mx-auto p-4">
          {!insideSwipe && <Header onFilterClick={() => setShowFilterMenu(!showFilterMenu)} />}

          {/* Filter and Sort dropdown menu */}
          {showFilterMenu && (
            <div className="fixed top-16 right-4 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
              {/* Filter options */}
              <div className="px-4 py-2 border-b">
                <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Show</div>
                <div className="space-y-1">
                  {[
                    { value: "all" as const, label: "All" },
                    { value: "notes" as const, label: "Notes Only" },
                    { value: "lists" as const, label: "Lists Only" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFilterType(option.value)}
                      className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                        filterType === option.value
                          ? "bg-purple-100 text-purple-900 font-medium"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort options */}
              <div className="px-4 py-2">
                <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Sort By</div>
                <div className="space-y-1">
                  {[
                    { value: "recent" as const, label: "Most Recent" },
                    { value: "alphabetical" as const, label: "Alphabetical" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSortBy(option.value)}
                      className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                        sortBy === option.value
                          ? "bg-purple-100 text-purple-900 font-medium"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
            ) : !hasContent ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No notes or lists yet</h3>
                <p className="text-gray-600 mb-6">Create your first note or list to get organized.</p>
              </div>
            ) : !hasFilteredContent ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No {filterType === "notes" ? "notes" : filterType === "lists" ? "lists" : "items"} found
                </h3>
                <p className="text-gray-600 mb-6">Try changing your filter or create a new item.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Pinned items section */}
                {(pinnedNotes.length > 0 || pinnedLists.length > 0) && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                      <span>📌</span>
                      Pinned
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {pinnedNotes.map((note) => (
                        <NoteCard
                          key={`note-${note.id}`}
                          {...note}
                          tags={(note.tags as string[]) || []}
                          onClick={() => openNoteModal(note)}
                          onPin={() => toggleNotePin(note)}
                        />
                      ))}
                      {pinnedLists.map((list) => (
                        <ListCard
                          key={`list-${list.id}`}
                          {...list}
                          stats={getListStats(list)}
                          onClick={() => router.push(`/vault/${list.id}`)}
                          onPin={() => toggleListPin(list)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes section */}
                {unpinnedNotes.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Notes</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {unpinnedNotes.map((note) => (
                        <NoteCard
                          key={note.id}
                          {...note}
                          tags={(note.tags as string[]) || []}
                          onClick={() => openNoteModal(note)}
                          onPin={() => toggleNotePin(note)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Lists section */}
                {unpinnedLists.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Lists</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {unpinnedLists.map((list) => (
                        <ListCard
                          key={list.id}
                          {...list}
                          stats={getListStats(list)}
                          onClick={() => router.push(`/vault/${list.id}`)}
                          onPin={() => toggleListPin(list)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Create/Edit Note Modal */}
        <NoteForm
          isOpen={showNoteModal}
          onClose={() => {
            setShowNoteModal(false);
            setEditingNote(null);
          }}
          onSave={saveNote}
          onDelete={deleteNote}
          existingNote={editingNote}
          availableTags={allTags}
        />

        {/* Create List Modal */}
        {showListModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New List</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g., Grocery List"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description <span className="text-gray-500">(optional)</span>
                  </label>
                  <textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="What is this list for?"
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                  <div className="flex gap-2">
                    {COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setFormColor(color)}
                        className={`w-8 h-8 rounded-full border-2 ${
                          formColor === color ? "border-gray-900" : "border-transparent"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowListModal(false)}
                  disabled={saving}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={createList}
                  disabled={!formName.trim() || saving}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50"
                >
                  {saving ? "Creating..." : "Create"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toasts */}
        <div className="fixed bottom-8 left-8 space-y-2 z-50">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] ${
                toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
              }`}
            >
              <span className="flex-1 font-medium">{toast.message}</span>
            </div>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
}
