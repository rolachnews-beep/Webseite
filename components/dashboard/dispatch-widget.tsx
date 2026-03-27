"use client";

import { Task } from "@/lib/types/task";
import { Actor } from "@/lib/types/actor";
import { cn } from "@/lib/utils";
import { Bot, User, Inbox, CheckCircle, Clock, ArrowRight } from "lucide-react";

interface DispatchWidgetProps {
  tasks: Task[];
  actors: Actor[];
}

export function DispatchWidget({ tasks, actors }: DispatchWidgetProps) {
  const unclaimed = tasks.filter(
    (t) => !t.claimed_by && t.status !== "done" && t.status !== "cancelled"
  );
  const claimed = tasks.filter(
    (t) => t.claimed_by && t.status !== "done" && t.status !== "cancelled"
  );
  const completedToday = tasks.filter((t) => {
    if (t.status !== "done") return false;
    const today = new Date().toISOString().split("T")[0];
    return t.updated === today;
  });

  const workingActors = actors.filter((a) => a.status === "working");
  const idleActors = actors.filter((a) => a.status === "idle");

  function getActorName(actorId: string): string {
    const actor = actors.find((a) => a.id === actorId);
    return actor?.name || actorId;
  }

  function getActorKind(actorId: string): Actor["kind"] {
    const actor = actors.find((a) => a.id === actorId);
    return actor?.kind || "human";
  }

  return (
    <div className="linear-card p-4">
      <h3 className="text-sm font-semibold text-linear-text-primary mb-3">
        Task Dispatch
      </h3>

      {/* Queue stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-linear-surface-hover rounded-sm p-2 text-center">
          <Inbox className="w-3.5 h-3.5 text-blue-400 mx-auto mb-1" />
          <div className="text-lg font-semibold text-linear-text-primary">
            {unclaimed.length}
          </div>
          <div className="text-2xs text-linear-text-tertiary">Unclaimed</div>
        </div>
        <div className="bg-linear-surface-hover rounded-sm p-2 text-center">
          <Clock className="w-3.5 h-3.5 text-yellow-400 mx-auto mb-1" />
          <div className="text-lg font-semibold text-linear-text-primary">
            {claimed.length}
          </div>
          <div className="text-2xs text-linear-text-tertiary">In Progress</div>
        </div>
        <div className="bg-linear-surface-hover rounded-sm p-2 text-center">
          <CheckCircle className="w-3.5 h-3.5 text-green-400 mx-auto mb-1" />
          <div className="text-lg font-semibold text-linear-text-primary">
            {completedToday.length}
          </div>
          <div className="text-2xs text-linear-text-tertiary">Done Today</div>
        </div>
      </div>

      {/* Active assignments */}
      {claimed.length > 0 && (
        <div className="mb-3">
          <div className="text-2xs text-linear-text-tertiary uppercase tracking-wider mb-2">
            Active Assignments
          </div>
          <div className="space-y-1.5">
            {claimed.slice(0, 4).map((task) => {
              const isAgent = getActorKind(task.claimed_by) === "agent";
              const ActorIcon = isAgent ? Bot : User;
              return (
                <div
                  key={task.id}
                  className="flex items-center gap-2 text-xs"
                >
                  <ActorIcon
                    className={cn(
                      "w-3 h-3 flex-shrink-0",
                      isAgent ? "text-purple-400" : "text-blue-400"
                    )}
                  />
                  <span className="text-linear-text-secondary truncate flex-1">
                    {getActorName(task.claimed_by)}
                  </span>
                  <ArrowRight className="w-3 h-3 text-linear-text-tertiary flex-shrink-0" />
                  <span className="text-linear-text-primary truncate flex-1 font-medium">
                    {task.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Actor availability */}
      <div className="pt-3 border-t border-linear-border">
        <div className="text-2xs text-linear-text-tertiary uppercase tracking-wider mb-2">
          Availability
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-green-400">
            {idleActors.length} idle
          </span>
          <span className="text-yellow-400">
            {workingActors.length} working
          </span>
          <span className="text-gray-500">
            {actors.filter((a) => a.status === "offline").length} offline
          </span>
        </div>
      </div>
    </div>
  );
}
