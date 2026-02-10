import { NextResponse } from 'next/server'
import { getDb } from 'coze-coding-dev-sdk'
import { productShowcase } from '@/storage/database/shared/schema'
import * as schema from '@/storage/database/shared/schema'
import { desc } from 'drizzle-orm'

// 获取所有产品
export async function GET() {
  try {
    const db = await getDb(schema)
    const productList = await db.query.productShowcase.findMany({
      orderBy: [desc(productShowcase.display_order)]
    })
    return NextResponse.json({ products: productList })
  } catch (error) {
    console.error('获取产品失败:', error)
    return NextResponse.json({ error: '获取产品失败' }, { status: 500 })
  }
}

// 删除所有产品
export async function DELETE() {
  try {
    const db = await getDb(schema)
    await db.delete(productShowcase)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('删除产品失败:', error)
    return NextResponse.json({ error: '删除产品失败' }, { status: 500 })
  }
}

// 创建产品（支持单个或批量）
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const db = await getDb(schema)

    // 支持批量导入
    if (Array.isArray(body.products)) {
      for (const product of body.products) {
        await db.insert(productShowcase).values({
          name: product.name,
          category: product.category,
          description: product.description,
          specifications: product.specifications,
          image_url: product.image_url,
          featured: product.featured,
          display_order: 0,
        })
      }
      return NextResponse.json({ success: true, count: body.products.length })
    }

    // 单个产品
    await db.insert(productShowcase).values({
      name: body.name,
      category: body.category,
      description: body.description,
      specifications: body.specifications,
      image_url: body.image_url,
      featured: body.featured,
      display_order: 0,
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('创建产品失败:', error)
    return NextResponse.json({ error: '创建产品失败' }, { status: 500 })
  }
}
