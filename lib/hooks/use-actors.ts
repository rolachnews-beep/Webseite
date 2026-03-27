"use client";

import { useEffect, useCallback } from "react";
import { useActorStore } from "../store/actor-store";

export function useActors() {
  const store = useActorStore();

  const fetchActors = useCallback(async () => {
    try {
      store.setLoading(true);
      const res = await fetch("/api/vault/actors");
      const actors = await res.json();
      store.setActors(actors);
    } catch (error) {
      console.error("Failed to fetch actors:", error);
    } finally {
      store.setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActors();
  }, [fetchActors]);

  return { ...store, fetchActors };
}
