"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Header from "@/components/Header";
import { useRefreshOnFocus } from "@/lib/useRefreshOnFocus";

type ProjectStatus = "backlog" | "active" | "completed";

interface Project {
  id: number;
  name: string;
  description?: string | null;
  status: ProjectStatus;
  targetDate?: string | null;
  tags?: string[] | null;
  createdAt: string;
  _count: { tasks: number };
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

function ProjectsContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Create form state
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newStatus, setNewStatus] = useState<ProjectStatus>("backlog");
  const [newTargetDate, setNewTargetDate] = useState("");
  const [saving, setSaving] = useState(false);

  const loadProjects = useCallback(async () => {
    try {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("Failed to load projects");
      setProjects(await res.json());
    } catch (error) {
      console.error("Error loading projects:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProjects(); }, [loadProjects]);
  useRefreshOnFocus(loadProjects);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          description: newDescription || undefined,
          status: newStatus,
          targetDate: newTargetDate || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to create project");
      const created = await res.json();
      setProjects((prev) => [{ ...created, _count: { tasks: 0 } }, ...prev]);
      setNewName("");
      setNewDescription("");
      setNewStatus("backlog");
      setNewTargetDate("");
      setShowCreateForm(false);
    } catch (error) {
      console.error("Error creating project:", error);
    } finally {
      setSaving(false);
    }
  };

  if (!session?.user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <ProtectedRoute>
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Header />

          {/* Page header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
            <button
              onClick={() => setShowCreateForm((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Project
            </button>
          </div>

          {/* Inline create form */}
          {showCreateForm && (
            <form
              onSubmit={handleCreate}
              className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm"
            >
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Project name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full text-base font-medium text-gray-900 placeholder-gray-400 border-none outline-none"
                  autoFocus
                />
                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full text-sm text-gray-700 placeholder-gray-400 border-none outline-none"
                />
                <div className="flex items-center gap-3 flex-wrap">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as ProjectStatus)}
                    className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 text-gray-700 bg-white"
                  >
                    <option value="backlog">Backlog</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                  <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <input
                      type="date"
                      value={newTargetDate}
                      onChange={(e) => setNewTargetDate(e.target.value)}
                      className="text-sm text-gray-700 border-none outline-none bg-transparent"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newName.trim() || saving}
                  className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? "Creating…" : "Create"}
                </button>
              </div>
            </form>
          )}

          {/* Projects list */}
          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading…</div>
          ) : projects.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-sm">No projects yet. Create one to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => router.push(`/projects/${project.id}`)}
                  className="w-full bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md hover:border-gray-300 transition-all text-left"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-gray-900 text-base">{project.name}</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[project.status]}`}>
                          {STATUS_LABELS[project.status]}
                        </span>
                      </div>
                      {project.description && (
                        <p className="text-sm text-gray-500 line-clamp-2">{project.description}</p>
                      )}
                      {/* Tags */}
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
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      {/* Task count badge */}
                      <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-full whitespace-nowrap">
                        {project._count.tasks} task{project._count.tasks !== 1 ? "s" : ""}
                      </span>
                      {/* Target date */}
                      {project.targetDate && (
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          Due {new Date(project.targetDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </ProtectedRoute>
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <ProjectsContent />
    </Suspense>
  );
}
