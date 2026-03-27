"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Task, TaskStatus } from "@/lib/types/task";
import { STATUS_COLORS } from "@/lib/constants";
import { BoardCard } from "./board-card";
import { cn } from "@/lib/utils";

interface BoardColumnProps {
  status: TaskStatus;
  tasks: Task[];
  title: string;
}

export function BoardColumn({ status, tasks, title }: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const statusColor = STATUS_COLORS[status];
  const taskIds = tasks.map((t) => t.id);

  return (
    <div
      className={cn(
        "flex flex-col min-w-[280px] max-w-[320px] w-[300px] flex-shrink-0"
      )}
    >
      {/* Column header */}
      <div className="flex items-center gap-2 px-2 py-3">
        <div
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: statusColor }}
        />
        <span className="text-xs font-semibold text-linear-text-primary uppercase tracking-wide">
          {title}
        </span>
        <span className="text-2xs text-linear-text-tertiary font-medium ml-1">
          {tasks.length}
        </span>
      </div>

      {/* Droppable area */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 flex flex-col gap-1.5 px-1 pb-4 rounded-[6px] min-h-[200px] transition-colors",
          isOver && "bg-linear-accent/5"
        )}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <BoardCard key={task.id} task={task} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex-1 flex items-center justify-center min-h-[100px]">
            <span className="text-2xs text-linear-text-tertiary">No issues</span>
          </div>
        )}
      </div>
    </div>
  );
}
