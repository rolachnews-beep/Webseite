"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Cycle, CYCLE_STATUS_LABELS } from "@/lib/types/cycle";
import { Task, STATUS_LABELS, ESTIMATE_VALUES } from "@/lib/types/task";
import { STATUS_COLORS, PRIORITY_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ArrowLeft, Target, Calendar, Gauge } from "lucide-react";

export default function CycleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [cycle, setCycle] = useState<Cycle | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [cyclesRes, tasksRes] = await Promise.all([
          fetch("/api/vault/cycles"),
          fetch("/api/vault/tasks"),
        ]);
        const allCycles: Cycle[] = await cyclesRes.json();
        const allTasks: Task[] = await tasksRes.json();
        const found = allCycles.find((c) => c.id === params.id);
        setCycle(found || null);
        if (found) {
          setTasks(allTasks.filter((t) => t.cycle === found.title));
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [params.id]);

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
              <div>
                <span
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-sm",
                    cycle.status === "active"
                      ? "bg-linear-accent/10 text-linear-accent"
                      : "bg-linear-surface-hover text-linear-text-secondary"
                  )}
                >
                  {CYCLE_STATUS_LABELS[cycle.status]}
                </span>
                <div className="flex items-center gap-2 text-xs text-linear-text-tertiary mt-2">
                  <Calendar className="w-3.5 h-3.5" />
                  {cycle.start_date} → {cycle.end_date}
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
          <h3 className="text-xs font-medium text-linear-text-tertiary uppercase tracking-wider mb-3">
            Issues ({tasks.length})
          </h3>
          <div className="linear-card overflow-hidden">
            {tasks.length === 0 ? (
              <div className="p-8 text-center text-sm text-linear-text-tertiary">
                No issues in this cycle
              </div>
            ) : (
              tasks.map((task, i) => (
                <Link
                  key={task.id}
                  href={`/issues/${task.id}`}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 linear-hover group",
                    i < tasks.length - 1 && "border-b border-linear-border"
                  )}
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
