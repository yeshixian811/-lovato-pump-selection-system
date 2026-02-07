import { getDb } from "coze-coding-dev-sdk";

async function main() {
  const db = await getDb();

  console.log("=" .repeat(80));
  console.log("洛瓦托水泵选型系统 - 详细测试报告");
  console.log("=".repeat(80));
  console.log();

  // 获取所有水泵
  const allPumps = await db.execute(`
    SELECT id, model, name, brand, flow_rate, head, power, efficiency
    FROM pumps
    ORDER BY model
  `);

  console.log(`测试范围: ${allPumps.rows.length} 个水泵\n`);

  // 对每个水泵进行详细测试
  for (const pump of allPumps.rows) {
    const requiredFlow = parseFloat(pump.flow_rate);
    const requiredHead = parseFloat(pump.head);

    console.log("-" .repeat(80));
    console.log(`测试水泵: ${pump.model}`);
    console.log("-" .repeat(80));
    console.log(`额定参数: 流量=${pump.flow_rate} m³/h, 扬程=${pump.head} m, 功率=${pump.power} kW`);
    console.log(`输入参数: 流量=${requiredFlow} m³/h, 扬程=${requiredHead} m`);
    console.log();

    // 查找匹配结果
    const matchingPoints = await db.execute(`
      SELECT
        pp.pump_id,
        pp.flow_rate as operating_flow,
        pp.head as operating_head,
        pp.power as operating_power,
        pp.efficiency as operating_efficiency,
        p.*
      FROM pump_performance_points pp
      INNER JOIN pumps p ON p.id = pp.pump_id
      WHERE pp.flow_rate >= ${requiredFlow}
        AND pp.head >= ${requiredHead}
      ORDER BY pp.flow_rate ASC, pp.head ASC
      LIMIT 100
    `);

    if (matchingPoints.rows.length === 0) {
      console.log("⚠️  警告: 未找到匹配结果\n");
      continue;
    }

    console.log(`找到 ${matchingPoints.rows.length} 个匹配的水泵`);
    console.log();

    // 计算每个水泵的评分
    const pumpScores = new Map<string, any>();

    for (const row of matchingPoints.rows) {
      const pumpId = row.pump_id;
      const operatingFlow = parseFloat(row.operating_flow);
      const operatingHead = parseFloat(row.operating_head);
      const operatingPower = parseFloat(row.operating_power);
      const operatingEfficiency = row.operating_efficiency ? parseFloat(row.operating_efficiency) : null;

      const ratedFlow = parseFloat(row.flow_rate);
      const ratedHead = parseFloat(row.head);
      const ratedPower = parseFloat(row.power);
      const ratedEfficiency = row.efficiency ? parseFloat(row.efficiency) : null;

      // 计算余量
      const flowMargin = ((operatingFlow - requiredFlow) / requiredFlow) * 100;
      const headMargin = ((operatingHead - requiredHead) / requiredHead) * 100;

      // 计算评分
      const scores = calculateScores({
        flowMargin,
        headMargin,
        operatingEfficiency,
        ratedFlow,
        operatingFlow,
        ratedPower,
        operatingPower,
      });

      if (!pumpScores.has(pumpId) || scores.comprehensiveScore > pumpScores.get(pumpId).comprehensiveScore) {
        pumpScores.set(pumpId, {
          id: pumpId,
          model: row.model,
          flowMargin: flowMargin.toFixed(1),
          headMargin: headMargin.toFixed(1),
          bepMatchScore: scores.bepMatchScore.toFixed(1),
          efficiencyScore: scores.efficiencyScore.toFixed(1),
          comprehensiveScore: scores.comprehensiveScore.toFixed(1),
          recommendationLevel: scores.recommendationLevel,
          operatingPoint: {
            flowRate: operatingFlow.toFixed(2),
            head: operatingHead.toFixed(2),
            power: operatingPower.toFixed(2),
            efficiency: operatingEfficiency ? operatingEfficiency.toFixed(2) : null,
          },
        });
      }
    }

    // 按综合评分排序
    const results = Array.from(pumpScores.values())
      .sort((a, b) => parseFloat(b.comprehensiveScore) - parseFloat(a.comprehensiveScore));

    // 检查是否找到自己
    const selfIndex = results.findIndex((r) => r.id === pump.id);
    const foundSelf = selfIndex !== -1;

    console.log(`✓ ${foundSelf ? "包含自己" : "未包含自己"} (${foundSelf ? `排名第 ${selfIndex + 1}` : "未在列表中"})`);
    console.log();

    // 显示前5个结果的详细信息
    console.log("前5个推荐结果:");
    console.log("-" .repeat(80));
    console.log(
      "排名 | 型号      | 综合评分 | 推荐等级   | 流量余量 | 扬程余量 | BEP匹配 | 效率 | 操作点(Q,H,P)"
    );
    console.log("-" .repeat(80));

    const topResults = results.slice(0, 5);
    for (let i = 0; i < topResults.length; i++) {
      const r = topResults[i];
      const isSelf = r.id === pump.id;
      const mark = isSelf ? "★" : " ";
      console.log(
        `${isSelf ? "★" : " "}${(i + 1).toString().padStart(4)} | ${r.model.padEnd(9)} | ` +
        `${r.comprehensiveScore.padStart(7)} | ${r.recommendationLevel.padEnd(8)} | ` +
        `${r.flowMargin.padStart(8)}% | ${r.headMargin.padStart(8)}% | ` +
        `${r.bepMatchScore.padStart(7)} | ${r.efficiencyScore.padStart(4)} | ` +
        `(${r.operatingPoint.flowRate}, ${r.operatingPoint.head}, ${r.operatingPoint.power})`
      );
    }

    console.log();

    // 分析推荐理由
    if (foundSelf) {
      const self = results[selfIndex];
      console.log(`自己 (${pump.model}) 的选型分析:`);
      console.log(`  - 综合评分: ${self.comprehensiveScore}`);
      console.log(`  - 推荐等级: ${self.recommendationLevel}`);
      console.log(`  - 流量余量: ${self.flowMargin}% (最佳范围: 5%-20%)`);
      console.log(`  - 扬程余量: ${self.headMargin}% (最佳范围: 5%-15%)`);
      console.log(`  - BEP匹配度: ${self.bepMatchScore}`);
      console.log(`  - 效率评分: ${self.efficiencyScore}`);

      if (self.recommendationLevel === "备选方案") {
        console.log();
        console.log("  分析: 虽然BEP匹配度完美，但余量不足。");
        console.log("        这在实际应用中可能需要考虑增加余量，以应对流量波动。");
      } else if (self.recommendationLevel === "推荐选择" || self.recommendationLevel === "最佳选择") {
        console.log();
        console.log("  分析: 该水泵完美匹配需求参数。");
      }
    }

    console.log();
  }

  console.log("=" .repeat(80));
  console.log("测试完成");
  console.log("=".repeat(80));
}

function calculateScores(options: {
  flowMargin: number;
  headMargin: number;
  operatingEfficiency: number | null;
  ratedFlow: number;
  operatingFlow: number;
  ratedPower: number;
  operatingPower: number;
}) {
  const { flowMargin, headMargin, operatingEfficiency, ratedFlow, operatingFlow, ratedPower, operatingPower } = options;

  // 流量余量评分（权重：20%）
  let flowMarginScore: number;
  if (flowMargin < 5) {
    flowMarginScore = 60 + (flowMargin / 5) * 20;
  } else if (flowMargin <= 20) {
    flowMarginScore = 80 + ((20 - flowMargin) / 15) * 15;
  } else if (flowMargin <= 50) {
    flowMarginScore = 65 - ((flowMargin - 20) / 30) * 35;
  } else if (flowMargin <= 100) {
    flowMarginScore = 30 - ((flowMargin - 50) / 50) * 20;
  } else {
    flowMarginScore = 5;
  }

  // 扬程余量评分（权重：20%）
  let headMarginScore: number;
  if (headMargin < 5) {
    headMarginScore = 60 + (headMargin / 5) * 20;
  } else if (headMargin <= 15) {
    headMarginScore = 80 + ((15 - headMargin) / 10) * 15;
  } else if (headMargin <= 40) {
    headMarginScore = 65 - ((headMargin - 15) / 25) * 35;
  } else if (headMargin <= 100) {
    headMarginScore = 30 - ((headMargin - 40) / 60) * 20;
  } else {
    headMarginScore = 5;
  }

  // 效率评分（权重：30%）
  let efficiencyScore: number;
  if (operatingEfficiency) {
    if (operatingEfficiency >= 75) {
      efficiencyScore = Math.min(100, 95 + ((operatingEfficiency - 75) / 25) * 5);
    } else if (operatingEfficiency >= 60) {
      efficiencyScore = 75 + ((operatingEfficiency - 60) / 15) * 20;
    } else {
      efficiencyScore = 50 + ((operatingEfficiency - 30) / 30) * 25;
    }
  } else {
    efficiencyScore = 50;
  }

  // BEP匹配度评分（权重：20%）
  const flowRatio = operatingFlow / ratedFlow;
  let bepMatchScore: number;
  if (flowRatio >= 0.8 && flowRatio <= 1.2) {
    bepMatchScore = 90 + ((1 - Math.abs(flowRatio - 1)) / 0.2) * 10;
  } else if (flowRatio >= 0.6 && flowRatio <= 1.4) {
    const distanceFromOptimal = Math.abs(flowRatio - 1);
    bepMatchScore = 70 + (1 - (distanceFromOptimal - 0.2) / 0.2) * 20;
  } else if (flowRatio >= 0.3 && flowRatio <= 1.7) {
    const distanceFromOptimal = Math.abs(flowRatio - 1);
    bepMatchScore = 40 + (1 - (distanceFromOptimal - 0.4) / 0.3) * 30;
  } else {
    const distanceFromOptimal = Math.abs(flowRatio - 1);
    bepMatchScore = 20 + (1 - Math.min((distanceFromOptimal - 0.7) / 0.3, 1)) * 20;
  }

  // 功率余量评分（权重：10%）
  const powerMargin = ((operatingPower - ratedPower) / ratedPower) * 100;
  let powerMarginScore: number;
  if (powerMargin < 10) {
    powerMarginScore = 60 + (powerMargin / 10) * 20;
  } else if (powerMargin <= 30) {
    powerMarginScore = 80 + ((30 - powerMargin) / 20) * 15;
  } else if (powerMargin <= 60) {
    powerMarginScore = 95 - ((powerMargin - 30) / 30) * 35;
  } else {
    powerMarginScore = Math.max(0, 60 - (powerMargin - 60) / 10);
  }

  // 综合评分
  const comprehensiveScore =
    flowMarginScore * 0.2 +
    headMarginScore * 0.2 +
    efficiencyScore * 0.3 +
    bepMatchScore * 0.2 +
    powerMarginScore * 0.1;

  // 推荐等级
  let recommendationLevel: string;
  if (comprehensiveScore >= 90) {
    recommendationLevel = "最佳选择";
  } else if (comprehensiveScore >= 80) {
    recommendationLevel = "推荐选择";
  } else if (comprehensiveScore >= 65) {
    recommendationLevel = "备选方案";
  } else {
    recommendationLevel = "警告";
  }

  return {
    flowMarginScore,
    headMarginScore,
    efficiencyScore,
    bepMatchScore,
    powerMarginScore,
    comprehensiveScore,
    recommendationLevel,
  };
}

main().catch(console.error);
