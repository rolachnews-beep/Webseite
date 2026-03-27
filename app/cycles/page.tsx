"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Cycle, CYCLE_STATUS_LABELS } from "@/lib/types/cycle";
import { Task } from "@/lib/types/task";
import { STATUS_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { RefreshCw, Calendar, Target, Clock } from "lucide-react";
import { differenceInDays, parseISO, format } from "date-fns";

export default function CyclesPage() {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [cyclesRes, tasksRes] = await Promise.all([
          fetch("/api/vault/cycles"),
          fetch("/api/vault/tasks"),
        ]);
        setCycles(await cyclesRes.json());
        setTasks(await tasksRes.json());
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  function getCycleTasks(cycleTitle: string) {
    return tasks.filter((t) => t.cycle === cycleTitle);
  }

  function getCycleProgress(cycleTitle: string) {
    const ct = getCycleTasks(cycleTitle);
    if (ct.length === 0) return { total: 0, done: 0, inProgress: 0, percent: 0 };
    const done = ct.filter((t) => t.status === "done").length;
    const inProgress = ct.filter((t) => t.status === "in-progress").length;
    return {
      total: ct.length,
      done,
      inProgress,
      percent: Math.round((done / ct.length) * 100),
    };
  }

  function getDaysInfo(cycle: Cycle) {
    if (!cycle.start_date || !cycle.end_date) return null;
    const start = parseISO(cycle.start_date);
    const end = parseISO(cycle.end_date);
    const total = differenceInDays(end, start);
    const elapsed = differenceInDays(new Date(), start);
    const remaining = differenceInDays(end, new Date());
    return { total, elapsed: Math.max(0, elapsed), remaining: Math.max(0, remaining) };
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-linear-text-tertiary text-sm">Loading...</div>
      </div>
    );
  }

  const activeCycle = cycles.find((c) => c.status === "active");
  const upcomingCycles = cycles.filter((c) => c.status === "upcoming");
  const completedCycles = cycles.filter((c) => c.status === "completed");

  return (
    <div className="h-full flex flex-col">
      <Header title="Cycles" subtitle={`${cycles.length} cycles`} />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl">
          {/* Active Cycle */}
          {activeCycle && (
            <div className="mb-8">
              <h2 className="text-xs font-medium text-linear-text-tertiary uppercase tracking-wider mb-3">
                Active Cycle
              </h2>
              <CycleCard
                cycle={activeCycle}
                progress={getCycleProgress(activeCycle.title)}
                days={getDaysInfo(activeCycle)}
                tasks={getCycleTasks(activeCycle.title)}
                isActive
              />
            </div>
          )}

          {/* Upcoming */}
          {upcomingCycles.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xs font-medium text-linear-text-tertiary uppercase tracking-wider mb-3">
                Upcoming
              </h2>
              <div className="space-y-3">
                {upcomingCycles.map((cycle) => (
                  <CycleCard
                    key={cycle.id}
                    cycle={cycle}
                    progress={getCycleProgress(cycle.title)}
                    days={getDaysInfo(cycle)}
                    tasks={getCycleTasks(cycle.title)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Completed */}
          {completedCycles.length > 0 && (
            <div>
              <h2 className="text-xs font-medium text-linear-text-tertiary uppercase tracking-wider mb-3">
                Completed
              </h2>
              <div className="space-y-3">
                {completedCycles.map((cycle) => (
                  <CycleCard
                    key={cycle.id}
                    cycle={cycle}
                    progress={getCycleProgress(cycle.title)}
                    days={getDaysInfo(cycle)}
                    tasks={getCycleTasks(cycle.title)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CycleCard({
  cycle,
  progress,
  days,
  tasks,
  isActive = false,
}: {
  cycle: Cycle;
  progress: { total: number; done: number; inProgress: number; percent: number };
  days: { total: number; elapsed: number; remaining: number } | null;
  tasks: Task[];
  isActive?: boolean;
}) {
  const statusDistribution = tasks.reduce(
    (acc, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <Link
      href={`/cycles/${cycle.id}`}
      className={cn(
        "block linear-card p-5 linear-hover",
        isActive && "border-linear-accent/30"
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <RefreshCw className={cn("w-4 h-4", isActive ? "text-linear-accent" : "text-linear-text-tertiary")} />
            <h3 className="text-sm font-semibold text-linear-text-primary">
              {cycle.title}
            </h3>
            <span
              className={cn(
                "text-2xs px-1.5 py-0.5 rounded-sm",
                isActive
                  ? "bg-linear-accent/10 text-linear-accent"
                  : "bg-linear-surface-hover text-linear-text-secondary"
              )}
            >
              {CYCLE_STATUS_LABELS[cycle.status]}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-linear-text-tertiary">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {cycle.start_date} → {cycle.end_date}
            </span>
            {days && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {days.remaining} days remaining
              </span>
            )}
          </div>
        </div>

        {/* Progress Ring */}
        <svg width="48" height="48" viewBox="0 0 48 48" className="flex-shrink-0">
          <circle cx="24" cy="24" r="20" fill="none" stroke="#2e2e32" strokeWidth="3" />
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke={isActive ? "#5e6ad2" : "#27ae60"}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${(progress.percent / 100) * 125.7} 125.7`}
            transform="rotate(-90 24 24)"
          />
          <text
            x="24"
            y="27"
            textAnchor="middle"
            className="text-2xs font-semibold"
            fill="#ededef"
          >
            {progress.percent}%
          </text>
        </svg>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="h-1.5 bg-linear-bg rounded-full overflow-hidden flex">
          {Object.entries(statusDistribution).map(([status, count]) => (
            <div
              key={status}
              className="h-full"
              style={{
                width: `${(count / progress.total) * 100}%`,
                backgroundColor: STATUS_COLORS[status as Task["status"]] || "#8a8a8e",
              }}
            />
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-linear-text-tertiary">
        <span className="flex items-center gap-1">
          <Target className="w-3 h-3" />
          {progress.total} issues
        </span>
        <span className="text-status-done">
          {progress.done} completed
        </span>
        <span className="text-status-in-progress">
          {progress.inProgress} in progress
        </span>
      </div>
    </Link>
  );
}
