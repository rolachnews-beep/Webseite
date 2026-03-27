"use client";

import { useState, useMemo, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Task, TaskStatus, STATUS_ORDER, STATUS_LABELS } from "@/lib/types/task";
import { BoardColumn } from "./board-column";
import { BoardCard } from "./board-card";

interface BoardViewProps {
  tasks: Task[];
  updateTask: (task: Task, updates: Partial<Task>) => Promise<void>;
}

const BOARD_STATUSES: TaskStatus[] = STATUS_ORDER.filter((s): s is Exclude<TaskStatus, "cancelled"> => s !== "cancelled");

export function BoardView({ tasks, updateTask }: BoardViewProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const tasksByStatus = useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    BOARD_STATUSES.forEach((status) => {
      grouped[status] = [];
    });
    tasks.forEach((task) => {
      if (grouped[task.status]) {
        grouped[task.status].push(task);
      }
    });
    return grouped;
  }, [tasks]);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const taskId = event.active.id as string;
      const task = tasks.find((t) => t.id === taskId);
      if (task) setActiveTask(task);
    },
    [tasks]
  );

  const handleDragOver = useCallback((event: DragOverEvent) => {
    // Visual feedback is handled by useDroppable isOver state
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveTask(null);
      const { active, over } = event;

      if (!over) return;

      const taskId = active.id as string;
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      // Determine the target status: either the droppable column id
      // or the status of the task we dropped onto
      let newStatus: TaskStatus | undefined;

      if (BOARD_STATUSES.includes(over.id as TaskStatus)) {
        newStatus = over.id as TaskStatus;
      } else {
        // Dropped onto another task card - find that task's status
        const overTask = tasks.find((t) => t.id === over.id);
        if (overTask) {
          newStatus = overTask.status;
        }
      }

      if (newStatus && newStatus !== task.status) {
        updateTask(task, { status: newStatus });
      }
    },
    [tasks, updateTask]
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-2 p-6 h-full min-w-min">
          {BOARD_STATUSES.map((status) => (
            <BoardColumn
              key={status}
              status={status}
              tasks={tasksByStatus[status] || []}
              title={STATUS_LABELS[status]}
            />
          ))}
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeTask ? (
          <div className="w-[300px]">
            <BoardCard task={activeTask} isDragOverlay />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
