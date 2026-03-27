"use client";

import { useEffect, useRef, useCallback } from "react";

export interface VaultEvent {
  type: "connected" | "changes" | "heartbeat";
  timestamp: string;
  changes?: { type: string; dir: string; file: string }[];
}

interface UseEventsOptions {
  onTaskChange?: () => void;
  onActorChange?: () => void;
  onProjectChange?: () => void;
  onCycleChange?: () => void;
  onAnyChange?: (event: VaultEvent) => void;
  enabled?: boolean;
}

/**
 * Hook to subscribe to vault file change events via SSE.
 * Automatically reconnects on disconnection.
 */
export function useEvents(options: UseEventsOptions = {}) {
  const {
    onTaskChange,
    onActorChange,
    onProjectChange,
    onCycleChange,
    onAnyChange,
    enabled = true,
  } = options;

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const connect = useCallback(() => {
    if (!enabled) return;

    const es = new EventSource("/api/events");
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      try {
        const data: VaultEvent = JSON.parse(event.data);

        if (data.type === "changes" && data.changes) {
          const dirs = new Set(data.changes.map((c) => c.dir));

          if (dirs.has("tasks")) onTaskChange?.();
          if (dirs.has("actors")) onActorChange?.();
          if (dirs.has("projects")) onProjectChange?.();
          if (dirs.has("cycles")) onCycleChange?.();

          onAnyChange?.(data);
        }
      } catch {
        // Ignore parse errors
      }
    };

    es.onerror = () => {
      es.close();
      // Reconnect after 3 seconds
      reconnectTimeoutRef.current = setTimeout(connect, 3000);
    };
  }, [enabled, onTaskChange, onActorChange, onProjectChange, onCycleChange, onAnyChange]);

  useEffect(() => {
    connect();

    return () => {
      eventSourceRef.current?.close();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);
}
