import { TaskStatus, TaskPriority } from "./task";

export interface FilterState {
  status: TaskStatus[];
  priority: TaskPriority[];
  assignee: string[];
  project: string[];
  labels: string[];
  cycle: string[];
  search: string;
}

export const DEFAULT_FILTERS: FilterState = {
  status: [],
  priority: [],
  assignee: [],
  project: [],
  labels: [],
  cycle: [],
  search: "",
};

export type SortField =
  | "status"
  | "priority"
  | "title"
  | "assignee"
  | "due_date"
  | "created"
  | "updated";

export type SortDirection = "asc" | "desc";

export interface SortState {
  field: SortField;
  direction: SortDirection;
}

export type GroupByField =
  | "status"
  | "priority"
  | "project"
  | "assignee"
  | "cycle"
  | "none";
