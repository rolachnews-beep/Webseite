import { NextRequest, NextResponse } from "next/server";
import { readTasks } from "@/lib/vault/reader";
import { updateFrontmatter } from "@/lib/vault/writer";

export async function GET() {
  try {
    const tasks = readTasks();
    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to read tasks" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { filePath, updates } = await request.json();
    updateFrontmatter(filePath, updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}
