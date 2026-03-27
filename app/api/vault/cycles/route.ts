import { NextRequest, NextResponse } from "next/server";
import { readCycles } from "@/lib/vault/reader";
import { updateFrontmatter } from "@/lib/vault/writer";

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
