"use client";

import { useMemo } from "react";
import type { Cycle } from "@/lib/types/cycle";
import type { Task } from "@/lib/types/task";

interface CycleWidgetProps {
  cycles: Cycle[];
  tasks: Task[];
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en", { month: "short", day: "numeric" });
}

export function CycleWidget({ cycles, tasks }: CycleWidgetProps) {
  const activeCycle = useMemo(
    () => cycles.find((c) => c.status === "active"),
    [cycles]
  );

  const cycleStats = useMemo(() => {
    if (!activeCycle) return null;
    const cycleTasks = tasks.filter((t) => t.cycle === activeCycle.title);
    const total = cycleTasks.length;
    const completed = cycleTasks.filter((t) => t.status === "done").length;
    const remaining = total - completed;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, remaining, percent };
  }, [activeCycle, tasks]);

  if (!activeCycle || !cycleStats) {
    return (
      <div className="bg-linear-surface border border-linear-border rounded-[6px] p-5">
        <h3 className="text-sm font-medium text-linear-text-primary mb-4">
          Active Cycle
        </h3>
        <div className="flex items-center justify-center h-[140px] text-sm text-linear-text-tertiary">
          No active cycle
        </div>
      </div>
    );
  }

  const radius = 40;
  const stroke = 6;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (cycleStats.percent / 100) * circumference;

  return (
    <div className="bg-linear-surface border border-linear-border rounded-[6px] p-5">
      <h3 className="text-sm font-medium text-linear-text-primary mb-4">
        Active Cycle
      </h3>
      <div className="flex items-center gap-6">
        <div className="relative flex-shrink-0">
          <svg width={96} height={96} viewBox="0 0 96 96">
            <circle
              cx="48"
              cy="48"
              r={radius}
              fill="none"
              stroke="#2e2e32"
              strokeWidth={stroke}
            />
            <circle
              cx="48"
              cy="48"
              r={radius}
              fill="none"
              stroke="#5e6ad2"
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              transform="rotate(-90 48 48)"
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-semibold text-linear-text-primary">
              {cycleStats.percent}%
            </span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-linear-text-primary truncate">
            {activeCycle.title}
          </p>
          <p className="text-xs text-linear-text-tertiary mt-1">
            {formatDate(activeCycle.start_date)} &ndash;{" "}
            {formatDate(activeCycle.end_date)}
          </p>
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div>
              <p className="text-lg font-semibold text-linear-text-primary tabular-nums">
                {cycleStats.total}
              </p>
              <p className="text-2xs text-linear-text-tertiary">Total</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-status-done tabular-nums">
                {cycleStats.completed}
              </p>
              <p className="text-2xs text-linear-text-tertiary">Done</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-linear-text-secondary tabular-nums">
                {cycleStats.remaining}
              </p>
              <p className="text-2xs text-linear-text-tertiary">Remaining</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
