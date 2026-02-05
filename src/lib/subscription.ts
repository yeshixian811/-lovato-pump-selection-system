import { users, usageStats, selectionHistory, subscriptions, subscriptionPlans } from '@/db/schema';
import { db } from '@/db';
import { eq, and, gte, lte } from 'drizzle-orm';
import { getCurrentUser } from './auth';

// 订阅计划配置
export const PLAN_FEATURES = {
  free: {
    name: '免费会员',
    maxSelections: 10,
    historyRetention: 0, // 不保存历史
    exportFormats: [],
    supportPriority: 'none',
    apiAccess: false,
    maxUsers: 1,
  },
  basic: {
    name: '基础会员',
    maxSelections: Infinity,
    historyRetention: 30, // 30天
    exportFormats: ['csv'],
    supportPriority: 'standard',
    apiAccess: false,
    maxUsers: 1,
  },
  pro: {
    name: '高级会员',
    maxSelections: Infinity,
    historyRetention: Infinity, // 永久
    exportFormats: ['csv', 'excel'],
    supportPriority: 'priority',
    apiAccess: true,
    maxUsers: 1,
  },
  enterprise: {
    name: '企业会员',
    maxSelections: Infinity,
    historyRetention: Infinity,
    exportFormats: ['csv', 'excel', 'pdf'],
    supportPriority: 'dedicated',
    apiAccess: true,
    maxUsers: Infinity,
  },
};

// 检查用户是否可以执行选型
export async function canPerformSelection(userId: string): Promise<boolean> {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (user.length === 0) {
    return false;
  }

  const currentUser = user[0];

  // 检查订阅是否过期
  if (currentUser.subscriptionEndDate) {
    const now = new Date();
    const endDate = new Date(currentUser.subscriptionEndDate);

    if (now > endDate) {
      return false;
    }
  }

  // 检查是否达到选型次数限制
  if (currentUser.subscriptionTier === 'free') {
    const stats = await db
      .select()
      .from(usageStats)
      .where(eq(usageStats.userId, userId))
      .limit(1);

    if (stats.length > 0) {
      const lastReset = new Date(stats[0].lastResetDate);
      const now = new Date();

      // 重置计数器（每月重置）
      if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
        await db
          .update(usageStats)
          .set({
            selectionCount: 0,
            lastResetDate: now,
            updatedAt: now,
          })
          .where(eq(usageStats.userId, userId));
      } else {
        // 检查是否超过限制
        if (stats[0].selectionCount >= 10) {
          return false;
        }
      }
    }
  }

  return true;
}

// 记录选型使用
export async function recordSelectionUsage(userId: string) {
  // 增加选型计数
  const stats = await db
    .select()
    .from(usageStats)
    .where(eq(usageStats.userId, userId))
    .limit(1);

  const now = new Date();

  if (stats.length === 0) {
    await db.insert(usageStats).values({
      userId,
      selectionCount: 1,
      lastResetDate: now,
    });
  } else {
    const lastReset = new Date(stats[0].lastResetDate);

    // 如果是新月份，重置计数器
    if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
      await db
        .update(usageStats)
        .set({
          selectionCount: 1,
          lastResetDate: now,
          updatedAt: now,
        })
        .where(eq(usageStats.userId, userId));
    } else {
      await db
        .update(usageStats)
        .set({
          selectionCount: stats[0].selectionCount + 1,
          updatedAt: now,
        })
        .where(eq(usageStats.userId, userId));
    }
  }
}

// 获取选型历史
export async function getSelectionHistory(userId: string, limit: number = 50) {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (user.length === 0) {
    return [];
  }

  const currentUser = user[0];
  const tier = currentUser.subscriptionTier as keyof typeof PLAN_FEATURES;
  const retentionDays = PLAN_FEATURES[tier].historyRetention;

  // 计算日期范围
  let whereClause = eq(selectionHistory.userId, userId);

  if (retentionDays && retentionDays !== Infinity) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    whereClause = and(
      eq(selectionHistory.userId, userId),
      gte(selectionHistory.createdAt, cutoffDate)
    ) as any;
  }

  const history = await db
    .select()
    .from(selectionHistory)
    .where(whereClause)
    .orderBy(selectionHistory.createdAt)
    .limit(limit);

  return history;
}

// 检查导出权限
export async function canExport(userId: string, format: string): Promise<boolean> {
  const user = await getCurrentUser();

  if (!user) {
    return false;
  }

  const tier = user.subscriptionTier as keyof typeof PLAN_FEATURES;
  const allowedFormats = PLAN_FEATURES[tier].exportFormats;

  return allowedFormats.includes(format);
}

// 升级订阅
export async function upgradeSubscription(
  userId: string,
  planId: string,
  paymentProvider: 'stripe' | 'wechat' | 'alipay' | 'manual',
  transactionId?: string
) {
  const plan = await db
    .select()
    .from(subscriptionPlans)
    .where(eq(subscriptionPlans.id, planId))
    .limit(1);

  if (plan.length === 0) {
    throw new Error('Plan not found');
  }

  const now = new Date();
  const endDate = new Date();

  // 根据计费周期计算结束日期
  if (plan[0].billingCycle === 'monthly') {
    endDate.setMonth(endDate.getMonth() + 1);
  } else if (plan[0].billingCycle === 'yearly') {
    endDate.setFullYear(endDate.getFullYear() + 1);
  }

  // 创建订阅记录
  await db.insert(subscriptions).values({
    userId,
    planId,
    status: 'active',
    startDate: now,
    endDate,
    ...(paymentProvider === 'stripe' && { stripeSubscriptionId: transactionId }),
    ...(paymentProvider === 'wechat' && { wechatTransactionId: transactionId }),
    ...(paymentProvider === 'alipay' && { alipayTransactionId: transactionId }),
  });

  // 更新用户订阅信息
  await db
    .update(users)
    .set({
      subscriptionTier: planId,
      subscriptionStatus: 'active',
      subscriptionStartDate: now,
      subscriptionEndDate: endDate,
      updatedAt: now,
    })
    .where(eq(users.id, userId));

  return { plan: plan[0], endDate };
}

// 检查订阅状态
export async function checkSubscriptionStatus(userId: string) {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (user.length === 0) {
    return null;
  }

  const currentUser = user[0];
  const now = new Date();

  // 检查是否过期
  if (currentUser.subscriptionEndDate) {
    const endDate = new Date(currentUser.subscriptionEndDate);

    if (now > endDate) {
      // 更新为过期状态
      await db
        .update(users)
        .set({
          subscriptionStatus: 'expired',
          subscriptionTier: 'free',
          updatedAt: now,
        })
        .where(eq(users.id, userId));

      return {
        tier: 'free',
        status: 'expired',
        endDate,
        features: PLAN_FEATURES.free,
      };
    }
  }

  return {
    tier: currentUser.subscriptionTier,
    status: currentUser.subscriptionStatus,
    startDate: currentUser.subscriptionStartDate,
    endDate: currentUser.subscriptionEndDate,
    features: PLAN_FEATURES[currentUser.subscriptionTier as keyof typeof PLAN_FEATURES] || PLAN_FEATURES.free,
  };
}
