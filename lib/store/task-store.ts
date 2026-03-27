"use client";

import { create } from "zustand";
import { Task, TaskStatus } from "../types/task";
import { FilterState, DEFAULT_FILTERS, SortState, GroupByField } from "../types/filters";

interface TaskStore {
  tasks: Task[];
  loading: boolean;
  filters: FilterState;
  sort: SortState;
  groupBy: GroupByField;
  selectedTasks: string[];
  setTasks: (tasks: Task[]) => void;
  setLoading: (loading: boolean) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
  setSort: (sort: SortState) => void;
  setGroupBy: (groupBy: GroupByField) => void;
  toggleTaskSelection: (id: string) => void;
  clearSelection: () => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
}

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],
  loading: true,
  filters: DEFAULT_FILTERS,
  sort: { field: "priority", direction: "asc" },
  groupBy: "status",
  selectedTasks: [],

  setTasks: (tasks) => set({ tasks }),
  setLoading: (loading) => set({ loading }),

  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),
  resetFilters: () => set({ filters: DEFAULT_FILTERS }),

  setSort: (sort) => set({ sort }),
  setGroupBy: (groupBy) => set({ groupBy }),

  toggleTaskSelection: (id) =>
    set((state) => ({
      selectedTasks: state.selectedTasks.includes(id)
        ? state.selectedTasks.filter((t) => t !== id)
        : [...state.selectedTasks, id],
    })),
  clearSelection: () => set({ selectedTasks: [] }),

  updateTaskStatus: (id, status) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, status } : t)),
    })),
}));
