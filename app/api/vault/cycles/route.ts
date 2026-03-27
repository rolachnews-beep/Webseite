import { NextRequest, NextResponse } from "next/server";
import { readCycles } from "@/lib/vault/reader";
import { updateFrontmatter, createCycle } from "@/lib/vault/writer";

export async function GET() {
  try {
    const cycles = readCycles();
    return NextResponse.json(cycles);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to read cycles" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const cycles = readCycles();
    const maxNum = cycles.reduce((max, c) => {
      const match = c.id.match(/CYCLE-(\d+)/);
      return match ? Math.max(max, parseInt(match[1], 10)) : max;
    }, 0);
    const nextId = `CYCLE-${String(maxNum + 1).padStart(3, "0")}`;

    const data = { ...body, id: nextId };
    const content = data.content || "";
    delete data.content;

    const filePath = createCycle(data, content);
    return NextResponse.json({ id: nextId, filePath }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create cycle" },
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
      { error: "Failed to update cycle" },
      { status: 500 }
    );
  }
}
