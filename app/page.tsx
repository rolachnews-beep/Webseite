"use client";

import { useMemo, useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { StatusChart } from "@/components/dashboard/status-chart";
import { PriorityChart } from "@/components/dashboard/priority-chart";
import { VelocityChart } from "@/components/dashboard/velocity-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { CycleWidget } from "@/components/dashboard/cycle-widget";
import { DispatchWidget } from "@/components/dashboard/dispatch-widget";
import { useTasks } from "@/lib/hooks/use-tasks";
import { useProjects } from "@/lib/hooks/use-projects";
import { Actor } from "@/lib/types/actor";

export default function DashboardPage() {
  const { tasks, loading: tasksLoading } = useTasks();
  const { cycles, loading: projectsLoading } = useProjects();
  const [actors, setActors] = useState<Actor[]>([]);

  const loading = tasksLoading || projectsLoading;

  useEffect(() => {
    fetch("/api/vault/actors")
      .then((res) => res.json())
      .then(setActors)
      .catch(console.error);
  }, []);

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const total = tasks.length;
    const inProgress = tasks.filter((t) => t.status === "in-progress").length;
    const completed = tasks.filter((t) => t.status === "done").length;
    const overdue = tasks.filter((t) => {
      if (!t.due_date || t.status === "done" || t.status === "cancelled")
        return false;
      const due = new Date(t.due_date);
      due.setHours(0, 0, 0, 0);
      return due < today;
    }).length;

    return [
      { label: "Total Issues", value: total },
      { label: "In Progress", value: inProgress },
      { label: "Completed", value: completed },
      {
        label: "Overdue",
        value: overdue,
        trend:
          overdue > 0
            ? { value: overdue, direction: "down" as const }
            : undefined,
      },
    ];
  }, [tasks]);

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <Header title="Home" />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3 text-linear-text-tertiary">
            <svg
              className="animate-spin h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
                className="opacity-25"
              />
              <path
                d="M4 12a8 8 0 018-8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span className="text-sm">Loading dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Header title="Home" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Stat Cards */}
        <StatsCards cards={stats} />

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StatusChart tasks={tasks} />
          <PriorityChart tasks={tasks} />
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <VelocityChart tasks={tasks} />
          <CycleWidget cycles={cycles} tasks={tasks} />
        </div>

        {/* Dispatch & Activity Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DispatchWidget tasks={tasks} actors={actors} />
          <RecentActivity tasks={tasks} />
        </div>
      </div>
    </div>
  );
}
