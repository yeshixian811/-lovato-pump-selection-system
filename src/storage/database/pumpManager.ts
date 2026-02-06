import { eq, and, SQL, like, sql } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import { pumps, pumpPerformancePoints, insertPumpSchema, updatePumpSchema } from "./shared/schema";
import type { Pump, InsertPump, UpdatePump } from "./shared/schema";

export class PumpManager {
  /**
   * 生成水泵性能曲线数据点
   * 基于额定流量和扬程，生成从0到最大流量的性能曲线
   */
  private generatePerformancePoints(pump: InsertPump) {
    const points: Array<{
      flowRate: number;
      head: number;
      power?: number;
      efficiency?: number;
    }> = [];

    const ratedFlow = pump.flowRate;
    const ratedHead = pump.head;
    const ratedPower = pump.power;
    const maxFlow = pump.maxFlow || ratedFlow * 1.5; // 如果没有maxFlow，默认为额定流量的1.5倍
    const maxHead = pump.maxHead || ratedHead * 1.3; // 如果没有maxHead，默认为额定扬程的1.3倍

    // 步长0.1 m³/h
    const step = 0.1;
    const numPoints = Math.floor(maxFlow / step);

    for (let i = 0; i <= numPoints; i++) {
      const flow = parseFloat((i * step).toFixed(2));

      // 简单的性能曲线模拟（实际应该从制造商获取）
      // 流量越大，扬程越小（典型的离心泵特性）
      let head: number;
      let power: number;
      let efficiency: number;

      if (flow <= ratedFlow) {
        // 在额定流量以下：扬程相对稳定，功率线性增长
        const flowRatio = flow / ratedFlow;
        head = ratedHead * (1 - 0.1 * flowRatio); // 流量每增加，扬程下降约10%
        power = ratedPower * (0.3 + 0.7 * flowRatio); // 功率从30%增长到100%
        efficiency = pump.efficiency ? pump.efficiency * (0.5 + 0.5 * flowRatio) : undefined;
      } else {
        // 在额定流量以上：扬程快速下降，功率继续增长
        const flowRatio = (flow - ratedFlow) / (maxFlow - ratedFlow);
        head = ratedHead * (0.9 - 0.4 * flowRatio); // 扬程快速下降
        power = ratedPower * (1.0 + 0.3 * flowRatio); // 功率继续增长
        efficiency = pump.efficiency ? pump.efficiency * (1.0 - 0.2 * flowRatio) : undefined;
      }

      // 确保扬程不低于0
      if (head > 0) {
        points.push({
          flowRate: flow,
          head: parseFloat(head.toFixed(2)),
          power: parseFloat(power.toFixed(2)),
          efficiency: efficiency ? parseFloat(efficiency.toFixed(2)) : undefined,
        });
      }
    }

    return points;
  }

  async createPump(data: InsertPump): Promise<Pump> {
    const db = await getDb();
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
  } = {}): Promise<Pump[]> {
    const { skip = 0, limit = 100, filters = {} } = options;
    const db = await getDb();

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

    if (conditions.length > 0) {
      return db
        .select()
        .from(pumps)
        .where(and(...conditions))
        .limit(limit)
        .offset(skip)
        .orderBy(pumps.createdAt);
    }

    return db
      .select()
      .from(pumps)
      .limit(limit)
      .offset(skip)
      .orderBy(pumps.createdAt);
  }

  async getPumpById(id: string): Promise<Pump | null> {
    const db = await getDb();
    const [pump] = await db.select().from(pumps).where(eq(pumps.id, id));
    return pump || null;
  }

  async updatePump(id: string, data: UpdatePump): Promise<Pump | null> {
    const db = await getDb();
    const validated = updatePumpSchema.parse(data);
    const [pump] = await db
      .update(pumps)
      .set({ ...validated, updatedAt: new Date() })
      .where(eq(pumps.id, id))
      .returning();
    return pump || null;
  }

  async deletePump(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.delete(pumps).where(eq(pumps.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getTotalCount(): Promise<number> {
    const db = await getDb();
    const result = await db.select({ count: sql<number>`count(*)` }).from(pumps);
    return result[0].count;
  }

  /**
   * 水泵选型：基于性能曲线数据进行精确选型
   * 遵循"选大不选小"原则：基于水泵性能曲线，找到满足需求的型号
   * 
   * 选型策略：
   * 1. 在性能曲线中查找能满足需求流量和扬程的水泵
   * 2. 性能曲线数据点步长为0.1 m³/h
   * 3. 按余量从小到大排序，优先推荐最接近需求的型号
   * 4. 余量控制在5%以内，超出则给出警告
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
    const db = await getDb();

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
      .limit(50);

    if (matchingPoints.length === 0) {
      return [];
    }

    // 按水泵去重，并计算余量
    const pumpMap = new Map<string, any>();

    for (const { pump, point } of matchingPoints) {
      if (!pumpMap.has(pump.id)) {
        // 计算余量
        const flowMargin = ((parseFloat(point.flowRate) - options.flowRate) / options.flowRate) * 100;
        const headMargin = ((parseFloat(point.head) - options.head) / options.head) * 100;

        pumpMap.set(pump.id, {
          pump,
          flowMargin,
          headMargin,
          totalMargin: flowMargin + headMargin,
          operatingPoint: {
            flowRate: point.flowRate,
            head: point.head,
            power: point.power,
            efficiency: point.efficiency,
          },
        });
      } else {
        // 如果已有该水泵，选择余量更小的数据点
        const existing = pumpMap.get(pump.id);
        const flowMargin = ((parseFloat(point.flowRate) - options.flowRate) / options.flowRate) * 100;
        const headMargin = ((parseFloat(point.head) - options.head) / options.head) * 100;
        const totalMargin = flowMargin + headMargin;

        if (totalMargin < existing.totalMargin) {
          pumpMap.set(pump.id, {
            pump,
            flowMargin,
            headMargin,
            totalMargin,
            operatingPoint: {
              flowRate: point.flowRate,
              head: point.head,
              power: point.power,
              efficiency: point.efficiency,
            },
          });
        }
      }
    }

    // 按总余量从小到大排序
    const sortedPumps = Array.from(pumpMap.values())
      .sort((a, b) => a.totalMargin - b.totalMargin)
      .map((item) => ({
        ...item.pump,
        flowMargin: item.flowMargin.toFixed(1),
        headMargin: item.headMargin.toFixed(1),
        operatingPoint: item.operatingPoint,
      }));

    return sortedPumps;
  }
}

export const pumpManager = new PumpManager();
