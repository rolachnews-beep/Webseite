"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import { Task } from "@/lib/types/task";
import { PRIORITY_COLORS, LABEL_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface BoardCardProps {
  task: Task;
  isDragOverlay?: boolean;
}

export function BoardCard({ task, isDragOverlay }: BoardCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const taskNumber = task.id.replace(/\D/g, "").padStart(3, "0");
  const priorityColor = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.none;

  const isOverdue =
    task.due_date && new Date(task.due_date) < new Date() && task.status !== "done";

  const formatDate = (date: string) => {
    const d = new Date(date);
    const month = d.toLocaleString("en-US", { month: "short" });
    const day = d.getDate();
    return `${month} ${day}`;
  };

  const assigneeInitials = task.assignee
    ? task.assignee
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "group relative bg-linear-surface border border-linear-border rounded-[6px] p-3 cursor-grab active:cursor-grabbing",
        "hover:bg-linear-surface-hover hover:border-linear-border-light transition-colors",
        isDragging && !isDragOverlay && "opacity-30",
        isDragOverlay && "shadow-xl shadow-black/40 ring-1 ring-linear-accent/30"
      )}
    >
      <Link
        href={`/issues/${task.id}`}
        onClick={(e) => {
          if (isDragging) e.preventDefault();
        }}
        className="absolute inset-0 z-10"
        draggable={false}
      />

      <div className="flex items-start gap-2.5">
        {/* Priority indicator bar */}
        <div
          className="w-[3px] h-8 rounded-full flex-shrink-0 mt-0.5"
          style={{ backgroundColor: priorityColor }}
        />

        <div className="flex-1 min-w-0">
          {/* Task ID */}
          <span className="text-2xs text-linear-text-tertiary font-medium">
            TASK-{taskNumber}
          </span>

          {/* Title */}
          <p className="text-sm font-medium text-linear-text-primary mt-0.5 leading-snug line-clamp-2">
            {task.title}
          </p>

          {/* Labels */}
          {task.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {task.labels.map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center text-2xs px-1.5 py-0.5 rounded-sm font-medium"
                  style={{
                    backgroundColor: `${LABEL_COLORS[label] || "#5c5c60"}18`,
                    color: LABEL_COLORS[label] || "#8a8a8e",
                  }}
                >
                  {label}
                </span>
              ))}
            </div>
          )}

          {/* Bottom metadata row */}
          {(assigneeInitials || task.estimate || task.due_date) && (
            <div className="flex items-center gap-2 mt-2.5">
              {/* Assignee */}
              {assigneeInitials && (
                <div
                  className="w-5 h-5 rounded-full bg-linear-accent/20 flex items-center justify-center flex-shrink-0"
                  title={task.assignee}
                >
                  <span className="text-[9px] font-semibold text-linear-accent">
                    {assigneeInitials}
                  </span>
                </div>
              )}

              {/* Estimate */}
              {task.estimate && (
                <span className="text-2xs text-linear-text-tertiary bg-linear-bg px-1.5 py-0.5 rounded-sm border border-linear-border">
                  {task.estimate}
                </span>
              )}

              {/* Due date */}
              {task.due_date && (
                <span
                  className={cn(
                    "text-2xs ml-auto",
                    isOverdue ? "text-[#ef4444]" : "text-linear-text-tertiary"
                  )}
                >
                  {formatDate(task.due_date)}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
