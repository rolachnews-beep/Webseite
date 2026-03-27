"use client";

import { create } from "zustand";
import { Actor } from "../types/actor";

interface ActorStore {
  actors: Actor[];
  loading: boolean;
  setActors: (actors: Actor[]) => void;
  setLoading: (loading: boolean) => void;
  updateActorStatus: (id: string, status: Actor["status"]) => void;
}

export const useActorStore = create<ActorStore>((set) => ({
  actors: [],
  loading: true,
  setActors: (actors) => set({ actors }),
  setLoading: (loading) => set({ loading }),
  updateActorStatus: (id, status) =>
    set((state) => ({
      actors: state.actors.map((a) => (a.id === id ? { ...a, status } : a)),
    })),
}));
