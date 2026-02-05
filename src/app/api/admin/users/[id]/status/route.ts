import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth';
import { userManager } from '@/storage/database/userManager';

// 修改用户订阅状态（仅管理员）
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 验证管理员权限
    const authResult = await verifyAdminAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { id } = await params;
    const { status } = await request.json();

    if (!status || !['active', 'expired', 'canceled', 'past_due'].includes(status)) {
      return NextResponse.json({ error: '无效的订阅状态' }, { status: 400 });
    }

    // 更新用户订阅状态
    await userManager.updateUser(id, {
      subscriptionStatus: status,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('修改用户状态失败:', error);
    return NextResponse.json({ error: '修改用户状态失败' }, { status: 500 });
  }
}
