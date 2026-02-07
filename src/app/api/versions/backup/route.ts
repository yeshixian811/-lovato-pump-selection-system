import { NextRequest, NextResponse } from 'next/server';
import { versionManager } from '@/storage/database/versionManager';

/**
 * POST /api/versions/backup - 创建自动备份
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { description, files } = body;

    const version = await versionManager.autoBackup(
      description || '自动备份',
      files || []
    );

    return NextResponse.json({
      success: true,
      version,
    });
  } catch (error: any) {
    console.error('Auto backup error:', error);
    return NextResponse.json(
      { error: error.message || '自动备份失败' },
      { status: 500 }
    );
  }
}
