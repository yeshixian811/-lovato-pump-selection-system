import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// 获取单个供应商
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const query = 'SELECT * FROM suppliers WHERE id = $1'
    const result = await db.query(query, [params.id])
    
    if (result.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: '供应商不存在'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      data: result.rows[0]
    })
  } catch (error) {
    console.error('获取供应商详情失败:', error)
    return NextResponse.json({
      success: false,
      message: '获取供应商详情失败'
    }, { status: 500 })
  }
}

// 更新供应商
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, contact_person, phone, email, address, status } = body
    
    const query = `
      UPDATE suppliers
      SET name = $1, contact_person = $2, phone = $3, email = $4, address = $5, status = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `
    
    const result = await db.query(query, [
      name,
      contact_person || null,
      phone || null,
      email || null,
      address || null,
      status || 'active',
      params.id
    ])
    
    if (result.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: '供应商不存在'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      data: result.rows[0]
    })
  } catch (error: any) {
    console.error('更新供应商失败:', error)
    return NextResponse.json({
      success: false,
      message: error.message || '更新供应商失败'
    }, { status: 500 })
  }
}

// 删除供应商
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const query = 'DELETE FROM suppliers WHERE id = $1 RETURNING *'
    const result = await db.query(query, [params.id])
    
    if (result.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: '供应商不存在'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      message: '删除成功'
    })
  } catch (error) {
    console.error('删除供应商失败:', error)
    return NextResponse.json({
      success: false,
      message: '删除供应商失败'
    }, { status: 500 })
  }
}
