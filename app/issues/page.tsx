"use client";

import { useMemo } from "react";
import { Header } from "@/components/layout/header";
import { IssueList } from "@/components/issues/issue-list";
import { IssueFilters } from "@/components/issues/issue-filters";
import {
  useTasks,
  filterTasks,
  sortTasks,
  groupTasks,
} from "@/lib/hooks/use-tasks";
import { GroupByField } from "@/lib/types/filters";
import { cn } from "@/lib/utils";

const GROUP_OPTIONS: { value: GroupByField; label: string }[] = [
  { value: "status", label: "Status" },
  { value: "priority", label: "Priority" },
  { value: "project", label: "Project" },
  { value: "assignee", label: "Assignee" },
  { value: "none", label: "None" },
];

export default function IssuesPage() {
  const {
    tasks,
    loading,
    filters,
    setFilters,
    resetFilters,
    sort,
    setSort,
    groupBy,
    setGroupBy,
  } = useTasks();

  const processedGroups = useMemo(() => {
    const filtered = filterTasks(tasks, filters);
    const sorted = sortTasks(filtered, sort);
    return groupTasks(sorted, groupBy);
  }, [tasks, filters, sort, groupBy]);

  const totalCount = useMemo(
    () => processedGroups.reduce((sum, g) => sum + g.tasks.length, 0),
    [processedGroups]
  );

  return (
    <div className="flex flex-col h-full bg-linear-bg">
      <Header title="Issues" subtitle={loading ? undefined : `${totalCount}`}>
        {/* Group By Dropdown */}
        <div className="flex items-center gap-1.5">
          <span className="text-2xs text-linear-text-tertiary">Group</span>
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as GroupByField)}
            className="bg-linear-surface text-xs text-linear-text-secondary border border-linear-border rounded-sm px-2 py-1 outline-none hover:border-linear-border-light focus:border-linear-accent transition-colors cursor-pointer appearance-none pr-6"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='10' viewBox='0 0 16 16' fill='%235c5c60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4 6l4 4 4-4H4z'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 6px center",
            }}
          >
            {GROUP_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-1.5">
          <span className="text-2xs text-linear-text-tertiary">Sort</span>
          <select
            value={sort.field}
            onChange={(e) =>
              setSort({
                ...sort,
                field: e.target.value as typeof sort.field,
              })
            }
            className="bg-linear-surface text-xs text-linear-text-secondary border border-linear-border rounded-sm px-2 py-1 outline-none hover:border-linear-border-light focus:border-linear-accent transition-colors cursor-pointer appearance-none pr-6"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='10' viewBox='0 0 16 16' fill='%235c5c60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4 6l4 4 4-4H4z'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 6px center",
            }}
          >
            <option value="status">Status</option>
            <option value="priority">Priority</option>
            <option value="title">Title</option>
            <option value="assignee">Assignee</option>
            <option value="due_date">Due Date</option>
            <option value="created">Created</option>
            <option value="updated">Updated</option>
          </select>
        </div>

        {/* Sort Direction Toggle */}
        <button
          onClick={() =>
            setSort({
              ...sort,
              direction: sort.direction === "asc" ? "desc" : "asc",
            })
          }
          className="flex items-center gap-1 px-2 py-1 text-xs text-linear-text-secondary border border-linear-border rounded-sm hover:border-linear-border-light hover:text-linear-text-primary transition-colors"
          title={`Sort ${sort.direction === "asc" ? "ascending" : "descending"}`}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn(
              "transition-transform",
              sort.direction === "desc" && "rotate-180"
            )}
          >
            <path d="M12 5v14M5 12l7-7 7 7" />
          </svg>
        </button>
      </Header>

      <IssueFilters
        filters={filters}
        onFilterChange={setFilters}
        onReset={resetFilters}
      />

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-5 h-5 border-2 border-linear-accent border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-linear-text-tertiary">
              Loading issues...
            </span>
          </div>
        </div>
      ) : (
        <IssueList groups={processedGroups} sort={sort} onSort={setSort} />
      )}
    </div>
  );
}
