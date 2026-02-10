import { NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: '没有文件' }, { status: 400 })
    }

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: '只支持图片文件' }, { status: 400 })
    }

    // 检查文件大小（5MB）
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: '文件大小不能超过5MB' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // 生成文件名
    const timestamp = Date.now()
    const filename = `${timestamp}-${file.name}`
    const uploadPath = join(process.cwd(), 'public', 'uploads', filename)

    // 确保uploads目录存在
    const fs = await import('fs/promises')
    try {
      await fs.access(join(process.cwd(), 'public', 'uploads'))
    } catch {
      await fs.mkdir(join(process.cwd(), 'public', 'uploads'), { recursive: true })
    }

    // 写入文件
    await writeFile(uploadPath, buffer)

    return NextResponse.json({
      success: true,
      url: `/uploads/${filename}`,
    })
  } catch (error) {
    console.error('上传失败:', error)
    return NextResponse.json({ error: '上传失败' }, { status: 500 })
  }
}
