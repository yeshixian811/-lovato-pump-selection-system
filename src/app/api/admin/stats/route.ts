import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth';
import { getDb } from "coze-coding-dev-sdk";
import { users, subscriptions } from '@/storage/database/shared/schema';
import { eq, count, sql } from 'drizzle-orm';

// 获取统计数据（仅管理员）
export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    const authResult = await verifyAdminAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const db = await getDb();

    // 总用户数
    const totalUsersResult = await db.select({ count: count() }).from(users);
    const totalUsers = totalUsersResult[0].count;

    // 活跃订阅数
    const activeSubscriptionsResult = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.subscriptionStatus, 'active'));
    const activeSubscriptions = activeSubscriptionsResult[0].count;

    // 计算月收入
    const monthlyRevenue = 29 * 0 + 99 * 0; // TODO: 实际应该从订单表计算

    // 会员等级分布
    const tierDistribution = {
      free: 0,
      basic: 0,
      pro: 0,
      enterprise: 0,
    };

    const freeCount = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.subscriptionTier, 'free'));
    tierDistribution.free = freeCount[0].count;

    const basicCount = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.subscriptionTier, 'basic'));
    tierDistribution.basic = basicCount[0].count;

    const proCount = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.subscriptionTier, 'pro'));
    tierDistribution.pro = proCount[0].count;

    const enterpriseCount = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.subscriptionTier, 'enterprise'));
    tierDistribution.enterprise = enterpriseCount[0].count;

    const stats = {
      totalUsers,
      activeSubscriptions,
      monthlyRevenue,
      tierDistribution,
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('获取统计数据失败:', error);
    return NextResponse.json({ error: '获取统计数据失败' }, { status: 500 });
  }
}
