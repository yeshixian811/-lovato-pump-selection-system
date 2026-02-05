import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { users, subscriptions } from '@/db/schema'
import { eq } from 'drizzle-orm'

// 获取用户列表
export async function GET(request: NextRequest) {
  try {
    // TODO: 添加管理员权限验证
    
    const userList = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        emailVerified: users.emailVerified,
        createdAt: users.createdAt,
        subscriptionTier: subscriptions.tier,
        subscriptionStatus: subscriptions.status,
        subscriptionStartDate: subscriptions.startDate,
        subscriptionEndDate: subscriptions.endDate,
      })
      .from(users)
      .leftJoin(subscriptions, eq(users.id, subscriptions.userId))
      .orderBy(users.createdAt)

    return NextResponse.json({ users: userList })
  } catch (error) {
    console.error('获取用户列表失败:', error)
    return NextResponse.json({ error: '获取用户列表失败' }, { status: 500 })
  }
}
