import { NextRequest, NextResponse } from "next/server";
import { readProjects } from "@/lib/vault/reader";
import { updateFrontmatter, createProject } from "@/lib/vault/writer";

export async function GET() {
  try {
    const projects = readProjects();
    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to read projects" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const projects = readProjects();
    const maxNum = projects.reduce((max, p) => {
      const match = p.id.match(/PROJ-(\d+)/);
      return match ? Math.max(max, parseInt(match[1], 10)) : max;
    }, 0);
    const nextId = `PROJ-${String(maxNum + 1).padStart(3, "0")}`;

    const data = { ...body, id: nextId };
    const content = data.content || "";
    delete data.content;

    const filePath = createProject(data, content);
    return NextResponse.json({ id: nextId, filePath }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create project" },
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
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}
