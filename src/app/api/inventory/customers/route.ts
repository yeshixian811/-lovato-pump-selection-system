import { NextResponse, NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { verifyManagerAuth } from '@/lib/admin-auth'

// 获取客户列表（需要管理员或经理权限）
export async function GET(request: NextRequest) {
  // 验证权限
  const authResult = await verifyManagerAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    
    let query = 'SELECT * FROM customers'
    const params: any[] = []
    
    if (status) {
      query += ' WHERE status = $1'
      params.push(status)
    }
    
    query += ' ORDER BY created_at DESC'
    
    const result = await db.query(query, params)
    
    return NextResponse.json({
      success: true,
      data: result.rows
    })
  } catch (error) {
    console.error('获取客户列表失败:', error)
    return NextResponse.json({
      success: false,
      message: '获取客户列表失败'
    }, { status: 500 })
  }
}

// 创建客户（需要管理员或经理权限）
export async function POST(request: NextRequest) {
  // 验证权限
  const authResult = await verifyManagerAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  
  try {
    const body = await request.json()
    const { code, name, contact_person, phone, email, address, status } = body
    
    // 生成客户编码
    const customerCode = code || `CUS${Date.now()}`
    
    const query = `
      INSERT INTO customers (code, name, contact_person, phone, email, address, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `
    
    const result = await db.query(query, [
      customerCode,
      name,
      contact_person || null,
      phone || null,
      email || null,
      address || null,
      status || 'active'
    ])
    
    return NextResponse.json({
      success: true,
      data: result.rows[0]
    })
  } catch (error: any) {
    console.error('创建客户失败:', error)
    return NextResponse.json({
      success: false,
      message: error.message || '创建客户失败'
    }, { status: 500 })
  }
}
