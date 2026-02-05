import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth';
import { userManager } from '@/storage/database/userManager';

// 升级用户会员等级（仅管理员）
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
    const { tier } = await request.json();

    if (!tier || !['free', 'basic', 'pro', 'enterprise'].includes(tier)) {
      return NextResponse.json({ error: '无效的会员等级' }, { status: 400 });
    }

    // 获取订阅计划配置
    const tierConfig: Record<string, { durationMonths: number }> = {
      free: { durationMonths: 12 },
      basic: { durationMonths: 1 },
      pro: { durationMonths: 1 },
      enterprise: { durationMonths: 12 },
    };

    const config = tierConfig[tier];
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + config.durationMonths);

    // 更新用户订阅信息
    await userManager.updateUser(id, {
      subscriptionTier: tier,
      subscriptionStatus: tier === 'free' ? 'expired' : 'active',
      subscriptionStartDate: startDate,
      subscriptionEndDate: endDate,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('升级用户失败:', error);
    return NextResponse.json({ error: '升级用户失败' }, { status: 500 });
  }
}
