import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { subscriptions } from '@/db/schema'
import { eq } from 'drizzle-orm'

// 升级用户会员等级
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: 添加管理员权限验证
    
    const { tier } = await request.json()

    if (!tier || !['free', 'basic', 'pro', 'enterprise'].includes(tier)) {
      return NextResponse.json({ error: '无效的会员等级' }, { status: 400 })
    }

    // 获取订阅计划配置
    const tierConfig: Record<string, { price: number; durationMonths: number }> = {
      free: { price: 0, durationMonths: 12 },
      basic: { price: 29, durationMonths: 1 },
      pro: { price: 99, durationMonths: 1 },
      enterprise: { price: 0, durationMonths: 12 },
    }

    const config = tierConfig[tier]
    const startDate = new Date()
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + config.durationMonths)

    // 更新订阅
    await db
      .update(subscriptions)
      .set({
        tier,
        status: tier === 'free' ? 'expired' : 'active',
        startDate,
        endDate,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.userId, params.id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('升级用户失败:', error)
    return NextResponse.json({ error: '升级用户失败' }, { status: 500 })
  }
}
