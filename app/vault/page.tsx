"use client";

import { useEffect, useState, useContext, useCallback } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Header from "@/components/Header";
import { SwipeContext } from "@/components/SwipeContainer";
import NoteCard from "@/components/NoteCard";
import ListCard from "@/components/ListCard";
import { useRefreshOnFocus } from "@/lib/useRefreshOnFocus";
import TagInput from "@/components/TagInput";

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
  createdAt?: string;
}

interface Note {
  id: number;
  title?: string | null;
  content?: string | null;
  tags?: string[] | null;
  pinned: boolean;
  color?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

/**
 * NotesAndListsPage - Vault page showing all notes and lists
 *
 * Cards navigate to full-page Keep-style editors instead of opening modals.
 * Supports filtering by type and tags, sorting by recent/alphabetical.
 */
export default function NotesAndListsPage() {
  const { insideSwipe } = useContext(SwipeContext);
  const router = useRouter();
  const [lists, setLists] = useState<List[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Filter and sort state
  const [filterType, setFilterType] = useState<"all" | "notes" | "lists">("all");
  const [sortBy, setSortBy] = useState<"recent" | "alphabetical">("recent");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

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

  /** Toggle pin on a note via API and refresh */
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

  /** Toggle pin on a list via API and refresh */
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

  const getListStats = (list: List) => {
    if (list.listType === "smart") {
      const count = list.filteredTasks?.length || 0;
      return `${count} task${count !== 1 ? "s" : ""}`;
    }
    const total = list.items.length;
    const checked = list.items.filter((i) => i.isChecked).length;
    return `${checked}/${total} items`;
  };

  // Get all unique tags from notes and lists
  const allTags = Array.from(
    new Set([
      ...notes.flatMap((n) => (n.tags as string[]) || []),
      ...lists.flatMap((l) => l.tags || []),
    ])
  );

  // Apply filters
  const filteredNotes = (filterType === "lists" ? [] : notes).filter((note) => {
    if (selectedTags.length === 0) return true;
    const noteTags = (note.tags as string[]) || [];
    return selectedTags.every((t) => noteTags.includes(t));
  });
  const filteredLists = (filterType === "notes" ? [] : lists).filter((list) => {
    if (selectedTags.length === 0) return true;
    const listTags = list.tags || [];
    return selectedTags.every((t) => listTags.includes(t));
  });

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

          {/* Filter and Sort panel — horizontal bubble UI */}
          {showFilterMenu && (
            <div className="bg-white rounded-lg shadow border border-gray-200 px-4 py-3 mb-4 space-y-3">
              {/* Show row */}
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase mb-1.5">Show</div>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { value: "all" as const, label: "All" },
                    { value: "notes" as const, label: "Notes" },
                    { value: "lists" as const, label: "Lists" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFilterType(option.value)}
                      className={`px-3 py-1 text-sm rounded-full font-medium transition-colors ${
                        filterType === option.value
                          ? "bg-purple-100 text-purple-900"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort row */}
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase mb-1.5">Sort By</div>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { value: "recent" as const, label: "Most Recent" },
                    { value: "alphabetical" as const, label: "Alphabetical" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSortBy(option.value)}
                      className={`px-3 py-1 text-sm rounded-full font-medium transition-colors ${
                        sortBy === option.value
                          ? "bg-purple-100 text-purple-900"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tag filter */}
              {allTags.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase mb-1.5">Filter by Tag</div>
                  <TagInput
                    tags={selectedTags}
                    availableTags={allTags}
                    onTagsChange={setSelectedTags}
                    placeholder="Search tags..."
                  />
                </div>
              )}
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
                          onClick={() => router.push(`/vault/notes/${note.id}`)}
                          onPin={() => toggleNotePin(note)}
                        />
                      ))}
                      {pinnedLists.map((list) => (
                        <ListCard
                          key={`list-${list.id}`}
                          {...list}
                          tags={list.tags || []}
                          stats={getListStats(list)}
                          onClick={() => router.push(`/vault/lists/${list.id}`)}
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
                          onClick={() => router.push(`/vault/notes/${note.id}`)}
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
                          tags={list.tags || []}
                          stats={getListStats(list)}
                          onClick={() => router.push(`/vault/lists/${list.id}`)}
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
