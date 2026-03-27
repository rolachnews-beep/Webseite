"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts";
import { PRIORITY_COLORS } from "@/lib/constants";
import { PRIORITY_LABELS, type TaskPriority } from "@/lib/types/task";
import type { Task } from "@/lib/types/task";

interface PriorityChartProps {
  tasks: Task[];
}

export function PriorityChart({ tasks }: PriorityChartProps) {
  const data = (Object.keys(PRIORITY_COLORS) as TaskPriority[]).map(
    (priority) => ({
      name: PRIORITY_LABELS[priority],
      value: tasks.filter((t) => t.priority === priority).length,
      color: PRIORITY_COLORS[priority],
    })
  );

  return (
    <div className="bg-linear-surface border border-linear-border rounded-[6px] p-5">
      <h3 className="text-sm font-medium text-linear-text-primary mb-4">
        Priority Distribution
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" barCategoryGap={6}>
          <XAxis
            type="number"
            tick={{ fill: "#5c5c60", fontSize: 11 }}
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
            contentStyle={{
              backgroundColor: "#1b1b1f",
              border: "1px solid #2e2e32",
              borderRadius: "6px",
              fontSize: "12px",
              color: "#ededef",
            }}
            cursor={{ fill: "#2e2e3220" }}
          />
          <Bar dataKey="value" radius={[0, 3, 3, 0]} barSize={18}>
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
