"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Header from "@/components/Header";
import TaskForm from "@/components/TaskForm";
import { useRefreshOnFocus } from "@/lib/useRefreshOnFocus";

type ProjectStatus = "backlog" | "active" | "completed";

interface Task {
  id: number;
  name: string;
  description?: string | null;
  state: string;
  priority?: string | null;
  dueDate?: string | null;
  dueTime?: string | null;
  itemType: string;
  isCompleted?: boolean | null;
  tags?: string[] | null;
  complexity?: string | null;
  energy?: string | null;
  duration?: string | null;
  recurrenceType?: string | null;
  recurrenceInterval?: number | null;
  recurrenceAnchor?: string | null;
  showOnCalendar?: boolean;
  projectId?: number | null;
  subItems?: any[];
  completions?: any[];
}

interface Project {
  id: number;
  name: string;
  description?: string | null;
  status: ProjectStatus;
  targetDate?: string | null;
  tags?: string[] | null;
  createdAt: string;
  tasks: Task[];
}

const STATUS_LABELS: Record<ProjectStatus, string> = {
  backlog: "Backlog",
  active: "Active",
  completed: "Completed",
};

const STATUS_COLORS: Record<ProjectStatus, string> = {
  backlog: "bg-gray-100 text-gray-700",
  active: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
};

function ProjectDetailContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const projectId = parseInt(params.id as string);

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState<ProjectStatus>("backlog");
  const [editTargetDate, setEditTargetDate] = useState("");
  const [saving, setSaving] = useState(false);

  // Task modal state
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const loadProject = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      if (!res.ok) { router.push("/projects"); return; }
      const data = await res.json();
      setProject(data);
    } catch (error) {
      console.error("Error loading project:", error);
    } finally {
      setLoading(false);
    }
  }, [projectId, router]);

  useEffect(() => { loadProject(); }, [loadProject]);
  useRefreshOnFocus(loadProject);

  const startEdit = () => {
    if (!project) return;
    setEditName(project.name);
    setEditDescription(project.description || "");
    setEditStatus(project.status);
    setEditTargetDate(
      project.targetDate ? new Date(project.targetDate).toISOString().split("T")[0] : ""
    );
    setEditing(true);
  };

  const saveEdit = async () => {
    if (!project || !editName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          description: editDescription || null,
          status: editStatus,
          targetDate: editTargetDate || null,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      const updated = await res.json();
      setProject((prev) => prev ? { ...prev, ...updated } : prev);
      setEditing(false);
    } catch (error) {
      console.error("Error saving project:", error);
    } finally {
      setSaving(false);
    }
  };

  const deleteProject = async () => {
    if (!project) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      router.push("/projects");
    } catch (error) {
      console.error("Error deleting project:", error);
      setDeleting(false);
    }
  };

  const toggleComplete = async (task: Task) => {
    const newCompleted = !task.isCompleted;
    // Optimistic update
    setProject((prev) =>
      prev ? { ...prev, tasks: prev.tasks.map((t) => t.id === task.id ? { ...t, isCompleted: newCompleted } : t) } : prev
    );
    try {
      await fetch(`/api/items/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted: newCompleted }),
      });
    } catch (error) {
      console.error("Error toggling task:", error);
      loadProject(); // Reload on failure
    }
  };

  const saveTask = async (taskData: any) => {
    if (!editingTask) return;
    try {
      await fetch(`/api/items/${editingTask.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });
      await loadProject();
      setShowTaskModal(false);
      setEditingTask(null);
    } catch (error) {
      console.error("Error saving task:", error);
    }
  };

  const deleteTask = async () => {
    if (!editingTask) return;
    try {
      await fetch(`/api/items/${editingTask.id}`, { method: "DELETE" });
      await loadProject();
      setShowTaskModal(false);
      setEditingTask(null);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const openTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  if (!session?.user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ProtectedRoute>
          <div className="max-w-4xl mx-auto px-4 py-4">
            <Header />
            <div className="text-center py-12 text-gray-400">Loading…</div>
          </div>
        </ProtectedRoute>
      </div>
    );
  }

  if (!project) return null;

  // Split tasks by completion status, then by state
  const activeTasks = project.tasks.filter((t) => !t.isCompleted && t.state === "active");
  const backlogTasks = project.tasks.filter((t) => !t.isCompleted && t.state === "backlog");
  const completedTasks = project.tasks.filter((t) => t.isCompleted);

  const allTags = Array.from(
    new Set(project.tasks.flatMap((t) => t.tags || []))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <ProtectedRoute>
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Header />

          {/* Back button */}
          <button
            onClick={() => router.push("/projects")}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-4 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Projects
          </button>

          {/* Project header */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
            {editing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full text-xl font-bold text-gray-900 border-none outline-none"
                  autoFocus
                />
                <input
                  type="text"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Description (optional)"
                  className="w-full text-sm text-gray-600 placeholder-gray-400 border-none outline-none"
                />
                <div className="flex items-center gap-3 flex-wrap">
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as ProjectStatus)}
                    className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 text-gray-700 bg-white"
                  >
                    <option value="backlog">Backlog</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                  <input
                    type="date"
                    value={editTargetDate}
                    onChange={(e) => setEditTargetDate(e.target.value)}
                    className="text-sm text-gray-700 border border-gray-200 rounded-lg px-2 py-1.5 bg-white"
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button onClick={() => setEditing(false)} className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900">
                    Cancel
                  </button>
                  <button
                    onClick={saveEdit}
                    disabled={!editName.trim() || saving}
                    className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {saving ? "Saving…" : "Save"}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <h1 className="text-xl font-bold text-gray-900">{project.name}</h1>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[project.status]}`}>
                        {STATUS_LABELS[project.status]}
                      </span>
                    </div>
                    {project.description && (
                      <p className="text-sm text-gray-600 mb-2">{project.description}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                      {project.targetDate && (
                        <span>
                          Target: {new Date(project.targetDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                        </span>
                      )}
                      <span>{project.tasks.length} total task{project.tasks.length !== 1 ? "s" : ""}</span>
                    </div>
                    {project.tags && project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {project.tags.map((tag) => (
                          <span key={tag} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={startEdit}
                      className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Edit project"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setShowConfirmDelete(true)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete project"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Delete confirmation */}
          {showConfirmDelete && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
                <h3 className="font-semibold text-gray-900 mb-2">Delete project?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Tasks assigned to this project will not be deleted — they'll just lose the project association.
                </p>
                <div className="flex gap-3 justify-end">
                  <button onClick={() => setShowConfirmDelete(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
                    Cancel
                  </button>
                  <button
                    onClick={deleteProject}
                    disabled={deleting}
                    className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    {deleting ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tasks sections */}
          <div className="space-y-6">
            <TaskSection title="Active" tasks={activeTasks} onToggle={toggleComplete} onOpen={openTask} emptyText="No active tasks" />
            <TaskSection title="Backlog" tasks={backlogTasks} onToggle={toggleComplete} onOpen={openTask} emptyText="No backlog tasks" collapsible />
            <TaskSection title="Completed" tasks={completedTasks} onToggle={toggleComplete} onOpen={openTask} emptyText="No completed tasks" collapsible defaultCollapsed />
          </div>
        </div>

        <TaskForm
          isOpen={showTaskModal}
          onClose={() => { setShowTaskModal(false); setEditingTask(null); }}
          onSave={saveTask}
          onDelete={deleteTask}
          existingTask={editingTask as any}
          availableTags={allTags}
          itemType={(editingTask?.itemType as any) || "task"}
        />
      </ProtectedRoute>
    </div>
  );
}

/** Renders a titled group of tasks with optional collapse */
function TaskSection({
  title,
  tasks,
  onToggle,
  onOpen,
  emptyText,
  collapsible = false,
  defaultCollapsed = false,
}: {
  title: string;
  tasks: Task[];
  onToggle: (task: Task) => void;
  onOpen: (task: Task) => void;
  emptyText: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <div>
      <button
        onClick={() => collapsible && setCollapsed((v) => !v)}
        className={`flex items-center gap-2 mb-2 w-full text-left ${collapsible ? "cursor-pointer" : "cursor-default"}`}
      >
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{title}</h2>
        <span className="text-xs text-gray-400 font-normal">({tasks.length})</span>
        {collapsible && (
          <svg
            className={`w-3.5 h-3.5 text-gray-400 ml-auto transition-transform ${collapsed ? "" : "rotate-180"}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {!collapsed && (
        tasks.length === 0 ? (
          <p className="text-sm text-gray-400 pl-1">{emptyText}</p>
        ) : (
          <div className="space-y-1">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 px-3 py-2.5 hover:border-gray-300 transition-colors"
              >
                {/* Completion toggle */}
                <button
                  onClick={() => onToggle(task)}
                  className="w-5 h-5 rounded-full border-2 border-gray-300 hover:border-blue-400 flex items-center justify-center shrink-0 transition-colors"
                >
                  {task.isCompleted && (
                    <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>

                {/* Task name — click to edit */}
                <button
                  onClick={() => onOpen(task)}
                  className={`flex-1 text-sm text-left ${task.isCompleted ? "line-through text-gray-400" : "text-gray-800"}`}
                >
                  {task.name}
                </button>

                {/* Meta chips */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {task.priority && (
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                      task.priority === "high" ? "bg-red-100 text-red-700" :
                      task.priority === "medium" ? "bg-yellow-100 text-yellow-700" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {task.priority}
                    </span>
                  )}
                  {task.dueDate && (
                    <span className="text-xs text-gray-400">
                      {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

export default function ProjectDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <ProjectDetailContent />
    </Suspense>
  );
}
