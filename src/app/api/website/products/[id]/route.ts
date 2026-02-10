import { NextResponse } from 'next/server'
import { getDb } from 'coze-coding-dev-sdk'
import { productShowcase } from '@/storage/database/shared/schema'
import * as schema from '@/storage/database/shared/schema'
import { eq } from 'drizzle-orm'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)
    const body = await request.json()

    const db = await getDb(schema)

    await db.update(productShowcase)
      .set({
        name: body.name,
        category: body.category,
        description: body.description,
        specifications: body.specifications,
        image_url: body.image_url,
        featured: body.featured,
        updated_at: new Date(),
      })
      .where(eq(productShowcase.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('更新产品失败:', error)
    return NextResponse.json({ error: '更新产品失败' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)

    const db = await getDb(schema)

    await db.delete(productShowcase)
      .where(eq(productShowcase.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('删除产品失败:', error)
    return NextResponse.json({ error: '删除产品失败' }, { status: 500 })
  }
}
