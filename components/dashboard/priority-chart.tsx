"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
  CartesianGrid,
} from "recharts";
import { PRIORITY_COLORS } from "@/lib/constants";
import { PRIORITY_LABELS, type TaskPriority } from "@/lib/types/task";
import type { Task } from "@/lib/types/task";

interface PriorityChartProps {
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

export function PriorityChart({ tasks }: PriorityChartProps) {
  const data = (Object.keys(PRIORITY_COLORS) as TaskPriority[]).map(
    (priority) => ({
      name: PRIORITY_LABELS[priority],
      value: tasks.filter((t) => t.priority === priority).length,
      color: PRIORITY_COLORS[priority],
    })
  );

  return (
    <div className="bg-linear-surface border border-linear-border/60 rounded-lg p-5">
      <h3 className="text-sm font-medium text-linear-text-primary mb-4">
        Priority Distribution
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" barCategoryGap={8}>
          <CartesianGrid
            horizontal={false}
            vertical={true}
            stroke="#1a1a1e"
            strokeDasharray="none"
          />
          <XAxis
            type="number"
            tick={{ fill: "#3a3a40", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: "#8a8a8e", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={80}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            cursor={{ fill: "#1a1a1e40" }}
            itemStyle={{ color: "#d4d4d8" }}
          />
          <Bar
            dataKey="value"
            radius={[0, 4, 4, 0]}
            barSize={24}
            animationDuration={600}
            animationEasing="ease-out"
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
