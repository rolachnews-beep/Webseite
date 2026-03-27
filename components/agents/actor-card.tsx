"use client";

import { Actor, ACTOR_RUNTIME_LABELS, ACTOR_STATUS_LABELS } from "@/lib/types/actor";
import { cn } from "@/lib/utils";
import { Bot, User, Cpu, Clock, Wrench, Zap } from "lucide-react";

const STATUS_COLORS: Record<Actor["status"], string> = {
  idle: "#27ae60",
  working: "#f2c94c",
  offline: "#6b7280",
};

interface ActorCardProps {
  actor: Actor;
  currentTaskTitle?: string;
}

export function ActorCard({ actor, currentTaskTitle }: ActorCardProps) {
  const isAgent = actor.kind === "agent";
  const Icon = isAgent ? Bot : User;

  const timeSinceHeartbeat = actor.last_heartbeat
    ? getTimeSince(actor.last_heartbeat)
    : "Unknown";

  return (
    <div className="linear-card p-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "w-8 h-8 rounded-md flex items-center justify-center",
              isAgent ? "bg-purple-500/20" : "bg-blue-500/20"
            )}
          >
            <Icon
              className={cn(
                "w-4 h-4",
                isAgent ? "text-purple-400" : "text-blue-400"
              )}
            />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-linear-text-primary">
              {actor.name}
            </h3>
            <span className="text-2xs text-linear-text-tertiary">
              {ACTOR_RUNTIME_LABELS[actor.runtime]}
            </span>
          </div>
        </div>

        {/* Status badge */}
        <div className="flex items-center gap-1.5">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: STATUS_COLORS[actor.status] }}
          />
          <span
            className="text-2xs font-medium"
            style={{ color: STATUS_COLORS[actor.status] }}
          >
            {ACTOR_STATUS_LABELS[actor.status]}
          </span>
        </div>
      </div>

      {/* Current task */}
      {actor.current_task && (
        <div className="mb-3 px-2 py-1.5 rounded-sm bg-linear-surface-hover">
          <div className="flex items-center gap-1 mb-0.5">
            <Zap className="w-3 h-3 text-yellow-400" />
            <span className="text-2xs text-linear-text-tertiary">
              Working on
            </span>
          </div>
          <span className="text-xs text-linear-text-primary font-medium">
            {currentTaskTitle || actor.current_task}
          </span>
        </div>
      )}

      {/* Capabilities */}
      <div className="mb-3">
        <div className="flex items-center gap-1 mb-1.5">
          <Wrench className="w-3 h-3 text-linear-text-tertiary" />
          <span className="text-2xs text-linear-text-tertiary">
            Capabilities
          </span>
        </div>
        <div className="flex flex-wrap gap-1">
          {actor.capabilities.map((cap) => (
            <span
              key={cap}
              className="text-2xs px-1.5 py-0.5 rounded-sm bg-linear-accent/10 text-linear-accent"
            >
              {cap}
            </span>
          ))}
        </div>
      </div>

      {/* Tools */}
      <div className="mb-3">
        <div className="flex items-center gap-1 mb-1.5">
          <Cpu className="w-3 h-3 text-linear-text-tertiary" />
          <span className="text-2xs text-linear-text-tertiary">Tools</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {actor.tools.map((tool) => (
            <span
              key={tool}
              className="text-2xs px-1.5 py-0.5 rounded-sm bg-linear-surface-hover text-linear-text-secondary"
            >
              {tool}
            </span>
          ))}
        </div>
      </div>

      {/* Heartbeat */}
      <div className="flex items-center gap-1 pt-2 border-t border-linear-border">
        <Clock className="w-3 h-3 text-linear-text-tertiary" />
        <span className="text-2xs text-linear-text-tertiary">
          Last seen {timeSinceHeartbeat}
        </span>
      </div>
    </div>
  );
}

function getTimeSince(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
