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
   * 遵循"选大不选小"原则：水泵流量和扬程应大于或等于需求
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
    const filters: any = {
      minFlowRate: options.flowRate,  // 流量不能小于需求
      maxFlowRate: options.flowRate * 1.05,  // 最多超出5%
      minHead: options.head,  // 扬程不能小于需求
      maxHead: options.head * 1.05,  // 最多超出5%
    };

    if (options.pumpType) {
      filters.pumpType = options.pumpType;
    }
    if (options.material) {
      filters.material = options.material;
    }
    if (options.applicationType) {
      filters.applicationType = options.applicationType;
    }

    return this.getPumps({ limit: 50, filters });
  }
}

export const pumpManager = new PumpManager();
