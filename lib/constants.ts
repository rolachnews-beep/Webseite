import { TaskStatus, TaskPriority } from "./types/task";
import { ProjectHealth } from "./types/project";

export const STATUS_COLORS: Record<TaskStatus, string> = {
  backlog: "#6b6b70",
  todo: "#d4d4d8",
  "in-progress": "#e5c07b",
  "in-review": "#5B9BD5",
  done: "#50a770",
  cancelled: "#e55561",
};

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  urgent: "#e55561",
  high: "#d4915a",
  medium: "#e5c07b",
  low: "#6b7280",
  none: "#5c5c60",
};

export const HEALTH_COLORS: Record<ProjectHealth, string> = {
  "on-track": "#50a770",
  "at-risk": "#d4915a",
  "off-track": "#e55561",
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
];
