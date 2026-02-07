import { NextRequest, NextResponse } from "next/server";
import { pumpManager } from "@/storage/database";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const filters = {
      brand: searchParams.get("brand") || undefined,
      model: searchParams.get("model") || undefined,
      applicationType: searchParams.get("applicationType") || undefined,
      pumpType: searchParams.get("pumpType") || undefined,
      material: searchParams.get("material") || undefined,
      minFlowRate: searchParams.get("minFlowRate")
        ? parseFloat(searchParams.get("minFlowRate")!)
        : undefined,
      maxFlowRate: searchParams.get("maxFlowRate")
        ? parseFloat(searchParams.get("maxFlowRate")!)
        : undefined,
      minHead: searchParams.get("minHead")
        ? parseFloat(searchParams.get("minHead")!)
        : undefined,
      maxHead: searchParams.get("maxHead")
        ? parseFloat(searchParams.get("maxHead")!)
        : undefined,
      minPower: searchParams.get("minPower")
        ? parseFloat(searchParams.get("minPower")!)
        : undefined,
      maxPower: searchParams.get("maxPower")
        ? parseFloat(searchParams.get("maxPower")!)
        : undefined,
    };

    const skip = parseInt(searchParams.get("skip") || "0");
    const limit = parseInt(searchParams.get("limit") || "50");

    const pumps = await pumpManager.getPumps({ skip, limit, filters });
    const total = await pumpManager.getTotalCount();

    return NextResponse.json({ pumps, total });
  } catch (error) {
    console.error("Error fetching pumps:", error);
    return NextResponse.json(
      { error: "Failed to fetch pumps" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('POST /api/pumps 收到数据:', JSON.stringify(body, null, 2));

    const pump = await pumpManager.createPump(body);
    console.log('创建水泵成功:', pump);

    return NextResponse.json(pump, { status: 201 });
  } catch (error) {
    console.error("Error creating pump:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    return NextResponse.json(
      { error: "Failed to create pump", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
