import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  timestamp,
  integer,
  decimal,
  index,
  jsonb,
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
    pumpType: varchar("pump_type", { length: 100 }), // 泵的类型（离心泵、潜水泵、螺杆泵等）
    material: varchar("material", { length: 100 }), // 材质（铸铁、不锈钢、塑料等）
    installationType: varchar("installation_type", { length: 100 }), // 安装方式
    motorType: varchar("motor_type", { length: 100 }), // 电机类型
    flowRate: decimal("flow_rate", { precision: 10, scale: 2 }).notNull(), // 额定流量 (m³/h)
    head: decimal("head", { precision: 10, scale: 2 }).notNull(), // 额定扬程 (m)
    maxFlow: decimal("max_flow", { precision: 10, scale: 2 }), // 最大流量 (m³/h)
    maxHead: decimal("max_head", { precision: 10, scale: 2 }), // 最大扬程 (m)
    power: decimal("power", { precision: 10, scale: 2 }).notNull(), // 功率 (kW)
    efficiency: decimal("efficiency", { precision: 5, scale: 2 }), // 效率 (%)
    speed: integer("speed"), // 转速 (rpm)
    inletDiameter: integer("inlet_diameter"), // 进口直径 (mm)
    outletDiameter: integer("outlet_diameter"), // 出口直径 (mm)
    maxTemperature: decimal("max_temperature", { precision: 5, scale: 2 }), // 最高介质温度 (°C)
    maxPressure: decimal("max_pressure", { precision: 10, scale: 2 }), // 最高压力 (bar)
    maxSolidSize: decimal("max_solid_size", { precision: 5, scale: 2 }), // 最大固体颗粒尺寸 (mm)
    applicationType: varchar("application_type", { length: 100 }), // 应用类型
    description: text("description"), // 描述
    features: jsonb("features"), // 特性（JSON格式）
    price: decimal("price", { precision: 12, scale: 2 }), // 价格
    weight: decimal("weight", { precision: 8, scale: 2 }), // 重量 (kg)
    imageUrl: text("image_url"), // 产品图片URL
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    brandIdx: index("pumps_brand_idx").on(table.brand),
    modelIdx: index("pumps_model_idx").on(table.model),
    pumpTypeIdx: index("pumps_type_idx").on(table.pumpType),
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
    pumpType: true,
    material: true,
    installationType: true,
    motorType: true,
    speed: true,
    inletDiameter: true,
    outletDiameter: true,
    applicationType: true,
    description: true,
    features: true,
    imageUrl: true,
  })
  .extend({
    flowRate: z.coerce.number().positive(),
    head: z.coerce.number().positive(),
    maxFlow: z.coerce.number().positive().optional().nullable(),
    maxHead: z.coerce.number().positive().optional().nullable(),
    power: z.coerce.number().positive(),
    efficiency: z.coerce.number().min(0).max(100).optional().nullable(),
    maxTemperature: z.coerce.number().optional().nullable(),
    maxPressure: z.coerce.number().optional().nullable(),
    maxSolidSize: z.coerce.number().optional().nullable(),
    price: z.coerce.number().min(0).optional().nullable(),
    weight: z.coerce.number().optional().nullable(),
  });

export const updatePumpSchema = createCoercedInsertSchema(pumps)
  .pick({
    name: true,
    model: true,
    brand: true,
    pumpType: true,
    material: true,
    installationType: true,
    motorType: true,
    speed: true,
    inletDiameter: true,
    outletDiameter: true,
    applicationType: true,
    description: true,
    features: true,
    imageUrl: true,
  })
  .extend({
    flowRate: z.coerce.number().positive().optional(),
    head: z.coerce.number().positive().optional(),
    maxFlow: z.coerce.number().positive().optional().nullable(),
    maxHead: z.coerce.number().positive().optional().nullable(),
    power: z.coerce.number().positive().optional(),
    efficiency: z.coerce.number().min(0).max(100).optional().nullable(),
    maxTemperature: z.coerce.number().optional().nullable(),
    maxPressure: z.coerce.number().optional().nullable(),
    maxSolidSize: z.coerce.number().optional().nullable(),
    price: z.coerce.number().min(0).optional().nullable(),
    weight: z.coerce.number().optional().nullable(),
  })
  .partial();

// TypeScript types
export type Pump = typeof pumps.$inferSelect;
export type InsertPump = z.infer<typeof insertPumpSchema>;
export type UpdatePump = z.infer<typeof updatePumpSchema>;
