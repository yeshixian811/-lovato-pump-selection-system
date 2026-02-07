import { NextRequest, NextResponse } from 'next/server';
import { versionManager } from '@/storage/database/versionManager';

/**
 * POST /api/versions/[id]/rollback - 回滚到指定版本
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await versionManager.rollbackToVersion(params.id);

    return NextResponse.json({
      success: true,
      message: '已成功回滚到指定版本',
    });
  } catch (error: any) {
    console.error('Rollback version error:', error);
    return NextResponse.json(
      { error: error.message || '回滚版本失败' },
      { status: 500 }
    );
  }
}
