"use client";

import { create } from "zustand";
import { Project } from "../types/project";
import { Cycle } from "../types/cycle";

interface ProjectStore {
  projects: Project[];
  cycles: Cycle[];
  loading: boolean;
  setProjects: (projects: Project[]) => void;
  setCycles: (cycles: Cycle[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useProjectStore = create<ProjectStore>((set) => ({
  projects: [],
  cycles: [],
  loading: true,
  setProjects: (projects) => set({ projects }),
  setCycles: (cycles) => set({ cycles }),
  setLoading: (loading) => set({ loading }),
}));
