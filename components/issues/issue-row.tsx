"use client";

import Link from "next/link";
import { Task, STATUS_LABELS, PRIORITY_LABELS } from "@/lib/types/task";
import { STATUS_COLORS, PRIORITY_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface IssueRowProps {
  task: Task;
  index: number;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days === -1) return "Yesterday";

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function isOverdue(dateStr?: string, status?: string): boolean {
  if (!dateStr) return false;
  if (status === "done" || status === "cancelled") return false;
  return new Date(dateStr) < new Date();
}

export function IssueRow({ task, index }: IssueRowProps) {
  const overdue = isOverdue(task.due_date, task.status);

  return (
    <Link
      href={`/issues/${task.id}`}
      className={cn(
        "group flex items-center py-1.5 px-6 text-sm border-b border-linear-border transition-colors cursor-pointer",
        index % 2 === 1 ? "bg-[#0f0f11]" : "bg-transparent",
        "hover:bg-linear-surface-hover"
      )}
    >
      {/* Priority */}
      <div className="w-8 flex-shrink-0 flex items-center">
        <span
          className="w-3 h-3 rounded-full flex-shrink-0 ring-1 ring-inset ring-white/10"
          style={{ backgroundColor: PRIORITY_COLORS[task.priority] }}
          title={PRIORITY_LABELS[task.priority]}
        />
      </div>

      {/* ID */}
      <div className="w-24 flex-shrink-0">
        <span className="text-xs text-linear-text-tertiary font-mono">
          {task.id}
        </span>
      </div>

      {/* Title */}
      <div className="flex-1 min-w-0 pr-4">
        <span className="text-sm text-linear-text-primary truncate block group-hover:text-white transition-colors">
          {task.title}
        </span>
      </div>

      {/* Status */}
      <div className="w-28 flex-shrink-0">
        <span className="inline-flex items-center gap-1.5 text-xs text-linear-text-secondary">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: STATUS_COLORS[task.status] }}
          />
          {STATUS_LABELS[task.status]}
        </span>
      </div>

      {/* Assignee */}
      <div className="w-28 flex-shrink-0">
        <span className="text-xs text-linear-text-secondary truncate block">
          {task.assignee || (
            <span className="text-linear-text-tertiary">&mdash;</span>
          )}
        </span>
      </div>

      {/* Project */}
      <div className="w-28 flex-shrink-0">
        <span className="text-xs text-linear-text-secondary truncate block">
          {task.project || (
            <span className="text-linear-text-tertiary">&mdash;</span>
          )}
        </span>
      </div>

      {/* Due Date */}
      <div className="w-24 flex-shrink-0">
        {task.due_date ? (
          <span
            className={cn(
              "text-xs",
              overdue
                ? "text-red-400 font-medium"
                : "text-linear-text-secondary"
            )}
          >
            {formatDate(task.due_date)}
          </span>
        ) : (
          <span className="text-xs text-linear-text-tertiary">&mdash;</span>
        )}
      </div>

      {/* Estimate */}
      <div className="w-14 flex-shrink-0 text-right">
        {task.estimate ? (
          <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-2xs font-medium rounded-sm bg-linear-surface text-linear-text-secondary border border-linear-border">
            {task.estimate}
          </span>
        ) : (
          <span className="text-xs text-linear-text-tertiary">&mdash;</span>
        )}
      </div>
    </Link>
  );
}
