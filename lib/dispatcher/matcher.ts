import { Task } from "../types/task";
import { Actor } from "../types/actor";

export interface MatchResult {
  task: Task;
  matchedActors: Actor[];
  score: number;
}

/**
 * Check if an actor has all required capabilities for a task.
 */
export function actorMatchesTask(actor: Actor, task: Task): boolean {
  // Check actor_type constraint
  if (task.actor_type !== "any" && task.actor_type !== actor.kind) {
    return false;
  }

  // Check capabilities: actor must have ALL required capabilities
  if (task.required_capabilities.length === 0) {
    return true;
  }

  return task.required_capabilities.every((cap) =>
    actor.capabilities.includes(cap)
  );
}

/**
 * Calculate a match score between an actor and a task.
 * Higher score = better match.
 */
export function calculateMatchScore(actor: Actor, task: Task): number {
  if (!actorMatchesTask(actor, task)) return 0;

  let score = 1;

  // Bonus for exact capability match (specialist vs generalist)
  const capOverlap = task.required_capabilities.filter((cap) =>
    actor.capabilities.includes(cap)
  ).length;
  if (task.required_capabilities.length > 0) {
    score += capOverlap / actor.capabilities.length;
  }

  // Bonus for idle actors
  if (actor.status === "idle") score += 2;

  // Priority bonus
  const priorityScores: Record<string, number> = {
    urgent: 4,
    high: 3,
    medium: 2,
    low: 1,
    none: 0,
  };
  score += priorityScores[task.priority] || 0;

  return score;
}

/**
 * Find available tasks that match a specific actor's capabilities.
 */
export function findTasksForActor(actor: Actor, tasks: Task[]): Task[] {
  return tasks
    .filter(
      (task) =>
        !task.claimed_by &&
        task.status !== "done" &&
        task.status !== "cancelled" &&
        actorMatchesTask(actor, task)
    )
    .sort((a, b) => {
      const scoreA = calculateMatchScore(actor, a);
      const scoreB = calculateMatchScore(actor, b);
      return scoreB - scoreA;
    });
}

/**
 * Find the best actor for a specific task.
 */
export function findBestActorForTask(
  task: Task,
  actors: Actor[]
): Actor | null {
  const candidates = actors
    .filter(
      (actor) => actor.status === "idle" && actorMatchesTask(actor, task)
    )
    .map((actor) => ({
      actor,
      score: calculateMatchScore(actor, task),
    }))
    .sort((a, b) => b.score - a.score);

  return candidates.length > 0 ? candidates[0].actor : null;
}

/**
 * Auto-dispatch: match all unclaimed tasks to available actors.
 * Returns a list of recommended assignments.
 */
export function autoDispatch(
  tasks: Task[],
  actors: Actor[]
): { task: Task; actor: Actor; score: number }[] {
  const unclaimedTasks = tasks.filter(
    (t) =>
      !t.claimed_by &&
      t.status !== "done" &&
      t.status !== "cancelled" &&
      t.dispatch_mode === "push"
  );

  const idleActors = new Set(
    actors.filter((a) => a.status === "idle").map((a) => a.id)
  );

  const assignments: { task: Task; actor: Actor; score: number }[] = [];

  // Sort tasks by priority (urgent first)
  const sortedTasks = [...unclaimedTasks].sort((a, b) => {
    const order = ["urgent", "high", "medium", "low", "none"];
    return order.indexOf(a.priority) - order.indexOf(b.priority);
  });

  for (const task of sortedTasks) {
    const availableActors = actors.filter((a) => idleActors.has(a.id));
    const bestActor = findBestActorForTask(task, availableActors);

    if (bestActor) {
      assignments.push({
        task,
        actor: bestActor,
        score: calculateMatchScore(bestActor, task),
      });
      idleActors.delete(bestActor.id);
    }
  }

  return assignments;
}
