import { NextResponse } from 'next/server'
import { getDb } from 'coze-coding-dev-sdk'
import { productShowcase } from '@/storage/database/shared/schema'
import * as schema from '@/storage/database/shared/schema'

// AMT系列产品数据
const AMT_PRODUCTS = [
  {
    name: "AMT 25-125",
    category: "AMT系列",
    description: "高效节能离心泵",
    specifications: { "流量": "6.3", "扬程": "20", "功率": "0.75" },
    featured: true
  },
  {
    name: "AMT 32-125",
    category: "AMT系列",
    description: "高效节能离心泵",
    specifications: { "流量": "12.5", "扬程": "20", "功率": "1.5" },
    featured: true
  },
  {
    name: "AMT 32-160",
    category: "AMT系列",
    description: "高效节能离心泵",
    specifications: { "流量": "12.5", "扬程": "32", "功率": "2.2" },
    featured: true
  },
  {
    name: "AMT 40-125",
    category: "AMT系列",
    description: "高效节能离心泵",
    specifications: { "流量": "25", "扬程": "20", "功率": "3" },
    featured: true
  },
  {
    name: "AMT 40-160",
    category: "AMT系列",
    description: "高效节能离心泵",
    specifications: { "流量": "25", "扬程": "32", "功率": "4" },
    featured: true
  },
  {
    name: "AMT 40-200",
    category: "AMT系列",
    description: "高效节能离心泵",
    specifications: { "流量": "25", "扬程": "50", "功率": "7.5" },
    featured: true
  },
  {
    name: "AMT 50-125",
    category: "AMT系列",
    description: "高效节能离心泵",
    specifications: { "流量": "50", "扬程": "20", "功率": "5.5" },
    featured: true
  },
  {
    name: "AMT 50-160",
    category: "AMT系列",
    description: "高效节能离心泵",
    specifications: { "流量": "50", "扬程": "32", "功率": "7.5" },
    featured: true
  },
  {
    name: "AMT 50-200",
    category: "AMT系列",
    description: "高效节能离心泵",
    specifications: { "流量": "50", "扬程": "50", "功率": "15" },
    featured: true
  },
  {
    name: "AMT 65-125",
    category: "AMT系列",
    description: "高效节能离心泵",
    specifications: { "流量": "100", "扬程": "20", "功率": "11" },
    featured: true
  },
  {
    name: "AMT 65-160",
    category: "AMT系列",
    description: "高效节能离心泵",
    specifications: { "流量": "100", "扬程": "32", "功率": "18.5" },
    featured: true
  },
  {
    name: "AMT 65-200",
    category: "AMT系列",
    description: "高效节能离心泵",
    specifications: { "流量": "100", "扬程": "50", "功率": "30" },
    featured: true
  },
  {
    name: "AMT 80-125",
    category: "AMT系列",
    description: "高效节能离心泵",
    specifications: { "流量": "160", "扬程": "20", "功率": "18.5" },
    featured: true
  },
  {
    name: "AMT 80-160",
    category: "AMT系列",
    description: "高效节能离心泵",
    specifications: { "流量": "160", "扬程": "32", "功率": "30" },
    featured: true
  },
  {
    name: "AMT 80-200",
    category: "AMT系列",
    description: "高效节能离心泵",
    specifications: { "流量": "160", "扬程": "50", "功率": "45" },
    featured: true
  },
  {
    name: "AMT 100-125",
    category: "AMT系列",
    description: "高效节能离心泵",
    specifications: { "流量": "250", "扬程": "20", "功率": "30" },
    featured: true
  },
  {
    name: "AMT 100-160",
    category: "AMT系列",
    description: "高效节能离心泵",
    specifications: { "流量": "250", "扬程": "32", "功率": "45" },
    featured: true
  },
  {
    name: "AMT 100-200",
    category: "AMT系列",
    description: "高效节能离心泵",
    specifications: { "流量": "250", "扬程": "50", "功率": "75" },
    featured: true
  },
  {
    name: "AMT 125-125",
    category: "AMT系列",
    description: "高效节能离心泵",
    specifications: { "流量": "400", "扬程": "20", "功率": "45" },
    featured: true
  },
  {
    name: "AMT 125-160",
    category: "AMT系列",
    description: "高效节能离心泵",
    specifications: { "流量": "400", "扬程": "32", "功率": "75" },
    featured: true
  }
];

export async function POST() {
  try {
    const db = await getDb(schema)

    // 1. 删除所有现有产品
    await db.delete(productShowcase)

    // 2. 插入AMT系列产品
    for (const product of AMT_PRODUCTS) {
      await db.insert(productShowcase).values({
        name: product.name,
        category: product.category,
        description: product.description,
        specifications: JSON.stringify(product.specifications),
        image_url: "",
        featured: product.featured,
        display_order: 0,
      })
    }

    return NextResponse.json({
      success: true,
      message: `已删除所有测试产品，成功恢复 ${AMT_PRODUCTS.length} 个AMT系列产品`,
      count: AMT_PRODUCTS.length
    })
  } catch (error) {
    console.error('恢复AMT产品失败:', error)
    return NextResponse.json({ error: '恢复AMT产品失败' }, { status: 500 })
  }
}
