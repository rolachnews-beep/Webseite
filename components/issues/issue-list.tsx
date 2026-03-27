"use client";

import { useState } from "react";
import { Task } from "@/lib/types/task";
import { SortState, SortField } from "@/lib/types/filters";
import { IssueRow } from "./issue-row";
import { cn } from "@/lib/utils";

interface IssueGroup {
  key: string;
  label: string;
  tasks: Task[];
}

interface IssueListProps {
  groups: IssueGroup[];
  sort?: SortState;
  onSort?: (sort: SortState) => void;
}

const COLUMNS: { label: string; field?: SortField; className: string }[] = [
  { label: "", className: "w-8" },
  { label: "ID", className: "w-24" },
  { label: "Title", field: "title", className: "flex-1 min-w-0" },
  { label: "Status", field: "status", className: "w-28" },
  { label: "Assignee", field: "assignee", className: "w-28" },
  { label: "Project", className: "w-28" },
  { label: "Due Date", field: "due_date", className: "w-24" },
  { label: "Est.", className: "w-14 text-right" },
];

function SortIndicator({
  field,
  sort,
}: {
  field?: SortField;
  sort?: SortState;
}) {
  if (!field || !sort || sort.field !== field) return null;
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 16 16"
      fill="currentColor"
      className={cn(
        "ml-0.5 opacity-60 transition-transform",
        sort.direction === "desc" && "rotate-180"
      )}
    >
      <path d="M8 4l4 5H4l4-5z" />
    </svg>
  );
}

export function IssueList({ groups, sort, onSort }: IssueListProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleGroup = (key: string) => {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSort = (field?: SortField) => {
    if (!field || !onSort) return;
    if (sort?.field === field) {
      onSort({ field, direction: sort.direction === "asc" ? "desc" : "asc" });
    } else {
      onSort({ field, direction: "asc" });
    }
  };

  const totalTasks = groups.reduce((sum, g) => sum + g.tasks.length, 0);

  if (totalTasks === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-linear-text-tertiary">
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="mb-3 opacity-40"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M8 12h8M12 8v8" />
        </svg>
        <p className="text-sm">No issues found</p>
        <p className="text-xs mt-1">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      {/* Column Headers */}
      <div className="sticky top-0 z-10 flex items-center h-8 px-6 bg-linear-bg border-b border-linear-border">
        {COLUMNS.map((col, i) => (
          <div
            key={i}
            className={cn(
              "flex items-center text-2xs font-medium text-linear-text-tertiary uppercase tracking-wider select-none",
              col.className,
              col.field &&
                "cursor-pointer hover:text-linear-text-secondary transition-colors"
            )}
            onClick={() => handleSort(col.field)}
          >
            {col.label}
            <SortIndicator field={col.field} sort={sort} />
          </div>
        ))}
      </div>

      {/* Groups */}
      {groups.map((group) => (
        <div key={group.key}>
          {/* Group Header - only show when multiple groups */}
          {groups.length > 1 && (
            <button
              onClick={() => toggleGroup(group.key)}
              className="flex items-center gap-2 w-full h-8 px-6 bg-linear-surface/50 border-b border-linear-border hover:bg-linear-surface-hover transition-colors"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 16 16"
                fill="currentColor"
                className={cn(
                  "text-linear-text-tertiary transition-transform duration-150",
                  collapsed[group.key] ? "-rotate-90" : "rotate-0"
                )}
              >
                <path d="M4 6l4 4 4-4H4z" />
              </svg>
              <span className="text-xs font-medium text-linear-text-secondary">
                {group.label}
              </span>
              <span className="text-2xs text-linear-text-tertiary tabular-nums">
                {group.tasks.length}
              </span>
            </button>
          )}

          {/* Issue Rows */}
          {!collapsed[group.key] &&
            group.tasks.map((task, i) => (
              <IssueRow key={task.id} task={task} index={i} />
            ))}
        </div>
      ))}
    </div>
  );
}
