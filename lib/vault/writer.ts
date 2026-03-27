import fs from "fs";
import path from "path";
import matter from "gray-matter";

const VAULT_PATH = process.env.VAULT_PATH || "./vault";

function getVaultPath(...segments: string[]): string {
  return path.resolve(process.cwd(), VAULT_PATH, ...segments);
}

export function updateFrontmatter(
  filePath: string,
  updates: Record<string, unknown>
): void {
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  const updated = { ...data, ...updates, updated: new Date().toISOString().split("T")[0] };
  const newContent = matter.stringify(content, updated);

  fs.writeFileSync(filePath, newContent, "utf-8");
}

export function createTask(
  data: Record<string, unknown>,
  content: string = ""
): string {
  const id = data.id as string;
  const filename = id.toLowerCase().replace(/\s+/g, "-") + ".md";
  const filePath = getVaultPath("tasks", filename);

  const today = new Date().toISOString().split("T")[0];
  const frontmatter = {
    ...data,
    created: today,
    updated: today,
  };

  const fileContent = matter.stringify(content, frontmatter);
  fs.writeFileSync(filePath, fileContent, "utf-8");
  return filePath;
}

export function deleteTask(filePath: string): void {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

export function createProject(
  data: Record<string, unknown>,
  content: string = ""
): string {
  const title = (data.title as string) || "untitled";
  const filename = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + ".md";
  const filePath = getVaultPath("projects", filename);

  const frontmatter = { ...data };
  const fileContent = matter.stringify(content, frontmatter);
  fs.writeFileSync(filePath, fileContent, "utf-8");
  return filePath;
}

export function createCycle(
  data: Record<string, unknown>,
  content: string = ""
): string {
  const id = data.id as string;
  const filename = id.toLowerCase().replace(/\s+/g, "-") + ".md";
  const filePath = getVaultPath("cycles", filename);

  const frontmatter = { ...data };
  const fileContent = matter.stringify(content, frontmatter);
  fs.writeFileSync(filePath, fileContent, "utf-8");
  return filePath;
}
