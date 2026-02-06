import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import { pumps, pumpPerformancePoints } from "@/storage/database/shared/schema";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDb();

    // 获取水泵信息
    const pumpResult = await db
      .select()
      .from(pumps)
      .where(eq(pumps.id, id));

    console.log("Pump result:", pumpResult);

    if (!pumpResult || pumpResult.length === 0) {
      return NextResponse.json(
        { error: "Pump not found", id },
        { status: 404 }
      );
    }

    const pump = pumpResult[0];

    // 获取性能曲线数据
    const performancePoints = await db
      .select()
      .from(pumpPerformancePoints)
      .where(eq(pumpPerformancePoints.pumpId, id))
      .orderBy(pumpPerformancePoints.flowRate)
      .limit(500);

    return NextResponse.json({
      pump,
      performancePoints,
    });
  } catch (error) {
    console.error("Error fetching pump performance:", error);
    return NextResponse.json(
      { error: "Failed to fetch pump performance", message: (error as Error).message },
      { status: 500 }
    );
  }
}
