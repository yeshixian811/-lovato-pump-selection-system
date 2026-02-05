import { pgTable, uuid, varchar, timestamp, decimal, boolean, jsonb, integer, text, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users';

// 订阅状态枚举
export const subscriptionStatusEnum = pgEnum('subscription_status', ['active', 'canceled', 'expired', 'past_due', 'trialing']);

// 订阅计划表
export const subscriptionPlans = pgTable('subscription_plans', {
  id: varchar('id').primaryKey(),
  name: varchar('name').notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  billingCycle: varchar('billing_cycle').notNull(), // monthly, yearly
  features: jsonb('features').notNull().$type<{
    maxSelections?: number;
    historyRetention?: number; // days
    exportFormats?: string[];
    supportPriority?: string;
    apiAccess?: boolean;
    maxUsers?: number;
  }>(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// 订阅表
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  planId: varchar('plan_id').notNull().references(() => subscriptionPlans.id),
  status: subscriptionStatusEnum('status').notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').notNull().default(false),
  stripeSubscriptionId: varchar('stripe_subscription_id'), // 如果使用Stripe
  wechatTransactionId: varchar('wechat_transaction_id'), // 如果使用微信支付
  alipayTransactionId: varchar('alipay_transaction_id'), // 如果使用支付宝
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// 选型历史表
export const selectionHistory = pgTable('selection_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  flowRate: decimal('flow_rate', { precision: 10, scale: 2 }),
  head: decimal('head', { precision: 10, scale: 2 }),
  selectedPumpId: varchar('selected_pump_id'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// 使用统计表
export const usageStats = pgTable('usage_stats', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  selectionCount: integer('selection_count').notNull().default(0),
  lastResetDate: timestamp('last_reset_date').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
