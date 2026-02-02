"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FAB from "./FAB";
import TaskForm from "./TaskForm";
import NoteForm from "./NoteForm";
import ListForm from "./ListForm";

type CreateType = "task" | "habit" | "reminder" | "note" | "list" | null;

/**
 * GlobalCreateManager
 *
 * Manages the global creation FAB and all creation modals.
 * Allows creating Tasks, Habits, Reminders, Notes, and Lists from anywhere in the app.
 * Refreshes the page data after successful creation.
 */
export default function GlobalCreateManager() {
  const router = useRouter();
  const [activeModal, setActiveModal] = useState<CreateType>(null);
  
  // Tag support is currently placeholder until we implement global tag fetching
  const availableTags: string[] = [];

  const handleSaveTask = async (taskData: any) => {
    try {
      // Determine itemType based on activeModal
      const itemType = activeModal === "habit" ? "habit" : activeModal === "reminder" ? "reminder" : "task";
      
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...taskData,
          itemType,
        }),
      });

      if (!res.ok) throw new Error(`Failed to create ${itemType}`);
      
      router.refresh(); // Refresh server components
      setActiveModal(null);
    } catch (error) {
      console.error("Error saving item:", error);
      alert("Failed to save item");
    }
  };

  const handleSaveNote = async (noteData: any) => {
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(noteData),
      });

      if (!res.ok) throw new Error("Failed to create note");

      router.refresh();
      setActiveModal(null);
    } catch (error) {
      console.error("Error saving note:", error);
      alert("Failed to save note");
    }
  };

  const handleSaveList = async (listData: any) => {
    try {
      const res = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(listData),
      });

      if (!res.ok) throw new Error("Failed to create list");

      router.refresh();
      setActiveModal(null);
    } catch (error) {
      console.error("Error saving list:", error);
      alert("Failed to save list");
    }
  };

  const getTaskFormTitle = () => {
    switch (activeModal) {
      case "habit": return "New Habit";
      case "reminder": return "New Reminder";
      default: return "New Task";
    }
  };

  return (
    <>
      <FAB
        options={[
          {
            label: "New Task",
            icon: "✅",
            onClick: () => setActiveModal("task"),
            color: "#8B5CF6", // purple
          },
          {
            label: "New Habit",
            icon: "🔄",
            onClick: () => setActiveModal("habit"),
            color: "#10B981", // green
          },
          {
            label: "New Reminder",
            icon: "⏰",
            onClick: () => setActiveModal("reminder"),
            color: "#F59E0B", // amber
          },
          {
            label: "New Note",
            icon: "📝",
            onClick: () => setActiveModal("note"),
            color: "#3B82F6", // blue
          },
          {
            label: "New List",
            icon: "📋",
            onClick: () => setActiveModal("list"),
            color: "#EC4899", // pink
          },
        ]}
      />

      {/* Shared Task/Habit/Reminder Form */}
      {(activeModal === "task" || activeModal === "habit" || activeModal === "reminder") && (
        <TaskForm
          isOpen={true}
          onClose={() => setActiveModal(null)}
          onSave={handleSaveTask}
          availableTags={availableTags}
          title={getTaskFormTitle()}
          itemType={activeModal}
        />
      )}

      {/* Note Form */}
      <NoteForm
        isOpen={activeModal === "note"}
        onClose={() => setActiveModal(null)}
        onSave={handleSaveNote}
        availableTags={availableTags}
      />

      {/* List Form */}
      <ListForm
        isOpen={activeModal === "list"}
        onClose={() => setActiveModal(null)}
        onSave={handleSaveList}
      />
    </>
  );
}
