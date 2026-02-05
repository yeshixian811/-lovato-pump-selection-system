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
  pgEnum,
} from "drizzle-orm/pg-core";
import { createSchemaFactory } from "drizzle-zod";
import { z } from "zod";

// 用户角色枚举
export const userRoleEnum = pgEnum('user_role', ['user', 'admin']);

// 订阅状态枚举
export const subscriptionStatusEnum = pgEnum('subscription_status', ['active', 'canceled', 'expired', 'past_due', 'trialing']);

// 用户表
export const users = pgTable(
  "users",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    name: varchar("name", { length: 255 }),
    role: userRoleEnum("role").notNull().default('user'),
    subscriptionTier: varchar("subscription_tier", { length: 50 }).notNull().default('free'),
    subscriptionStatus: subscriptionStatusEnum("subscription_status").notNull().default('active'),
    subscriptionStartDate: timestamp("subscription_start_date", { withTimezone: true }),
    subscriptionEndDate: timestamp("subscription_end_date", { withTimezone: true }),
    emailVerified: boolean("email_verified").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    emailIdx: index("users_email_idx").on(table.email),
  })
);

// 邮箱验证表
export const emailVerifications = pgTable(
  "email_verifications",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: varchar("token", { length: 255 }).notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    tokenIdx: index("email_verifications_token_idx").on(table.token),
    userIdIdx: index("email_verifications_user_id_idx").on(table.userId),
    expiresAtIdx: index("email_verifications_expires_at_idx").on(table.expiresAt),
  })
);

// 密码重置表
export const passwordResets = pgTable(
  "password_resets",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: varchar("token", { length: 255 }).notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    tokenIdx: index("password_resets_token_idx").on(table.token),
    userIdIdx: index("password_resets_user_id_idx").on(table.userId),
    expiresAtIdx: index("password_resets_expires_at_idx").on(table.expiresAt),
  })
);

// 订阅计划表
export const subscriptionPlans = pgTable(
  "subscription_plans",
  {
    id: varchar("id", { length: 50 }).primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    description: text("description"),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    billingCycle: varchar("billing_cycle", { length: 20 }).notNull(), // monthly, yearly
    features: jsonb("features").notNull().$type<{
      maxSelections?: number;
      historyRetention?: number; // days
      exportFormats?: string[];
      supportPriority?: string;
      apiAccess?: boolean;
      maxUsers?: number;
    }>(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  }
);

// 订阅表
export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    planId: varchar("plan_id", { length: 50 })
      .notNull()
      .references(() => subscriptionPlans.id),
    status: subscriptionStatusEnum("status").notNull(),
    startDate: timestamp("start_date", { withTimezone: true }).notNull(),
    endDate: timestamp("end_date", { withTimezone: true }),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
    stripeSubscriptionId: varchar("stripe_subscription_id"), // 如果使用Stripe
    wechatTransactionId: varchar("wechat_transaction_id"), // 如果使用微信支付
    alipayTransactionId: varchar("alipay_transaction_id"), // 如果使用支付宝
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("subscriptions_user_id_idx").on(table.userId),
    planIdIdx: index("subscriptions_plan_id_idx").on(table.planId),
    statusIdx: index("subscriptions_status_idx").on(table.status),
  })
);

// 选型历史表
export const selectionHistory = pgTable(
  "selection_history",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    flowRate: decimal("flow_rate", { precision: 10, scale: 2 }),
    head: decimal("head", { precision: 10, scale: 2 }),
    selectedPumpId: varchar("selected_pump_id"),
    pumpData: jsonb("pump_data"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("selection_history_user_id_idx").on(table.userId),
    createdAtIdx: index("selection_history_created_at_idx").on(table.createdAt),
  })
);

// 使用统计表
export const usageStats = pgTable(
  "usage_stats",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" })
      .unique(),
    selectionCount: integer("selection_count").notNull().default(0),
    lastResetDate: timestamp("last_reset_date", { withTimezone: true })
      .defaultNow()
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("usage_stats_user_id_idx").on(table.userId),
  })
);

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
