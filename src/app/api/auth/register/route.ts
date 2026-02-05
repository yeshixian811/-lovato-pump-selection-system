import { NextRequest, NextResponse } from 'next/server';
import { users, emailVerifications } from '@/db/schema';
import { db } from '@/db';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { createToken } from '@/lib/auth';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // 验证必填字段
    if (!email || !password) {
      return NextResponse.json(
        { error: '邮箱和密码为必填项' },
        { status: 400 }
      );
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '邮箱格式不正确' },
        { status: 400 }
      );
    }

    // 验证密码强度（至少6位）
    if (password.length < 6) {
      return NextResponse.json(
        { error: '密码至少需要6位' },
        { status: 400 }
      );
    }

    // 检查邮箱是否已存在
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: '该邮箱已被注册' },
        { status: 409 }
      );
    }

    // 加密密码
    const passwordHash = await bcrypt.hash(password, 10);

    // 创建用户
    const [newUser] = await db
      .insert(users)
      .values({
        email: email.toLowerCase(),
        passwordHash,
        name: name || email.split('@')[0],
        role: 'user',
        subscriptionTier: 'free',
        subscriptionStatus: 'active',
      })
      .returning();

    // 创建JWT token
    const token = await createToken({
      userId: newUser.id,
      email: newUser.email,
      subscriptionTier: newUser.subscriptionTier,
      role: newUser.role,
    });

    // 创建邮箱验证token（可选）
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpiresAt = new Date();
    emailVerificationExpiresAt.setHours(emailVerificationExpiresAt.getHours() + 24); // 24小时后过期

    await db.insert(emailVerifications).values({
      userId: newUser.id,
      token: emailVerificationToken,
      expiresAt: emailVerificationExpiresAt,
    });

    // 返回用户信息（不包含密码）
    const { passwordHash: _, ...userWithoutPassword } = newUser;

    const response = NextResponse.json({
      success: true,
      user: userWithoutPassword,
      message: '注册成功',
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
    console.error('注册错误:', error);
    return NextResponse.json(
      { error: '注册失败，请稍后重试' },
      { status: 500 }
    );
  }
}
