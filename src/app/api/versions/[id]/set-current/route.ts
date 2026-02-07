import { NextRequest, NextResponse } from 'next/server';
import { versionManager } from '@/storage/database/versionManager';

/**
 * POST /api/versions/[id]/set-current - 设置为当前版本
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await versionManager.setCurrentVersion(params.id);

    return NextResponse.json({
      success: true,
      message: '已设置为当前版本',
    });
  } catch (error: any) {
    console.error('Set current version error:', error);
    return NextResponse.json(
      { error: error.message || '设置当前版本失败' },
      { status: 500 }
    );
  }
}
