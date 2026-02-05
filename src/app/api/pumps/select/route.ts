import { NextRequest, NextResponse } from "next/server";
import { pumpManager } from "@/storage/database";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { flowRate, head } = body;

    if (!flowRate || !head) {
      return NextResponse.json(
        { error: "flowRate and head are required" },
        { status: 400 }
      );
    }

    const pumps = await pumpManager.selectPumps(flowRate, head);
    return NextResponse.json(pumps);
  } catch (error) {
    console.error("Error selecting pumps:", error);
    return NextResponse.json(
      { error: "Failed to select pumps" },
      { status: 500 }
    );
  }
}
