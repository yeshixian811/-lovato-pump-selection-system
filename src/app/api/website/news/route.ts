import { NextResponse } from 'next/server'
import { getDb } from 'coze-coding-dev-sdk'
import { news } from '@/storage/database/shared/schema'
import * as schema from '@/storage/database/shared/schema'
import { desc } from 'drizzle-orm'

// 获取所有新闻
export async function GET() {
  try {
    const db = await getDb(schema)
    const articles = await db.query.news.findMany({
      orderBy: [desc(news.display_order), desc(news.publish_date)]
    })
    return NextResponse.json({ articles })
  } catch (error) {
    console.error('获取新闻失败:', error)
    return NextResponse.json({ error: '获取新闻失败' }, { status: 500 })
  }
}

// 创建新闻
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const db = await getDb(schema)
    await db.insert(news).values({
      title: body.title,
      category: body.category,
      summary: body.summary,
      content: body.content,
      image_url: body.image_url,
      is_published: body.is_published,
      publish_date: new Date(),
      display_order: 0,
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('创建新闻失败:', error)
    return NextResponse.json({ error: '创建新闻失败' }, { status: 500 })
  }
}
