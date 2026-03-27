import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { Task } from "../types/task";
import { Project } from "../types/project";
import { Cycle } from "../types/cycle";

const VAULT_PATH = process.env.VAULT_PATH || "./vault";

function getVaultPath(...segments: string[]): string {
  return path.resolve(process.cwd(), VAULT_PATH, ...segments);
}

function readMarkdownFiles(dir: string): { data: Record<string, unknown>; content: string; filePath: string }[] {
  const fullPath = getVaultPath(dir);
  if (!fs.existsSync(fullPath)) return [];

  return fs
    .readdirSync(fullPath)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const filePath = path.join(fullPath, f);
      const raw = fs.readFileSync(filePath, "utf-8");
      const { data, content } = matter(raw);
      return { data, content, filePath };
    });
}

export function readTasks(): Task[] {
  return readMarkdownFiles("tasks").map(({ data, content, filePath }) => ({
    id: (data.id as string) || path.basename(filePath, ".md"),
    title: (data.title as string) || "Untitled",
    status: (data.status as Task["status"]) || "backlog",
    priority: (data.priority as Task["priority"]) || "none",
    project: data.project as string | undefined,
    assignee: data.assignee as string | undefined,
    labels: (data.labels as string[]) || [],
    estimate: data.estimate as Task["estimate"] | undefined,
    due_date: data.due_date ? String(data.due_date) : undefined,
    start_date: data.start_date ? String(data.start_date) : undefined,
    cycle: data.cycle as string | undefined,
    parent: data.parent as string | undefined,
    blocked_by: (data.blocked_by as string[]) || [],
    blocking: (data.blocking as string[]) || [],
    created: data.created ? String(data.created) : new Date().toISOString().split("T")[0],
    updated: data.updated ? String(data.updated) : new Date().toISOString().split("T")[0],
    content,
    filePath,
  }));
}

export function readProjects(): Project[] {
  return readMarkdownFiles("projects").map(({ data, content, filePath }) => ({
    id: (data.id as string) || path.basename(filePath, ".md"),
    title: (data.title as string) || "Untitled",
    status: (data.status as Project["status"]) || "planned",
    lead: data.lead as string | undefined,
    teams: (data.teams as string[]) || [],
    start_date: data.start_date ? String(data.start_date) : undefined,
    target_date: data.target_date ? String(data.target_date) : undefined,
    health: (data.health as Project["health"]) || "on-track",
    description: (data.description as string) || "",
    content,
    filePath,
  }));
}

export function readCycles(): Cycle[] {
  return readMarkdownFiles("cycles").map(({ data, content, filePath }) => ({
    id: (data.id as string) || path.basename(filePath, ".md"),
    title: (data.title as string) || "Untitled",
    start_date: data.start_date ? String(data.start_date) : "",
    end_date: data.end_date ? String(data.end_date) : "",
    status: (data.status as Cycle["status"]) || "upcoming",
    content,
    filePath,
  }));
}
