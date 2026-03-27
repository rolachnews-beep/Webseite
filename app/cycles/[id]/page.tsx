"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Cycle, CYCLE_STATUS_LABELS, CycleStatus } from "@/lib/types/cycle";
import { Task, STATUS_LABELS, ESTIMATE_VALUES } from "@/lib/types/task";
import { STATUS_COLORS, PRIORITY_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ArrowLeft, Target, Calendar, Gauge, Plus, X } from "lucide-react";

export default function CycleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [cycle, setCycle] = useState<Cycle | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingIssue, setAddingIssue] = useState(false);

  const fetchData = async () => {
    try {
      const [cyclesRes, tasksRes] = await Promise.all([
        fetch("/api/vault/cycles"),
        fetch("/api/vault/tasks"),
      ]);
      const allCycles: Cycle[] = await cyclesRes.json();
      const fetchedTasks: Task[] = await tasksRes.json();
      const found = allCycles.find((c) => c.id === params.id);
      setCycle(found || null);
      setAllTasks(fetchedTasks);
      if (found) {
        setTasks(fetchedTasks.filter((t) => t.cycle === found.title));
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const updateCycleProperty = async (updates: Partial<Cycle>) => {
    if (!cycle) return;
    setCycle({ ...cycle, ...updates } as Cycle);
    try {
      await fetch("/api/vault/cycles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filePath: cycle.filePath, updates }),
      });
    } catch (error) {
      console.error("Failed to update cycle:", error);
    }
  };

  const assignIssueToCycle = async (task: Task) => {
    if (!cycle) return;
    try {
      await fetch("/api/vault/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filePath: task.filePath,
          updates: { cycle: cycle.title },
        }),
      });
      await fetchData();
      setAddingIssue(false);
    } catch (error) {
      console.error("Failed to assign issue:", error);
    }
  };

  const removeIssueFromCycle = async (task: Task) => {
    try {
      await fetch("/api/vault/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filePath: task.filePath,
          updates: { cycle: "" },
        }),
      });
      await fetchData();
    } catch (error) {
      console.error("Failed to remove issue:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-linear-text-tertiary text-sm">Loading...</div>
      </div>
    );
  }

  if (!cycle) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="text-linear-text-tertiary text-sm">Cycle not found</div>
        <button
          onClick={() => router.push("/cycles")}
          className="text-sm text-linear-accent hover:text-linear-accent-hover"
        >
          Back to Cycles
        </button>
      </div>
    );
  }

  const doneCount = tasks.filter((t) => t.status === "done").length;
  const progress = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0;
  const totalEstimate = tasks.reduce(
    (sum, t) => sum + (t.estimate ? ESTIMATE_VALUES[t.estimate] : 0),
    0
  );
  const doneEstimate = tasks
    .filter((t) => t.status === "done")
    .reduce((sum, t) => sum + (t.estimate ? ESTIMATE_VALUES[t.estimate] : 0), 0);

  const unassignedTasks = allTasks.filter(
    (t) => !t.cycle || t.cycle !== cycle.title
  );

  return (
    <div className="h-full flex flex-col">
      <Header title={cycle.title}>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-xs text-linear-text-secondary hover:text-linear-text-primary transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>
      </Header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl">
          {/* Cycle info card */}
          <div className="linear-card p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="space-y-3">
                {/* Editable Status */}
                <div className="flex items-center gap-2">
                  <label className="text-xs text-linear-text-tertiary">Status:</label>
                  <select
                    value={cycle.status}
                    onChange={(e) =>
                      updateCycleProperty({ status: e.target.value as CycleStatus })
                    }
                    className="bg-linear-surface border border-linear-border rounded-sm px-2 py-0.5 text-xs text-linear-text-primary outline-none focus:border-linear-accent"
                  >
                    {Object.entries(CYCLE_STATUS_LABELS).map(([val, label]) => (
                      <option key={val} value={val}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Editable Dates */}
                <div className="flex items-center gap-4 text-xs text-linear-text-tertiary">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <input
                      type="date"
                      value={cycle.start_date}
                      onChange={(e) =>
                        updateCycleProperty({ start_date: e.target.value })
                      }
                      className="bg-transparent border border-linear-border rounded-sm px-1.5 py-0.5 text-xs text-linear-text-secondary outline-none focus:border-linear-accent"
                    />
                    <span>→</span>
                    <input
                      type="date"
                      value={cycle.end_date}
                      onChange={(e) =>
                        updateCycleProperty({ end_date: e.target.value })
                      }
                      className="bg-transparent border border-linear-border rounded-sm px-1.5 py-0.5 text-xs text-linear-text-secondary outline-none focus:border-linear-accent"
                    />
                  </div>
                </div>
              </div>

              <svg width="72" height="72" viewBox="0 0 72 72">
                <circle cx="36" cy="36" r="30" fill="none" stroke="#2e2e32" strokeWidth="4" />
                <circle
                  cx="36"
                  cy="36"
                  r="30"
                  fill="none"
                  stroke="#5e6ad2"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${(progress / 100) * 188.5} 188.5`}
                  transform="rotate(-90 36 36)"
                />
                <text x="36" y="39" textAnchor="middle" className="text-sm font-semibold" fill="#ededef">
                  {progress}%
                </text>
              </svg>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 pt-4 border-t border-linear-border">
              <StatBox label="Total Issues" value={tasks.length} />
              <StatBox label="Completed" value={doneCount} color="text-status-done" />
              <StatBox label="In Progress" value={tasks.filter((t) => t.status === "in-progress").length} color="text-status-in-progress" />
              <StatBox label="Scope" value={`${doneEstimate}/${totalEstimate} pts`} />
            </div>
          </div>

          {/* Issues */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-medium text-linear-text-tertiary uppercase tracking-wider">
              Issues ({tasks.length})
            </h3>
            <button
              onClick={() => setAddingIssue(!addingIssue)}
              className="flex items-center gap-1 text-xs text-linear-accent hover:text-linear-accent-hover"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Issue
            </button>
          </div>

          {/* Add issue dropdown */}
          {addingIssue && (
            <div className="linear-card p-3 mb-3">
              <label className="block text-xs text-linear-text-tertiary mb-1.5">
                Select an issue to add to this cycle
              </label>
              <select
                onChange={(e) => {
                  const t = allTasks.find((t) => t.id === e.target.value);
                  if (t) assignIssueToCycle(t);
                }}
                defaultValue=""
                className="w-full bg-linear-surface border border-linear-border rounded-sm px-2 py-1.5 text-sm text-linear-text-primary outline-none focus:border-linear-accent"
              >
                <option value="" disabled>
                  Choose issue...
                </option>
                {unassignedTasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.id} - {t.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="linear-card overflow-hidden">
            {tasks.length === 0 ? (
              <div className="p-8 text-center text-sm text-linear-text-tertiary">
                No issues in this cycle
              </div>
            ) : (
              tasks.map((task, i) => (
                <div
                  key={task.id}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 linear-hover group",
                    i < tasks.length - 1 && "border-b border-linear-border"
                  )}
                >
                  <Link
                    href={`/issues/${task.id}`}
                    className="flex items-center gap-3 flex-1 min-w-0"
                  >
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0 border-2"
                      style={{ borderColor: PRIORITY_COLORS[task.priority] }}
                    />
                    <span className="text-xs text-linear-text-tertiary w-20 flex-shrink-0">
                      {task.id}
                    </span>
                    <span className="text-sm text-linear-text-secondary group-hover:text-linear-text-primary flex-1 truncate">
                      {task.title}
                    </span>
                    <span
                      className="flex items-center gap-1.5 text-2xs px-1.5 py-0.5 rounded-sm"
                      style={{
                        color: STATUS_COLORS[task.status],
                        backgroundColor: STATUS_COLORS[task.status] + "15",
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: STATUS_COLORS[task.status] }}
                      />
                      {STATUS_LABELS[task.status]}
                    </span>
                    {task.estimate && (
                      <span className="text-2xs px-1.5 py-0.5 rounded-sm bg-linear-surface-hover text-linear-text-tertiary">
                        {task.estimate}
                      </span>
                    )}
                    {task.assignee && (
                      <span className="text-xs text-linear-text-tertiary w-24 truncate text-right">
                        {task.assignee}
                      </span>
                    )}
                  </Link>
                  <button
                    onClick={() => removeIssueFromCycle(task)}
                    className="p-1 rounded-sm opacity-0 group-hover:opacity-100 text-linear-text-tertiary hover:text-priority-urgent transition-all"
                    title="Remove from cycle"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: number | string; color?: string }) {
  return (
    <div>
      <div className="text-2xs text-linear-text-tertiary mb-1">{label}</div>
      <div className={cn("text-lg font-semibold", color || "text-linear-text-primary")}>
        {value}
      </div>
    </div>
  );
}
