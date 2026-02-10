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
  boolean,
  uuid,
} from "drizzle-orm/pg-core";
import { createSchemaFactory, createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// 水泵表
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
    flowRate: decimal("flow_rate", { precision: 10, scale: 2 }).notNull(), // 最大流量 (m³/h)
    head: decimal("head", { precision: 10, scale: 2 }).notNull(), // 最大扬程 (m)
    maxFlow: decimal("max_flow", { precision: 10, scale: 2 }), // 备用字段：最大流量 (m³/h) - 已废弃
    maxHead: decimal("max_head", { precision: 10, scale: 2 }), // 备用字段：最大扬程 (m) - 已废弃
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

// 水泵性能曲线数据点表
export const pumpPerformancePoints = pgTable(
  "pump_performance_points",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    pumpId: varchar("pump_id", { length: 36 })
      .notNull()
      .references(() => pumps.id, { onDelete: "cascade" }),
    flowRate: decimal("flow_rate", { precision: 10, scale: 2 }).notNull(), // 流量点 (m³/h)
    head: decimal("head", { precision: 10, scale: 2 }).notNull(), // 该流量下的扬程 (m)
    power: decimal("power", { precision: 10, scale: 2 }), // 该流量下的功率 (kW)
    efficiency: decimal("efficiency", { precision: 5, scale: 2 }), // 该流量下的效率 (%)
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    pumpIdIdx: index("pump_performance_points_pump_id_idx").on(table.pumpId),
    flowRateIdx: index("pump_performance_points_flow_rate_idx").on(table.flowRate),
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

// 水泵类型（带性能曲线）
export interface PumpWithCurve extends Pump {
  performance_curve?: Array<{
    flowRate: number;
    head: number;
    power?: number;
    efficiency?: number;
  }>;
}

// ========== 版本管理系统 ==========

// 版本表
export const versions = pgTable(
  "versions",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    versionNumber: integer("version_number").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    createdBy: varchar("created_by", { length: 255 }),
    status: varchar("status", { length: 50 }).notNull().default('active'), // active, archived
    isCurrent: boolean("is_current").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    versionNumIdx: index("versions_version_number_idx").on(table.versionNumber),
    isCurrentIdx: index("versions_is_current_idx").on(table.isCurrent),
  })
);

// 版本文件表（存储每个版本的文件快照）
export const versionFiles = pgTable(
  "version_files",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    versionId: uuid("version_id")
      .notNull()
      .references(() => versions.id, { onDelete: "cascade" }),
    filePath: varchar("file_path", { length: 500 }).notNull(),
    fileContent: text("file_content").notNull(),
    fileType: varchar("file_type", { length: 50 }).notNull(), // ts, tsx, json, etc.
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    versionIdIdx: index("version_files_version_id_idx").on(table.versionId),
    filePathIdx: index("version_files_file_path_idx").on(table.filePath),
    uniqueVersionFile: index("version_files_unique_idx").on(table.versionId, table.filePath),
  })
);

// 版本修改记录表
export const versionChanges = pgTable(
  "version_changes",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    versionId: uuid("version_id")
      .notNull()
      .references(() => versions.id, { onDelete: "cascade" }),
    action: varchar("action", { length: 50 }).notNull(), // create, update, delete
    targetPath: varchar("target_path", { length: 500 }).notNull(),
    changeDescription: text("change_description"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    versionIdIdx: index("version_changes_version_id_idx").on(table.versionId),
  })
);

// Zod schemas
export const insertVersionSchema = createInsertSchema(versions).pick({
  name: true,
  description: true,
  createdBy: true,
  status: true,
  isCurrent: true,
});

export const insertVersionFileSchema = createInsertSchema(versionFiles).pick({
  versionId: true,
  filePath: true,
  fileContent: true,
  fileType: true,
});

export const insertVersionChangeSchema = createInsertSchema(versionChanges).pick({
  versionId: true,
  action: true,
  targetPath: true,
  changeDescription: true,
});

// TypeScript types
export type Version = typeof versions.$inferSelect;
export type InsertVersion = z.infer<typeof insertVersionSchema>;
export type VersionFile = typeof versionFiles.$inferSelect;
export type InsertVersionFile = z.infer<typeof insertVersionFileSchema>;
export type VersionChange = typeof versionChanges.$inferSelect;
export type InsertVersionChange = z.infer<typeof insertVersionChangeSchema>;

// ========== 官网内容管理 ==========

// 官网内容表
export const websiteContent = pgTable(
  "website_content",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    key: varchar("key", { length: 100 }).notNull().unique(),
    type: varchar("type", { length: 50 }).notNull(), // 'hero', 'stats', 'features', 'news', 'cta', etc.
    title: varchar("title", { length: 255 }).notNull(),
    content: text("content").notNull(),
    image_url: text("image_url"),
    link_url: text("link_url"),
    display_order: integer("display_order").notNull().default(0),
    is_active: boolean("is_active").notNull().default(true),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    keyIdx: index("website_content_key_idx").on(table.key),
    typeIdx: index("website_content_type_idx").on(table.type),
  })
);

// 新闻表
export const news = pgTable(
  "news",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    title: varchar("title", { length: 255 }).notNull(),
    category: varchar("category", { length: 50 }).notNull(),
    summary: text("summary").notNull(),
    content: text("content").notNull(),
    image_url: text("image_url"),
    publish_date: timestamp("publish_date", { withTimezone: true }).notNull().defaultNow(),
    is_published: boolean("is_published").notNull().default(false),
    display_order: integer("display_order").notNull().default(0),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    categoryIdx: index("news_category_idx").on(table.category),
    publishDateIdx: index("news_publish_date_idx").on(table.publish_date),
    isPublishedIdx: index("news_is_published_idx").on(table.is_published),
  })
);

// 产品展示表
export const productShowcase = pgTable(
  "product_showcase",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    name: varchar("name", { length: 255 }).notNull(),
    category: varchar("category", { length: 100 }).notNull(),
    description: text("description").notNull(),
    specifications: text("specifications").notNull(),
    image_url: text("image_url"),
    featured: boolean("featured").notNull().default(false),
    display_order: integer("display_order").notNull().default(0),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    categoryIdx: index("product_showcase_category_idx").on(table.category),
    featuredIdx: index("product_showcase_featured_idx").on(table.featured),
  })
);

// 使用 createSchemaFactory 配置 date coercion（处理前端 string → Date 转换）
const { createInsertSchema: createCoercedInsertSchemaWithDate } = createSchemaFactory({
  coerce: { date: true },
});

// Zod schemas for validation
export const insertWebsiteContentSchema = createCoercedInsertSchemaWithDate(websiteContent)
  .pick({
    key: true,
    type: true,
    title: true,
    content: true,
    image_url: true,
    link_url: true,
    display_order: true,
    is_active: true,
  })
  .partial();

export const updateWebsiteContentSchema = insertWebsiteContentSchema.partial();

export const insertNewsSchema = createCoercedInsertSchemaWithDate(news)
  .pick({
    title: true,
    category: true,
    summary: true,
    content: true,
    image_url: true,
    is_published: true,
    display_order: true,
  });

export const updateNewsSchema = insertNewsSchema.partial();

export const insertProductShowcaseSchema = createCoercedInsertSchemaWithDate(productShowcase)
  .pick({
    name: true,
    category: true,
    description: true,
    specifications: true,
    image_url: true,
    featured: true,
    display_order: true,
  });

export const updateProductShowcaseSchema = insertProductShowcaseSchema.partial();

// TypeScript types
export type WebsiteContent = typeof websiteContent.$inferSelect;
export type InsertWebsiteContent = z.infer<typeof insertWebsiteContentSchema>;
export type UpdateWebsiteContent = z.infer<typeof updateWebsiteContentSchema>;

export type News = typeof news.$inferSelect;
export type InsertNews = z.infer<typeof insertNewsSchema>;
export type UpdateNews = z.infer<typeof updateNewsSchema>;

export type ProductShowcase = typeof productShowcase.$inferSelect;
export type InsertProductShowcase = z.infer<typeof insertProductShowcaseSchema>;
export type UpdateProductShowcase = z.infer<typeof updateProductShowcaseSchema>;
