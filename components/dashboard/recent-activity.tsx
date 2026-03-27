"use client";

import { useMemo } from "react";
import { STATUS_COLORS } from "@/lib/constants";
import { STATUS_LABELS } from "@/lib/types/task";
import type { Task } from "@/lib/types/task";

interface RecentActivityProps {
  tasks: Task[];
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString("en", { month: "short", day: "numeric" });
}

export function RecentActivity({ tasks }: RecentActivityProps) {
  const recentTasks = useMemo(() => {
    return [...tasks]
      .sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime())
      .slice(0, 5);
  }, [tasks]);

  if (recentTasks.length === 0) {
    return (
      <div className="bg-linear-surface border border-linear-border rounded-[6px] p-5">
        <h3 className="text-sm font-medium text-linear-text-primary mb-4">
          Recent Activity
        </h3>
        <div className="flex items-center justify-center h-[140px] text-sm text-linear-text-tertiary">
          No recent activity
        </div>
      </div>
    );
  }

  return (
    <div className="bg-linear-surface border border-linear-border rounded-[6px] p-5">
      <h3 className="text-sm font-medium text-linear-text-primary mb-4">
        Recent Activity
      </h3>
      <div className="space-y-1">
        {recentTasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-3 py-2 px-2 rounded-[4px] hover:bg-linear-surface-hover transition-colors"
          >
            <span className="text-xs text-linear-text-tertiary font-mono w-16 flex-shrink-0 truncate">
              {task.id}
            </span>
            <span className="text-sm text-linear-text-primary truncate flex-1">
              {task.title}
            </span>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: STATUS_COLORS[task.status] }}
              />
              <span className="text-xs text-linear-text-secondary">
                {STATUS_LABELS[task.status]}
              </span>
            </div>
            <span className="text-xs text-linear-text-tertiary flex-shrink-0 w-14 text-right">
              {timeAgo(task.updated)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
