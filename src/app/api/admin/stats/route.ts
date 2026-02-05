import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { users, subscriptions } from '@/db/schema'
import { eq, and, gte, lte, count, sql } from 'drizzle-orm'

// 获取统计数据
export async function GET(request: NextRequest) {
  try {
    // TODO: 添加管理员权限验证
    
    // 总用户数
    const totalUsersResult = await db.select({ count: count() }).from(users)
    const totalUsers = totalUsersResult[0].count

    // 活跃订阅数
    const activeSubscriptionsResult = await db
      .select({ count: count() })
      .from(subscriptions)
      .where(eq(subscriptions.status, 'active'))
    const activeSubscriptions = activeSubscriptionsResult[0].count

    // 计算月收入
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    
    const monthlyRevenue = 29 * 0 + 99 * 0 // TODO: 实际应该从订单表计算

    // 会员等级分布
    const tierDistribution = {
      free: 0,
      basic: 0,
      pro: 0,
      enterprise: 0,
    }

    const freeCount = await db
      .select({ count: count() })
      .from(users)
      .leftJoin(subscriptions, eq(users.id, subscriptions.userId))
      .where(sql`${subscriptions.tier} = 'free' OR ${subscriptions.tier} IS NULL`)
    tierDistribution.free = freeCount[0].count

    const basicCount = await db
      .select({ count: count() })
      .from(users)
      .leftJoin(subscriptions, eq(users.id, subscriptions.userId))
      .where(eq(subscriptions.tier, 'basic'))
    tierDistribution.basic = basicCount[0].count

    const proCount = await db
      .select({ count: count() })
      .from(users)
      .leftJoin(subscriptions, eq(users.id, subscriptions.userId))
      .where(eq(subscriptions.tier, 'pro'))
    tierDistribution.pro = proCount[0].count

    const enterpriseCount = await db
      .select({ count: count() })
      .from(users)
      .leftJoin(subscriptions, eq(users.id, subscriptions.userId))
      .where(eq(subscriptions.tier, 'enterprise'))
    tierDistribution.enterprise = enterpriseCount[0].count

    const stats = {
      totalUsers,
      activeSubscriptions,
      monthlyRevenue,
      tierDistribution,
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('获取统计数据失败:', error)
    return NextResponse.json({ error: '获取统计数据失败' }, { status: 500 })
  }
}
