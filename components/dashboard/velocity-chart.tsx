"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { Task } from "@/lib/types/task";

interface VelocityChartProps {
  tasks: Task[];
}

const TOOLTIP_STYLE = {
  backgroundColor: "#16161a",
  border: "1px solid #26262a",
  borderRadius: "8px",
  fontSize: "12px",
  color: "#d4d4d8",
  padding: "8px 12px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
};

function getWeekLabel(date: Date): string {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  const month = start.toLocaleString("en", { month: "short" });
  return `${month} ${start.getDate()}`;
}

function getWeekKey(date: Date): string {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  return start.toISOString().slice(0, 10);
}

export function VelocityChart({ tasks }: VelocityChartProps) {
  const data = useMemo(() => {
    const doneTasks = tasks.filter((t) => t.status === "done" && t.updated);
    const weekMap = new Map<string, { key: string; label: string; completed: number }>();

    doneTasks.forEach((task) => {
      const date = new Date(task.updated);
      if (isNaN(date.getTime())) return;
      const key = getWeekKey(date);
      const label = getWeekLabel(date);
      if (!weekMap.has(key)) {
        weekMap.set(key, { key, label, completed: 0 });
      }
      weekMap.get(key)!.completed += 1;
    });

    return Array.from(weekMap.values())
      .sort((a, b) => a.key.localeCompare(b.key))
      .slice(-8);
  }, [tasks]);

  if (data.length === 0) {
    return (
      <div className="bg-linear-surface border border-linear-border/60 rounded-lg p-5">
        <h3 className="text-sm font-medium text-linear-text-primary mb-4">
          Velocity
        </h3>
        <div className="flex items-center justify-center h-[220px] text-sm text-linear-text-tertiary">
          No completed tasks yet
        </div>
      </div>
    );
  }

  return (
    <div className="bg-linear-surface border border-linear-border/60 rounded-lg p-5">
      <h3 className="text-sm font-medium text-linear-text-primary mb-4">
        Velocity
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="velocityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5e6ad2" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#5e6ad2" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            horizontal={true}
            vertical={false}
            stroke="#1a1a1e"
            strokeDasharray="none"
          />
          <XAxis
            dataKey="label"
            tick={{ fill: "#3a3a40", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#3a3a40", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
            width={30}
          />
          <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={{ color: "#d4d4d8" }} />
          <Area
            type="monotone"
            dataKey="completed"
            stroke="#5e6ad2"
            strokeWidth={1.5}
            fill="url(#velocityGradient)"
            dot={false}
            activeDot={{
              r: 4,
              fill: "#5e6ad2",
              stroke: "#16161a",
              strokeWidth: 2,
              style: { filter: "drop-shadow(0 0 4px rgba(94,106,210,0.4))" },
            }}
            animationDuration={600}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
