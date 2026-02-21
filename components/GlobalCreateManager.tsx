"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import FAB from "./FAB";
import TaskForm from "./TaskForm";

type CreateType = "task" | "habit" | "reminder" | "note" | "list" | null;

/**
 * GlobalCreateManager
 *
 * Manages the global creation FAB and creation flows.
 * Tasks/Habits/Reminders use modal forms. Notes and Lists navigate to
 * full-page Keep-style editors.
 */
export default function GlobalCreateManager() {
  const router = useRouter();
  const [activeModal, setActiveModal] = useState<CreateType>(null);

  // Listen for create events dispatched by BottomTabBar (mobile nav)
  useEffect(() => {
    function handleCreate(e: Event) {
      const type = (e as CustomEvent<{ type: string }>).detail.type as CreateType;
      // Notes and lists navigate to full-page editors instead of opening modals
      if (type === "note") {
        router.push("/vault/notes/new");
        return;
      }
      if (type === "list") {
        router.push("/vault/lists/new");
        return;
      }
      setActiveModal(type);
    }
    window.addEventListener('lifeos:create', handleCreate);
    return () => window.removeEventListener('lifeos:create', handleCreate);
  }, [router]);

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

  const getTaskFormTitle = () => {
    switch (activeModal) {
      case "habit": return "New Habit";
      case "reminder": return "New Reminder";
      default: return "New Task";
    }
  };

  return (
    <>
      {/* FAB is hidden on mobile — BottomTabBar's center + button handles create there */}
      <div className="hidden md:block">
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
            onClick: () => router.push("/vault/notes/new"),
          },
          {
            label: "List",
            icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
            onClick: () => router.push("/vault/lists/new"),
          },
        ]}
      />
      </div>

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
    </>
  );
}
