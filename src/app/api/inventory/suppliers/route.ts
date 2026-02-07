import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// 获取供应商列表
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    
    let query = 'SELECT * FROM suppliers'
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
    console.error('获取供应商列表失败:', error)
    return NextResponse.json({
      success: false,
      message: '获取供应商列表失败'
    }, { status: 500 })
  }
}

// 创建供应商
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { code, name, contact_person, phone, email, address, status } = body
    
    // 生成供应商编码
    const supplierCode = code || `SUP${Date.now()}`
    
    const query = `
      INSERT INTO suppliers (code, name, contact_person, phone, email, address, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `
    
    const result = await db.query(query, [
      supplierCode,
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
    console.error('创建供应商失败:', error)
    return NextResponse.json({
      success: false,
      message: error.message || '创建供应商失败'
    }, { status: 500 })
  }
}
