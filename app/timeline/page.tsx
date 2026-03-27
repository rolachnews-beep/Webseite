"use client";

import { useEffect, useState, useMemo } from "react";
import { Header } from "@/components/layout/header";
import { Project, PROJECT_HEALTH_LABELS } from "@/lib/types/project";
import { HEALTH_COLORS } from "@/lib/constants";
import { Task } from "@/lib/types/task";
import {
  differenceInDays,
  parseISO,
  format,
  startOfWeek,
  addWeeks,
  addMonths,
  startOfMonth,
  isWithinInterval,
  isBefore,
  isAfter,
} from "date-fns";
import { cn } from "@/lib/utils";
import { ZoomIn, ZoomOut } from "lucide-react";

type TimeScale = "weeks" | "months";

export default function TimelinePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [scale, setScale] = useState<TimeScale>("weeks");

  useEffect(() => {
    async function fetchData() {
      try {
        const [projectsRes, tasksRes] = await Promise.all([
          fetch("/api/vault/projects"),
          fetch("/api/vault/tasks"),
        ]);
        setProjects(await projectsRes.json());
        setTasks(await tasksRes.json());
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const { timeRange, columns } = useMemo(() => {
    const allDates = projects.flatMap((p) =>
      [p.start_date, p.target_date].filter(Boolean).map((d) => parseISO(d!))
    );
    if (allDates.length === 0) {
      const now = new Date();
      return {
        timeRange: { start: now, end: addMonths(now, 3) },
        columns: [] as { date: Date; label: string }[],
      };
    }

    const min = new Date(Math.min(...allDates.map((d) => d.getTime())));
    const max = new Date(Math.max(...allDates.map((d) => d.getTime())));
    const start = scale === "weeks" ? startOfWeek(addWeeks(min, -1)) : startOfMonth(addMonths(min, -1));
    const end = scale === "weeks" ? addWeeks(max, 2) : addMonths(max, 2);

    const cols: { date: Date; label: string }[] = [];
    let current = start;
    while (isBefore(current, end)) {
      cols.push({
        date: current,
        label: scale === "weeks" ? format(current, "MMM d") : format(current, "MMM yyyy"),
      });
      current = scale === "weeks" ? addWeeks(current, 1) : addMonths(current, 1);
    }

    return { timeRange: { start, end }, columns: cols };
  }, [projects, scale]);

  const totalDays = differenceInDays(timeRange.end, timeRange.start) || 1;
  const colWidth = scale === "weeks" ? 100 : 140;
  const totalWidth = columns.length * colWidth;
  const today = new Date();
  const todayOffset = (differenceInDays(today, timeRange.start) / totalDays) * totalWidth;

  function getBarStyle(startDate?: string, endDate?: string) {
    if (!startDate) return { left: 0, width: 0, visible: false };
    const start = parseISO(startDate);
    const end = endDate ? parseISO(endDate) : addMonths(start, 2);
    const left = (differenceInDays(start, timeRange.start) / totalDays) * totalWidth;
    const width = Math.max((differenceInDays(end, start) / totalDays) * totalWidth, 40);
    return { left, width, visible: true };
  }

  function getProjectProgress(title: string) {
    const pts = tasks.filter((t) => t.project === title);
    if (pts.length === 0) return 0;
    return Math.round((pts.filter((t) => t.status === "done").length / pts.length) * 100);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-linear-text-tertiary text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <Header title="Timeline" subtitle={`${projects.length} projects`}>
        <div className="flex items-center gap-1 bg-linear-surface border border-linear-border rounded-sm">
          <button
            onClick={() => setScale("weeks")}
            className={cn(
              "px-2 py-1 text-xs rounded-sm transition-colors",
              scale === "weeks"
                ? "bg-linear-surface-hover text-linear-text-primary"
                : "text-linear-text-tertiary hover:text-linear-text-secondary"
            )}
          >
            Weeks
          </button>
          <button
            onClick={() => setScale("months")}
            className={cn(
              "px-2 py-1 text-xs rounded-sm transition-colors",
              scale === "months"
                ? "bg-linear-surface-hover text-linear-text-primary"
                : "text-linear-text-tertiary hover:text-linear-text-secondary"
            )}
          >
            Months
          </button>
        </div>
      </Header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left panel - project names */}
        <div className="w-[220px] flex-shrink-0 border-r border-linear-border">
          <div className="h-10 border-b border-linear-border" />
          {projects.map((project) => (
            <div
              key={project.id}
              className="flex items-center gap-2 h-12 px-4 border-b border-linear-border"
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: HEALTH_COLORS[project.health] }}
              />
              <span className="text-sm text-linear-text-primary truncate">
                {project.title}
              </span>
            </div>
          ))}
        </div>

        {/* Timeline area */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div style={{ width: totalWidth, minWidth: "100%" }} className="relative">
            {/* Column headers */}
            <div className="flex h-10 border-b border-linear-border sticky top-0 bg-linear-bg z-10">
              {columns.map((col, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 flex items-center px-2 text-2xs text-linear-text-tertiary border-r border-linear-border"
                  style={{ width: colWidth }}
                >
                  {col.label}
                </div>
              ))}
            </div>

            {/* Grid lines */}
            <div className="absolute inset-0 top-10 pointer-events-none">
              {columns.map((_, i) => (
                <div
                  key={i}
                  className="absolute top-0 bottom-0 border-r border-linear-border/30"
                  style={{ left: i * colWidth }}
                />
              ))}
            </div>

            {/* Today line */}
            {todayOffset > 0 && todayOffset < totalWidth && (
              <div
                className="absolute top-0 bottom-0 w-px bg-priority-urgent z-20"
                style={{ left: todayOffset }}
              >
                <div className="absolute -top-0 left-1/2 -translate-x-1/2 bg-priority-urgent text-white text-[9px] px-1 rounded-sm">
                  Today
                </div>
              </div>
            )}

            {/* Project bars */}
            {projects.map((project) => {
              const bar = getBarStyle(project.start_date, project.target_date);
              const progress = getProjectProgress(project.title);

              return (
                <div key={project.id} className="relative h-12 border-b border-linear-border">
                  {bar.visible && (
                    <div
                      className="absolute top-2 h-8 rounded-sm overflow-hidden group cursor-pointer"
                      style={{
                        left: bar.left,
                        width: bar.width,
                        backgroundColor: HEALTH_COLORS[project.health] + "20",
                        border: `1px solid ${HEALTH_COLORS[project.health]}40`,
                      }}
                    >
                      {/* Progress fill */}
                      <div
                        className="absolute inset-0 rounded-sm"
                        style={{
                          width: `${progress}%`,
                          backgroundColor: HEALTH_COLORS[project.health] + "40",
                        }}
                      />
                      <div className="relative px-2 flex items-center h-full">
                        <span className="text-2xs font-medium text-linear-text-primary truncate">
                          {project.title}
                        </span>
                        <span className="ml-auto text-2xs text-linear-text-tertiary">
                          {progress}%
                        </span>
                      </div>

                      {/* Tooltip */}
                      <div className="absolute bottom-full left-0 mb-1 hidden group-hover:block z-30">
                        <div className="bg-linear-surface border border-linear-border rounded-sm px-3 py-2 shadow-lg text-xs whitespace-nowrap">
                          <div className="font-medium text-linear-text-primary">{project.title}</div>
                          <div className="text-linear-text-tertiary mt-1">
                            {project.start_date} → {project.target_date}
                          </div>
                          <div className="text-linear-text-tertiary">
                            Progress: {progress}%
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
