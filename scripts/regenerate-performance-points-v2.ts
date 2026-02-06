import { getDb } from "coze-coding-dev-sdk";
import { pumpPerformancePoints } from "../src/storage/database/shared/schema";

async function main() {
  const db = await getDb();

  console.log("开始重新生成所有水泵的性能曲线数据（优化版）...\n");

  // 删除所有现有的性能曲线数据
  console.log("步骤1: 删除所有现有的性能曲线数据...");
  const deleteResult = await db.execute(`DELETE FROM pump_performance_points`);
  console.log(`✓ 已删除 ${deleteResult.rowCount} 条性能曲线数据\n`);

  // 获取所有水泵
  console.log("步骤2: 获取所有水泵信息...");
  const allPumps = await db.execute(`
    SELECT id, flow_rate, head, max_flow, max_head, power, efficiency
    FROM pumps
  `);

  console.log(`找到 ${allPumps.rows.length} 个水泵\n`);

  let success = 0;
  let failed = 0;

  console.log("步骤3: 为每个水泵生成新的性能曲线数据...");

  for (const pump of allPumps.rows) {
    try {
      const ratedFlow = parseFloat(pump.flow_rate);
      const ratedHead = parseFloat(pump.head);
      const ratedPower = parseFloat(pump.power);
      const maxFlow = pump.max_flow ? parseFloat(pump.max_flow) : ratedFlow * 1.5;
      const maxHead = pump.max_head ? parseFloat(pump.max_head) : ratedHead * 1.3;
      const efficiency = pump.efficiency ? parseFloat(pump.efficiency) : null;

      // 0流量时的关闭扬程（通常为额定扬程的1.2-1.3倍）
      const shutOffHead = ratedHead * 1.25;

      // 步长0.1 m³/h
      const step = 0.1;
      const numPoints = Math.floor(maxFlow / step);

      let pointCount = 0;
      for (let i = 0; i <= numPoints; i++) {
        const flow = parseFloat((i * step).toFixed(2));

        // 优化后的性能曲线模拟
        let head: number;
        let power: number;
        let eff: number | undefined;

        if (flow <= ratedFlow) {
          // 在额定流量以下：扬程从关闭扬程线性下降到额定扬程
          const flowRatio = flow / ratedFlow;
          head = shutOffHead - (shutOffHead - ratedHead) * flowRatio;
          // 功率从0.3倍额定功率线性增长到额定功率
          power = ratedPower * (0.3 + 0.7 * flowRatio);
          // 效率从0.5倍上升到额定效率
          eff = efficiency ? efficiency * (0.5 + 0.5 * flowRatio) : undefined;
        } else {
          // 在额定流量以上：扬程继续下降
          const flowRatio = (flow - ratedFlow) / (maxFlow - ratedFlow);
          // 扬程从额定扬程下降到0.5倍额定扬程
          head = ratedHead * (1.0 - 0.5 * flowRatio);
          // 功率继续增长，但增长速率减缓
          power = ratedPower * (1.0 + 0.2 * flowRatio);
          // 效率从额定效率下降
          eff = efficiency ? efficiency * (1.0 - 0.15 * flowRatio) : undefined;
        }

        if (head > 0 && flow <= maxFlow) {
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

  console.log(`\n重新生成完成: 成功 ${success} 个, 失败 ${failed} 个`);

  // 统计总数据点
  const countResult = await db.execute(`SELECT COUNT(*) as count FROM pump_performance_points`);
  console.log(`\n总性能曲线数据点: ${countResult.rows[0].count}`);
}

main().catch(console.error);
