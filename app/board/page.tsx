"use client";

import { useMemo } from "react";
import { Header } from "@/components/layout/header";
import { BoardView } from "@/components/board/board-view";
import { useTasks, filterTasks } from "@/lib/hooks/use-tasks";

export default function BoardPage() {
  const { tasks, loading, filters, updateTask } = useTasks();

  const filteredTasks = useMemo(
    () => filterTasks(tasks, filters),
    [tasks, filters]
  );

  return (
    <div className="flex flex-col h-full">
      <Header title="Board" subtitle={loading ? undefined : `${filteredTasks.length} issues`} />

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-5 h-5 border-2 border-linear-accent border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-linear-text-tertiary">Loading board...</span>
          </div>
        </div>
      ) : (
        <BoardView tasks={filteredTasks} updateTask={updateTask} />
      )}
    </div>
  );
}
