import { NextResponse } from 'next/server'
import { getDb } from 'coze-coding-dev-sdk'
import { websiteContent } from '@/storage/database/shared/schema'
import { eq, asc } from 'drizzle-orm'
import * as schema from '@/storage/database/shared/schema'

// 获取所有内容
export async function GET() {
  try {
    const db = await getDb(schema)
    const contents = await db.query.websiteContent.findMany({
      orderBy: [asc(websiteContent.display_order)]
    })
    return NextResponse.json({ contents })
  } catch (error) {
    console.error('获取内容失败:', error)
    return NextResponse.json({ error: '获取内容失败' }, { status: 500 })
  }
}

// 保存内容
export async function POST(request: Request) {
  try {
    const { contents } = await request.json()
    const db = await getDb(schema)

    // 更新或插入所有内容
    for (const content of contents) {
      if (content.id) {
        // 更新现有内容
        await db
          .update(websiteContent)
          .set({
            title: content.title,
            content: content.content,
            image_url: content.image_url,
            link_url: content.link_url,
            display_order: content.display_order,
            is_active: content.is_active,
            updated_at: new Date(),
          })
          .where(eq(websiteContent.id, content.id))
      } else {
        // 插入新内容
        await db.insert(websiteContent).values({
          key: content.key,
          type: content.type,
          title: content.title,
          content: content.content,
          image_url: content.image_url,
          link_url: content.link_url,
          display_order: content.display_order,
          is_active: content.is_active,
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('保存内容失败:', error)
    return NextResponse.json({ error: '保存内容失败' }, { status: 500 })
  }
}
