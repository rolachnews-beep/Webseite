export type CycleStatus = "upcoming" | "active" | "completed";

export interface Cycle {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  status: CycleStatus;
  content: string;
  filePath: string;
}

export const CYCLE_STATUS_LABELS: Record<CycleStatus, string> = {
  upcoming: "Upcoming",
  active: "Active",
  completed: "Completed",
};
