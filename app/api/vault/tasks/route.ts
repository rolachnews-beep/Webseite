import { NextRequest, NextResponse } from "next/server";
import { readTasks } from "@/lib/vault/reader";
import { updateFrontmatter, createTask, deleteTask } from "@/lib/vault/writer";

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Auto-generate next ID
    const tasks = readTasks();
    const maxNum = tasks.reduce((max, t) => {
      const match = t.id.match(/TASK-(\d+)/);
      return match ? Math.max(max, parseInt(match[1], 10)) : max;
    }, 0);
    const nextId = `TASK-${String(maxNum + 1).padStart(3, "0")}`;

    const data = { ...body, id: nextId };
    const content = data.content || "";
    delete data.content;

    const filePath = createTask(data, content);
    return NextResponse.json({ id: nextId, filePath }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create task" },
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

export async function DELETE(request: NextRequest) {
  try {
    const { filePath } = await request.json();
    deleteTask(filePath);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
