import { NextRequest, NextResponse } from "next/server";
import { readActors } from "@/lib/vault/reader";
import { updateFrontmatter } from "@/lib/vault/writer";

export async function GET() {
  try {
    const actors = readActors();
    return NextResponse.json(actors);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to read actors" },
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
      { error: "Failed to update actor" },
      { status: 500 }
    );
  }
}
