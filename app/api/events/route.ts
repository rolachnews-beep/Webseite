import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const VAULT_PATH = process.env.VAULT_PATH || "./vault";

function getVaultPath(...segments: string[]): string {
  return path.resolve(process.cwd(), VAULT_PATH, ...segments);
}

/**
 * SSE endpoint that watches the vault for changes and pushes events to clients.
 * Uses polling as a cross-platform fallback (chokidar requires native deps).
 */
export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection event
      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({ type: "connected", timestamp: new Date().toISOString() })}\n\n`
        )
      );

      // Track file modification times for change detection
      const lastModTimes = new Map<string, number>();

      function scanDir(dir: string): Map<string, number> {
        const times = new Map<string, number>();
        const fullPath = getVaultPath(dir);
        if (!fs.existsSync(fullPath)) return times;

        try {
          const files = fs.readdirSync(fullPath).filter((f) => f.endsWith(".md"));
          for (const file of files) {
            const filePath = path.join(fullPath, file);
            const stat = fs.statSync(filePath);
            times.set(filePath, stat.mtimeMs);
          }
        } catch {
          // Directory might not exist yet
        }
        return times;
      }

      // Initial scan
      for (const dir of ["tasks", "actors", "projects", "cycles"]) {
        const times = scanDir(dir);
        times.forEach((mtime, filePath) => lastModTimes.set(filePath, mtime));
      }

      // Poll for changes every 2 seconds
      const interval = setInterval(() => {
        const changes: { type: string; dir: string; file: string }[] = [];

        for (const dir of ["tasks", "actors", "projects", "cycles"]) {
          const currentTimes = scanDir(dir);

          // Check for new or modified files
          currentTimes.forEach((mtime, filePath) => {
            const lastMtime = lastModTimes.get(filePath);
            if (!lastMtime) {
              changes.push({
                type: "created",
                dir,
                file: path.basename(filePath),
              });
            } else if (mtime > lastMtime) {
              changes.push({
                type: "modified",
                dir,
                file: path.basename(filePath),
              });
            }
            lastModTimes.set(filePath, mtime);
          });

          // Check for deleted files
          lastModTimes.forEach((_, filePath) => {
            if (
              filePath.includes(path.join(VAULT_PATH, dir)) &&
              !currentTimes.has(filePath)
            ) {
              changes.push({
                type: "deleted",
                dir,
                file: path.basename(filePath),
              });
              lastModTimes.delete(filePath);
            }
          });
        }

        if (changes.length > 0) {
          try {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "changes",
                  changes,
                  timestamp: new Date().toISOString(),
                })}\n\n`
              )
            );
          } catch {
            clearInterval(interval);
          }
        }
      }, 2000);

      // Heartbeat every 15 seconds to keep connection alive
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "heartbeat", timestamp: new Date().toISOString() })}\n\n`
            )
          );
        } catch {
          clearInterval(heartbeat);
          clearInterval(interval);
        }
      }, 15000);

      // Cleanup on close
      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        clearInterval(heartbeat);
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
