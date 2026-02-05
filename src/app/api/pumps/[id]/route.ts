import { NextRequest, NextResponse } from "next/server";
import { pumpManager } from "@/storage/database";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pump = await pumpManager.getPumpById(id);

    if (!pump) {
      return NextResponse.json({ error: "Pump not found" }, { status: 404 });
    }

    return NextResponse.json(pump);
  } catch (error) {
    console.error("Error fetching pump:", error);
    return NextResponse.json(
      { error: "Failed to fetch pump" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const pump = await pumpManager.updatePump(id, body);

    if (!pump) {
      return NextResponse.json({ error: "Pump not found" }, { status: 404 });
    }

    return NextResponse.json(pump);
  } catch (error) {
    console.error("Error updating pump:", error);
    return NextResponse.json(
      { error: "Failed to update pump" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await pumpManager.deletePump(id);

    if (!success) {
      return NextResponse.json({ error: "Pump not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting pump:", error);
    return NextResponse.json(
      { error: "Failed to delete pump" },
      { status: 500 }
    );
  }
}
