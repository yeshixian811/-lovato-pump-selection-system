import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// 获取库存列表
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    
    let query = 'SELECT * FROM inventory'
    const params: any[] = []
    
    if (search) {
      query += ' WHERE product_name LIKE $1 OR product_code LIKE $1'
      params.push(`%${search}%`)
    }
    
    query += ' ORDER BY created_at DESC'
    
    const result = await db.query(query, params)
    
    return NextResponse.json({
      success: true,
      data: result.rows
    })
  } catch (error) {
    console.error('获取库存列表失败:', error)
    return NextResponse.json({
      success: false,
      message: '获取库存列表失败'
    }, { status: 500 })
  }
}

// 更新库存
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, quantity, unit, warehouse, min_stock, max_stock } = body
    
    const query = `
      UPDATE inventory
      SET quantity = $1, unit = $2, warehouse = $3, min_stock = $4, max_stock = $5, updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `
    
    const result = await db.query(query, [
      quantity,
      unit || null,
      warehouse || null,
      min_stock || 0,
      max_stock || null,
      id
    ])
    
    if (result.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: '库存记录不存在'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      data: result.rows[0]
    })
  } catch (error: any) {
    console.error('更新库存失败:', error)
    return NextResponse.json({
      success: false,
      message: error.message || '更新库存失败'
    }, { status: 500 })
  }
}
