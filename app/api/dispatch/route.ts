import { NextRequest, NextResponse } from "next/server";
import { readTasks } from "@/lib/vault/reader";
import { readActors } from "@/lib/vault/reader";
import { updateFrontmatter } from "@/lib/vault/writer";
import {
  findTasksForActor,
  autoDispatch,
  actorMatchesTask,
} from "@/lib/dispatcher/matcher";

/**
 * GET /api/dispatch?actor_id=xxx — Get available tasks for a specific actor
 * GET /api/dispatch?auto=true — Get auto-dispatch recommendations
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const actorId = searchParams.get("actor_id");
    const auto = searchParams.get("auto");
    const capabilities = searchParams.get("capabilities");

    const tasks = readTasks();
    const actors = readActors();

    if (auto === "true") {
      const assignments = autoDispatch(tasks, actors);
      return NextResponse.json({ assignments });
    }

    if (actorId) {
      const actor = actors.find((a) => a.id === actorId);
      if (!actor) {
        return NextResponse.json(
          { error: "Actor not found" },
          { status: 404 }
        );
      }
      const available = findTasksForActor(actor, tasks);
      return NextResponse.json({ tasks: available });
    }

    if (capabilities) {
      const caps = capabilities.split(",").map((c) => c.trim());
      const unclaimed = tasks.filter(
        (t) =>
          !t.claimed_by &&
          t.status !== "done" &&
          t.status !== "cancelled" &&
          (t.required_capabilities.length === 0 ||
            t.required_capabilities.every((rc) => caps.includes(rc)))
      );
      return NextResponse.json({ tasks: unclaimed });
    }

    // Default: return all unclaimed tasks
    const unclaimed = tasks.filter(
      (t) => !t.claimed_by && t.status !== "done" && t.status !== "cancelled"
    );
    return NextResponse.json({ tasks: unclaimed });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get dispatch data" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/dispatch — Dispatch actions: claim, release, complete
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, task_id, actor_id, result_summary } = body;

    const tasks = readTasks();
    const actors = readActors();

    const task = tasks.find((t) => t.id === task_id);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const actor = actors.find((a) => a.id === actor_id);
    if (!actor) {
      return NextResponse.json({ error: "Actor not found" }, { status: 404 });
    }

    switch (action) {
      case "claim": {
        if (task.claimed_by) {
          return NextResponse.json(
            { error: "Task already claimed", claimed_by: task.claimed_by },
            { status: 409 }
          );
        }

        if (!actorMatchesTask(actor, task)) {
          return NextResponse.json(
            { error: "Actor does not have required capabilities" },
            { status: 403 }
          );
        }

        // Update task
        updateFrontmatter(task.filePath, {
          claimed_by: actor_id,
          claimed_at: new Date().toISOString(),
          status: "in-progress",
        });

        // Update actor
        updateFrontmatter(actor.filePath, {
          status: "working",
          current_task: task_id,
          last_heartbeat: new Date().toISOString(),
        });

        return NextResponse.json({
          success: true,
          message: `Task ${task_id} claimed by ${actor_id}`,
        });
      }

      case "release": {
        if (task.claimed_by !== actor_id) {
          return NextResponse.json(
            { error: "Task not claimed by this actor" },
            { status: 403 }
          );
        }

        updateFrontmatter(task.filePath, {
          claimed_by: "",
          claimed_at: "",
          status: "todo",
        });

        updateFrontmatter(actor.filePath, {
          status: "idle",
          current_task: "",
          last_heartbeat: new Date().toISOString(),
        });

        return NextResponse.json({
          success: true,
          message: `Task ${task_id} released by ${actor_id}`,
        });
      }

      case "complete": {
        if (task.claimed_by !== actor_id) {
          return NextResponse.json(
            { error: "Task not claimed by this actor" },
            { status: 403 }
          );
        }

        updateFrontmatter(task.filePath, {
          status: "done",
          result_summary: result_summary || "",
        });

        updateFrontmatter(actor.filePath, {
          status: "idle",
          current_task: "",
          last_heartbeat: new Date().toISOString(),
        });

        return NextResponse.json({
          success: true,
          message: `Task ${task_id} completed by ${actor_id}`,
        });
      }

      default:
        return NextResponse.json(
          { error: "Invalid action. Use: claim, release, complete" },
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process dispatch action" },
      { status: 500 }
    );
  }
}
