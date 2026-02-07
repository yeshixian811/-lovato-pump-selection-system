import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// 获取采购订单列表
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    
    let query = `
      SELECT po.*, s.name as supplier_name
      FROM purchase_orders po
      LEFT JOIN suppliers s ON po.supplier_id = s.id
    `
    const params: any[] = []
    
    if (status) {
      query += ' WHERE po.status = $1'
      params.push(status)
    }
    
    query += ' ORDER BY po.created_at DESC'
    
    const result = await db.query(query, params)
    
    return NextResponse.json({
      success: true,
      data: result.rows
    })
  } catch (error) {
    console.error('获取采购订单列表失败:', error)
    return NextResponse.json({
      success: false,
      message: '获取采购订单列表失败'
    }, { status: 500 })
  }
}

// 创建采购订单
export async function POST(request: Request) {
  const client = await db.getClient()
  
  try {
    await client.query('BEGIN')
    
    const body = await request.json()
    const { supplier_id, items, remark } = body
    
    // 生成订单号
    const orderNo = `PO${Date.now()}`
    
    // 计算总金额
    const totalAmount = items.reduce((sum: number, item: any) => 
      sum + item.quantity * item.unit_price, 0
    )
    
    // 创建采购订单
    const orderQuery = `
      INSERT INTO purchase_orders (order_no, supplier_id, total_amount, remark)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `
    const orderResult = await client.query(orderQuery, [
      orderNo,
      supplier_id,
      totalAmount,
      remark || null
    ])
    
    const order = orderResult.rows[0]
    
    // 创建订单明细
    for (const item of items) {
      const itemQuery = `
        INSERT INTO purchase_order_items (order_id, product_id, product_code, product_name, quantity, unit_price, total_price)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `
      await client.query(itemQuery, [
        order.id,
        item.product_id || null,
        item.product_code,
        item.product_name,
        item.quantity,
        item.unit_price,
        item.quantity * item.unit_price
      ])
    }
    
    await client.query('COMMIT')
    
    // 获取完整的订单信息
    const fullOrderQuery = `
      SELECT po.*, s.name as supplier_name
      FROM purchase_orders po
      LEFT JOIN suppliers s ON po.supplier_id = s.id
      WHERE po.id = $1
    `
    const fullOrderResult = await client.query(fullOrderQuery, [order.id])
    
    return NextResponse.json({
      success: true,
      data: fullOrderResult.rows[0]
    })
  } catch (error: any) {
    await client.query('ROLLBACK')
    console.error('创建采购订单失败:', error)
    return NextResponse.json({
      success: false,
      message: error.message || '创建采购订单失败'
    }, { status: 500 })
  } finally {
    client.release()
  }
}
