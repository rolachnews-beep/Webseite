"use client";

import { useEffect, useCallback } from "react";
import { useProjectStore } from "../store/project-store";

export function useProjects() {
  const store = useProjectStore();

  const fetchProjects = useCallback(async () => {
    try {
      store.setLoading(true);
      const [projectsRes, cyclesRes] = await Promise.all([
        fetch("/api/vault/projects"),
        fetch("/api/vault/cycles"),
      ]);
      const projects = await projectsRes.json();
      const cycles = await cyclesRes.json();
      store.setProjects(projects);
      store.setCycles(cycles);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      store.setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return { ...store, fetchProjects };
}
