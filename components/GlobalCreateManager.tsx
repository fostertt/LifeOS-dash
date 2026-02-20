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
            label: "Task",
            icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
            onClick: () => setActiveModal("task"),
          },
          {
            label: "Habit",
            icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
            onClick: () => setActiveModal("habit"),
          },
          {
            label: "Reminder",
            icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
            onClick: () => setActiveModal("reminder"),
          },
          {
            label: "Note",
            icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
            onClick: () => setActiveModal("note"),
          },
          {
            label: "List",
            icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
            onClick: () => setActiveModal("list"),
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
