"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { FilterState } from "@/lib/types/filters";
import {
  TaskStatus,
  TaskPriority,
  STATUS_LABELS,
  PRIORITY_LABELS,
  STATUS_ORDER,
  PRIORITY_ORDER,
} from "@/lib/types/task";
import { STATUS_COLORS, PRIORITY_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface IssueFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  onReset: () => void;
}

type FilterDropdownType = "status" | "priority" | "assignee" | "project" | null;

interface DropdownProps {
  label: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  hasActive?: boolean;
}

function FilterDropdown({
  label,
  open,
  onToggle,
  children,
  hasActive,
}: DropdownProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        if (open) onToggle();
      }
    },
    [open, onToggle]
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={onToggle}
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-sm border transition-colors",
          open
            ? "border-linear-accent text-linear-text-primary bg-linear-accent-muted"
            : hasActive
              ? "border-linear-accent/50 text-linear-text-primary bg-linear-accent-muted"
              : "border-linear-border text-linear-text-secondary hover:text-linear-text-primary hover:border-linear-border-light"
        )}
      >
        {label}
        <svg
          width="12"
          height="12"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="opacity-50"
        >
          <path d="M4.5 6l3.5 4 3.5-4H4.5z" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-52 bg-linear-surface border border-linear-border rounded shadow-lg z-50 animate-fade-in">
          <div className="p-1 max-h-64 overflow-y-auto">{children}</div>
        </div>
      )}
    </div>
  );
}

function CheckboxItem({
  checked,
  onChange,
  color,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  color?: string;
  label: string;
}) {
  return (
    <button
      onClick={onChange}
      className="flex items-center gap-2.5 w-full px-2 py-1.5 text-xs rounded-sm hover:bg-linear-surface-hover transition-colors text-left"
    >
      <div
        className={cn(
          "w-3.5 h-3.5 rounded-sm border flex items-center justify-center flex-shrink-0 transition-colors",
          checked
            ? "bg-linear-accent border-linear-accent"
            : "border-linear-border-light"
        )}
      >
        {checked && (
          <svg width="10" height="10" viewBox="0 0 16 16" fill="white">
            <path d="M6.5 12.5l-4-4 1.5-1.5 2.5 2.5 5.5-5.5 1.5 1.5-7 7z" />
          </svg>
        )}
      </div>
      {color && (
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
        />
      )}
      <span
        className={cn(
          checked ? "text-linear-text-primary" : "text-linear-text-secondary"
        )}
      >
        {label}
      </span>
    </button>
  );
}

function FilterChip({
  label,
  color,
  onRemove,
}: {
  label: string;
  color?: string;
  onRemove: () => void;
}) {
  return (
    <span className="flex items-center gap-1 px-2 py-0.5 text-2xs bg-linear-surface rounded-sm border border-linear-border text-linear-text-secondary animate-fade-in">
      {color && (
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
        />
      )}
      {label}
      <button
        onClick={onRemove}
        className="ml-0.5 text-linear-text-tertiary hover:text-linear-text-primary transition-colors"
      >
        <svg width="10" height="10" viewBox="0 0 16 16">
          <path
            d="M4.5 4.5l7 7M11.5 4.5l-7 7"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>
      </button>
    </span>
  );
}

export function IssueFilters({
  filters,
  onFilterChange,
  onReset,
}: IssueFiltersProps) {
  const [openDropdown, setOpenDropdown] = useState<FilterDropdownType>(null);
  const [searchFocused, setSearchFocused] = useState(false);

  const toggleDropdown = (type: FilterDropdownType) => {
    setOpenDropdown((prev) => (prev === type ? null : type));
  };

  const toggleStatus = (status: TaskStatus) => {
    const next = filters.status.includes(status)
      ? filters.status.filter((s) => s !== status)
      : [...filters.status, status];
    onFilterChange({ status: next });
  };

  const togglePriority = (priority: TaskPriority) => {
    const next = filters.priority.includes(priority)
      ? filters.priority.filter((p) => p !== priority)
      : [...filters.priority, priority];
    onFilterChange({ priority: next });
  };

  const hasActiveFilters =
    filters.status.length > 0 ||
    filters.priority.length > 0 ||
    filters.assignee.length > 0 ||
    filters.project.length > 0 ||
    filters.search.length > 0;

  return (
    <div className="flex items-center gap-2 px-6 py-2 border-b border-linear-border flex-wrap">
      {/* Search Input */}
      <div
        className={cn(
          "flex items-center gap-2 px-2.5 py-1 rounded-sm border transition-colors",
          searchFocused
            ? "border-linear-accent bg-linear-accent-muted"
            : "border-linear-border hover:border-linear-border-light"
        )}
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
          className="text-linear-text-tertiary flex-shrink-0"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Filter issues..."
          value={filters.search}
          onChange={(e) => onFilterChange({ search: e.target.value })}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          className="bg-transparent text-xs text-linear-text-primary placeholder:text-linear-text-tertiary outline-none w-40"
        />
        {filters.search && (
          <button
            onClick={() => onFilterChange({ search: "" })}
            className="text-linear-text-tertiary hover:text-linear-text-secondary transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 16 16">
              <path
                d="M4.5 4.5l7 7M11.5 4.5l-7 7"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Separator */}
      <div className="w-px h-4 bg-linear-border" />

      {/* Filter Dropdowns */}
      <FilterDropdown
        label="Status"
        open={openDropdown === "status"}
        onToggle={() => toggleDropdown("status")}
        hasActive={filters.status.length > 0}
      >
        {STATUS_ORDER.map((status) => (
          <CheckboxItem
            key={status}
            checked={filters.status.includes(status)}
            onChange={() => toggleStatus(status)}
            color={STATUS_COLORS[status]}
            label={STATUS_LABELS[status]}
          />
        ))}
      </FilterDropdown>

      <FilterDropdown
        label="Priority"
        open={openDropdown === "priority"}
        onToggle={() => toggleDropdown("priority")}
        hasActive={filters.priority.length > 0}
      >
        {PRIORITY_ORDER.map((priority) => (
          <CheckboxItem
            key={priority}
            checked={filters.priority.includes(priority)}
            onChange={() => togglePriority(priority)}
            color={PRIORITY_COLORS[priority]}
            label={PRIORITY_LABELS[priority]}
          />
        ))}
      </FilterDropdown>

      <FilterDropdown
        label="Assignee"
        open={openDropdown === "assignee"}
        onToggle={() => toggleDropdown("assignee")}
        hasActive={filters.assignee.length > 0}
      >
        <div className="px-2 py-2 text-2xs text-linear-text-tertiary">
          Assignee filters are populated from task data
        </div>
      </FilterDropdown>

      <FilterDropdown
        label="Project"
        open={openDropdown === "project"}
        onToggle={() => toggleDropdown("project")}
        hasActive={filters.project.length > 0}
      >
        <div className="px-2 py-2 text-2xs text-linear-text-tertiary">
          Project filters are populated from task data
        </div>
      </FilterDropdown>

      {/* Active Filter Chips */}
      {filters.status.map((s) => (
        <FilterChip
          key={`chip-status-${s}`}
          label={`Status: ${STATUS_LABELS[s]}`}
          color={STATUS_COLORS[s]}
          onRemove={() => toggleStatus(s)}
        />
      ))}
      {filters.priority.map((p) => (
        <FilterChip
          key={`chip-priority-${p}`}
          label={`Priority: ${PRIORITY_LABELS[p]}`}
          color={PRIORITY_COLORS[p]}
          onRemove={() => togglePriority(p)}
        />
      ))}

      {/* Reset Button */}
      {hasActiveFilters && (
        <button
          onClick={onReset}
          className="text-2xs text-linear-text-tertiary hover:text-linear-text-secondary transition-colors ml-1"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
