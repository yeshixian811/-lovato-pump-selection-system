import { eq, and, SQL, like, sql } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import { pumps, insertPumpSchema, updatePumpSchema } from "./shared/schema";
import type { Pump, InsertPump, UpdatePump } from "./shared/schema";

export class PumpManager {
  async createPump(data: InsertPump): Promise<Pump> {
    const db = await getDb();
    const validated = insertPumpSchema.parse(data);
    const [pump] = await db.insert(pumps).values(validated).returning();
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
   * 水泵选型：根据流量和扬程筛选合适的水泵
   * 遵循"选大不选小"原则：优先选择水泵流量和扬程大于或等于需求的型号
   * 
   * 选型策略：
   * 1. 优先选择余量在5%以内的最优匹配
   * 2. 如果没有结果，逐步扩大范围（10% -> 20% -> 30% -> 50%）
   * 3. 如果仍然没有"选大"的结果，放宽条件，返回最接近需求的可用型号
   *    （此时可能返回参数略小于需求的型号，作为备选方案）
   * 4. 确保始终返回结果，避免空结果
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
    // 定义搜索范围阶梯
    const searchRanges = [
      { maxMargin: 1.05, label: "余量5%以内" },
      { maxMargin: 1.10, label: "余量10%以内" },
      { maxMargin: 1.20, label: "余量20%以内" },
      { maxMargin: 1.30, label: "余量30%以内" },
      { maxMargin: 1.50, label: "余量50%以内" },
    ];

    // 基础过滤条件（类型、材质、应用场景）
    const baseFilters: any = {};
    if (options.pumpType) {
      baseFilters.pumpType = options.pumpType;
    }
    if (options.material) {
      baseFilters.material = options.material;
    }
    if (options.applicationType) {
      baseFilters.applicationType = options.applicationType;
    }

    // 第一步：按照优先级阶梯搜索"选大不选小"的型号
    for (const range of searchRanges) {
      const filters = {
        ...baseFilters,
        minFlowRate: options.flowRate,  // 流量不能小于需求
        maxFlowRate: options.flowRate * range.maxMargin,  // 最大余量
        minHead: options.head,  // 扬程不能小于需求
        maxHead: options.head * range.maxMargin,  // 最大余量
      };

      const pumps = await this.getPumps({ limit: 50, filters });

      if (pumps.length > 0) {
        // 找到结果，按余量从小到大排序（越接近需求越好）
        return pumps.sort((a, b) => {
          const flowMarginA = (parseFloat(a.flowRate) - options.flowRate) / options.flowRate;
          const headMarginA = (parseFloat(a.head) - options.head) / options.head;
          const totalMarginA = flowMarginA + headMarginA;

          const flowMarginB = (parseFloat(b.flowRate) - options.flowRate) / options.flowRate;
          const headMarginB = (parseFloat(b.head) - options.head) / options.head;
          const totalMarginB = flowMarginB + headMarginB;

          return totalMarginA - totalMarginB;
        });
      }
    }

    // 第二步：扩大到不设上限的范围，查找所有"选大"的型号
    const selectLargeFilters = {
      ...baseFilters,
      minFlowRate: options.flowRate,  // 流量不能小于需求
      minHead: options.head,  // 扬程不能小于需求
    };

    const selectLargePumps = await this.getPumps({ limit: 50, filters: selectLargeFilters });

    if (selectLargePumps.length > 0) {
      // 按余量从小到大排序，优先推荐最接近需求的型号
      return selectLargePumps.sort((a, b) => {
        const flowMarginA = (parseFloat(a.flowRate) - options.flowRate) / options.flowRate;
        const headMarginA = (parseFloat(a.head) - options.head) / options.head;
        const totalMarginA = flowMarginA + headMarginA;

        const flowMarginB = (parseFloat(b.flowRate) - options.flowRate) / options.flowRate;
        const headMarginB = (parseFloat(b.head) - options.head) / options.head;
        const totalMarginB = flowMarginB + headMarginB;

        return totalMarginA - totalMarginB;
      });
    }

    // 第三步：如果"选大"的型号都没有，放宽条件，查找最接近的可用型号
    // 计算与需求的距离，返回最接近的型号（即使参数略小于需求）
    const allPumps = await this.getPumps({ limit: 50, filters: baseFilters });

    if (allPumps.length > 0) {
      // 按距离排序（综合考虑流量和扬程的差距）
      return allPumps.sort((a, b) => {
        // 计算综合距离（优先满足扬程，其次满足流量）
        const headDiffA = Math.abs(parseFloat(a.head) - options.head) / options.head;
        const flowDiffA = Math.abs(parseFloat(a.flowRate) - options.flowRate) / options.flowRate;
        const totalDiffA = headDiffA * 2 + flowDiffA;  // 扬程权重更高

        const headDiffB = Math.abs(parseFloat(b.head) - options.head) / options.head;
        const flowDiffB = Math.abs(parseFloat(b.flowRate) - options.flowRate) / options.flowRate;
        const totalDiffB = headDiffB * 2 + flowDiffB;

        return totalDiffA - totalDiffB;
      });
    }

    // 实在没有结果，返回空数组
    return [];
  }
}

export const pumpManager = new PumpManager();
