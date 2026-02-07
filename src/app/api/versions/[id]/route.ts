import { NextRequest, NextResponse } from 'next/server';
import { versionManager } from '@/storage/database/versionManager';

/**
 * GET /api/versions/[id] - 获取版本详情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const versionData = await versionManager.getVersionWithFiles(params.id);

    if (!versionData) {
      return NextResponse.json(
        { error: '版本不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json(versionData);
  } catch (error: any) {
    console.error('Get version detail error:', error);
    return NextResponse.json(
      { error: error.message || '获取版本详情失败' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/versions/[id] - 删除版本
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await versionManager.deleteVersion(params.id);

    return NextResponse.json({
      success: true,
      message: '版本已删除',
    });
  } catch (error: any) {
    console.error('Delete version error:', error);
    return NextResponse.json(
      { error: error.message || '删除版本失败' },
      { status: 500 }
    );
  }
}
