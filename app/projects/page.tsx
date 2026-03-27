"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { CreateProjectModal } from "@/components/projects/create-project-modal";
import { Project, PROJECT_STATUS_LABELS, PROJECT_HEALTH_LABELS } from "@/lib/types/project";
import { Task } from "@/lib/types/task";
import { HEALTH_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Folder, User, Calendar, TrendingUp, Plus } from "lucide-react";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [projectsRes, tasksRes] = await Promise.all([
        fetch("/api/vault/projects"),
        fetch("/api/vault/tasks"),
      ]);
      setProjects(await projectsRes.json());
      setTasks(await tasksRes.json());
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function getProjectProgress(projectTitle: string) {
    const projectTasks = tasks.filter((t) => t.project === projectTitle);
    if (projectTasks.length === 0) return { total: 0, done: 0, percent: 0 };
    const done = projectTasks.filter((t) => t.status === "done").length;
    return {
      total: projectTasks.length,
      done,
      percent: Math.round((done / projectTasks.length) * 100),
    };
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-linear-text-tertiary text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <Header title="Projects" subtitle={`${projects.length} projects`}>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-linear-accent text-white rounded-sm hover:bg-linear-accent-hover transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          New Project
        </button>
      </Header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl">
          {projects.map((project) => {
            const progress = getProjectProgress(project.title);
            return (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="linear-card p-4 linear-hover group block"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-linear-accent/20 flex items-center justify-center">
                      <Folder className="w-3.5 h-3.5 text-linear-accent" />
                    </div>
                    <h3 className="text-sm font-semibold text-linear-text-primary group-hover:text-linear-accent transition-colors">
                      {project.title}
                    </h3>
                  </div>
                  <span
                    className="text-2xs px-1.5 py-0.5 rounded-sm font-medium"
                    style={{
                      color: HEALTH_COLORS[project.health],
                      backgroundColor: HEALTH_COLORS[project.health] + "15",
                    }}
                  >
                    {PROJECT_HEALTH_LABELS[project.health]}
                  </span>
                </div>

                {/* Description */}
                {project.description && (
                  <p className="text-xs text-linear-text-tertiary mb-3 line-clamp-2">
                    {project.description}
                  </p>
                )}

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-2xs text-linear-text-tertiary">
                      Progress
                    </span>
                    <span className="text-2xs text-linear-text-secondary">
                      {progress.percent}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-linear-bg rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${progress.percent}%`,
                        backgroundColor: HEALTH_COLORS[project.health],
                      }}
                    />
                  </div>
                </div>

                {/* Meta */}
                <div className="flex items-center gap-4 text-2xs text-linear-text-tertiary">
                  {project.lead && (
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {project.lead}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {progress.done}/{progress.total} done
                  </div>
                  {project.target_date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {project.target_date}
                    </div>
                  )}
                </div>

                {/* Status + Teams */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-linear-border">
                  <span className="text-2xs px-1.5 py-0.5 rounded-sm bg-linear-surface-hover text-linear-text-secondary">
                    {PROJECT_STATUS_LABELS[project.status]}
                  </span>
                  {project.teams.map((team) => (
                    <span
                      key={team}
                      className="text-2xs px-1.5 py-0.5 rounded-sm bg-linear-accent/10 text-linear-accent"
                    >
                      {team}
                    </span>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={fetchData}
      />
    </div>
  );
}
