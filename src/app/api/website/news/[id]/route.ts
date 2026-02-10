import { NextResponse } from 'next/server'
import { getDb } from 'coze-coding-dev-sdk'
import { news } from '@/storage/database/shared/schema'
import { eq } from 'drizzle-orm'
import * as schema from '@/storage/database/shared/schema'

// 获取单条新闻
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const db = await getDb(schema)
    const article = await db.query.news.findFirst({
      where: eq(news.id, parseInt(id))
    })
    if (!article) {
      return NextResponse.json({ error: '新闻不存在' }, { status: 404 })
    }
    return NextResponse.json({ article })
  } catch (error) {
    console.error('获取新闻失败:', error)
    return NextResponse.json({ error: '获取新闻失败' }, { status: 500 })
  }
}

// 更新新闻
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const db = await getDb(schema)
    await db
      .update(news)
      .set({
        title: body.title,
        category: body.category,
        summary: body.summary,
        content: body.content,
        image_url: body.image_url,
        is_published: body.is_published,
        updated_at: new Date(),
      })
      .where(eq(news.id, parseInt(id)))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('更新新闻失败:', error)
    return NextResponse.json({ error: '更新新闻失败' }, { status: 500 })
  }
}

// 删除新闻
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const db = await getDb(schema)
    await db.delete(news).where(eq(news.id, parseInt(id)))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('删除新闻失败:', error)
    return NextResponse.json({ error: '删除新闻失败' }, { status: 500 })
  }
}
