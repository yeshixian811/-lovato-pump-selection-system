import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { checkSubscriptionStatus } from '@/lib/subscription';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      );
    }

    const subscription = await checkSubscriptionStatus(user.id);

    return NextResponse.json({
      success: true,
      subscription,
    });
  } catch (error) {
    console.error('获取订阅状态错误:', error);
    return NextResponse.json(
      { error: '获取订阅状态失败' },
      { status: 500 }
    );
  }
}
