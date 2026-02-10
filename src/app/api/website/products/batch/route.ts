import { NextResponse } from 'next/server'
import { getDb } from 'coze-coding-dev-sdk'
import { productShowcase } from '@/storage/database/shared/schema'
import * as schema from '@/storage/database/shared/schema'
import { eq, inArray } from 'drizzle-orm'

export async function DELETE(request: Request) {
  try {
    const body = await request.json()
    const { ids } = body

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: '请提供要删除的产品ID列表' }, { status: 400 })
    }

    const db = await getDb(schema)

    // 批量删除产品
    await db.delete(productShowcase)
      .where(inArray(productShowcase.id, ids))

    return NextResponse.json({ success: true, count: ids.length })
  } catch (error) {
    console.error('批量删除产品失败:', error)
    return NextResponse.json({ error: '批量删除产品失败' }, { status: 500 })
  }
}
