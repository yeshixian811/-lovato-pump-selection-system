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
      return NextResponse.json(
        { error: "Pump not found" },
        { status: 404 }
      );
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

    // 转换表单数据为数据库格式
    const updateData: any = {
      name: body.name,
      model: body.model,
      brand: body.brand,
      pumpType: body.pumpType,
      material: body.material,
      flowRate: parseFloat(body.flowRate) || 0,
      head: parseFloat(body.head) || 0,
      power: parseFloat(body.power) || 0,
      applicationType: body.applicationType,
      description: body.description || '',
    };

    // 可选字段
    if (body.efficiency) {
      updateData.efficiency = parseFloat(body.efficiency);
    }
    if (body.price) {
      updateData.price = parseFloat(body.price);
    }
    if (body.imageUrl) {
      updateData.imageUrl = body.imageUrl;
    }
    if (body.maxTemperature) {
      updateData.maxTemperature = parseFloat(body.maxTemperature);
    }
    if (body.maxPressure) {
      updateData.maxPressure = parseFloat(body.maxPressure);
    }

    const pump = await pumpManager.updatePump(id, updateData);

    if (!pump) {
      return NextResponse.json(
        { error: "Pump not found" },
        { status: 404 }
      );
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
      return NextResponse.json(
        { error: "Pump not found" },
        { status: 404 }
      );
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
