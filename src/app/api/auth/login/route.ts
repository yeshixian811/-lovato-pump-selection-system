import { NextRequest, NextResponse } from 'next/server';
import { users } from '@/db/schema';
import { db } from '@/db';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { createToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // 验证必填字段
    if (!email || !password) {
      return NextResponse.json(
        { error: '邮箱和密码为必填项' },
        { status: 400 }
      );
    }

    // 查找用户
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: '邮箱或密码错误' },
        { status: 401 }
      );
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: '邮箱或密码错误' },
        { status: 401 }
      );
    }

    // 检查订阅是否过期
    if (user.subscriptionEndDate) {
      const now = new Date();
      const endDate = new Date(user.subscriptionEndDate);

      if (now > endDate) {
        // 更新为过期状态
        await db
          .update(users)
          .set({
            subscriptionStatus: 'expired',
            subscriptionTier: 'free',
            updatedAt: now,
          })
          .where(eq(users.id, user.id));

        user.subscriptionStatus = 'expired';
        user.subscriptionTier = 'free';
      }
    }

    // 创建JWT token
    const token = await createToken({
      userId: user.id,
      email: user.email,
      subscriptionTier: user.subscriptionTier,
      role: user.role,
    });

    // 返回用户信息（不包含密码）
    const { passwordHash: _, ...userWithoutPassword } = user;

    const response = NextResponse.json({
      success: true,
      user: userWithoutPassword,
      message: '登录成功',
    });

    // 设置cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7天
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('登录错误:', error);
    return NextResponse.json(
      { error: '登录失败，请稍后重试' },
      { status: 500 }
    );
  }
}
