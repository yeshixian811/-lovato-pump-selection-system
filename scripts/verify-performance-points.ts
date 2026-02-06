import { getDb } from "coze-coding-dev-sdk";

async function main() {
  const db = await getDb();

  console.log("验证性能曲线数据生成正确性\n");

  // 获取几个样例水泵及其性能曲线数据
  const samplePumps = await db.execute(`
    SELECT id, model, flow_rate, head, max_flow, max_head, power, efficiency
    FROM pumps
    LIMIT 3
  `);

  console.log(`检查 ${samplePumps.rows.length} 个样例水泵:\n`);

  for (const pump of samplePumps.rows) {
    console.log(`=== 水泵: ${pump.model} (${pump.id}) ===`);
    console.log(`额定参数: 流量=${pump.flow_rate} m³/h, 扬程=${pump.head} m, 功率=${pump.power} kW`);
    console.log(`最大参数: 流量=${pump.max_flow || 'N/A'} m³/h, 扬程=${pump.max_head || 'N/A'} m`);

    // 获取性能曲线数据
    const pointsResult = await db.execute(`
      SELECT flow_rate, head, power, efficiency
      FROM pump_performance_points
      WHERE pump_id = '${pump.id}'
      ORDER BY flow_rate
    `);

    const points = pointsResult.rows;
    console.log(`性能曲线数据点: ${points.length} 个`);

    if (points.length > 0) {
      console.log("\n前5个数据点:");
      for (let i = 0; i < Math.min(5, points.length); i++) {
        const p = points[i];
        const flowRate = typeof p.flow_rate === 'string' ? parseFloat(p.flow_rate) : p.flow_rate;
        const head = typeof p.head === 'string' ? parseFloat(p.head) : p.head;
        const power = typeof p.power === 'string' ? parseFloat(p.power) : p.power;
        const efficiency = p.efficiency ? (typeof p.efficiency === 'string' ? parseFloat(p.efficiency) : p.efficiency) : null;
        console.log(`  ${i+1}. 流量=${flowRate.toFixed(2)} m³/h, 扬程=${head.toFixed(2)} m, 功率=${power.toFixed(2)} kW${efficiency ? `, 效率=${efficiency.toFixed(2)}%` : ''}`);
      }

      console.log("\n后5个数据点:");
      for (let i = Math.max(0, points.length - 5); i < points.length; i++) {
        const p = points[i];
        const flowRate = typeof p.flow_rate === 'string' ? parseFloat(p.flow_rate) : p.flow_rate;
        const head = typeof p.head === 'string' ? parseFloat(p.head) : p.head;
        const power = typeof p.power === 'string' ? parseFloat(p.power) : p.power;
        const efficiency = p.efficiency ? (typeof p.efficiency === 'string' ? parseFloat(p.efficiency) : p.efficiency) : null;
        console.log(`  ${i+1}. 流量=${flowRate.toFixed(2)} m³/h, 扬程=${head.toFixed(2)} m, 功率=${power.toFixed(2)} kW${efficiency ? `, 效率=${efficiency.toFixed(2)}%` : ''}`);
      }

      // 检查额定流量点附近的数据
      const ratedFlow = parseFloat(pump.flow_rate);
      const ratedPoints = points.filter(p => {
        const flowRate = typeof p.flow_rate === 'string' ? parseFloat(p.flow_rate) : p.flow_rate;
        return Math.abs(flowRate - ratedFlow) < 0.05;
      });
      if (ratedPoints.length > 0) {
        const rp = ratedPoints[0];
        const head = typeof rp.head === 'string' ? parseFloat(rp.head) : rp.head;
        const power = typeof rp.power === 'string' ? parseFloat(rp.power) : rp.power;
        console.log(`\n额定流量点附近 (${ratedFlow.toFixed(2)} m³/h):`);
        console.log(`  扬程=${head.toFixed(2)} m (额定=${pump.head} m)`);
        console.log(`  功率=${power.toFixed(2)} kW (额定=${pump.power} kW)`);
        console.log(`  ✓ 额定参数匹配度: ${Math.abs(head - parseFloat(pump.head)) < 1 ? '良好' : '需检查'}`);
      }
    }
    console.log();
  }

  // 统计所有水泵的数据点数量
  const countResult = await db.execute(`
    SELECT p.id, p.model, COUNT(pp.id) as point_count
    FROM pumps p
    LEFT JOIN pump_performance_points pp ON p.id = pp.pump_id
    GROUP BY p.id, p.model
    ORDER BY p.model
  `);

  console.log("\n所有水泵性能曲线数据点统计:");
  console.log("----------------------------------------");
  console.log("型号               | 数据点数 | 状态");
  console.log("----------------------------------------");

  for (const row of countResult.rows) {
    const status = row.point_count > 0 ? '✓' : '✗';
    console.log(`${row.model.padEnd(18)} | ${String(row.point_count).padStart(8)} | ${status}`);
  }
}

main().catch(console.error);
