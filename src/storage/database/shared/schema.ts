import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  timestamp,
  integer,
  decimal,
  index,
} from "drizzle-orm/pg-core";
import { createSchemaFactory } from "drizzle-zod";
import { z } from "zod";

export const pumps = pgTable(
  "pumps",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 255 }).notNull(),
    model: varchar("model", { length: 255 }).notNull(),
    brand: varchar("brand", { length: 255 }).notNull(),
    flowRate: decimal("flow_rate", { precision: 10, scale: 2 }).notNull(), // 流量 (m³/h)
    head: decimal("head", { precision: 10, scale: 2 }).notNull(), // 扬程 (m)
    power: decimal("power", { precision: 10, scale: 2 }).notNull(), // 功率 (kW)
    efficiency: decimal("efficiency", { precision: 5, scale: 2 }), // 效率 (%)
    speed: integer("speed"), // 转速 (rpm)
    inletDiameter: integer("inlet_diameter"), // 进口直径 (mm)
    outletDiameter: integer("outlet_diameter"), // 出口直径 (mm)
    applicationType: varchar("application_type", { length: 100 }), // 应用类型
    description: text("description"), // 描述
    price: decimal("price", { precision: 12, scale: 2 }), // 价格
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    brandIdx: index("pumps_brand_idx").on(table.brand),
    modelIdx: index("pumps_model_idx").on(table.model),
  })
);

// 使用 createSchemaFactory 配置 date coercion（处理前端 string → Date 转换）
const { createInsertSchema: createCoercedInsertSchema } = createSchemaFactory({
  coerce: { date: true },
});

// Zod schemas for validation
export const insertPumpSchema = createCoercedInsertSchema(pumps)
  .pick({
    name: true,
    model: true,
    brand: true,
    speed: true,
    inletDiameter: true,
    outletDiameter: true,
    applicationType: true,
    description: true,
  })
  .extend({
    flowRate: z.coerce.number().positive(),
    head: z.coerce.number().positive(),
    power: z.coerce.number().positive(),
    efficiency: z.coerce.number().min(0).max(100).optional().nullable(),
    price: z.coerce.number().min(0).optional().nullable(),
  });

export const updatePumpSchema = createCoercedInsertSchema(pumps)
  .pick({
    name: true,
    model: true,
    brand: true,
    speed: true,
    inletDiameter: true,
    outletDiameter: true,
    applicationType: true,
    description: true,
  })
  .extend({
    flowRate: z.coerce.number().positive().optional(),
    head: z.coerce.number().positive().optional(),
    power: z.coerce.number().positive().optional(),
    efficiency: z.coerce.number().min(0).max(100).optional().nullable(),
    price: z.coerce.number().min(0).optional().nullable(),
  })
  .partial();

// TypeScript types
export type Pump = typeof pumps.$inferSelect;
export type InsertPump = z.infer<typeof insertPumpSchema>;
export type UpdatePump = z.infer<typeof updatePumpSchema>;
