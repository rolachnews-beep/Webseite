"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Project, PROJECT_STATUS_LABELS, PROJECT_HEALTH_LABELS } from "@/lib/types/project";
import { Task, STATUS_LABELS } from "@/lib/types/task";
import { STATUS_COLORS, PRIORITY_COLORS, HEALTH_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ArrowLeft, User, Calendar, Target } from "lucide-react";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [projectsRes, tasksRes] = await Promise.all([
          fetch("/api/vault/projects"),
          fetch("/api/vault/tasks"),
        ]);
        const projects: Project[] = await projectsRes.json();
        const allTasks: Task[] = await tasksRes.json();
        const found = projects.find((p) => p.id === params.id);
        setProject(found || null);
        if (found) {
          setTasks(allTasks.filter((t) => t.project === found.title));
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-linear-text-tertiary text-sm">Loading...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="text-linear-text-tertiary text-sm">Project not found</div>
        <button
          onClick={() => router.push("/projects")}
          className="text-sm text-linear-accent hover:text-linear-accent-hover"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  const doneCount = tasks.filter((t) => t.status === "done").length;
  const progress = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0;

  const statusGroups = tasks.reduce(
    (acc, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="h-full flex flex-col">
      <Header title={project.title}>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-xs text-linear-text-secondary hover:text-linear-text-primary transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>
      </Header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl">
          {/* Project Header */}
          <div className="linear-card p-5 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-2 py-0.5 rounded-sm bg-linear-surface-hover text-linear-text-secondary">
                    {PROJECT_STATUS_LABELS[project.status]}
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-sm font-medium"
                    style={{
                      color: HEALTH_COLORS[project.health],
                      backgroundColor: HEALTH_COLORS[project.health] + "15",
                    }}
                  >
                    {PROJECT_HEALTH_LABELS[project.health]}
                  </span>
                </div>
                {project.description && (
                  <p className="text-sm text-linear-text-secondary mt-2">
                    {project.description}
                  </p>
                )}
              </div>

              {/* Progress Ring */}
              <div className="flex-shrink-0">
                <svg width="64" height="64" viewBox="0 0 64 64">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="#2e2e32"
                    strokeWidth="4"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke={HEALTH_COLORS[project.health]}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${(progress / 100) * 175.9} 175.9`}
                    transform="rotate(-90 32 32)"
                  />
                  <text
                    x="32"
                    y="35"
                    textAnchor="middle"
                    className="text-xs font-semibold"
                    fill="#ededef"
                  >
                    {progress}%
                  </text>
                </svg>
              </div>
            </div>

            {/* Meta row */}
            <div className="flex items-center gap-6 text-xs text-linear-text-tertiary border-t border-linear-border pt-3">
              {project.lead && (
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  {project.lead}
                </div>
              )}
              {project.start_date && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {project.start_date} - {project.target_date || "TBD"}
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" />
                {doneCount}/{tasks.length} completed
              </div>
              {project.teams.map((team) => (
                <span
                  key={team}
                  className="px-1.5 py-0.5 rounded-sm bg-linear-accent/10 text-linear-accent"
                >
                  {team}
                </span>
              ))}
            </div>
          </div>

          {/* Status breakdown */}
          <div className="flex gap-2 mb-6">
            {Object.entries(statusGroups).map(([status, count]) => (
              <div
                key={status}
                className="flex items-center gap-1.5 px-2 py-1 rounded-sm bg-linear-surface border border-linear-border text-xs"
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: STATUS_COLORS[status as Task["status"]] }}
                />
                <span className="text-linear-text-secondary">
                  {STATUS_LABELS[status as Task["status"]]}
                </span>
                <span className="text-linear-text-tertiary">{count}</span>
              </div>
            ))}
          </div>

          {/* Issues list */}
          <h3 className="text-xs font-medium text-linear-text-tertiary uppercase tracking-wider mb-3">
            Issues ({tasks.length})
          </h3>
          <div className="linear-card overflow-hidden">
            {tasks.length === 0 ? (
              <div className="p-8 text-center text-sm text-linear-text-tertiary">
                No issues in this project
              </div>
            ) : (
              tasks.map((task, i) => (
                <Link
                  key={task.id}
                  href={`/issues/${task.id}`}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 linear-hover group",
                    i < tasks.length - 1 && "border-b border-linear-border"
                  )}
                >
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0 border-2"
                    style={{
                      borderColor: PRIORITY_COLORS[task.priority],
                    }}
                  />
                  <span className="text-xs text-linear-text-tertiary w-20 flex-shrink-0">
                    {task.id}
                  </span>
                  <span className="text-sm text-linear-text-secondary group-hover:text-linear-text-primary flex-1 truncate">
                    {task.title}
                  </span>
                  <span
                    className="flex items-center gap-1.5 text-2xs px-1.5 py-0.5 rounded-sm"
                    style={{
                      color: STATUS_COLORS[task.status],
                      backgroundColor: STATUS_COLORS[task.status] + "15",
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: STATUS_COLORS[task.status] }}
                    />
                    {STATUS_LABELS[task.status]}
                  </span>
                  {task.assignee && (
                    <span className="text-xs text-linear-text-tertiary w-24 truncate text-right">
                      {task.assignee}
                    </span>
                  )}
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
