import { NextRequest, NextResponse } from "next/server";
import { pumpManager } from "@/storage/database";
import { getDb } from "coze-coding-dev-sdk";
import { pumpPerformancePoints } from "@/storage/database/shared/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pumpId } = body;

    // 获取水泵信息
    const pump = await pumpManager.getPumpById(pumpId);
    if (!pump) {
      return NextResponse.json(
        { error: "Pump not found" },
        { status: 404 }
      );
    }

    // 删除旧的性能曲线数据
    await pumpManager.deletePerformancePoints(pumpId);

    // 重新生成并插入性能曲线数据
    // 使用正确的逻辑：Q=0时，H=maxHead（实际最大扬程）
    const maxFlow = typeof pump.flowRate === 'number' ? pump.flowRate : parseFloat(pump.flowRate || '0');
    const maxHead = typeof pump.head === 'number' ? pump.head : parseFloat(pump.head || '0');
    const ratedPower = typeof pump.power === 'number' ? pump.power : parseFloat(pump.power || '0');

    // 关断点扬程（流量为0时的扬程）= 实际最大扬程
    const shutOffHead = maxHead;

    // 步长0.1 m³/h
    const step = 0.1;
    const numPoints = Math.floor(maxFlow / step);

    const points: Array<{
      flowRate: number;
      head: number;
      power?: number;
      efficiency?: number;
    }> = [];

    // 首先添加起点（Q=0, H=maxHead）
    points.push({
      flowRate: 0,
      head: parseFloat(shutOffHead.toFixed(2)),
      power: parseFloat((ratedPower * 0.3).toFixed(2)),
      efficiency: parseFloat((pump.efficiency ? parseFloat(typeof pump.efficiency === 'string' ? pump.efficiency : pump.efficiency.toString()) * 0.5 : 0).toFixed(2)),
    });

    // 然后生成其他点
    for (let i = 1; i <= numPoints; i++) {
      const flow = parseFloat((i * step).toFixed(2));

      // 使用二次曲线模型：H = shutOffHead - k * Q^2
      // 当 Q = maxFlow 时，H = 0
      // 0 = shutOffHead - k * maxFlow^2
      // k = shutOffHead / maxFlow^2
      const k = shutOffHead / (maxFlow * maxFlow);
      const head = shutOffHead - k * flow * flow;

      // 确保扬程不为负
      const adjustedHead = Math.max(0, head);

      // 计算功率：功率随流量增加而增加
      const flowRatio = flow / maxFlow;
      const power = ratedPower * (0.3 + 0.7 * flowRatio);

      // 计算效率：效率在 60% 流量处最高
      const pumpEfficiency = pump.efficiency ? parseFloat(typeof pump.efficiency === 'string' ? pump.efficiency : pump.efficiency.toString()) : undefined;
      let efficiency: number | undefined;
      if (pumpEfficiency) {
        if (flowRatio <= 0.6) {
          efficiency = pumpEfficiency * (0.5 + 0.5 * (flowRatio / 0.6));
        } else {
          efficiency = pumpEfficiency * (1.0 - 0.2 * ((flowRatio - 0.6) / 0.4));
        }
      }

      // 只添加扬程大于0的点
      if (adjustedHead > 0) {
        points.push({
          flowRate: flow,
          head: parseFloat(adjustedHead.toFixed(2)),
          power: parseFloat(power.toFixed(2)),
          efficiency: efficiency ? parseFloat(efficiency.toFixed(2)) : undefined,
        });
      }
    }

    // 插入新的性能曲线数据
    const db = await getDb();
    for (const point of points) {
      await db.insert(pumpPerformancePoints).values({
        pumpId: pump.id as string,
        flowRate: point.flowRate.toString(),
        head: point.head.toString(),
        power: point.power?.toString(),
        efficiency: point.efficiency?.toString(),
      });
    }

    return NextResponse.json({
      success: true,
      message: "Performance curve regenerated successfully",
      pointsCount: points.length,
      maxFlow,
      maxHead,
      firstPoint: points[0],
    });
  } catch (error) {
    console.error("Error regenerating performance curve:", error);
    return NextResponse.json(
      { error: "Failed to regenerate performance curve" },
      { status: 500 }
    );
  }
}
