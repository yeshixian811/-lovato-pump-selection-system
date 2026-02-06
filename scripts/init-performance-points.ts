import { getDb } from "coze-coding-dev-sdk";
import { pumpPerformancePoints } from "../src/storage/database/shared/schema";

async function main() {
  const db = await getDb();

  console.log("开始初始化水泵性能曲线数据...");

  // 获取所有水泵
  const allPumps = await db.execute(`
    SELECT id, flow_rate, head, max_flow, max_head, power, efficiency
    FROM pumps
  `);

  console.log(`找到 ${allPumps.rows.length} 个水泵`);

  let success = 0;
  let failed = 0;

  for (const pump of allPumps.rows) {
    try {
      const ratedFlow = parseFloat(pump.flow_rate);
      const ratedHead = parseFloat(pump.head);
      const ratedPower = parseFloat(pump.power);
      const maxFlow = pump.max_flow ? parseFloat(pump.max_flow) : ratedFlow * 1.5;
      const maxHead = pump.max_head ? parseFloat(pump.max_head) : ratedHead * 1.3;
      const efficiency = pump.efficiency ? parseFloat(pump.efficiency) : null;

      // 先删除该水泵的旧性能曲线数据
      try {
        await db.execute(
          `DELETE FROM pump_performance_points WHERE pump_id = $1`,
          [pump.id]
        );
      } catch (deleteError) {
        // 表可能不存在，忽略DELETE错误
        console.log(`  跳过DELETE: ${pump.id}`);
      }

      // 步长0.1 m³/h
      const step = 0.1;
      const numPoints = Math.floor(maxFlow / step);

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
            await db.insert(pumpPerformancePoints).values({
              pumpId: pump.id,
              flowRate: parseFloat(flow.toFixed(2)),
              head: parseFloat(head.toFixed(2)),
              power: parseFloat(power.toFixed(2)),
              efficiency: eff ? parseFloat(eff.toFixed(2)) : null,
            });
            pointCount++;
          } catch (insertError) {
            console.error(`  插入失败: flow=${flow}, pump=${pump.id}`, (insertError as Error).message);
          }
        }
      }

      success++;
      console.log(`✓ ${pump.id}: 生成 ${pointCount} 个性能曲线数据点`);
    } catch (error) {
      failed++;
      console.error(`✗ ${pump.id}: 失败`, error);
    }
  }

  console.log(`\n初始化完成: 成功 ${success} 个, 失败 ${failed} 个`);
}

main().catch(console.error);
