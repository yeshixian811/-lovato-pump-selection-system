import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { canExport } from '@/lib/subscription';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format');

    if (!format) {
      return NextResponse.json(
        { error: '缺少导出格式参数' },
        { status: 400 }
      );
    }

    const canExportData = await canExport(user.id, format);

    return NextResponse.json({
      success: true,
      canExport: canExportData,
      format,
    });
  } catch (error) {
    console.error('检查导出权限错误:', error);
    return NextResponse.json(
      { error: '检查导出权限失败' },
      { status: 500 }
    );
  }
}
