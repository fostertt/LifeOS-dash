"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Header from "@/components/Header";
import TaskForm from "@/components/TaskForm";
import { useRefreshOnFocus } from "@/lib/useRefreshOnFocus";
import { Suspense } from "react";

/**
 * Inbox page (ADR-020) — replaces the old Home launcher page.
 *
 * Shows all unreviewed items (voice captures, quick captures) across
 * Item, Note, and List models. User can confirm (remove from inbox)
 * or tap to edit before confirming.
 *
 * Items (tasks/habits/reminders) open TaskForm inline on this page.
 * Notes and Lists navigate to their full-page editors in Vault.
 */

interface InboxItem {
  id: number;
  modelType: "item" | "note" | "list";
  title: string;
  description: string | null;
  source: string | null;
  state: string | null;
  itemType: string;
  tags: string[] | null;
  createdAt: string;
}

/** Source badge colors and labels */
const SOURCE_STYLES: Record<string, { bg: string; label: string }> = {
  voice: { bg: "bg-blue-100 text-blue-700", label: "Voice" },
  quick_capture: { bg: "bg-purple-100 text-purple-700", label: "Quick" },
  system: { bg: "bg-gray-100 text-gray-600", label: "System" },
};

/** Item type badge colors */
const TYPE_STYLES: Record<string, { bg: string; label: string }> = {
  task: { bg: "bg-purple-50 text-purple-700", label: "Task" },
  habit: { bg: "bg-green-50 text-green-700", label: "Habit" },
  reminder: { bg: "bg-amber-50 text-amber-700", label: "Reminder" },
  note: { bg: "bg-yellow-50 text-yellow-700", label: "Note" },
  list: { bg: "bg-indigo-50 text-indigo-700", label: "List" },
};

function InboxContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<InboxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  // TaskForm state for inline editing of items (tasks/habits/reminders)
  const [editingTask, setEditingTask] = useState<any | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);

  const fetchInbox = useCallback(async () => {
    try {
      const res = await fetch("/api/inbox");
      if (!res.ok) throw new Error("Failed to fetch inbox");
      const data = await res.json();
      setItems(data.items);
    } catch (error) {
      console.error("Error fetching inbox:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user) fetchInbox();
  }, [session, fetchInbox]);

  useRefreshOnFocus(fetchInbox);

  /** Confirm/review an inbox item — removes it from inbox view */
  const handleConfirm = async (item: InboxItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const key = `${item.modelType}-${item.id}`;
    setConfirmingId(key);

    try {
      const res = await fetch("/api/inbox", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modelType: item.modelType, id: item.id }),
      });
      if (!res.ok) throw new Error("Failed to confirm");

      // Remove from local state immediately
      setItems((prev) => prev.filter((i) => !(i.modelType === item.modelType && i.id === item.id)));
    } catch (error) {
      console.error("Error confirming item:", error);
    } finally {
      setConfirmingId(null);
    }
  };

  /** Open the appropriate editor for the item type */
  const handleTap = async (item: InboxItem) => {
    switch (item.modelType) {
      case "note":
        router.push(`/vault/notes/${item.id}`);
        break;
      case "list":
        router.push(`/vault/lists/${item.id}`);
        break;
      case "item":
        // Fetch full item data and open TaskForm inline
        try {
          const res = await fetch(`/api/items/${item.id}`);
          if (!res.ok) throw new Error("Failed to fetch item");
          const fullItem = await res.json();
          setEditingTask(fullItem);
          setShowTaskModal(true);
        } catch (error) {
          console.error("Error fetching item for edit:", error);
        }
        break;
    }
  };

  /** Save task changes from the inline TaskForm */
  const saveTask = async (taskData: any) => {
    if (!editingTask) return;
    try {
      const res = await fetch(`/api/items/${editingTask.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });
      if (!res.ok) throw new Error("Failed to update item");
      // Refresh inbox after edit
      await fetchInbox();
    } catch (error) {
      console.error("Error updating item:", error);
      throw error;
    }
  };

  /** Delete item from the inline TaskForm */
  const deleteTask = async () => {
    if (!editingTask) return;
    try {
      const res = await fetch(`/api/items/${editingTask.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete item");
      setShowTaskModal(false);
      setEditingTask(null);
      // Remove from local state and refresh
      await fetchInbox();
    } catch (error) {
      console.error("Error deleting item:", error);
      throw error;
    }
  };

  /** Format relative time */
  const timeAgo = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    return `${diffDay}d ago`;
  };

  if (!session?.user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <ProtectedRoute>
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Header />

          {/* Inbox header */}
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900">Inbox</h1>
            {items.length > 0 && (
              <span className="text-sm text-gray-500">
                {items.length} to review
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : items.length === 0 ? (
            /* Empty state */
            <div className="text-center py-16">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h2 className="text-lg font-semibold text-gray-700 mb-1">All caught up</h2>
              <p className="text-sm text-gray-500">
                Voice captures and quick adds will appear here for review.
              </p>
            </div>
          ) : (
            /* Inbox items list */
            <div className="space-y-2 pb-24">
              {items.map((item) => {
                const sourceStyle = SOURCE_STYLES[item.source || ""] || { bg: "bg-gray-100 text-gray-500", label: item.source };
                const typeStyle = TYPE_STYLES[item.itemType] || { bg: "bg-gray-100 text-gray-500", label: item.itemType };
                const key = `${item.modelType}-${item.id}`;
                const isConfirming = confirmingId === key;

                return (
                  <div
                    key={key}
                    onClick={() => handleTap(item)}
                    className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-3 cursor-pointer hover:border-purple-300 hover:shadow-sm transition-all active:bg-gray-50"
                  >
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Badges row */}
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${typeStyle.bg}`}>
                          {typeStyle.label}
                        </span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${sourceStyle.bg}`}>
                          {sourceStyle.label}
                        </span>
                        <span className="text-[10px] text-gray-400 ml-auto">
                          {timeAgo(item.createdAt)}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {item.title}
                      </h3>

                      {/* Description preview */}
                      {item.description && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                          {item.description}
                        </p>
                      )}
                    </div>

                    {/* Confirm button */}
                    <button
                      onClick={(e) => handleConfirm(item, e)}
                      disabled={isConfirming}
                      className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                        isConfirming
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-100 text-gray-400 hover:bg-green-100 hover:text-green-600 active:bg-green-200"
                      }`}
                      aria-label="Confirm item"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Inline TaskForm for editing items directly from inbox */}
        <TaskForm
          isOpen={showTaskModal}
          onClose={() => { setShowTaskModal(false); setEditingTask(null); }}
          onSave={saveTask}
          onDelete={deleteTask}
          existingTask={editingTask}
          availableTags={[]}
          itemType={editingTask?.itemType || "task"}
        />
      </ProtectedRoute>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InboxContent />
    </Suspense>
  );
}
