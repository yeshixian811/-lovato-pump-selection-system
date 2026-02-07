import { NextRequest, NextResponse } from 'next/server';
import { versionManager } from '@/storage/database/versionManager';

/**
 * GET /api/versions - 获取所有版本列表
 */
export async function GET() {
  try {
    const versions = await versionManager.getAllVersions();
    const currentVersion = await versionManager.getCurrentVersion();

    return NextResponse.json({
      versions,
      currentVersion,
      total: versions.length,
    });
  } catch (error: any) {
    console.error('Get versions error:', error);
    return NextResponse.json(
      { error: error.message || '获取版本列表失败' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/versions - 创建新版本
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, files } = body;

    if (!name) {
      return NextResponse.json(
        { error: '版本名称不能为空' },
        { status: 400 }
      );
    }

    const version = await versionManager.createVersion(
      name,
      description || '',
      files || [],
      'user'
    );

    return NextResponse.json({
      success: true,
      version,
    });
  } catch (error: any) {
    console.error('Create version error:', error);
    return NextResponse.json(
      { error: error.message || '创建版本失败' },
      { status: 500 }
    );
  }
}
