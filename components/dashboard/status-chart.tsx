"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { STATUS_COLORS } from "@/lib/constants";
import { STATUS_LABELS, type TaskStatus } from "@/lib/types/task";
import type { Task } from "@/lib/types/task";

interface StatusChartProps {
  tasks: Task[];
}

export function StatusChart({ tasks }: StatusChartProps) {
  const data = (Object.keys(STATUS_COLORS) as TaskStatus[])
    .map((status) => ({
      name: STATUS_LABELS[status],
      value: tasks.filter((t) => t.status === status).length,
      color: STATUS_COLORS[status],
    }))
    .filter((d) => d.value > 0);

  if (data.length === 0) {
    return (
      <div className="bg-linear-surface border border-linear-border rounded-[6px] p-5">
        <h3 className="text-sm font-medium text-linear-text-primary mb-4">
          Status Distribution
        </h3>
        <div className="flex items-center justify-center h-[220px] text-sm text-linear-text-tertiary">
          No tasks found
        </div>
      </div>
    );
  }

  return (
    <div className="bg-linear-surface border border-linear-border rounded-[6px] p-5">
      <h3 className="text-sm font-medium text-linear-text-primary mb-4">
        Status Distribution
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#1b1b1f",
              border: "1px solid #2e2e32",
              borderRadius: "6px",
              fontSize: "12px",
              color: "#ededef",
            }}
            itemStyle={{ color: "#ededef" }}
          />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: "11px", color: "#8a8a8e" }}
            formatter={(value: string) => (
              <span className="text-linear-text-secondary text-[11px]">
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
