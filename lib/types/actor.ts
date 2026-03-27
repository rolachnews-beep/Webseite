export type ActorKind = "agent" | "human";

export type ActorRuntime = "claude-code" | "claude-cowork" | "human";

export type ActorStatus = "idle" | "working" | "offline";

export interface Actor {
  id: string;
  name: string;
  kind: ActorKind;
  runtime: ActorRuntime;
  status: ActorStatus;
  capabilities: string[];
  tools: string[];
  current_task: string;
  last_heartbeat: string;
  content: string;
  filePath: string;
}

export const ACTOR_KIND_LABELS: Record<ActorKind, string> = {
  agent: "Agent",
  human: "Human",
};

export const ACTOR_RUNTIME_LABELS: Record<ActorRuntime, string> = {
  "claude-code": "Claude Code",
  "claude-cowork": "Claude Cowork",
  human: "Human",
};

export const ACTOR_STATUS_LABELS: Record<ActorStatus, string> = {
  idle: "Idle",
  working: "Working",
  offline: "Offline",
};
