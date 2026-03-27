"use client";

import { useEffect, useState, useCallback } from "react";
import { Header } from "@/components/layout/header";
import { ActorCard } from "@/components/agents/actor-card";
import { CapabilityMatrix } from "@/components/agents/capability-matrix";
import { Actor } from "@/lib/types/actor";
import { Task } from "@/lib/types/task";
import { useEvents } from "@/lib/hooks/use-events";
import { Bot, User, Zap, WifiOff } from "lucide-react";

export default function AgentsPage() {
  const [actors, setActors] = useState<Actor[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "agent" | "human">("all");

  const fetchData = useCallback(async () => {
    try {
      const [actorsRes, tasksRes] = await Promise.all([
        fetch("/api/vault/actors"),
        fetch("/api/vault/tasks"),
      ]);
      setActors(await actorsRes.json());
      setTasks(await tasksRes.json());
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Live reload when vault files change
  useEvents({
    onActorChange: fetchData,
    onTaskChange: fetchData,
  });

  const filteredActors = actors.filter(
    (a) => filter === "all" || a.kind === filter
  );

  const stats = {
    total: actors.length,
    agents: actors.filter((a) => a.kind === "agent").length,
    humans: actors.filter((a) => a.kind === "human").length,
    working: actors.filter((a) => a.status === "working").length,
    idle: actors.filter((a) => a.status === "idle").length,
    offline: actors.filter((a) => a.status === "offline").length,
  };

  function getTaskTitle(taskId: string): string | undefined {
    const task = tasks.find((t) => t.id === taskId);
    return task?.title;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-linear-text-tertiary text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <Header
        title="Agents"
        subtitle={`${stats.total} actors — ${stats.working} working`}
      >
        {/* Filter buttons */}
        <div className="flex items-center gap-1">
          {(["all", "agent", "human"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-2xs px-2 py-1 rounded-sm transition-colors ${
                filter === f
                  ? "bg-linear-surface text-linear-text-primary"
                  : "text-linear-text-tertiary hover:text-linear-text-secondary hover:bg-linear-surface-hover"
              }`}
            >
              {f === "all" ? "All" : f === "agent" ? "Agents" : "Humans"}
            </button>
          ))}
        </div>
      </Header>

      <div className="flex-1 overflow-y-auto p-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 max-w-4xl">
          <div className="linear-card p-3">
            <div className="flex items-center gap-2 mb-1">
              <Bot className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-2xs text-linear-text-tertiary">Agents</span>
            </div>
            <span className="text-lg font-semibold text-linear-text-primary">
              {stats.agents}
            </span>
          </div>
          <div className="linear-card p-3">
            <div className="flex items-center gap-2 mb-1">
              <User className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-2xs text-linear-text-tertiary">Humans</span>
            </div>
            <span className="text-lg font-semibold text-linear-text-primary">
              {stats.humans}
            </span>
          </div>
          <div className="linear-card p-3">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              <span className="text-2xs text-linear-text-tertiary">Working</span>
            </div>
            <span className="text-lg font-semibold text-linear-text-primary">
              {stats.working}
            </span>
          </div>
          <div className="linear-card p-3">
            <div className="flex items-center gap-2 mb-1">
              <WifiOff className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-2xs text-linear-text-tertiary">Offline</span>
            </div>
            <span className="text-lg font-semibold text-linear-text-primary">
              {stats.offline}
            </span>
          </div>
        </div>

        {/* Actor Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 max-w-6xl">
          {filteredActors.map((actor) => (
            <ActorCard
              key={actor.id}
              actor={actor}
              currentTaskTitle={
                actor.current_task
                  ? getTaskTitle(actor.current_task)
                  : undefined
              }
            />
          ))}
        </div>

        {/* Capability Matrix */}
        <div className="max-w-6xl">
          <CapabilityMatrix actors={actors} />
        </div>
      </div>
    </div>
  );
}
