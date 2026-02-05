import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { subscriptions } from '@/db/schema'
import { eq } from 'drizzle-orm'

// 修改用户订阅状态
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: 添加管理员权限验证
    
    const { status } = await request.json()

    if (!status || !['active', 'expired', 'canceled', 'past_due'].includes(status)) {
      return NextResponse.json({ error: '无效的订阅状态' }, { status: 400 })
    }

    // 更新订阅状态
    await db
      .update(subscriptions)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.userId, params.id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('修改用户状态失败:', error)
    return NextResponse.json({ error: '修改用户状态失败' }, { status: 500 })
  }
}
