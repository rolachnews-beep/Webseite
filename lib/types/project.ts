export type ProjectStatus =
  | "planned"
  | "active"
  | "paused"
  | "completed"
  | "cancelled";

export type ProjectHealth = "on-track" | "at-risk" | "off-track";

export interface Project {
  id: string;
  title: string;
  status: ProjectStatus;
  lead?: string;
  teams: string[];
  start_date?: string;
  target_date?: string;
  health: ProjectHealth;
  description: string;
  content: string;
  filePath: string;
}

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  planned: "Planned",
  active: "Active",
  paused: "Paused",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const PROJECT_HEALTH_LABELS: Record<ProjectHealth, string> = {
  "on-track": "On Track",
  "at-risk": "At Risk",
  "off-track": "Off Track",
};
