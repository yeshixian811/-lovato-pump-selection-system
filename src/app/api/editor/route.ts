import { NextRequest, NextResponse } from 'next/server';
import { versionManager } from '@/storage/database/versionManager';
import fs from 'fs';
import path from 'path';

/**
 * GET /api/editor?path=xxx - 读取文件内容
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filePath = searchParams.get('path');

    if (!filePath) {
      return NextResponse.json(
        { error: '文件路径不能为空' },
        { status: 400 }
      );
    }

    // 安全检查：只允许读取特定目录的文件
    const allowedPaths = [
      'src/app/',
      'src/components/',
      'src/lib/',
      'src/storage/',
    ];

    const isAllowed = allowedPaths.some(allowedPath =>
      filePath.startsWith(allowedPath)
    );

    if (!isAllowed) {
      return NextResponse.json(
        { error: '不允许访问该路径' },
        { status: 403 }
      );
    }

    // 使用 fs 读取文件
    const fullPath = path.join(process.cwd(), filePath);
    const content = fs.readFileSync(fullPath, 'utf-8');

    return NextResponse.json({
      content,
      path: filePath,
    });
  } catch (error: any) {
    console.error('Read file error:', error);
    return NextResponse.json(
      { error: error.message || '读取文件失败' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/editor - 写入文件内容
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { path: filePath, content, createBackup = true } = body;

    if (!filePath || content === undefined) {
      return NextResponse.json(
        { error: '文件路径和内容不能为空' },
        { status: 400 }
      );
    }

    // 安全检查
    const allowedPaths = [
      'src/app/',
      'src/components/',
      'src/lib/',
      'src/storage/',
    ];

    const isAllowed = allowedPaths.some(allowedPath =>
      filePath.startsWith(allowedPath)
    );

    if (!isAllowed) {
      return NextResponse.json(
        { error: '不允许访问该路径' },
        { status: 403 }
      );
    }

    // 创建备份
    if (createBackup) {
      await versionManager.autoBackup(
        `修改前自动备份: ${filePath}`,
        [filePath]
      );
    }

    // 使用 fs 写入文件
    const fullPath = path.join(process.cwd(), filePath);
    fs.writeFileSync(fullPath, content, 'utf-8');

    return NextResponse.json({
      success: true,
      message: '文件保存成功',
      path: filePath,
    });
  } catch (error: any) {
    console.error('Write file error:', error);
    return NextResponse.json(
      { error: error.message || '写入文件失败' },
      { status: 500 }
    );
  }
}
