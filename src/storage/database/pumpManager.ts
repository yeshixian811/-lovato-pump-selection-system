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
      minFlowRate?: number;
      maxFlowRate?: number;
      minHead?: number;
      maxHead?: number;
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
   */
  async selectPumps(flowRate: number, head: number): Promise<Pump[]> {
    return this.getPumps({
      limit: 50,
      filters: {
        minFlowRate: flowRate * 0.8, // 允许 20% 的偏差
        maxFlowRate: flowRate * 1.2,
        minHead: head * 0.8,
        maxHead: head * 1.2,
      },
    });
  }
}

export const pumpManager = new PumpManager();
