export type TaskStatus =
  | "backlog"
  | "todo"
  | "in-progress"
  | "in-review"
  | "done"
  | "cancelled";

export type TaskPriority = "urgent" | "high" | "medium" | "low" | "none";

export type Estimate = "XS" | "S" | "M" | "L" | "XL";

export type ActorType = "agent" | "human" | "any";
export type DispatchMode = "push" | "pull";

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  project?: string;
  assignee?: string;
  labels: string[];
  estimate?: Estimate;
  due_date?: string;
  start_date?: string;
  cycle?: string;
  parent?: string;
  blocked_by: string[];
  blocking: string[];
  required_capabilities: string[];
  actor_type: ActorType;
  claimed_by: string;
  claimed_at: string;
  dispatch_mode: DispatchMode;
  result_summary: string;
  created: string;
  updated: string;
  content: string;
  filePath: string;
}

export const STATUS_ORDER: TaskStatus[] = [
  "backlog",
  "todo",
  "in-progress",
  "in-review",
  "done",
  "cancelled",
];

export const STATUS_LABELS: Record<TaskStatus, string> = {
  backlog: "Backlog",
  todo: "Todo",
  "in-progress": "In Progress",
  "in-review": "In Review",
  done: "Done",
  cancelled: "Cancelled",
};

export const PRIORITY_ORDER: TaskPriority[] = [
  "urgent",
  "high",
  "medium",
  "low",
  "none",
];

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  urgent: "Urgent",
  high: "High",
  medium: "Medium",
  low: "Low",
  none: "No priority",
};

export const ESTIMATE_VALUES: Record<Estimate, number> = {
  XS: 1,
  S: 2,
  M: 3,
  L: 5,
  XL: 8,
};
