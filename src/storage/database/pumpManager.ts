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
   * 水泵选型：基于最大流量和最大扬程范围进行选型
   * 遵循"选大不选小"原则：在水泵工作范围内找到满足需求的型号
   *
   * 选型策略：
   * 1. 检查需求流量和扬程是否在水泵的最大工作范围内
   * 2. 在工作范围内，找到能满足需求的水泵
   * 3. 按余量从小到大排序，优先推荐最接近需求的型号
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

    // 构建查询条件
    const conditions: any[] = [];
    
    // 基础过滤条件
    if (options.pumpType) {
      conditions.push(eq(pumps.pumpType, options.pumpType));
    }
    if (options.material) {
      conditions.push(eq(pumps.material, options.material));
    }
    if (options.applicationType) {
      conditions.push(eq(pumps.applicationType, options.applicationType));
    }
    if (options.maxTemperature) {
      conditions.push(sql`${pumps.maxTemperature} >= ${options.maxTemperature}`);
    }
    if (options.maxPressure) {
      conditions.push(sql`${pumps.maxPressure} >= ${options.maxPressure}`);
    }

    // 核心选型条件：需求参数在水泵工作范围内
    // 条件：需求流量 <= 最大流量 AND 需求扬程 <= 最大扬程
    // 如果没有maxFlow/maxHead，则使用额定值的1.5倍和1.3倍作为最大值
    const whereClause = conditions.length > 0 
      ? and(
          sql`(
            (${pumps.maxFlow} IS NOT NULL AND ${pumps.maxFlow} >= ${options.flowRate}) OR
            (${pumps.maxFlow} IS NULL AND ${pumps.flowRate} * 1.5 >= ${options.flowRate})
          ) AND (
            (${pumps.maxHead} IS NOT NULL AND ${pumps.maxHead} >= ${options.head}) OR
            (${pumps.maxHead} IS NULL AND ${pumps.head} * 1.3 >= ${options.head})
          )`,
          ...conditions
        )
      : sql`(
          (${pumps.maxFlow} IS NOT NULL AND ${pumps.maxFlow} >= ${options.flowRate}) OR
          (${pumps.maxFlow} IS NULL AND ${pumps.flowRate} * 1.5 >= ${options.flowRate})
        ) AND (
          (${pumps.maxHead} IS NOT NULL AND ${pumps.maxHead} >= ${options.head}) OR
          (${pumps.maxHead} IS NULL AND ${pumps.head} * 1.3 >= ${options.head})
        )`;

    const matchingPumps = await db
      .select()
      .from(pumps)
      .where(whereClause)
      .limit(50);

    if (matchingPumps.length === 0) {
      return [];
    }

    // 计算每个水泵的余量
    const pumpsWithMargin = matchingPumps.map(pump => {
      const maxFlow = pump.maxFlow ? parseFloat(pump.maxFlow) : parseFloat(pump.flowRate) * 1.5;
      const maxHead = pump.maxHead ? parseFloat(pump.maxHead) : parseFloat(pump.head) * 1.3;
      
      const flowMargin = ((maxFlow - options.flowRate) / options.flowRate) * 100;
      const headMargin = ((maxHead - options.head) / options.head) * 100;
      const totalMargin = flowMargin + headMargin;

      return {
        ...pump,
        flowMargin: flowMargin.toFixed(1),
        headMargin: headMargin.toFixed(1),
      };
    });

    // 按总余量从小到大排序
    return pumpsWithMargin.sort((a: any, b: any) => {
      return (parseFloat(a.flowMargin) + parseFloat(a.headMargin)) - (parseFloat(b.flowMargin) + parseFloat(b.headMargin));
    });
  }
}

export const pumpManager = new PumpManager();
