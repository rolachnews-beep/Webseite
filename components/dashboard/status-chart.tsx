"use client";

import { useState } from "react";
import { STATUS_COLORS } from "@/lib/constants";
import { STATUS_LABELS, type TaskStatus } from "@/lib/types/task";
import type { Task } from "@/lib/types/task";

interface StatusChartProps {
  tasks: Task[];
}

export function StatusChart({ tasks }: StatusChartProps) {
  const [hoveredStatus, setHoveredStatus] = useState<TaskStatus | null>(null);

  const data = (Object.keys(STATUS_COLORS) as TaskStatus[])
    .map((status) => ({
      status,
      label: STATUS_LABELS[status],
      count: tasks.filter((t) => t.status === status).length,
      color: STATUS_COLORS[status],
    }))
    .filter((d) => d.count > 0);

  const total = data.reduce((sum, d) => sum + d.count, 0);

  if (data.length === 0) {
    return (
      <div className="bg-linear-surface border border-linear-border/60 rounded-lg p-5">
        <h3 className="text-sm font-medium text-linear-text-primary mb-4">
          Status Distribution
        </h3>
        <div className="flex items-center justify-center h-[220px] text-sm text-linear-text-tertiary">
          No tasks found
        </div>
      </div>
    );
  }

  return (
    <div className="bg-linear-surface border border-linear-border/60 rounded-lg p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-medium text-linear-text-primary">
          Status Distribution
        </h3>
        <span className="text-xs text-linear-text-tertiary font-mono tabular-nums">
          {total} issues
        </span>
      </div>

      {/* Segmented progress bar */}
      <div className="relative mb-6">
        <div className="flex h-2 rounded overflow-hidden gap-px">
          {data.map((entry) => (
            <div
              key={entry.status}
              className="relative h-full transition-opacity duration-200 first:rounded-l last:rounded-r"
              style={{
                width: `${(entry.count / total) * 100}%`,
                backgroundColor: entry.color,
                opacity: hoveredStatus && hoveredStatus !== entry.status ? 0.35 : 1,
              }}
              onMouseEnter={() => setHoveredStatus(entry.status)}
              onMouseLeave={() => setHoveredStatus(null)}
            >
              {/* Tooltip */}
              {hoveredStatus === entry.status && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 pointer-events-none">
                  <div className="bg-[#16161a] border border-[#26262a] rounded-lg px-3 py-2 shadow-lg shadow-black/40 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-xs text-linear-text-primary font-medium">
                        {entry.label}
                      </span>
                    </div>
                    <div className="text-xs text-linear-text-secondary mt-1 font-mono tabular-nums">
                      {entry.count} issues &middot; {Math.round((entry.count / total) * 100)}%
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Legend grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">
        {data.map((entry) => (
          <div
            key={entry.status}
            className="flex items-center gap-2 cursor-default group"
            onMouseEnter={() => setHoveredStatus(entry.status)}
            onMouseLeave={() => setHoveredStatus(null)}
          >
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-transform duration-150 group-hover:scale-110"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-linear-text-secondary truncate">
              {entry.label}
            </span>
            <span className="text-xs text-linear-text-tertiary font-mono tabular-nums ml-auto">
              {entry.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
