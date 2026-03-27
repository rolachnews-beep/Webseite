import { TaskStatus, TaskPriority } from "./types/task";
import { ProjectHealth } from "./types/project";

export const STATUS_COLORS: Record<TaskStatus, string> = {
  backlog: "#8a8a8e",
  todo: "#e2e2e3",
  "in-progress": "#f2c94c",
  "in-review": "#2d9cdb",
  done: "#27ae60",
  cancelled: "#ef4444",
};

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  urgent: "#f76b6b",
  high: "#e89b3e",
  medium: "#f2c94c",
  low: "#6b7280",
  none: "#5c5c60",
};

export const HEALTH_COLORS: Record<ProjectHealth, string> = {
  "on-track": "#27ae60",
  "at-risk": "#e89b3e",
  "off-track": "#f76b6b",
};

export const LABEL_COLORS: Record<string, string> = {
  bug: "#eb5757",
  feature: "#2d9cdb",
  improvement: "#27ae60",
  documentation: "#f2c94c",
  design: "#bb87fc",
  backend: "#e89b3e",
  frontend: "#56b6c2",
  infrastructure: "#8a8a8e",
};

export const NAV_ITEMS = [
  { label: "Home", href: "/", icon: "Home", shortcut: "G H" },
  { label: "Issues", href: "/issues", icon: "CircleDot", shortcut: "G I" },
  { label: "Board", href: "/board", icon: "Columns3", shortcut: "G B" },
  { label: "Projects", href: "/projects", icon: "Folder", shortcut: "G P" },
  { label: "Cycles", href: "/cycles", icon: "RefreshCw", shortcut: "G C" },
  { label: "Timeline", href: "/timeline", icon: "GanttChart", shortcut: "G T" },
  { label: "Agents", href: "/agents", icon: "Bot", shortcut: "G A" },
];

export const ACTOR_STATUS_COLORS: Record<string, string> = {
  idle: "#27ae60",
  working: "#f2c94c",
  offline: "#6b7280",
};
