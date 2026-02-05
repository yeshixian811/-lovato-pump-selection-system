import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { subscriptionPlans } from '@/db/schema';
import { db } from '@/db';
import { eq } from 'drizzle-orm';

const PLAN_PRICES = {
  basic: { monthly: 29, yearly: 290 },
  pro: { monthly: 99, yearly: 990 },
  enterprise: null,
};

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { plan, billingCycle, paymentMethod } = body;

    // 验证计划
    if (!plan || !['basic', 'pro', 'enterprise'].includes(plan)) {
      return NextResponse.json(
        { error: '无效的订阅计划' },
        { status: 400 }
      );
    }

    // 企业版不支持在线支付
    if (plan === 'enterprise') {
      return NextResponse.json(
        { error: '企业版请联系销售' },
        { status: 400 }
      );
    }

    // 验证计费周期
    if (!billingCycle || !['monthly', 'yearly'].includes(billingCycle)) {
      return NextResponse.json(
        { error: '无效的计费周期' },
        { status: 400 }
      );
    }

    // 验证支付方式
    if (!paymentMethod || !['wechat', 'alipay', 'card'].includes(paymentMethod)) {
      return NextResponse.json(
        { error: '无效的支付方式' },
        { status: 400 }
      );
    }

    // 获取价格
    const priceInfo = PLAN_PRICES[plan as keyof typeof PLAN_PRICES];
    if (!priceInfo || priceInfo[billingCycle as 'monthly' | 'yearly'] === null) {
      return NextResponse.json(
        { error: '无法获取价格信息' },
        { status: 400 }
      );
    }

    const price = priceInfo[billingCycle as 'monthly' | 'yearly'];

    // 查询订阅计划
    const [subscriptionPlan] = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, `${plan}${billingCycle === 'yearly' ? '_yearly' : ''}`))
      .limit(1);

    if (!subscriptionPlan) {
      return NextResponse.json(
        { error: '订阅计划不存在' },
        { status: 404 }
      );
    }

    // 根据支付方式处理
    // 这里是一个简化的实现，实际应该集成真实的支付系统

    if (paymentMethod === 'wechat' || paymentMethod === 'alipay') {
      // 模拟生成支付订单
      const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // 在实际项目中，这里应该调用微信支付或支付宝API
      // 生成支付二维码或跳转URL
      
      return NextResponse.json({
        success: true,
        orderId,
        amount: price,
        plan,
        billingCycle,
        paymentMethod,
        // 实际项目中返回支付二维码或跳转URL
        qrCode: `mock_qr_code_${orderId}`,
        paymentUrl: null,
        message: '订单创建成功',
      });
    }

    if (paymentMethod === 'card') {
      // 银行卡支付，集成Stripe或其他支付网关
      return NextResponse.json({
        success: true,
        message: '银行卡支付功能即将上线',
        // 实际项目中返回Stripe的支付会话ID
      });
    }

    return NextResponse.json(
      { error: '不支持的支付方式' },
      { status: 400 }
    );
  } catch (error) {
    console.error('创建支付订单错误:', error);
    return NextResponse.json(
      { error: '创建支付订单失败' },
      { status: 500 }
    );
  }
}
