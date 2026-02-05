import { NextRequest, NextResponse } from "next/server";
import { getDb } from "coze-coding-dev-sdk";

export async function POST(request: NextRequest) {
  try {
    const db = await getDb();

    // 创建表
    try {
      await db.execute(`
        CREATE TABLE IF NOT EXISTS pump_performance_points (
          id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
          pump_id VARCHAR(36) NOT NULL REFERENCES pumps(id) ON DELETE CASCADE,
          flow_rate DECIMAL(10, 2) NOT NULL,
          head DECIMAL(10, 2) NOT NULL,
          power DECIMAL(10, 2),
          efficiency DECIMAL(5, 2),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_pump_performance_points_pump_id
          ON pump_performance_points(pump_id);

        CREATE INDEX IF NOT EXISTS idx_pump_performance_points_flow_rate
          ON pump_performance_points(flow_rate);
      `);
      console.log("✓ pump_performance_points 表创建成功");
    } catch (error) {
      console.error("创建表失败:", error);
      throw error;
    }

    // 获取所有水泵
    const allPumps = await db.execute(`
      SELECT id, flow_rate, head, max_flow, max_head, power, efficiency
      FROM pumps
    `);

    console.log(`找到 ${allPumps.rows.length} 个水泵，开始生成性能曲线数据...`);

    let success = 0;
    let failed = 0;
    const errors: any[] = [];

    // 只处理前5个水泵进行测试
    const testPumps = allPumps.rows.slice(0, 5);

    for (const pump of testPumps) {
      try {
        const ratedFlow = parseFloat(pump.flow_rate);
        const ratedHead = parseFloat(pump.head);
        const ratedPower = parseFloat(pump.power);
        const maxFlow = pump.max_flow ? parseFloat(pump.max_flow) : ratedFlow * 1.5;
        const maxHead = pump.max_head ? parseFloat(pump.max_head) : ratedHead * 1.3;
        const efficiency = pump.efficiency ? parseFloat(pump.efficiency) : null;

        // 步长0.1 m³/h
        const step = 0.1;
        const numPoints = Math.floor(maxFlow / step);

        // 先删除该水泵的旧性能曲线数据（如果表存在）
        try {
          await db.execute(`
            DELETE FROM pump_performance_points WHERE pump_id = $1
          `, [pump.id]);
        } catch (deleteError) {
          // 表可能不存在，忽略DELETE错误
          console.log(`跳过DELETE操作: ${pump.id}`);
        }

        // 生成新的性能曲线数据点
        let pointCount = 0;
        for (let i = 0; i <= numPoints; i++) {
          const flow = parseFloat((i * step).toFixed(2));

          // 简单的性能曲线模拟
          let head: number;
          let power: number;
          let eff: number | undefined;

          if (flow <= ratedFlow) {
            const flowRatio = flow / ratedFlow;
            head = ratedHead * (1 - 0.1 * flowRatio);
            power = ratedPower * (0.3 + 0.7 * flowRatio);
            eff = efficiency ? efficiency * (0.5 + 0.5 * flowRatio) : undefined;
          } else {
            const flowRatio = (flow - ratedFlow) / (maxFlow - ratedFlow);
            head = ratedHead * (0.9 - 0.4 * flowRatio);
            power = ratedPower * (1.0 + 0.3 * flowRatio);
            eff = efficiency ? efficiency * (1.0 - 0.2 * flowRatio) : undefined;
          }

          if (head > 0) {
            try {
              await db.execute(`
                INSERT INTO pump_performance_points (pump_id, flow_rate, head, power, efficiency)
                VALUES ($1, $2, $3, $4, $5)
              `, [pump.id, parseFloat(flow.toFixed(2)), parseFloat(head.toFixed(2)), parseFloat(power.toFixed(2)), eff ? parseFloat(eff.toFixed(2)) : null]);
              pointCount++;
            } catch (insertError) {
              console.error(`插入数据点失败: flow=${flow}, pump=${pump.id}`, insertError);
            }
          }
        }

        success++;
        console.log(`✓ ${pump.id}: 生成 ${pointCount} 个性能曲线数据点`);
      } catch (error) {
        failed++;
        const errorMsg = error instanceof Error ? error.message : String(error);
        errors.push({ pumpId: pump.id, error: errorMsg });
        console.error(`✗ ${pump.id}: 生成失败`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: "性能曲线数据初始化完成（测试模式：仅前5个水泵）",
      result: {
        total: testPumps.length,
        success,
        failed,
        errors: errors.slice(0, 10),
      },
    });
  } catch (error) {
    console.error("Error initializing performance points:", error);
    return NextResponse.json(
      {
        error: "Failed to initialize performance points",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
