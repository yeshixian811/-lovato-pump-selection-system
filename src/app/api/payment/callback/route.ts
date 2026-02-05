import { NextRequest, NextResponse } from 'next/server';
import { upgradeSubscription } from '@/lib/subscription';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, userId, plan, billingCycle, paymentMethod, transactionId } = body;

    // 验证必填字段
    if (!orderId || !userId || !plan || !billingCycle) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 根据计费周期确定计划ID
    const planId = billingCycle === 'yearly' ? `${plan}_yearly` : plan;

    // 升级订阅
    const result = await upgradeSubscription(
      userId,
      planId,
      paymentMethod,
      transactionId
    );

    return NextResponse.json({
      success: true,
      message: '订阅升级成功',
      plan: result.plan,
      endDate: result.endDate,
    });
  } catch (error) {
    console.error('支付回调错误:', error);
    return NextResponse.json(
      { error: '处理支付回调失败' },
      { status: 500 }
    );
  }
}
