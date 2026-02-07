import { eq, and, SQL, like, sql } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import { pumps, pumpPerformancePoints, insertPumpSchema, updatePumpSchema } from "./shared/schema";
import type { Pump, InsertPump, UpdatePump } from "./shared/schema";
import * as schema from "./shared/schema";

export class PumpManager {
  /**
   * 生成水泵性能曲线数据点
   * 基于最大流量和扬程，生成从0到最大流量的性能曲线
   */
  private generatePerformancePoints(pump: InsertPump) {
    const points: Array<{
      flowRate: number;
      head: number;
      power?: number;
      efficiency?: number;
    }> = [];

    const maxFlow = typeof pump.flowRate === 'number' ? pump.flowRate : parseFloat(pump.flowRate || '0'); // 实际最大流量
    const maxHead = typeof pump.head === 'number' ? pump.head : parseFloat(pump.head || '0'); // 实际最大扬程
    const ratedPower = typeof pump.power === 'number' ? pump.power : parseFloat(pump.power || '0');

    // 关断点扬程（流量为0时的扬程）= 实际最大扬程
    const shutOffHead = maxHead;

    // 步长0.1 m³/h
    const step = 0.1;
    const numPoints = Math.floor(maxFlow / step);

    for (let i = 0; i <= numPoints; i++) {
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

      if (adjustedHead > 0) {
        points.push({
          flowRate: flow,
          head: parseFloat(adjustedHead.toFixed(2)),
          power: parseFloat(power.toFixed(2)),
          efficiency: efficiency ? parseFloat(efficiency.toFixed(2)) : undefined,
        });
      }
    }

    return points;
  }

  async createPump(data: InsertPump): Promise<Pump> {
    const db = await getDb(schema);
    const validated = insertPumpSchema.parse(data);
    const [pump] = await db.insert(pumps).values(validated).returning();

    // 生成并插入性能曲线数据点
    const performancePoints = this.generatePerformancePoints(data);
    for (const point of performancePoints) {
      await db.insert(pumpPerformancePoints).values({
        pumpId: pump.id,
        ...point,
      });
    }

    return pump;
  }

  /**
   * 获取水泵列表（支持分页和条件查询）
   */
  async getPumps(options: {
    skip?: number;
    limit?: number;
    filters?: {
      brand?: string;
      model?: string;
      applicationType?: string;
      pumpType?: string;
      material?: string;
      minFlowRate?: number;
      maxFlowRate?: number;
      minHead?: number;
      maxHead?: number;
      minPower?: number;
      maxPower?: number;
    };
  } = {}): Promise<(Pump & { performance_curve?: Array<{ flowRate: number; head: number }> })[]> {
    const { skip = 0, limit = 100, filters = {} } = options;
    const db = await getDb(schema);

    const conditions: SQL[] = [];

    if (filters.brand) {
      conditions.push(like(pumps.brand, `%${filters.brand}%`));
    }
    if (filters.model) {
      conditions.push(like(pumps.model, `%${filters.model}%`));
    }
    if (filters.applicationType) {
      conditions.push(eq(pumps.applicationType, filters.applicationType));
    }
    if (filters.pumpType) {
      conditions.push(eq(pumps.pumpType, filters.pumpType));
    }
    if (filters.material) {
      conditions.push(eq(pumps.material, filters.material));
    }
    if (filters.minFlowRate !== undefined) {
      conditions.push(sql`${pumps.flowRate} >= ${filters.minFlowRate}`);
    }
    if (filters.maxFlowRate !== undefined) {
      conditions.push(sql`${pumps.flowRate} <= ${filters.maxFlowRate}`);
    }
    if (filters.minHead !== undefined) {
      conditions.push(sql`${pumps.head} >= ${filters.minHead}`);
    }
    if (filters.maxHead !== undefined) {
      conditions.push(sql`${pumps.head} <= ${filters.maxHead}`);
    }
    if (filters.minPower !== undefined) {
      conditions.push(sql`${pumps.power} >= ${filters.minPower}`);
    }
    if (filters.maxPower !== undefined) {
      conditions.push(sql`${pumps.power} <= ${filters.maxPower}`);
    }

    let pumpList: Pump[];
    if (conditions.length > 0) {
      pumpList = await db
        .select()
        .from(pumps)
        .where(and(...conditions))
        .limit(limit)
        .offset(skip)
        .orderBy(pumps.createdAt);
    } else {
      pumpList = await db
        .select()
        .from(pumps)
        .limit(limit)
        .offset(skip)
        .orderBy(pumps.createdAt);
    }

    // 为每个水泵获取性能曲线数据
    const pumpsWithCurve = await Promise.all(
      pumpList.map(async (pump) => {
        const curveData = await db
          .select()
          .from(pumpPerformancePoints)
          .where(eq(pumpPerformancePoints.pumpId, pump.id))
          .orderBy(pumpPerformancePoints.flowRate);

        return {
          ...pump,
          performance_curve: curveData.map((point) => ({
            flowRate: parseFloat(point.flowRate),
            head: parseFloat(point.head),
          })),
        };
      })
    );

    return pumpsWithCurve;
  }

  async getPumpById(id: string): Promise<Pump | null> {
    const db = await getDb(schema);
    const [pump] = await db.select().from(pumps).where(eq(pumps.id, id));
    return pump || null;
  }

  async updatePump(id: string, data: UpdatePump): Promise<Pump | null> {
    const db = await getDb(schema);
    const validated = updatePumpSchema.parse(data);
    const [pump] = await db
      .update(pumps)
      .set({ ...validated, updatedAt: new Date() })
      .where(eq(pumps.id, id))
      .returning();

    if (pump) {
      // 如果更新了最大流量、最大扬程或功率，重新生成性能曲线数据
      const shouldRegenerate = 
        data.flowRate !== undefined ||
        data.head !== undefined ||
        data.maxFlow !== undefined ||
        data.maxHead !== undefined ||
        data.power !== undefined ||
        data.efficiency !== undefined;

      if (shouldRegenerate) {
        // 删除旧的性能曲线数据
        await db.delete(pumpPerformancePoints).where(eq(pumpPerformancePoints.pumpId, id));

        // 获取更新后的水泵完整数据
        const updatedPump = await this.getPumpById(id);
        if (updatedPump) {
          // 生成新的性能曲线数据
          const performancePoints = this.generatePerformancePoints({
            flowRate: updatedPump.flowRate,
            head: updatedPump.head,
            maxFlow: updatedPump.maxFlow,
            maxHead: updatedPump.maxHead,
            power: updatedPump.power,
            efficiency: updatedPump.efficiency,
          } as InsertPump);

          // 插入新的性能曲线数据
          for (const point of performancePoints) {
            await db.insert(pumpPerformancePoints).values({
              pumpId: id,
              ...point,
            });
          }
        }
      }
    }

    return pump || null;
  }

  async deletePump(id: string): Promise<boolean> {
    const db = await getDb(schema);
    const result = await db.delete(pumps).where(eq(pumps.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * 获取水泵的性能曲线数据
   */
  async getPumpPerformancePoints(pumpId: string): Promise<Array<{
    flowRate: number;
    head: number;
    power?: number;
    efficiency?: number;
  }>> {
    const db = await getDb(schema);
    const points = await db
      .select()
      .from(pumpPerformancePoints)
      .where(eq(pumpPerformancePoints.pumpId, pumpId))
      .orderBy(pumpPerformancePoints.flowRate);
    
    return points.map(point => ({
      flowRate: parseFloat(point.flowRate),
      head: parseFloat(point.head),
      power: point.power ? parseFloat(point.power) : undefined,
      efficiency: point.efficiency ? parseFloat(point.efficiency) : undefined,
    }));
  }

  async getTotalCount(): Promise<number> {
    const db = await getDb(schema);
    const result = await db.select({ count: sql<number>`count(*)` }).from(pumps);
    return result[0].count;
  }

  /**
   * 水泵选型：基于性能曲线数据进行精确选型（参考格兰富选型算法）
   * 
   * 格兰富选型算法特点：
   * 1. BEP（最佳效率点）匹配：优先推荐在BEP附近运行的水泵
   * 2. 效率优先：效率高的水泵评分更高
   * 3. 合理余量：流量和扬程余量控制在5%-20%之间
   * 4. 功率余量：功率余量控制在10%-30%之间
   * 5. 综合评分：多维度评分系统（流量余量、扬程余量、效率、BEP匹配、功率余量）
   * 6. 推荐等级：最佳选择、推荐选择、备选方案、警告
   * 
   * 选型策略：
   * 1. 在性能曲线中查找能满足需求流量和扬程的水泵
   * 2. 计算每个水泵的综合评分
   * 3. 按评分从高到低排序
   * 4. 给出推荐等级和推荐理由
   */
  async selectPumps(options: {
    flowRate: number;
    head: number;
    pumpType?: string;
    material?: string;
    applicationType?: string;
    maxTemperature?: number;
    maxPressure?: number;
  }): Promise<Pump[]> {
    const db = await getDb(schema);

    // 查找性能曲线中能满足需求的水泵
    // 需要满足：流量 >= 需求流量，且在该流量点的扬程 >= 需求扬程
    const matchingPoints = await db
      .select({
        pump: pumps,
        point: pumpPerformancePoints,
      })
      .from(pumpPerformancePoints)
      .innerJoin(pumps, eq(pumps.id, pumpPerformancePoints.pumpId))
      .where(
        and(
          sql`${pumpPerformancePoints.flowRate} >= ${options.flowRate}`,
          sql`${pumpPerformancePoints.head} >= ${options.head}`,
          options.pumpType ? eq(pumps.pumpType, options.pumpType) : undefined,
          options.material ? eq(pumps.material, options.material) : undefined,
          options.applicationType ? eq(pumps.applicationType, options.applicationType) : undefined,
          options.maxTemperature ? sql`${pumps.maxTemperature} >= ${options.maxTemperature}` : undefined,
          options.maxPressure ? sql`${pumps.maxPressure} >= ${options.maxPressure}` : undefined,
        )
      )
      .limit(100);

    if (matchingPoints.length === 0) {
      return [];
    }

    // 按水泵去重，并计算余量和综合评分
    const pumpMap = new Map<string, any>();

    for (const { pump, point } of matchingPoints) {
      if (!pumpMap.has(pump.id)) {
        const pumpData = this.calculatePumpScore(pump, point, options);
        pumpMap.set(pump.id, pumpData);
      } else {
        // 如果已有该水泵，选择综合评分更高的数据点
        const existing = pumpMap.get(pump.id);
        const pumpData = this.calculatePumpScore(pump, point, options);

        if (pumpData.comprehensiveScore > existing.comprehensiveScore) {
          pumpMap.set(pump.id, pumpData);
        }
      }
    }

    // 按综合评分从高到低排序
    const sortedPumps = Array.from(pumpMap.values())
      .sort((a, b) => b.comprehensiveScore - a.comprehensiveScore)
      .map((item) => ({
        ...item.pump,
        flowMargin: item.flowMargin.toFixed(1),
        headMargin: item.headMargin.toFixed(1),
        powerMargin: item.powerMargin?.toFixed(1) || null,
        bepMatchScore: item.bepMatchScore.toFixed(1),
        efficiencyScore: item.efficiencyScore.toFixed(1),
        comprehensiveScore: item.comprehensiveScore.toFixed(1),
        recommendationLevel: item.recommendationLevel,
        recommendationReason: item.recommendationReason,
        operatingPoint: item.operatingPoint,
        annualOperatingCost: item.annualOperatingCost,
      }));

    return sortedPumps;
  }

  /**
   * 计算水泵的综合评分（参考格兰富评分算法）
   */
  private calculatePumpScore(
    pump: Pump,
    point: any,
    options: { flowRate: number; head: number }
  ) {
    const requiredFlow = options.flowRate;
    const requiredHead = options.head;
    const maxFlow = parseFloat(pump.flowRate); // 实际最大流量
    const maxHead = parseFloat(pump.head); // 实际最大扬程
    const ratedPower = parseFloat(pump.power);

    // 1. 计算余量
    const operatingFlow = parseFloat(point.flowRate);
    const operatingHead = parseFloat(point.head);
    const operatingPower = parseFloat(point.power);
    const operatingEfficiency = point.efficiency ? parseFloat(point.efficiency) : null;

    const flowMargin = ((operatingFlow - requiredFlow) / requiredFlow) * 100;
    const headMargin = ((operatingHead - requiredHead) / requiredHead) * 100;
    const powerMargin = operatingPower ? ((operatingPower - ratedPower) / ratedPower) * 100 : null;

    // 2. 流量余量评分（权重：20%）
    // 最佳余量范围：5%-20%
    let flowMarginScore: number;
    if (flowMargin < 5) {
      flowMarginScore = 60 + (flowMargin / 5) * 20; // 60-80分
    } else if (flowMargin <= 20) {
      flowMarginScore = 80 + ((20 - flowMargin) / 15) * 15; // 65-80分
    } else if (flowMargin <= 50) {
      flowMarginScore = 65 - ((flowMargin - 20) / 30) * 35; // 30-65分
    } else if (flowMargin <= 100) {
      flowMarginScore = 30 - ((flowMargin - 50) / 50) * 20; // 10-30分
    } else {
      flowMarginScore = 5; // 超大余量，最低分
    }

    // 3. 扬程余量评分（权重：20%）
    // 最佳余量范围：5%-15%
    let headMarginScore: number;
    if (headMargin < 5) {
      headMarginScore = 60 + (headMargin / 5) * 20; // 60-80分
    } else if (headMargin <= 15) {
      headMarginScore = 80 + ((15 - headMargin) / 10) * 15; // 65-80分
    } else if (headMargin <= 40) {
      headMarginScore = 65 - ((headMargin - 15) / 25) * 35; // 30-65分
    } else if (headMargin <= 100) {
      headMarginScore = 30 - ((headMargin - 40) / 60) * 20; // 10-30分
    } else {
      headMarginScore = 5; // 超大余量，最低分
    }

    // 4. 效率评分（权重：30%）
    // 最佳效率：>75%，良好：60-75%，一般：<60%
    let efficiencyScore: number;
    if (operatingEfficiency) {
      if (operatingEfficiency >= 75) {
        efficiencyScore = Math.min(100, 95 + ((operatingEfficiency - 75) / 25) * 5); // 95-100分
      } else if (operatingEfficiency >= 60) {
        efficiencyScore = 75 + ((operatingEfficiency - 60) / 15) * 20; // 75-95分
      } else {
        efficiencyScore = 50 + ((operatingEfficiency - 30) / 30) * 25; // 50-75分
      }
    } else {
      efficiencyScore = 50; // 无效率数据，默认50分
    }

    // 5. BEP（最佳效率点）匹配度评分（权重：20%）
    // BEP通常在最大流量附近，最佳匹配范围：80%-120%最大流量
    const flowRatio = operatingFlow / maxFlow;
    let bepMatchScore: number;
    if (flowRatio >= 0.8 && flowRatio <= 1.2) {
      // 最佳匹配：90-100分，flowRatio越接近1，评分越高
      const distanceFromOptimal = Math.abs(flowRatio - 1);
      bepMatchScore = 90 + (1 - distanceFromOptimal / 0.2) * 10;
    } else if (flowRatio >= 0.6 && flowRatio <= 1.4) {
      // 良好匹配：70-90分
      const distanceFromOptimal = Math.abs(flowRatio - 1);
      bepMatchScore = 70 + (1 - (distanceFromOptimal - 0.2) / 0.2) * 20;
    } else if (flowRatio >= 0.3 && flowRatio <= 1.7) {
      // 一般匹配：40-70分
      const distanceFromOptimal = Math.abs(flowRatio - 1);
      bepMatchScore = 40 + (1 - (distanceFromOptimal - 0.4) / 0.3) * 30;
    } else {
      // 远离BEP：20-40分
      const distanceFromOptimal = Math.abs(flowRatio - 1);
      bepMatchScore = 20 + (1 - Math.min((distanceFromOptimal - 0.7) / 0.3, 1)) * 20;
    }

    // 6. 功率余量评分（权重：10%）
    // 最佳余量范围：10%-30%
    let powerMarginScore: number;
    if (powerMargin !== null) {
      if (powerMargin < 10) {
        powerMarginScore = 60 + (powerMargin / 10) * 20; // 60-80分
      } else if (powerMargin <= 30) {
        powerMarginScore = 80 + ((30 - powerMargin) / 20) * 15; // 80-95分
      } else if (powerMargin <= 60) {
        powerMarginScore = 95 - ((powerMargin - 30) / 30) * 35; // 60-95分
      } else {
        powerMarginScore = Math.max(0, 60 - (powerMargin - 60) / 10); // <60分
      }
    } else {
      powerMarginScore = 50; // 无功率数据，默认50分
    }

    // 7. 综合评分（加权平均）
    const comprehensiveScore = 
      flowMarginScore * 0.2 +
      headMarginScore * 0.2 +
      efficiencyScore * 0.3 +
      bepMatchScore * 0.2 +
      powerMarginScore * 0.1;

    // 8. 推荐等级
    let recommendationLevel: string;
    let recommendationReason: string;

    if (comprehensiveScore >= 90) {
      recommendationLevel = "最佳选择";
      recommendationReason = "余量合理、效率高、BEP匹配度优秀，是最佳选择";
    } else if (comprehensiveScore >= 80) {
      recommendationLevel = "推荐选择";
      recommendationReason = "性能匹配良好，性价比高，值得推荐";
    } else if (comprehensiveScore >= 65) {
      recommendationLevel = "备选方案";
      recommendationReason = "满足基本需求，可作为备选方案";
    } else {
      recommendationLevel = "警告";
      recommendationReason = "余量过大或效率较低，建议谨慎选择";
    }

    // 9. 年运行成本估算（按年运行8000小时计算）
    const annualOperatingHours = 8000;
    const annualOperatingCost = operatingPower * annualOperatingHours * 0.8; // 0.8元/kWh

    return {
      pump,
      flowMargin,
      headMargin,
      powerMargin,
      flowMarginScore,
      headMarginScore,
      efficiencyScore,
      bepMatchScore,
      powerMarginScore,
      comprehensiveScore,
      recommendationLevel,
      recommendationReason,
      operatingPoint: {
        flowRate: point.flowRate,
        head: point.head,
        power: point.power,
        efficiency: point.efficiency,
      },
      annualOperatingCost: annualOperatingCost.toFixed(2),
    };
  }
}

export const pumpManager = new PumpManager();
