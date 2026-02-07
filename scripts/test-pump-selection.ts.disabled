import { getDb } from "coze-coding-dev-sdk";

interface Pump {
  id: string;
  model: string;
  name: string;
  brand: string;
  flowRate: string;
  head: string;
  power: string;
  efficiency: string | null;
}

interface SelectionResult {
  id: string;
  model: string;
  flowMargin: string;
  headMargin: string;
  bepMatchScore: string;
  efficiencyScore: string;
  comprehensiveScore: string;
  recommendationLevel: string;
  operatingPoint: any;
}

async function main() {
  const db = await getDb();

  console.log("=" .repeat(80));
  console.log("产品库选型测试");
  console.log("=".repeat(80));
  console.log();

  // 获取所有水泵
  console.log("步骤1: 获取所有水泵...");
  const allPumps = await db.execute(`
    SELECT id, model, name, brand, flow_rate, head, power, efficiency
    FROM pumps
    ORDER BY model
  `);

  console.log(`找到 ${allPumps.rows.length} 个水泵\n`);

  // 测试结果统计
  const testResults: Array<{
    pump: Pump;
    results: SelectionResult[];
    foundSelf: boolean;
    foundCount: number;
    error?: string;
  }> = [];

  let successCount = 0;
  let failCount = 0;
  let noResultsCount = 0;

  console.log("步骤2: 对每个水泵执行选型测试...\n");

  for (const pump of allPumps.rows) {
    const pumpData: Pump = {
      id: pump.id,
      model: pump.model,
      name: pump.name,
      brand: pump.brand,
      flowRate: pump.flow_rate,
      head: pump.head,
      power: pump.power,
      efficiency: pump.efficiency,
    };

    try {
      // 使用额定流量和额定扬程进行选型
      const requiredFlow = parseFloat(pump.flow_rate);
      const requiredHead = parseFloat(pump.head);

      // 查找性能曲线中能满足需求的水泵
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
        console.log(`✗ ${pump.model} (${requiredFlow} m³/h, ${requiredHead} m): 未找到匹配结果`);
        testResults.push({
          pump: pumpData,
          results: [],
          foundSelf: false,
          foundCount: 0,
        });
        noResultsCount++;
        continue;
      }

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
      const foundSelf = results.some((r) => r.id === pump.id);

      console.log(
        `${foundSelf ? "✓" : "⚠"}  ${pump.model} (${requiredFlow} m³/h, ${requiredHead} m): ` +
        `找到 ${results.length} 个匹配结果` +
        (foundSelf ? `, 排名 ${results.findIndex((r) => r.id === pump.id) + 1}` : ", 未包含自己")
      );

      // 显示前3个结果
      const topResults = results.slice(0, 3);
      if (topResults.length > 0) {
        for (let i = 0; i < topResults.length; i++) {
          const r = topResults[i];
          const isSelf = r.id === pump.id;
          console.log(`  ${i + 1}. ${isSelf ? "→" : " " } ${r.model}: ` +
            `评分=${r.comprehensiveScore}, ${r.recommendationLevel}, ` +
            `流量余量=${r.flowMargin}%, 扬程余量=${r.headMargin}%`);
        }
      }

      testResults.push({
        pump: pumpData,
        results: topResults,
        foundSelf,
        foundCount: results.length,
      });

      if (foundSelf) {
        successCount++;
      } else {
        failCount++;
      }

      console.log();

    } catch (error) {
      console.error(`✗ ${pump.model}: 测试失败`, error);
      testResults.push({
        pump: pumpData,
        results: [],
        foundSelf: false,
        foundCount: 0,
        error: (error as Error).message,
      });
      failCount++;
    }
  }

  // 生成总结报告
  console.log("=".repeat(80));
  console.log("测试总结");
  console.log("=".repeat(80));
  console.log(`总水泵数: ${allPumps.rows.length}`);
  console.log(`测试成功: ${successCount}`);
  console.log(`测试失败: ${failCount}`);
  console.log(`无匹配结果: ${noResultsCount}`);
  console.log(`成功率: ${((successCount / allPumps.rows.length) * 100).toFixed(2)}%`);
  console.log();

  // 统计推荐等级分布
  const recommendationLevels = new Map<string, number>();
  testResults.forEach((result) => {
    result.results.forEach((r) => {
      const level = r.recommendationLevel;
      recommendationLevels.set(level, (recommendationLevels.get(level) || 0) + 1);
    });
  });

  console.log("推荐等级分布:");
  recommendationLevels.forEach((count, level) => {
    console.log(`  ${level}: ${count} 次`);
  });
  console.log();

  // 列出未包含自己的水泵
  const notFoundSelf = testResults.filter((r) => !r.foundSelf && r.results.length > 0);
  if (notFoundSelf.length > 0) {
    console.log("未包含自己的水泵 (需要检查性能曲线数据):");
    notFoundSelf.forEach((result) => {
      console.log(`  - ${result.pump.model} (${result.pump.flowRate} m³/h, ${result.pump.head} m)`);
    });
    console.log();
  }

  // 列出无匹配结果的水泵
  const noResults = testResults.filter((r) => r.foundCount === 0);
  if (noResults.length > 0) {
    console.log("无匹配结果的水泵:");
    noResults.forEach((result) => {
      console.log(`  - ${result.pump.model} (${result.pump.flowRate} m³/h, ${result.pump.head} m)`);
    });
  }

  console.log();
  console.log("测试完成！");
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
