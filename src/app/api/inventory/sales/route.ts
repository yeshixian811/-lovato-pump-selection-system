import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// 获取销售订单列表
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    
    let query = `
      SELECT so.*, c.name as customer_name
      FROM sales_orders so
      LEFT JOIN customers c ON so.customer_id = c.id
    `
    const params: any[] = []
    
    if (status) {
      query += ' WHERE so.status = $1'
      params.push(status)
    }
    
    query += ' ORDER BY so.created_at DESC'
    
    const result = await db.query(query, params)
    
    return NextResponse.json({
      success: true,
      data: result.rows
    })
  } catch (error) {
    console.error('获取销售订单列表失败:', error)
    return NextResponse.json({
      success: false,
      message: '获取销售订单列表失败'
    }, { status: 500 })
  }
}

// 创建销售订单
export async function POST(request: Request) {
  const client = await db.getClient()
  
  try {
    await client.query('BEGIN')
    
    const body = await request.json()
    const { customer_id, items, remark } = body
    
    // 生成订单号
    const orderNo = `SO${Date.now()}`
    
    // 计算总金额
    const totalAmount = items.reduce((sum: number, item: any) => 
      sum + item.quantity * item.unit_price, 0
    )
    
    // 创建销售订单
    const orderQuery = `
      INSERT INTO sales_orders (order_no, customer_id, total_amount, remark)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `
    const orderResult = await client.query(orderQuery, [
      orderNo,
      customer_id,
      totalAmount,
      remark || null
    ])
    
    const order = orderResult.rows[0]
    
    // 创建订单明细
    for (const item of items) {
      const itemQuery = `
        INSERT INTO sales_order_items (order_id, product_id, product_code, product_name, quantity, unit_price, total_price)
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
      
      // 减少库存
      const stockQuery = `
        UPDATE inventory
        SET quantity = quantity - $1, updated_at = CURRENT_TIMESTAMP
        WHERE product_id = $2
      `
      await client.query(stockQuery, [item.quantity, item.product_id])
    }
    
    await client.query('COMMIT')
    
    // 获取完整的订单信息
    const fullOrderQuery = `
      SELECT so.*, c.name as customer_name
      FROM sales_orders so
      LEFT JOIN customers c ON so.customer_id = c.id
      WHERE so.id = $1
    `
    const fullOrderResult = await client.query(fullOrderQuery, [order.id])
    
    return NextResponse.json({
      success: true,
      data: fullOrderResult.rows[0]
    })
  } catch (error: any) {
    await client.query('ROLLBACK')
    console.error('创建销售订单失败:', error)
    return NextResponse.json({
      success: false,
      message: error.message || '创建销售订单失败'
    }, { status: 500 })
  } finally {
    client.release()
  }
}
