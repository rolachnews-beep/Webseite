"use client";

import { useEffect, useCallback } from "react";
import { useTaskStore } from "../store/task-store";
import { Task, TaskStatus, STATUS_ORDER, PRIORITY_ORDER } from "../types/task";
import { FilterState, SortState, GroupByField } from "../types/filters";

export function useTasks() {
  const store = useTaskStore();

  const fetchTasks = useCallback(async () => {
    try {
      store.setLoading(true);
      const res = await fetch("/api/vault/tasks");
      const tasks = await res.json();
      store.setTasks(tasks);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      store.setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const updateTask = async (
    task: Task,
    updates: Partial<Task>
  ) => {
    store.updateTaskStatus(task.id, (updates.status || task.status) as TaskStatus);
    try {
      await fetch("/api/vault/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filePath: task.filePath, updates }),
      });
    } catch (error) {
      console.error("Failed to update task:", error);
      fetchTasks();
    }
  };

  return { ...store, fetchTasks, updateTask };
}

export function filterTasks(tasks: Task[], filters: FilterState): Task[] {
  return tasks.filter((task) => {
    if (filters.status.length > 0 && !filters.status.includes(task.status))
      return false;
    if (filters.priority.length > 0 && !filters.priority.includes(task.priority))
      return false;
    if (filters.assignee.length > 0 && task.assignee && !filters.assignee.includes(task.assignee))
      return false;
    if (filters.project.length > 0 && task.project && !filters.project.includes(task.project))
      return false;
    if (filters.labels.length > 0 && !filters.labels.some((l) => task.labels.includes(l)))
      return false;
    if (filters.cycle.length > 0 && task.cycle && !filters.cycle.includes(task.cycle))
      return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      return (
        task.title.toLowerCase().includes(q) ||
        task.id.toLowerCase().includes(q) ||
        task.content.toLowerCase().includes(q)
      );
    }
    return true;
  });
}

export function sortTasks(tasks: Task[], sort: SortState): Task[] {
  return [...tasks].sort((a, b) => {
    const dir = sort.direction === "asc" ? 1 : -1;
    switch (sort.field) {
      case "status":
        return (STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status)) * dir;
      case "priority":
        return (PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority)) * dir;
      case "title":
        return a.title.localeCompare(b.title) * dir;
      case "assignee":
        return (a.assignee || "").localeCompare(b.assignee || "") * dir;
      case "due_date":
        return ((a.due_date || "9999") > (b.due_date || "9999") ? 1 : -1) * dir;
      case "created":
        return (a.created > b.created ? 1 : -1) * dir;
      case "updated":
        return (a.updated > b.updated ? 1 : -1) * dir;
      default:
        return 0;
    }
  });
}

export function groupTasks(
  tasks: Task[],
  groupBy: GroupByField
): { key: string; label: string; tasks: Task[] }[] {
  if (groupBy === "none") return [{ key: "all", label: "All Issues", tasks }];

  const groups = new Map<string, Task[]>();

  tasks.forEach((task) => {
    let key: string;
    switch (groupBy) {
      case "status":
        key = task.status;
        break;
      case "priority":
        key = task.priority;
        break;
      case "project":
        key = task.project || "No Project";
        break;
      case "assignee":
        key = task.assignee || "Unassigned";
        break;
      case "cycle":
        key = task.cycle || "No Cycle";
        break;
      default:
        key = "all";
    }
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(task);
  });

  return Array.from(groups.entries()).map(([key, tasks]) => ({
    key,
    label: key.charAt(0).toUpperCase() + key.slice(1).replace(/-/g, " "),
    tasks,
  }));
}
