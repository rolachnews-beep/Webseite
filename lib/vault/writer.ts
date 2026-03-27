import fs from "fs";
import matter from "gray-matter";

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
